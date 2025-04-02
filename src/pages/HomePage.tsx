import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ArrowRight, MessageCircle, Mic, Activity, Heart, Database, ThumbsUp, Play, RotateCw, User, Utensils, Globe, Flame, Check, X as CancelIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import QRCodeScannerIcon from '../components/QRCodeScannerIcon';

// WebSocket服务器地址
const WS_URL = 'ws://localhost:8000/ws/audio';

// 模拟语音数据的函数（仅用于测试）
const MOCK_ENABLED = false; // 设置为false禁用模拟数据，部署时需要设置为false

// 创建模拟的音频数据
// 这里创建的是基本的正弦波音频，实际使用中应该替换为真实的音频数据
const createMockAudioData = () => {
  // 创建模拟的音频数据 (简单的正弦波)
  const sampleRate = 44100;  // 44.1 kHz
  const duration = 0.5;      // 0.5秒
  const frequency = 440;     // 440 Hz (A4音符)

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);

  // 生成简单的正弦波
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }

  // 将AudioBuffer转换为ArrayBuffer
  const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineContext.destination);
  source.start(0);

  return offlineContext.startRendering();
};

// 模拟WebSocket服务器
class MockWebSocket extends EventTarget {
  url: string;
  readyState: number = WebSocket.CONNECTING;

  constructor(url: string) {
    super();
    this.url = url;

    // 模拟连接建立
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.dispatchEvent(new Event('open'));

      // 模拟接收多个音频数据片段
      this.mockStreamAudioChunks();
    }, 500);
  }

  async mockStreamAudioChunks() {
    console.log('MockWebSocket: 开始模拟音频数据流');
    // 模拟服务器发送5段音频数据
    for (let i = 0; i < 5; i++) {
      // 等待一小段时间，模拟流式传输
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        console.log(`MockWebSocket: 创建模拟音频数据 ${i + 1}`);
        // 创建模拟音频数据
        const audioBuffer = await createMockAudioData();

        // 创建一个哑的ArrayBuffer作为替代，而不是直接发送AudioBuffer
        // 在实际应用中，这应该是通过WAV编码器等方式编码的音频数据
        const dummyArrayBuffer = new ArrayBuffer(1024 * (i + 1));
        const view = new Uint8Array(dummyArrayBuffer);
        // 填充一些随机数据，使其在音频解码时产生噪音
        for (let j = 0; j < view.length; j++) {
          view[j] = Math.floor(Math.random() * 256);
        }

        console.log(`MockWebSocket: 发送模拟音频数据 ${i + 1}`);
        // 发送模拟音频数据，这次使用ArrayBuffer而不是AudioBuffer
        const messageEvent = new MessageEvent('message', {
          data: dummyArrayBuffer
        });
        this.dispatchEvent(messageEvent);
      } catch (error) {
        console.error('MockWebSocket: 创建或发送模拟音频时出错:', error);
      }
    }

    // 模拟连接关闭
    setTimeout(() => {
      this.readyState = WebSocket.CLOSED;
      this.dispatchEvent(new Event('close'));
      console.log('MockWebSocket: 连接已关闭');
    }, 2000);
  }

  send(data: any) {
    // 模拟发送数据
    console.log('MockWebSocket发送数据:', data);
  }

  close() {
    if (this.readyState !== WebSocket.CLOSED) {
      this.readyState = WebSocket.CLOSED;
      this.dispatchEvent(new Event('close'));
    }
  }
}

// --- Web Speech API Polyfill ---
// 确保在所有环境中 window 对象下有 SpeechRecognition 和 SpeechGrammarList
const BrowserSpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
const BrowserSpeechGrammarList = window.SpeechGrammarList || (window as any).webkitSpeechGrammarList;

if (BrowserSpeechRecognition && !window.SpeechRecognition) {
  window.SpeechRecognition = BrowserSpeechRecognition;
}
if (BrowserSpeechGrammarList && !window.SpeechGrammarList) {
  window.SpeechGrammarList = BrowserSpeechGrammarList;
}
// --- End Polyfill ---

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [networkAnimate, setNetworkAnimate] = useState(false);

  // 语音相关状态
  const [isRecording, setIsRecording] = useState(false); // 表示用户是否正在按住按钮
  const [showRecordingTooShort, setShowRecordingTooShort] = useState(false);
  // const [recordingDuration, setRecordingDuration] = useState(0); // 暂时注释掉，如果需要时长显示再启用
  // const recordingStartTime = useRef<number | null>(null);
  // const recordingTimer = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // WebSocket和音频播放相关状态 (这部分代码与语音识别无关，保持不变)
  const [isLoading, setIsLoading] = useState(false);  // 是否正在加载/处理中
  const [isPlaying, setIsPlaying] = useState(false);  // 是否正在播放音频
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferQueue = useRef<ArrayBuffer[]>([]);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isProcessingAudio = useRef<boolean>(false);

  // --- 修改：实时语音转文字 (STT) 相关状态 ---
  const [isTranscribing, setIsTranscribing] = useState(false); // 是否正在进行语音识别 API 调用
  const [transcribedText, setTranscribedText] = useState(''); // 实时/最终显示的转录文本
  const [isTranscriptionFinal, setIsTranscriptionFinal] = useState(false); // 当前转录是否有最终结果 (用于UI提示，可选)
  const [showConfirmation, setShowConfirmation] = useState(false); // 是否显示确认/取消按钮
  // const [finalTranscription, setFinalTranscription] = useState<string | null>(null); // <-- 移除此状态
  const recognitionRef = useRef<SpeechRecognition | null>(null); // SpeechRecognition 实例
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 用于处理识别结束后的延迟 (可能不再需要，待观察)
  const accumulatedTranscriptRef = useRef<string>(''); // 使用 Ref 来累积最终结果，避免闭包问题

  // 首先，添加一个防止重复启动的标志
  const [isProcessingRecognition, setIsProcessingRecognition] = useState(false);

  useEffect(() => {
    // 初始化AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();

    // 组件卸载时中止任何正在进行的识别
    return () => {
      recognitionRef.current?.abort(); // 确保卸载时停止识别

      // 清理WebSocket连接
      if (wsRef.current) {
        wsRef.current.close();
      }
      // 清理AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setNetworkAnimate(true);
      setTimeout(() => setNetworkAnimate(false), 2000);
    }, 6000);

    return () => clearInterval(animationInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (chatbotRef.current && containerRef.current) {
        const rect = chatbotRef.current.getBoundingClientRect();
        setShowFloatingButton(rect.bottom < 0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // 初始化WebSocket连接 (这部分代码与语音识别无关，保持不变)
  const setupWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    // 使用模拟WebSocket或真实WebSocket
    const ws = MOCK_ENABLED ? new MockWebSocket(WS_URL) as unknown as WebSocket : new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket连接已建立');
    };

    ws.onmessage = async (event) => {
      console.log('收到WebSocket消息，数据类型:', typeof event.data, event.data);

      let audioData: ArrayBuffer | null = null;

      // 处理不同类型的数据
      if (event.data instanceof ArrayBuffer) {
        // 直接使用ArrayBuffer
        audioData = event.data;
      } else if (event.data instanceof Blob) {
        // 如果是Blob，转换为ArrayBuffer
        console.log('数据是Blob，转换为ArrayBuffer');
        try {
          audioData = await event.data.arrayBuffer();
        } catch (error) {
          console.error('将Blob转换为ArrayBuffer时出错:', error);
          return; // 无法继续处理
        }
      } else {
        console.error('收到意外的数据类型:', event.data);
        return; // 无法处理
      }

      // 继续处理有效的音频数据
      if (audioData) {
        console.log('将ArrayBuffer推送到队列，大小:', audioData.byteLength);
        audioBufferQueue.current.push(audioData);

        // 如果当前没有在处理音频，开始处理
        if (!isProcessingAudio.current) {
          console.log('调用processAudioQueue处理音频队列');
          processAudioQueue();
        } else {
          console.log('音频已加入队列，但当前正在处理其他音频');
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket连接已关闭');
      setIsLoading(false);
      setIsPlaying(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
      setIsLoading(false);
      setIsPlaying(false);
    };
  };

  // 处理音频队列 (这部分代码与语音识别无关，保持不变)
  const processAudioQueue = async () => {
    console.log('处理音频队列: 队列长度=', audioBufferQueue.current.length);

    if (audioBufferQueue.current.length === 0) {
      isProcessingAudio.current = false;
      console.log('音频队列为空，处理完成');
      return;
    }

    isProcessingAudio.current = true;
    setIsPlaying(true);
    console.log('设置isPlaying=true，显示播放状态');

    // 取出队列中的第一条音频数据
    const audioData = audioBufferQueue.current.shift();

    try {
      console.log('开始解码音频数据');
      // 解码音频数据
      const audioBuffer = await audioContextRef.current!.decodeAudioData(audioData!).catch(error => {
        console.warn('音频解码失败，可能是模拟数据格式问题，创建静音音频:', error);
        // 如果解码失败（可能是因为模拟数据不是有效的编码音频），创建一个短的静音音频
        const ctx = audioContextRef.current!;
        const silentBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        return silentBuffer;
      });

      console.log('音频解码成功，创建音频源并播放');
      // 创建音频源并播放
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current!.destination);

      audioSourceRef.current = source;

      // 监听播放结束事件
      source.onended = () => {
        console.log('当前音频片段播放完毕');
        // 播放完当前片段后继续处理队列中的下一个音频
        processAudioQueue();
      };

      source.start(0);
      console.log('音频开始播放');
    } catch (error) {
      console.error('音频处理错误:', error);
      // 出错时继续处理下一个
      processAudioQueue();
    }
  };

  // 开始录音函数 (旧的 MediaRecorder 逻辑，与 Web Speech API 无关，保持不变)
  const startRecording = async () => {
    // ... (保持不变)
        try {
      console.log('Requesting microphone access...'); // <-- 添加日志

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted. Stream:', stream); // <-- 添加日志

      const tracks = stream.getAudioTracks();
      console.log('Audio Tracks:', tracks); // <-- 添加日志
      if (tracks.length === 0) {
          console.error('No audio tracks found in the stream!'); // <-- 添加错误检查
          return; // 如果没有音轨，直接返回
      }
      console.log('First audio track settings:', tracks[0].getSettings()); // <-- 查看音轨设置

      const mediaRecorder = new MediaRecorder(stream);
      console.log('MediaRecorder created. State:', mediaRecorder.state); // <-- 确认初始状态是 inactive

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        // *** 这是关键的调试点 ***
        console.log('ondataavailable event fired!'); // <-- 添加日志确认事件触发
        console.log('event.data:', event.data);     // <-- 查看事件数据
        console.log('event.data.size:', event.data?.size); // <-- 查看数据大小

        if (event.data.size > 0) {
          console.log('Pushing audio chunk to array.'); // <-- 确认数据被添加
          audioChunksRef.current.push(event.data);
        } else {
          console.log('Skipping chunk because size is 0.'); // <-- 确认是否因为size为0被跳过
        }
      };

      // 添加onstop事件处理器，在所有录音数据收集完成后处理
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder onstop event fired');
        // 计算录音时长
        const recordingStartTimeRef = useRef<number | null>(null); // 假设有这个ref
        const recordingDuration = recordingStartTimeRef.current
          ? (Date.now() - recordingStartTimeRef.current) / 1000
          : 0;

        console.log('Final recording duration:', recordingDuration);

        // 如果录音时间太短，显示提示
        if (recordingDuration < 1) {
          console.log('Recording too short in onstop handler.');
          setShowRecordingTooShort(true);
          setTimeout(() => setShowRecordingTooShort(false), 1500);
          return;
        }

        // 处理录音数据
        console.log('Audio chunks in onstop:', audioChunksRef.current.length);
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('Audio Blob created in onstop, size:', audioBlob.size);

          // 发送录音数据到后端
          sendAudioToServer(audioBlob);
        } else {
          console.log('No audio chunks found in onstop handler.');
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // setIsRecording(true); // 由 startTranscription 控制
      const recordingStartTimeRef = useRef<number | null>(null); // 假设有这个ref
      recordingStartTimeRef.current = Date.now();

      // 开始计时器，每100ms更新一次录音时长
      const recordingTimerRef = useRef<number | null>(null); // 假设有这个ref
      recordingTimerRef.current = window.setInterval(() => {
        if (recordingStartTimeRef.current) {
          const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
          // setRecordingDuration(duration);
        }
      }, 100);

    } catch (error) {
      console.error('无法获取麦克风权限:', error);
    }
  };

  // 停止录音函数 (旧的 MediaRecorder 逻辑，与 Web Speech API 无关，保持不变)
  const stopRecording = () => {
    // ... (保持不变)
        console.log('stopRecording called'); // <-- 添加日志
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();

      // 停止所有音轨
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // 清除计时器
    const recordingTimerRef = useRef<number | null>(null); // 假设有这个ref
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // setIsRecording(false); // 由 stopTranscription 控制
    // 注意：音频处理逻辑已移至mediaRecorder.onstop事件处理器中
  };

  // 发送音频数据到后端 (旧的逻辑，与 Web Speech API 无关，保持不变)
  const sendAudioToServer = async (audioBlob: Blob) => {
    // ... (保持不变)
        setIsLoading(true);

    try {
      // 1. 建立WebSocket连接
      setupWebSocket();

      // 如果启用模拟模式，直接返回，不发送HTTP请求
      if (MOCK_ENABLED) {
        console.log('模拟模式：发送音频到后端');
        return;
      }

      // 2. 创建FormData对象发送音频数据
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // 3. 使用fetch API发送数据到后端
      const response = await fetch('http://localhost:8000/api/audio/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('音频成功发送到后端');

      // 注意：后端会通过WebSocket发送音频响应，不需要在这里处理response
    } catch (error) {
      console.error('发送音频到后端失败:', error);
      setIsLoading(false);

      // 关闭WebSocket连接
      if (wsRef.current) {
        wsRef.current.close();
      }
    }
  };

  // --- 语音转文字核心逻辑 (修改) ---

  const startTranscription = useCallback(async () => {
    console.log('startTranscription called');
    
    // 添加防重复状态检查
    if (isProcessingRecognition) {
      console.log('已有识别正在处理中，忽略此次调用');
      return;
    }
    
    // 设置处理中标志
    setIsProcessingRecognition(true);
    
    // 重置状态
    setTranscribedText('');
    accumulatedTranscriptRef.current = ''; // 重置累积文本 Ref
    setIsTranscriptionFinal(false);
    setShowConfirmation(false);
    // if (speechTimeoutRef.current) { // 清除旧的超时
    //   clearTimeout(speechTimeoutRef.current);
    // }

    // 检查浏览器兼容性
    if (!BrowserSpeechRecognition) {
      console.error('浏览器不支持 Web Speech API');
      alert('抱歉，您的浏览器不支持语音识别功能。');
      setIsRecording(false); // 确保UI重置
      setIsTranscribing(false);
      setIsProcessingRecognition(false); // 重置处理标志
      return;
    }

    // 请求麦克风权限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 立即停止轨道，因为我们只需要权限，实际录音由SpeechRecognition处理
      stream.getTracks().forEach(track => track.stop());
      console.log('麦克风权限已获取');
    } catch (err) {
      console.error('无法获取麦克风权限:', err);
      alert('无法获取麦克风权限，请检查浏览器设置。');
      setIsRecording(false); // 确保UI重置
      setIsTranscribing(false);
      setIsProcessingRecognition(false); // 重置处理标志
      return;
    }

    // 如果已有实例，先中止
    if (recognitionRef.current) {
      console.log('Aborting previous recognition instance.');
      recognitionRef.current.abort();
    }

    // 创建新实例
    const recognition = new BrowserSpeechRecognition();
    recognition.lang = 'zh-CN'; // 设置语言为中文
    recognition.interimResults = true; // 获取中间结果
    recognition.continuous = true; // 持续识别

    recognitionRef.current = recognition;
    setIsRecording(true); // 用户开始按下按钮
    setIsTranscribing(true); // API 开始工作

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let hasFinalInBatch = false; // 标记本次事件中是否有 final 结果

      // 使用 Ref 来累积最终结果
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          accumulatedTranscriptRef.current += event.results[i][0].transcript + ' ';
          hasFinalInBatch = true;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // 组合完整的文本：累积的最终结果 + 当前的中间结果
      const currentText = (accumulatedTranscriptRef.current + interimTranscript).trim();
      console.log('onresult - Accumulated:', accumulatedTranscriptRef.current.trim(), 'Interim:', interimTranscript, 'Setting Text:', currentText); // 调试日志

      setTranscribedText(currentText); // 更新显示的文本
      setIsTranscriptionFinal(hasFinalInBatch); // 更新是否有最终结果的标记 (可选UI效果)
    };

    recognition.onend = () => {
      console.log('Speech recognition service disconnected (onend). isTranscribing:', isTranscribing, 'showConfirmation:', showConfirmation); // 调试日志
      // 仅在 onend 时设置 isTranscribing 为 false
      setIsTranscribing(false);
      console.log("onend: Recognition ended.");
      
      // 重置处理标志，允许新的录音开始
      // 添加延迟以确保其他事件处理完成
      setTimeout(() => {
        setIsProcessingRecognition(false);
        console.log("Reset processing flag, ready for new recognition");
      }, 500);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      setIsRecording(false); // 出错时重置按钮状态
      setIsTranscribing(false); // 停止转录状态
      
      // 对所有错误类型统一处理，显示一条错误消息
      if (!showConfirmation) { // 只有在确认框未显示时才显示错误
        setShowRecordingTooShort(true);
        setTimeout(() => setShowRecordingTooShort(false), 1500);
      }
      
      // 重置处理标志，允许新的录音开始
      // 添加延迟以确保其他事件处理完成
      setTimeout(() => {
        setIsProcessingRecognition(false);
        console.log("Error encountered, reset processing flag");
      }, 500);
    };

    try {
      recognition.start();
      console.log('Speech recognition started.'); // 调试日志
    } catch (e) {
       console.error('无法启动语音识别:', e);
       setIsRecording(false); // 启动失败，重置状态
       setIsTranscribing(false);
       setIsProcessingRecognition(false); // 重置处理标志
    }

  }, [isProcessingRecognition, isTranscribing, showConfirmation]); // 添加isProcessingRecognition作为依赖项

  // 修改: 用户松开按钮时触发
  const stopTranscription = useCallback(() => {
    console.log('stopTranscription called (button released)'); // 调试日志

    // 1. 标记用户已松手
    setIsRecording(false);

    // 2. 检查是否有有效的识别结果（文本长度>=2）
    //    使用 functional update 来获取最新的 transcribedText 状态
    setTranscribedText(currentText => {
      const trimmedText = currentText.trim();
      const recognition = recognitionRef.current; // 获取当前识别实例

      // 如果文本长度小于2，判定为识别失败
      if (trimmedText.length < 2) {
        console.log('识别结果太短或为空，视为识别失败');

        // 重要: 中止识别并立即隐藏聆听模态框
        if (recognition) {
          recognition.abort(); // 强制停止
        }
        setIsTranscribing(false); // 立刻隐藏模态框

        // 显示识别问题提示
        setShowRecordingTooShort(true);
        setTimeout(() => setShowRecordingTooShort(false), 1500);

        // 延迟重置处理标志，避免事件冲突 (可以缩短延迟)
        setTimeout(() => {
          setIsProcessingRecognition(false);
          console.log("Recognition failed, reset processing flag");
        }, 50); // 缩短延迟

        return ''; // 清空文本
      }

      // 文本长度足够，进入确认流程
      // 优雅地停止识别，允许处理最终结果
      if (recognition && isTranscribing) { // 仅在识别正在运行时停止
         console.log('Calling recognition.stop() for confirmation');
         recognition.stop(); // 停止聆听，但允许最终结果处理
      }
      // 注意: isTranscribing 会在 recognition.stop() 完成后的 onend 事件处理器中被设为 false

      if (!showConfirmation) {
        console.log('Showing confirmation dialog with text:', trimmedText);
        setShowConfirmation(true); // 显示确认UI
      }

      return currentText; // 必须返回当前状态
    });

    console.log('stopTranscription finished. isRecording: false, isTranscribing (may change soon):', isTranscribing);

  }, [showConfirmation, isTranscribing, isProcessingRecognition]); // 添加 isProcessingRecognition 依赖

  // --- 确认/取消处理 (修改) ---
  const handleConfirmTranscription = useCallback(() => {
    console.log('Confirm button clicked.'); // <--- 添加日志
    // 1. 停止可能仍在进行的识别
    recognitionRef.current?.abort();
    console.log('Recognition aborted by confirm.');

    // 2. 使用当前的 transcribedText 导航
    const textToSend = transcribedText.trim(); // 获取最新的文本
    console.log('Navigating to AIChat with message:', textToSend);
    if (textToSend) {
      try {
        navigate('/aichat', { state: { initialMessage: textToSend } });
      } catch (error) {
        console.error('Navigation error:', error);
        alert('导航到AI聊天页面时出错，请重试');
      }
    } else {
      console.warn('Confirm clicked but text is empty.');
    }

    // 3. 重置状态
    setShowConfirmation(false);
    setTranscribedText('');
    accumulatedTranscriptRef.current = ''; // 重置累积文本 Ref
    setIsTranscribing(false); // 确认后转录结束
    setIsProcessingRecognition(false); // 重置处理标志
    // isRecording 应该已经是 false

  }, [navigate, transcribedText]); // 依赖 navigate 和 transcribedText

  const handleCancelTranscription = useCallback(() => {
    console.log('Cancel button clicked.'); // <--- 添加日志
    // 1. 停止可能仍在进行的识别
    recognitionRef.current?.abort();
    console.log('Recognition aborted by cancel.');

    // 2. 重置状态
    setShowConfirmation(false);
    setTranscribedText('');
    accumulatedTranscriptRef.current = ''; // 重置累积文本 Ref
    setIsTranscribing(false); // 取消后转录结束
    setIsProcessingRecognition(false); // 重置处理标志
    // isRecording 应该已经是 false

    console.log('State reset after cancel.'); // 添加调试日志
  }, []); // 无需依赖项

  // --- 更新事件处理程序 (保持不变，但移除 preventDefault) ---
  const handleVoiceButtonTouchStart = (e: React.TouchEvent) => {
    // e.preventDefault(); // <-- 移除
    startTranscription();
  };

  const handleVoiceButtonTouchEnd = (e: React.TouchEvent) => {
    // e.preventDefault(); // <-- 移除
    // 不需要延迟，立即调用 stopTranscription 来显示确认框
    stopTranscription();
  };

  const handleVoiceButtonMouseDown = (e: React.MouseEvent) => {
    // e.preventDefault(); // <-- 移除
    startTranscription();
  };

  const handleVoiceButtonMouseUp = (e: React.MouseEvent) => {
    // e.preventDefault(); // <-- 移除
    // 不需要延迟
    stopTranscription();
  };

  // 当用户意外离开按钮时也停止
  const handleVoiceButtonTouchCancel = (e: React.TouchEvent) => {
    // e.preventDefault(); // <-- 移除
    console.log('Touch cancel detected');
    if (isRecording) { // 只有在录音状态下才处理
       // 不需要延迟
      stopTranscription();
    }
  };

  // --- 页面导航函数 (保持不变) ---
  const goToHealthRiskReport = () => {
    navigate('/health-risk-report');
  };

  const goToHealthTrajectory = () => {
    navigate('/health-trajectory');
  };

  const goToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  const goToCircle = () => {
    navigate('/circle');
  };

  const goToDetailedRisk = () => {
    navigate('/disease-risk-detail');
  };

  const goToAIChat = () => {
    navigate('/aichat');
  };

  const restartRiskAssessment = () => {
    navigate('/gender');
  };

  // --- 内容数据 (保持不变) ---
  const contentItems = [
    // ... (保持不变)
    {
      id: 1,
      type: 'article',
      title: '"体重管理年"系列: 体重篇',
      image: '/public/体重管理年系列 体重篇.jpg',
      tag: '体重管理年系列',
      author: '健康管理师',
      likes: 845,
      comments: 75,
    },
    {
      id: 2,
      type: 'video',
      title: '国家出手了！卫健委带你做"减脂餐"',
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '官方指导',
      author: '央视新闻',
      likes: 5100,
      views: 8600,
    },
    {
      id: 3,
      type: 'article',
      title: '吃完这个，我怕你只剩一点点了',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      tag: '饮食控制',
      author: '饮食专家',
      likes: 328,
      comments: 42,
    },
    {
      id: 4,
      type: 'article',
      title: '2025达减肥目标，挑战7斤公主减重',
      image: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '减重挑战',
      author: '减重达人',
      likes: 763,
      comments: 124,
    },
    {
      id: 5,
      type: 'article',
      title: '为什么运动有这么大热量缺口，而且还喝水...',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      tag: '科普知识',
      author: '徐风暖阳',
      likes: 46,
      comments: 15,
    },
    {
      id: 6,
      type: 'video',
      title: '第127天: 77.95kg，差2.95kg达标，今天...',
      image: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '减重日记',
      author: '瘦桐友友_3',
      likes: 23,
      views: 567,
    },
    {
      id: 7,
      type: 'article',
      title: '光，理直气壮的干了...',
      image: 'https://images.unsplash.com/photo-1579126038374-6064e9370f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      tag: '励志故事',
      author: '万物向阳',
      likes: 14,
      comments: 5,
    },
    {
      id: 8,
      type: 'article',
      title: 'DAY 128 | 今天吃了好多好多大枣，上瘾了...',
      image: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '小米粥',
      author: '奇迹寒寒',
      likes: 9,
      comments: 3,
    },
    {
      id: 9,
      type: 'video',
      title: '有氧减脂太快了！10MIN一跳瘦一小时',
      image: 'https://images.pexels.com/photos/4498148/pexels-photo-4498148.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '健身视频',
      author: '健身教练小王',
      likes: 1324,
      views: 23589,
    },
    {
      id: 10,
      type: 'article',
      title: '低GI饮食法：稳定血糖轻松瘦',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '饮食计划',
      author: '营养师李明',
      likes: 568,
      comments: 47,
    },
    {
      id: 11,
      type: 'article',
      title: '减脂期怎么吃？7天食谱大公开',
      image: 'https://images.pexels.com/photos/1660030/pexels-photo-1660030.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '减脂食谱',
      author: '厨师长张师傅',
      likes: 789,
      comments: 103,
    },
    {
      id: 12,
      type: 'video',
      title: '15分钟早餐减脂餐制作，营养又美味',
      image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '减脂餐制作',
      author: '健康厨房',
      likes: 432,
      views: 8976,
    },
  ];

  // --- 渲染逻辑 (修改) ---
  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen bg-black text-white overflow-y-auto pb-16"
    >
      <StatusBar />

      {/* 修改: 录音弹出层 */}
      {/* 条件变为 isTranscribing (API工作中) 或 showConfirmation (显示确认框) */}
      {(isTranscribing || showConfirmation) && (
        <div className="fixed inset-0 flex items-start justify-center pt-48 z-[100] bg-black/70 backdrop-blur-sm">

          <div className="w-72 min-h-[18rem] bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-3xl flex flex-col items-center justify-between p-6 shadow-lg relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-md animate-pulse"></div>

            {/* 图标区域 */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 relative shadow-inner">
              {/* 仅在确认框显示时显示 Check 图标 */}
              {showConfirmation && (
                <Check size={40} className="text-white opacity-80 absolute" />
              )}
              {/* 麦克风图标：确认框显示时半透明，否则完全显示 */}
              <Mic size={40} className={cn("text-white transition-opacity", showConfirmation ? "opacity-50" : "opacity-100")} />
              {/* 波浪效果：仅在正在转录且确认框未显示时 */}
              {isTranscribing && !showConfirmation && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-[ping_1.5s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-[6px] rounded-full border-2 border-white/50 animate-[ping_2s_ease-in-out_infinite]"></div>
                </>
              )}
            </div>

            {/* 状态文本/转录文本 */}
            <div className="text-center flex-grow flex flex-col justify-center w-full mb-4">
              {/* 优先显示确认状态 */}
               {showConfirmation ? (
                 <>
                   <p className="text-white font-medium text-lg mb-2">识别完成</p>
                   {/* 修改: 显示实时更新的 transcribedText */}
                   <p className="text-white/90 text-base break-words max-h-24 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
                     {transcribedText || '...'}
                     {/* 如果仍在转录，显示光标 */}
                     {isTranscribing && <span className="inline-block w-1 h-4 bg-white/70 animate-pulse ml-1"></span>}
                   </p>
                 </>
               ) : isTranscribing ? ( // 如果未显示确认框，但正在转录
                 <>
                    <p className="text-white font-medium text-lg mb-2">正在聆听...</p>
                    {/* 修改: 显示实时更新的 transcribedText */}
                    <p className="text-white/90 text-base break-words max-h-24 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
                      {transcribedText || '请说话...'}
                      {/* 添加一个闪烁的光标效果 */}
                      <span className="inline-block w-1 h-4 bg-white/70 animate-pulse ml-1"></span>
                    </p>
                 </>
               ) : ( // 初始或错误状态 (理论上在 isTranscribing 为 false 且 showConfirmation 为 false 时不会显示弹出层了)
                  <p className="text-white font-medium text-lg mb-2">准备就绪</p>
               )}
            </div>

             {/* 确认/取消按钮 */}
            {showConfirmation && (
              <div className="flex justify-around w-full mt-4 relative z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    console.log('取消按钮被点击!!!');
                    handleCancelTranscription();
                  }}
                  className="flex items-center justify-center w-24 h-10 bg-red-600 hover:bg-red-500 rounded-full text-white font-medium transition-colors cursor-pointer"
                  type="button"
                >
                  <CancelIcon size={18} className="mr-1" />
                  放弃
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    console.log('确认按钮被点击!!!');
                    handleConfirmTranscription();
                  }}
                  className="flex items-center justify-center w-24 h-10 bg-green-600 hover:bg-green-500 rounded-full text-white font-medium transition-colors cursor-pointer"
                  type="button"
                >
                  <Check size={18} className="mr-1" />
                  确定
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 识别出现问题，请重试 (保持不变) */}
      {showRecordingTooShort && (
        <div className="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none"> {/* 提高 z-index */}
          <div className="bg-black/80 text-white px-6 py-4 rounded-xl animate-[fadeIn_0.2s_ease-out]">
            识别出现问题，请重试
          </div>
        </div>
      )}

      {/* 页面顶部内容 (保持不变) */}
      <div className="w-full px-5 py-2 pt-10 flex justify-between items-center">
        {/* ... */}

      </div>

      <div className="mt-6 mb-8 text-center w-full px-5">
        <h1 className="text-2xl font-semibold">Hi, 李小明</h1>
      </div>

      {/* 修改: 主语音按钮 */}
      <div
        ref={chatbotRef}
        className={cn(
          "relative w-40 h-40 mb-5 mx-auto transition-all duration-300 ease-in-out",
          isRecording ? 'scale-110' : 'scale-100' // 按下时放大效果
        )}
        onTouchStart={handleVoiceButtonTouchStart}
        onTouchEnd={handleVoiceButtonTouchEnd}
        onTouchCancel={handleVoiceButtonTouchCancel} // 处理触摸取消
        onMouseDown={handleVoiceButtonMouseDown}
        onMouseUp={handleVoiceButtonMouseUp}
        // 添加 onMouseLeave 处理鼠标移出按钮区域的情况
        onMouseLeave={(e: React.MouseEvent) => {
          if (isRecording) { // 只有在按下状态移出才触发
            console.log('Mouse leave detected while recording');
            // e.preventDefault(); // <-- 移除
            stopTranscription();
          }
        }}
        role="button" // 增加 role 属性
        aria-pressed={isRecording} // 增加 aria-pressed 状态
        tabIndex={0} // 使其可聚焦
      >
        {/* 按钮内部视觉效果 (保持不变) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-50 blur-md animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-white/70 animate-[ping_4s_ease-in-out_infinite]"></div>
        <div className="absolute inset-[10px] rounded-full border-[3px] border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        <div className="absolute inset-[20px] rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center shadow-inner overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <Mic size={36} className="text-white mb-1" />
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 h-3 bg-white rounded-full animate-[bounce_1.5s_ease-in-out_infinite]"
                  style={{animationDelay: `${i * 0.2}s`}}
                ></div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 mix-blend-overlay"></div>
        </div>
      </div>

       {/* 修改: 提示文本 */}
      <p className="mt-2 mb-8 text-center font-medium relative">
        <span className={cn(
            "bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300",
             !isRecording && !showConfirmation ? "animate-pulse" : "" // 仅在空闲时闪烁
          )}
        >
           {isRecording ? '正在聆听，松开结束...' : (showConfirmation ? '请确认或放弃识别结果' : '长按语音提问AI健康助手 ✨')}
        </span>
      </p>

      {/* 健康风险网络图模块 (修改后) */}
      <div className="w-full px-5 mb-4">
        <div className="bg-gradient-to-r from-blue-800 to-purple-900 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 flex flex-col relative">
            {/* 右上角放置背景图 */}
            <div className="absolute top-0 right-0 w-1/2 h-3/5 overflow-hidden rounded-bl-3xl">
              <img
                src="/健康风险报告图.jpg"
                alt="疾病风险网络"
                className="w-full h-full object-cover"
              />
              {/* 图片上的渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-bl from-transparent to-purple-900"></div>
            </div>

            {/* 标题区域 */}
            <div className="flex-1 relative z-10 mb-8 flex items-center justify-between">
              <span className="text-xl font-medium text-white">点击查看详细风险报告</span>
              <ArrowRight size={20} className="text-white" />
            </div>

            {/* 底部内容区域 */}
            <div className="flex items-center mt-2 relative z-10">
              <div 
                className="flex items-center bg-white/20 px-4 py-2 cursor-pointer hover:bg-white/30 transition-colors rounded-lg"
                onClick={goToDetailedRisk}
              >
                <span className="text-base text-white">测一测您的健康风险</span>
              </div>
            </div>

            {/* 风险标签 - 修改为水平排列（同一行），位于"测一测"按钮下方 */}
            <div className="flex flex-row space-x-3 mt-3 relative z-10">
              <div className="bg-red-500/80 px-3 py-1 rounded-full flex items-center text-xs font-medium text-white">
                <Heart size={12} className="mr-1" />
                高风险: 2 项
              </div>
              <div className="bg-yellow-500/80 px-3 py-1 rounded-full flex items-center text-xs font-medium text-white">
                <Activity size={12} className="mr-1" />
                中风险: 3 项
              </div>
            </div>
            
            {/* 重新测算 - 移至风险标签下方，使用白色背景 */}
            <div className="mt-6 relative z-10">
              <div
                className="flex items-center bg-white px-5 py-2 rounded-full cursor-pointer hover:bg-white/90 transition-colors w-fit"
                onClick={restartRiskAssessment}
              >
                <RotateCw size={14} className="mr-2 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">重新测算</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 工具模块网格布局 (保持不变) */}
      <div className="w-full px-5 mb-4">
         {/* ... */}
         <div className="grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4 auto-rows-min">
          {/* 我的每周饮食模块 */}
          <div
            className="col-span-2 row-span-2 bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 rounded-2xl p-4 flex flex-col overflow-hidden relative shadow-lg"
            onClick={goToKnowledgeBase}
          >
            <div className="absolute top-0 right-0 left-2 text-left py-2  rounded-t-2xl">
              <p className="text-xs text-white/80">* 扫描食材生成详细菜谱</p>
            </div>
            
            <div className="flex justify-between items-start z-10 mt-5">
              <h3 className="text-xl font-semibold text-white">我的<br/>每周饮食 </h3>
              <ArrowRight size={20} className="text-white" />
            </div>
            
            <div className="mt-4">
              <div className="rounded-full bg-white flex justify-center py-3 mb-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <QRCodeScannerIcon size={20} className="text-blue-600" />
                  </div>
                  <span className="text-blue-600 ml-1">扫描食材</span>
                </div>
              </div>
              
              <p className="text-sm font-medium text-white">每日推荐</p>
              <div className="mt-2 space-y-3">
                {/* 早餐模块 */}
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-lg font-bold text-white mb-2">早餐</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center border border-white">
                      <span className="text-white text-sm">🌾 燕麦粥</span>
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center border border-white">
                      <span className="text-white text-sm">🫐 蓝莓</span>
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center border border-white">
                      <span className="text-white text-sm">🥚 煮鸡蛋</span>
                    </div>
                  </div>
                </div>

                {/* 午餐模块 */}
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-lg font-bold text-white mb-2">午餐</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center border border-white">
                      <span className="text-white text-sm">🥗 鸡胸肉沙拉</span>
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center border border-white">
                      <span className="text-white text-sm">🍞 全麦面包</span>
                    </div>
                  </div>
                </div>

                {/* 晚餐模块 */}
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-lg font-bold text-white mb-2">晚餐</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center border border-white">
                      <span className="text-white text-sm">🥗 鸡胸肉沙拉</span>
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center border border-white">
                      <span className="text-white text-sm">🍞 全麦面包</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 卡路里打卡模块 */}
          <div className="col-span-2 row-span-3 bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-black">卡路里打卡</h3>
                  <p className="text-xs text-gray-500">5:30更新</p>
                </div>
                <ArrowRight size={20} className="text-black" />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <Flame size={20} className="text-orange-500 mr-2" />
                  <div>
                    <p className="text-3xl font-bold text-purple-500">15</p>
                    <p className="text-xs text-gray-500">连续打卡天</p>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-500">300</p>
                  <p className="text-xs text-gray-500">还可吃千卡</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 flex-grow">
                {[
                  {meal: '早餐', kcal: 300, img: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'},
                  {meal: '午餐', kcal: 300, img: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'},
                  {meal: '晚餐', kcal: 300, img: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'},
                  {meal: '小吃', kcal: 300, img: 'https://images.pexels.com/photos/1028599/pexels-photo-1028599.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'}
                ].map((item, index) => (
                  <div key={index} className="flex items-center bg-gray-50 p-2 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 mr-3 flex-shrink-0 rounded-lg overflow-hidden">
                      <img src={item.img} alt={item.meal} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-black truncate font-medium">{item.meal}</p>
                      <p className="text-2xl text-purple-500 font-bold">{item.kcal} <span className="text-sm">千卡</span></p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full bg-purple-500 text-white py-3 rounded-full font-medium">
                立即拍照
              </button>
            </div>
          </div>

          {/* 健康星球模块 */}
          <div className="col-span-2 row-span-1 bg-green-500 rounded-xl overflow-hidden shadow-lg relative"
               onClick={goToKnowledgeBase}>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-black flex items-center">
                  健康星球
                  <Globe size={16} className="text-blue-500 ml-1" />
                </h3>
                <ArrowRight size={20} className="text-black" />
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-44 overflow-hidden">
                <img
                  src="/lovable-uploads/be42a73c-38a7-4a03-a374-602de676ec36.png"
                  alt="健康星球"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex flex-col justify-end p-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                      10MIN
                    </div>
                    <Play size={16} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">有氧减脂太快了</h3>
                  <p className="text-sm text-white/80">1分钟=跑步1小时</p>
                </div>

                <div className="absolute bottom-6 right-6 bg-blue-500/80 px-2 py-1 rounded text-xs text-white">
                  巨量精选
                </div>
              </div>

              <div className="absolute top-6 left-6 flex flex-col items-start space-y-1">
                <div className="px-2 py-1 bg-blue-500/70 backdrop-blur-sm rounded text-white text-xs">
                  🔥 巨燃脂
                </div>
                <div className="px-2 py-1 bg-blue-500/70 backdrop-blur-sm rounded text-white text-xs">
                  💧 巨减肥
                </div>
              </div>
            </div>
          </div>

          {/* 我的圈子模块 */}
          <div
            className="col-span-2 row-span-1 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl p-4 flex flex-col overflow-hidden shadow-lg relative"
            onClick={goToCircle}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-black">我的圈子</h3>
              <ArrowRight size={20} className="text-black" />
            </div>

            <div className="flex flex-wrap mt-4 gap-2">
              {[
                'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
                'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
                'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
                'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
              ].map((img, idx) => (
                <div key={idx} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                  <img src={img} alt={`User ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center">
              <div className="p-2 bg-orange-500 rounded-full">
                <Flame size={16} className="text-white" />
              </div>
              <p className="ml-2 text-black font-medium">当前挑战：低糖饮食</p>
            </div>

            <div className="mt-4 flex items-center">
              <div className="p-2 bg-blue-500 rounded-full">
                <User size={16} className="text-white" />
              </div>
              <p className="ml-2 text-black font-medium">今日已打卡圈友 <span className="text-xl font-bold text-purple-600">6</span> 人</p>
            </div>
          </div>

          {/* 其他工具模块 */}
          <div className="col-span-2 row-span-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">其他工具</h3>
              <ArrowRight size={20} className="text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>, name: '舌苔检测', bg: 'bg-yellow-500' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M17.5 6.5 12 2 6.5 6.5"></path><path d="m4.5 10 3.5-3.5"></path><path d="m19.5 10-3.5-3.5"></path><path d="M14.5 19.5 12 22l-2.5-2.5"></path><path d="m4.5 14 7.5 7.5 7.5-7.5"></path><path d="M4.5 14V6.5l7.5 7.5 7.5-7.5V14"></path></svg>, name: '喝水记录', bg: 'bg-blue-500' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>, name: 'AI面诊', bg: 'bg-purple-500' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M17.5 6.5 12 2 6.5 6.5"></path><path d="m4.5 10 3.5-3.5"></path><path d="m19.5 10-3.5-3.5"></path><path d="M14.5 19.5 12 22l-2.5-2.5"></path><path d="m4.5 14 7.5 7.5 7.5-7.5"></path><path d="M4.5 14V6.5l7.5 7.5 7.5-7.5V14"></path></svg>, name: '看看手相', bg: 'bg-yellow-500' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>, name: '专家门诊', bg: 'bg-blue-500' },
              ].map((tool, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`${tool.bg} w-12 h-12 rounded-full flex items-center justify-center mb-1`}>
                    {tool.icon}
                  </div>
                  <span className="text-xs text-gray-300">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 大家都在看模块 (保持不变) */}
      <div className="mt-4 w-full h-[1px] bg-gray-400"></div>
      <div className="w-full px-5 mb-20 mt-8">
         {/* ... */}
          <div className="bg-gray-100 rounded-t-3xl pt-6 pb-8 rounded-b-3xl">
          <div className="px-5 mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                <span className="text-orange-500">🔍</span>
              </div>
              <h2 className="text-xl font-bold text-black">大家都在看</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm h-60"
                >
                  <div className="relative h-32">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                          <Play size={16} className="text-white ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/80 text-black font-medium">
                        #{item.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 flex flex-col h-28">
                    <h3 className="text-sm font-medium text-black line-clamp-2 mb-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <div className="flex items-center">
                        <span className="truncate max-w-20">{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.type === 'video' ? (
                          <>
                            <span className="flex items-center">
                              <Play size={10} className="mr-0.5" />
                              {item.views}
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center">
                            <MessageCircle size={10} className="mr-0.5" />
                            {item.comments}
                          </span>
                        )}
                        <span className="flex items-center">
                          <ThumbsUp size={10} className="mr-0.5" />
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center my-6 text-xs text-gray-400">
              <div className="h-px bg-gray-200 flex-grow"></div>
              <span className="mx-4">— 已经到底了 —</span>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={goToKnowledgeBase}
                className="py-3 px-4 rounded-full bg-blue-100 text-blue-500 font-medium flex items-center justify-center"
              >
                更多内容 <ArrowRight size={16} className="ml-1" />
              </button>
              <button
                onClick={goToCircle}
                className="py-3 px-4 rounded-full bg-green-100 text-green-500 font-medium flex items-center justify-center"
              >
                加入圈子 <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 浮动语音按钮 (逻辑保持一致) */}
      {showFloatingButton && !isRecording && !showConfirmation && ( // 只在空闲且主按钮不在视口时显示
        <div className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-purple-700 to-purple-900 border-2 border-purple-300 flex items-center justify-center z-30 shadow-lg shadow-purple-500/20"
          onTouchStart={handleVoiceButtonTouchStart}
          onTouchEnd={handleVoiceButtonTouchEnd}
          onTouchCancel={handleVoiceButtonTouchCancel}
          onMouseDown={handleVoiceButtonMouseDown}
          onMouseUp={handleVoiceButtonMouseUp}
          onMouseLeave={(e: React.MouseEvent) => {
            if (isRecording) { // 只有在按下状态移出才触发
              console.log('Float Mouse leave detected while recording');
              // e.preventDefault(); // <-- 移除
              stopTranscription();
            }
          }}
          role="button"
          aria-pressed={isRecording} // 仍然反映 isRecording
          tabIndex={0}
          title="语音提问" // 添加 title
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-800 to-blue-900 opacity-70 animate-pulse"></div>
          <Mic size={20} className="text-white z-10" />
        </div>
      )}

      {/* 底部导航栏 (保持不变) */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2 z-40">
        {/* ... */}
           <div className="flex flex-col items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToAIChat}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <span className="text-xs">机器人</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToCircle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span className="text-xs">圈子</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={() => navigate('/my')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;