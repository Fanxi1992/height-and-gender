import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import SkipButton from '../components/SkipButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { saveGender } from '../utils/storage';

// 移除不需要的图片URL
// const femaleAvatarUrl = "/lovable-uploads/b545d173-0e2d-4a9b-825b-2e802baaea29.png";

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
                {/* 使用标准女性符号SVG */}
                <svg width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="56" cy="56" r="56" fill="#F6C1D8"/>
                  <path d="M56 28C47.1634 28 40 35.1634 40 44C40 51.3796 44.7613 57.5879 51.5 59.4141V68H45.5C44.6716 68 44 68.6716 44 69.5C44 70.3284 44.6716 71 45.5 71H51.5V77.5C51.5 78.3284 52.1716 79 53 79C53.8284 79 54.5 78.3284 54.5 77.5V71H60.5C61.3284 71 62 70.3284 62 69.5C62 68.6716 61.3284 68 60.5 68H54.5V59.4141C61.2387 57.5879 66 51.3796 66 44C66 35.1634 58.8366 28 50 28H56ZM56 31C57.5823 31 59.129 31.2922 60.5547 31.8359C54.7375 33.1229 50.5 38.0899 50.5 44C50.5 50.6274 55.8726 56 62.5 56C64.8041 56 66.9567 55.3275 68.7656 54.1641C67.3283 59.1006 63.4173 63.0117 58.4805 64.4492C57.6698 64.6901 57.3333 65.1842 57 65.5C56.6667 65.8158 56.3302 66.3099 56.5195 67.1211C56.70871 67.9324 57.1632 68.2943 57.5 68.5C57.8368 68.7057 58.3286 69.0391 59.1992 68.9121C67.0709 67.0108 73 56.9126 73 45C73 36.1634 65.8366 29 57 29L56 31ZM53 36C56.3137 36 59 38.6863 59 42C59 45.3137 56.3137 48 53 48C49.6863 48 47 45.3137 47 42C47 38.6863 49.6863 36 53 36Z" fill="#E75A94"/>
                </svg>
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
                {/* 使用标准男性符号SVG */}
                <svg width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="56" cy="56" r="56" fill="#A2C0D9"/>
                  <path d="M56 31C48.8203 31 43 36.8203 43 44C43 50.3145 47.3499 55.6139 53.1914 56.7773C53.7356 56.9043 54.131 56.7883 54.4453 56.6563C54.7595 56.5242 55.0674 56.3006 55.2793 55.8828C55.4912 55.465 55.5 55.0138 55.4141 54.6797C55.3281 54.3455 55.1036 54.0223 54.6836 53.8164C50.3598 51.9561 47.5 48.2565 47.5 44C47.5 39.3056 51.3056 35.5 56 35.5C60.6944 35.5 64.5 39.3056 64.5 44C64.5 48.2565 61.6402 51.9561 57.3164 53.8164C56.8964 54.0223 56.6719 54.3455 56.5859 54.6797C56.5 55.0138 56.5088 55.465 56.7207 55.8828C56.9326 56.3006 57.2405 56.5242 57.5547 56.6563C57.869 56.7883 58.2644 56.9043 58.8086 56.7773C64.6501 55.6139 69 50.3145 69 44C69 36.8203 63.1797 31 56 31ZM60.5 48.5C61.3284 48.5 62 47.8284 62 47C62 46.1716 61.3284 45.5 60.5 45.5H63.5C64.3284 45.5 65 44.8284 65 44C65 43.1716 64.3284 42.5 63.5 42.5H60.5C61.3284 42.5 62 41.8284 62 41C62 40.1716 61.3284 39.5 60.5 39.5H51.5C50.6716 39.5 50 40.1716 50 41C50 41.8284 50.6716 42.5 51.5 42.5H48.5C47.6716 42.5 47 43.1716 47 44C47 44.8284 47.6716 45.5 48.5 45.5H51.5C50.6716 45.5 50 46.1716 50 47C50 47.8284 50.6716 48.5 51.5 48.5H60.5ZM51.9961 59C51.9974 59.0013 51.9948 59.0026 51.9961 59.0039L51.9922 59H51.9961ZM51.4961 59C51.3281 59 51.1585 59.0135 50.9922 59.0391L51.4961 59ZM51.9961 59H60C68.8203 59 76 66.1797 76 75V79.5C76 80.3284 75.3284 81 74.5 81C73.6716 81 73 80.3284 73 79.5V75C73 67.8203 67.1797 62 60 62H52C44.8203 62 39 67.8203 39 75V79.5C39 80.3284 38.3284 81 37.5 81C36.6716 81 36 80.3284 36 79.5V75C36 66.1797 43.1797 59 52 59H51.9961Z" fill="#4973AB"/>
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
