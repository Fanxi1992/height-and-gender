import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 检查当前路径来决定哪个图标高亮
  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-3 z-50">
      {/* 主页 */}
      <div 
        className={`flex flex-col items-center cursor-pointer ${isActive('/home') ? 'text-white' : 'text-gray-500 hover:text-white'}`} 
        onClick={() => navigate('/home')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive('/home') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span className="text-xs mt-1">主页</span>
      </div>
      
      {/* 机器人 */}
      <div 
        className={`flex flex-col items-center cursor-pointer ${isActive('/aichat') ? 'text-white' : 'text-gray-500 hover:text-white'}`} 
        onClick={() => navigate('/aichat')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive('/aichat') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 0-8.5 14.8L12 22l8.5-5.2A10 10 0 0 0 12 2zM12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
        </svg>
        <span className="text-xs mt-1">机器人</span>
      </div>
      
      {/* 聊天室 */}
      <div 
        className={`flex flex-col items-center cursor-pointer ${isActive('/circle') ? 'text-white' : 'text-gray-500 hover:text-white'}`} 
        onClick={() => navigate('/circle')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive('/circle') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span className="text-xs mt-1">聊天室</span>
      </div>
      
      {/* 我的 */}
      <div 
        className={`flex flex-col items-center cursor-pointer ${isActive('/my') ? 'text-white' : 'text-gray-500 hover:text-white'}`} 
        onClick={() => navigate('/my')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive('/my') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="10" r="3"></circle>
          <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
        </svg>
        <span className="text-xs mt-1">我的</span>
      </div>
    </div>
  );
};

export default BottomNavBar; 