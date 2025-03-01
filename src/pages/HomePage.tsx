import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-black min-h-screen">
      <StatusBar />
      
      {/* Content of HomePage */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-white">Welcome to the Home Page!</h1>
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
