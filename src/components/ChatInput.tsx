import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Send, Square, Keyboard, X, Image as ImageIcon, Camera, Loader2, Volume2, Waves } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize'; // 需要安装： npm install react-textarea-autosize
import axios from 'axios'; // 引入 axios
import { apiBaseUrl } from '@/config/api'; // 引入 API 基础 URL
import { toast } from '@/components/ui/use-toast'; // 引入 toast
import useAuthStore from '@/stores/authStore'; // 引入 auth store

// --- 新增: 定义发送给后端的数据结构（模拟） 和 发送给父组件的语音消息结构 ---
export interface VoicePayload {
    type: 'voice';
    audioUrl: string; // 新增：语音文件URL
    duration: number; // 单位：秒
}

interface ChatInputProps {
  // --- 修改: onSendMessage 可以接收文本/图片 或 语音信息 ---
  onSendMessage: (message: string | VoicePayload, imageUrl?: string | null) => void;
  isGenerating?: boolean;
  onStopGenerating: () => void;
  assistantName?: string;
  initialImageUrl?: string | null; // 新增：接收外部传入的图片URL
  initialText?: string | null; // 新增：接收外部传入的初始文本
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating = false,
  onStopGenerating,
  assistantName = '健康助手',
  initialImageUrl = null,
  initialText = null,
}) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(initialImageUrl);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(initialImageUrl);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  // --- 新增: 录音状态 ---
  const [isRecording, setIsRecording] = useState(false);
  const recordingStartTimeRef = useRef<number | null>(null);
  // --- 新增: 录音计时器状态 ---
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [remainingTime, setRemainingTime] = useState(60); // 最大录音时长60秒
  const recordingTimerRef = useRef<number | null>(null);
  // --- 新增: 最短录音时长 (毫秒) ---
  const MIN_RECORDING_TIME_MS = 500; // 0.5秒
  const recorderRef = useRef<MediaRecorder | null>(null); // 录音器实例
  const audioChunksRef = useRef<Blob[]>([]); // 录音数据片段
  // --- 新增: 语音按钮的 Ref ---
  const voiceButtonRef = useRef<HTMLButtonElement>(null);

  // 当外部传入initialImageUrl变化时，更新内部状态
  useEffect(() => {
    if (initialImageUrl) {
      console.log('[ChatInput] 接收到外部图片URL:', initialImageUrl);
      setUploadedImageUrl(initialImageUrl);
      setPreviewImageUrl(initialImageUrl);
      setInputMode('text');
    } else {
      setUploadedImageUrl(null);
      setPreviewImageUrl(null);
    }
  }, [initialImageUrl]);

  // 当外部传入initialText变化时，更新内部状态
  useEffect(() => {
    if (initialText) {
      console.log('[ChatInput] 接收到外部初始文本:', initialText);
      setInputText(initialText);
      setInputMode('text');
    }
  }, [initialText]);

  useEffect(() => {
    // --- 修改: 移除全局 mouseup/touchend 监听器 ---
    // 清理预览 URL
    return () => {
      if (previewImageUrl && !initialImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      // 确保组件卸载时停止录音（如果还在录）
      if (isRecording) {
          stopRecording(true); // 卸载时总是取消
      }
    };
  }, [previewImageUrl, initialImageUrl, isRecording]); // 移除 isRecording 依赖相关的全局监听逻辑

  // --- 新增: 更新录音时间的定时器 ---
  useEffect(() => {
    // 清理定时器
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      // --- 新增: 清理可能存在的最大录音时长的 timeout ---
      if ((window as any).maxRecordingTimeoutId) {
        clearTimeout((window as any).maxRecordingTimeoutId);
        (window as any).maxRecordingTimeoutId = null;
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const uploadImage = async (file: File) => {
    console.log('[uploadImage] 开始上传图片:', file.name);
    setIsUploadingImage(true);
    setUploadedImageUrl(null);

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewImageUrl(localPreviewUrl);

    const formData = new FormData();
    formData.append('file', file);

    try {

      console.log('apiBaseUrl:', apiBaseUrl);
      console.log('完整上传URL:', `${apiBaseUrl}/file/upload`);

      const response = await axios.post(`${apiBaseUrl}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });

      if (response.data && response.data.success) {
        const finalUrl = response.data.url;
        console.log('[uploadImage] 图片上传成功, URL:', finalUrl);
        setUploadedImageUrl(finalUrl);
        setInputMode('text');
      } else {
        console.error('[uploadImage] 图片上传失败:', response.data?.error);
        toast({
          title: "错误",
          description: `图片上传失败: ${response.data?.error || '未知错误'}`,
          variant: "destructive",
          duration: 2000,
        });
        if (previewImageUrl && previewImageUrl !== initialImageUrl) {
          URL.revokeObjectURL(previewImageUrl);
        }
        setPreviewImageUrl(null);
      }
    } catch (error: any) {
      console.error('[uploadImage] 图片上传请求出错:', error);
      const errorMsg = error.response?.data?.detail || error.message || '网络错误';
      toast({
        title: "错误",
        description: `图片上传请求出错: ${errorMsg}`,
        variant: "destructive",
        duration: 2000,
      });
      if (previewImageUrl && previewImageUrl !== initialImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(null);
    } finally {
      setIsUploadingImage(false);
      console.log('[uploadImage] 上传流程结束');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     if (event.target.files && event.target.files.length > 0) {
       const selectedFile = event.target.files[0];
       if (selectedFile.type.startsWith('image/')) {
         if (previewImageUrl && previewImageUrl !== initialImageUrl) {
             URL.revokeObjectURL(previewImageUrl);
         }
         setPreviewImageUrl(null);
         setUploadedImageUrl(null);
         setInputMode('text');
         uploadImage(selectedFile);
       } else {
           toast({
               title: "提示",
               description: "请选择图片文件 (jpg, png, gif)",
               variant: "default",
               duration: 2000,
           });
       }
       event.target.value = '';
     }
  };

  const removeImage = () => {
    console.log('[removeImage] 移除图片');
    if (previewImageUrl && previewImageUrl !== initialImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
    setPreviewImageUrl(null);
    setUploadedImageUrl(null);
    setIsUploadingImage(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    // 移除图片后，如果当前是语音模式，切换回文本模式
    if(inputMode === 'voice') {
        setInputMode('text');
    }
  };

  const handleSend = useCallback(() => {
    // 只在文本模式下发送
    if (inputMode === 'voice') {
      console.log('[handleSend] 当前为语音模式，Send按钮无效');
      return;
    }

    const textToSend = inputText.trim();
    const canSend = (textToSend.length > 0 || uploadedImageUrl) && !isGenerating && !isUploadingImage;

    console.log('[handleSend] 尝试发送 (文本模式):', { textToSend: textToSend.substring(0,50)+'...', uploadedImageUrl, canSend });

    if (canSend) {
      // --- 修改: 确保发送的是字符串类型 ---
      onSendMessage(textToSend, uploadedImageUrl);
      setInputText('');
      if (previewImageUrl && previewImageUrl !== initialImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(null);
      setUploadedImageUrl(null);
      setIsUploadingImage(false);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
      console.log('[handleSend] 消息已发送，状态已清理');
    } else {
        if (isUploadingImage) {
            toast({ description: "图片正在上传中，请稍候...", duration: 2000 });
        } else if (!textToSend && !uploadedImageUrl) {
             toast({ description: "请输入消息或上传图片", duration: 2000 });
        }
        console.log('[handleSend] 发送条件不满足');
    }
  }, [inputText, uploadedImageUrl, isGenerating, isUploadingImage, onSendMessage, previewImageUrl, initialImageUrl, inputMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (inputMode === 'text' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const triggerFileInput = () => {
    if (isUploadingImage) {
        toast({ description: "图片正在上传中...", duration: 2000 });
        return;
    }
    if (inputMode === 'voice') {
        toast({ description: "请先切换回文本输入模式", duration: 2000 });
        return;
    }
    if (previewImageUrl || uploadedImageUrl) {
       removeImage();
    }
    fileInputRef.current?.click();
  };

  const handleToggleInputMode = () => {
    if (isUploadingImage || isGenerating) {
        console.log("正在上传或生成中，无法切换模式");
        return;
    }
    setInputMode(prevMode => {
        const newMode = prevMode === 'text' ? 'voice' : 'text';
        console.log(`[handleToggleInputMode] 切换输入模式到: ${newMode}`);
        if (newMode === 'voice') {
            setInputText('');
            removeImage();
        }
        // --- 新增: 如果从语音切回文本时正在录音，则取消录音 ---
        if (newMode === 'text' && isRecording) {
            stopRecording(true); // true 表示取消
        }
        return newMode;
    });
  };

  // --- 新增: 开始录音 ---
  const startRecording = async () => {
    if (isGenerating || isRecording) return; // 防止重复开始
    console.log('[startRecording] 开始录音...');
    setIsRecording(true);
    setRecordingDuration(0);
    setRemainingTime(60);

    const startTime = Date.now();
    recordingStartTimeRef.current = startTime;

    // 清空上次的录音数据
    audioChunksRef.current = [];

    // 获取麦克风权限并启动 MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // 录音停止时，后续 stopRecording 里会处理
        // --- 确保在 stopRecording 完成后才释放 stream ---
        // stream.getTracks().forEach(track => track.stop());
        console.log('[MediaRecorder] onstop triggered');
      };

      recorder.start();
      console.log('[startRecording] MediaRecorder 已启动');
    } catch (err) {
      console.error('[startRecording] 获取麦克风失败:', err);
      toast({ description: "无法访问麦克风，请检查权限", variant: "destructive" });
      toast({ description: "无法访问麦克风，请检查权限", variant: "destructive", duration: 2000 });
      setIsRecording(false);
      return;
    }

    // 设置定时器，每100ms更新一次录音时间
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingTimerRef.current = window.setInterval(() => {
      const currentTime = Date.now();
      const elapsedSeconds = (currentTime - startTime) / 1000;
      setRecordingDuration(elapsedSeconds);
      setRemainingTime(Math.max(0, 60 - elapsedSeconds));
    }, 100);

    // 添加最大录音时长限制（60秒后自动停止）
    const maxRecordingTimeout = setTimeout(() => {
      if (isRecording) {
        console.log('[startRecording] 达到最大录音时长 (60s)，自动停止');
        stopRecording(false); // false 表示正常结束，而非取消
        toast({ description: "已达到最大录音时长 (60秒)", duration: 2000 });
      }
    }, 60000); // 60秒 = 60000毫秒

    // 保存 timeout 引用，以便在需要时清除
    (window as any).maxRecordingTimeoutId = maxRecordingTimeout;

    // toast({ description: "正在录音..." }); // 按钮文字已变化，无需额外提示
  };

  // --- 新增: 停止录音 ---
  const stopRecording = async (cancel = false) => {
    // --- 修改: 添加检查 !recorderRef.current ---
    if (!isRecording || !recorderRef.current) {
        console.log("[stopRecording] 状态不一致或录音未开始，忽略停止操作");
        return;
    }
    console.log(`[stopRecording] 停止录音，是否取消: ${cancel}`);
    setIsRecording(false);

    // 清除定时器
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if ((window as any).maxRecordingTimeoutId) {
      clearTimeout((window as any).maxRecordingTimeoutId);
      (window as any).maxRecordingTimeoutId = null;
    }

    const endTime = Date.now();
    const startTime = recordingStartTimeRef.current;
    recordingStartTimeRef.current = null;

    // 停止 MediaRecorder
    let stoppedByUser = false;
    if (recorderRef.current && recorderRef.current.state === 'recording') {
        try {
            recorderRef.current.stop(); // 触发 ondataavailable 和 onstop
            stoppedByUser = true;
            console.log('[stopRecording] MediaRecorder.stop() called');
        } catch (e) {
            console.error("[stopRecording] Error stopping MediaRecorder:", e);
            // 即使停止失败，也尝试清理资源
        }
    } else {
        console.warn("[stopRecording] MediaRecorder state is not 'recording':", recorderRef.current?.state);
    }

    // 清理媒体流
    recorderRef.current?.stream?.getTracks().forEach(track => track.stop());
    recorderRef.current = null; // 清理 recorder 实例引用

    if (cancel || !startTime) {
      console.log("[stopRecording] 录音已取消");
      toast({ description: "录音已取消", variant: "default", duration: 2000 });
      audioChunksRef.current = []; // 清空缓存的数据
      return;
    }

    const durationMs = endTime - startTime;
    if (durationMs < MIN_RECORDING_TIME_MS) {
      toast({
        title: "提示",
        description: `录音时间太短 (至少需 ${MIN_RECORDING_TIME_MS / 1000} 秒)`,
        variant: "default",
        duration: 2000,
      });
      audioChunksRef.current = [];
      return;
    }

    const durationSeconds = parseFloat((durationMs / 1000).toFixed(1));
    const finalDuration = Math.min(durationSeconds, 60.0);

    // --- 修改: 使用 Promise 确保 onstop 和 ondataavailable 完成 ---
    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) {
            console.warn("[stopRecording] No audio chunks recorded.");
            return; // 没有录制到数据
        }

        // 合成音频 Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = []; // 清空缓存

        // 上传到后端
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            setIsUploadingImage(true); // 复用上传状态

            console.log('[stopRecording] 开始上传语音文件...');
            const response = await axios.post(`${apiBaseUrl}/file/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
            }
            });

            if (response.data && response.data.success) {
            const audioUrl = response.data.url;
            console.log('[stopRecording] 语音上传成功, URL:', audioUrl);
            // toast({ description: "语音上传成功", variant: "default", duration: 2000 });
            sendVoiceMessage(audioUrl, finalDuration);
            } else {
            toast({ description: `语音上传失败: ${response.data?.error || '未知错误'}`, variant: "destructive", duration: 2000 });
            console.error('[stopRecording] 语音上传失败:', response.data?.error);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.message || '网络错误';
            toast({ description: `语音上传请求出错: ${errorMsg}`, variant: "destructive", duration: 2000 });
            console.error('[stopRecording] 语音上传请求出错:', err);
        } finally {
            setIsUploadingImage(false);
            console.log('[stopRecording] 语音上传流程结束');
        }
    };

    // 如果是用户手动停止的，需要等待 ondataavailable 收集完数据
    // 如果是自动停止（超时）或意外情况，可能需要一点延迟确保数据收集
    const delay = stoppedByUser ? 100 : 300; // 给 ondataavailable 一点时间
    setTimeout(processAudio, delay);
  };

  // --- 新增: 模拟发送语音到后端并通知父组件 ---
  const sendVoiceMessage = (audioUrl: string, duration: number) => {
    console.log('[sendVoiceMessage] 准备发送语音消息');
    console.log('[sendVoiceMessage] 模拟发送给后端的数据:', {
      audioData: audioUrl,
      duration: duration,
    });

    // --- 通知父组件添加语音消息到UI ---
    const voicePayload: VoicePayload = {
        type: 'voice',
        audioUrl,
        duration,
    };
    onSendMessage(voicePayload); // 将 VoicePayload 作为第一个参数传递

    console.log('[sendVoiceMessage] 已通知父组件添加语音消息UI');
  };

  // --- 事件处理 ---
  const handlePress = () => {
      if (!voiceButtonDisabled) { // 检查按钮是否禁用
          startRecording();
      }
  };

  // --- 修改: handleRelease, 检查释放位置 ---
  const handleRelease = (event: React.MouseEvent | React.TouchEvent) => {
      if (!isRecording) return; // 如果没在录音，则不处理释放

      const button = voiceButtonRef.current;
      if (!button) {
          console.warn('[handleRelease] 语音按钮 Ref 不存在');
          stopRecording(true); // Ref 不存在，保险起见取消
          return;
      }

      const rect = button.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in event || 'changedTouches' in event) {
          // TouchEvent
          const touchEvent = event as React.TouchEvent;
          // touchend 事件需要用 changedTouches
          if (touchEvent.changedTouches && touchEvent.changedTouches.length > 0) {
              clientX = touchEvent.changedTouches[0].clientX;
              clientY = touchEvent.changedTouches[0].clientY;
          } else {
              console.warn('[handleRelease] TouchEvent 没有 changedTouches 信息');
              stopRecording(true); // 无法判断位置，取消
              return;
          }
      } else {
          // MouseEvent
          const mouseEvent = event as React.MouseEvent;
          clientX = mouseEvent.clientX;
          clientY = mouseEvent.clientY;
      }

      const isInside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

      console.log(`[handleRelease] 释放位置: (${clientX.toFixed(0)}, ${clientY.toFixed(0)}), 按钮边界:`, rect, `是否在内部: ${isInside}`);

      stopRecording(!isInside); // 如果在外部松开 (!isInside 为 true)，则取消录音
  };

  const sendDisabled = inputMode === 'voice' || isGenerating || isUploadingImage || (!inputText.trim() && !uploadedImageUrl);
  const imageButtonDisabled = inputMode === 'voice' || isGenerating || isUploadingImage;
  const voiceButtonDisabled = isGenerating || isUploadingImage; // 录音按钮在生成或上传时禁用

  return (
    <div className="p-2 sm:p-4 border-t border-gray-800 bg-black">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // 只有文本模式下回车才触发表单提交
          if (inputMode === 'text') {
              handleSend();
          }
        }}
        className="flex flex-col gap-2"
      >
        {inputMode === 'text' && (previewImageUrl || uploadedImageUrl) && (
          <div className="mx-2 flex flex-wrap gap-2 px-3">
            <div className="relative group w-20 h-20">
              <img
                src={previewImageUrl || uploadedImageUrl || ''}
                alt="图片预览"
                className={`w-full h-full object-cover rounded-md border border-gray-600 ${isUploadingImage ? 'opacity-50' : ''}`}
              />
              {isUploadingImage && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
                   <Loader2 className="h-6 w-6 text-white animate-spin" />
                 </div>
              )}
              {!isUploadingImage && (
                 <button
                   type="button"
                   onClick={removeImage}
                   className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                   aria-label="Remove image"
                 >
                   <X size={16} />
                 </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 px-2 bg-[#1e1e1e] rounded-3xl p-2 border border-gray-700 focus-within:border-blue-500 transition-colors">
          <button
            type="button"
            onClick={handleToggleInputMode}
            className={`flex-shrink-0 p-2 rounded-full ${
              isUploadingImage || isGenerating ? 'opacity-50 cursor-not-allowed' : 'bg-transparent hover:bg-gray-600 text-white'
            } transition-colors duration-150`}
            aria-label={inputMode === 'text' ? '切换到语音输入' : '切换到文本输入'}
            disabled={isUploadingImage || isGenerating}
          >
            {inputMode === 'text' ? <Volume2 size={20} /> : <Keyboard size={20} />}
          </button>

          {inputMode === 'text' ? (
            <TextareaAutosize
              minRows={1}
              maxRows={6}
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={isUploadingImage ? '图片上传中...' : `给 ${assistantName} 发送消息...`}
              className="flex-1 px-3 py-2 bg-transparent text-white rounded-lg resize-none focus:outline-none placeholder-gray-400 border-none"
              disabled={isGenerating || isUploadingImage}
            />
          ) : (
            // --- 修改: 语音输入按钮，添加 Ref 和修改事件处理器 ---
            <button
              ref={voiceButtonRef} // 添加 Ref
              type="button"
              onMouseDown={handlePress}
              onMouseUp={handleRelease} // 修改: 调用新的 handleRelease
              onTouchStart={(e) => { 
                  // e.preventDefault(); // 在 onTouchMove 中阻止默认行为更精确
                  handlePress(); 
              }} 
              onTouchMove={(e) => { e.preventDefault(); }} // 新增：阻止滑动时的默认滚动/弹性行为
              onTouchEnd={handleRelease} // 修改: 调用新的 handleRelease
              // --- 添加 onMouseLeave 用于视觉反馈（可选） ---
              // onMouseLeave={() => { if (isRecording) { /* 可以在这里添加 "移出取消" 的视觉提示 */ } }}
              // onMouseEnter={() => { if (isRecording) { /* 可以在这里移除 "移出取消" 的视觉提示 */ } }}
              className={`flex-1 h-10 px-3 py-2 text-white rounded-full text-center cursor-pointer transition-colors duration-150 focus:outline-none select-none ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-500 active:bg-red-400' // 录音时的样式（用红色表示录音中）
                  : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500' // 默认样式
              } ${voiceButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={voiceButtonDisabled}
            >
              {isRecording ? (
                <div className="flex items-center justify-center">
                  <span>松开 结束 (上划取消)</span> {/* 修改提示文字 */}
                  <div className="flex items-center ml-2 bg-black/30 px-2 py-0.5 rounded-full">
                    <span className="text-xs">{Math.ceil(remainingTime)}"</span>
                    <Waves size={14} className="ml-1 text-blue-300 animate-pulse" /> {/* 添加动画 */}
                  </div>
                </div>
              ) : '按住 说话'}
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpeg, image/png, image/gif"
            disabled={imageButtonDisabled}
          />
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={imageButtonDisabled}
            className={`flex-shrink-0 p-2 rounded-full ${
              imageButtonDisabled
                ? 'bg-transparent text-gray-500 cursor-not-allowed'
                : 'bg-transparent hover:bg-gray-600 text-white'
            } transition-colors duration-150`}
            aria-label="上传图片"
          >
            <ImageIcon size={20} />
          </button>

          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGenerating}
              className="flex-shrink-0 p-2 rounded-full bg-transparent hover:bg-gray-600 text-yellow-500 transition-colors duration-150"
              aria-label="Stop generating"
            >
              <Square size={20} />
            </button>
          ) : (
            // --- 修改: 文本模式下才显示发送按钮 ---
            inputMode === 'text' && (
                <button
                  type="submit"
                  disabled={sendDisabled}
                  className={`flex-shrink-0 p-2 rounded-full ${
                    sendDisabled
                      ? 'bg-transparent text-gray-500 cursor-not-allowed'
                      : 'bg-transparent hover:bg-gray-600 text-blue-500'
                  } transition-colors duration-150`}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
            )
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
