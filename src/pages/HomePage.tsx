
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { CircleUser } from 'lucide-react';

const mockData = [
  { name: 'Day 1', value: 1500 },
  { name: 'Day 2', value: 1800 },
  { name: 'Day 3', value: 1600 },
  { name: 'Day 4', value: 2000 },
  { name: 'Day 5', value: 1700 },
  { name: 'Day 6', value: 1900 },
  { name: 'Day 7', value: 2200 },
];

const HabitWidget = ({ icon, title, value, bg }) => (
  <div className={`rounded-xl p-3 ${bg} w-[48%] h-20 overflow-hidden`}>
    <div className="flex items-center mb-1">
      <div className="mr-2 text-white">{icon}</div>
      <div className="text-sm text-white font-medium truncate">{title}</div>
    </div>
    <div className="text-xl font-bold text-white">{value}</div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-black min-h-screen">
      <StatusBar />
      
      {/* Content of HomePage */}
      <div className="flex-1 px-4 pt-10 pb-20 overflow-y-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">健康管理</h1>
            <p className="text-sm text-gray-400">今天也要多运动哦！</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
            <CircleUser className="text-gray-400" size={24} />
          </div>
        </div>
        
        {/* Calorie Tracking Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 mb-6">
          <div className="text-white text-lg font-bold mb-1">今日卡路里</div>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold text-white">1,248</div>
            <div className="text-white text-sm">目标: 2,200</div>
          </div>
          <div className="h-16 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#FFFFFF" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCalories)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Health Report Section - Clickable */}
        <div 
          className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-4 mb-6"
          onClick={() => navigate('/health-risk-report')}
        >
          <div className="text-white text-lg font-bold mb-1">健康风险报告</div>
          <div className="text-white text-sm mb-3">
            了解您的健康风险，及早预防慢性病
          </div>
          <div className="flex items-center justify-between">
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-xs text-white">点击查看 &gt;</span>
            </div>
          </div>
        </div>
        
        {/* Health Trajectory Section - Clickable */}
        <div 
          className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 mb-6"
          onClick={() => navigate('/health-trajectory')}
        >
          <div className="text-white text-lg font-bold mb-1">健康轨迹</div>
          <div className="text-white text-sm mb-3">
            查看您的健康数据变化趋势
          </div>
          <div className="flex items-center justify-between">
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-xs text-white">点击查看 &gt;</span>
            </div>
          </div>
        </div>
        
        {/* Habits Tracking Section */}
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold text-white">今日习惯</h2>
            <button className="text-sm text-indigo-400">查看全部</button>
          </div>
          
          <div className="flex flex-wrap justify-between">
            <HabitWidget 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.2,16.2L11,13V7h1.5v5.2l4.5,2.7L16.2,16.2z"></path></svg>}
              title="睡眠"
              value="7小时32分"
              bg="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
            
            <HabitWidget 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,4h-3V2h-2v2h-4V2H8v2H5C3.9,4,3,4.9,3,6v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V6C21,4.9,20.1,4,19,4z M19,20H5V10h14V20z M19,8H5V6h14V8z M9,14H7v-2h2V14z M13,14h-2v-2h2V14z M17,14h-2v-2h2V14z M9,18H7v-2h2V18z M13,18h-2v-2h2V18z M17,18h-2v-2h2V18z"></path></svg>}
              title="步数"
              value="6,280"
              bg="bg-gradient-to-r from-green-500 to-emerald-500"
            />
            
            <div className="w-full h-4"></div>
            
            <HabitWidget 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M13.5,6c0.83,0,1.5,0.67,1.5,1.5 S14.33,9,13.5,9S12,8.33,12,7.5S12.67,6,13.5,6z M17,17h-1v-6.29c0-0.77-0.62-1.39-1.39-1.39h-0.85C13.34,9.32,12.9,9.43,12.5,9.7 L9,12v5h1v-4.3l1.8-1.2c0-0.01,0.01-0.01,0.02-0.02L12,12v5h1v-3.3l0.18-0.12c0.08-0.06,0.17-0.1,0.27-0.13L13,14v3h1v-3.3 l1.8-1.2c0-0.01,0.01-0.01,0.02-0.02L16,13V17z"></path></svg>}
              title="运动"
              value="45分钟"
              bg="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            
            <HabitWidget 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M17,18h-1v-7c0-1.1-0.9-2-2-2H8v1h1v2H8v1h2v2H8v1h8V18z"></path></svg>}
              title="喝水"
              value="1200ml"
              bg="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#1A1A1A] flex items-center justify-around border-t border-gray-800">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="text-xs text-white">主页</span>
        </div>
        
        <div className="flex flex-col items-center" onClick={() => navigate('/shop')}>
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
              <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm9 0a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs text-gray-400">商城</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
          </div>
          <span className="text-xs text-gray-400">圈子</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M7 20.662V19c0-1.105.895-2 2-2h6c1.105 0 2 .895 2 2v1.662"></path>
            </svg>
          </div>
          <span className="text-xs text-gray-400">我的</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
