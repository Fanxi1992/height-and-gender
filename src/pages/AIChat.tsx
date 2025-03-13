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
      thinking: ''
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [currentThinking, setCurrentThinking] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [locationProcessed, setLocationProcessed] = useState(false);
  
  // Mock thinking and response text
  const mockThinking = "嗯.....这个问题似乎简单：'你是谁？'不过话说回来，对于一个人工智能来说，这是一个非常深刻的问题呢。让我仔细想想该怎么回答才能既简单明了又能传达我们的核心理念。";
  const mockResponse = "嗨，看起来你想开个玩笑呢！不过不用担心，我很高兴回答你的问题：'我是康友AI，一位来自智诊科技团队的全科医疗健康小管家。'我的任务就是为你提供全方位的健康管理和咨询服务。无论你有什么健康方面的小困惑，都可以来找我聊聊。我会运用最新的医学知识和技术，尽力帮您解决问题。希望能为您带来有价值的帮助呀～ 😊";
  
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
    
    setLocationProcessed(true);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      isVoice
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
                setMessages(prev => [
                  ...prev, 
                  { 
                    id: Date.now().toString(), 
                    text: mockResponse, 
                    isUser: false,
                    thinking: mockThinking
                  }
                ]);
                setCurrentThinking('');
                setCurrentResponse('');
                setIsResponding(false);
                
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
        thinking: ''
      }
    ]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <StatusBar />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 pt-10 pb-3 px-4 bg-white rounded-b-3xl shadow-sm">
        <div className="flex items-center">
          {/* Back button */}
          <button 
            onClick={handleBack}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Avatar and title */}
          <div className="flex items-center ml-2">
            <Avatar className="h-10 w-10 border-2 border-purple-100">
              <AvatarImage src="/lovable-uploads/19e9cb5f-c68b-4b14-b9d4-c010f340a31b.png" alt="康友AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h2 className="text-base font-semibold">康友AI</h2>
              <p className="text-xs text-gray-500">你的24h慢病管理专家</p>
            </div>
          </div>
          
          {/* Right buttons */}
          <div className="ml-auto flex items-center space-x-4">
            <button onClick={toggleAudio} className="text-gray-500">
              {audioEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <button onClick={startNewConversation} className="text-gray-500">
              <MessageCirclePlus size={22} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 pt-32 pb-24 px-4 overflow-y-auto">
        {messages.map((message) => (
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
                          height: `${Math.random() * 12 + 3}px`,
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
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm mb-2">
                  <p className="text-sm">{message.text}</p>
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
                
                {/* Thinking section (collapsible) */}
                {message.thinking && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center text-green-500 mb-1">
                      <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-medium">已完成思考</span>
                      <ChevronLeft size={20} className="ml-auto transform rotate-90" />
                    </div>
                    <p className="text-sm text-gray-600">{message.thinking}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* 当前正在进行的思考和回答 - 只在存在内容且不是已完成消息时显示 */}
        {currentThinking && (
          <div className="w-full mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center text-green-500 mb-1">
                <svg className={`w-5 h-5 mr-1 ${isThinking ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  {isThinking ? (
                    <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
                <span className="text-sm font-medium">{isThinking ? 'AI思考中...' : '已完成思考'}</span>
                <ChevronLeft size={20} className="ml-auto transform rotate-90" />
              </div>
              <p className="text-sm text-gray-600">{currentThinking}</p>
            </div>
          </div>
        )}
        
        {/* 回答区域 - 只在存在内容且不是已完成消息时显示 */}
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
              <p className="text-sm text-black">{currentResponse}</p>
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
