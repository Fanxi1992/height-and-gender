
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGender, getHeight } from '../utils/storage';
import StatusBar from '../components/StatusBar';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const gender = getGender();
  const height = getHeight();

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-16 w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">个人健康数据</h1>
        
        <div className="bg-white rounded-xl p-6 w-full">
          <h2 className="text-xl font-bold text-black mb-4">您的基本数据</h2>
          
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-gray-500 text-sm">性别</p>
            <p className="text-black font-medium">{gender === 'male' ? '男性' : '女性'}</p>
          </div>
          
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-gray-500 text-sm">身高</p>
            <p className="text-black font-medium">{height} 厘米</p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">您已完成基本信息设置</p>
            <p className="text-black">更多功能开发中...</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/login')}
          className="mt-8 secondary-button"
        >
          返回登录页
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
