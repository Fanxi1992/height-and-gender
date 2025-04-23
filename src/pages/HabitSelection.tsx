import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton'; // 考虑是否需要跳过按钮
import ProgressIndicator from '../components/ProgressIndicator';
import useUserStore from '../stores/userStore';

// 定义选项常量
const smokingOptions = [
  { label: '无吸烟史', value: 0 },
  { label: '0-5年', value: 1 },
  { label: '5-10年', value: 2 },
  { label: '10-20年', value: 3 },
  { label: '20年以上', value: 4 },
];

const alcoholOptions = [
  { label: '无饮酒史', value: 0 },
  { label: '0-5年', value: 1 },
  { label: '5-10年', value: 2 },
  { label: '10-20年', value: 3 },
  { label: '20年以上', value: 4 },
];

const exerciseOptions = [
  { label: '无', value: 0 },
  { label: '偶尔', value: 1 },
  { label: '经常', value: 2 },
  { label: '每日', value: 3 },
];

const HabitSelection: React.FC = () => {
  const navigate = useNavigate();
  const {
    smokingLevel: storedSmokingLevel,
    alcoholLevel: storedAlcoholLevel,
    exerciseLevel: storedExerciseLevel,
    setSmokingLevel,
    setAlcoholLevel,
    setExerciseLevel,
  } = useUserStore();

  // 初始化 state，优先使用 store 中的值，否则使用默认值
  const [selectedSmoking, setSelectedSmoking] = useState<number>(storedSmokingLevel ?? 0);
  const [selectedAlcohol, setSelectedAlcohol] = useState<number>(storedAlcoholLevel ?? 0);
  const [selectedExercise, setSelectedExercise] = useState<number>(storedExerciseLevel ?? 3); // 默认每日

  const handleNext = () => {
    // 存储选择的值到 Zustand
    setSmokingLevel(selectedSmoking);
    setAlcoholLevel(selectedAlcohol);
    setExerciseLevel(selectedExercise);
    window.scrollTo(0, 0);
    // 导航到疾病选择页
    navigate('/disease-selection');
  };

  // 可选：处理跳过逻辑
  const handleSkip = () => {
    // 可以选择存储默认值或 null
    setSmokingLevel(0); // 例如，跳过则视为无
    setAlcoholLevel(0);
    setExerciseLevel(3); // 例如，跳过则视为每日
    window.scrollTo(0, 0);
    navigate('/disease-selection');
  };

  // 封装选项按钮渲染逻辑
  const renderOptions = (
    title: string,
    options: { label: string; value: number }[],
    selectedValue: number,
    setter: (value: number) => void
  ) => (
    <div className="mb-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            className={`py-2.5 px-4 rounded-full text-center transition-colors duration-150 ease-in-out ${
              selectedValue === option.value
                ? 'bg-app-blue text-white shadow-md' // 选中状态
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // 未选中状态
            }`}
            onClick={() => setter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <div className="mt-10 px-4 flex justify-between items-center w-full">
         <BackButton />
         {/* 保持标题居中 */}
         <h1 className="text-xl font-medium text-white flex-grow text-center">建立个人报告</h1>
         {/* 可选：添加跳过按钮，如果不需要可以移除 */}
         <SkipButton onClick={handleSkip} />
      </div>


      {/* 进度指示器 - 假设这是第4步，共6步 */}
      <ProgressIndicator currentStep={4} totalSteps={6} />

      <div className="white-card flex flex-col items-center min-h-[450px]">
        <p className="text-gray-500 text-sm text-center mb-6">完成评测，生成您的专属健康报告</p>

        {/* 吸烟史 */}
        {renderOptions("您的吸烟习惯是", smokingOptions, selectedSmoking, setSelectedSmoking)}

        {/* 饮酒史 */}
        {renderOptions("您的饮酒习惯是", alcoholOptions, selectedAlcohol, setSelectedAlcohol)}

        {/* 运动习惯 */}
        {renderOptions("您的运动习惯是", exerciseOptions, selectedExercise, setSelectedExercise)}

      </div>

      {/* 医生建议部分 */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-center bg-[#1e4e79] py-3 px-6 rounded-full">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center mr-4 flex-shrink-0">
            <img
              src="/医师头像.jpg"
              alt="医师头像"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-white text-base">了解您的生活习惯有助于我更全面地评估您的健康风险。</p>
        </div>
      </div>

      {/* 下一步按钮 */}
      <button
        onClick={handleNext}
        className="mt-8 primary-button mx-4 mb-12" // 添加左右和底部边距
      >
        下一步
      </button>
    </div>
  );
};

export default HabitSelection; 