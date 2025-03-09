
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ArrowLeft } from 'lucide-react';

// Define disease data
const diseaseData = [
  {
    id: 1,
    name: "二型糖尿病",
    risk: 0.73,
    introduction: "二型糖尿病是一种代谢性疾病，特征是血糖水平长期升高，主要由胰岛素抵抗和相对胰岛素不足引起。",
    prevention: "维持健康体重、定期体育锻炼、减少精制碳水化合物摄入、控制血压、定期监测血糖水平。"
  },
  {
    id: 2,
    name: "高血压",
    risk: 0.61,
    introduction: "高血压是一种慢性病，表现为动脉压力持续升高，可导致心脏、脑部和其他器官的损伤。",
    prevention: "减少钠摄入、增加水果蔬菜摄入、限制酒精消费、保持活跃生活方式、避免吸烟、管理压力。"
  },
  {
    id: 3,
    name: "肾结石",
    risk: 0.55,
    introduction: "肾结石是尿液中矿物质和盐形成的固体物质，在尿路系统中形成结晶体，引起剧烈疼痛。",
    prevention: "多喝水、减少高草酸和高盐饮食、适量补充钙质、减少动物蛋白质摄入、避免某些药物如补充剂。"
  },
  {
    id: 4,
    name: "高血糖",
    risk: 0.43,
    introduction: "高血糖是血液中葡萄糖水平过高的状态，可能是糖尿病前期或糖尿病的症状之一。",
    prevention: "健康饮食、适量运动、保持健康体重、限制精制糖摄入、增加膳食纤维摄入、规律作息。"
  },
  {
    id: 5,
    name: "肠易激综合征",
    risk: 0.31,
    introduction: "肠易激综合征是一种功能性肠道障碍，表现为腹痛、腹胀和排便习惯改变，无器质性病变。",
    prevention: "识别并避免触发食物、管理压力和焦虑、规律进餐、增加溶解性纤维摄入、保持水分充足。"
  },
  {
    id: 6,
    name: "浅表性胃炎",
    risk: 0.28,
    introduction: "浅表性胃炎是胃粘膜的炎症，可由细菌感染、药物、酒精或压力引起，引起上腹不适。",
    prevention: "避免刺激性食物和饮料、限制NSAID类药物使用、规律三餐、戒烟限酒、管理压力。"
  },
  {
    id: 7,
    name: "偏头痛",
    risk: 0.16,
    introduction: "偏头痛是一种神经血管性疾病，特征是反复发作的中重度头痛，常伴有恶心、呕吐和对光声敏感。",
    prevention: "识别并避免触发因素、保持规律作息、适量运动、避免过度用眼、管理压力、保持水分充足。"
  },
  {
    id: 8,
    name: "前列腺炎",
    risk: 0.11,
    introduction: "前列腺炎是前列腺的炎症，可引起排尿困难、盆腔疼痛和性功能障碍。",
    prevention: "定期排尿、避免长时间久坐、适量运动、避免酒精和咖啡因、定期前列腺检查。"
  },
  {
    id: 9,
    name: "胆囊炎",
    risk: 0.04,
    introduction: "胆囊炎是胆囊的炎症，通常由胆结石导致，表现为右上腹部疼痛、发热和恶心。",
    prevention: "健康均衡饮食、保持健康体重、限制高脂高胆固醇食物、增加膳食纤维摄入、定期体检。"
  },
  {
    id: 10,
    name: "肝硬化",
    risk: 0.02,
    introduction: "肝硬化是慢性肝脏损伤导致的肝组织纤维化和结节形成，可影响肝脏功能和血流。",
    prevention: "限制酒精摄入、避免不必要的药物使用、接种肝炎疫苗、安全性行为、定期肝功能检查。"
  }
];

// Card colors for different positions
const cardColors = [
  "bg-white", // First card (main focus)
  "bg-blue-100", // Second card
  "bg-black text-white", // Third card
  "bg-blue-200", // Fourth card
  "bg-purple-200", // Fifth card
  "bg-white", // Sixth card
  "bg-gray-300", // Seventh card
  "bg-blue-100", // Eighth card
  "bg-white", // Ninth card
  "bg-gray-200", // Tenth card
];

const DiseaseRiskDetail: React.FC = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // Touch event handlers for card swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    setCurrentOffset(diff);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50; // Minimum distance to trigger card change
    
    if (currentOffset > threshold && activeIndex > 0) {
      // Swipe down - show previous card
      setActiveIndex(activeIndex - 1);
    } else if (currentOffset < -threshold && activeIndex < diseaseData.length - 1) {
      // Swipe up - show next card
      setActiveIndex(activeIndex + 1);
    }
    
    setIsDragging(false);
    setCurrentOffset(0);
  };
  
  // Calculate card positions and styles
  const getCardStyle = (index: number) => {
    const basePosition = index - activeIndex;
    const position = basePosition + (isDragging ? currentOffset / 100 : 0);
    
    // Different transformations based on position
    if (position < -2) {
      // Cards way above the stack - hide them
      return {
        transform: `translateY(-200%) scale(0.85)`,
        opacity: 0,
        zIndex: 10 - index,
        display: 'none'
      };
    } else if (position < -1) {
      // Card just above the top of stack
      return {
        transform: `translateY(-120%) scale(0.85)`,
        opacity: 0.3,
        zIndex: 10 - index
      };
    } else if (position < 0) {
      // Card at top of stack
      return {
        transform: `translateY(${position * 60}px) scale(${0.95 + position * 0.05})`,
        opacity: 1 + position * 0.3,
        zIndex: 10 - index
      };
    } else if (position === 0) {
      // Active card
      return {
        transform: 'translateY(0) scale(1)',
        opacity: 1,
        zIndex: 20
      };
    } else if (position < 4) {
      // Cards below active card
      return {
        transform: `translateY(${position * 60}px) scale(${1 - position * 0.05})`,
        opacity: 1 - position * 0.2,
        zIndex: 10 - position
      };
    } else {
      // Cards way below - hide them
      return {
        transform: `translateY(240px) scale(0.75)`,
        opacity: 0,
        zIndex: 1,
        display: 'none'
      };
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <StatusBar />
      
      {/* Header */}
      <div className="w-full flex items-center justify-center relative py-4">
        <button 
          className="absolute left-4 p-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
        <h1 className="text-xl font-medium">TOP 10风险疾病与建议</h1>
      </div>
      
      {/* Indicator line */}
      <div className="w-20 h-1 bg-white/30 mx-auto rounded-full my-2"></div>
      
      {/* Card Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative px-4 py-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {diseaseData.map((disease, index) => (
          <div
            key={disease.id}
            className={`absolute w-full p-5 rounded-3xl transition-all duration-300 shadow-lg ${cardColors[index % cardColors.length]}`}
            style={{
              ...getCardStyle(index),
              left: 0,
              right: 0,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {/* Card Header with Disease Name and Number */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{disease.name}</h2>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${index === activeIndex ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-gray-400'}`}>
                {disease.id}
              </div>
            </div>
            
            {/* Risk Value */}
            <div className="mb-3">
              <p className={`text-sm ${index === activeIndex ? 'font-medium text-blue-600' : 'text-gray-600'}`}>风险值</p>
              <div className="w-full bg-gray-200 rounded-full h-2 my-1">
                <div 
                  className={`h-2 rounded-full ${disease.risk > 0.5 ? 'bg-red-500' : disease.risk > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${disease.risk * 100}%` }}
                ></div>
              </div>
              <p className={`text-right ${disease.risk > 0.5 ? 'text-red-500' : disease.risk > 0.3 ? 'text-yellow-500' : 'text-green-500'} font-bold`}>
                {disease.risk * 100}%
              </p>
            </div>
            
            {/* Disease Information - Only fully visible on active card */}
            <div className={`transition-all duration-300 ${index === activeIndex ? 'opacity-100' : 'opacity-70'}`}>
              {/* Disease Introduction */}
              <div className="mb-3">
                <h3 className={`text-md font-semibold ${index === 2 ? 'text-white' : 'text-gray-800'}`}>疾病简介</h3>
                <p className={`text-sm mt-1 ${index === 2 ? 'text-gray-300' : 'text-gray-600'}`}>
                  {disease.introduction}
                </p>
              </div>
              
              {/* Prevention Strategy */}
              <div className="mb-2">
                <h3 className={`text-md font-semibold ${index === 2 ? 'text-white' : 'text-gray-800'}`}>预防策略</h3>
                <p className={`text-sm mt-1 ${index === 2 ? 'text-gray-300' : 'text-gray-600'}`}>
                  {disease.prevention}
                </p>
              </div>
            </div>
            
            {/* Bottom Indicator */}
            <div className="w-20 h-1 bg-gray-300 mx-auto rounded-full mt-4"></div>
          </div>
        ))}
      </div>
      
      {/* Bottom Navigation */}
      <div className="w-full px-5 py-4 bg-black">
        <div className="w-full flex justify-center space-x-1 mb-4">
          {diseaseData.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-blue-500' : 'w-2 bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiseaseRiskDetail;
