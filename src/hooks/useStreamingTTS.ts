import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import useAuthStore from '@/stores/authStore';
import { apiWsBaseUrl } from '@/config/api';

interface UseStreamingTTSOptions {
  onPlaybackStart?: () => void;
  onPlaybackStop?: () => void;
  onError?: (error: string) => void;
}

interface UseStreamingTTSResult {
  isPlaying: boolean;
  isLoading: boolean; // true when connecting or initially buffering
  play: (text: string, messageId: string, voiceType?: string) => void;
  stop: () => void;
  currentlyPlayingId: string | null;
}

declare global {
    interface Window {
      AudioContext: typeof AudioContext;
      webkitAudioContext: typeof AudioContext;
    }
}

// --- 配置常量 ---
// 累积多少字节后触发一次解码 (估算值，需要调整以平衡延迟和缓冲)
// 假设 ~64kbps MP3 -> 8KB/s. 2秒约 16KB.
const BYTE_THRESHOLD = 64 * 1024; 

const useStreamingTTS = (options: UseStreamingTTSOptions = {}): UseStreamingTTSResult => {
  const { onPlaybackStart, onPlaybackStop, onError } = options;
  const [isPlaying, setIsPlaying] = useState(false); // 是否有音频正在输出
  const [isLoading, setIsLoading] = useState(false); // 是否正在连接或初始缓冲
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  // 存储原始 ArrayBuffer 块
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  // 存储已解码的 AudioBuffer，准备播放
  const decodedBufferQueueRef = useRef<AudioBuffer[]>([]);
  // 当前播放的源节点
  const currentSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  // 标记 AudioContext 是否正在播放
  const isAudioPlayingRef = useRef<boolean>(false);
  // 标记 WebSocket 是否已关闭
  const isWebSocketClosedRef = useRef<boolean>(false);
  // 累积的字节数
  const accumulatedBytesRef = useRef<number>(0);
  // 下一个 Buffer 应该开始播放的时间点
  const nextStartTimeRef = useRef<number>(0);

  const accessToken = useAuthStore((state) => state.accessToken);
  const stopFnRef = useRef<() => void>(() => {});
  const playNextBufferFnRef = useRef<() => void>(() => {});
  const processAccumulatedChunksFnRef = useRef<() => void>(() => {});

  // --- 初始化 AudioContext ---
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          console.error("浏览器不支持 Web Audio API");
          toast({ title: "错误", description: "您的浏览器不支持音频播放功能。", variant: "destructive" });
          return null;
        }
        audioContextRef.current = new AudioContext();
        if (audioContextRef.current.state === 'suspended') {
          const resume = async () => {
            await audioContextRef.current?.resume();
            document.removeEventListener('click', resume);
            document.removeEventListener('touchstart', resume);
          };
          document.addEventListener('click', resume);
          document.addEventListener('touchstart', resume);
        }
        console.log("[TTS] AudioContext initialized. State:", audioContextRef.current.state);
      } catch (e) {
        console.error("创建 AudioContext 失败:", e);
        toast({ title: "错误", description: "初始化音频播放器失败。", variant: "destructive" });
        return null;
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'closed') {
        console.warn("[TTS] AudioContext was closed, trying to re-initialize.");
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // 确保 context 是 running 状态
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // --- 合并 ArrayBuffer ---
  const concatenateArrayBuffers = useCallback((buffers: ArrayBuffer[]): ArrayBuffer => {
    let totalLength = 0;
    for (const buffer of buffers) {
      totalLength += buffer.byteLength;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of buffers) {
      result.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }
    return result.buffer;
  }, []);

  // --- 播放队列中的下一个 Buffer ---
  const playNextBuffer = useCallback(() => {
    if (isAudioPlayingRef.current || decodedBufferQueueRef.current.length === 0) {
      return; // 正在播放或队列为空
    }

    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== 'running') {
        console.warn("[TTS] AudioContext not running when trying to play next buffer.");
        // 尝试恢复，如果失败则停止
        audioContext?.resume().then(() => {
            if (audioContext.state === 'running') {
                playNextBufferFnRef.current(); // 恢复成功，重试
            } else {
                console.error("[TTS] AudioContext could not be resumed. Stopping playback.");
                stopFnRef.current();
            }
        }).catch(err => {
            console.error("[TTS] Error resuming AudioContext:", err);
            stopFnRef.current();
        });
        return;
    }

    isAudioPlayingRef.current = true;
    const bufferToPlay = decodedBufferQueueRef.current.shift();
    if (!bufferToPlay) {
        isAudioPlayingRef.current = false;
        return;
    }
    
    // 如果这是第一个播放的块，更新状态并设置初始 nextStartTime
    if (!isPlaying && !isLoading) {
        setIsLoading(false);
        setIsPlaying(true);
        nextStartTimeRef.current = audioContext.currentTime; // 设置初始时间
        if (onPlaybackStart) onPlaybackStart();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = bufferToPlay;
    source.connect(audioContext.destination);
    
    // --- 关键修改：使用精确时间调度 ---
    const scheduledStartTime = nextStartTimeRef.current;
    console.log(`[TTS] Scheduling buffer to start at: ${scheduledStartTime.toFixed(3)}s (duration: ${bufferToPlay.duration.toFixed(3)}s)`);
    source.start(scheduledStartTime); 
    // --- 更新下一个开始时间 ---
    nextStartTimeRef.current = scheduledStartTime + bufferToPlay.duration;
    
    source.onended = () => {
      // 检查当前结束的节点是否是记录的节点 (防止旧节点的 onended 干扰)
      if (currentSourceNodeRef.current === source) { 
          currentSourceNodeRef.current = null;
          isAudioPlayingRef.current = false;
          console.log(`[TTS] Finished playing buffer scheduled at ${scheduledStartTime.toFixed(3)}s.`);
          
          // 检查是否是最后一个块
          if (isWebSocketClosedRef.current && decodedBufferQueueRef.current.length === 0) {
            console.log("[TTS] All buffers played and WebSocket is closed.");
            setIsPlaying(false); // 确保状态更新
            setCurrentlyPlayingId(null);
            if (onPlaybackStop) onPlaybackStop();
          } else {
            // 尝试播放下一个 (如果队列不为空，且当前没有其他播放被启动)
            // 这里不再由 onended 直接触发下一个，而是依赖于 process 函数添加新 buffer 后调用 playNext
            // 但是，如果队列里还有，且 isAudioPlayingRef 为 false，可以尝试启动
            if (!isAudioPlayingRef.current && decodedBufferQueueRef.current.length > 0) {
                 console.log("[TTS] Triggering playNextBuffer from onended as queue is not empty.")
                 playNextBufferFnRef.current();
            }
          }
      }
    };

    currentSourceNodeRef.current = source; // 更新当前播放节点引用

  }, [isPlaying, isLoading, onPlaybackStart, onPlaybackStop]);

  // --- 处理累积的数据块 ---
  const processAccumulatedChunks = useCallback(async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext || audioChunksRef.current.length === 0) {
      return;
    }

    const chunksToProcess = [...audioChunksRef.current];
    audioChunksRef.current = [];
    accumulatedBytesRef.current = 0;

    console.log(`[TTS] Processing ${chunksToProcess.length} accumulated chunks...`);
    const combinedBuffer = concatenateArrayBuffers(chunksToProcess);

    try {
       if (audioContext.state !== 'running') await audioContext.resume();
       if (audioContext.state !== 'running') throw new Error("AudioContext not running after resume attempt.");
       
       const decodedBuffer = await audioContext.decodeAudioData(combinedBuffer);
       decodedBufferQueueRef.current.push(decodedBuffer);
       console.log(`[TTS] Decoded ${decodedBuffer.duration.toFixed(2)}s of audio. Queue size: ${decodedBufferQueueRef.current.length}`);
       
       // --- 关键修改：只在当前未播放时，由 process 触发播放链的开始 ---
       if (!isAudioPlayingRef.current) {
            playNextBufferFnRef.current(); 
       }
       // 如果正在播放，则不需要做什么，新 buffer 已入队，会在当前结束后被 playNext 自动取出
       
    } catch (error) {
        console.error('[TTS] Error decoding accumulated chunks:', error);
        toast({ title: "错误", description: "解码音频数据块失败。", variant: "destructive" });
        if (onError) onError("解码音频数据块失败");
        stopFnRef.current(); // 解码失败则停止
    }
  }, [concatenateArrayBuffers, onError]);

  // --- 停止函数 ---
  const stop = useCallback(() => {
    console.log('[TTS] Stopping playback (stop function called)...');
    
    // 关闭 WebSocket
    if (wsRef.current && wsRef.current.readyState < WebSocket.CLOSING) {
      isWebSocketClosedRef.current = true; // 标记为关闭，防止 onclose 再次处理
      wsRef.current.close(1000, "User requested stop");
      console.log("[TTS] WebSocket connection close requested by stop().");
    }
    wsRef.current = null;

    // 停止当前播放的音频
    if (currentSourceNodeRef.current) {
      try {
        currentSourceNodeRef.current.onended = null; // 移除 onended 监听，防止触发 playNext
        currentSourceNodeRef.current.stop();
        currentSourceNodeRef.current.disconnect();
        console.log("[TTS] Stopped the active audio source node via stop().");
      } catch (e) {
        console.warn("[TTS] Error stopping source node via stop():", e);
      }
    }
    
    // 清空队列和状态
    audioChunksRef.current = [];
    decodedBufferQueueRef.current = [];
    currentSourceNodeRef.current = null;
    isAudioPlayingRef.current = false;
    accumulatedBytesRef.current = 0;
    nextStartTimeRef.current = 0; // 重置下次开始时间
    // isWebSocketClosedRef 保持 true (如果被设过) 或 false (如果未连接或未关闭)

    const wasPlaying = isPlaying;
    const wasLoading = isLoading;
    
    setIsLoading(false);
    setIsPlaying(false);
    setCurrentlyPlayingId(null);

    // 仅当状态从未播放变为停止时调用回调
    if (wasPlaying && onPlaybackStop) {
      console.log("[TTS] Calling onPlaybackStop from stop() because wasPlaying was true.")
      onPlaybackStop();
    }
    console.log("[TTS] Playback stopped and resources cleaned via stop().");

  }, [isPlaying, isLoading, onPlaybackStop]);

  // --- 更新 Ref 函数引用 ---
  useEffect(() => {
    stopFnRef.current = stop;
    playNextBufferFnRef.current = playNextBuffer;
    processAccumulatedChunksFnRef.current = processAccumulatedChunks;
  }, [stop, playNextBuffer, processAccumulatedChunks]);

  // --- 播放函数 ---
  const play = useCallback((text: string, messageId: string, voiceType?: string) => {
    console.log(`[TTS] Request to play message ID: ${messageId}`);
    if (!text) {
      console.warn("[TTS] Play request ignored: text is empty.");
      return;
    }

    const audioContext = initializeAudioContext();
    if (!audioContext) return;

    if (isPlaying || isLoading) {
      console.log("[TTS] Already playing or loading, stopping previous process first.");
      stopFnRef.current();
    }
    
    // 重置状态变量
    setIsLoading(true);
    setIsPlaying(false); 
    setCurrentlyPlayingId(messageId);
    audioChunksRef.current = [];
    decodedBufferQueueRef.current = [];
    accumulatedBytesRef.current = 0;
    isAudioPlayingRef.current = false;
    isWebSocketClosedRef.current = false;
    currentSourceNodeRef.current = null;
    nextStartTimeRef.current = 0; // 重置开始时间

    // --- WebSocket 连接 ---
    const wsUrl = `${apiWsBaseUrl}?token=${accessToken}`;
    console.log(`[TTS] Connecting to WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[TTS] WebSocket 连接成功，发送文本...');
      ws.send(JSON.stringify({ text: text, voice_type: voiceType }));
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer && event.data.byteLength > 0) {
        // console.log(`[TTS] Received audio chunk, size: ${event.data.byteLength} bytes`);
        audioChunksRef.current.push(event.data);
        accumulatedBytesRef.current += event.data.byteLength;

        // 检查是否达到阈值
        if (accumulatedBytesRef.current >= BYTE_THRESHOLD) {
          processAccumulatedChunksFnRef.current();
        }
      } else if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            console.error("[TTS] Received error message from server:", data.error);
            toast({ title: "语音合成错误", description: data.error, variant: "destructive" });
            if (onError) onError(data.error);
            stopFnRef.current();
          }
        } catch (e) {
          console.warn("[TTS] Received non-JSON string data:", event.data);
        }
      } else {
        console.warn("[TTS] Received empty or unexpected data:", event.data);
      }
    };

    ws.onerror = (event) => {
      console.error('[TTS] WebSocket 错误:', event);
      toast({ title: "错误", description: "语音服务连接失败。", variant: "destructive" });
      if (onError) onError("WebSocket 连接错误");
      stopFnRef.current();
    };

    ws.onclose = (event) => {
      if (isWebSocketClosedRef.current) {
           console.log("[TTS] WebSocket onclose skipped because connection was closed by stop().");
           return;
      }
      console.log(`[TTS] WebSocket 连接关闭 (onclose event). Code: ${event.code}, Reason: ${event.reason}`);
      wsRef.current = null;
      isWebSocketClosedRef.current = true; 

      console.log("[TTS] Processing remaining chunks after WebSocket close.");
      processAccumulatedChunksFnRef.current(); 
      
      // --- 关键修改：检查逻辑由 playNextBuffer 的 onended 处理 ---
      // onclose 不再需要复杂的 setTimeout 检查，因为 onended 会处理最终状态
      // 只需确保如果从未开始播放（例如，数据太少或出错），isLoading 能被设置回 false
      setTimeout(() => { // 短暂延迟确保 process 有机会启动
           if (!isAudioPlayingRef.current && decodedBufferQueueRef.current.length === 0 && isLoading) {
                console.log("[TTS] Final check: WS closed, nothing playing or queued, setting isLoading false.");
                setIsLoading(false);
           }
      }, 50);
    };

  }, [accessToken, initializeAudioContext, concatenateArrayBuffers, onPlaybackStart, onPlaybackStop, onError, isPlaying, isLoading]);

  // --- 清理 Effect ---
  useEffect(() => {
    return () => {
      console.log("[TTS] Cleaning up TTS hook on unmount.");
      stopFnRef.current();
    };
  }, []);

  return { isPlaying, isLoading, play, stop, currentlyPlayingId };
};

export default useStreamingTTS;
