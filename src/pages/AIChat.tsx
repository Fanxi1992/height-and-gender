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

// 新增AI助手角色接口
interface AIAssistant {
  id: string;
  name: string;      // 助手名称
  avatar: string;    // 助手头像
  intro: string;     // 助手简介
  specialty: string; // 助手专长领域
  messages: ChatMessage[]; // 该助手的聊天记录
  date: Date;        // 最后交互时间 
}

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
  
  // 更改为AI助手列表，预设不同的专业助手
  const [assistants, setAssistants] = useState<AIAssistant[]>([
    {
      id: '1',
      name: '门诊医生',
      avatar: '/lovable-uploads/1bbfe88a-e9fb-4f56-a679-bb8f36a23055.png',
      intro: '我是你的健康助手小张医生，很高兴见到你！',
      specialty: '常见疾病诊断、健康咨询、预防保健',
      messages: [
        {
          id: '1-1',
          text: '我是你的健康助手小张医生，很高兴见到你！',
          isUser: false,
          timestamp: new Date()
        },
        {
          id: '1-2',
          text: '我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问，还有更多等你来发现～',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date()
    },
    {
      id: '2',
      name: '卡路里专家',
      avatar: '/assets/calorie-expert.svg', // 占位图标
      intro: '我是卡路里计算专家，擅长个性化饮食计划',
      specialty: '热量计算、减肥方案、代谢分析',
      messages: [
        {
          id: '2-1',
          text: '欢迎咨询卡路里专家，我可以帮你计算食物热量、制定减脂计划。',
          isUser: false,
          timestamp: new Date()
        },
        {
          id: '2-2',
          text: '请告诉我你的身高、体重和活动水平，我会为你量身定制饮食方案。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 1))
    },
    {
      id: '3',
      name: '菜谱大师',
      avatar: '/assets/recipe-master.svg', // 占位图标
      intro: '我是健康菜谱大师，为你提供美味又健康的食谱',
      specialty: '个性化食谱、营养均衡餐、特殊饮食需求',
      messages: [
        {
          id: '3-1',
          text: '我是健康菜谱大师，可以根据你的口味偏好和营养需求，推荐适合你的菜谱。',
          isUser: false,
          timestamp: new Date()
        },
        {
          id: '3-2',
          text: '无论你是想减肥、增肌，还是有特殊饮食限制，我都能为你提供美味又营养的食谱建议。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 2))
    },
    {
      id: '4',
      name: '舌苔专家',
      avatar: '/assets/tongue-expert.svg', // 占位图标
      intro: '我是舌诊专家，可以从舌苔判断你的健康状况',
      specialty: '舌诊分析、中医理论、健康建议',
      messages: [
        {
          id: '4-1',
          text: '我是舌诊专家，通过观察舌头的颜色、形态、舌苔等特征，可以初步了解你的健康状况。',
          isUser: false,
          timestamp: new Date()
        },
        {
          id: '4-2',
          text: '你可以上传舌头照片，我会进行初步分析并给出健康建议。请注意我的分析仅供参考，不能替代正规医疗诊断。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 3))
    },
    {
      id: '5',
      name: '面诊专家',
      avatar: '/assets/face-expert.svg', // 占位图标
      intro: '我是面诊专家，可以从面相分析你的健康状况',
      specialty: '面部分析、中医理论、健康状况评估',
      messages: [
        {
          id: '5-1',
          text: '我是面诊专家，擅长通过面部特征分析健康状况。',
          isUser: false,
          timestamp: new Date()
        },
        {
          id: '5-2',
          text: '你可以上传面部照片，我会根据中医面诊理论进行初步分析。请记住，这只是健康参考，不能替代专业医疗诊断。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 5))
    },
    {
      id: '6',
      name: '检测单分析专家',
      avatar: '/assets/lab-expert.svg', // 占位图标
      intro: '我是检验报告解读专家，帮你理解医学检验报告',
      specialty: '血液检测、尿检、生化指标解读、健康建议',
      messages: [
        {
          id: '6-1',
          text: '你好，我是检验报告解读专家，可以帮助你理解各类医学检验报告。',
          isUser: false,
          timestamp: new Date()
        },
        {
          id: '6-2',
          text: '你可以上传检验报告图片或告诉我具体的检测指标，我会为你解释其含义及注意事项。',
          isUser: false,
          timestamp: new Date()
        }
      ],
      date: new Date(new Date().setDate(new Date().getDate() - 7))
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

  // --- 更新状态 ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FilePreview[]>([]);
  const [activeAssistantId, setActiveAssistantId] = useState<string>('1'); // 默认选中第一个助手
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 处理助手选择
  const handleSelectAssistant = useCallback((assistant: AIAssistant) => {
    setActiveAssistantId(assistant.id);
    setMessages(assistant.messages);
    setIsSidebarOpen(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

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

        // --- 更新当前助手的聊天记录 ---
        const now = new Date();
        setAssistants(prevAssistants => {
          return prevAssistants.map(assistant => {
            if (assistant.id === activeAssistantId) {
              // 更新当前助手的消息和日期
              return {
                ...assistant,
                messages: [...assistant.messages, userMessage, aiResponse],
                date: now
              };
            }
            return assistant;
          }).sort((a, b) => b.date.getTime() - a.date.getTime()); // 按日期重新排序
        });

        setIsSubmitting(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }, 1500); // 模拟延迟
    }
  }, [isSubmitting, messages, activeAssistantId]);

  // --- 处理停止生成 ---
  const handleStopGenerating = useCallback(() => {
    console.log("Stopping generation..."); // 实现停止逻辑 (例如取消 API 请求)
    setIsSubmitting(false); // 强制结束提交状态
  }, []);

  // Handle clicking on a common question
  const handleCommonQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  // --- 处理从 HomePage 传入的初始消息 ---
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

  // 获取当前活跃的助手
  const activeAssistant = assistants.find(a => a.id === activeAssistantId) || assistants[0];

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
              <h2 className="text-lg font-medium">健康助手</h2>
            </div>
            <ScrollArea className="flex-1 px-2 py-2">
              {/* 助手列表，按最后交互时间排序 */}
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
                      onError={(e) => {
                        // 如果图片加载失败，使用默认SVG
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`;
                      }}
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm mb-0.5">{assistant.name}</p>
                    <p className="text-xs text-gray-400 truncate">{assistant.specialty}</p>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
        <h1 className="text-lg font-medium text-white">{activeAssistant?.name || '健康助手'}</h1>
      </div>
      
      {/* Chat container */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Assistant avatar */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full mb-4 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-md"></div>
              <div className="absolute inset-0 border-2 border-white rounded-full"></div>
              <div className="absolute inset-0 border border-blue-400 rounded-full"></div>
              <img 
                src={activeAssistant?.avatar || '/lovable-uploads/1bbfe88a-e9fb-4f56-a679-bb8f36a23055.png'} 
                alt={activeAssistant?.name || 'AI Assistant'} 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // 如果图片加载失败，使用默认SVG
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%23fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`;
                }}
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
                       src={activeAssistant?.avatar || '/lovable-uploads/1bbfe88a-e9fb-4f56-a679-bb8f36a23055.png'}
                       alt="AI Avatar"
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         // 如果图片加载失败，使用默认SVG
                         (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`;
                       }}
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
        assistantName={activeAssistant?.name || '健康助手'}
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
