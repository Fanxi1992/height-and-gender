import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import useUserStore from '../stores/userStore';
import { otherDiseases } from '../constants/diseaseList';

const DiseaseSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [customDiseases, setCustomDiseases] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  const { setDiseases, gender, height, weight, birthdate } = useUserStore();
  
  const diseaseOptions = [
    '肥胖症', '脂肪肝', '高尿酸血症', '高胆固醇血症', 
    '高甘油三酯血症', '高血压', '动脉硬化', '混合性高脂血症',
    '糖尿病', '窦性心动过缓'
  ];
  
  // 搜索功能
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = otherDiseases.filter(disease => 
      disease.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedDiseases.includes(disease) &&
      !customDiseases.includes(disease)
    );
    
    setSearchResults(results.slice(0, 10)); // 限制显示前10个结果
  }, [searchQuery, selectedDiseases, customDiseases]);
  
  const toggleDisease = (disease: string) => {
    setSelectedDiseases(prev => 
      prev.includes(disease) 
        ? prev.filter(d => d !== disease) 
        : [...prev, disease]
    );
  };
  
  const handleNext = () => {
    // 合并常见疾病和自定义疾病
    const allDiseases = [...selectedDiseases, ...customDiseases];
    
    // 计算年龄
    let age: number | null = null;
    if (birthdate) {
      const birthDateObj = new Date(birthdate.year, birthdate.month - 1, birthdate.day);
      const today = new Date();
      age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
    }

    // 在跳转前打印状态
    console.log('用户当前状态:', {
      gender,
      age, // 使用计算出的年龄
      height,
      weight,
      diseases: allDiseases, 
    });

    setDiseases(allDiseases);
    window.scrollTo(0, 0);
    navigate('/risk-report');
  };
  
  const handleSkip = () => {
    // Save empty array and skip to the next page
    setDiseases([]);
    window.scrollTo(0, 0);
    navigate('/risk-report');
  };
  
  const addCustomDisease = (disease: string) => {
    if (!customDiseases.includes(disease)) {
      setCustomDiseases(prev => [...prev, disease]);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const removeCustomDisease = (disease: string) => {
    setCustomDiseases(prev => prev.filter(d => d !== disease));
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() !== '') {
      setShowDropdown(true);
    }
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-10 px-4 flex justify-between items-center">
        <BackButton />
        <h1 className="text-xl font-medium text-white">建立个人报告</h1>
        <SkipButton onClick={handleSkip} />
      </div>
      
      <ProgressIndicator currentStep={5} totalSteps={6} />
      
      <div className="white-card flex flex-col items-center">
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
        
        <div className="w-full">
          <p className="text-gray-700 font-medium mb-2">添加其他疾病</p>
          <div className="relative w-full mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(e.target.value.trim() !== '');
              }}
              onFocus={handleInputFocus}
              placeholder="搜索其他疾病"
              className="w-full py-2.5 px-4 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-app-blue"
            />
            
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((disease, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                    onClick={() => addCustomDisease(disease)}
                  >
                    {disease}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {customDiseases.length > 0 && (
            <div className="mt-3 w-full">
              <p className="text-gray-700 font-medium mb-2">已添加的其他疾病：</p>
              <div className="flex flex-wrap gap-2">
                {customDiseases.map((disease, index) => (
                  <div 
                    key={index} 
                    className="py-1.5 px-3 rounded-full bg-app-blue text-white flex items-center"
                  >
                    <span>{disease}</span>
                    <button 
                      onClick={() => removeCustomDisease(disease)}
                      className="ml-2 text-white font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <p className="text-white text-base">我可以根据您已有的疾病预测其他潜在的疾病，您提供的信息越精确，生成的结果越精确哦！
            </p>
          </div>
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
