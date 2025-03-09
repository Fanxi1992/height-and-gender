import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';

const HealthRiskReport: React.FC = () => {
  const navigate = useNavigate();
  const [dragPosition, setDragPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const maxDrag = 200; // Maximum drag distance to trigger navigation
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // 导航函数
  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Touch event handlers for the swipe button
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touchX = e.touches[0].clientX;
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    
    if (buttonRect) {
      const buttonStartX = buttonRect.left;
      const dragX = Math.min(Math.max(0, touchX - buttonStartX - 50), maxDrag);
      setDragPosition(dragX);
    }
  };

  const handleTouchEnd = () => {
    if (dragPosition > maxDrag * 0.7) {
      // If dragged more than 70% of max distance, navigate to the detailed report
      navigate('/disease-risk-detail');
    } else {
      // Reset position
      setDragPosition(0);
    }
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-black text-white">
      <StatusBar />
      
      {/* Header - 增加了上方间距 */}
      <div className="w-full flex items-center justify-center relative py-4 mt-8">
        <button 
          className="absolute left-4 p-2" 
          onClick={handleBack}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-medium">健康风险报告</h1>
      </div>
      
      {/* Watermark */}
      <div className="w-full px-5 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Colorpong.com</span>
        <span className="text-xs text-gray-500">5$</span>
      </div>
      
      {/* Main Disease Network Visualization - 更新了图片路径 */}
      <div className="w-full px-5 mt-2 flex-1">
        <img 
          src="/健康风险报告图.jpg" 
          alt="Disease Network Visualization" 
          className="w-full h-auto"
        />
      </div>
      
      {/* Bottom Button - Updated with swipe functionality */}
      <div className="w-full px-5 mb-10">
        <div
          ref={buttonRef}
          className={`w-full py-4 bg-blue-600 rounded-full flex items-center relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center transition-all"
            style={{ 
              left: `${dragPosition}px`, 
              marginLeft: '4px',
              transform: dragPosition > maxDrag * 0.7 ? 'scale(1.1)' : 'scale(1)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div 
            className="ml-20 text-white text-lg transition-opacity"
            style={{ opacity: 1 - dragPosition / maxDrag }}
          >
            右滑开启你的健康风险报告
          </div>
          {dragPosition > maxDrag * 0.7 && (
            <div className="absolute right-6 text-white font-medium animate-pulse">
              松开查看
            </div>
          )}
          {/* Progress indicator */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white opacity-60 transition-all"
            style={{ width: `${(dragPosition / maxDrag) * 100}%` }}
          />
        </div>
      </div>
      
      {/* 底部导航栏已移除 */}
    </div>
  );
};

export default HealthRiskReport;
