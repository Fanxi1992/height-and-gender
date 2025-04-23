import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import useUserStore from '../stores/userStore';

// 定义常量
const MIN_HEIGHT = 140;
const MAX_HEIGHT = 190;
const MIN_WEIGHT = 30.0;
const MAX_WEIGHT = 120.0;
const HEIGHT_STEP = 1;
const WEIGHT_STEP = 0.5; // 体重调整步长改为0.5kg

const HeightWeightSelection: React.FC = () => {
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(70.0);
  const navigate = useNavigate();
  
  // 引入Zustand存储方法
  const { setHeight: storeHeight, setWeight: storeWeight } = useUserStore();

  // -- 新增：处理身高/体重变化的函数 --
  const handleHeightChange = (increment: number) => {
    setHeight(prevHeight => {
      const newHeight = prevHeight + increment * HEIGHT_STEP;
      return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
    });
  };

  const handleWeightChange = (increment: number) => {
    setWeight(prevWeight => {
      const newWeight = prevWeight + increment * WEIGHT_STEP;
      // 处理浮点数精度问题并限制范围
      const roundedWeight = parseFloat(newWeight.toFixed(1));
      return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, roundedWeight));
    });
  };


  // 计算BMI (保持不变)
  const calculateBMI = () => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI();

  // 判断BMI状态 (保持不变)
  const getBMIStatus = () => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return "偏瘦";
    if (bmiValue < 24) return "正常";
    if (bmiValue < 28) return "超重";
    return "肥胖";
  };

  const bmiStatus = getBMIStatus();
  const bmiStatusColor = bmiStatus === "超重" || bmiStatus === "肥胖" ? "text-purple-500" : "text-green-500";

  // 处理下一步 (修改存储方式和导航目标)
  const handleNext = () => {
    storeHeight(height);
    storeWeight(weight);
    window.scrollTo(0, 0);
    // 修改导航目标为习惯选择页
    navigate('/habit-selection'); 
  };

  // 处理跳过 (修改导航目标)
  const handleSkip = () => {
    window.scrollTo(0, 0);
    // 修改导航目标为习惯选择页
    navigate('/habit-selection'); 
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      <SkipButton onClick={handleSkip} />

      <div className="mt-10 w-full">
        <h1 className="text-center text-xl font-medium">建立个人报告</h1>
        <ProgressIndicator currentStep={3} totalSteps={6} />

        <div className="white-card min-h-[450px]"> {/* 调整最小高度 */}
          <p className="text-gray-500 text-sm text-center mb-6">完成评测，生成您的专属健康报告</p>

          {/* 新增：身高体重并排选择 */}
          <h2 className="text-center text-xl font-bold mb-6">您的身高体重是</h2>
          <div className="flex justify-around items-start w-full mb-8"> {/* 使用 flex 布局 */}

            {/* 身高选择 */}
            <div className="flex flex-col items-center w-1/2">
               <div className="text-center mb-4">
                 <span className="text-4xl font-bold text-app-blue">{height}</span>
                 <span className="text-lg ml-1 text-gray-600">CM</span>
               </div>
               <div className="flex items-center space-x-4">
                 <button
                   onClick={() => handleHeightChange(-1)}
                   disabled={height <= MIN_HEIGHT}
                   className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 text-2xl font-bold disabled:opacity-50 active:bg-gray-300"
                 >
                   -
                 </button>
                 <button
                   onClick={() => handleHeightChange(1)}
                   disabled={height >= MAX_HEIGHT}
                   className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 text-2xl font-bold disabled:opacity-50 active:bg-gray-300"
                 >
                   +
                 </button>
               </div>
            </div>

            {/* 垂直分隔线 */}
            <div className="border-l border-gray-300 h-20"></div>

            {/* 体重选择 */}
            <div className="flex flex-col items-center w-1/2">
               <div className="text-center mb-4">
                 <span className="text-4xl font-bold text-app-blue">{weight.toFixed(1)}</span>
                 <span className="text-lg ml-1 text-gray-600">KG</span>
               </div>
               <div className="flex items-center space-x-4">
                 <button
                   onClick={() => handleWeightChange(-1)}
                   disabled={weight <= MIN_WEIGHT}
                   className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 text-2xl font-bold disabled:opacity-50 active:bg-gray-300"
                 >
                   -
                 </button>
                 <button
                   onClick={() => handleWeightChange(1)}
                   disabled={weight >= MAX_WEIGHT}
                   className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 text-2xl font-bold disabled:opacity-50 active:bg-gray-300"
                 >
                   +
                 </button>
               </div>
            </div>
          </div>


          {/* -- 移除旧的尺子 JSX -- */}
          {/* <h2 className="text-center text-xl font-bold mt-4">您的身高是</h2> ... */}
          {/* <div className="horizontal-ruler" ...> ... </div> */}
          {/* <h2 className="text-center text-xl font-bold mt-8">您的体重是</h2> ... */}
          {/* <div className="horizontal-ruler" ...> ... </div> */}


          {/* BMI 显示部分 (保持不变) */}
          <div className="mt-4 p-6 bg-gray-50 rounded-xl w-full"> {/* 确保 BMI 部分宽度占满 */}
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
              您的 BMI 属于{bmiStatus}，{bmiStatus === "超重" || bmiStatus === "肥胖" ?
                "建议适量减重 3-5KG 以降低 糖尿病、高血压和心血管疾病 风险，同时改善代谢健康。" :
                bmiStatus === "正常" ? "您的体重处于健康范围内，请继续保持健康的生活方式。" :
                "建议增加适量营养摄入和锻炼，以达到更健康的体重范围。"}
            </p>

            <p className="text-xs text-gray-400 mt-4">
              注：bmi是目前诊断肥胖最广泛使用的方法和指标：<br/>
              bmi(kg/m²)=体重(kg)/身高²(m²)
            </p>
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
            <p className="text-white text-base">精确的身高体重数据将使我准确计算BMI指数</p>
          </div>
        </div>

        {/* 下一步按钮 (保持不变) */}
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

export default HeightWeightSelection; 