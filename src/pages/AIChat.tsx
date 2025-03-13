import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import ChatInput from '../components/ChatInput';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  MessageCirclePlus, 
  Play, 
  Copy, 
  Share, 
  ThumbsUp, 
  ThumbsDown
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isVoice?: boolean;
  thinking?: string;
  isThinkingCollapsed?: boolean;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '下午好！你今天怎么样？有什么问题尽管问我。',
      isUser: false,
      thinking: '',
      isThinkingCollapsed: false
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [currentThinking, setCurrentThinking] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [locationProcessed, setLocationProcessed] = useState(false);
  const [isCurrentThinkingCollapsed, setIsCurrentThinkingCollapsed] = useState(false);
  
  // Mock thinking and response text
  const mockThinking = "嗯.....这个问题似乎简单：'你是谁？'不过话说回来，对于一个人工智能来说，这是一个非常深刻的问题呢。让我仔细想想该怎么回答才能既简单明了又能传达我们的核心理念。";
  const mockResponse = "嗨，看起来你想开个玩笑呢！不过不用担心，我很高兴回答你的问题：'我是康友AI，一位来自智诊科技团队的全科医疗健康小管家。'我的任务就是为你提供全方位的健康管理和咨询服务。无论你有什么健康方面的小困惑，都可以来找我聊聊。我会运用最新的医学知识和技术，尽力帮您解决问题。希望能为您带来有价值的帮助呀～ 😊";
  
  // 生成唯一ID的辅助函数
  const generateUniqueId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  };
  
  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentThinking, currentResponse]);

  // Process incoming message from location state
  useEffect(() => {
    if (location.state && location.state.message && !locationProcessed) {
      const { message, isVoice } = location.state;
      handleNewMessage(message, isVoice);
      setLocationProcessed(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, locationProcessed]);

  // Listen for custom events from ChatInput
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent<{ message: string, isVoice: boolean }>) => {
      if (!locationProcessed) {
        handleNewMessage(event.detail.message, event.detail.isVoice);
      }
    };

    window.addEventListener('newChatMessage', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('newChatMessage', handleCustomEvent as EventListener);
    };
  }, [locationProcessed]);

  // Handle new message from chat input
  const handleNewMessage = (message: string, isVoice: boolean = false) => {
    setCurrentThinking('');
    setCurrentResponse('');
    setIsThinking(false);
    setIsResponding(false);
    setIsCurrentThinkingCollapsed(false);
    
    setLocationProcessed(true);
    
    const newMessage: Message = {
      id: generateUniqueId(),
      text: message,
      isUser: true,
      isVoice,
      isThinkingCollapsed: false
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    setIsThinking(true);
    
    let i = 0;
    const thinkingInterval = setInterval(() => {
      if (i < mockThinking.length) {
        setCurrentThinking(prev => prev + mockThinking.charAt(i));
        i++;
      } else {
        clearInterval(thinkingInterval);
        
        setTimeout(() => {
          setIsThinking(false);
          setIsResponding(true);
          
          let j = 0;
          const responseInterval = setInterval(() => {
            if (j < mockResponse.length) {
              setCurrentResponse(prev => prev + mockResponse.charAt(j));
              j++;
            } else {
              clearInterval(responseInterval);
              setTimeout(() => {
                // 添加调试日志
                console.log('最终添加消息:', mockResponse);
                
                const newAIMessage = { 
                  id: generateUniqueId(),
                  text: mockResponse, 
                  isUser: false,
                  thinking: mockThinking,
                  isThinkingCollapsed: false
                };
                
                console.log('添加AI消息对象:', newAIMessage);
                
                setMessages(prev => {
                  const newMessages = [...prev, newAIMessage];
                  console.log('更新后的消息数组:', newMessages);
                  return newMessages;
                });
                
                setCurrentThinking('');
                setCurrentResponse('');
                setIsResponding(false);
                setIsCurrentThinkingCollapsed(false);
                
                setLocationProcessed(false);
              }, 500);
            }
          }, 30);
        }, 1000);
      }
    }, 30);
  };

  // Go back to home
  const handleBack = () => {
    navigate('/home');
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  // New conversation
  const startNewConversation = () => {
    setCurrentThinking('');
    setCurrentResponse('');
    setIsThinking(false);
    setIsResponding(false);
    setLocationProcessed(false);
    
    setMessages([
      {
        id: '1',
        text: '下午好！你今天怎么样？有什么问题尽管问我。',
        isUser: false,
        thinking: '',
        isThinkingCollapsed: false
      }
    ]);
  };

  // 添加切换消息思考区折叠状态的函数
  const toggleThinkingCollapse = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === messageId 
          ? { ...message, isThinkingCollapsed: !message.isThinkingCollapsed }
          : message
      )
    );
  };

  // 切换当前思考区的折叠状态
  const toggleCurrentThinking = () => {
    setIsCurrentThinkingCollapsed(!isCurrentThinkingCollapsed);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <StatusBar />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 pt-10 pb-3 px-4 bg-white rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button 
            onClick={handleBack}
            className="p-2"
          >
            <ChevronLeft size={28} className="text-gray-700" />
          </button>
          
          {/* Avatar and title */}
          <div className="flex items-center flex-1 ml-4">
            <Avatar className="h-14 w-14 border-2 border-purple-100">
              <AvatarImage src="https://img.lovepik.com/element/40116/7811.png_300.png" alt="康友AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h2 className="text-lg font-bold text-gray-800">康友AI</h2>
              <p className="text-xs text-gray-500">医疗健康百科</p>
            </div>
          </div>
          
          {/* Right buttons */}
          <div className="flex items-center space-x-6">
            <button onClick={toggleAudio} className="text-gray-700">
              {audioEnabled ? <Volume2 size={26} /> : <VolumeX size={26} />}
            </button>
            <button onClick={startNewConversation} className="text-gray-700">
              <MessageCirclePlus size={26} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 pt-32 pb-24 px-4 overflow-y-auto">
        {messages.map((message) => {
          // 添加调试日志，但不要让它成为返回值的一部分
          console.log('渲染消息:', message.id, '内容长度:', message.text?.length, '是否用户:', message.isUser);
          
          return (
          <div 
            key={message.id}
            className={`mb-6 ${message.isUser ? 'flex justify-end' : ''}`}
          >
            {message.isUser ? (
              message.isVoice ? (
                <div className="bg-green-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-3/4 flex items-center">
                  <Play size={18} className="mr-2" />
                  <div className="h-5 flex items-center">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div 
                        key={i}
                        className="bg-white w-1 mx-px rounded-full"
                        style={{ 
                          height: `${[7, 9, 12, 15, 10, 8, 5, 8, 10, 15, 12, 9, 7, 5, 8][i % 15]}px`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm">00:01</span>
                </div>
              ) : (
                <div className="bg-green-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-3/4">
                  <p className="text-sm">{message.text}</p>
                </div>
              )
            ) : (
              <div className="w-full">
                {/* 思考区 - 移到回答区前面 */}
                {message.thinking && (
                  <div className="mt-3 mb-3 bg-gray-50 rounded-xl p-3">
                    <div 
                      className="flex items-center text-green-500 mb-1 cursor-pointer"
                      onClick={() => toggleThinkingCollapse(message.id)}
                    >
                      <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-medium">已完成思考</span>
                      <ChevronLeft 
                        size={20} 
                        className={`ml-auto transform transition-transform ${message.isThinkingCollapsed ? 'rotate-270' : 'rotate-90'}`}
                      />
                    </div>
                    {!message.isThinkingCollapsed && (
                      <p className="text-sm text-gray-600">{message.thinking}</p>
                    )}
                  </div>
                )}
                
                {/* 回答区 */}
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm mb-2">
                  <p className="text-sm text-gray-800 leading-relaxed">{message.text}</p>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between items-center px-2">
                  <div className="flex space-x-4">
                    <button className="text-gray-500 p-1">
                      <Play size={20} />
                    </button>
                    <button className="text-gray-500 p-1">
                      <Copy size={20} />
                    </button>
                    <button className="text-gray-500 p-1">
                      <Share size={20} />
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button className="text-gray-500 p-1">
                      <ThumbsUp size={20} />
                    </button>
                    <button className="text-gray-500 p-1">
                      <ThumbsDown size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })}
        
        {/* 当前正在进行的思考和回答 - 先显示思考再显示回答 */}
        {currentThinking && (
          <div className="w-full mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div 
                className="flex items-center text-green-500 mb-1 cursor-pointer"
                onClick={toggleCurrentThinking}
              >
                <svg className={`w-5 h-5 mr-1 ${isThinking ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  {isThinking ? (
                    <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
                <span className="text-sm font-medium">{isThinking ? 'AI思考中...' : '已完成思考'}</span>
                <ChevronLeft 
                  size={20} 
                  className={`ml-auto transform transition-transform ${isCurrentThinkingCollapsed ? 'rotate-270' : 'rotate-90'}`}
                />
              </div>
              {!isCurrentThinkingCollapsed && (
                <p className="text-sm text-gray-600">{currentThinking}</p>
              )}
            </div>
          </div>
        )}
        
        {/* 回答区域 - 只在思考后显示 */}
        {currentResponse && (
          <div className="w-full mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex items-center text-green-500 mb-2">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium">{isResponding ? '正在回答...' : '回答完成'}</span>
              </div>
              <p className="text-sm text-black font-normal">{currentResponse}</p> {/* 添加text-black确保文字可见 */}
            </div>
          </div>
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <ChatInput currentPath="/aichat" onlyShouldShowOnHomePage={false} />
      </div>
    </div>
  );
};

export default AIChat;
