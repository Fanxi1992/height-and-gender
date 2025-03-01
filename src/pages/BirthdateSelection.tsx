import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveBirthdate } from '../utils/storage';
import '../styles/dateSelector.css';

const BirthdateSelection: React.FC = () => {
  const [year, setYear] = useState(2003);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [age, setAge] = useState(0);
  const navigate = useNavigate();

  const years = Array.from({length: 70}, (_, i) => 2006 - i);
  const months = Array.from({length: 12}, (_, i) => i + 1);
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  const days = Array.from({length: getDaysInMonth(year, month)}, (_, i) => i + 1);

  useEffect(() => {
    const maxDays = getDaysInMonth(year, month);
    if (day > maxDays) {
      setDay(maxDays);
    }
  }, [year, month, day]);

  const calculateAge = () => {
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };
  
  useEffect(() => {
    setAge(calculateAge());
  }, [year, month, day]);

  const handleNextClick = () => {
    saveBirthdate(year, month, day);
    navigate('/disease-selection');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };
  
  const centerSelectedOption = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      const container = ref.current;
      const element = container.children[index] as HTMLElement;
      if (element) {
        const containerHeight = container.clientHeight;
        const elementHeight = element.clientHeight;
        const scrollTop = element.offsetTop - (containerHeight / 2) + (elementHeight / 2);
        container.scrollTop = scrollTop;
      }
    }
  };

  const yearScrollRef = React.useRef<HTMLDivElement>(null);
  const monthScrollRef = React.useRef<HTMLDivElement>(null);
  const dayScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const yearIndex = years.findIndex(y => y === year);
    if (yearIndex !== -1) {
      centerSelectedOption(yearScrollRef, yearIndex);
    }
  }, [year, years]);

  useEffect(() => {
    const monthIndex = months.findIndex(m => m === month);
    if (monthIndex !== -1) {
      centerSelectedOption(monthScrollRef, monthIndex);
    }
  }, [month, months]);

  useEffect(() => {
    const dayIndex = days.findIndex(d => d === day);
    if (dayIndex !== -1) {
      centerSelectedOption(dayScrollRef, dayIndex);
    }
  }, [day, days]);

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      <SkipButton onClick={handleSkip} />

      <div className="mt-16 w-full">
        <h1 className="text-center text-xl font-medium text-white">建立个人报告</h1>
        <ProgressIndicator currentStep={5} totalSteps={7} />

        <div className="white-card min-h-[420px]">
          <p className="text-gray-500 text-sm text-center mb-2">完成评测，生成您的专属健康报告</p>
          <h2 className="text-center text-2xl font-bold mb-6">您的出生日期是</h2>

          <div className="date-selector-container">
            {/* 年份选择器 */}
            <div className="date-column">
              <div className="date-scrollable" ref={yearScrollRef}>
                {years.map((y) => (
                  <div 
                    key={y} 
                    className={`date-option ${y === year ? 'selected' : ''}`}
                    onClick={() => setYear(y)}
                  >
                    {y}年
                  </div>
                ))}
              </div>
            </div>
            
            {/* 月份选择器 */}
            <div className="date-column">
              <div className="date-scrollable" ref={monthScrollRef}>
                {months.map((m) => (
                  <div 
                    key={m} 
                    className={`date-option ${m === month ? 'selected' : ''}`}
                    onClick={() => setMonth(m)}
                  >
                    {m}月
                  </div>
                ))}
              </div>
            </div>
            
            {/* 日期选择器 */}
            <div className="date-column">
              <div className="date-scrollable" ref={dayScrollRef}>
                {days.map((d) => (
                  <div 
                    key={d} 
                    className={`date-option ${d === day ? 'selected' : ''}`}
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
              <div className="age-indicator">
                <span className="text-white text-2xl font-bold">{age}</span>
              </div>
              <span className="text-2xl ml-4">岁</span>
            </div>
            
            <p className="mt-4 text-gray-600">
              基础代谢高，身体活动水平高，拥有体重管理的先天优势！
            </p>
          </div>
        </div>

        <div className="info-button">
          <div className="info-icon">
            <span className="text-white text-sm">问询</span>
          </div>
          <p className="text-sm text-white">年龄与基础代谢水平和身体活动水平息息相关</p>
        </div>

        <button 
          onClick={handleNextClick}
          className="mt-6 primary-button mx-4"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default BirthdateSelection;
