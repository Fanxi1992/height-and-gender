import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, MessageCircle, Trash2, MessageSquarePlus, User, Copy, Volume2, Square, Loader2, Play, ArrowDown } from 'lucide-react';
import ChatInput, { VoicePayload } from '../components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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

enum AgentType {
  COMMON = "common_agent",
  NUTRITION = "nutrition_assistant",
  RECIPE = "recipe_master",
  TONGUE = "tongue_diagnosis_agent",
  FACE = "face_diagnosis_agent",
  MEDICAL_REPORT = "medical_report_agent",
}

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

interface AIAssistant {
  id: string;
  name: string;
  avatar: string;
  intro: string;
  specialty: string;
  messages: ChatMessage[];
  date: Date;
  initialMessages: ChatMessage[];
  sessionId?: string;
  agentType: AgentType;
  voiceType: string; // 新增字段
}

const commonQuestionsMap: Record<AgentType, string[]> = {
    [AgentType.COMMON]: [
      "健康的体重范围是多少？",
      "如何预防常见的慢性病？",
      "日常压力过大怎么办？",
      "失眠有什么好的缓解方法？",
      "推荐一些办公室拉伸动作。",
    ],
    [AgentType.NUTRITION]: [
      "如何计算食物的卡路里？",
      "帮我制定一份减脂餐单。",
      "增肌期间应该怎么吃？",
      "什么是平衡膳食？",
      "如何看懂食品营养标签？"
    ],
    [AgentType.RECIPE]: [
      "推荐几款适合高血压的家常菜。",
      "我想学做低脂又美味的甜点。",
      "有哪些适合健身后的快手营养餐？",
      "如何用简单的食材做出营养汤？",
      "素食者如何保证蛋白质摄入？"
    ],
    [AgentType.TONGUE]: [
      "舌苔发白可能是什么原因？",
      "正常的舌头应该是什么样的？",
      "舌头边缘有齿痕代表什么？",
      "如何通过舌诊判断是否有湿气？",
      "舌苔厚腻应该如何调理？"
    ],
    [AgentType.FACE]: [
      "面色发黄可能是什么健康问题？",
      "黑眼圈很重是怎么回事？",
      "如何通过面部气色判断健康？",
      "不同部位长痘代表什么？",
      "如何改善面部皮肤状态？"
    ],
    [AgentType.MEDICAL_REPORT]: [
       "手掌颜色异常代表什么？",
       "指甲上的月牙和竖纹说明什么？",
       "如何通过手掌温度判断体质？ ",
       "手掌不同区域对应哪些器官？",
       "手指形态与健康有关吗？"
    ]
};

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const createInitialMessages = (assistantName: string, intro: string): ChatMessage[] => [
    { id: `${assistantName}-init-1`, text: intro, isUser: false, timestamp: new Date(), contentType: 'text' },
  ];

  const initialAssistants: AIAssistant[] = [
      {
        id: '1',
        name: '门诊医生',
        avatar: '/AICAHT/医生头像.png',
        intro: '我是你的健康助手小张医生，很高兴见到你！我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问。',
        specialty: '常见疾病诊断、健康咨询、预防保健',
        messages: createInitialMessages('门诊医生', '我是你的健康助手小张医生，很高兴见到你！我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问。'),
        initialMessages: createInitialMessages('门诊医生', '我是你的健康助手小张医生，很高兴见到你！我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问。'),
        date: new Date(),
        agentType: AgentType.COMMON,
        voiceType: 'zh_male_shaonianzixin_moon_bigtts', // 新增
      },
      {
        id: '2',
        name: '卡路里专家',
        avatar: '/AICAHT/卡路里专家.png',
        intro: '我是卡路里计算专家，擅长个性化饮食计划。请告诉我你的身高、体重和活动水平，我会为你量身定制饮食方案。',
        specialty: '热量计算、减肥方案、代谢分析',
        messages: createInitialMessages('卡路里专家', '欢迎咨询卡路里专家，我可以帮你计算食物热量、制定减脂计划。请告诉我你的身高、体重和活动水平，我会为你量身定制饮食方案。'),
        initialMessages: createInitialMessages('卡路里专家', '欢迎咨询卡路里专家，我可以帮你计算食物热量、制定减脂计划。请告诉我你的身高、体重和活动水平，我会为你量身定制饮食方案。'),
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        agentType: AgentType.NUTRITION,
        voiceType: 'zh_male_yangguangqingnian_moon_bigtts', // 新增
      },
      {
          id: '3',
          name: '菜谱大师',
          avatar: '/AICAHT/菜谱大师.png',
          intro: '我是健康菜谱大师，可以根据你的口味偏好和营养需求，推荐适合你的菜谱。无论你是想减肥、增肌，还是有特殊饮食限制，我都能为你提供美味又营养的食谱建议。',
          specialty: '个性化食谱、营养均衡餐、特殊饮食需求',
          messages: createInitialMessages('菜谱大师', '我是健康菜谱大师，可以根据你的口味偏好和营养需求，推荐适合你的菜谱。无论你是想减肥、增肌，还是有特殊饮食限制，我都能为你提供美味又营养的食谱建议。'),
          initialMessages: createInitialMessages('菜谱大师', '我是健康菜谱大师，可以根据你的口味偏好和营养需求，推荐适合你的菜谱。无论你是想减肥、增肌，还是有特殊饮食限制，我都能为你提供美味又营养的食谱建议。'),
          date: new Date(new Date().setDate(new Date().getDate() - 2)),
          agentType: AgentType.RECIPE,
          voiceType: 'zh_male_wennuanahu_moon_bigtts', // 新增
      },
      {
          id: '4',
          name: '舌苔专家',
          avatar: '/AICAHT/舌苔专家.png',
          intro: '我是舌诊专家，通过观察舌头的颜色、形态、舌苔等特征，可以初步了解你的健康状况。你可以上传舌头照片，我会进行初步分析并给出健康建议。请注意我的分析仅供参考。',
          specialty: '舌诊分析、中医理论、健康建议',
          messages: createInitialMessages('舌苔专家', '我是舌诊专家，通过观察舌头的颜色、形态、舌苔等特征，可以初步了解你的健康状况。你可以上传舌头照片，我会进行初步分析并给出健康建议。请注意我的分析仅供参考。'),
          initialMessages: createInitialMessages('舌苔专家', '我是舌诊专家，通过观察舌头的颜色、形态、舌苔等特征，可以初步了解你的健康状况。你可以上传舌头照片，我会进行初步分析并给出健康建议。请注意我的分析仅供参考。'),
          date: new Date(new Date().setDate(new Date().getDate() - 3)),
          agentType: AgentType.TONGUE,
          voiceType: 'ICL_zh_male_youmodaye_tob', // 新增
      },
      {
          id: '5',
          name: '面诊专家',
          avatar: '/AICAHT/面诊专家.png',
          intro: '我是面诊专家，擅长通过面部特征分析健康状况。你可以上传面部照片，我会根据中医面诊理论进行初步分析。请记住，这只是健康参考，不能替代专业医疗诊断。',
          specialty: '面部分析、中医理论、健康状况评估',
          messages: createInitialMessages('面诊专家', '我是面诊专家，擅长通过面部特征分析健康状况。你可以上传面部照片，我会根据中医面诊理论进行初步分析。请记住，这只是健康参考，不能替代专业医疗诊断。'),
          initialMessages: createInitialMessages('面诊专家', '我是面诊专家，擅长通过面部特征分析健康状况。你可以上传面部照片，我会根据中医面诊理论进行初步分析。请记住，这只是健康参考，不能替代专业医疗诊断。'),
          date: new Date(new Date().setDate(new Date().getDate() - 5)),
          agentType: AgentType.FACE,
          voiceType: 'zh_female_popo_mars_bigtts', // 新增
      },
      {
          id: '6',
          name: '手诊专家',
          avatar: '/AICAHT/手诊专家.png',
          intro: '我是手诊专家，透过你的手掌，读懂健康的信号。你可以上传手掌照片，我会根据中医手诊理论进行初步分析。请记住，这只是健康参考，不能替代专业医疗诊断。',
          specialty: '手诊分析、中医理论、健康建议',
          messages: createInitialMessages('手诊专家', '我是手诊专家，透过你的手掌，读懂健康的信号。你可以上传手掌照片，我会根据中医手诊理论进行初步分析。请记住，这只是健康参考，不能替代专业医疗诊断。'),
          initialMessages: createInitialMessages('手诊专家', '我是手诊专家，透过你的手掌，读懂健康的信号。你可以上传手掌照片，我会根据中医手诊理论进行初步分析。请记住，这只是健康参考，不能替代专业医疗诊断。'),
          date: new Date(new Date().setDate(new Date().getDate() - 7)),
          agentType: AgentType.MEDICAL_REPORT,
          voiceType: 'zh_male_sunwukong_mars_bigtts', // 新增
      }
    ];

  const [assistants, setAssistants] = useState<AIAssistant[]>(initialAssistants);
  const [activeAssistantId, setActiveAssistantId] = useState<string>(initialAssistants[0]?.id || '1');
  const [messages, setMessages] = useState<ChatMessage[]>(
    assistants.find(a => a.id === activeAssistantId)?.messages || initialAssistants[0]?.messages || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pendingTargetAssistant, setPendingTargetAssistant] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [externalImageUrl, setExternalImageUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVoiceMessageId, setPlayingVoiceMessageId] = useState<string | null>(null);
  const [thinkingDotCount, setThinkingDotCount] = useState(1);

  // --- 新增: 用于滚动到底部按钮的状态和 Ref ---
  const [showScrollToBottom, setShowScrollToBottom] = useState(true); // 修改默认为 true
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  // --- 滚动到底部按钮结束 ---

  // --- 新增: 用于流式渲染防抖的 Ref ---
  const streamingTextRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousAssistantIdRef = useRef<string | null>(null); // <--- 新增 Ref

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

  const fetchMessages = useCallback(async (sessionId: string, assistant: AIAssistant | undefined) => {
    try {
      console.log(`[fetchMessages] 开始获取会话 ${sessionId} 的消息，助手: ${assistant?.name || '未知'}`);
      const initialMsgs = assistant?.initialMessages || [];

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
            textContent = msg.content || '';
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
          const cleanedInitialMsgs = initialMsgs.map(im => ({ ...im, duration: undefined }));
          finalMessages = [...cleanedInitialMsgs, ...convertedMessages]
                            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        } else {
          console.log(`[fetchMessages] 后端消息为空，仅使用 ${initialMsgs.length} 条初始消息`);
          finalMessages = initialMsgs.map(im => ({ ...im, duration: undefined }));
        }
        setMessages(finalMessages);

        setAssistants(prevAssistants =>
          prevAssistants.map(a =>
            a.sessionId === sessionId ? { ...a, messages: finalMessages } : a
          )
        );

      } else {
          console.warn(`[fetchMessages] API 响应无效或数据为空，session: ${sessionId}。响应数据:`, response.data);
          const cleanedInitialMsgs = initialMsgs.map(im => ({ ...im, duration: undefined }));
          setMessages(cleanedInitialMsgs);
          setAssistants(prevAssistants => prevAssistants.map(a => a.sessionId === sessionId ? { ...a, messages: cleanedInitialMsgs } : a));
      }
    } catch (error) {
      console.error('[fetchMessages] 获取消息失败:', error);
      toast({
        title: "错误",
        description: "获取消息历史失败，请稍后再试",
        variant: "destructive",
        duration: 2000,
      });
      const initialMsgsOnError = (assistant?.initialMessages || []).map(im => ({ ...im, duration: undefined }));
      setMessages(initialMsgsOnError);
      setAssistants(prevAssistants => prevAssistants.map(a => a.sessionId === sessionId ? { ...a, messages: initialMsgsOnError } : a));
    }
  }, []);

  useEffect(() => {
    console.log("组件开始挂载，开始问后端要sessionid");
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/chat/sessions`, {
          headers: {
            'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
          }
        });

        const sessions = response.data?.data;
        console.log("后端返回的sessions数据：", sessions);

        if (!sessions || !Array.isArray(sessions)) {
          console.warn("❌ sessions 数据为空或格式异常");
          const currentActiveInitial = initialAssistants.find(a => a.id === activeAssistantId);
          if (currentActiveInitial) {
            setMessages(currentActiveInitial.initialMessages.map(im => ({ ...im, duration: undefined })));
          }
          return;
        }

        let activeAssistantHasSession = false;
        let activeSessionId: string | undefined = undefined;
        let currentActiveAssistant: AIAssistant | undefined = undefined;

        const updatedAssistants = initialAssistants.map(assistant => {
          const matchedSession = sessions.find((s: any) => s.agent === assistant.agentType);
          let newAssistantData = { ...assistant };
          if (matchedSession) {
            console.log(`✅ 匹配成功: ${assistant.name} -> ${matchedSession.session_id}`);
            newAssistantData = { ...assistant, sessionId: matchedSession.session_id };
            if (assistant.id === activeAssistantId) {
                activeAssistantHasSession = true;
                activeSessionId = matchedSession.session_id;
                currentActiveAssistant = newAssistantData;
            }
          } else {
            console.warn(`⚠️ 未匹配: ${assistant.name} (${assistant.agentType})`);
          }
          return newAssistantData;
        });

        console.log("✅ 更新后的助手列表:", updatedAssistants);
        setAssistants(updatedAssistants);

        if (activeAssistantHasSession && activeSessionId && currentActiveAssistant) {
          console.log(`📥 正在拉取 ${currentActiveAssistant.name} 的消息，sessionId: ${activeSessionId}`);
          fetchMessages(activeSessionId, currentActiveAssistant);
        } else {
          const assistantToUse = updatedAssistants.find(a => a.id === activeAssistantId) || initialAssistants.find(a => a.id === activeAssistantId);
          console.log(`⚠️ 当前助手 ${assistantToUse?.name || '未知'} 没有 sessionId 或未匹配，将使用初始消息`);
          setMessages(assistantToUse?.initialMessages.map(im => ({ ...im, duration: undefined })) || []);
        }

      } catch (error) {
        console.error("获取会话失败:", error);
        toast({
          title: "错误",
          description: "获取会话失败，请稍后再试",
          variant: "destructive",
          duration: 2000,
        });
        const currentActiveInitial = initialAssistants.find(a => a.id === activeAssistantId);
        if (currentActiveInitial) {
          setMessages(currentActiveInitial.initialMessages.map(im => ({ ...im, duration: undefined })));
        }
      }
    };
    fetchSessions();
  }, [activeAssistantId, fetchMessages]);

    // --- 新增: 组件卸载时清理防抖计时器 ---
    useEffect(() => {
      return () => {
          if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
          }
      };
    }, []);

  const getOrCreateSessionId = async (assistant: AIAssistant): Promise<string> => {
      const currentAssistantState = assistants.find(a => a.id === assistant.id);
      if (currentAssistantState?.sessionId) {
         console.log('[getOrCreateSessionId] 从 state 中找到已有 sessionId:', currentAssistantState.sessionId);
         return currentAssistantState.sessionId;
      }

      console.log(`[getOrCreateSessionId] 助手 ${assistant.name} 没有 sessionId，尝试创建...`);
      try {
        const response = await axios.post(`${apiBaseUrl}/chat/sessions`, {
          agent: assistant.agentType,
          session_name: assistant.name
        }, {
          headers: {
            'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
          }
        });

        if (response.data && response.data.success && response.data.data) {
          const sessionId = response.data.data.session_id;
          console.log(`[getOrCreateSessionId] 成功创建会话: ${sessionId} 为助手: ${assistant.name}`);
          setAssistants(prevAssistants =>
            prevAssistants.map(a =>
              a.id === assistant.id ? { ...a, sessionId: sessionId } : a
            )
          );
          return sessionId;
        } else {
          console.error('[getOrCreateSessionId] 创建会话 API 返回失败:', response.data);
          throw new Error('创建会话失败');
        }
      } catch (error) {
        console.error('[getOrCreateSessionId] 创建会话ID时发生网络或处理错误:', error);
        throw error;
      }
    };

  const generateUniqueId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  };

  const handleSelectAssistant = useCallback((assistant: AIAssistant) => {
    if (assistant.id === activeAssistantId) {
      console.log(`[handleSelectAssistant] 选择的是当前助手 ${assistant.name}，跳过处理`);
      return;
    }

    console.log(`[handleSelectAssistant] 选择助手: ${assistant.name}, ID: ${assistant.id}, SessionId: ${assistant.sessionId}`);
    setActiveAssistantId(assistant.id);
    setIsSidebarOpen(false);
    stopTTS();
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  }, [activeAssistantId, stopTTS, currentAudio]);

  // --- 修改: 应用渲染防抖 ---
  const sendMessageToBackend = async (
    message: string | null,
    sessionId: string,
    imageUrl?: string | null,
    audioUrl?: string | null,
    audioDuration?: number | null
  ) => {
    console.log(`[sendMessageToBackend] 开始发送消息到 session: ${sessionId}, 图片 URL: ${imageUrl}, 音频 URL: ${audioUrl}, 音频时长: ${audioDuration}`);
    let response: Response | null = null;
    const currentStreamingMessageId = generateUniqueId();
    streamingMessageIdRef.current = currentStreamingMessageId;
    streamingTextRef.current = ''; // 重置累积文本
    if (debounceTimerRef.current) { // 清理旧计时器
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // --- 移除 aiResponseText ---
    const finalContentType: 'text' = 'text';

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
        contentType: 'text',
        isGenerating: true,
      };
      // 同时更新 messages 和 assistants 状态
      setMessages(prevMessages => [...prevMessages, aiPlaceholderMessage]);
      setAssistants(prevAssistants =>
           prevAssistants.map(assistant =>
               assistant.id === activeAssistantId
                   ? { ...assistant, messages: [...(assistant.messages || []), aiPlaceholderMessage] }
                   : assistant
           )
       );

      console.log(`[sendMessageToBackend] 添加了 ID 为 ${currentStreamingMessageId} 的初始 AI 消息占位符`);
      // --- 滚动逻辑移到防抖更新后 ---

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamEnded = false;

      while (!streamEnded) {
        const { done, value } = await reader.read();
        if (done) {
          streamEnded = true;
          console.log("[sendMessageToBackend] 流读取完成 (done=true)");
        }

        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split('\n');
        buffer = (!done && lines.length > 1) ? lines.pop() || '' : '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const jsonData = JSON.parse(line.slice(6));
                    // console.log("[sendMessageToBackend] Parsed data:", jsonData);

                    if (jsonData.event === 'cmpl' && typeof jsonData.text === 'string') {
                        // --- 修改: 使用防抖更新 ---
                        streamingTextRef.current += jsonData.text; // 累加文本

                        if (debounceTimerRef.current) {
                          clearTimeout(debounceTimerRef.current); // 清除旧计时器
                        }
                        debounceTimerRef.current = setTimeout(() => {
                          if (!streamingMessageIdRef.current) return; // 如果在延迟期间被停止，则不更新
                          // 更新 messages 状态
                          setMessages(prevMessages => prevMessages.map(msg =>
                            msg.id === streamingMessageIdRef.current
                              ? { ...msg, text: streamingTextRef.current } // 只更新文本
                              : msg
                          ));
                          // 更新 assistants 中对应助手的 messages
                          setAssistants(prevAssistants => prevAssistants.map(a => {
                              if (a.id === activeAssistantId) {
                                  return {
                                      ...a,
                                      messages: (a.messages || []).map(msg =>
                                          msg.id === streamingMessageIdRef.current
                                          ? { ...msg, text: streamingTextRef.current }
                                          : msg
                                      )
                                  };
                              }
                              return a;
                          }));

                           // --- 滚动逻辑移到防抖更新后 ---
                           requestAnimationFrame(() => {
                               // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                               scrollToBottom('smooth'); // 平滑滚动到底部
                           });
                           debounceTimerRef.current = null; // 清除计时器引用
                        }, 50); // 防抖时间 150ms

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
        if (buffer.includes('"event":"all_done"')) {
          streamEnded = true;
        }
      } // end while loop

      console.log(`[sendMessageToBackend] 流处理结束。最终累积文本长度: ${streamingTextRef.current.length}`);

      // --- 修改: 流结束后进行最终更新 ---
      if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
      }

      const finalMessageId = streamingMessageIdRef.current; // 捕获当前ID
      if (finalMessageId) {
        console.log(`[sendMessageToBackend] 执行最终状态更新 for message ID: ${finalMessageId}`);
        const finalAiMessage: ChatMessage = {
          id: finalMessageId,
          text: streamingTextRef.current, // 使用最终累积的文本
          isUser: false,
          timestamp: new Date(),
          contentType: finalContentType,
          isGenerating: false, // 标记生成结束
        };

        // 更新 messages 状态
        setMessages(prevMessages => prevMessages.map(msg =>
          msg.id === finalMessageId
            ? finalAiMessage
            : msg
        ));

        // 更新 assistants 中对应助手的 messages
        setAssistants(prevAssistants => {
          const updatedAssistants = prevAssistants.map(assistant => {
            if (assistant.id === activeAssistantId) {
              const updatedAssistantMessages = (assistant.messages || []).map(msg =>
                  msg.id === finalMessageId ? finalAiMessage : msg
              );
              // 确保消息存在
              if (!updatedAssistantMessages.some(m => m.id === finalAiMessage.id)) {
                 // 理论上不应该发生，因为占位符已存在，这里是防御性代码
                 updatedAssistantMessages.push(finalAiMessage);
                 console.warn(`[sendMessageToBackend] 防御性添加最终消息 ${finalAiMessage.id} 到 assistants 状态`);
              }
              return {
                ...assistant,
                messages: updatedAssistantMessages,
                date: new Date() // 更新会话日期
              };
            }
            return assistant;
          });
          // 重新排序
          return updatedAssistants.sort((a, b) => b.date.getTime() - a.date.getTime());
        });

      } else {
          console.warn("[sendMessageToBackend] 流结束后，streamingMessageIdRef.current 为空，无法执行最终更新");
      }

      streamingMessageIdRef.current = null; // 清空流消息 ID
      streamingTextRef.current = ''; // 清空累积文本

      // --- 确保最终滚动 ---
      // --- 修改：使用 scrollToBottom 函数 ---
      setTimeout(() => scrollToBottom('smooth'), 100);
      // setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);

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
        // 从 messages 移除
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== failedMessageId));
        // 从 assistants 移除
        setAssistants(prevAssistants =>
            prevAssistants.map(assistant =>
                assistant.id === activeAssistantId
                    ? { ...assistant, messages: (assistant.messages || []).filter(msg => msg.id !== failedMessageId) }
                    : assistant
            )
        );
        streamingMessageIdRef.current = null;
      }
      streamingTextRef.current = ''; // 清空累积文本
      throw error; // Re-throw to be caught by handleSendMessage
    }
  };

  const handleSendMessage = useCallback(async (messageOrPayload: string | VoicePayload, imageUrl?: string | null) => {
    if (isSubmitting) {
      console.log("[handleSendMessage] 正在提交中，忽略本次发送请求");
      return;
    }

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
    stopTTS(); // 发送前停止TTS

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
        // 同时更新 messages 和 assistants 状态
        setMessages(prevMessages => [...prevMessages, ...newMessagesToAdd]);
        setAssistants(prevAssistants =>
            prevAssistants.map(assistant =>
                assistant.id === activeAssistantId
                    ? { ...assistant, messages: [...(assistant.messages || []), ...newMessagesToAdd] }
                    : assistant
            )
        );
        console.log(`[handleSendMessage] ${newMessagesToAdd.length} 条用户消息已添加到 UI 和 assistants 状态`);
        // --- 修改：使用 scrollToBottom 函数 ---
        setTimeout(() => scrollToBottom('smooth'), 100);
        // setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    const activeAssistant = assistants.find(a => a.id === activeAssistantId);
    if (!activeAssistant) {
      console.error('[handleSendMessage] 严重错误：找不到活跃的助手！ ID:', activeAssistantId);
      toast({ title: "错误", description: "无法找到当前助手，请刷新页面", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    console.log(`[handleSendMessage] 当前活跃助手: ${activeAssistant.name}`);

    try {
      console.log('[handleSendMessage] 准备获取或创建 sessionId...');
      const sessionId = await getOrCreateSessionId(activeAssistant);
      console.log(`[handleSendMessage] 获取到 sessionId: ${sessionId}`);

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

      await sendMessageToBackend(contentToSend, sessionId, imageUrlToSend, audioUrlToSend, audioDurationToSend);

      console.log("[handleSendMessage] sendMessageToBackend 调用完成");

    } catch (error) {
      console.error('[handleSendMessage] 获取 sessionId 或发送消息过程中出错:', error);
      // sendMessageToBackend 内部已处理错误
    } finally {
       setIsSubmitting(false);
       console.log("[handleSendMessage] 发送流程结束，isSubmitting 设置为 false");
       // 更新助手日期并排序（已移至 sendMessageToBackend 的成功回调中）
       // setAssistants(prev => [...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    }

  }, [isSubmitting, activeAssistantId, assistants, getOrCreateSessionId, sendMessageToBackend, stopTTS]);

  // --- 修改: 应用渲染防抖 ---
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
      let stoppedText = '';
      // 使用 streamingTextRef.current 获取已累积的文本
      stoppedText = streamingTextRef.current + " (已停止)";
      console.log(`[handleStopGenerating] 标记消息 ${messageIdToStop} 为已停止, 内容:`, stoppedText.substring(0,50)+"...");

      const stoppedMessage: ChatMessage = {
          id: messageIdToStop,
          text: stoppedText,
          isUser: false,
          timestamp: new Date(), // 时间戳可以保留或更新
          contentType: 'text',
          isGenerating: false,
      };

      // 更新 messages 状态
      setMessages(prevMessages => prevMessages.map(msg =>
          msg.id === messageIdToStop ? stoppedMessage : msg
      ));
      // 更新 assistants 状态
      setAssistants(prevAssistants => prevAssistants.map(a => {
          if (a.id === activeAssistantId) {
              return {
                  ...a,
                  messages: (a.messages || []).map(msg =>
                      msg.id === messageIdToStop ? stoppedMessage : msg
                  )
              };
          }
          return a;
      }));

      streamingMessageIdRef.current = null; // 清空ID
      streamingTextRef.current = ''; // 清空累积文本
    } else {
         console.log("[handleStopGenerating] 没有进行中的流式消息 ID，尝试移除最后一条可能存在的生成中 AI 消息（以防万一）");
          let lastGeneratingMsgId: string | null = null;
          // 从 messages 移除
          setMessages(prevMessages => prevMessages.filter(m => {
             if (m.isGenerating && !m.isUser) {
                 lastGeneratingMsgId = m.id;
                 console.log(`[handleStopGenerating] 找到并准备移除占位消息: ${lastGeneratingMsgId}`);
                 return false;
             }
             return true;
          }));
          // 从 assistants 移除
           if (lastGeneratingMsgId) {
                const msgIdToRemove = lastGeneratingMsgId;
                setAssistants(prevAssistants => prevAssistants.map(a =>
                    a.id === activeAssistantId
                        ? { ...a, messages: (a.messages || []).filter(m => m.id !== msgIdToRemove) }
                        : a
                ));
                 console.log(`[handleStopGenerating] 从助手状态中移除了占位消息: ${msgIdToRemove}`);
           } else {
                console.log("[handleStopGenerating] 未找到需要移除的生成中消息");
           }
    }
  }, [activeAssistantId, stopTTS]);

  const handleCommonQuestionClick = (question: string) => {
    console.log(`[handleCommonQuestionClick] 点击了问题: ${question}`);
    handleSendMessage(question);
  };

  // --- 修改: 应用渲染防抖 ---
  const handleClearChat = useCallback(async () => {
    const activeAssistant = assistants.find(a => a.id === activeAssistantId);
    if (!activeAssistant) {
        console.error("[handleClearChat] 找不到活跃助手");
        setShowClearConfirmDialog(false);
        return;
    }
     console.log(`[handleClearChat] 准备清除助手 ${activeAssistant.name} 的聊天记录`);
    setShowClearConfirmDialog(false);
    stopTTS();
    handleStopGenerating(); // 停止生成并清理相关状态

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingVoiceMessageId(null); // 清除播放状态
    }

    // --- 清理防抖计时器 ---
    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
    }
    streamingTextRef.current = ''; // 清空可能残留的文本

    try {
      if (activeAssistant.sessionId) {
        console.log(`[handleClearChat] 调用后端 API 删除 session ${activeAssistant.sessionId} 的消息`);
        await axios.delete(`${apiBaseUrl}/chat/messages/${activeAssistant.sessionId}`, {
             headers: { 'Authorization': `Bearer ${useAuthStore.getState().accessToken}` }
        });
         console.log(`[handleClearChat] 后端消息删除成功 (session: ${activeAssistant.sessionId})`);
      } else {
          console.log("[handleClearChat] 助手没有 sessionId，跳过后端删除");
      }

      const initialMessages = activeAssistant.initialMessages.map(im => ({ ...im, duration: undefined })) || [];
      console.log(`[handleClearChat] 重置前端消息为 ${initialMessages.length} 条初始消息`);
      setMessages([...initialMessages]); // 更新 messages 状态

      // 更新 assistants 状态
      setAssistants(prevAssistants => {
        const updatedAssistants = prevAssistants.map(assistant => {
          if (assistant.id === activeAssistantId) {
            console.log(`[handleClearChat] 更新助手 ${assistant.name} 在 assistants 列表中的消息`);
            return {
              ...assistant,
              messages: [...initialMessages],
              date: new Date() // 更新日期以便排序
            };
          }
          return assistant;
        });
        // 重新排序
        return updatedAssistants.sort((a, b) => b.date.getTime() - a.date.getTime());
      });

      // --- 修改：使用 scrollToBottom 函数 ---
      setTimeout(() => scrollToBottom('smooth'), 100);
      // setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
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
  }, [activeAssistantId, assistants, stopTTS, currentAudio, handleStopGenerating]); // 添加 handleStopGenerating 依赖

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
      const activeAssistant = assistants.find(a => a.id === activeAssistantId);
      const voiceType = activeAssistant?.voiceType;
      // 过滤掉所有的*，防止markdown星号被读出来
      const filteredText = text.replaceAll('*', '');
      if (ttsPlayingMessageId === messageId && (isTTSPlaying || isTTSLoading)) {
        console.log(`[AIChat] Stopping TTS for message ID: ${messageId}`);
        stopTTS();
      } else {
        console.log(`[AIChat] Requesting TTS for message ID: ${messageId}, Text: ${filteredText.substring(0, 50)}..., voiceType: ${voiceType}`);
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

  useEffect(() => {
    if (location.state) {
      const { initialMessage, targetAssistantId, imageUrl } = (location.state || {}) as { initialMessage?: string; targetAssistantId?: string; imageUrl?: string };
      let messageToQueue: string | null = null;
      let assistantToSet: string | null = null;
      let stateNeedsCleaning = false;
      let imageToSetExternally : string | null = null;

      console.log("[Effect location.state] 检测到 state:", location.state);

      if (targetAssistantId) {
          const targetAssistantExists = assistants.some(a => a.id === targetAssistantId);
          if (targetAssistantExists && targetAssistantId !== activeAssistantId) {
              console.log(`[Effect location.state] 需要切换到助手 ID: ${targetAssistantId}`);
              assistantToSet = targetAssistantId;
              stateNeedsCleaning = true;
          } else if (!targetAssistantExists) {
               console.warn(`[Effect location.state] 目标助手 ID "${targetAssistantId}" 不存在.`);
               stateNeedsCleaning = true;
          } else {
              console.log(`[Effect location.state] 目标助手 ${targetAssistantId} 已是当前助手`);
              if (initialMessage === undefined && imageUrl === undefined) stateNeedsCleaning = true;
          }
      }

      if (initialMessage && typeof initialMessage === 'string' && initialMessage.trim()) {
          console.log('[Effect location.state] 收到初始消息:', initialMessage.trim().substring(0,50) + '...');
          messageToQueue = initialMessage.trim();
          stateNeedsCleaning = true;
      } else if (initialMessage !== undefined) {
          stateNeedsCleaning = true;
      }

      if (imageUrl && typeof imageUrl === 'string') {
          console.log('[Effect location.state] 收到图片URL:', imageUrl);
          imageToSetExternally = imageUrl;
          stateNeedsCleaning = true;

          if (assistantToSet) {
              console.log(`[Effect location.state] 将图片和消息标记为待处理，等待助手 ${assistantToSet} 切换完成`);
              setPendingImageUrl(imageUrl);
              setPendingTargetAssistant(assistantToSet);
              setPendingMessage(messageToQueue); // messageToQueue 可能为 null
              setActiveAssistantId(assistantToSet); // 触发助手切换
              // 清理 state，防止重复处理
              navigate('.', { replace: true, state: {} });
              return; // 提前返回，等待 activeAssistantId 的 effect 处理 pending 状态
          }
          // 如果不需要切换助手，则直接设置图片URL
          console.log('[Effect location.state] 无需切换助手，直接设置外部图片 URL');
          setExternalImageUrl(imageToSetExternally);
          // 如果同时有消息，也设置为 pendingMessage，让 ChatInput 处理
          if (messageToQueue) {
             setPendingMessage(messageToQueue);
          }
      }
      // 如果只有消息或只有助手切换
      else if (assistantToSet) {
          console.log(`[Effect location.state] 执行切换助手到 ${assistantToSet}`);
          setActiveAssistantId(assistantToSet); // 触发助手切换
          if (messageToQueue) {
              console.log(`[Effect location.state] 暂存消息 "${messageToQueue.substring(0,50)}...\" 到队列，等待助手切换后的 Effect 处理`);
              setQueuedMessage(messageToQueue); // 使用 queuedMessage 在 activeAssistantId effect 后触发发送
          }
      }
      // 如果只有消息且不需要切换助手
      else if (messageToQueue) {
          console.log(`[Effect location.state] 无需切换助手，直接将消息 "${messageToQueue.substring(0,50)}...\" 放入队列`);
          setQueuedMessage(messageToQueue); // 使用 queuedMessage 直接触发发送
      }

       if (stateNeedsCleaning) {
           console.log("[Effect location.state] 清理 location.state");
           navigate('.', { replace: true, state: {} });
       } else {
           console.log("[Effect location.state] 无需处理或清理 state");
       }
    }
  }, [location.state, navigate, activeAssistantId, assistants]); // 保持原有依赖

  useEffect(() => {
      // 仅当 queuedMessage 有值且没有 pending 状态时才发送
      if (queuedMessage && typeof queuedMessage === 'string' && !pendingImageUrl && !pendingTargetAssistant) {
          console.log(`[Effect queuedMessage] 检测到队列消息: "${queuedMessage.substring(0,50)}...\", 准备发送`);
          handleSendMessage(queuedMessage);
          setQueuedMessage(null); // 发送后清空
          console.log("[Effect queuedMessage] 队列消息已发送并清空");
      }
  }, [queuedMessage, handleSendMessage, pendingImageUrl, pendingTargetAssistant]); // 保持原有依赖

  useEffect(() => {
      console.log(`[Effect activeAssistantId] activeAssistantId 变为: ${activeAssistantId}`);
      const currentAssistant = assistants.find(a => a.id === activeAssistantId);
      let newMessages: ChatMessage[] = [];

      if (currentAssistant) {
          // 优先使用 assistants 状态中的消息，除非是初始状态
          if (currentAssistant.messages && currentAssistant.messages.length > currentAssistant.initialMessages.length) {
               console.log(`[Effect activeAssistantId] 助手 ${currentAssistant.name} 有缓存消息 (${currentAssistant.messages.length}条)，设置 messages 状态`);
               newMessages = currentAssistant.messages;
          }
          // 如果有 sessionId 但 messages 为空或等于 initialMessages，可能正在加载或加载失败
          else if (currentAssistant.sessionId) {
               console.log(`[Effect activeAssistantId] 助手 ${currentAssistant.name} 有 sessionId，但无缓存消息或等于初始消息，显示 initialMessages 作为临时状态`);
               newMessages = currentAssistant.initialMessages || [];
               // fetchMessages 会在 component mount 或 activeAssistantId 改变后被调用（如果 sessionId 存在）
          }
          // 没有 sessionId，只能用 initialMessages
          else {
               console.log(`[Effect activeAssistantId] 助手 ${currentAssistant.name} 没有 sessionId 或消息，设置 initialMessages`);
               newMessages = currentAssistant.initialMessages || [];
          }
      } else {
          // 回退到 initialAssistants 数据
          const initialData = initialAssistants.find(a => a.id === activeAssistantId);
           console.warn(`[Effect activeAssistantId] 在 assistants 中未找到 ID ${activeAssistantId}，尝试从 initialAssistants 加载`);
          newMessages = initialData?.initialMessages || [];
      }

      setMessages(newMessages); // 设置当前聊天界面显示的消息

      // 处理 pending 状态（当助手切换完成时）
      if (pendingImageUrl && pendingTargetAssistant && activeAssistantId === pendingTargetAssistant) {
          console.log(`[Effect activeAssistantId & Pending] 助手ID已切换到 ${activeAssistantId}，处理暂存的图片和消息`);
          setExternalImageUrl(pendingImageUrl); // 设置图片给 ChatInput
          // 设置消息给 ChatInput，如果存在
          if (pendingMessage && typeof pendingMessage === 'string') {
              console.log(`[Effect activeAssistantId & Pending] 将暂存的消息 "${pendingMessage.substring(0,50)}...\" 设置到 ChatInput`);
              // ChatInput 会在其 useEffect 中处理 initialText
          } else {
              setPendingMessage(null); // 确保 ChatInput 收到的是 null
          }
          // 清理 pending 状态
          setPendingImageUrl(null);
          setPendingTargetAssistant(null);
          // pendingMessage 会作为 prop 传递，不需要在这里清理

          // 清理可能残留的 location.state
           if (location.state && Object.keys(location.state).length > 0) {
               console.log("[Effect activeAssistantId & Pending] 清理残留的 location.state");
               navigate('.', { replace: true, state: {} });
           }

      } else if (queuedMessage && typeof queuedMessage === 'string' && activeAssistantId && !pendingImageUrl && !pendingTargetAssistant) {
           // 如果有排队的消息，并且助手切换完成，则触发发送
           console.log(`[Effect activeAssistantId & Queued] 助手切换完成，触发排队消息发送: "${queuedMessage.substring(0,50)}..."`);
           handleSendMessage(queuedMessage);
           setQueuedMessage(null); // 清空队列
      }
      // --- 修改滚动逻辑 ---
      // 只有当 activeAssistantId 真正改变时才滚动
      if (previousAssistantIdRef.current !== activeAssistantId) {
        console.log(`[Effect activeAssistantId] Assistant ID changed from ${previousAssistantIdRef.current} to ${activeAssistantId}. Scrolling.`);
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        });
    } else {
         console.log(`[Effect activeAssistantId] Assistant ID ${activeAssistantId} did not change. Skipping scroll.`);
    }
    // 更新 Ref 以供下次比较
    previousAssistantIdRef.current = activeAssistantId;
    // --- 滚动逻辑修改结束 ---

    // 移除原来的 unconditional scroll 和 console.log
    // requestAnimationFrame(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    // });
    // console.log(`[Effect activeAssistantId] 已为助手 ${currentAssistant?.name || '未知'} 即时滚动到底部`);

  }, [activeAssistantId, assistants, pendingImageUrl, pendingTargetAssistant, pendingMessage, queuedMessage, handleSendMessage, navigate, location.state]); // 合并依赖项


  // --- 移除单独处理 pendingImageUrl 的 useEffect ---

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

  const activeAssistant = assistants.find(a => a.id === activeAssistantId) || initialAssistants[0];
  const currentCommonQuestions = commonQuestionsMap[activeAssistant?.agentType || AgentType.COMMON] || commonQuestionsMap[AgentType.COMMON];

  const firstAiMessage = messages.find(msg => !msg.isUser && msg.id.includes('-init-'));
  const chatMessages = messages.filter(msg => msg.id !== firstAiMessage?.id);

  const calcVoiceBarWidth = (sec: number): number => {
      const minPx = 70;
      const maxPx = 300;
      const safeSec = Math.max(0, Math.min(sec, 60));
      return minPx + (maxPx - minPx) * (safeSec / 60);
  };

  // --- 新增：滚动处理和滚动到底部函数 ---
  const handleScroll = useCallback(() => {
      // 不再根据滚动位置来控制按钮显示，按钮始终显示
      // 但可以保留此函数用于将来可能的其他滚动相关逻辑
  }, []);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
      const viewport = scrollViewportRef.current;
      if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      }
  };
  // --- 滚动处理结束 ---

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-black text-white">
      <div className="flex items-center justify-center h-14 py-4 border-b border-gray-800 bg-black sticky top-0 z-20">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <button className="absolute left-4 p-2 text-gray-400 hover:text-white">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#171717] text-white p-0 w-[85%] max-w-xs border-r border-gray-800 flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-gray-800 flex-shrink-0">
              <h2 className="text-lg font-medium">健康助手</h2>
            </div>
            <ScrollArea className="flex-1 px-2 py-2">
              {assistants.map(assistant => (
                <button
                  key={assistant.id}
                  className={`w-full text-left p-3 rounded-lg mb-2 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors duration-150 flex items-center ${
                    assistant.id === activeAssistantId ? 'bg-gray-600' : ''
                  }`}
                  onClick={() => handleSelectAssistant(assistant)}
                >
                  <div className="w-10 h-10 rounded-full mr-3 overflow-hidden border border-gray-500 flex-shrink-0">
                    <img
                      src={assistant.avatar}
                      alt={assistant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/AICAHT/医生头像.png'; }}
                    />
                  </div>
                  <div className="overflow-hidden flex-1">
                     <div className="flex justify-between items-baseline">
                         <p className="font-medium text-sm mb-0.5 truncate flex-1 mr-2">{assistant.name}</p>
                         <p className="text-xs text-gray-500 flex-shrink-0">{assistant.date.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}</p>
                     </div>
                     <p className="text-xs text-gray-400 truncate">
                         {/* 显示最后一条非初始消息 或 初始介绍 */}
                         {assistant.messages.filter(m => !m.id.includes('-init-')).length > 0
                            ? (() => {
                                const lastMsg = assistant.messages.filter(m => !m.id.includes('-init-')).slice(-1)[0];
                                return (lastMsg.isUser ? '你: ' : '') +
                                       (lastMsg.contentType === 'image' ? '[图片]' :
                                        lastMsg.contentType === 'voice' ? '[语音]' :
                                        (lastMsg.text || '').substring(0, 30));
                             })()
                            : assistant.intro.substring(0, 30)
                         }
                     </p>
                   </div>
                </button>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-medium text-white">{activeAssistant?.name || '健康助手'}</h1>
      </div>

      {/* --- 修改：添加 ref 和 onScroll，以及按钮 --- */}
      <div
          ref={scrollViewportRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 pt-0 mt-4 overscroll-y-contain relative" // 添加 relative 定位上下文
      >
          <div className="space-y-6">
              {/* 初始介绍部分 */}
              <div className="flex flex-col items-center mb-4 pt-4">
                  <div className="relative w-20 h-20 rounded-full mb-2 overflow-hidden border-2 border-indigo-600 shadow-lg shadow-indigo-500/30">
                      <img
                          src={activeAssistant?.avatar || '/AICAHT/医生头像.png'}
                          alt={activeAssistant?.name || 'AI Assistant'}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/AICAHT/医生头像.png'; }}
                      />
                  </div>
                  <div className="text-xs text-indigo-400 font-medium mb-3">
                      @Powered by CUHKSZ
                  </div>
                  <div className="flex flex-col items-center max-w-[85%] sm:max-w-[80%] w-full">
                      {firstAiMessage && firstAiMessage.contentType !== 'image' && (
                          <div className="text-left text-sm text-white px-4 py-3 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-xl bg-gradient-to-r from-indigo-800 to-indigo-600 w-full shadow-md break-words font-normal border-l-2 border-indigo-400">
                              <MessageMarkdown content={firstAiMessage.text} />
                          </div>
                      )}
                      {firstAiMessage && firstAiMessage.contentType !== 'image' && (
                          <div className="flex space-x-1 mt-1 self-start pl-1">
                              <button onClick={() => handleCopyText(firstAiMessage.text)} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="复制"> <Copy size={14} /> </button>
                              <button onClick={() => handlePlayTTS(firstAiMessage.text, firstAiMessage.id)} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded" title={ttsPlayingMessageId === firstAiMessage.id && (isTTSPlaying || isTTSLoading) ? "停止" : "播放"}>
                                  {ttsPlayingMessageId === firstAiMessage.id && isTTSLoading ? <Loader2 size={14} className="animate-spin" /> : ttsPlayingMessageId === firstAiMessage.id && isTTSPlaying ? <Square size={14} /> : <Volume2 size={14} />}
                              </button>
                          </div>
                      )}
                  </div>
              </div>

              {/* 聊天消息部分 */}
              <div className="space-y-4">
                  {chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end`}>
                          {!message.isUser && (
                              <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 overflow-hidden border border-gray-600 self-start">
                                  <img src={activeAssistant?.avatar || '/AICAHT/医生头像.png'} alt="AI Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/AICAHT/医生头像.png'; }} />
                              </div>
                          )}
                          <div className={`flex flex-col max-w-[80%] ${message.isUser ? 'items-end' : 'items-start'}`}>
                              {message.isGenerating && !message.isUser && (!message.text || message.text.trim() === '') ? (
                                  <div className="flex items-center px-4 py-2 rounded-xl shadow-md bg-[#333333] text-white"> <Loader2 size={18} className="animate-spin mr-2" /> <span>思考中{".".repeat(thinkingDotCount)}</span> </div>
                              ) : message.contentType === 'image' ? (
                                  <div className={`px-2 py-2 rounded-xl shadow-md ${message.isUser ? 'bg-blue-500' : 'bg-[#333333]'}`}> <img src={message.text} alt={message.isUser ? "用户上传的图片" : "AI 返回的图片"} className="max-w-xs max-h-64 object-contain rounded-lg cursor-pointer" onClick={() => window.open(message.text, '_blank')} /> </div>
                              ) : message.contentType === 'voice' && message.duration !== undefined ? (
                                  <button onClick={() => handlePlayVoiceMessage(message.text, message.id)} className={`py-2 pl-3 pr-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer flex-shrink-0 ${message.isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-[#333333] text-white rounded-bl-none'}`} style={{ width: `${calcVoiceBarWidth(Number(message.duration))}px` }} title={`点击播放 ${Math.round(Number(message.duration))}s 语音`}>
                                      {message.isUser && <span className="text-sm mr-1">{Math.round(Number(message.duration))}"</span>}
                                      <Volume2 size={16} className={`${message.isUser ? 'ml-auto' : 'mr-1'} ${playingVoiceMessageId === message.id ? 'animate-voice-wave' : ''}`} />
                                      {!message.isUser && <span className="text-sm ml-1">{Math.round(Number(message.duration))}"</span>}
                                  </button>
                              ) : (
                                  message.text && (
                                      <div className={`px-4 py-2 rounded-xl shadow-md text-sm break-words ${message.isUser ? 'bg-blue-500 text-white rounded-br-none font-normal' : 'bg-[#333333] text-white rounded-bl-none font-normal'} ${message.isGenerating ? 'opacity-70' : ''}`}>
                                          {!message.isUser ? <MessageMarkdown content={message.text} /> : <span>{message.text}</span>}
                                      </div>
                                  )
                              )}
                              {!message.isUser && !message.isGenerating && message.contentType === 'text' && message.text && (
                                  <div className="flex items-center mt-1">
                                      <div className="flex space-x-1 mr-2">
                                          <button onClick={() => handleCopyText(message.text)} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="复制"> <Copy size={14} /> </button>
                                          <button onClick={() => handlePlayTTS(message.text, message.id)} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded" title={ttsPlayingMessageId === message.id && (isTTSPlaying || isTTSLoading) ? "停止" : "播放"}>
                                              {ttsPlayingMessageId === message.id && isTTSLoading ? <Loader2 size={14} className="animate-spin" /> : ttsPlayingMessageId === message.id && isTTSPlaying ? <Square size={14} /> : <Volume2 size={14} />}
                                          </button>
                                      </div>
                                      <span className="text-xs text-gray-400"> {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} </span>
                                  </div>
                              )}
                              {message.isUser && !message.isGenerating && (message.contentType === 'text' || message.contentType === 'image' || message.contentType === 'voice') && (
                                  <span className="text-xs text-gray-400 mt-1 self-end"> {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} </span>
                              )}
                          </div>
                          {message.isUser && (
                              <Avatar className="ml-2 flex-shrink-0 w-8 h-8 self-start">
                                  <AvatarFallback className="bg-gray-600"> <User size={18} className="text-white" /> </AvatarFallback>
                              </Avatar>
                          )}
                      </div>
                  ))}
              </div>

              {/* 用于滚动定位的空 Div */}
              <div ref={messagesEndRef} className="h-px" />
          </div>

          {/* --- 新增：滚动到底部按钮，始终显示 --- */}
          <Button
              variant="outline"
              size="icon"
              className="fixed bottom-60 right-4 bg-white/20 text-white/70 hover:bg-white/30 rounded-full z-50 shadow-lg border border-white/10 w-10 h-10" // 改为透明白色
              onClick={() => scrollToBottom('smooth')}
              title="滚动到底部"
          >
              <ArrowDown size={18} />
          </Button>
          {/* --- 滚动到底部按钮结束 --- */}
      </div>
      {/* --- ref 和 onScroll 修改结束 --- */}

       <div className="flex-shrink-0 sticky bottom-0 left-0 right-0 bg-black z-10 border-t border-gray-800">
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
                              disabled={isSubmitting || (messages.some(m => m.isGenerating && !m.isUser))}
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
              <AlertDialog open={showClearConfirmDialog} onOpenChange={setShowClearConfirmDialog}>
                  <AlertDialogTrigger asChild>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 hover:bg-transparent ml-2 flex-shrink-0"
                          aria-label="清除对话记录"
                           disabled={isSubmitting || (messages.some(m => m.isGenerating && !m.isUser))}
                      >
                          <Trash2 size={18} />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1f1f1f] text-white border-gray-700">
                      <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">清除记录</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                              确定要清除与 <span className='font-bold'>{activeAssistant?.name || '此助手'}</span> 的对话记录吗？此操作不可恢复。
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
         <ChatInput
           onSendMessage={handleSendMessage}
           isGenerating={isSubmitting || messages.some(m => m.isGenerating && !m.isUser)}
           onStopGenerating={handleStopGenerating}
           assistantName={activeAssistant?.name || '健康助手'}
           initialImageUrl={externalImageUrl} // 仍然传递，让 ChatInput 内部处理
           initialText={pendingMessage}      // 仍然传递，让 ChatInput 内部处理
         />
       </div>
    </div>
  );
};

export default AIChat;

