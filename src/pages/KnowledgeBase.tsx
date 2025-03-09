import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { Search, BookmarkPlus, ChevronRight, Eye, ThumbsUp, Play, BookOpen } from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/home');
  };

  const goToShop = () => {
    navigate('/shop');
  };

  const goToCircle = () => {
    navigate('/circle');
  };

  return (
    <div className="flex flex-col items-center h-screen w-full overflow-y-auto bg-black text-white relative">
      <StatusBar />
      
      {/* Header */}
      <div className="w-full px-5 py-2 pt-10 flex justify-between items-center">
        <div className="text-xl font-bold">知识库</div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full">
          <BookmarkPlus size={20} />
        </button>
      </div>
      
      {/* Content */}
      <div className="w-full px-5 pb-20">
        {/* Search Bar */}
        <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 mb-5 mt-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="搜索健康知识..." 
            className="bg-transparent flex-1 border-none text-white focus:outline-none"
          />
        </div>
        
        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar mb-5 pb-2">
          <div className="category-pill category-pill-active mr-2">推荐</div>
          <div className="category-pill category-pill-inactive mr-2">减重科普</div>
          <div className="category-pill category-pill-inactive mr-2">饮食营养</div>
          <div className="category-pill category-pill-inactive mr-2">运动健身</div>
          <div className="category-pill category-pill-inactive mr-2">慢病管理</div>
          <div className="category-pill category-pill-inactive mr-2">心理健康</div>
          <div className="category-pill category-pill-inactive mr-2">睡眠改善</div>
        </div>
        
        {/* Featured Article */}
        <div className="relative rounded-xl overflow-hidden mb-6 h-44 shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="特色文章" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h3 className="font-semibold text-lg mb-2">科学减重：如何制定适合自己的减重计划</h3>
            <div className="flex justify-between text-xs opacity-80">
              <div>营养学专家 · 王医生</div>
              <div>10分钟阅读</div>
            </div>
          </div>
        </div>
        
        {/* Topic Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-app-blue text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>
            </div>
            <h4 className="font-semibold text-sm mb-1">体重管理</h4>
            <p className="text-xs text-gray-400">128篇文章</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-green-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m2 12 2.5 2.5L7 12"></path><path d="m10 19 2.5 2.5 2.5-2.5"></path><path d="m17 12 2.5-2.5L22 12"></path><path d="m10 5 2.5-2.5L15 5"></path></svg>
            </div>
            <h4 className="font-semibold text-sm mb-1">健康饮食</h4>
            <p className="text-xs text-gray-400">96篇文章</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-purple-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
            </div>
            <h4 className="font-semibold text-sm mb-1">慢病防治</h4>
            <p className="text-xs text-gray-400">85篇文章</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-blue-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l2 2"></path><path d="M9 12a4 4 0 0 0-8 0"></path><path d="m22 12-3-3"></path><path d="M13 5.5a4 4 0 0 0 7.3 2.25"></path><path d="m15 20 2-2"></path><path d="M20 17a4 4 0 0 0-8 0"></path><path d="M12 13c2.2-1.65 4-4.3 4-6.5a4 4 0 1 0-8 0c0 2.2 1.8 4.85 4 6.5Z"></path></svg>
            </div>
            <h4 className="font-semibold text-sm mb-1">科学运动</h4>
            <p className="text-xs text-gray-400">74篇文章</p>
          </div>
        </div>
        
        {/* Latest Articles */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">最新文章</h3>
            <div className="text-sm text-app-blue flex items-center">
              查看全部 <ChevronRight size={16} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="文章图片" 
                className="w-full h-28 object-cover"
              />
              <div className="p-3">
                <h4 className="font-semibold text-base mb-1 line-clamp-2">控制碳水摄入：低碳饮食的科学指南</h4>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">了解如何科学控制碳水化合物摄入，避免常见误区，实现健康减重。</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>2023-10-12</div>
                  <div className="flex">
                    <div className="flex items-center mr-3">
                      <Eye size={14} className="mr-1" />
                      <span>2.3k</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp size={14} className="mr-1" />
                      <span>156</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="文章图片" 
                className="w-full h-28 object-cover"
              />
              <div className="p-3">
                <h4 className="font-semibold text-base mb-1 line-clamp-2">高血压患者的饮食指南：如何通过饮食控制血压</h4>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">专业医生为您解析高血压患者的饮食禁忌与推荐，助您稳定血压。</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>2023-10-10</div>
                  <div className="flex">
                    <div className="flex items-center mr-3">
                      <Eye size={14} className="mr-1" />
                      <span>1.8k</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp size={14} className="mr-1" />
                      <span>132</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">视频讲解</h3>
            <div className="text-sm text-app-blue flex items-center">
              查看全部 <ChevronRight size={16} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="视频封面" 
                  className="w-full h-28 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <Play size={20} className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  08:24
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-base mb-1 line-clamp-2">【专家讲解】糖尿病患者的运动指南</h4>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">北京协和医院内分泌科主任医师李教授详解糖尿病患者如何安全有效地进行运动。</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>2023-10-08</div>
                  <div className="flex">
                    <div className="flex items-center mr-3">
                      <Eye size={14} className="mr-1" />
                      <span>3.5k</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp size={14} className="mr-1" />
                      <span>245</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="视频封面" 
                  className="w-full h-28 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <Play size={20} className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  12:36
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-base mb-1 line-clamp-2">健康减重的饮食搭配技巧</h4>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">著名营养师张老师教你如何搭配一日三餐，既美味又有助于健康减重。</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>2023-10-05</div>
                  <div className="flex">
                    <div className="flex items-center mr-3">
                      <Eye size={14} className="mr-1" />
                      <span>4.2k</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp size={14} className="mr-1" />
                      <span>318</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expert Q&A */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">专家问答</h3>
            <div className="text-sm text-app-blue flex items-center">
              查看全部 <ChevronRight size={16} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 mr-3"></div>
              <div>
                <div className="font-medium">李女士</div>
                <div className="text-xs text-gray-400">2023-10-14</div>
              </div>
            </div>
            <div className="mb-3 text-sm">减肥期间，晚上饿了可以吃什么不会影响减重效果？</div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-600 mr-3"></div>
                <div className="flex items-center">
                  <div className="font-medium">王医生</div>
                  <div className="ml-2 text-xs bg-app-purple text-white px-2 py-0.5 rounded-full">营养专家</div>
                </div>
              </div>
              <div className="text-sm">晚上饿了可以选择低热量、高蛋白的食物，如鸡胸肉、煮鸡蛋、酸奶等。避免碳水化合物和糖分高的食物。建议晚餐后至少2小时再睡觉，有助于消化和代谢。</div>
            </div>
            <div className="mt-3 flex space-x-4 text-xs text-gray-400">
              <div className="flex items-center">
                <ThumbsUp size={14} className="mr-1" />
                <span>42</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>5</span>
              </div>
              <div className="flex items-center">
                <BookmarkPlus size={14} className="mr-1" />
                <span>收藏</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center text-gray-500" onClick={goToHome}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
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

export default KnowledgeBase;