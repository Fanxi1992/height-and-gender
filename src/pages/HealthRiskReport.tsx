
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';

const HealthRiskReport: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleStartReport = () => {
    // 这里可以添加开启报告的逻辑
    console.log('Starting health risk report');
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-black text-white">
      <StatusBar />
      
      {/* Header */}
      <div className="w-full flex items-center justify-center relative py-4">
        <button 
          className="absolute left-4 p-2" 
          onClick={handleBack}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-medium">健康风险报告</h1>
      </div>
      
      {/* Watermark */}
      <div className="w-full px-5 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Colorpong.com</span>
        <span className="text-xs text-gray-500">5$</span>
      </div>
      
      {/* Main Disease Network Visualization */}
      <div className="w-full px-5 mt-2 mb-4 flex-1">
        <img 
          src="/lovable-uploads/74077656-41ec-4ddd-9a44-e3279a8ff31c.png" 
          alt="Disease Network Visualization" 
          className="w-full h-auto"
        />
      </div>
      
      {/* Bottom Content */}
      <div className="w-full px-5 mb-4">
        <div className="flex">
          <div className="flex flex-col items-start">
            <span className="text-5xl font-bold">02</span>
            <span className="text-5xl font-bold">04</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Button */}
      <div className="w-full px-5 mb-20">
        <button
          onClick={handleStartReport}
          className="w-full py-4 bg-blue-600 rounded-full flex items-center"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <span className="ml-4 text-white text-lg">一键开启你的健康风险报告吧</span>
        </button>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path><path d="M10 2c1 .5 2 2 2 5"></path></svg>
          <span className="text-xs">商城</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z"></path><path d="M6 11V8h12v3"></path></svg>
          <span className="text-xs">圈子</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </div>
      </div>
    </div>
  );
};

export default HealthRiskReport;
