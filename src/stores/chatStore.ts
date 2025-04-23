import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getItem, setItem, removeItem } from '../utils/storage/asyncStorage'

// 文件预览类型
export interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
}

// 聊天消息类型
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  files?: FilePreview[];
}

// AI助手类型
export interface AIAssistant {
  id: string;
  name: string;
  avatar: string;
  intro: string;
  specialty: string;
  messages: ChatMessage[];
  date: Date;
  initialMessages: ChatMessage[];
  sessionId?: string; // 与后端的会话ID
}

// 聊天状态接口
interface ChatState {
  assistants: AIAssistant[];
  activeAssistantId: string | null;
  
  // 操作方法
  setAssistants: (assistants: AIAssistant[]) => void;
  addAssistant: (assistant: AIAssistant) => void;
  updateAssistant: (assistantId: string, updates: Partial<AIAssistant>) => void;
  removeAssistant: (assistantId: string) => void;
  setActiveAssistantId: (id: string) => void;
  
  // 消息操作
  addMessage: (assistantId: string, message: ChatMessage) => void;
  clearMessages: (assistantId: string) => void;
  
  // 会话ID操作
  setSessionId: (assistantId: string, sessionId: string) => void;
  
  // 获取当前激活的助手
  getActiveAssistant: () => AIAssistant | undefined;
  
  // 重置所有聊天数据
  resetAllChats: () => void;
}

// 默认助手数据
const createInitialMessages = (assistantName: string, intro: string, followUp: string): ChatMessage[] => [
  { id: `${assistantName}-init-1`, text: intro, isUser: false, timestamp: new Date() },
  { id: `${assistantName}-init-2`, text: followUp, isUser: false, timestamp: new Date() },
];

const initialAssistants: AIAssistant[] = [
  {
    id: '1',
    name: '门诊医生',
    avatar: '/AICAHT/医生头像.png',
    intro: '我是你的健康助手小张医生，很高兴见到你！',
    specialty: '常见疾病诊断、健康咨询、预防保健',
    messages: createInitialMessages('门诊医生', '我是你的健康助手小张医生，很高兴见到你！', '我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问，还有更多等你来发现～'),
    initialMessages: createInitialMessages('门诊医生', '我是你的健康助手小张医生，很高兴见到你！', '我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问，还有更多等你来发现～'),
    date: new Date()
  },
  {
    id: '2',
    name: '卡路里专家',
    avatar: '/AICAHT/医生头像.png',
    intro: '我是卡路里计算专家，擅长个性化饮食计划',
    specialty: '热量计算、减肥方案、代谢分析',
    messages: createInitialMessages('卡路里专家', '欢迎咨询卡路里专家，我可以帮你计算食物热量、制定减脂计划。', '请告诉我你的身高、体重和活动水平，我会为你量身定制饮食方案。'),
    initialMessages: createInitialMessages('卡路里专家', '欢迎咨询卡路里专家，我可以帮你计算食物热量、制定减脂计划。', '请告诉我你的身高、体重和活动水平，我会为你量身定制饮食方案。'),
    date: new Date(new Date().setDate(new Date().getDate() - 1))
  },
  {
    id: '3',
    name: '菜谱大师',
    avatar: '/AICAHT/医生头像.png',
    intro: '我是健康菜谱大师，为你提供美味又健康的食谱',
    specialty: '个性化食谱、营养均衡餐、特殊饮食需求',
    messages: createInitialMessages('菜谱大师', '我是健康菜谱大师，可以根据你的口味偏好和营养需求，推荐适合你的菜谱。', '无论你是想减肥、增肌，还是有特殊饮食限制，我都能为你提供美味又营养的食谱建议。'),
    initialMessages: createInitialMessages('菜谱大师', '我是健康菜谱大师，可以根据你的口味偏好和营养需求，推荐适合你的菜谱。', '无论你是想减肥、增肌，还是有特殊饮食限制，我都能为你提供美味又营养的食谱建议。'),
    date: new Date(new Date().setDate(new Date().getDate() - 2))
  },
];

// 创建聊天状态存储
const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 初始状态
      assistants: initialAssistants,
      activeAssistantId: initialAssistants[0]?.id || null,
      
      // 操作方法
      setAssistants: (assistants) => set({ assistants }),
      addAssistant: (assistant) => set(state => ({ 
        assistants: [...state.assistants, assistant] 
      })),
      updateAssistant: (assistantId, updates) => set(state => ({
        assistants: state.assistants.map(assistant => 
          assistant.id === assistantId 
            ? { ...assistant, ...updates } 
            : assistant
        )
      })),
      removeAssistant: (assistantId) => set(state => ({
        assistants: state.assistants.filter(assistant => assistant.id !== assistantId),
        activeAssistantId: state.activeAssistantId === assistantId 
          ? (state.assistants.find(a => a.id !== assistantId)?.id || null)
          : state.activeAssistantId
      })),
      setActiveAssistantId: (id) => set({ activeAssistantId: id }),
      
      addMessage: (assistantId, message) => set(state => ({
        assistants: state.assistants.map(assistant => 
          assistant.id === assistantId 
            ? { 
                ...assistant, 
                messages: [...assistant.messages, message],
                date: new Date() // 更新日期
              } 
            : assistant
        )
      })),
      clearMessages: (assistantId) => set(state => ({
        assistants: state.assistants.map(assistant => 
          assistant.id === assistantId 
            ? { 
                ...assistant, 
                messages: [...assistant.initialMessages], // 重置为初始消息
                date: new Date() // 更新日期
              } 
            : assistant
        )
      })),
      
      setSessionId: (assistantId, sessionId) => set(state => ({
        assistants: state.assistants.map(assistant => 
          assistant.id === assistantId 
            ? { ...assistant, sessionId } 
            : assistant
        )
      })),
      
      getActiveAssistant: () => {
        const state = get();
        return state.assistants.find(a => a.id === state.activeAssistantId);
      },
      
      resetAllChats: () => set(state => ({
        assistants: state.assistants.map(assistant => ({
          ...assistant,
          messages: [...assistant.initialMessages],
          sessionId: undefined
        }))
      }))
    }),
    {
      name: 'chat-storage', // 存储的唯一名称
      storage: createJSONStorage(() => ({
        // 使用自定义的异步存储适配器
        getItem: async (name) => {
          const value = await getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await removeItem(name);
        },
      })),
      partialize: (state) => ({
        // 序列化存储时只保留部分数据
        assistants: state.assistants.map(assistant => ({
          ...assistant,
          // 将Date对象转换为ISO字符串以便正确序列化
          date: assistant.date.toISOString(),
          messages: assistant.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
            // 排除文件对象，它们不能序列化，但保留预览URL
            files: msg.files ? msg.files.map(f => ({
              id: f.id,
              previewUrl: f.previewUrl
            })) : undefined
          })),
          initialMessages: assistant.initialMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }))
        })),
        activeAssistantId: state.activeAssistantId
      }),
      // 从存储中恢复时重新处理日期
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 将ISO字符串转回Date对象
          state.assistants = state.assistants.map(assistant => ({
            ...assistant,
            date: new Date(assistant.date),
            messages: assistant.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            initialMessages: assistant.initialMessages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
        }
      }
    }
  )
);

export default useChatStore; 