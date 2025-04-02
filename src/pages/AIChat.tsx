import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, MessageCircle } from 'lucide-react';
import ChatInput from '../components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Define chat history types
interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  files?: FilePreview[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  date: Date;
}

// Group chat sessions by date
const groupSessionsByDate = (sessions: ChatSession[]) => {
  const groups: Record<string, ChatSession[]> = {};
  
  sessions.forEach(session => {
    const date = new Date(session.date);
    const dateKey = getDateKey(date);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(session);
  });
  
  return groups;
};

// Get the date key string
const getDateKey = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  
  if (inputDate.getTime() === today.getTime()) {
    return '今天';
  } else if (inputDate.getTime() === yesterday.getTime()) {
    return '昨天';
  } else {
    return '更早之前';
  }
};

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '我是你的健康助手小张医生，很高兴见到你！',
      isUser: false,
      timestamp: new Date()
    },
    {
      id: '2',
      text: '我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问，还有更多等你来发现～',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([
    {
      id: '1',
      title: '如何快速瘦身？',
      messages: [
        {
          id: '1-1',
          text: '如何快速瘦身？',
          isUser: true,
          timestamp: new Date()
        },
        {
          id: '1-2',
          text: '要健康快速瘦身，可以进行有氧运动如慢跑30分钟，控制碳水摄入，多吃蛋白质和蔬菜，保持每日500卡路里的热量赤字。记得要循序渐进，避免极端节食。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date()
    },
    {
      id: '2',
      title: '推荐一份适合我的晚餐',
      messages: [
        {
          id: '2-1',
          text: '推荐一份适合我的晚餐',
          isUser: true,
          timestamp: new Date()
        },
        {
          id: '2-2',
          text: '建议晚餐可以选择烤三文鱼配芦笋和藜麦，高蛋白低碳水，既美味又健康。或者可以尝试鸡胸肉沙拉，加入牛油果、西红柿和混合生菜，淋上橄榄油和柠檬汁调味。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date()
    },
    {
      id: '3',
      title: '怎么提升睡眠质量？',
      messages: [
        {
          id: '3-1',
          text: '怎么提升睡眠质量？',
          isUser: true,
          timestamp: new Date()
        },
        {
          id: '3-2',
          text: '提升睡眠质量的方法：保持规律作息时间，睡前关闭电子设备，卧室保持凉爽和安静，避免睡前饮用咖啡因和酒精，尝试睡前放松活动如深呼吸或冥想，需要时可咨询医生。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 1)) // Yesterday
    },
    {
      id: '4',
      title: '有什么快速减脂的方法？',
      messages: [
        {
          id: '4-1',
          text: '有什么快速减脂的方法？',
          isUser: true,
          timestamp: new Date()
        },
        {
          id: '4-2',
          text: '快速减脂可以尝试间歇性禁食，增加高强度间歇训练，减少精制碳水和糖分摄入，多吃高蛋白食物和膳食纤维，保持充足水分，但记住健康减脂应当循序渐进，避免极端方法。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 1)) // Yesterday
    },
    {
      id: '5',
      title: '睡不好怎么办？',
      messages: [
        {
          id: '5-1',
          text: '睡不好怎么办？',
          isUser: true,
          timestamp: new Date()
        },
        {
          id: '5-2',
          text: '改善睡眠可以尝试：创建舒适的睡眠环境，养成规律的作息时间，睡前一小时避免使用电子设备，尝试冥想或深呼吸放松身心，如果持续失眠，建议咨询医生寻求专业帮助。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 1)) // Yesterday
    },
    {
      id: '6',
      title: '适合我当前身体的晚餐有哪些推荐？',
      messages: [
        {
          id: '6-1',
          text: '适合我当前身体的晚餐有哪些推荐？',
          isUser: true,
          timestamp: new Date()
        },
        {
          id: '6-2',
          text: '针对您的情况，推荐晚餐选择低脂高蛋白食物，如清蒸鱼配蔬菜，豆腐炒菌菇，或鸡胸肉沙拉。建议控制主食量，增加膳食纤维摄入，晚餐时间尽量在睡前3小时完成。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 14)) // Earlier
    },
    {
      id: '7',
      title: '蔬菜蛋白为主的食谱推荐',
      messages: [
        {
          id: '7-1',
          text: '蔬菜蛋白为主的食谱推荐',
          isUser: true,
          timestamp: new Date()
        },
        {
          id: '7-2',
          text: '以蔬菜蛋白为主的食谱推荐：藜麦豆腐沙拉、烤豆腐配芦笋、扁豆奎奴亚藜碗、豆浆蔬菜汤、蘑菇豌豆蛋白炒饭。这些食谱富含植物蛋白、膳食纤维和各种营养素，既健康又美味。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 14)) // Earlier
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Common questions
  const commonQuestions = [
    "什么样的体重是健康的?",
    "运动应该保持怎样的强度?"
  ];
  
  // Generate unique ID
  const generateUniqueId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  };
  
  // Handle navigation
  const handleBack = () => {
    navigate('/home');
  };

  // --- 新增状态 ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FilePreview[]>([]);

  // Handle sending message
  const handleSendMessage = useCallback((message: string, files?: File[]) => {
    // 仅在非提交状态下发送
    if (isSubmitting) return;

    // 检查是否有文本或文件
    if (message.trim() || (files && files.length > 0)) {
      setIsSubmitting(true); // 开始提交

      // 构造用户消息
      const userMessage: ChatMessage = {
        id: generateUniqueId(),
        text: message.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // 滚动到底部
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      // --- TODO: 调用实际 AI 接口 ---
      console.log("Sending message:", message, "Files:", files); // 打印文件信息
      setTimeout(() => {
         const aiResponse: ChatMessage = {
             id: generateUniqueId(),
             text: `收到你的问题："${message.trim()}" ${files && files.length > 0 ? `和 ${files.length} 个文件。` : ''}正在处理中... (模拟回复)`,
             isUser: false,
             timestamp: new Date()
         };
         setMessages(prev => [...prev, aiResponse]);
         setIsSubmitting(false); // 结束提交
         // 确保滚动到底部
         setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }, 1500); // 增加延迟以模拟处理

    }
  }, [isSubmitting]);

  // --- 新增：处理停止生成 ---
  const handleStopGenerating = useCallback(() => {
    console.log("Stopping generation..."); // 实现停止逻辑 (例如取消 API 请求)
    setIsSubmitting(false); // 强制结束提交状态
  }, []);

  // Handle clicking on a common question
  const handleCommonQuestionClick = (question: string) => {
    handleSendMessage(question);
  };
  
  // Load chat history
  const handleSelectChatSession = (session: ChatSession) => {
    setMessages(session.messages);
    // Scroll to bottom after messages are loaded
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Group chat history by date
  const groupedSessions = groupSessionsByDate(chatHistory);

  // --- 新增：处理从 HomePage 传入的初始消息 ---
  useEffect(() => {
    // 检查 location.state 中是否有 initialMessage
    const initialMessage = location.state?.initialMessage as string | undefined;

    if (initialMessage && initialMessage.trim()) {
      console.log('AIChat received initial message:', initialMessage); // 调试日志
      // 发送消息
      handleSendMessage(initialMessage);

      // 清除 state，防止刷新重复发送
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, handleSendMessage]);

  // Scroll to bottom on initial load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="relative flex items-center justify-center py-4 border-b border-gray-800">
        <Sheet>
          <SheetTrigger asChild>
            <button className="absolute left-4 p-2">
              <Menu size={24} className="text-white" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black text-white p-0 w-[85%] border-r border-gray-800">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-medium">聊天历史</h2>
              </div>
              <ScrollArea className="flex-1 px-2">
                {Object.entries(groupedSessions).map(([dateKey, sessions]) => (
                  <div key={dateKey} className="mb-4">
                    <h3 className="text-xs text-gray-400 px-3 py-2">{dateKey}</h3>
                    {sessions.map(session => (
                      <button
                        key={session.id}
                        className="w-full text-left px-3 py-3 rounded-xl mb-2 bg-[#3b2c71] text-white"
                        onClick={() => handleSelectChatSession(session)}
                      >
                        <p className="text-sm truncate">{session.title}</p>
                      </button>
                    ))}
                  </div>
                ))}
              </ScrollArea>
              <div className="border-t border-gray-800 p-4">
                <button className="flex items-center text-blue-400">
                  <MessageCircle size={18} className="mr-2" />
                  <span>新建聊天</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <h1 className="text-lg font-medium text-white">健康顾问</h1>
        
        <div className="absolute right-4 flex space-x-4">
          <button className="p-2">
            <X size={24} className="text-white" />
          </button>
          <button className="p-2">
            <Plus size={24} className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Chat container */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Doctor avatar */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full mb-4 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-md"></div>
              <div className="absolute inset-0 border-2 border-white rounded-full"></div>
              <div className="absolute inset-0 border border-blue-400 rounded-full"></div>
              <img 
                src="/lovable-uploads/1bbfe88a-e9fb-4f56-a679-bb8f36a23055.png" 
                alt="AI Doctor" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.isUser
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }`}
              >
                {!message.isUser && (
                   <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 overflow-hidden border border-blue-400">
                     <img
                       src="/lovable-uploads/1bbfe88a-e9fb-4f56-a679-bb8f36a23055.png"
                       alt="AI Avatar"
                       className="w-full h-full object-cover"
                     />
                   </div>
                 )}
                 <div
                   className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                     message.isUser
                       ? 'bg-blue-500 text-white rounded-br-none'
                       : 'bg-gray-700 text-white rounded-bl-none'
                   }`}
                 >
                   <p className="text-sm">{message.text}</p>
                 </div>
               </div>
            ))}
          </div>
          
          {/* Common questions */}
          <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-none mt-auto">
            {commonQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleCommonQuestionClick(question)}
                className="px-4 py-2 bg-gray-700 rounded-full text-white text-sm whitespace-nowrap hover:bg-gray-600"
              >
                {question}
              </button>
            ))}
          </div>
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Chat input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isSubmitting={isSubmitting}
        onStopGenerating={handleStopGenerating}
        files={attachedFiles}
        setFiles={setAttachedFiles}
      />
      
      {/* Bottom tab bar */}
      <div className="flex justify-around py-3 bg-black border-t border-gray-800">
        <button 
          onClick={() => navigate('/home')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </button>
        
        <button className="flex flex-col items-center space-y-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <span className="text-xs">机器人</span>
        </button>
        
        <button 
          onClick={() => navigate('/circle')}
          className="flex flex-col items-center space-y-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="text-xs text-gray-400">圈子</span>
        </button>
        
        <button 
          onClick={() => navigate('/my')}
          className="flex flex-col items-center space-y-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="10" r="3"></circle>
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
          </svg>
          <span className="text-xs text-gray-400">我的</span>
        </button>
      </div>
    </div>
  );
};

export default AIChat;
