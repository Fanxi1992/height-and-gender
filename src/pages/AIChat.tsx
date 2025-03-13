
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Volume2, PlusCircle, Play, Copy, Share, ThumbsUp, ThumbsDown } from 'lucide-react';
import ChatInput from '../components/ChatInput';

interface LocationState {
  message?: string;
  isVoiceMessage?: boolean;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMuted, setIsMuted] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [isVoiceMessage, setIsVoiceMessage] = useState(false);
  
  // Extract location state in a type-safe way
  const locationState = location.state as LocationState | null;
  
  useEffect(() => {
    if (locationState) {
      setUserMessage(locationState.message || "");
      setIsVoiceMessage(locationState.isVoiceMessage || false);
      
      // Simulate AI thinking and responding
      setIsThinking(true);
      
      // After 1.5 seconds, show thinking result and start response
      setTimeout(() => {
        setIsThinking(false);
        
        // Stream the response character by character
        const fullResponse = "根据你的健康数据和减重目标，我建议你可以尝试以下几点：\n\n1. 控制每日热量摄入在1500-1800千卡之间\n2. 增加蛋白质的摄入，每天至少摄入体重(kg)×1.5克的蛋白质\n3. 每周进行3-4次中等强度的有氧运动，每次30-45分钟\n4. 每周进行2-3次力量训练，增加基础代谢率\n5. 保证充足的睡眠，每晚7-8小时\n6. 每天喝足够的水，至少2升\n\n这些建议需要坚持至少8周才能看到明显效果。如果有任何不适，请及时咨询医生。";
        let i = 0;
        
        const interval = setInterval(() => {
          if (i < fullResponse.length) {
            setResponse(prev => prev + fullResponse[i]);
            i++;
          } else {
            clearInterval(interval);
          }
        }, 30);
      }, 1500);
    }
  }, [locationState]);
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const startNewChat = () => {
    navigate('/aichat', { state: { message: "", isVoiceMessage: false } });
    setUserMessage("");
    setResponse("");
    setIsThinking(false);
  };
  
  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-[#111] py-3 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center">
          <button onClick={goBack} className="mr-3">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <img 
                src="/lovable-uploads/74077656-41ec-4ddd-9a44-e3279a8ff31c.png" 
                alt="AI助手" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium">康友AI</p>
              <p className="text-xs text-gray-400">你的24h慢病管理专家</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={toggleMute} className={`mr-3 ${isMuted ? 'text-gray-500' : 'text-white'}`}>
            <Volume2 size={20} />
          </button>
          <button onClick={startNewChat}>
            <PlusCircle size={20} />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto pt-16 pb-24 px-4">
        {/* Welcome Message */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4 max-w-[85%]">
            <p>下午好！你今天怎么样？有什么问题尽管问我。</p>
            
            <div className="flex items-center mt-3 space-x-3">
              <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Play size={16} />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Copy size={16} />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Share size={16} />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <ThumbsUp size={16} />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <ThumbsDown size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* User Message */}
        {userMessage && (
          <div className="flex justify-end mb-6">
            <div className="bg-blue-600 rounded-lg p-4 max-w-[85%]">
              {isVoiceMessage ? (
                <div className="flex items-center">
                  <div className="w-full bg-blue-800 h-8 rounded-full px-3 flex items-center">
                    <div className="flex-1 flex items-center justify-between space-x-1">
                      {[...Array(20)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-blue-200 w-0.5" 
                          style={{ 
                            height: `${Math.max(3, Math.min(20, Math.random() * 20))}px`,
                            opacity: 0.7 + Math.random() * 0.3
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <span className="ml-2 text-sm">0:08</span>
                </div>
              ) : (
                <p>{userMessage}</p>
              )}
            </div>
          </div>
        )}
        
        {/* AI Response */}
        {(isThinking || response) && (
          <div className="mb-6">
            {isThinking ? (
              <div className="bg-gray-800 rounded-lg p-4 max-w-[85%]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  <span className="ml-2 text-sm text-gray-400">思考中...</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 max-w-[85%]">
                <p className="whitespace-pre-line">{response}</p>
                
                <div className="flex items-center mt-3 space-x-3">
                  <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Play size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Copy size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Share size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <ThumbsUp size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <ThumbsDown size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <ChatInput currentPath="/aichat" onlyShouldShowOnHomePage={false} />
      </div>
    </div>
  );
};

export default AIChat;
