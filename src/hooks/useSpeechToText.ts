import useSpeechToTextBrowser from './useSpeechToTextBrowser';
// import useSpeechToTextExternal from './useSpeechToTextExternal'; // 暂不使用外部引擎

// 定义主 Hook 的 props 类型
interface UseSpeechToTextProps {
  setText: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  engine?: 'browser' | 'external'; // 引擎类型，默认 browser
  language?: string;
  continuous?: boolean;
  autoSendDelay?: number;
}

// 返回值的类型
interface UseSpeechToTextReturn {
  isListening: boolean;
  isLoading: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  browserSupportsSpeechRecognition: boolean;
  isMicrophoneAvailable: boolean;
}

const useSpeechToText = ({
  setText,
  onTranscriptionComplete,
  engine = 'browser',
  language,
  continuous,
  autoSendDelay,
}: UseSpeechToTextProps): UseSpeechToTextReturn => {
  // --- 浏览器引擎 --- 
  const { 
    isListening: speechIsListeningBrowser, 
    isLoading: speechIsLoadingBrowser, 
    startRecording: startSpeechRecordingBrowser, 
    stopRecording: stopSpeechRecordingBrowser, 
    toggleRecording: toggleSpeechRecordingBrowser,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechToTextBrowser({ 
    setText, 
    onTranscriptionComplete, 
    language, 
    continuous, 
    autoSendDelay 
  });

  // --- 外部引擎 (占位，暂不实现) --- 
  // const { 
  //   isListening: speechIsListeningExternal, 
  //   isLoading: speechIsLoadingExternal, 
  //   startRecording: startSpeechRecordingExternal, 
  //   stopRecording: stopSpeechRecordingExternal 
  // } = useSpeechToTextExternal(setText, onTranscriptionComplete);

  // --- 根据引擎选择返回 --- 
  if (engine === 'browser') {
    return {
      isListening: speechIsListeningBrowser,
      isLoading: speechIsLoadingBrowser,
      startRecording: startSpeechRecordingBrowser,
      stopRecording: stopSpeechRecordingBrowser,
      toggleRecording: toggleSpeechRecordingBrowser,
      browserSupportsSpeechRecognition,
      isMicrophoneAvailable
    };
  } 
  // else if (engine === 'external') { 
  //   // 返回外部引擎的逻辑
  // }

  // 默认回退到浏览器（或抛出错误）
  console.warn('Unsupported STT engine specified, falling back to browser');
  return {
    isListening: speechIsListeningBrowser,
    isLoading: speechIsLoadingBrowser,
    startRecording: startSpeechRecordingBrowser,
    stopRecording: stopSpeechRecordingBrowser,
    toggleRecording: toggleSpeechRecordingBrowser,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  };
};

export default useSpeechToText; 