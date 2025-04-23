
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  const dots = [];

  for (let i = 1; i <= totalSteps; i++) {
    // 如果是当前步骤，显示为蓝色；如果是已完成步骤，显示为浅蓝色；否则显示为灰色
    let dotClassName = 'w-2 h-2 rounded-full mx-1';
    
    if (i === currentStep) {
      dotClassName += ' bg-app-blue w-6'; // 当前步骤为长条形状
    } else if (i < currentStep) {
      dotClassName += ' bg-blue-300'; // 已完成步骤
    } else {
      dotClassName += ' bg-gray-400'; // 未完成步骤
    }
    
    dots.push(
      <div
        key={i}
        className={dotClassName}
      />
    );
  }

  return <div className="flex justify-center items-center my-4">{dots}</div>;
};

export default ProgressIndicator;
