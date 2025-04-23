import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useUserStore from '../stores/userStore';

const HealthRiskReport: React.FC = () => {
  const navigate = useNavigate();
  const { riskReportData } = useUserStore();
  const [dragPosition, setDragPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const maxDrag = 200; // Maximum drag distance to trigger navigation
  
  // 新增：根据风险类别获取颜色
  const getRiskCategoryColor = (risk: number): string => {
    if (risk > 0.5) {
      return '#ef4444'; // 高风险 - 红色
    }
    if (risk >= 0.1) {
      return '#eab308'; // 中风险 - 黄色
    }
    return '#22c55e'; // 低风险 - 绿色
  };

  // 从 Store 处理和准备扇形图数据
  const chartData = useMemo(() => {
    if (!riskReportData || riskReportData.length === 0) {
      return [];
    }
    // 1. 过滤掉 risk === 1 (既有疾病)
    const filteredData = riskReportData.filter(d => d.risk !== 1);

    // 2. 如果过滤后没有数据，则返回空数组
    if (filteredData.length === 0) {
        return [];
    }

    // 3. 按风险降序排序 (虽然store里已排序，再次确认)
    const sortedFilteredData = [...filteredData].sort((a, b) => b.risk - a.risk);

    // 4. 取前 10 个
    const topData = sortedFilteredData.slice(0, 10);

    // 5. 映射为 Recharts 需要的格式，并使用基于风险类别的颜色
    return topData.map((d, index) => ({
      name: d.name, // 原始疾病名称
      value: parseFloat((d.risk * 100).toFixed(1)), // 将 risk 转换为百分比并保留一位小数，作为扇区大小依据
      risk: d.risk, // 保留原始 risk 值用于 Tooltip
      color: getRiskCategoryColor(d.risk) // 使用基于风险类别的颜色
    }));
  }, [riskReportData]);

  // 计算风险摘要
  const highRiskCount = useMemo(() => {
    if (!riskReportData) return 0;
    // 定义高风险阈值（> 50%），并排除既有疾病
    return riskReportData.filter(d => d.risk > 0.5 && d.risk !== 1).length;
  }, [riskReportData]);

  const mediumRiskCount = useMemo(() => {
    if (!riskReportData) return 0;
    // 定义中风险阈值（10% <= risk <= 50%），并排除既有疾病
    return riskReportData.filter(d => d.risk >= 0.1 && d.risk <= 0.5 && d.risk !== 1).length;
  }, [riskReportData]);

  const lowRiskCount = useMemo(() => {
    if (!riskReportData) return 0;
    // 定义低风险阈值（< 10%），并排除既有疾病
    return riskReportData.filter(d => d.risk < 0.1 && d.risk !== 1).length;
  }, [riskReportData]);

  const handleBack = () => {
    navigate(-1);
  };
  
  // 导航函数
  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Touch event handlers for the swipe button
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // 阻止默认触摸行为
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // 阻止默认触摸行为
    if (!isDragging) return;
    
    const touchX = e.touches[0].clientX;
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    
    if (buttonRect) {
      const buttonStartX = buttonRect.left;
      const dragX = Math.min(Math.max(0, touchX - buttonStartX - 50), maxDrag);
      setDragPosition(dragX);
    }
  };

  const handleTouchEnd = () => {
    if (dragPosition > maxDrag * 0.7) {
      // 如果拖动超过70%，导航到详细报告
      // navigate('/disease-risk-detail'); // 保持原样，或者根据实际情况修改
      console.log("Navigate to detail (mock)"); // 暂时打印日志
      navigate('/disease-risk-detail'); // 添加实际跳转逻辑
      setDragPosition(0); // 重置位置
    } else {
      // Reset position
      setDragPosition(0);
    }
    setIsDragging(false);
  };

  // 自定义提示框组件
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // 获取扇区数据
      return (
        <div className="bg-gray-800/80 backdrop-blur-sm p-2 rounded-md shadow-lg border border-gray-600">
          <p className="text-white font-medium text-sm">{`${data.name}`}</p>
          <p className="text-yellow-400 text-xs">{`风险: ${data.value}%`}</p> // 显示百分比风险值
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col">
      <StatusBar />
      
      {/* Header - 增加了上方间距 */}
      <div className="w-full flex items-center justify-center relative py-4 mt-8 flex-shrink-0">
        <button 
          className="absolute left-4 p-2" 
          onClick={handleBack}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-medium">{`Top ${chartData.length} 风险疾病概览`}</h1>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col items-center px-4">
        {/* 扇形图区域 - 增大高度 */}
        <div className="w-full max-w-lg h-96 mt-6 text-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="95%"
                  innerRadius="35%"
                  paddingAngle={1}
                  dataKey="value"
                  nameKey="name"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    index
                  }) => {
                    if (percent < 0.03) {
                      return null;
                    }

                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    const sliceColor = chartData[index].color;
                    let textColor = '#FFFFFF';
                    try {
                      const r = parseInt(sliceColor.substring(1, 3), 16);
                      const g = parseInt(sliceColor.substring(3, 5), 16);
                      const b = parseInt(sliceColor.substring(5, 7), 16);
                      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                      if (brightness > 150) {
                          textColor = '#333333';
                      }
                    } catch (e) {
                      console.error("Error calculating text color from slice color:", sliceColor, e);
                    }

                    const name = chartData[index].name;
                    const shortName = name.length > 3 ? `${name.substring(0, 3)}.` : name;
                    const percentage = (percent * 100).toFixed(0);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={textColor}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight="500"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        {`${shortName} ${percentage}%`}
                      </text>
                    );
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>暂无风险预测数据可供显示。</p>
            </div>
          )}
        </div>

        {/* 检测文本和风险摘要 */}
        {chartData.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-lg">系统已为您生成健康风险报告</p>
            {/* Risk Summary Badges */}
            <div className="flex justify-center space-x-2 mt-4">
              {highRiskCount > 0 && <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-medium shadow">高风险 {highRiskCount}项</span>}
              {mediumRiskCount > 0 && <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-medium shadow">中风险 {mediumRiskCount}项</span>}
              {lowRiskCount > 0 && <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-medium shadow">低风险 {lowRiskCount}项</span>}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      {chartData.length > 0 && (
        <div className="w-full px-5 mt-auto pt-6 mb-10 flex-shrink-0">
          <div
            ref={buttonRef}
            className={`w-full py-4 bg-blue-600 rounded-full flex items-center relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} shadow-lg`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ transition: 'box-shadow 0.2s ease', touchAction: 'none' }}
          >
            <div
              className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center transition-all duration-150 ease-out"
              style={{
                left: `${dragPosition}px`,
                marginLeft: '4px',
                transform: dragPosition > maxDrag * 0.7 ? 'scale(1.1)' : 'scale(1)',
                boxShadow: '0 0 12px rgba(255,255,255,0.7)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <div
              className="flex-grow text-center text-white text-lg font-medium transition-opacity duration-150"
              style={{ opacity: Math.max(0, 1 - dragPosition / (maxDrag * 0.8)) }}
            >
              右滑查看详细建议
            </div>
            {dragPosition > maxDrag * 0.7 && (
              <div className="absolute right-6 text-white font-semibold animate-pulse">
                松开查看
              </div>
            )}
            {/* Progress indicator */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-white opacity-60 transition-all duration-150 ease-out"
              style={{ width: `${(dragPosition / maxDrag) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRiskReport;
