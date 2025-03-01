
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';

const HealthTrajectory: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };

  const timelineItems = [
    {
      year: '2025年',
      date: '2/14',
      type: '体检报告',
      content: 'XXXXXXXX XXXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      year: '2024年',
      date: '12/14',
      type: 'AI BOT',
      content: 'XXXXXXXX XXXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      year: '2024年',
      date: '12/14',
      type: '体重打卡',
      content: 'XXXXXXXX XXXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      year: '2024年',
      date: '12/10',
      type: '血压检测',
      content: 'XXXXXXXX XXXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      year: '2024年',
      date: '12/05',
      type: '睡眠追踪',
      content: 'XXXXXXXX XXXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      year: '2024年',
      date: '12/01',
      type: '饮食记录',
      content: 'XXXXXXXX XXXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXX'
    }
  ];

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-black text-white overflow-y-auto">
      <StatusBar />
      
      {/* Header */}
      <div className="w-full flex items-center justify-center relative py-4">
        <button 
          className="absolute left-4 p-2" 
          onClick={handleBack}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-medium">健康轨迹</h1>
      </div>
      
      {/* Last Updated */}
      <div className="w-full px-5 py-2">
        <p className="text-sm text-gray-400">5:30更新</p>
      </div>
      
      {/* User Profile */}
      <div className="w-full px-5 mt-2">
        <h2 className="text-3xl font-bold mb-2">本人</h2>
        
        <div className="flex justify-between mb-4">
          <div className="flex-1">
            <p className="text-gray-400 text-sm mb-1">性别/年龄</p>
            <p className="flex items-center">
              <span className="text-xl mr-4">女</span>
              <span className="text-xl">24岁</span>
            </p>
            
            <p className="text-gray-400 text-sm mt-3 mb-1">BMI</p>
            <div className="flex items-center">
              <span className="text-xl mr-2">25.4</span>
              <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-xs">偏高</span>
            </div>
            
            <p className="text-gray-400 text-sm mt-3 mb-1">体脂率</p>
            <div className="flex items-center">
              <span className="text-xl mr-2">23%</span>
              <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-xs">肥胖</span>
            </div>
          </div>
          
          {/* Avatar placeholder - would be replaced with an actual image */}
          <div className="w-40 h-40 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full opacity-30"></div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="w-full px-5 mt-4 mb-20">
        {timelineItems.map((item, index) => (
          <div key={index} className="relative pl-8 pb-8">
            {/* Timeline line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-blue-500"></div>
            
            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500"></div>
            
            {/* Timeline content */}
            <div>
              <h3 className="text-xl font-bold">{item.year}</h3>
              <p className="text-gray-400 mb-2">{item.date}</p>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl overflow-hidden">
                <div className="flex">
                  <div className="bg-gray-200 p-4 flex items-center justify-center">
                    <p className="text-black font-medium text-center">
                      {item.type.split('').map((char, i) => (
                        <span key={i} className="block">{char}</span>
                      ))}
                    </p>
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-white">{item.content}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path><path d="M10 2c1 .5 2 2 2 5"></path></svg>
          <span className="text-xs">商城</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z"></path><path d="M6 11V8h12v3"></path></svg>
          <span className="text-xs">圈子</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </div>
      </div>
    </div>
  );
};

export default HealthTrajectory;
