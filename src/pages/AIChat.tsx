
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Plus } from 'lucide-react';
import ChatInput from '../components/ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '我是你的健康助手小张医生，很高兴见到你！',
      isUser: false
    },
    {
      id: '2',
      text: '我可以帮你预测风险、推荐食谱、分析营养、制定健身计划、欢迎向我提问，还有更多等你来发现～',
      isUser: false
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

  // Handle sending message
  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      const newMessage = {
        id: generateUniqueId(),
        text: message,
        isUser: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom after message is added
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Handle clicking on a common question
  const handleCommonQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="relative flex items-center justify-center py-4 border-b border-gray-800">
        <button 
          onClick={handleBack}
          className="absolute left-4 p-2"
        >
          <Menu size={24} className="text-white" />
        </button>
        
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Doctor avatar */}
        <div className="flex flex-col items-center justify-center mb-8">
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
                  : 'flex justify-center'
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[90%] ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-black'
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
              className="px-4 py-2 bg-white rounded-full text-black text-sm whitespace-nowrap"
            >
              {question}
            </button>
          ))}
        </div>
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center bg-[#333333] rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="给 Healthbot 发送消息"
            className="flex-1 bg-transparent text-white border-none outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button className="ml-2 text-gray-400">
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      {/* Bottom tab bar */}
      <div className="flex justify-around py-3 bg-black border-t border-gray-800">
        <button 
          onClick={() => navigate('/home')}
          className="flex flex-col items-center space-y-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          <span className="text-xs text-gray-400">主页</span>
        </button>
        
        <button className="flex flex-col items-center space-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <span className="text-xs text-white">机器人</span>
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
