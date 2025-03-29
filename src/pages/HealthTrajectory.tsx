import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import { Heart, TrendingDown, ArrowDown, ArrowUp } from 'lucide-react';
import * as d3 from 'd3';
import ProgressIndicator from '../components/ProgressIndicator';

// 疾病数据与初始体重状态下的风险率
const initialDiseaseData = [
  { id: 1, name: "二型糖尿病", initialRisk: 0.73, currentRisk: 0.73, category: "代谢疾病", sensitivity: 0.08 },
  { id: 2, name: "高血压", initialRisk: 0.61, currentRisk: 0.61, category: "心血管疾病", sensitivity: 0.06 },
  { id: 3, name: "肾结石", initialRisk: 0.55, currentRisk: 0.55, category: "泌尿系统疾病", sensitivity: 0.04 },
  { id: 4, name: "高血糖", initialRisk: 0.43, currentRisk: 0.43, category: "代谢疾病", sensitivity: 0.07 },
  { id: 5, name: "肠易激综合征", initialRisk: 0.31, currentRisk: 0.31, category: "消化系统疾病", sensitivity: 0.02 },
  { id: 6, name: "浅表性胃炎", initialRisk: 0.28, currentRisk: 0.28, category: "消化系统疾病", sensitivity: 0.03 },
  { id: 7, name: "偏头痛", initialRisk: 0.16, currentRisk: 0.16, category: "神经系统疾病", sensitivity: 0.015 },
  { id: 8, name: "前列腺炎", initialRisk: 0.11, currentRisk: 0.11, category: "泌尿系统疾病", sensitivity: 0.01 },
  { id: 9, name: "胆囊炎", initialRisk: 0.04, currentRisk: 0.04, category: "消化系统疾病", sensitivity: 0.005 },
  { id: 10, name: "肝硬化", initialRisk: 0.02, currentRisk: 0.02, category: "消化系统疾病", sensitivity: 0.002 },
];

// 健康故事和成功案例
const healthStories = [
  "张女士减重10kg后，她的二型糖尿病指标显著改善，不再需要每日药物治疗。",
  "李先生通过6个月的健康饮食和适量运动，减重15kg，高血压完全恢复正常，重获健康生活。",
  "王先生减重后，他的睡眠呼吸暂停症状完全消失，睡眠质量大幅提升，精力充沛。",
  "刘女士坚持健康生活方式一年，减重12kg，不仅血糖指标恢复正常，关节疼痛也明显减轻。",
  "赵先生减重8kg后，他的胆固醇水平下降30%，医生表示他的心脏病风险大幅降低。"
];

const HealthTrajectory: React.FC = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentWeight, setCurrentWeight] = useState(80); // 假设初始体重
  const [initialWeight] = useState(80);
  const [diseaseData, setDiseaseData] = useState([...initialDiseaseData]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showStory, setShowStory] = useState(false);
  const height = 300;

  // 更新疾病风险
  useEffect(() => {
    const weightReduction = initialWeight - currentWeight;
    const updatedData = diseaseData.map(disease => {
      // 根据减重幅度和疾病敏感度计算新的风险率
      const riskReduction = weightReduction * disease.sensitivity;
      const newRisk = Math.max(disease.initialRisk - riskReduction, 0.01); // 保证风险不小于0.01%
      return { ...disease, currentRisk: parseFloat(newRisk.toFixed(2)) };
    });
    
    setDiseaseData(updatedData);
    
    // 如果减重超过5kg，显示健康故事
    if (weightReduction >= 5 && !showStory) {
      setShowStory(true);
      // 每15秒更换一个故事
      const storyTimer = setInterval(() => {
        setStoryIndex(prev => (prev + 1) % healthStories.length);
      }, 15000);
      
      return () => clearInterval(storyTimer);
    }
  }, [currentWeight, initialWeight, showStory]);

  // 渲染风险变化图表
  useEffect(() => {
    if (!svgRef.current) return;

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 创建比例尺
    const x = d3.scaleBand()
      .domain(diseaseData.map(d => d.name))
      .range([0, chartWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, Math.max(...diseaseData.map(d => d.initialRisk)) * 1.1])
      .range([chartHeight, 0]);

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 添加X轴
    chart.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("font-size", "8px");

    // 添加Y轴
    chart.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toFixed(2) + "%"));

    // 定义疾病类别的颜色
    const colorScale = d3.scaleOrdinal<string>()
      .domain(["代谢疾病", "心血管疾病", "泌尿系统疾病", "消化系统疾病", "神经系统疾病"])
      .range(["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA500", "#9370DB"]);

    // 初始风险柱状图
    chart.selectAll(".bar-initial")
      .data(diseaseData)
      .enter()
      .append("rect")
      .attr("class", "bar-initial")
      .attr("x", d => x(d.name)!)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.initialRisk))
      .attr("height", d => chartHeight - y(d.initialRisk))
      .attr("fill", d => colorScale(d.category))
      .attr("opacity", 0.3);

    // 当前风险柱状图
    chart.selectAll(".bar-current")
      .data(diseaseData)
      .enter()
      .append("rect")
      .attr("class", "bar-current")
      .attr("x", d => x(d.name)!)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.currentRisk))
      .attr("height", d => chartHeight - y(d.currentRisk))
      .attr("fill", d => colorScale(d.category))
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-width", 0.5);

    // 添加图例
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, 10)`);

    legend.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#888")
      .attr("opacity", 0.3);

    legend.append("text")
      .attr("x", 15)
      .attr("y", 9)
      .text("初始风险")
      .attr("font-size", "8px")
      .attr("fill", "white");

    legend.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#888")
      .attr("opacity", 0.8)
      .attr("y", 15);

    legend.append("text")
      .attr("x", 15)
      .attr("y", 24)
      .text("当前风险")
      .attr("font-size", "8px")
      .attr("fill", "white");

  }, [diseaseData]);

  const handleWeightChange = (change: number) => {
    // 限制体重范围在初始体重的50%到初始体重
    const newWeight = Math.max(Math.min(currentWeight + change, initialWeight), initialWeight * 0.5);
    setCurrentWeight(newWeight);
  };

  const handleStartJourney = () => {
    navigate('/home');
  };

  // 计算总风险降低百分比
  const calculateTotalRiskReduction = () => {
    let initialTotal = 0;
    let currentTotal = 0;
    
    diseaseData.forEach(disease => {
      initialTotal += disease.initialRisk;
      currentTotal += disease.currentRisk;
    });
    
    if (initialTotal === 0) return 0;
    
    const reductionPercent = ((initialTotal - currentTotal) / initialTotal) * 100;
    return reductionPercent.toFixed(2);
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-16 px-4 flex justify-between items-center">
        <BackButton />
        <h1 className="text-center text-xl font-medium">健康轨迹模拟</h1>
        <div className="w-8"></div>
      </div>
      <ProgressIndicator currentStep={7} totalSteps={7} />
      <div className="mx-4 mt-2 bg-gradient-to-b from-gray-900 to-black rounded-3xl p-6 shadow-lg border border-gray-800">
        <h2 className="text-xl font-bold mb-4 text-center text-white flex items-center justify-center">
          <TrendingDown className="text-green-500 mr-2" />
          体重对疾病风险的影响
        </h2>
        
        {/* 体重调节器 */}
        <div className="w-full mb-5 bg-gray-800 rounded-xl p-4 flex flex-col items-center">
          <p className="text-gray-300 text-sm mb-2">调整体重查看疾病风险变化</p>
          
          <div className="flex items-center justify-between w-full">
            <button 
              className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center"
              onClick={() => handleWeightChange(1)}
            >
              <ArrowUp size={20} />
            </button>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{currentWeight} kg</div>
              <div className="text-sm text-gray-400">
                {currentWeight < initialWeight 
                  ? `减重 ${(initialWeight - currentWeight).toFixed(1)} kg` 
                  : '初始体重'}
              </div>
            </div>
            
            <button 
              className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center"
              onClick={() => handleWeightChange(-1)}
            >
              <ArrowDown size={20} />
            </button>
          </div>
          
          <div className="mt-4 w-full bg-gray-700 h-1 rounded-full">
            <div 
              className="bg-gradient-to-r from-red-500 to-green-500 h-1 rounded-full"
              style={{ width: `${100 - ((currentWeight - initialWeight * 0.5) / (initialWeight * 0.5)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* 风险降低统计 */}
        {currentWeight < initialWeight && (
          <div className="w-full mb-4 bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <p className="text-white font-medium">总体疾病风险降低：</p>
              <p className="text-2xl font-bold text-green-400">{calculateTotalRiskReduction()}%</p>
            </div>
          </div>
        )}
        
        {/* 疾病风险变化图表 */}
        <div className="w-full mb-4 overflow-hidden bg-gray-900 rounded-xl">
          <svg 
            ref={svgRef} 
            width="100%" 
            height={height} 
            className="touch-none"
          />
        </div>
      </div>
      
      {/* 健康故事 */}
      {showStory && (
        <div className="mx-4 mt-4 bg-indigo-900 rounded-3xl p-5 shadow-lg animate-scale-in">
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Heart className="text-white" size={16} />
            </div>
            <div className="ml-3">
              <h3 className="text-md font-semibold text-white">真实案例</h3>
              <p className="text-gray-200 text-sm mt-1">{healthStories[storyIndex]}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 引导按钮 */}
      <button
        onClick={handleStartJourney}
        className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-full font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
      >
        开启健康之旅吧！
      </button>
    </div>
  );
};

export default HealthTrajectory;
