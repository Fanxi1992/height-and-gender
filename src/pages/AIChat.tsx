import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, MessageCircle, Trash2, MessageSquarePlus } from 'lucide-react';
import ChatInput from '../components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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
const groupSessionsByDate = (sessions: ChatSession[]): Record<string, ChatSession[]> => {
  const groups: Record<string, ChatSession[]> = {};
  
  // 按日期降序排序会话
  const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());

  sortedSessions.forEach(session => {
    const dateKey = getDateKey(session.date);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(session);
  });

  // 定义期望的分组顺序
  const groupOrder = ['今天', '昨天', '过去7天', '过去30天', '更早之前']; // 可以根据需要扩展
  const orderedGroups: Record<string, ChatSession[]> = {};

  groupOrder.forEach(key => {
      if (groups[key]) {
          orderedGroups[key] = groups[key];
      }
  });

  // 添加其他可能的分组（例如月份）
  Object.keys(groups).forEach(key => {
      if (!groupOrder.includes(key)) {
          orderedGroups[key] = groups[key]; // 将未在 groupOrder 中的分组添加到末尾
      }
  });

  return orderedGroups;
};

// Get the date key string
const getDateKey = (date: Date): string => {
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
    // 简化分组，符合 librechat 风格，但可按需调整
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    if (inputDate.getTime() >= sevenDaysAgo.getTime()) {
      return '过去7天';
    }
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    if (inputDate.getTime() >= thirtyDaysAgo.getTime()) {
        return '过去30天';
    }
    // 可根据 librechat 添加更细致的月份分组
    return '更早之前';
  }
};

// --- 辅助函数：获取会话标题 ---
const getSessionTitle = (session: ChatSession): string => {
  const firstUserMessage = session.messages.find(m => m.isUser);
  if (firstUserMessage && firstUserMessage.text) {
    // 截取前10个字符
    return firstUserMessage.text.length > 10
      ? firstUserMessage.text.substring(0, 10) + '...'
      : firstUserMessage.text;
  }
  // 如果没有用户消息或消息为空，提供一个默认标题
  return session.title || '新对话'; // 可以使用原始 title 作为后备
};

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 核心状态 ---
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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle sending message
  const handleSendMessage = useCallback((message: string, files?: File[]) => {
    if (isSubmitting) return;

    const trimmedMessage = message.trim();
    const hasFiles = files && files.length > 0;

    if (trimmedMessage || hasFiles) {
      setIsSubmitting(true);

      // 创建文件预览对象
      const filesPreviews: FilePreview[] = [];
      if (hasFiles && files) {
        files.forEach(file => {
          if (file.type.startsWith('image/')) {
            filesPreviews.push({
              id: `${file.name}-${Date.now()}`,
              file: file,
              previewUrl: URL.createObjectURL(file)
            });
          }
        });
      }

      const userMessage: ChatMessage = {
        id: generateUniqueId(),
        text: trimmedMessage,
        isUser: true,
        timestamp: new Date(),
        files: filesPreviews.length > 0 ? filesPreviews : undefined,
      };

      // 更新当前聊天窗口的消息
      setMessages(prev => [...prev, userMessage]);
      setAttachedFiles([]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      // --- 模拟 AI 回复 ---
      console.log("Sending message:", trimmedMessage, "Files:", files);
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: generateUniqueId(),
          text: `收到你的问题："${trimmedMessage}" ${hasFiles ? `和 ${files.length} 个文件。` : ''}正在处理中... (模拟回复)`,
          isUser: false,
          timestamp: new Date()
        };

        // 更新当前聊天窗口的消息 (加入 AI 回复)
        setMessages(prev => [...prev, aiResponse]);

        // --- 更新聊天历史记录 ---
        const now = new Date();
        if (activeSessionId === null && trimmedMessage) {
          // --- 情况1: 当前是新聊天，且发送了文本消息 ---
          const newSession: ChatSession = {
            id: generateUniqueId(),
            messages: [...messages, userMessage, aiResponse],
            date: now,
            title: '', // 临时 title
          };
          newSession.title = getSessionTitle(newSession); // 生成标题

          setChatHistory(prev => [newSession, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime())); // 添加并排序
          setActiveSessionId(newSession.id); // 将新创建的会话设为活动会话

        } else if (activeSessionId !== null) {
          // --- 情况2: 当前是已存在的聊天 ---
          setChatHistory(prevHistory => {
            const newHistory = prevHistory.map(session => {
              if (session.id === activeSessionId) {
                // 找到活动会话，创建新对象并更新消息和日期
                return {
                  ...session,
                  messages: [...session.messages, userMessage, aiResponse], // 追加消息
                  date: now, // 更新时间戳
                };
              }
              return session; // 其他会话保持不变
            });
            // 按日期重新排序，确保更新后的会话移动到顶部
             return newHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
          });
        }
        // else: 新聊天只发文件，暂不处理历史记录

        setIsSubmitting(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }, 1500); // 模拟延迟
    }
  }, [isSubmitting, messages, chatHistory.length, activeSessionId]);

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
  const handleSelectChatSession = useCallback((session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setIsSidebarOpen(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);
  
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

  // --- 新增：处理新建聊天 ---
  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([
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
    setIsSidebarOpen(false);
    navigate('.', { replace: true, state: {} });
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView();
    }, 0);
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="relative flex items-center justify-center py-4 border-b border-gray-800 flex-shrink-0">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <button className="absolute left-4 p-2">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#171717] text-white p-0 w-[85%] max-w-xs border-r border-gray-800 flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-gray-800 flex-shrink-0">
              <h2 className="text-lg font-medium">聊天模式</h2>
            </div>
            <div className="p-3 flex-shrink-0">
              <Button
                variant="outline"
                className="w-full border-gray-600 hover:bg-gray-700 justify-start"
                onClick={handleNewChat}
              >
                <MessageSquarePlus size={16} className="mr-2" />
                新建聊天
              </Button>
            </div>
            <ScrollArea className="flex-1 px-2 py-2">
              {Object.entries(groupedSessions).map(([dateKey, sessions]) => (
                <div key={dateKey} className="mb-3">
                  <h3 className="text-xs text-gray-400 px-3 py-2 font-medium uppercase tracking-wider">
                    {dateKey}
                  </h3>
                  {sessions.map(session => (
                    <button
                      key={session.id}
                      className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors duration-150 truncate ${
                        session.id === activeSessionId ? 'bg-gray-600' : ''
                      }`}
                      onClick={() => handleSelectChatSession(session)}
                      title={getSessionTitle(session)}
                    >
                      <p className="text-sm">{getSessionTitle(session)}</p>
                    </button>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
        <h1 className="text-lg font-medium text-white">你的健康顾问</h1>
        
        <button 
          onClick={handleNewChat}
          className="absolute right-4 p-2"
          title="新建聊天"
        >
          <Plus size={24} />
        </button>
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
                   className={`flex flex-col ${
                     message.isUser
                       ? 'items-end'
                       : 'items-start'
                   }`}
                 >
                   {/* 图片显示区域 */}
                   {message.files && message.files.length > 0 && (
                     <div className={`flex flex-wrap gap-2 mb-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                       {message.files.map((file) => (
                         <div key={file.id} className="w-32 h-32 overflow-hidden rounded-lg border border-gray-600">
                           <img
                             src={file.previewUrl}
                             alt="Attached media"
                             className="w-full h-full object-cover"
                           />
                         </div>
                       ))}
                     </div>
                   )}

                   {/* 文本消息 */}
                   <div
                     className={`px-4 py-3 rounded-2xl ${
                       message.isUser
                         ? 'bg-blue-500 text-white rounded-br-none'
                         : 'bg-gray-700 text-white rounded-bl-none'
                     }`}
                   >
                     <p className="text-sm break-words">{message.text}</p>
                   </div>
                 </div>
               </div>
            ))}
            {isSubmitting && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopGenerating}
                  className="border-gray-600 hover:bg-gray-700 text-white"
                >
                  停止生成
                </Button>
              </div>
            )}
          </div>
          
          {/* Common questions
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
          </div> */}
          
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
      <div className="flex justify-around py-3 bg-black border-t border-gray-800 flex-shrink-0">
        <button 
          onClick={() => navigate('/home')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-xs">主页</span>
        </button>
        
        <button className="flex flex-col items-center space-y-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-8.5 14.8L12 22l8.5-5.2A10 10 0 0 0 12 2zM12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
          <span className="text-xs">机器人</span>
        </button>
        
        <button 
          onClick={() => navigate('/circle')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span className="text-xs">圈子</span>
        </button>
        
        <button 
          onClick={() => navigate('/my')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </button>
      </div>
    </div>
  );
};

export default AIChat;
