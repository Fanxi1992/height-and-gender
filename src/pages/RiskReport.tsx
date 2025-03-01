
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import ProgressIndicator from '../components/ProgressIndicator';

const RiskReport: React.FC = () => {
  const navigate = useNavigate();
  
  const handleExplore = () => {
    navigate('/home');
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-4 px-4 flex justify-between items-center">
        <BackButton />
        <h1 className="text-lg font-medium text-white">建立个人报告</h1>
        <div className="w-8"></div> {/* 占位，使标题居中 */}
      </div>
      
      <ProgressIndicator currentStep={7} totalSteps={7} />
      
      <div className="mx-4 mt-8 bg-white rounded-3xl p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-center">
          潜在疾病风险报告
        </h2>
        
        <div className="w-full mb-6">
          <img 
            src="/lovable-uploads/203e265d-cf69-4459-8298-f8d6413e93a7.png" 
            alt="Disease Risk Visualization" 
            className="w-full h-auto"
          />
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 w-full">
          <p className="text-gray-700 text-base">
            适当调整饮食和增加运动可有效降低代谢、心血管和关节疾病风险，提升健康状态！
          </p>
          
          <div className="mt-3 flex items-center">
            <span className="text-blue-500">查看详情</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="mx-4 mt-auto mb-2 bg-[#26355A] rounded-3xl p-4 flex items-center">
        <div className="w-16 h-16 mr-4 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-white text-xs">
            智能
          </div>
        </div>
        <p className="text-white text-sm">
          后续的减重和疾病问题都可以来问我哦！
        </p>
      </div>
      
        <button
          onClick={handleExplore}
          className="mt-6 primary-button"
        >
          开始探索吧
        </button>

    </div>
  );
};

export default RiskReport;
