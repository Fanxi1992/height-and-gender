import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveDiseases } from '../utils/storage';

const DiseaseSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  
  const diseaseOptions = [
    'II型糖尿病', '高血脂', '脂肪肝', '心房颤动', 
    '高血压', '冠心病', '关节炎', '痛风',
    '腰椎间盘突出', '哮喘'
  ];
  
  const toggleDisease = (disease: string) => {
    setSelectedDiseases(prev => 
      prev.includes(disease) 
        ? prev.filter(d => d !== disease) 
        : [...prev, disease]
    );
  };
  
  const handleNext = () => {
    saveDiseases(selectedDiseases);
    window.scrollTo(0, 0);
    navigate('/risk-report');
  };
  
  const handleSkip = () => {
    // Save empty array and skip to the next page
    saveDiseases([]);
    window.scrollTo(0, 0);
    navigate('/risk-report');
  };
  
  const handleNone = () => {
    setSelectedDiseases([]);
    saveDiseases([]);
    window.scrollTo(0, 0);
    navigate('/risk-report');
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-4 px-4 flex justify-between items-center">
        <BackButton />
        <h1 className="text-lg font-medium text-white">建立个人报告</h1>
        <SkipButton onClick={handleSkip} />
      </div>
      
      <ProgressIndicator currentStep={6} totalSteps={7} />
      
      <div className="mx-4 mt-8 bg-white rounded-3xl p-4 flex flex-col items-center">
        <p className="text-center text-gray-500 text-sm mb-1">
          完成评测，生成您的专属健康报告
        </p>
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          是否有以下疾病
        </h2>
        
        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          {diseaseOptions.map((disease, index) => (
            <button
              key={index}
              className={`py-2.5 px-4 rounded-full text-center ${
                selectedDiseases.includes(disease)
                  ? 'bg-app-blue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => toggleDisease(disease)}
            >
              {disease}
            </button>
          ))}
        </div>
        
        <button
          className="w-full py-3 px-4 rounded-full bg-gray-100 text-gray-700 mb-5"
          onClick={handleNone}
        >
          以上均无
        </button>
      </div>
      
      <div className="mx-4 mt-6 mb-4 bg-[#26355A] rounded-3xl p-4 flex items-center">
        <div className="w-16 h-16 mr-4 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-white text-xs">
            智能
          </div>
        </div>
        <p className="text-white text-sm">
          我可以根据您已有的疾病预测其他潜在的疾病，您提供的信息越精确，生成的结果越精确哦！
        </p>
      </div>
      
      <button 
        onClick={handleNext}
        className="mt-6 primary-button mx-4 mb-12"
      >
        下一步
      </button>
    </div>
  );
};

export default DiseaseSelection;
