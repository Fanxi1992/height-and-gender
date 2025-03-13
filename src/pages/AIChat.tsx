
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import ChatInput from '../components/ChatInput';
import { ArrowLeft, Volume2, VolumeX, Play, Copy, Share, ThumbsUp, ThumbsDown, MessageSquarePlus, Check, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant' | 'greeting';
    content: string;
    isVoice?: boolean;
    voiceDuration?: string;
    thinking?: string;
  }>>([
    {
      type: 'greeting',
      content: '下午好！你今天怎么样？有什么问题尽管问我。',
      thinking: ''
    }
  ]);
  const [currentThinking, setCurrentThinking] = useState('');
  const [visibleThinking, setVisibleThinking] = useState('');
  const [currentReply, setCurrentReply] = useState('');
  const [visibleReply, setVisibleReply] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For auto-scrolling to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, visibleThinking, visibleReply]);

  // Simulates streaming effect for the AI thinking
  useEffect(() => {
    if (currentThinking && isTyping) {
      let index = visibleThinking.length;
      const timer = setTimeout(() => {
        if (index < currentThinking.length) {
          setVisibleThinking(currentThinking.substring(0, index + 1));
        } else {
          // Start typing the reply once thinking is complete
          setCurrentReply(getRandomResponse());
          setVisibleReply('');
        }
      }, 15);
      return () => clearTimeout(timer);
    }
  }, [visibleThinking, currentThinking, isTyping]);

  // Simulates streaming effect for the AI reply
  useEffect(() => {
    if (currentReply && isTyping) {
      let index = visibleReply.length;
      const timer = setTimeout(() => {
        if (index < currentReply.length) {
          setVisibleReply(currentReply.substring(0, index + 1));
        } else {
          setIsTyping(false);
          // Add complete message to the messages array
          setMessages(prev => [...prev.slice(0, -1), {
            ...prev[prev.length - 1],
            thinking: currentThinking,
            content: currentReply
          }]);
        }
      }, 25);
      return () => clearTimeout(timer);
    }
  }, [visibleReply, currentReply, isTyping]);

  const getRandomResponse = () => {
    const responses = [
      "嗨，看起来你想开个玩笑呢！不过不用担心，我很高兴回答你的问题：「我是好小伴，一位来自智诊科技团队的全科医疗健康小管家。」我的任务就是为你提供全方位的健康管理和咨询服务。无论你有什么健康方面的小困惑，都可以来找我聊聊。我会运用最新的医学知识和技术，尽力帮您解决问题。希望能为您带来有价值的帮助呀～ 😊",
      "我是康友AI，你的24小时慢病管理专家。我可以帮助你监测健康指标、提供健康建议、回答医疗问题，以及帮助你更好地管理慢性疾病。无论何时何地，我都会为你提供专业的健康支持和关怀。",
      "作为你的健康管理助手，我会根据最新的医学研究和指南，为你提供个性化的健康建议。我可以帮助你设定健康目标、追踪进度、解答疑问，并在需要时提醒你按时服药或复诊。我的目标是帮助你更轻松地管理健康，提高生活质量。"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getRandomThinking = () => {
    const thoughts = [
      "嗯.....这个问题似乎简单："你是谁？"不过话说回来，对于一个人工智能来说，这是一个非常深刻的问题呢。让我仔细想想该怎么回答才能既简单明了又能传达我们的核心理念。\n\n首先，"我是好小伴,"这句话直接而友好，一下子就拉近了距离。然后提到我的身份——"一位来自智诊科技团队的全科医疗健康小管家"，这就明确了我在用户心中的角色定位。接着，强调一下我的使命吧："专注于为您提供个性化的健康管理服务。"这样一来，就让用户明白我不是万能的，而是专门为了他们的健康而来。\n\n说到这个，我也应该提一提我的强大后台："基于最新的医学研究成果和技术发展，我能提供最可靠的信息。"这一点很重要哦，毕竟信任是我们合作的基础啊！\n\n最后，用一种轻松的语气收尾："希望能成为您信赖的健康顾问！"这样的结束语不仅表达了我对未来的期待，也让人感觉亲近可爱。\n\n整体来看，这段自我介绍既要简洁又要包含关键信息点，同时还要传递出热情和专业的态度。",
      "咳咳...看来用户是在用一种不太正式的方式来确认我的身份或者测试系统的反应。他们可能是想看看我会如何回应这种非标准的查询。\n\n首先，"嘎嘎嘎嘎"这个声音似乎是一种幽默或者说玩笑的表现形式。也许他们在尝试用这种方式来引发一些有趣的互动呢？不过话说回来，这也有可能只是无意识的动作或是某种特定情境下的行为表现。\n\n其次，关于"你是谁？"这个问题，虽然表面上看这是一个简单的自我介绍请求，但实际上，它也可能隐藏着更深层次的意义——比如想了解我的角色定位、功能范围以及背后的技术支撑。\n\n最后，考虑到这些因素，我觉得应该给予一个既尊重用户情绪又能明确传达自己身份的回答。",
    ];
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const goBack = () => {
    navigate('/home');
  };

  const startNewChat = () => {
    setMessages([{
      type: 'greeting',
      content: '下午好！你今天怎么样？有什么问题尽管问我。',
      thinking: ''
    }]);
  };

  const handleSendMessage = (text: string, isVoice: boolean = false) => {
    // Add user message
    const userMessage = {
      type: 'user' as const,
      content: text,
      isVoice
    };
    
    if (isVoice) {
      userMessage.voiceDuration = '00:01';
    }
    
    setMessages(prev => [...prev, userMessage]);
    
    // Prepare AI response (with thinking first)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'assistant' as const,
        content: '', // To be filled by the typing animation
        thinking: ''
      }]);
      
      // Start the thinking animation
      setCurrentThinking(getRandomThinking());
      setVisibleThinking('');
      setIsTyping(true);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <StatusBar />
      
      {/* Header with back button, AI info, and controls */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white rounded-b-3xl shadow-md pt-10 pb-4">
        <div className="flex items-center justify-between px-4">
          <button onClick={goBack} className="p-2">
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
              <img 
                src="/lovable-uploads/ff598303-4d96-48e3-9296-ac5633888d01.png" 
                alt="AI Avatar" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-medium text-gray-900">好小伴</h2>
              <p className="text-xs text-gray-500">你的24h慢病管理专家</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <button onClick={toggleSound} className="p-2 mr-1">
              {soundEnabled ? 
                <Volume2 size={22} className="text-gray-800" /> : 
                <VolumeX size={22} className="text-gray-800" />
              }
            </button>
            <button onClick={startNewChat} className="p-2">
              <MessageSquarePlus size={22} className="text-gray-800" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 pt-28 pb-24 px-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.type === 'user' ? 'flex justify-end' : ''}`}
          >
            {message.type !== 'user' ? (
              <div className="bg-white rounded-2xl p-4 shadow-sm max-w-[90%]">
                <p className="text-gray-800 mb-4">{message.content}</p>
                
                {/* Action buttons for AI messages */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="text-gray-500">
                      <Play size={20} />
                    </button>
                    <button className="text-gray-500">
                      <Copy size={20} />
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button className="text-gray-500">
                      <Share size={20} />
                    </button>
                    <button className="text-gray-500">
                      <ThumbsUp size={20} />
                    </button>
                    <button className="text-gray-500">
                      <ThumbsDown size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              message.isVoice ? (
                <div className="bg-green-500 rounded-full py-2 px-4 text-white flex items-center mb-1 max-w-[70%]">
                  <Play size={18} className="mr-2" />
                  <div className="flex-1 mx-2">
                    <div className="w-full h-6">
                      <svg viewBox="0 0 100 30" className="w-full h-full">
                        <path
                          d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,15 T100,15"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs">{message.voiceDuration}</span>
                </div>
              ) : (
                <div className="bg-green-500 rounded-2xl py-3 px-4 text-white mb-1 max-w-[70%]">
                  {message.content}
                </div>
              )
            )}
          </div>
        ))}
        
        {/* Display thinking animation if the AI is currently thinking */}
        {isTyping && visibleThinking && (
          <div className="bg-gray-50 rounded-2xl p-4 shadow-sm mb-4 max-w-[90%]">
            <div className="flex items-center mb-2 text-green-500">
              <Check size={18} className="mr-2" />
              <span className="font-medium">已完成思考</span>
              <ChevronUp size={18} className="ml-auto" />
            </div>
            <p className="text-gray-600 whitespace-pre-line text-sm">{visibleThinking}</p>
          </div>
        )}
        
        {/* Display AI typing animation if applicable */}
        {isTyping && currentReply && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 max-w-[90%]">
            <p className="text-gray-800">{visibleReply}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <ChatInput currentPath="/ai-chat" onlyShouldShowOnHomePage={false} />
      </div>
    </div>
  );
};

export default AIChat;
