import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ArrowRight, Plus, MessageCircle, Mic, Activity, Droplet, Utensils, Heart, Database, ThumbsUp, Play } from 'lucide-react';
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

  const contentItems = [
    {
      id: 1,
      type: 'article',
      title: '"体重管理年"系列: 体重篇',
      image: '/public/体重管理年系列 体重篇.jpg',
      tag: '体重管理年系列',
      author: '健康管理师',
      likes: 845,
      comments: 75,
    },
    {
      id: 2,
      type: 'video',
      title: '国家出手了！卫健委带你做"减脂餐"',
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '官方指导',
      author: '央视新闻',
      likes: 5100,
      views: 8600,
    },
    {
      id: 3,
      type: 'article',
      title: '吃完这个，我怕你只剩一点点了',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      tag: '饮食控制',
      author: '饮食专家',
      likes: 328,
      comments: 42,
    },
    {
      id: 4,
      type: 'article',
      title: '2025达减肥目标，挑战7斤公主减重',
      image: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '减重挑战',
      author: '减重达人',
      likes: 763,
      comments: 124,
    },
    {
      id: 5,
      type: 'article',
      title: '为什么运动有这么大热量缺口，而且还喝水...',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      tag: '科普知识',
      author: '徐风暖阳',
      likes: 46,
      comments: 15,
    },
    {
      id: 6,
      type: 'video',
      title: '第127天: 77.95kg，差2.95kg达标，今天...',
      image: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '减重日记',
      author: '瘦桐友友_3',
      likes: 23,
      views: 567,
    },
    {
      id: 7,
      type: 'article',
      title: '光，理直气壮的干了...',
      image: 'https://images.unsplash.com/photo-1579126038374-6064e9370f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      tag: '励志故事',
      author: '万物向阳',
      likes: 14,
      comments: 5,
    },
    {
      id: 8,
      type: 'article',
      title: 'DAY 128 | 今天吃了好多好多大枣，上瘾了...',
      image: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
      tag: '小米粥',
      author: '奇迹寒寒',
      likes: 9,
      comments: 3,
    },
  ];

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col min-h-screen bg-black text-white overflow-y-auto pb-16"
    >
      <StatusBar />
      
      {/* Header Section with Avatar, History and Settings - 增加顶部间距 */}
      <div className="w-full px-5 py-2 pt-10 flex justify-between items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400">
          <img 
            src="/lovable-uploads/74077656-41ec-4ddd-9a44-e3279a8ff31c.png" 
            alt="用户头像" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1 bg-gray-700 rounded-full text-sm flex items-center">
            <Activity size={14} className="mr-1" />
            历史对话
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      </div>
      
      {/* Greeting Text - 明确放在圆环上方 */}
      <div className="mt-6 mb-8 text-center w-full px-5">
        <h1 className="text-2xl font-semibold">Hi, 李小明</h1>
      </div>
      
      {/* 更加精美的语音问询组件 */}
      <div 
        ref={chatbotRef}
        className="relative w-40 h-40 mb-5 mx-auto"
        onTouchStart={handleChatbotPress}
      >
        {/* 动态脉冲效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-50 blur-md animate-pulse"></div>
        
        {/* 外部圆环 - 使用白色边框和闪烁动画 */}
        <div className="absolute inset-0 rounded-full border-[3px] border-white/70 animate-[ping_4s_ease-in-out_infinite]"></div>
        
        {/* 中间圆环 - 光晕效果 */}
        <div className="absolute inset-[10px] rounded-full border-[3px] border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        
        {/* 内部圆形 - 深色背景和发光效果 */}
        <div className="absolute inset-[20px] rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center shadow-inner overflow-hidden">
          {/* 显示麦克风图标 */}
          <div className="relative z-10 flex flex-col items-center">
            <Mic size={36} className="text-white mb-1" />
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-1 h-3 bg-white rounded-full animate-[bounce_1.5s_ease-in-out_infinite]" 
                  style={{animationDelay: `${i * 0.2}s`}}
                ></div>
              ))}
            </div>
          </div>
          
          {/* 背景光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 mix-blend-overlay"></div>
        </div>
      </div>
      
      {/* Text below Chatbot */}
      <p className="mt-2 mb-8 text-center font-medium relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 animate-pulse">
          AI健康助手长按语音提问 ✨
        </span>
      </p>
      
      {/* Weight Tracking Card */}
      <div className="w-full px-5 mb-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 flex justify-between items-center">
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
                  item.active ? "bg-blue-100 px-2 py-1 rounded-full" : ""
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
            
            {/* Progress Circle - 更美观的进度显示 */}
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="40" stroke="#E0E0E0" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="url(#progressGradient)" strokeWidth="8" fill="none" 
                  strokeDasharray="251.2" strokeDashoffset="125.6" 
                  transform="rotate(-90 50 50)" />
                <text x="50" y="45" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold">66.9kg</text>
                <text x="50" y="58" textAnchor="middle" fill="black" fontSize="8">今日体重</text>
              </svg>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-black">60.00</div>
              <div className="text-xs text-gray-500">最终目标</div>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-white flex justify-center">
            <span className="text-xs text-gray-500 flex items-center">
              <Activity size={14} className="text-blue-500 mr-1" />
              今日减重 0.85kg
            </span>
          </div>
        </div>
      </div>
      
      {/* Health Report Cards Grid */}
      <div className="w-full px-5 grid grid-cols-2 gap-4 mb-4">
        {/* Health Risk Report - 使用真实图片 */}
        <div 
          className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl p-4 flex flex-col h-32 cursor-pointer overflow-hidden relative shadow-lg"
          onClick={goToHealthRiskReport}
        >
          <div className="flex justify-between items-start mb-auto z-10">
            <h3 className="text-sm font-medium text-black">健康风险报告</h3>
            <ArrowRight size={16} className="text-black" />
          </div>
          <div className="flex-1 flex items-center justify-center z-10">
            <Heart size={24} className="text-red-500 mr-2" />
            <p className="text-xs text-gray-800 font-medium">分析您的健康隐患</p>
          </div>
          {/* 背景图片 */}
          <div className="absolute inset-0 opacity-20">
            <img 
              src="/健康风险报告图.jpg" 
              alt="健康报告背景" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Health Progress */}
        <div 
          className="bg-gradient-to-br from-purple-200 to-purple-400 rounded-xl p-4 flex flex-col h-32 cursor-pointer overflow-hidden relative shadow-lg"
          onClick={goToHealthTrajectory}
        >
          <div className="flex justify-between items-start mb-auto z-10">
            <h3 className="text-sm font-medium text-white">健康轨迹</h3>
            <ArrowRight size={16} className="text-white" />
          </div>
          <div className="flex-1 flex items-center justify-center z-10">
            <Activity size={24} className="text-white mr-2" />
            <p className="text-xs text-white/90 font-medium">跟踪您的健康变化</p>
          </div>
          {/* 图表背景效果 */}
          <div className="absolute inset-0 flex items-end opacity-30">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-16">
              <path 
                d="M0,30 L5,28 L10,29 L15,20 L20,25 L25,18 L30,23 L35,15 L40,20 L45,12 L50,17 L55,5 L60,10 L65,8 L70,15 L75,7 L80,13 L85,3 L90,8 L95,0 L100,5 L100,30 L0,30 Z" 
                fill="white" 
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Health Tools Grid */}
      <div className="w-full px-5 grid grid-cols-2 gap-4 mb-4">
        {/* Tongue Inspection - 使用真实舌苔图片 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 flex flex-col h-48 shadow-lg overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-white">舌苔监测</h3>
            <ArrowRight size={16} className="text-white" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-700">
              <img 
                src="/lovable-uploads/203e265d-cf69-4459-8298-f8d6413e93a7.png" 
                alt="舌苔监测示例" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center">
            <Heart size={14} className="mr-1 text-red-400" />
            AI舌诊分析您的健康状况
          </p>
        </div>
        
        {/* Water Intake - 更现代化的水分摄入追踪 */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 flex flex-col h-48 overflow-hidden shadow-lg relative">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-sm font-medium text-white">喝水</h3>
              <p className="text-xs text-white/80">5:30更新</p>
            </div>
            <ArrowRight size={16} className="text-white" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center z-10">
            <span className="text-2xl font-bold text-white">300 毫升</span>
            <div className="mt-2 w-12 h-20 bg-blue-200/40 rounded-full relative overflow-hidden backdrop-blur-sm">
              <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-100 to-blue-200 animate-pulse"></div>
              {/* 水波纹动画效果 */}
              <div className="absolute bottom-[50%] left-0 right-0 h-1 bg-white/30 transform -translate-y-1/2"></div>
            </div>
            <div className="mt-3 w-full flex justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 mx-1 rounded-full ${i <= 2 ? 'bg-white' : 'bg-blue-200/40'}`}
                ></div>
              ))}
            </div>
          </div>
          {/* 水滴背景元素 */}
          <div className="absolute -right-2 -bottom-2 opacity-10">
            <Droplet size={80} className="text-white" />
          </div>
        </div>
      </div>
      
      {/* Calorie Tracking and Health Data Collection */}
      <div className="w-full px-5 grid grid-cols-2 gap-4 mb-4">
        {/* Calorie Card - 使用真实食物图片 */}
        <div className="bg-white rounded-xl p-4 flex flex-col h-80 overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-black">卡路里摄入</h3>
              <p className="text-xs text-gray-500">5:30更新</p>
            </div>
            <ArrowRight size={16} className="text-black" />
          </div>
          
          <div className="mt-2 text-left flex items-center">
            <div>
              <p className="text-sm text-black font-medium">还可吃</p>
              <p className="text-2xl font-bold text-black flex items-center">
                300 
                <span className="text-sm ml-1">千卡</span>
              </p>
            </div>
            <div className="ml-auto">
              <Utensils size={24} className="text-blue-500" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-3 overflow-y-auto mt-2">
            {[
              {meal: '早餐', kcal: 300, img: '/lovable-uploads/b545d173-0e2d-4a9b-825b-2e802baaea29.png'},
              {meal: '午餐', kcal: 450, img: '/lovable-uploads/b545d173-0e2d-4a9b-825b-2e802baaea29.png'},
              {meal: '晚餐', kcal: 400, img: '/lovable-uploads/b545d173-0e2d-4a9b-825b-2e802baaea29.png'},
              {meal: '小吃', kcal: 150, img: '/lovable-uploads/b545d173-0e2d-4a9b-825b-2e802baaea29.png'}
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 mr-3 flex-shrink-0 rounded-lg overflow-hidden">
                  <img src={item.img} alt={item.meal} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-black truncate font-medium">{item.meal}</p>
                  <p className="text-xs text-gray-500 truncate">{item.kcal} 千卡</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Health Data Collection - 更现代化的健康数据展示 */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 flex flex-col h-80 overflow-hidden shadow-lg relative">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-white">健康数据采集</h3>
              <p className="text-xs text-gray-400">5:30更新</p>
            </div>
            <ArrowRight size={16} className="text-white" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-4 mt-2 z-10">
            {[
              {label: '血压', value: '120/80 mmHg', icon: <Heart size={16} className="text-red-400" />},
              {label: '血糖', value: '5.5 mmol/L', icon: <Activity size={16} className="text-blue-400" />},
              {label: '心率', value: '72 次/分钟', icon: <Activity size={16} className="text-green-400" />},
              {label: '睡眠', value: '7.5 小时/天', icon: <Activity size={16} className="text-purple-400" />},
              {label: '运动', value: '5000 步/天', icon: <Activity size={16} className="text-yellow-400" />}
            ].map((item, index) => (
              <div key={index} className="flex items-center bg-gray-700/50 p-2 rounded-lg">
                <div className="mr-2">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{item.label}</p>
                  <p className="text-sm text-white font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* 背景数据流动效果 */}
          <div className="absolute inset-0 opacity-5">
            <Database size={200} className="absolute -right-10 -bottom-10 text-white" />
          </div>
        </div>
      </div>
      
      {/* Add Health Tools Button - 更现代的按钮设计 */}
      <div className="w-full px-5 mb-4">
        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/20 transition-all">
          <Plus size={20} className="mr-2" />
          添加新健康工具
        </button>
      </div>
      
      {/* "大家都在看" Content Stream Section */}
      <div className="w-full px-5 mb-20">
        <div className="bg-gray-100 rounded-t-3xl pt-6 pb-8 rounded-b-3xl">
          <div className="px-5 mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                <span className="text-orange-500">🔍</span>
              </div>
              <h2 className="text-xl font-bold text-black">大家都在看</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {contentItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm h-60"
                >
                  <div className="relative h-32">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                          <Play size={16} className="text-white ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/80 text-black font-medium">
                        #{item.tag}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-2 flex flex-col h-28">
                    <h3 className="text-sm font-medium text-black line-clamp-2 mb-1">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <div className="flex items-center">
                        <span className="truncate max-w-20">{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.type === 'video' ? (
                          <>
                            <span className="flex items-center">
                              <Play size={10} className="mr-0.5" />
                              {item.views}
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center">
                            <MessageCircle size={10} className="mr-0.5" />
                            {item.comments}
                          </span>
                        )}
                        <span className="flex items-center">
                          <ThumbsUp size={10} className="mr-0.5" />
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center my-6 text-xs text-gray-400">
              <div className="h-px bg-gray-200 flex-grow"></div>
              <span className="mx-4">— 已经到底了 —</span>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button 
                onClick={() => navigate('/knowledge-base')}
                className="py-3 px-4 rounded-full bg-blue-100 text-blue-500 font-medium flex items-center justify-center"
              >
                更多内容 <ArrowRight size={16} className="ml-1" />
              </button>
              <button 
                onClick={() => navigate('/shop')}
                className="py-3 px-4 rounded-full bg-green-100 text-green-500 font-medium flex items-center justify-center"
              >
                更多商品 <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Chatbot Button - 更现代化的语音助手浮动按钮 */}
      {showFloatingButton && (
        <div 
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-purple-700 to-purple-900 border-2 border-purple-300 flex items-center justify-center z-50 shadow-lg shadow-purple-500/20"
          onTouchStart={handleChatbotPress}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-800 to-blue-900 opacity-70 animate-pulse"></div>
          <Mic size={20} className="text-white z-10" />
        </div>
      )}
      
      {/* Bottom Navigation - 使用更现代化的导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2 z-40">
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
