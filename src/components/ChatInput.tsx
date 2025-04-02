import React, { useState, useRef, useCallback } from 'react';
import { Plus, Send, Square, Mic, X, Image as ImageIcon, Camera } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize'; // 需要安装： npm install react-textarea-autosize
import useSpeechToText from '@/hooks/useSpeechToText'; // --- 新增：导入语音识别 Hook ---
import AudioRecorderButton from './AudioRecorderButton'; // --- 新增：导入按钮组件 ---

// 文件预览接口
interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
  progress?: number; // 新增：上传进度属性 (0-1)
}

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void; // 更新发送函数以接收文件
  isSubmitting: boolean; // 新增：是否正在提交/等待 AI 回复
  onStopGenerating: () => void; // 新增：停止生成的回调
  files: FilePreview[]; // 新增：文件列表状态
  setFiles: React.Dispatch<React.SetStateAction<FilePreview[]>>; // 新增：更新文件列表的函数
  filesLoading?: boolean; // (可选) 文件是否正在加载
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isSubmitting,
  onStopGenerating,
  files = [], // 默认为空数组，避免 undefined
  setFiles,
  filesLoading = false, // 默认值
}) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false); // 新增：是否正在上传的状态

  // --- 新增：语音识别 Hook ---
  const {
    isListening,
    isLoading: isSpeechLoading, // 重命名避免与 isSubmitting 冲突
    toggleRecording,
    browserSupportsSpeechRecognition,
  } = useSpeechToText({
    setText: setInputText, // 将识别的文本直接设置到输入框状态
    // onTranscriptionComplete: handleSend, // 如果需要识别完成自动发送，取消注释这行
  });

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // 处理发送
  const handleSend = useCallback(() => {
    // 修改：当有图片上传时也需要有文字才能发送
    const hasText = inputText.trim().length > 0;
    const hasFiles = files && files.length > 0;
    
    if (!isSubmitting && hasText && (hasFiles || !hasFiles)) {
      // 提取 File 对象列表
      const fileList = files.map(f => f.file);
      onSendMessage(inputText.trim(), fileList);
      setInputText('');
      setFiles([]); // 发送后清空文件
    }
  }, [inputText, files, isSubmitting, onSendMessage, setFiles]);

  // 处理键盘事件 (Enter 发送)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      handleSend();
    }
  };

  // 模拟上传进度
  const simulateUploadProgress = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      if (progress >= 1) {
        clearInterval(interval);
        setIsUploading(false);
        setFiles(prev => 
          prev.map(f => 
            f.id === fileId ? {...f, progress: 1} : f
          )
        );
      } else {
        setFiles(prev => 
          prev.map(f => 
            f.id === fileId ? {...f, progress} : f
          )
        );
      }
    }, 200);
  };

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     if (event.target.files) {
       const selectedFiles = Array.from(event.target.files);
       const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));

       if (imageFiles.length > 0) {
         setIsUploading(true);
         const newFilePreviews = imageFiles.map(file => ({
           id: `${file.name}-${Date.now()}`, // 简单唯一 ID
           file: file,
           previewUrl: URL.createObjectURL(file),
           progress: 0, // 初始进度为0
         }));
         
         // 附加新文件，而不是替换
         setFiles(prev => [...prev, ...newFilePreviews]);
         
         // 为每个文件模拟上传进度
         newFilePreviews.forEach(file => {
           simulateUploadProgress(file.id);
         });
       }
       // 清空 input value 允许再次选择相同文件
       event.target.value = '';
     }
  };

  // 移动端图片选择
  const handleMobileImageCapture = (source: 'camera' | 'gallery') => {
    if (fileInputRef.current) {
      // 根据来源设置accept和capture属性
      if (source === 'camera') {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      } else {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
      }
    }
  };

  // 打开移动端图片选择菜单
  const openImageUploadMenu = () => {
    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 移动端显示选择菜单
      const result = window.confirm("选择图片来源:\n\n拍摄 / 相册");
      if (result) {
        // 确认对应拍摄
        handleMobileImageCapture('camera');
      } else {
        // 取消对应相册
        handleMobileImageCapture('gallery');
      }
    } else {
      // PC端直接打开文件选择
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // 移除文件
  const removeFile = (fileId: string) => {
    setFiles(prevFiles => {
       const fileToRemove = prevFiles.find(f => f.id === fileId);
       if (fileToRemove) {
         // 释放对象 URL
         URL.revokeObjectURL(fileToRemove.previewUrl);
       }
       return prevFiles.filter(f => f.id !== fileId);
     });
  };

  // 进度圈组件
  const ProgressCircle = ({ progress }: { progress: number }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-md">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle 
            className="text-gray-300"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="20"
            cy="20"
          />
          <circle
            className="text-blue-500"
            strokeWidth="3"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="20"
            cy="20"
            style={{
              transition: 'stroke-dashoffset 0.3s'
            }}
          />
        </svg>
      </div>
    );
  };

  // --- 模拟 LibreChat 结构 ---
  return (
    <div className="p-2 sm:p-4 border-t border-gray-800 bg-black">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex flex-col gap-2"
      >
        {/* 文件预览区域 (FileFormChat simulation) */}
        {files && files.length > 0 && (
           <div className="mx-2 flex flex-wrap gap-2 px-3">
             {files.map((filePreview) => (
               <div key={filePreview.id} className="relative group w-16 h-16">
                 <img
                   src={filePreview.previewUrl}
                   alt={filePreview.file.name}
                   className="w-full h-full object-cover rounded-md border border-gray-600"
                 />
                 {/* 进度显示 */}
                 {(filePreview.progress !== undefined && filePreview.progress < 1) && (
                   <ProgressCircle progress={filePreview.progress} />
                 )}
                 <button
                   type="button"
                   onClick={() => removeFile(filePreview.id)}
                   className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                   aria-label="Remove file"
                 >
                   <X size={14} />
                 </button>
               </div>
             ))}
           </div>
        )}

        {/* 输入框和按钮区域 */}
        <div className="flex items-end gap-2 bg-[#1e1e1e] rounded-3xl p-2 border border-gray-700 focus-within:border-blue-500 transition-colors">
           {/* 附件按钮 (AttachFile simulation) - 修改为图片上传按钮 */}
          <button
            type="button"
            onClick={openImageUploadMenu}
            disabled={isSubmitting || filesLoading || isListening} // --- 修改：录音时禁用附件 ---
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 flex-shrink-0"
            aria-label="上传图片"
          >
            <ImageIcon size={20} />
          </button>
          {/* 隐藏的原生文件输入 */}
          <input
            type="file"
            ref={fileInputRef}
            multiple // 允许选择多个文件
            accept="image/*" // 只接受图片
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={isSubmitting || filesLoading || isListening} // --- 修改：录音时禁用 ---
          />

          {/* 文本输入框 (TextareaAutosize) */}
          <TextareaAutosize
            value={inputText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "正在听你说话..." : "给 Healthbot 发送消息"} // --- 修改：根据状态改变 placeholder ---
            className="flex-1 bg-transparent text-white border-none outline-none text-sm resize-none max-h-40 overflow-y-auto px-2 py-1.5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            rows={1}
            disabled={isSubmitting || filesLoading || isSpeechLoading} // --- 修改：语音加载时也禁用 ---
          />

          {/* --- 新增：语音按钮 --- */}
          {browserSupportsSpeechRecognition && ( // 仅在浏览器支持时显示
             <AudioRecorderButton
               isListening={isListening}
               isLoading={isSpeechLoading}
               onClick={toggleRecording}
               disabled={isSubmitting || filesLoading} // 提交或文件加载时禁用
               ariaLabel={isListening ? '停止语音输入' : '开始语音输入'}
             />
          )}

          {/* 发送/停止按钮 (SendButton/StopButton simulation) */}
          <div className="flex-shrink-0">
            {isSubmitting ? (
              <button
                type="button"
                onClick={onStopGenerating}
                className="bg-gray-700 text-white rounded-full p-2 hover:bg-gray-600"
                aria-label="Stop generating"
              >
                <Square size={20} />
              </button>
            ) : (
              <button
                type="submit"
                // 修改：当有图片时也必须输入文本才能发送
                disabled={!inputText.trim() || filesLoading || isListening || isSpeechLoading || isUploading}
                className="bg-blue-500 text-white rounded-full p-2 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
