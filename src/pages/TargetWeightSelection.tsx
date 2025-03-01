
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveTargetWeight } from '../utils/storage';

const TargetWeightSelection: React.FC = () => {
  const [targetWeight, setTargetWeight] = useState(50.0);
  const rulerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const initialWeight = useRef<number>(50.0);
  const navigate = useNavigate();

  // 生成刻度标记
  const generateMarks = () => {
    const marks = [];
    for (let i = 30; i <= 120; i++) {
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
    dragStartY.current = e.touches[0].clientY;
    initialWeight.current = targetWeight;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    
    const touchY = e.touches[0].clientY;
    const diff = dragStartY.current - touchY;
    
    // 每移动10px改变1kg的体重
    const weightChange = Math.round(diff / 5) / 10;
    let newWeight = initialWeight.current + weightChange;
    
    // 限制体重范围
    if (newWeight < 30) newWeight = 30;
    if (newWeight > 120) newWeight = 120;
    
    setTargetWeight(Number(newWeight.toFixed(1)));
    
    // 移动刻度尺
    if (rulerRef.current) {
      const offset = (50 - newWeight) * 5; // 每1kg移动5px
      rulerRef.current.style.transform = `translateY(${offset}px)`;
    }
  };

  const handleTouchEnd = () => {
    dragStartY.current = null;
  };

  const handleNext = () => {
    saveTargetWeight(targetWeight);
    navigate('/birthdate');
  };

  const handleSkip = () => {
    navigate('/birthdate');
  };
  
  // 计算与当前体重的差值百分比
  const calculateWeightDifference = () => {
    const currentWeightStr = localStorage.getItem('app_user_weight');
    if (!currentWeightStr) return 0;
    
    const currentWeight = parseFloat(currentWeightStr);
    const difference = ((currentWeight - targetWeight) / currentWeight) * 100;
    return difference.toFixed(1);
  };
  
  const weightDiff = calculateWeightDifference();

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      <SkipButton onClick={handleSkip} />

      <div className="mt-16 w-full">
        <h1 className="text-center text-xl font-medium">建立个人报告</h1>
        <ProgressIndicator currentStep={4} totalSteps={7} />

        <div className="white-card min-h-[420px]">
          <p className="text-gray-500 text-sm text-center mb-2">完成评测，生成您的专属健康报告</p>
          <h2 className="text-center text-2xl font-bold mb-6">您的目标体重是</h2>

          <div 
            className="weight-ruler"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div ref={rulerRef} className="ruler-marks">
              {generateMarks()}
            </div>
            <div className="ruler-selector" />
            <div className="ruler-indicator">
              {targetWeight.toFixed(1)} 公斤
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
          <p className="text-sm text-white">您预计减重{weightDiff}%，将显著降低并发疾病风险！</p>
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

export default TargetWeightSelection;
