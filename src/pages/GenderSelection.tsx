
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveGender } from '../utils/storage';

// 图片资源 URLs
const femaleAvatarUrl = "/lovable-uploads/b545d173-0e2d-4a9b-825b-2e802baaea29.png";

const GenderSelection: React.FC = () => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const navigate = useNavigate();

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
  };

  const handleNext = () => {
    if (selectedGender) {
      saveGender(selectedGender);
      navigate('/height');
    }
  };

  const handleSkip = () => {
    navigate('/height');
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      <SkipButton onClick={handleSkip} />

      <div className="mt-16 w-full">
        <h1 className="text-center text-xl font-medium">建立个人报告</h1>
        <ProgressIndicator currentStep={1} totalSteps={7} />

        <div className="white-card min-h-[420px]">
          <p className="text-gray-500 text-sm text-center mb-2">完成评测，生成您的专属健康报告</p>
          <h2 className="text-center text-2xl font-bold mb-6">您的性别是</h2>

          <div className="w-full flex flex-col gap-8">
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
                  src={femaleAvatarUrl} 
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
                <svg width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="56" cy="56" r="56" fill="#4F5D73"/>
                  <path d="M55.9999 60.6667C63.3638 60.6667 69.3333 54.6971 69.3333 47.3333C69.3333 39.9695 63.3638 34 55.9999 34C48.6361 34 42.6666 39.9695 42.6666 47.3333C42.6666 54.6971 48.6361 60.6667 55.9999 60.6667Z" fill="#231F20" opacity="0.4"/>
                  <path d="M56 65.3333C44.2 65.3333 34.6666 74.8667 34.6666 86.6667V88.6667H77.3333V86.6667C77.3333 74.8667 67.8 65.3333 56 65.3333Z" fill="#231F20" opacity="0.4"/>
                </svg>
              </div>
              <span className="text-black font-medium">男性</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#302C52] rounded-full flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#544F7D] flex items-center justify-center mr-3">
            <span className="font-bold text-white">♂</span>
          </div>
          <p className="text-sm text-white">生理性别和激素会影响我们身体代谢的方式</p>
        </div>

        <button 
          onClick={handleNext}
          className={`mt-8 ${selectedGender ? 'secondary-button' : 'secondary-button opacity-70'}`}
          disabled={!selectedGender}
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default GenderSelection;
