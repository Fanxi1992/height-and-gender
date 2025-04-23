import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import useUserStore from '../stores/userStore';

// 调试演示页面 - 显示从userStore获取的数据格式
const DebugDataDemo: React.FC = () => {
  const navigate = useNavigate();
  
  // 从store获取方法
  const getBaseInfos = useUserStore(state => state.getBaseInfos);
  const getDiseaseInput = useUserStore(state => state.getDiseaseInput);
  
  // 获取数据
  const baseInfos = getBaseInfos();
  const diseaseInput = getDiseaseInput();

  // 返回引导流程
  const handleBackToOnboarding = () => {
    navigate('/gender-selection');
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      <BackButton />
      
      <div className="mt-10 w-full">
        <h1 className="text-center text-xl font-medium">数据格式演示</h1>
        
        <div className="white-card">
          <h2 className="text-center text-2xl font-bold mb-6">用户数据</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">基本信息 (base_infos)</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto">
              {baseInfos ? (
                <pre className="text-xs">
                  {JSON.stringify(baseInfos, null, 2)}
                </pre>
              ) : (
                <p className="text-red-500">基本信息不完整，请完成引导流程</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">疾病信息 (disease_input)</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto">
              <pre className="text-xs">
                {JSON.stringify(diseaseInput, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">映射到后端接口的数据</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto">
              {baseInfos ? (
                <pre className="text-xs">
                  {JSON.stringify({
                    "年龄": baseInfos["年龄"],
                    "性别": baseInfos["性别"],
                    "身高": baseInfos["身高(101)"],
                    "体重": baseInfos["体重(102)"],
                    "吸烟史等级": baseInfos["吸烟史等级"],
                    "饮酒史等级": baseInfos["饮酒史等级"],
                    "运动习惯等级": baseInfos["运动习惯等级"],
                    "疾病历史": diseaseInput
                  }, null, 2)}
                </pre>
              ) : (
                <p className="text-red-500">基本信息不完整，请完成引导流程</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">API请求数据格式</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto">
              <pre className="text-xs">
{`// API请求数据格式示例
{
  "年龄": 50,
  "性别": 1,  // 男性为1 女性为0
  "身高": 180, // 单位：厘米
  "体重": 100, // 单位：kg
  "吸烟史等级": 0, // 0 无；1 0-5年；2 5-10年；3 10-20年；4 20年以上
  "饮酒史等级": 0, // 0 无；1 0-5年；2 5-10年；3 10-20年；4 20年以上
  "运动习惯等级": 3, // 0 无；1 偶尔；2 经常；3 每日
  "疾病历史": ["肥胖症"]
}
// 注：体重指数(BMI)由后端根据身高体重自动计算，无需发送`}
              </pre>
            </div>
          </div>
          
          <button 
            onClick={handleBackToOnboarding}
            className="primary-button"
          >
            返回引导流程
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugDataDemo; 