import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from 'react-hot-toast'; // 假设你使用 react-hot-toast

// 定义 Hook 的 props 类型
interface UseSpeechToTextBrowserProps {
  setText: (text: string) => void; // 更新输入框文本的回调
  onTranscriptionComplete?: (text: string) => void; // 识别完成的回调（本项目可选，因为不自动发送）
  language?: string; // 识别语言 (例如 'zh-CN')
  continuous?: boolean; // 是否持续识别
  autoSendDelay?: number; // 自动发送延迟（本项目不使用，设为 -1）
}

const useSpeechToTextBrowser = ({
  setText,
  onTranscriptionComplete,
  language = 'zh-CN', // 默认中文
  continuous = true, // 默认持续识别，直到手动停止
  autoSendDelay = -1, // 默认不自动发送
}: UseSpeechToTextBrowserProps) => {
  const [isListening, setIsListening] = useState(false); // 自行管理 listening 状态
  const lastTranscript = useRef<string | null>(null);
  const lastInterim = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript, // 库提供的完整识别结果 (非流式，但会在停止后更新)
    finalTranscript, // 最终识别结果
    resetTranscript,
    interimTranscript, // 流式中间结果
    listening: browserIsListening, // 库的监听状态
    isMicrophoneAvailable,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // 使用 useEffect 监听库的流式结果并更新输入框
  useEffect(() => {
    if (interimTranscript && interimTranscript !== lastInterim.current) {
      setText(interimTranscript); // 更新输入框为中间结果
      lastInterim.current = interimTranscript;
    }
  }, [interimTranscript, setText]);

  // 使用 useEffect 监听最终结果（当用户停止说话或手动停止时）
  useEffect(() => {
    if (finalTranscript && finalTranscript !== lastTranscript.current) {
      setText(finalTranscript); // 用最终结果确认输入框内容
      lastTranscript.current = finalTranscript;

      // 清除旧的 timeout (如果存在)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 处理自动发送逻辑 (本项目不使用)
      if (onTranscriptionComplete && autoSendDelay > -1 && finalTranscript.length > 0) {
        timeoutRef.current = setTimeout(() => {
          onTranscriptionComplete(finalTranscript);
          resetTranscript();
          lastTranscript.current = null; // 重置记录
          lastInterim.current = null;
        }, autoSendDelay * 1000);
      }
    }

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [finalTranscript, setText, onTranscriptionComplete, resetTranscript, autoSendDelay]);

  // 启动录音
  const startListening = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('你的浏览器不支持语音识别功能。');
      return;
    }
    if (!isMicrophoneAvailable) {
      // 尝试请求权限
      try {
         // 请求麦克风权限，这会触发浏览器弹窗
         await navigator.mediaDevices.getUserMedia({ audio: true });
         // 如果成功，再次尝试启动
         SpeechRecognition.startListening({ language, continuous });
         setIsListening(true);
         resetTranscript(); // 开始新的识别时重置
         lastInterim.current = null;
         lastTranscript.current = null;
      } catch (err) {
         toast.error('无法访问麦克风，请检查权限设置。');
         setIsListening(false); // 确保状态正确
      }
      return; // 无论成功失败都返回
    }

    // 如果权限已有，直接开始
    SpeechRecognition.startListening({ language, continuous });
    setIsListening(true);
    resetTranscript(); // 开始新的识别时重置
    lastInterim.current = null;
    lastTranscript.current = null;
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, language, continuous, resetTranscript]);


  // 停止录音
  const stopListening = useCallback(() => {
    if (browserIsListening) {
       SpeechRecognition.stopListening();
       setIsListening(false);
       // 注意：最终结果的 useEffect 会在 stopListening 后触发
    }
  }, [browserIsListening]);


  // 切换录音状态
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // 添加对库的 listening 状态的同步，以防外部因素停止监听
  useEffect(() => {
    if (isListening && !browserIsListening) {
       setIsListening(false); // 如果库停止了，我们的状态也应该停止
    }
  }, [browserIsListening, isListening]);


  return {
    isListening,
    isLoading: false, // 浏览器原生实现通常没有加载状态
    startRecording: startListening,
    stopRecording: stopListening,
    toggleRecording: toggleListening, // 提供切换函数
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  };
};

export default useSpeechToTextBrowser; 