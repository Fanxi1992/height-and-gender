
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveBirthdate } from '../utils/storage';

const BirthdateSelection: React.FC = () => {
  const [year, setYear] = useState(2003);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const navigate = useNavigate();

  const years = Array.from({length: 70}, (_, i) => 2006 - i);
  const months = Array.from({length: 12}, (_, i) => i + 1);
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  const days = Array.from({length: getDaysInMonth(year, month)}, (_, i) => i + 1);

  const handleNext = () => {
    saveBirthdate(year, month, day);
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };
  
  // 计算年龄
  const calculateAge = () => {
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const age = calculateAge();

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      <SkipButton onClick={handleSkip} />

      <div className="mt-16 w-full">
        <h1 className="text-center text-xl font-medium">建立个人报告</h1>
        <ProgressIndicator currentStep={5} totalSteps={7} />

        <div className="white-card min-h-[420px]">
          <p className="text-gray-500 text-sm text-center mb-2">完成评测，生成您的专属健康报告</p>
          <h2 className="text-center text-2xl font-bold mb-6">您的出生日期是</h2>

          <div className="date-selector flex justify-between px-6 mt-10">
            {/* 年份选择器 */}
            <div className="flex-1 overflow-hidden relative">
              <div className="date-scrollable h-40 overflow-y-auto flex flex-col items-center">
                {years.map((y) => (
                  <div 
                    key={y} 
                    className={`py-2 w-full text-center ${y === year ? 'text-black font-bold text-lg' : 'text-gray-300'}`}
                    onClick={() => setYear(y)}
                  >
                    {y}年
                  </div>
                ))}
              </div>
            </div>
            
            {/* 月份选择器 */}
            <div className="flex-1 overflow-hidden relative">
              <div className="date-scrollable h-40 overflow-y-auto flex flex-col items-center">
                {months.map((m) => (
                  <div 
                    key={m} 
                    className={`py-2 w-full text-center ${m === month ? 'text-black font-bold text-lg' : 'text-gray-300'}`}
                    onClick={() => setMonth(m)}
                  >
                    {m}月
                  </div>
                ))}
              </div>
            </div>
            
            {/* 日期选择器 */}
            <div className="flex-1 overflow-hidden relative">
              <div className="date-scrollable h-40 overflow-y-auto flex flex-col items-center">
                {days.map((d) => (
                  <div 
                    key={d} 
                    className={`py-2 w-full text-center ${d === day ? 'text-black font-bold text-lg' : 'text-gray-300'}`}
                    onClick={() => setDay(d)}
                  >
                    {d}日
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-10 mx-4 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <div className="w-8 h-16 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-xl font-bold">{age}</span>
              </div>
              <span className="text-2xl">岁</span>
            </div>
            
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              基础代谢高，身体活动水平高，拥有体重管理的先天优势！
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
          <p className="text-sm text-white">年龄与基础代谢水平和身体活动水平息息相关</p>
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

export default BirthdateSelection;
