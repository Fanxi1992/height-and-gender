import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ArrowRight, Plus, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (chatbotRef.current && containerRef.current) {
        const rect = chatbotRef.current.getBoundingClientRect();
        setShowFloatingButton(rect.bottom < 0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const handleChatbotPress = () => {
    console.log('Chatbot long press activated');
    // Voice chat functionality would be implemented here
  };

  const weekDays = [
    { day: '周五', date: '21', active: false },
    { day: '周六', date: '22', active: false },
    { day: '周日', date: '23', active: false },
    { day: '今天', date: '24', active: true },
    { day: '周二', date: '25', active: false },
    { day: '周三', date: '26', active: false },
  ];

  const goToHealthRiskReport = () => {
    navigate('/health-risk-report');
  };

  const goToHealthTrajectory = () => {
    navigate('/health-trajectory');
  };
  
  const goToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  const goToShop = () => {
    navigate('/shop');
  };

  const goToCircle = () => {
    navigate('/circle');
  };

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col min-h-screen bg-black text-white"
    >
      <StatusBar />
      
      {/* Header Section with Avatar, History and Settings - 增加顶部间距 */}
      <div className="w-full px-5 py-2 pt-10 flex justify-between items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        <div className="flex gap-2">
          <button className="px-4 py-1 bg-gray-700 rounded-full text-sm">历史对话</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      </div>
      
      {/* Greeting Text - 明确放在圆环上方 */}
      <div className="mt-6 mb-8 text-center w-full px-5">
        <h1 className="text-2xl font-semibold">Hi, 李小明</h1>
      </div>
      
      {/* Chatbot Circle - 重新设计嵌套圆环 */}
      <div 
        ref={chatbotRef}
        className="relative w-40 h-40 mb-5 mx-auto"
        onTouchStart={handleChatbotPress}
      >
        {/* 发光背景效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-50 blur-md"></div>
        
        {/* 外部圆环 - 使用白色边框 */}
        <div className="absolute inset-0 rounded-full border-[3px] border-white/70"></div>
        
        {/* 中间圆环 - 使用白色边框 */}
        <div className="absolute inset-[10px] rounded-full border-[3px] border-white/80"></div>
        
        {/* 内部圆形 - 深色背景 */}
        <div className="absolute inset-[20px] rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center shadow-inner">
          {/* 显示消息图标 */}
          <MessageCircle size={36} className="text-white" />
        </div>
      </div>
      
      {/* Text below Chatbot */}
      <p className="mt-2 mb-8 text-center font-medium relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 animate-pulse">
          健康问题长按提问 ✨
        </span>
      </p>
      
      {/* Weight Tracking Card */}
      <div className="w-full px-5 mb-4">
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-blue-400 text-white px-4 py-2 flex justify-between items-center">
            <div className="flex-1">
              <span className="text-sm font-medium">体重风险打卡</span>
              <span className="ml-2 text-xs">第1/28天</span>
            </div>
            <ArrowRight size={16} />
          </div>
          
          {/* Week Calendar */}
          <div className="flex justify-between px-4 py-2 bg-white">
            {weekDays.map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex flex-col items-center",
                  item.active ? "bg-gray-200 px-2 py-1 rounded-full" : ""
                )}
              >
                <span className="text-xs text-gray-500">{item.day}</span>
                <span className="text-xs font-medium text-black">{item.date}</span>
              </div>
            ))}
          </div>
          
          {/* Weight Progress */}
          <div className="px-4 py-4 bg-white flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">70.00</div>
              <div className="text-xs text-gray-500">初始体重</div>
            </div>
            
            {/* Progress Circle */}
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" stroke="#E0E0E0" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#9370DB" strokeWidth="8" fill="none" 
                  strokeDasharray="251.2" strokeDashoffset="125.6" 
                  transform="rotate(-90 50 50)" />
                <text x="50" y="45" textAnchor="middle" fill="black" fontSize="10">66.9kg</text>
                <text x="50" y="58" textAnchor="middle" fill="black" fontSize="8">今日体重</text>
              </svg>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-black">60.00</div>
              <div className="text-xs text-gray-500">最终目标</div>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-white flex justify-center">
            <span className="text-xs text-gray-500">今日减重 0.85kg</span>
          </div>
        </div>
      </div>
      
      {/* Health Report Cards Grid */}
      <div className="w-full px-5 grid grid-cols-2 gap-4 mb-4">
        {/* Health Risk Report */}
        <div 
          className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl p-4 flex flex-col h-32 cursor-pointer"
          onClick={goToHealthRiskReport}
        >
          <div className="flex justify-between items-start mb-auto">
            <h3 className="text-sm font-medium text-black">健康风险报告</h3>
            <ArrowRight size={16} className="text-black" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-600">XXXXXXXXXXXXX</p>
          </div>
        </div>
        
        {/* Health Progress */}
        <div 
          className="bg-gradient-to-br from-purple-200 to-purple-400 rounded-xl p-4 flex flex-col h-32 cursor-pointer"
          onClick={goToHealthTrajectory}
        >
          <div className="flex justify-between items-start mb-auto">
            <h3 className="text-sm font-medium text-white">健康轨迹</h3>
            <ArrowRight size={16} className="text-white" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-white/80">XXXXXXXXXXXXX</p>
          </div>
        </div>
      </div>
      
      {/* Health Tools Grid */}
      <div className="w-full px-5 grid grid-cols-2 gap-4 mb-4">
        {/* Tongue Inspection */}
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col h-48">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-white">舌苔监测</h3>
            <ArrowRight size={16} className="text-white" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-700"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">XXXXXXXXXXXXX</p>
        </div>
        
        {/* Water Intake - Fixed overflow */}
        <div className="bg-blue-400 rounded-xl p-4 flex flex-col h-48 overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-black">喝水</h3>
              <p className="text-xs text-black/70">5:30更新</p>
            </div>
            <ArrowRight size={16} className="text-black" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-black">300 毫升</span>
            <div className="mt-2 w-12 h-20 bg-blue-200 rounded-md relative overflow-hidden">
              <div className="absolute bottom-0 w-full h-1/2 bg-blue-500"></div>
            </div>
            <div className="mt-2 w-full flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-4 h-4 mr-1 ${i <= 2 ? 'bg-black' : 'bg-blue-200'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Calorie Tracking and Health Data Collection - Fixed overflows */}
      <div className="w-full px-5 grid grid-cols-2 gap-4 mb-4">
        {/* Calorie Card */}
        <div className="bg-white rounded-xl p-4 flex flex-col h-80 overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-black">卡路里摄照</h3>
              <p className="text-xs text-gray-500">5:30更新</p>
            </div>
            <ArrowRight size={16} className="text-black" />
          </div>
          
          <div className="mt-2 text-left">
            <p className="text-sm text-black font-medium">还可吃</p>
            <p className="text-2xl font-bold text-black">300 千卡</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-3 overflow-y-auto">
            {['早餐', '午餐', '晚餐', '小吃'].map((meal, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-black truncate">{meal}</p>
                  <p className="text-xs text-gray-500 truncate">300 千卡</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Health Data Collection */}
        <div className="bg-gray-700 rounded-xl p-4 flex flex-col h-80 overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-white">健康数据采集</h3>
              <p className="text-xs text-gray-400">5:30更新</p>
            </div>
            <ArrowRight size={16} className="text-white" />
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <p className="text-xs text-gray-400 w-full truncate">
              XXXXXXXXXXXXX<br />
              XXXXXXXXXXXXX<br />
              XXXXXXXXXXXXX<br />
              XXXXXXXXXXXXX<br />
              XXXXXXXXXXXXX
            </p>
          </div>
        </div>
      </div>
      
      {/* Add Health Tools Button */}
      <div className="w-full px-5 mb-20">
        <button className="w-full bg-blue-500 text-white py-3 rounded-full flex items-center justify-center">
          <Plus size={20} className="mr-2" />
          添加新健康工具
        </button>
      </div>
      
      {/* Floating Chatbot Button - Updated to use MessageCircle icon */}
      {showFloatingButton && (
        <div 
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-purple-800 border-2 border-purple-300 flex items-center justify-center z-50"
          onTouchStart={handleChatbotPress}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-800 to-blue-900 opacity-70"></div>
          <MessageCircle size={20} className="text-white z-10" />
        </div>
      )}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToKnowledgeBase}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <span className="text-xs">知识库</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToCircle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span className="text-xs">圈子</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToShop}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span className="text-xs">商城</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={() => navigate('/my')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
