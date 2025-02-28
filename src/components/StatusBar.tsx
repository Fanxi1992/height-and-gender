
import React from 'react';

const StatusBar: React.FC = () => {
  // 获取当前时间并格式化为"9:41"样式
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 pt-2 pb-1">
      <span className="text-white font-medium text-sm">{getCurrentTime()}</span>
      <div className="flex items-center">
        <div className="mr-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 22H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 2H7C4 2 3 3.79 3 6V22H21V6C21 3.79 20 2 17 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.06 15H9.92998C9.41998 15 8.98999 15.42 8.98999 15.94V22H14.99V15.94C15 15.42 14.58 15 14.06 15Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6V11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.5 8.5H14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="mr-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 9.3V12.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 16.5V20.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 3.75V5.7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 20.25C16.76 20.25 15.75 19.24 15.75 18C15.75 16.76 16.76 15.75 18 15.75C19.24 15.75 20.25 16.76 20.25 18C20.25 19.24 19.24 20.25 18 20.25Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 9.75C19.24 9.75 20.25 8.74 20.25 7.5C20.25 6.26 19.24 5.25 18 5.25C16.76 5.25 15.75 6.26 15.75 7.5C15.75 8.74 16.76 9.75 18 9.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 20.25V16.8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 13.35V9.9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 9.75C7.24 9.75 8.25 8.74 8.25 7.5C8.25 6.26 7.24 5.25 6 5.25C4.76 5.25 3.75 6.26 3.75 7.5C3.75 8.74 4.76 9.75 6 9.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 20.25C4.76 20.25 3.75 19.24 3.75 18C3.75 16.76 4.76 15.75 6 15.75C7.24 15.75 8.25 16.76 8.25 18C8.25 19.24 7.24 20.25 6 20.25Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="23" height="15" rx="2.5" stroke="white"/>
            <rect x="2" y="2" width="18" height="12" rx="1" fill="white"/>
            <rect x="22" y="5" width="1" height="6" rx="0.5" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
