import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ArrowLeft } from 'lucide-react';
// 从 data 文件导入静态数据和类型
import { diseaseData as staticDiseaseData } from '../data/diseaseData'; // 重命名以区分
// 导入 store 和用户风险数据类型 (假设类型为 RiskReportItem)
import useUserStore from '../stores/userStore';
import { RiskReportItem } from '../stores/userStore'; // 假设 store 中导出了 RiskReportItem 类型

// 定义用于显示的疾病数据类型，包含从 store 获取的 risk 和 id
interface DisplayDisease {
  id: number; // 使用索引作为唯一 ID
  name: string;
  risk: number;
  introduction: string;
  prevention: string;
  color: string; // 新增 color 属性
}

// 风险等级对应颜色
const riskColors = {
  high: {
    bg: "bg-red-500",
    text: "text-red-300",
    light: "text-red-300"
  },
  medium: {
    bg: "bg-yellow-500",
    text: "text-yellow-300",
    light: "text-yellow-300"
  },
  low: {
    bg: "bg-green-500",
    text: "text-green-300",
    light: "text-green-300"
  }
};

// 新增：根据风险类别获取颜色 (与 HealthRiskReport 保持一致)
const getRiskCategoryColor = (risk: number): string => {
  if (risk > 0.5) {
    return '#ef4444'; // 高风险 - 红色
  }
  // 修改中风险阈值下限为 0.1
  if (risk >= 0.1) { // risk <= 0.5 implicitly handled by previous check
    return '#eab308'; // 中风险 - 黄色
  }
  // 低风险阈值为 < 0.1
  return '#22c55e'; // 低风险 - 绿色
};

const DiseaseRiskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { riskReportData } = useUserStore(); // 从 store 获取数据
  const [activeIndex, setActiveIndex] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // expandedCardId 现在存储 DisplayDisease 的 id (即索引)
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // 处理 riskReportData 并与静态数据合并
  const displayDiseases = useMemo((): DisplayDisease[] => { // 明确返回类型
    if (!riskReportData || riskReportData.length === 0) {
      return [];
    }
    // 1. 过滤掉 risk === 1
    const filteredData = riskReportData.filter((d: RiskReportItem) => d.risk !== 1);

    // 2. 如果过滤后没有数据，则返回空数组
    if (filteredData.length === 0) {
        return [];
    }

    // 3. 按风险降序排序
    const sortedFilteredData = [...filteredData].sort((a: RiskReportItem, b: RiskReportItem) => b.risk - a.risk);

    // 4. 取前 10 个
    const topData = sortedFilteredData.slice(0, 10);

    // 5. 查找静态数据并合并，同时使用基于风险类别的颜色
    const mergedData: DisplayDisease[] = topData.map((riskItem: RiskReportItem, index: number) => {
      const staticData = staticDiseaseData.find(d => d.name === riskItem.name);
      if (staticData) {
        return {
          id: index, // 使用索引作为唯一 ID
          name: riskItem.name,
          risk: riskItem.risk,
          introduction: staticData.introduction,
          prevention: staticData.prevention,
          color: getRiskCategoryColor(riskItem.risk) // 使用基于风险类别的颜色
        };
      }
      return null; // 如果找不到匹配的静态数据，则返回 null
    }).filter((item): item is DisplayDisease => item !== null); // 过滤掉 null 值并进行类型守卫

    return mergedData;
  }, [riskReportData]); // 依赖 riskReportData

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // 处理卡片点击，展开详情
  const handleCardClick = (id: number) => {
    // 如果已经展开了这张卡片，则关闭它
    if (expandedCardId === id) {
      setExpandedCardId(null);
    } else {
      // 否则展开这张卡片
      setExpandedCardId(id);
    }
  };
  
  // Touch event handlers for card swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    // 如果有展开的卡片，点击时不启动滑动
    if (expandedCardId !== null) return;
    
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // 阻止默认的滚动行为
    e.preventDefault();
    
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
    } else if (currentOffset < -threshold && activeIndex < displayDiseases.length - 1) {
      // Swipe up - show next card
      setActiveIndex(activeIndex + 1);
    }
    
    setIsDragging(false);
    setCurrentOffset(0);
  };
  
  // 计算卡片高度，使其占据屏幕高度的3/4
  const cardHeight = windowHeight * 0.75;
  
  // Calculate card positions and styles
  const getCardStyle = (index: number): React.CSSProperties => {
    // 确保 displayDiseases[index] 存在
    if (!displayDiseases[index]) {
        return { display: 'none' }; // 或者返回一个默认的安全样式
    }

    // 使用 displayDiseases[index].id
    if (expandedCardId !== null && displayDiseases[index].id !== expandedCardId) {
      return {
        transform: 'translateY(100vh) scale(0.8)',
        opacity: 0,
        zIndex: 0,
        display: 'none',
        height: `${cardHeight}px`,
        position: 'absolute', // 添加 position 确保绝对定位
        width: '100%',        // 添加 width
        left: 0,              // 添加 left
        right: 0,             // 添加 right
      };
    }
    
    // 使用 displayDiseases[index].id
    if (expandedCardId === displayDiseases[index].id) {
      return {
        transform: 'translateY(0) scale(1)',
        opacity: 1,
        zIndex: 30,
        height: '100vh',
        top: 0,
        borderRadius: 0,
        position: 'absolute', // 添加 position
        width: '100%',        // 添加 width
        left: 0,              // 添加 left
        right: 0,             // 添加 right
      };
    }
    
    const basePosition = index - activeIndex;
    const offsetFactor = isDragging ? currentOffset / 100 : 0;
    const position = basePosition;
    const topOffset = 40;
    
    let style: React.CSSProperties = { // 统一定义基础样式
        position: 'absolute',
        width: '100%',
        left: 0,
        right: 0,
        height: `${cardHeight}px`,
        transition: 'all 0.3s ease-out' // 添加平滑过渡
    };

    // Different transformations based on position
    if (position < -2) {
      style = { ...style, transform: `translateY(-200%) scale(0.85)`, opacity: 0, zIndex: 10 - index, display: 'none' };
    } else if (position < -1) {
      style = { ...style, transform: `translateY(calc(-120% + ${topOffset}px)) scale(0.85)`, opacity: 0.3, zIndex: 10 - index };
    } else if (position < 0) {
      style = { ...style, transform: `translateY(calc(${position * 60}px + ${topOffset}px + ${offsetFactor * 60}px)) scale(${0.95 + position * 0.05})`, opacity: 1 + position * 0.3, zIndex: 10 - index };
    } else if (position === 0) {
      style = { ...style, transform: `translateY(calc(${topOffset}px + ${offsetFactor * 60}px)) scale(1)`, opacity: 1, zIndex: 20 };
    } else if (position < 4) {
      style = { ...style, transform: `translateY(calc(${position * 60}px + ${topOffset}px + ${offsetFactor * 60}px)) scale(${1 - position * 0.05})`, opacity: 1 - position * 0.2, zIndex: 10 - position };
    } else {
      style = { ...style, transform: `translateY(calc(240px + ${topOffset}px)) scale(0.75)`, opacity: 0, zIndex: 1, display: 'none' };
    }
    return style;
  };

  // 获取风险等级样式
  const getRiskStyle = (risk: number) => {
    if (risk > 0.5) return riskColors.high;
    if (risk > 0.3) return riskColors.medium;
    return riskColors.low;
  };
  
  // 渲染卡片内容，根据是否展开显示不同内容
  const renderCardContent = (disease: DisplayDisease, index: number) => {
    const isExpanded = expandedCardId === disease.id;
    const riskStyle = getRiskStyle(disease.risk);
    
    return (
      <>
        {/* Card Header with Disease Name and Number */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-xs font-semibold ${isExpanded ? 'bg-white/10' : 'bg-white/20'}`}>
              {index + 1}
            </div>
            <h2 className="text-lg font-bold">{disease.name}</h2>
          </div>
          {isExpanded && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpandedCardId(null);
              }}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Risk Value */}
        <div className="mb-6 bg-black/20 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">风险评估</p>
            <p className={`font-bold ${riskStyle.light}`}>
              {(disease.risk * 100).toFixed(1)}%
            </p>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${riskStyle.bg}`} 
              style={{ width: `${disease.risk * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1.5 text-white/70">
            <span>低</span>
            <span>中</span>
            <span>高</span>
          </div>
        </div>
        
        {/* Disease Information */}
        <div className={`transition-all duration-300 ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`} 
             style={isExpanded ? {maxHeight: 'calc(100vh - 220px)'} : {maxHeight: 'calc(100% - 210px)'}}>
          {/* Disease Introduction */}
          <div className="mb-5">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
              疾病简介
            </h3>
            <div className={`${isExpanded ? 'bg-black/20 p-4 rounded-xl backdrop-blur-sm' : ''}`}>
              <p className={`text-sm mt-1 leading-relaxed text-white/90 ${isExpanded ? '' : 'overflow-hidden text-ellipsis line-clamp-8'}`}>
                {disease.introduction}
              </p>
            </div>
          </div>
          
          {/* Prevention Strategy */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
              预防策略
            </h3>
            <div className={`${isExpanded ? 'bg-black/20 p-4 rounded-xl backdrop-blur-sm' : ''}`}>
              <p className={`text-sm mt-1 leading-relaxed text-white/90 ${isExpanded ? '' : 'overflow-hidden text-ellipsis line-clamp-8'}`}>
                {disease.prevention}
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Indicator - only show on non-expanded cards */}
        {!isExpanded && (
          <div className="w-10 h-1 bg-white/30 mx-auto rounded-full mt-3 absolute bottom-4 left-0 right-0"></div>
        )}
      </>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* 只有在没有展开卡片时显示状态栏和头部 */}
      {expandedCardId === null && <StatusBar />}
      
      {/* Header - only show when no card is expanded */}
      {expandedCardId === null && (
        <div className="mt-10 px-5 flex justify-between items-center">
          <button 
            className="p-2 rounded-full bg-blue-900/50 backdrop-blur-sm" 
            onClick={handleBack}
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-lg font-medium text-white">TOP {displayDiseases.length}风险疾病与建议</h1>
          <div className="w-10"></div>
        </div>
      )}
      
      {/* Card Container */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden relative px-5 pb-2 ${expandedCardId !== null ? 'pt-0' : 'pt-4'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }} // 防止默认的触摸行为
      >
        {displayDiseases.length > 0 ? (
          displayDiseases.map((disease, index) => (
            <div
              key={disease.id}
              className={`absolute w-full p-5 rounded-2xl transition-all duration-300 shadow-md text-white`}
              style={{
                ...getCardStyle(index),
                backgroundColor: disease.color, // 直接使用 disease.color 作为背景色
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden' // 添加 overflow hidden 避免内容溢出圆角
              }}
              onClick={() => handleCardClick(disease.id)}
            >
              {renderCardContent(disease, index)}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            暂无风险数据或无法匹配疾病详情
          </div>
        )}
      </div>
      
      {/* Bottom Navigation - only show when no card is expanded */}
      {expandedCardId === null && displayDiseases.length > 0 && (
        <div className="w-full px-5 py-5 bg-transparent">
          <div className="w-full flex justify-center space-x-1.5">
            {displayDiseases.map((disease, index) => (
              <div 
                key={index} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                  ? `w-5 ${getRiskStyle(disease.risk).bg}` 
                  : 'w-1.5 bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseRiskDetail;
