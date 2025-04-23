import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveHeight } from '../utils/storage';

const HeightSelection: React.FC = () => {
  const [height, setHeight] = useState(165);
  const rulerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const initialHeight = useRef<number>(165);
  const navigate = useNavigate();

  // 生成刻度标记
  const generateMarks = () => {
    const marks = [];
    for (let i = 140; i <= 190; i++) {
      marks.push(
        <div key={i} className="ruler-mark relative">
          {i % 10 === 0 && (
            <span className="height-value">{i}</span>
          )}
        </div>
      );
    }
    return marks;
  };

  // 处理拖动事件
  const handleTouchStart = (e: React.TouchEvent) => {
    // 阻止默认滚动行为
    e.preventDefault();
    dragStartY.current = e.touches[0].clientY;
    initialHeight.current = height;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 阻止默认滚动行为
    e.preventDefault();
    if (dragStartY.current === null) return;
    
    const touchY = e.touches[0].clientY;
    const diff = dragStartY.current - touchY;
    
    // 每移动10px改变1cm的身高
    const heightChange = Math.round(diff / 5);
    let newHeight = initialHeight.current + heightChange;
    
    // 限制身高范围
    if (newHeight < 140) newHeight = 140;
    if (newHeight > 190) newHeight = 190;
    
    setHeight(newHeight);
    
    // 移动刻度尺
    if (rulerRef.current) {
      const offset = (165 - newHeight) * 5; // 每1cm移动5px
      rulerRef.current.style.transform = `translateY(${offset}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 阻止默认滚动行为
    e.preventDefault();
    dragStartY.current = null;
  };

  const handleNext = () => {
    saveHeight(height);
    // 在导航前滚动到顶部
    window.scrollTo(0, 0);
    navigate('/weight'); // 修改为跳转到体重选择页面
  };

  const handleSkip = () => {
    // 在导航前滚动到顶部
    window.scrollTo(0, 0);
    navigate('/weight'); // 修改为跳转到体重选择页面
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      <SkipButton onClick={handleSkip} />

      <div className="mt-10 w-full">
        <h1 className="text-center text-xl font-medium">建立个人报告</h1>
        <ProgressIndicator currentStep={2} totalSteps={7} />

        <div className="white-card min-h-[420px]">
          <p className="text-gray-500 text-sm text-center mb-2">完成评测，生成您的专属健康报告</p>
          <h2 className="text-center text-2xl font-bold mb-6">您的身高是</h2>

          <div 
            className="height-ruler"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div ref={rulerRef} className="ruler-marks">
              {generateMarks()}
            </div>
            <div className="ruler-selector" />
            <div className="ruler-indicator">
              {height} cm
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#3457CC] rounded-full flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#4169E1] flex items-center justify-center mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L16 6H13V16H11V6H8L12 2Z" fill="white"/>
              <path d="M21 14V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V14H5V19H19V14H21Z" fill="white"/>
            </svg>
          </div>
          <p className="text-sm text-white">精确的身高数据将使我计算BMI指数</p>
        </div>

        <button 
          onClick={handleNext}
          className="mt-8 primary-button"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default HeightSelection;
