import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { Search, Plus } from 'lucide-react';
import Feed from '../components/Feed';
import Family from '../components/Family';

const Circle = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('挑战');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const goToHome = () => {
    navigate('/home');
  };
  
  const goToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };
  
  const goToShop = () => {
    navigate('/shop');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <StatusBar />
      
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-10 pb-4">
        <h1 className="text-xl font-bold">圈子</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <Search size={22} />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-white rounded-lg overflow-hidden">
          {['挑战', '动态', '家人'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 text-center py-3 text-sm ${
                activeTab === tab 
                  ? 'text-app-blue border-b-2 border-app-blue' 
                  : 'text-gray-500 border-b-2 border-transparent'
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {activeTab === '挑战' && (
          <>
            {/* Challenge Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-app-blue rounded-xl p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10 bg-cover" 
                   style={{backgroundImage: "url('https://i.imgur.com/JHkBUXX.png')"}}></div>
              <h3 className="text-xl font-semibold mb-2">30天减脂挑战</h3>
              <p className="text-sm opacity-90 mb-4">和团队一起坚持30天，赢取丰厚积分奖励！</p>
              
              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">1,280</div>
                  <div className="text-xs opacity-80">参与人数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">320</div>
                  <div className="text-xs opacity-80">团队数量</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">5,000</div>
                  <div className="text-xs opacity-80">积分奖池</div>
                </div>
              </div>
              
              <button className="w-full py-2.5 text-sm font-medium bg-white/20 rounded-lg">立即参与</button>
            </div>
            
            {/* My Challenges */}
            <h3 className="text-lg font-semibold mb-4">我的挑战</h3>
            <div className="mb-6 space-y-4">
              {/* Challenge Card 1 */}
              <div className="bg-white rounded-xl p-4 text-black">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l2 2l4-4"></path><path d="M4 7l2 2l4-4"></path><path d="M14 11l2 2l4-4"></path><rect width="4" height="6" x="14" y="15" rx="2"></rect></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-base">每日万步行</div>
                    <div className="text-xs text-gray-500">10月1日 - 10月31日</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <div className="text-gray-500">团队进度</div>
                    <div className="font-medium">15/31天</div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-app-blue w-[48%]"></div>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="成员头像" className="w-8 h-8 rounded-full border-2 border-white -mr-2" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="成员头像" className="w-8 h-8 rounded-full border-2 border-white -mr-2" />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="成员头像" className="w-8 h-8 rounded-full border-2 border-white -mr-2" />
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="成员头像" className="w-8 h-8 rounded-full border-2 border-white mr-1" />
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 ml-1">+2</div>
                </div>
                
                <div className="flex justify-between">
                  <div className="text-sm text-amber-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="M11 12 5.12 2.2"></path><path d="m13 12 5.88-9.8"></path><path d="M8 7h8"></path><circle cx="12" cy="17" r="5"></circle><path d="M12 18v-2h-.5"></path></svg>
                    奖励: 1,000积分
                  </div>
                  <div className="text-sm text-app-blue">查看详情</div>
                </div>
              </div>
              
              {/* Challenge Card 2 */}
              <div className="bg-white rounded-xl p-4 text-black">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white text-xl mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5v14H5V5h14Z"></path><path d="M14.7 10.7a3 3 0 1 1-5.4-2.6 3 3 0 0 1 5.4 2.6Z"></path><path d="M8.8 14.8H7.7A1.7 1.7 0 0 0 6 16.5v.5h12v-.5a1.7 1.7 0 0 0-1.7-1.7h-1.1"></path></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-base">21天减重挑战</div>
                    <div className="text-xs text-gray-500">10月10日 - 10月31日</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <div className="text-gray-500">团队进度</div>
                    <div className="font-medium">5/21天</div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-app-blue w-[24%]"></div>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="成员头像" className="w-8 h-8 rounded-full border-2 border-white -mr-2" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="成员头像" className="w-8 h-8 rounded-full border-2 border-white -mr-2" />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="成员头像" className="w-8 h-8 rounded-full border-2 border-white mr-1" />
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 ml-1">+3</div>
                </div>
                
                <div className="flex justify-between">
                  <div className="text-sm text-amber-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="M11 12 5.12 2.2"></path><path d="m13 12 5.88-9.8"></path><path d="M8 7h8"></path><circle cx="12" cy="17" r="5"></circle><path d="M12 18v-2h-.5"></path></svg>
                    奖励: 1,500积分
                  </div>
                  <div className="text-sm text-app-blue">查看详情</div>
                </div>
              </div>
            </div>
            
            {/* Leaderboard */}
            <h3 className="text-lg font-semibold mb-4">排行榜</h3>
            <div className="mb-6 space-y-3">
              {/* Leaderboard Item 1 */}
              <div className="bg-white rounded-xl p-3 flex items-center text-black">
                <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs font-semibold mr-4">1</div>
                <div className="flex items-center flex-1">
                  <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="团队头像" className="w-10 h-10 rounded-lg mr-3 object-cover" />
                  <div>
                    <div className="text-sm font-medium">减肥先锋队</div>
                    <div className="text-xs text-gray-500">8名成员</div>
                  </div>
                </div>
                <div className="text-base font-semibold text-app-blue">2,450</div>
              </div>
              
              {/* Leaderboard Item 2 */}
              <div className="bg-white rounded-xl p-3 flex items-center text-black">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-semibold mr-4">2</div>
                <div className="flex items-center flex-1">
                  <img src="https://images.unsplash.com/photo-1522543558187-768b6df7c25c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="团队头像" className="w-10 h-10 rounded-lg mr-3 object-cover" />
                  <div>
                    <div className="text-sm font-medium">健康生活团</div>
                    <div className="text-xs text-gray-500">6名成员</div>
                  </div>
                </div>
                <div className="text-base font-semibold text-app-blue">2,180</div>
              </div>
              
              {/* Leaderboard Item 3 */}
              <div className="bg-white rounded-xl p-3 flex items-center text-black">
                <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-semibold mr-4">3</div>
                <div className="flex items-center flex-1">
                  <img src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="团队头像" className="w-10 h-10 rounded-lg mr-3 object-cover" />
                  <div>
                    <div className="text-sm font-medium">轻盈一族</div>
                    <div className="text-xs text-gray-500">5名成员</div>
                  </div>
                </div>
                <div className="text-base font-semibold text-app-blue">1,950</div>
              </div>
              
              {/* Leaderboard Item 4 */}
              <div className="bg-white rounded-xl p-3 flex items-center text-black">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold mr-4">4</div>
                <div className="flex items-center flex-1">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="团队头像" className="w-10 h-10 rounded-lg mr-3 object-cover" />
                  <div>
                    <div className="text-sm font-medium">我们都瘦了</div>
                    <div className="text-xs text-gray-500">7名成员</div>
                  </div>
                </div>
                <div className="text-base font-semibold text-app-blue">1,820</div>
              </div>
              
              {/* Leaderboard Item 5 */}
              <div className="bg-white rounded-xl p-3 flex items-center text-black">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold mr-4">5</div>
                <div className="flex items-center flex-1">
                  <img src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="团队头像" className="w-10 h-10 rounded-lg mr-3 object-cover" />
                  <div>
                    <div className="text-sm font-medium">健康达人</div>
                    <div className="text-xs text-gray-500">6名成员</div>
                  </div>
                </div>
                <div className="text-base font-semibold text-app-blue">1,680</div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === '动态' && (
          <Feed />
        )}
        
        {activeTab === '家人' && (
          <Family />
        )}
      </div>
      
      {/* Create Challenge Button */}
      <div className="fixed bottom-24 right-5">
        <button className="w-14 h-14 rounded-full bg-app-blue text-white flex items-center justify-center shadow-lg">
          <Plus size={24} />
        </button>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center text-gray-500" onClick={goToHome}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToKnowledgeBase}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <span className="text-xs">知识库</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span className="text-xs">圈子</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToShop}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span className="text-xs">商城</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </div>
      </div>
    </div>
  );
};

export default Circle;
