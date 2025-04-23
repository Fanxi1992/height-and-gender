import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* 主要内容区域 - 使用 pb-20 为底部导航栏腾出空间 */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      
      {/* 底部导航栏 - 固定在底部 */}
      <BottomNavBar />
    </div>
  );
};

export default MainLayout; 