import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import useUserStore from '../stores/userStore';
import '../styles/dateSelector.css';

// 移除不需要的图片URL
// const femaleAvatarUrl = "/lovable-uploads/b545d173-0e2d-4a9b-825b-2e802baaea29.png";

const GenderSelection: React.FC = () => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const navigate = useNavigate();
  
  // 出生日期相关状态
  const [year, setYear] = useState(2003);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [age, setAge] = useState(0);

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

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
  };

  const { setGender, setBirthdate } = useUserStore();

  const handleNext = () => {
    if (selectedGender) {
      setGender(selectedGender);
      setBirthdate(year, month, day);
      // 在导航前滚动到顶部
      window.scrollTo(0, 0);
      navigate('/height-weight'); // 修改为导航到合并的身高体重页面
    }
  };

  const handleSkip = () => {
    // 在导航前滚动到顶部
    window.scrollTo(0, 0);
    navigate('/height-weight'); // 修改为导航到合并的身高体重页面
  };

  // 日期选择器滚动处理
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

  // 获取滚动停止后中间位置的选项
  const getMiddleOption = (container: HTMLDivElement): number => {
    const containerRect = container.getBoundingClientRect();
    const containerMiddle = containerRect.top + containerRect.height / 2;
    
    let closestOption = -1;
    let minDistance = Infinity;
    
    Array.from(container.children).forEach((child, index) => {
      const childRect = child.getBoundingClientRect();
      const childMiddle = childRect.top + childRect.height / 2;
      const distance = Math.abs(childMiddle - containerMiddle);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestOption = index;
      }
    });
    
    return closestOption;
  };

  const yearScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);
  
  // 滚动定时器引用
  const yearScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monthScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dayScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 添加滚动事件处理函数
  const handleScroll = (
    scrollRef: React.RefObject<HTMLDivElement>,
    timerRef: React.MutableRefObject<NodeJS.Timeout | null>,
    setValue: (value: number) => void,
    values: number[]
  ) => {
    return () => {
      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // 设置新的定时器，滚动停止后执行
      timerRef.current = setTimeout(() => {
        if (scrollRef.current) {
          const middleIndex = getMiddleOption(scrollRef.current);
          if (middleIndex >= 0 && middleIndex < values.length) {
            setValue(values[middleIndex]);
          }
        }
      }, 150);
    };
  };

  // 设置滚动事件监听器
  useEffect(() => {
    const yearScrollElement = yearScrollRef.current;
    
    if (yearScrollElement) {
      const handleYearScroll = handleScroll(yearScrollRef, yearScrollTimerRef, setYear, years);
      yearScrollElement.addEventListener('scroll', handleYearScroll);
      return () => yearScrollElement.removeEventListener('scroll', handleYearScroll);
    }
  }, [years]);
  
  useEffect(() => {
    const monthScrollElement = monthScrollRef.current;
    
    if (monthScrollElement) {
      const handleMonthScroll = handleScroll(monthScrollRef, monthScrollTimerRef, setMonth, months);
      monthScrollElement.addEventListener('scroll', handleMonthScroll);
      return () => monthScrollElement.removeEventListener('scroll', handleMonthScroll);
    }
  }, [months]);
  
  useEffect(() => {
    const dayScrollElement = dayScrollRef.current;
    
    if (dayScrollElement) {
      const handleDayScroll = handleScroll(dayScrollRef, dayScrollTimerRef, setDay, days);
      dayScrollElement.addEventListener('scroll', handleDayScroll);
      return () => dayScrollElement.removeEventListener('scroll', handleDayScroll);
    }
  }, [days]);

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

      <div className="mt-10 w-full">
        <h1 className="text-center text-xl font-medium">建立个人报告</h1>
        <ProgressIndicator currentStep={1} totalSteps={7} />

        <div className="white-card">
          <p className="text-gray-500 text-sm text-center mb-2">完成评测，生成您的专属健康报告</p>
          <h2 className="text-center text-2xl font-bold mb-6">您的性别是</h2>

          <div className="w-full flex flex-row gap-8 justify-center mb-6">
            {/* 女性选项 */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                selectedGender === 'female' ? 'scale-105' : 'opacity-90'
              }`}
              onClick={() => handleGenderSelect('female')}
            >
              <div className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mb-2 border-2 ${
                selectedGender === 'female' ? 'border-app-blue' : 'border-transparent'
              }`}>
                <img 
                  src="/女性.png" 
                  alt="女性" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-black font-medium">女性</span>
            </div>

            {/* 男性选项 */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                selectedGender === 'male' ? 'scale-105' : 'opacity-90'
              }`}
              onClick={() => handleGenderSelect('male')}
            >
              <div className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mb-2 border-2 ${
                selectedGender === 'male' ? 'border-app-blue' : 'border-transparent'
              }`}>
                <img 
                  src="/男性.png" 
                  alt="男性" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-black font-medium">男性</span>
            </div>
          </div>

          {/* 出生日期部分 */}
          <h2 className="text-center text-2xl font-bold mt-4">您的出生日期是</h2>
          <div className="date-selector-container">
            {/* 年份选择器 */}
            <div className="date-column">
              <div className="date-scrollable" ref={yearScrollRef}>
                {years.map((y) => (
                  <div 
                    key={y} 
                    className={`date-option ${y === year ? 'selected' : ''}`}
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
                  >
                    {d}日
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-center bg-[#1e4e79] py-3 px-6 rounded-full">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center mr-4">
              <img 
                src="/医师头像.jpg" 
                alt="医师头像" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-white text-base">生理性别和激素会影响我们身体代谢食物的方式</p>
          </div>
        </div>

        <button 
          onClick={handleNext}
          className={`mt-8 ${selectedGender ? 'primary-button' : 'secondary-button opacity-70'}`}
          disabled={!selectedGender}
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default GenderSelection;
