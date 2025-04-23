import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom'; // 引入 useParams
import { Menu, X, Plus, MessageCircle, Trash2, MessageSquarePlus, User, Copy, Volume2, Square, Loader2, Play, ArrowLeft } from 'lucide-react'; // 引入 ArrowLeft
import ChatInput, { VoicePayload } from '../components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
// 移除 Sheet 相关 import
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from 'axios';
import { apiBaseUrl } from '@/config/api';
import { toast } from '@/components/ui/use-toast';
import useStreamingTTS from '@/hooks/useStreamingTTS';
import useAuthStore from '../stores/authStore';
import { MessageMarkdown } from '@/components/MessageMarkdown';

// --- 保留 ChatMessage 和 RawBackendMessage 接口定义 ---
interface RawBackendMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | null;
  created_at: string;
  content_type: string;
  audio_duration?: number | null;
  text_content?: string | null;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  contentType?: 'text' | 'image' | 'voice';
  isGenerating?: boolean;
  duration?: number;
}

// --- 新增: 定义数字医生信息接口 ---
interface DoctorInfo {
  agentId: string; // 例如 "doctor1"
  name: string;
  avatar: string;
  intro: string;
  sessionId?: string;
  specialty?: string; // 可选，如果需要显示
  voiceType: string; // 新增
}

// --- 移除 AgentType Enum 和 AIAssistant 接口 ---
// --- 移除 commonQuestionsMap ---
// Placeholder for doctor-specific common questions (example for doctor1 - 手诊)
const doctorCommonQuestionsMap: Record<string, string[]> = {
    doctor1: [
        "如何科学制定减肥饮食计划？", // 营养学相关
        "高蛋白低脂饮食怎么安排？", 
        "糖尿病患者的饮食注意事项？",
        "如何通过饮食调节血脂？",
        "维生素缺乏有哪些表现？"
    ],
    doctor2: [
        "高血压需要长期吃药吗？", // 心脑血管相关
        "心脏早搏严重吗？",
        "胸闷气短可能是什么原因？",
        "心梗的早期症状有哪些？",
        "如何预防心血管疾病？"
    ],
    doctor3: [
        "腰椎间盘突出怎么缓解疼痛？", // 骨科相关
        "膝关节疼痛的常见原因？",
        "骨质疏松如何预防和治疗？",
        "运动损伤后如何正确恢复？",
        "长期久坐对脊椎有什么影响？"
    ]
};

const DoctorChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agentId } = useParams<{ agentId: string }>(); // 从 URL 获取 agentId

  // --- 修改: 使用单个 doctorInfo 状态 ---
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // --- 移除 isSidebarOpen ---
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  // --- 移除 queuedMessage, pendingImageUrl, pendingTargetAssistant, pendingMessage ---
  const streamingMessageIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // --- 移除 externalImageUrl ---
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVoiceMessageId, setPlayingVoiceMessageId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true); // 新增：加载会话状态
  const [thinkingDotCount, setThinkingDotCount] = useState(1);

  // --- 新增: 用于流式渲染防抖的 Ref ---
  const streamingTextRef = useRef<string>(''); // 存储当前流的累积文本
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // 存储防抖计时器

  const {
    play: playTTS,
    stop: stopTTS,
    isPlaying: isTTSPlaying,
    isLoading: isTTSLoading,
    currentlyPlayingId: ttsPlayingMessageId
  } = useStreamingTTS({
      onError: (errorMsg) => {
          toast({
              title: "TTS 错误",
              description: errorMsg,
              variant: "destructive",
              duration: 2000,
          });
      },
  });

  // --- 修改: fetchMessages 现在接收 doctorInfo ---
  const fetchMessages = useCallback(async (sessionId: string, currentDoctorInfo: DoctorInfo | null) => {
    if (!sessionId || !currentDoctorInfo) {
        console.warn("[fetchMessages] 缺少 sessionId 或 doctorInfo");
        return;
    }
    try {
      console.log(`[fetchMessages] 开始获取会话 ${sessionId} 的消息，医生: ${currentDoctorInfo.name}`);
      const initialMsgs = currentDoctorInfo.intro ? [
        { id: `${currentDoctorInfo.agentId}-init-1`, text: currentDoctorInfo.intro, isUser: false, timestamp: new Date(), contentType: 'text' as const, duration: undefined }
      ] : [];

      const response = await axios.get(`${apiBaseUrl}/chat/messages/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });

      if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
        const messagesData: RawBackendMessage[] = response.data.data;
        console.log(`[fetchMessages] 成功获取到 ${messagesData.length} 条消息`);

        const convertedMessages: ChatMessage[] = messagesData.map((msg) => {
          let contentType: ChatMessage['contentType'] = 'text';
          let textContent: string = '';
          let duration: number | undefined = undefined;

          if (msg.content_type === 'image') {
            contentType = 'image';
            textContent = msg.content || '';
          } else if (msg.content_type === 'audio' || msg.content_type === 'voice') {
            contentType = 'voice';
            duration = typeof msg.audio_duration === 'number' ? msg.audio_duration : undefined;
            textContent = msg.content || ''; // Store URL or identifier
          } else {
            contentType = 'text';
            textContent = msg.content || '';
          }

          return {
            id: msg.id || generateUniqueId(),
            text: textContent,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.created_at || Date.now()),
            contentType: contentType,
            duration: duration,
          };
        });

        let finalMessages: ChatMessage[];
        if (convertedMessages.length > 0) {
          console.log(`[fetchMessages] 合并 ${initialMsgs.length} 条初始消息和 ${convertedMessages.length} 条后端消息`);
          finalMessages = [...initialMsgs, ...convertedMessages]
                            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        } else {
          console.log(`[fetchMessages] 后端消息为空，仅使用 ${initialMsgs.length} 条初始消息`);
          finalMessages = initialMsgs;
        }
        setMessages(finalMessages);

      } else {
          console.warn(`[fetchMessages] API 响应无效或数据为空，session: ${sessionId}。响应数据:`, response.data);
          setMessages(initialMsgs);
      }
    } catch (error) {
      console.error('[fetchMessages] 获取消息失败:', error);
      toast({
        title: "错误",
        description: "获取消息历史失败，请稍后再试",
        variant: "destructive",
        duration: 2000,
      });
      const initialMsgsOnError = currentDoctorInfo.intro ? [
        { id: `${currentDoctorInfo.agentId}-init-1`, text: currentDoctorInfo.intro, isUser: false, timestamp: new Date(), contentType: 'text' as const, duration: undefined }
      ] : [];
      setMessages(initialMsgsOnError);
    }
  }, []);

  // --- 修改: useEffect 用于获取医生信息和会话 ---
  useEffect(() => {
    const { doctorName, doctorAvatar, doctorIntro, doctorSpecialty } = (location.state || {}) as { doctorName?: string; doctorAvatar?: string; doctorIntro?: string; doctorSpecialty?: string };

    if (!agentId) {
        console.error("错误：DoctorChat 页面缺少 agentId 参数！");
        toast({ title: "页面错误", description: "无法加载医生信息，缺少标识符。", variant: "destructive" });
        navigate('/circle'); // 或者跳转到错误页/上一页
        return;
    }

    // 针对不同agentId配置不同voiceType
    let voiceType = 'zh_male_beijingxiaoye_moon_bigtts';
    if (agentId === 'doctor1') voiceType = 'ICL_zh_male_zhengzhiqingnian_tob';
    else if (agentId === 'doctor2') voiceType = 'ICL_zh_female_zhixingwenwan_tob';
    else if (agentId === 'doctor3') voiceType = 'zh_female_wanqudashu_moon_bigtts';
    const initialDoctorData: DoctorInfo = {
      agentId: agentId,
      name: doctorName || `医生 (${agentId})`,
      avatar: doctorAvatar || '/数字医生1.jpg', // 默认头像
      intro: doctorIntro || `欢迎咨询${doctorName || '医生'}。`,
      specialty: doctorSpecialty,
      voiceType,
    };
    setDoctorInfo(initialDoctorData);
    setMessages(initialDoctorData.intro ? [
        { id: `${agentId}-init-1`, text: initialDoctorData.intro, isUser: false, timestamp: new Date(), contentType: 'text', duration: undefined }
    ] : []); // 设置初始消息

    console.log(`[DoctorChat Mount] agentId: ${agentId}, 准备获取或创建 session...`);
    setIsLoadingSession(true); // 开始加载

    const fetchDoctorSession = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/chat/session/${agentId}`, {
          headers: {
            'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
          }
        });

        if (response.data && response.data.code === 200 && response.data.data?.session_id) {
          const sessionId = response.data.data.session_id;
          console.log(`[fetchDoctorSession] 成功获取 sessionId: ${sessionId} for agent: ${agentId}`);

          // 更新 doctorInfo 状态包含 sessionId
          setDoctorInfo(prevInfo => prevInfo ? { ...prevInfo, sessionId: sessionId } : { ...initialDoctorData, sessionId: sessionId });

          // 获取消息历史
          await fetchMessages(sessionId, { ...initialDoctorData, sessionId });

          // --- 新增代码 开始 ---
          // 加载历史消息后，立即滚动到底部
          requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          });
          console.log(`[fetchDoctorSession] 完成历史消息加载并即时滚动到底部 for agent: ${agentId}`);
          // --- 新增代码 结束 ---

        } else {
          console.error('[fetchDoctorSession] 获取 session API 返回失败:', response.data);
          toast({ title: "错误", description: `无法建立与${initialDoctorData.name}的连接。`, variant: "destructive" });
          // 即使失败，也显示初始信息
           setMessages(initialDoctorData.intro ? [
                { id: `${agentId}-init-1`, text: initialDoctorData.intro, isUser: false, timestamp: new Date(), contentType: 'text', duration: undefined }
            ] : []);
        }
      } catch (error: any) {
        console.error('[fetchDoctorSession] 获取 session ID 时发生网络或处理错误:', error);
        const errorMsg = error.response?.data?.detail || error.message || '网络错误';
        toast({
          title: "连接错误",
          description: `无法连接到 ${initialDoctorData.name} 的聊天服务: ${errorMsg}`,
          variant: "destructive",
          duration: 3000,
        });
         // 即使失败，也显示初始信息
         setMessages(initialDoctorData.intro ? [
              { id: `${agentId}-init-1`, text: initialDoctorData.intro, isUser: false, timestamp: new Date(), contentType: 'text', duration: undefined }
          ] : []);
      } finally {
          setIsLoadingSession(false); // 加载结束
      }
    };

    fetchDoctorSession();

    // --- 新增: 组件卸载时清理防抖计时器 ---
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };

  }, [agentId, location.state, navigate, fetchMessages]); // 依赖 agentId 和 location.state

  useEffect(() => {
    // 检查是否有正在生成且内容为空的AI消息
    const hasThinking = messages.some(
      m => m.isGenerating && !m.isUser && (!m.text || m.text.trim() === '')
    );
    let timer: NodeJS.Timeout | null = null;
    if (hasThinking) {
      timer = setInterval(() => {
        setThinkingDotCount(prev => (prev % 3) + 1);
      }, 500);
    } else {
      setThinkingDotCount(1);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [messages]);

  // --- 移除 getOrCreateSessionId ---

  const generateUniqueId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  };

  // --- 移除 handleSelectAssistant ---

  // --- sendMessageToBackend 基本保持不变，但使用 doctorInfo ---
  const sendMessageToBackend = async (
    message: string | null,
    sessionId: string,
    imageUrl?: string | null,
    audioUrl?: string | null,
    audioDuration?: number | null
  ) => {
    if (!sessionId) {
        toast({ title: "错误", description: "无法发送消息，会话无效", variant: "destructive" });
        console.error("[sendMessageToBackend] Error: sessionId is missing.");
        return;
    }

    console.log(`[sendMessageToBackend] 开始发送消息到 session: ${sessionId}, 图片 URL: ${imageUrl}, 音频 URL: ${audioUrl}, 音频时长: ${audioDuration}`);
    let response: Response | null = null;
    const currentStreamingMessageId = generateUniqueId();
    streamingMessageIdRef.current = currentStreamingMessageId;
    streamingTextRef.current = ''; // 重置当前流的文本
    if (debounceTimerRef.current) { // 清理可能存在的旧计时器
      clearTimeout(debounceTimerRef.current);
    }
    // --- 移除 aiResponseText --- (现在使用 streamingTextRef.current)
    const finalContentType: 'text' = 'text'; // 假设流式响应总是文本

    try {
      console.log("[sendMessageToBackend] 使用 stream 接口");
      response = await fetch(`${apiBaseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          content: message,
          img_url: imageUrl || null,
          audio_url: audioUrl || null,
          audio_duration: audioDuration || null
        }),
      });

      if (!response?.ok) {
        const contentType = response?.headers.get("content-type");
        let errorDetail = `请求失败: ${response?.status || '未知状态'}`;
        try {
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } else {
                const errorText = await response?.text();
                console.error('非JSON错误响应:', errorText);
                errorDetail = errorText || errorDetail;
            }
        } catch (parseError) {
             console.error('解析错误响应失败:', parseError);
        }
        throw new Error(errorDetail);
      }

      if (!response.body) {
        throw new Error("响应体为空");
      }

      const aiPlaceholderMessage: ChatMessage = {
        id: currentStreamingMessageId,
        text: '', // 初始为空
        isUser: false,
        timestamp: new Date(),
        contentType: finalContentType, // 确定是文本
        isGenerating: true,
      };
      setMessages(prevMessages => [...prevMessages, aiPlaceholderMessage]);
      // --- 移除 setAssistants ---

      console.log(`[sendMessageToBackend] 添加了 ID 为 ${currentStreamingMessageId} 的初始 AI 消息占位符`);
      // --- 移除此处滚动，让防抖更新后滚动 ---

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamEnded = false; // 标记流是否结束

      while (!streamEnded) {
        const { done, value } = await reader.read();
        if (done) {
          streamEnded = true;
          console.log("[sendMessageToBackend] 流读取完成 (done=true)");
          // 不再需要在这里 break，因为下面的 buffer 处理可能还有剩余数据
        }

        buffer += decoder.decode(value, { stream: !done }); // 如果 done=true, stream=false
        const lines = buffer.split('\n');

        // 保留最后一行不完整的片段在 buffer 中，除非流已经结束 (done=true)
        buffer = (!done && lines.length > 1) ? lines.pop() || '' : '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const jsonData = JSON.parse(line.slice(6));
                    // console.log("[sendMessageToBackend] Parsed data:", jsonData); // 减少日志量

                    if (jsonData.event === 'cmpl' && typeof jsonData.text === 'string') {
                        // --- 修改: 使用防抖更新 ---
                        streamingTextRef.current += jsonData.text; // 累加文本

                        if (debounceTimerRef.current) {
                          clearTimeout(debounceTimerRef.current); // 清除旧计时器
                        }
                        debounceTimerRef.current = setTimeout(() => {
                          if (!streamingMessageIdRef.current) return; // 如果在延迟期间被停止，则不更新
                          setMessages(prevMessages => prevMessages.map(msg =>
                            msg.id === streamingMessageIdRef.current
                              ? { ...msg, text: streamingTextRef.current } // 只更新文本
                              : msg
                          ));
                           // --- 滚动逻辑移到防抖更新后 ---
                           requestAnimationFrame(() => { // 使用 rAF 提高流畅度
                               messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                           });
                           debounceTimerRef.current = null; // 清除计时器引用
                        }, 150); // 防抖时间 150ms

                    } else if (jsonData.event === 'search_plus') {
                       // console.log("[sendMessageToBackend] 收到 search_plus 事件:", jsonData);
                    } else if (jsonData.event === 'search_process') {
                       // console.log("[sendMessageToBackend] 收到 search_process 事件:", jsonData.text);
                    } else if (jsonData.event === 'all_done') {
                       // console.log("[sendMessageToBackend] 收到 all_done 事件，准备结束");
                       streamEnded = true; // 标记流结束
                    }

                } catch (error) {
                    console.error('解析 SSE JSON 出错:', error, '原始行:', line);
                }
            } else if (line.startsWith('event: ')) {
                 // console.log("[sendMessageToBackend] Received event:", line);
            }
        }
        // 如果 buffer 中包含结束标志，也认为流结束
        if (buffer.includes('"event":"all_done"')) {
          streamEnded = true;
        }
      } // end while loop

      console.log(`[sendMessageToBackend] 流处理结束。最终累积文本长度: ${streamingTextRef.current.length}`);

      // --- 修改: 流结束后进行最终更新 ---
      if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current); // 清除可能挂起的计时器
          debounceTimerRef.current = null;
      }

      // 确保最终状态被设置
      const finalMessageId = streamingMessageIdRef.current; // 捕获当前ID
      if (finalMessageId) {
        console.log(`[sendMessageToBackend] 执行最终状态更新 for message ID: ${finalMessageId}`);
        setMessages(prevMessages => prevMessages.map(msg =>
          msg.id === finalMessageId
            ? { ...msg, text: streamingTextRef.current, isGenerating: false } // 设置最终文本并停止生成状态
            : msg
        ));
      } else {
          console.warn("[sendMessageToBackend] 流结束后，streamingMessageIdRef.current 为空，无法执行最终更新");
      }

      streamingMessageIdRef.current = null; // 清空流消息 ID
      streamingTextRef.current = ''; // 清空累积文本

      // --- 移除 setAssistants ---
      // --- 确保最终滚动 ---
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);

    } catch (error) {
      console.error('[sendMessageToBackend] 发送或处理消息时发生错误:', error);
      toast({
        title: "错误",
        description: `与助手通信失败: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive",
        duration: 2000,
      });

      // --- 清理工作 ---
      if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
      }
      const failedMessageId = streamingMessageIdRef.current;
      if (failedMessageId) {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== failedMessageId));
        streamingMessageIdRef.current = null;
      }
      streamingTextRef.current = ''; // 清空累积文本
      // --- 移除 setAssistants ---
      throw error; // Re-throw to be caught by handleSendMessage
    }
  };

  // --- handleSendMessage 基本保持不变，但使用 doctorInfo ---
  const handleSendMessage = useCallback(async (messageOrPayload: string | VoicePayload, imageUrl?: string | null) => {
    if (isSubmitting || isLoadingSession) { // 增加 isLoadingSession 判断
      console.log("[handleSendMessage] 正在提交或加载会话中，忽略本次发送请求");
      if (isLoadingSession) {
          toast({ description: "正在连接医生，请稍候...", duration: 2000 });
      }
      return;
    }

    const currentDoctorInfo = doctorInfo; // Capture current doctorInfo

    if (!currentDoctorInfo || !currentDoctorInfo.sessionId) {
      console.error('[handleSendMessage] 严重错误：找不到医生信息或 sessionId！', currentDoctorInfo);
      toast({ title: "错误", description: "无法发送消息，连接信息丢失，请尝试返回并重新进入。", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    console.log(`[handleSendMessage] 当前医生: ${currentDoctorInfo.name}, Session ID: ${currentDoctorInfo.sessionId}`);


    let userMessageText: string | null = null;
    let isVoiceMessage = false;
    let voiceDuration: number | undefined = undefined;
    let audioUrl: string | null = null;

    if (typeof messageOrPayload === 'string') {
        userMessageText = messageOrPayload.trim();
    } else if (messageOrPayload && messageOrPayload.type === 'voice') {
        isVoiceMessage = true;
        voiceDuration = messageOrPayload.duration;
        audioUrl = messageOrPayload.audioUrl;
        userMessageText = null;
        console.log(`[handleSendMessage] 检测到语音消息，时长: ${voiceDuration}s, url: ${audioUrl}`);
    }

    const hasImage = !!imageUrl;

    if (!userMessageText && !hasImage && !isVoiceMessage) {
        console.log("[handleSendMessage] 文本、图片和语音均为空，不发送");
        toast({ description: "请输入消息、上传图片或录制语音", duration: 2000 });
        return;
    }

    console.log("[handleSendMessage] 开始处理发送:", {
        isVoice: isVoiceMessage,
        text: userMessageText ? userMessageText.substring(0, 50) + '...' : 'null',
        duration: voiceDuration,
        hasImage
    });
    setIsSubmitting(true);
    stopTTS(); // 在发送前停止TTS

    const newMessagesToAdd: ChatMessage[] = [];
    const now = new Date();

    if (isVoiceMessage && voiceDuration !== undefined && audioUrl) {
        const userVoiceMessage: ChatMessage = {
            id: generateUniqueId(),
            text: audioUrl,
            isUser: true,
            timestamp: now,
            contentType: 'voice',
            duration: voiceDuration,
        };
        newMessagesToAdd.push(userVoiceMessage);
        console.log("[handleSendMessage] 创建了用户语音消息:", userVoiceMessage.id, `时长: ${voiceDuration}s`, `URL: ${audioUrl}`);
    }
    else if (userMessageText) {
        const userTextMessage: ChatMessage = {
            id: generateUniqueId(),
            text: userMessageText,
            isUser: true,
            timestamp: now,
            contentType: 'text',
            duration: undefined,
        };
        newMessagesToAdd.push(userTextMessage);
        console.log("[handleSendMessage] 创建了用户文本消息:", userTextMessage.id);
    }

    if (hasImage && imageUrl) {
        const userImageMessage: ChatMessage = {
            id: generateUniqueId(),
            text: imageUrl,
            isUser: true,
            timestamp: new Date(now.getTime() + (newMessagesToAdd.length > 0 ? 1 : 0)),
            contentType: 'image',
            duration: undefined,
        };
        newMessagesToAdd.push(userImageMessage);
        console.log("[handleSendMessage] 创建了用户图片消息:", userImageMessage.id);
    }

    if (newMessagesToAdd.length > 0) {
        setMessages(prevMessages => [...prevMessages, ...newMessagesToAdd]);
        // --- 移除 setAssistants ---
        console.log(`[handleSendMessage] ${newMessagesToAdd.length} 条用户消息已添加到 UI`);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    try {
      let contentToSend = userMessageText;
      let imageUrlToSend = imageUrl;
      let audioUrlToSend = null;
      let audioDurationToSend = null;

      if (isVoiceMessage) {
          contentToSend = null;
          imageUrlToSend = null;
          audioUrlToSend = audioUrl;
          audioDurationToSend = voiceDuration ? Math.round(voiceDuration) : null;
          console.log(`[handleSendMessage] 发送语音到 stream 接口 (时长已取整): ${audioDurationToSend}s`);
      } else {
          contentToSend = userMessageText;
          imageUrlToSend = imageUrl;
          audioUrlToSend = null;
          audioDurationToSend = null;
      }

      await sendMessageToBackend(contentToSend, currentDoctorInfo.sessionId, imageUrlToSend, audioUrlToSend, audioDurationToSend);

      console.log("[handleSendMessage] sendMessageToBackend 调用完成");

    } catch (error) {
      console.error('[handleSendMessage] 发送消息过程中出错:', error);
      // sendMessageToBackend 内部已经处理了错误toast和清理失败消息
    } finally {
       setIsSubmitting(false);
       console.log("[handleSendMessage] 发送流程结束，isSubmitting 设置为 false");
       // --- 移除 setAssistants sort ---
    }

  }, [isSubmitting, isLoadingSession, doctorInfo, sendMessageToBackend, stopTTS]); // 依赖 doctorInfo

  // --- handleStopGenerating 基本保持不变，但使用 doctorInfo ---
  const handleStopGenerating = useCallback(() => {
    console.log("[handleStopGenerating] 用户请求停止生成...");
    setIsSubmitting(false);
    stopTTS();

    // --- 清理防抖计时器 ---
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (streamingMessageIdRef.current) {
      const messageIdToStop = streamingMessageIdRef.current;
      console.log(`[handleStopGenerating] 标记消息 ${messageIdToStop} 为已停止`);
      // 使用累积的文本并标记为停止
      setMessages(prevMessages => prevMessages.map(msg => {
          if (msg.id === messageIdToStop) {
              // 使用 streamingTextRef.current 获取到目前为止收到的文本
              return { ...msg, text: streamingTextRef.current + " (已停止)", isGenerating: false };
          }
          return msg;
      }));
      streamingMessageIdRef.current = null; // 清空ID
      streamingTextRef.current = ''; // 清空累积文本
    } else {
         console.log("[handleStopGenerating] 没有进行中的流式消息 ID，尝试移除最后一条可能存在的生成中 AI 消息");
          // 如果没有流式ID，但可能存在占位符（网络延迟等情况），尝试移除
          setMessages(prevMessages => prevMessages.filter(m => !(m.isGenerating && !m.isUser)));
          console.log("[handleStopGenerating] 尝试移除了所有 isGenerating=true 的 AI 消息");
    }
     // --- 移除 setAssistants ---
  }, [stopTTS]); // 移除 activeAssistantId, 依赖 stopTTS

  const handleCommonQuestionClick = (question: string) => {
    if (!doctorInfo || !doctorInfo.sessionId || isLoadingSession) {
        toast({description: isLoadingSession ? "正在连接医生..." : "请等待连接建立...", duration: 1500});
        return;
    }
    console.log(`[handleCommonQuestionClick] 点击了问题: ${question}`);
    handleSendMessage(question);
  };

  // --- handleClearChat 基本保持不变，但使用 doctorInfo ---
  const handleClearChat = useCallback(async () => {
    const currentDoctorInfo = doctorInfo;
    if (!currentDoctorInfo) {
        console.error("[handleClearChat] 找不到医生信息");
        setShowClearConfirmDialog(false);
        return;
    }
     console.log(`[handleClearChat] 准备清除医生 ${currentDoctorInfo.name} 的聊天记录`);
    setShowClearConfirmDialog(false);
    stopTTS();
    handleStopGenerating(); // 停止可能在进行的生成

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingVoiceMessageId(null); // 清除播放状态
    }

    try {
      if (currentDoctorInfo.sessionId) {
        console.log(`[handleClearChat] 调用后端 API 删除 session ${currentDoctorInfo.sessionId} 的消息`);
        await axios.delete(`${apiBaseUrl}/chat/messages/${currentDoctorInfo.sessionId}`, {
             headers: { 'Authorization': `Bearer ${useAuthStore.getState().accessToken}` }
        });
         console.log(`[handleClearChat] 后端消息删除成功 (session: ${currentDoctorInfo.sessionId})`);
      } else {
          console.log("[handleClearChat] 医生没有 sessionId，跳过后端删除");
      }

      const initialMessages = currentDoctorInfo.intro ? [
          { id: `${currentDoctorInfo.agentId}-init-1`, text: currentDoctorInfo.intro, isUser: false, timestamp: new Date(), contentType: 'text' as const, duration: undefined }
      ] : [];
      console.log(`[handleClearChat] 重置前端消息为 ${initialMessages.length} 条初始消息`);
      setMessages([...initialMessages]);

      // --- 移除 setAssistants ---

      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
      toast({ description: "聊天记录已清除", duration: 2000 });
      console.log("[handleClearChat] 清除成功");

    } catch (error) {
      console.error('[handleClearChat] 清除聊天记录失败:', error);
      toast({
        title: "错误",
        description: "清除聊天记录失败，请稍后再试",
        variant: "destructive",
        duration: 2000,
      });
    }
  }, [doctorInfo, stopTTS, currentAudio, handleStopGenerating]); // 依赖 doctorInfo

  // --- handleCopyText, handlePlayTTS, handlePlayVoiceMessage 保持不变 ---
   const handleCopyText = (text: string) => {
    if (!text) {
       toast({ description: "没有内容可复制", variant: "destructive", duration: 2000 });
       return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ description: "已复制到剪贴板", duration: 2000 });
      })
      .catch(err => {
        console.error('复制失败:', err);
        toast({ description: "复制失败", variant: "destructive", duration: 2000 });
      });
  };

  // 修改：传递voiceType参数
  const handlePlayTTS = (text: string, messageId: string) => {
      if (!text || text.trim() === '') {
           toast({ description: "没有文本内容可播放", variant: "destructive", duration: 2000 });
           return;
      }
      if (currentAudio) { // 停止语音播放
        currentAudio.pause();
        setCurrentAudio(null);
        setPlayingVoiceMessageId(null);
      }
      const voiceType = doctorInfo?.voiceType;
      // 过滤掉所有的*，防止markdown星号被读出来
      const filteredText = text.replaceAll('*', '');
      if (ttsPlayingMessageId === messageId && (isTTSPlaying || isTTSLoading)) {
        console.log(`[DoctorChat] Stopping TTS for message ID: ${messageId}`);
        stopTTS();
      } else {
        console.log(`[DoctorChat] Requesting TTS for message ID: ${messageId}, Text: ${filteredText.substring(0, 50)}..., voiceType: ${voiceType}`);
        playTTS(filteredText, messageId, voiceType);
      }
  };

  const handlePlayVoiceMessage = (audioSrc: string, messageId: string) => {
    console.log(`[handlePlayVoiceMessage] Clicked message ID: ${messageId}, audioSrc: ${audioSrc}`);
    stopTTS(); // Stop any ongoing TTS

    if (!audioSrc || typeof audioSrc !== 'string') {
        console.error("无效的音频源:", audioSrc);
        toast({ title: "播放错误", description: "无法找到有效的音频文件路径或URL", variant: "destructive", duration: 2000 });
        return;
    }

    try {
        // Simple check if it looks like a relative/absolute path vs a URL
        if (audioSrc.startsWith('/') || /^[a-zA-Z]:\\/.test(audioSrc)) {
            console.warn(`[handlePlayVoiceMessage] 音频源 (${audioSrc}) 看起来不是一个可直接播放的 URL。如果播放失败，请确保后端返回的是完整的 URL。`);
            // Don't toast here, let the browser try first.
        }

        if (currentAudio) {
            // Check if clicking the currently playing/paused audio
             const isSameAudio = currentAudio.src.endsWith(encodeURIComponent(audioSrc.split('/').pop() || '')) || currentAudio.src === audioSrc;

            if (isSameAudio && !currentAudio.paused) {
                console.log("[handlePlayVoiceMessage] Pausing current audio");
                currentAudio.pause();
                setPlayingVoiceMessageId(null);
            } else if (isSameAudio && currentAudio.paused) {
                 console.log("[handlePlayVoiceMessage] Resuming paused audio");
                 setPlayingVoiceMessageId(messageId);
                 currentAudio.play().catch(e => {
                    console.error("恢复播放音频失败:", e);
                    toast({ title: "播放错误", description: `无法播放音频: ${(e as Error).message}`, variant: "destructive" });
                    setCurrentAudio(null);
                    setPlayingVoiceMessageId(null);
                 });
            }
            else {
                console.log("[handlePlayVoiceMessage] Stopping previous audio and playing new one");
                currentAudio.pause();
                const newAudio = new Audio(audioSrc);
                setCurrentAudio(newAudio);
                setPlayingVoiceMessageId(messageId);
                newAudio.play().catch(e => {
                    console.error("播放音频失败:", e);
                    toast({ title: "播放错误", description: `无法播放音频: ${(e as Error).message}`, variant: "destructive" });
                    setCurrentAudio(null);
                    setPlayingVoiceMessageId(null);
                });
                newAudio.onended = () => {
                    console.log("[handlePlayVoiceMessage] Audio ended");
                    setCurrentAudio(null);
                    setPlayingVoiceMessageId(null);
                };
                newAudio.onerror = (e) => {
                   console.error("[handlePlayVoiceMessage] Audio error:", e);
                   toast({ title: "播放错误", description: "加载或播放音频时出错", variant: "destructive" });
                   setCurrentAudio(null);
                   setPlayingVoiceMessageId(null);
                }
            }
        } else {
            console.log("[handlePlayVoiceMessage] Playing new audio");
            const newAudio = new Audio(audioSrc);
            setCurrentAudio(newAudio);
            setPlayingVoiceMessageId(messageId);
            newAudio.play().catch(e => {
                console.error("播放音频失败:", e);
                toast({ title: "播放错误", description: `无法播放音频: ${(e as Error).message}`, variant: "destructive" });
                setCurrentAudio(null);
                setPlayingVoiceMessageId(null);
            });
            newAudio.onended = () => {
                console.log("[handlePlayVoiceMessage] Audio ended");
                setCurrentAudio(null);
                setPlayingVoiceMessageId(null);
            };
            newAudio.onerror = (e) => {
              console.error("[handlePlayVoiceMessage] Audio error:", e);
              toast({ title: "播放错误", description: "加载或播放音频时出错", variant: "destructive" });
              setCurrentAudio(null);
              setPlayingVoiceMessageId(null);
             }
        }
    } catch (error) {
        console.error("创建 Audio 对象失败:", error);
        toast({ title: "播放错误", description: `无效的音频源格式: ${audioSrc}`, variant: "destructive" });
        setCurrentAudio(null);
        setPlayingVoiceMessageId(null);
    }
  };

  // --- 移除处理 location.state 的 useEffect ---
  // --- 移除处理 queuedMessage 的 useEffect ---

  // --- 滚动到底部 useEffect 保持不变 ---
  // useEffect(() => {
  //   requestAnimationFrame(() => {
  //       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //   });
  // }, [messages]); // 这个可以注释掉或移除，因为滚动逻辑移到了防抖更新和发送消息后

  // --- 移除 activeAssistantId 变化的 useEffect ---
  // --- 移除 pendingImageUrl 变化的 useEffect ---

  const goBack = () => {
    navigate(-1); // 返回上一页
  };

  const currentCommonQuestions = doctorInfo?.agentId ? (doctorCommonQuestionsMap[doctorInfo.agentId] || []) : [];

  const firstAiMessage = messages.find(msg => !msg.isUser && msg.id.includes('-init-'));
  const chatMessages = messages.filter(msg => msg.id !== firstAiMessage?.id);

  const calcVoiceBarWidth = (sec: number): number => {
      const minPx = 70;
      const maxPx = 300; // 与 AIChat 保持一致
      const safeSec = Math.max(0, Math.min(sec, 60));
      return minPx + (maxPx - minPx) * (safeSec / 60);
  };

  return (
    // --- 修改: 使用 calc(100vh - 0px) 或具体值，取决于是否有底部导航栏 ---
    // 假设没有底部导航栏，则为 100vh
    <div className="flex flex-col h-screen bg-black text-white pb-4">
      {/* --- 修改: 顶部导航栏 --- */}
      <div className="flex items-center justify-between h-14 px-4 py-2 border-b border-gray-800 bg-black sticky top-0 z-20">
         <button onClick={goBack} className="p-2 text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
         </button>
         <h1 className="text-lg font-medium text-white">
            {doctorInfo ? doctorInfo.name : (isLoadingSession ? '加载中...' : '医生聊天')}
         </h1>
         <div className="w-10"></div> {/* 占位保持标题居中 */}
         {/* --- 移除 Sheet --- */}
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4 pt-0 mt-4 overscroll-y-contain">
        <div className="space-y-6">
          {/* --- 修改: 初始医生信息展示区 --- */}
          {doctorInfo && (
              <div className="flex flex-col items-center mb-4 pt-4">
                {/* 新风格医生信息卡片 - 深色版 */}
                <div className="bg-[#23263a] rounded-2xl shadow-xl p-6 flex flex-col items-center max-w-md mx-auto w-full relative border border-blue-900">
                  {/* 头像区 */}
                  <div className="relative w-24 h-24 mb-2">
                    <img
                      src={doctorInfo.avatar}
                      alt={doctorInfo.name}
                      className="w-24 h-24 rounded-full border-4 border-blue-800 shadow-lg object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/数字医生1.jpg'; }}
                    />
                    {/* AI标识 */}
                    <span className="absolute right-0 bottom-0 bg-green-900/80 text-green-200 text-xs rounded-full px-2 py-0.5 shadow font-semibold border border-green-700">AI</span>
                    {/* 认证标识 */}
                    <span className="absolute left-0 bottom-0 bg-blue-900/80 text-blue-200 text-xs rounded-full px-2 py-0.5 shadow font-semibold border border-blue-700">已认证</span>
                  </div>
                  {/* 医生姓名 */}
                  <div className="text-xl font-bold text-white mt-1">{doctorInfo.name}</div>
                  {/* 职称/科室/医院（可选） */}
                  {doctorInfo.specialty && (
                    <div className="text-sm text-blue-200 mt-1 font-medium">{doctorInfo.specialty}</div>
                  )}
                  {/* 你可以根据 doctorInfo 结构补充更多字段，如 title/department/hospital，这里用默认值占位 */}
                  <div className="text-sm text-gray-300 mt-1">主任医师 · 心血管内科</div>
                  <div className="text-xs text-gray-400 mt-1">北京协和医院</div>
                  {/* 欢迎语 */}
                  <div className="bg-blue-900/80 text-blue-100 rounded-xl px-4 py-3 mt-4 w-full text-left text-base font-normal shadow border border-blue-800 flex items-center justify-between">
                    <span className="flex-1 break-words">{doctorInfo.intro}</span>
                    <button
                      onClick={() => handlePlayTTS(doctorInfo.intro, `${doctorInfo.agentId}-init-1`)}
                      className="ml-2 p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded flex-shrink-0"
                      title={ttsPlayingMessageId === `${doctorInfo.agentId}-init-1` && (isTTSPlaying || isTTSLoading) ? "停止" : "播放"}
                      disabled={!doctorInfo.intro}
                    >
                      {ttsPlayingMessageId === `${doctorInfo.agentId}-init-1` && isTTSLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : ttsPlayingMessageId === `${doctorInfo.agentId}-init-1` && isTTSPlaying ? (
                        <Square size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* 消息列表 */}
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end`}
              >
                 {/* AI 头像 */}
                 {!message.isUser && doctorInfo && (
                   <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 overflow-hidden border border-gray-600 self-start">
                     <img
                       src={doctorInfo.avatar}
                       alt={doctorInfo.name}
                       className="w-full h-full object-cover rounded-full"
                       onError={(e) => { (e.target as HTMLImageElement).src = '/数字医生1.jpg'; }}
                     />
                   </div>
                 )}

                 {/* 消息内容 */}
                 <div className={`flex flex-col max-w-[80%] ${message.isUser ? 'items-end' : 'items-start'}`}>
                   {/* 新增：思考中动画 */}
                   {message.isGenerating && !message.isUser && (!message.text || message.text.trim() === '') ? (
                     <div className="flex items-center px-4 py-2 rounded-xl shadow-md bg-[#333333] text-white">
                       <Loader2 size={18} className="animate-spin mr-2" />
                       <span>思考中{".".repeat(thinkingDotCount)}</span>
                     </div>
                   ) : message.contentType === 'image' ? (
                     <div className={`px-2 py-2 rounded-xl shadow-md ${message.isUser ? 'bg-blue-500' : 'bg-[#333333]'}`}>
                       <img
                         src={message.text}
                         alt={message.isUser ? "用户上传的图片" : "AI 返回的图片"}
                         className="max-w-xs max-h-64 object-contain rounded-lg cursor-pointer"
                         onClick={() => window.open(message.text, '_blank')}
                       />
                     </div>
                   ) : message.contentType === 'voice' && message.duration !== undefined ? (
                     <button
                       onClick={() => handlePlayVoiceMessage(message.text, message.id)}
                       className={`py-2 pl-3 pr-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                         message.isUser
                           ? 'bg-blue-500 text-white rounded-br-none'
                           : 'bg-[#333333] text-white rounded-bl-none'
                       }`}
                       style={{ width: `${calcVoiceBarWidth(Number(message.duration))}px` }}
                       title={`点击播放 ${Math.round(Number(message.duration))}s 语音`}
                     >
                       {message.isUser && <span className="text-sm mr-1">{Math.round(Number(message.duration))}"</span>}
                       <Volume2
                         size={16}
                         className={`${message.isUser ? 'ml-auto' : 'mr-1'} ${playingVoiceMessageId === message.id ? 'animate-voice-wave' : ''}`}
                       />
                       {!message.isUser && <span className="text-sm ml-1">{Math.round(Number(message.duration))}"</span>}
                     </button>
                   ) : (
                     message.text && (
                       <div
                         className={`px-4 py-2 rounded-xl shadow-md text-sm break-words ${
                           message.isUser
                             ? 'bg-blue-500 text-white rounded-br-none font-normal'
                             : 'bg-[#333333] text-white rounded-bl-none font-normal'
                         } ${message.isGenerating ? 'opacity-70' : ''}`} // 移除 isGenerating 时的特殊样式，由外部思考动画处理
                       >
                         {/* 即使在 isGenerating 期间，也用 MessageMarkdown 渲染累积的文本 */}
                         {!message.isUser ? (
                           <MessageMarkdown content={message.text} />
                         ) : (
                           <span>{message.text}</span> // 用户消息直接显示
                         )}
                       </div>
                     )
                   )}

                   {/* AI 消息操作按钮和时间戳 */}
                   {!message.isUser && !message.isGenerating && message.contentType === 'text' && message.text && (
                       <div className="flex items-center mt-1">
                         <div className="flex space-x-1 mr-2">
                           <button
                             onClick={() => handleCopyText(message.text)}
                             className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                             title="复制"
                           >
                             <Copy size={14} />
                           </button>
                           <button
                             onClick={() => handlePlayTTS(message.text, message.id)}
                             className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                             title={ttsPlayingMessageId === message.id && (isTTSPlaying || isTTSLoading) ? "停止" : "播放"}
                           >
                             {ttsPlayingMessageId === message.id && isTTSLoading ? (
                               <Loader2 size={14} className="animate-spin" />
                             ) : ttsPlayingMessageId === message.id && isTTSPlaying ? (
                               <Square size={14} />
                             ) : (
                               <Volume2 size={14} />
                             )}
                           </button>
                         </div>
                         <span className="text-xs text-gray-400">
                           {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                   )}
                   {/* 用户消息时间戳 */}
                   {message.isUser && !message.isGenerating && (message.contentType === 'text' || message.contentType === 'image' || message.contentType === 'voice') && (
                       <span className="text-xs text-gray-400 mt-1 self-end">
                           {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                   )}

                 </div>

                 {/* 用户头像 */}
                 {message.isUser && (
                    <Avatar className="ml-2 flex-shrink-0 w-8 h-8 self-start">
                      <AvatarFallback className="bg-gray-600">
                        <User size={18} className="text-white" />
                      </AvatarFallback>
                    </Avatar>
                 )}
               </div>
            ))}
          </div>

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} className="h-px" />
        </div>
      </div>

       {/* --- 修改: 输入区域 --- */}
       <div className="flex-shrink-0 sticky bottom-0 left-0 right-0 bg-black z-10 border-t border-gray-800">
          {/* 常用问题区域 */}
          <div className="flex items-center px-4 pt-2 pb-1">
              <ScrollArea className="flex-1 overflow-x-auto whitespace-nowrap py-1 pr-2">
                  <div className="flex space-x-2">
                      {currentCommonQuestions.map((question, index) => (
                          <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs px-3 py-1 border-gray-600 bg-[#262626] text-gray-300 hover:bg-gray-700 hover:text-white flex-shrink-0"
                              onClick={() => handleCommonQuestionClick(question)}
                              disabled={isSubmitting || messages.some(m => m.isGenerating && !m.isUser) || isLoadingSession}
                          >
                              {question}
                          </Button>
                      ))}
                  </div>
                  <style>{`
                    .overflow-x-auto::-webkit-scrollbar { display: none; }
                    .overflow-x-auto { -ms-overflow-style: none; scrollbar-width: none; }
                  `}</style>
              </ScrollArea>
              {/* 清除记录按钮 */}
              <AlertDialog open={showClearConfirmDialog} onOpenChange={setShowClearConfirmDialog}>
                  <AlertDialogTrigger asChild>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 hover:bg-transparent ml-2 flex-shrink-0"
                          aria-label="清除对话记录"
                           disabled={isSubmitting || messages.some(m => m.isGenerating && !m.isUser) || isLoadingSession}
                      >
                          <Trash2 size={18} />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1f1f1f] text-white border-gray-700">
                      <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">清除记录</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                              确定要清除与 <span className='font-bold'>{doctorInfo?.name || '此医生'}</span> 的对话记录吗？此操作不可恢复。
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleClearChat}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            确认清除
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </div>
         {/* ChatInput 组件 */}
         <ChatInput
           onSendMessage={handleSendMessage}
           // --- 修改: isGenerating 状态包含 isLoadingSession ---
           isGenerating={isSubmitting || messages.some(m => m.isGenerating && !m.isUser) || isLoadingSession}
           onStopGenerating={handleStopGenerating}
           assistantName={doctorInfo?.name || '医生'}
           // --- 移除 initialImageUrl 和 initialText ---
           // 这两个 prop 主要用于 AIChat 中跨 agent 传递图片/消息，这里不需要
         />
       </div>
    </div>
  );
};

export default DoctorChat;
