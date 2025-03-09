import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveWeight, getHeight } from '../utils/storage';

const WeightSelection: React.FC = () => {
  const [weight, setWeight] = useState(70.0);
  const rulerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const initialWeight = useRef<number>(70.0);
  const navigate = useNavigate();

  // 生成刻度标记
  const generateMarks = () => {
    const marks = [];
    for (let i = 30; i <= 120; i++) {
      const isMainMark = i % 5 === 0;
      marks.push(
        <div 
          key={i} 
          className={`ruler-mark ${isMainMark ? 'h-4' : 'h-2'} w-px bg-gray-300 mx-[3px] relative`}
        />
      );
    }
    return marks;
  };

  // 处理拖动事件
  const handleTouchStart = (e: React.TouchEvent) => {
    // 阻止默认滚动行为
    e.preventDefault();
    dragStartX.current = e.touches[0].clientX;
    initialWeight.current = weight;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 阻止默认滚动行为
    e.preventDefault();
    if (dragStartX.current === null) return;
    
    const touchX = e.touches[0].clientX;
    const diff = touchX - dragStartX.current;
    
    // 每移动5px改变0.1kg的体重
    const weightChange = Math.round(diff / 5) / 10;
    let newWeight = initialWeight.current + weightChange;
    
    // 限制体重范围
    if (newWeight < 30) newWeight = 30;
    if (newWeight > 120) newWeight = 120;
    
    setWeight(Number(newWeight.toFixed(1)));
    
    // 移动刻度尺
    if (rulerRef.current) {
      const offset = (newWeight - 70) * 5; // 每1kg移动5px
      rulerRef.current.style.transform = `translateX(${-offset}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 阻止默认滚动行为
    e.preventDefault();
    dragStartX.current = null;
  };

  const handleNext = () => {
    saveWeight(weight);
    // 在导航前滚动到顶部
    window.scrollTo(0, 0);
    navigate('/target-weight');
  };

  const handleSkip = () => {
    // 在导航前滚动到顶部
    window.scrollTo(0, 0);
    navigate('/target-weight');
  };
  
  // 计算BMI
  const calculateBMI = () => {
    const height = getHeight();
    if (!height) return "0";
    
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };
  
  const bmi = calculateBMI();
  
  // 判断BMI状态
  const getBMIStatus = () => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return "偏瘦";
    if (bmiValue < 24) return "正常";
    if (bmiValue < 28) return "超重";
    return "肥胖";
  };
  
  const bmiStatus = getBMIStatus();
  const bmiStatusColor = bmiStatus === "超重" || bmiStatus === "肥胖" ? "text-purple-500" : "text-green-500";

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      <SkipButton onClick={handleSkip} />

      <div className="mt-16 w-full">
        <h1 className="text-center text-xl font-medium">建立个人报告</h1>
        <ProgressIndicator currentStep={3} totalSteps={7} />

        <div className="white-card min-h-[420px]">
          <p className="text-gray-500 text-sm text-center mb-2">完成评测，生成您的专属健康报告</p>
          <h2 className="text-center text-2xl font-bold mb-6">您的体重是</h2>

          <div className="text-center mb-6">
            <span className="text-4xl font-bold">{weight.toFixed(1)}</span>
            <span className="text-xl ml-2">公斤</span>
          </div>

          <div 
            className="weight-ruler relative h-24 w-full overflow-hidden mb-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute w-full h-[1px] bg-gray-300 top-12"></div>
            <div className="absolute left-1/2 w-[3px] h-8 bg-purple-500 top-4 -translate-x-1/2 rounded-full"></div>
            
            <div ref={rulerRef} className="absolute flex items-start top-12 left-1/2 transform -translate-x-1/2">
              {generateMarks()}
            </div>
            
            <div className="flex justify-between absolute bottom-0 w-full px-8">
              <span className="text-gray-500">{Math.floor(weight) - 1}</span>
              <span className="text-gray-500">{Math.floor(weight)}</span>
              <span className="text-gray-500">{Math.floor(weight) + 1}</span>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-gray-50 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">您的 BMI</span>
              <span className="font-bold flex">
                {bmi} <span className={`${bmiStatusColor} ml-2`}>{bmiStatus}</span>
              </span>
            </div>
            
            <div className="relative h-2 bg-gray-200 rounded-full mb-3">
              <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-indigo-300 to-indigo-500 rounded-full" style={{width: `${Math.min(100, (parseFloat(bmi) / 40) * 100)}%`}}></div>
              <div className="absolute top-0 h-4 w-2 bg-indigo-700" style={{left: `${Math.min(98, (parseFloat(bmi) / 40) * 100)}%`, transform: 'translateY(-25%)'}}></div>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              您的 BMI 属于{bmiStatus}，建议适量减重 3-5KG 以降低 糖尿病、高血压和心血管疾病 风险，同时改善代谢健康。
            </p>
            
            <p className="text-xs text-gray-400 mt-4">
              注：bmi是目前诊断肥胖最广泛使用的方法和指标：<br/>
              bmi(kg/m²)=体重(kg)/身高²(m²)
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#3457CC] rounded-full flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#4169E1] flex items-center justify-center mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L16 6H13V16H11V6H8L12 2Z" fill="white"/>
              <path d="M21 14V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V14H5V19H19V14H21Z" fill="white"/>
            </svg>
          </div>
          <p className="text-sm text-white">精确的体重数据将使我准确计算BMI指数</p>
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

export default WeightSelection;
