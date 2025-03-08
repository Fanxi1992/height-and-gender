
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { Heart, ArrowRight } from 'lucide-react';
import * as d3 from 'd3';

const DiseaseData = [
  { id: 1, name: "二型糖尿病", risk: 0.73, category: "代谢疾病", x: 0, y: 0 },
  { id: 2, name: "高血压", risk: 0.61, category: "心血管疾病", x: 0, y: 0 },
  { id: 3, name: "肾结石", risk: 0.55, category: "泌尿系统疾病", x: 0, y: 0 },
  { id: 4, name: "高血糖", risk: 0.43, category: "代谢疾病", x: 0, y: 0 },
  { id: 5, name: "肠易激综合征", risk: 0.31, category: "消化系统疾病", x: 0, y: 0 },
  { id: 6, name: "浅表性胃炎", risk: 0.28, category: "消化系统疾病", x: 0, y: 0 },
  { id: 7, name: "偏头痛", risk: 0.16, category: "神经系统疾病", x: 0, y: 0 },
  { id: 8, name: "前列腺炎", risk: 0.11, category: "泌尿系统疾病", x: 0, y: 0 },
  { id: 9, name: "胆囊炎", risk: 0.04, category: "消化系统疾病", x: 0, y: 0 },
  { id: 10, name: "肝硬化", risk: 0.02, category: "消化系统疾病", x: 0, y: 0 },
];

// 定义网络连接
const DiseaseLinks = [
  { source: 0, target: 3, strength: 0.9 }, // 二型糖尿病 - 高血糖
  { source: 0, target: 1, strength: 0.7 }, // 二型糖尿病 - 高血压
  { source: 1, target: 3, strength: 0.6 }, // 高血压 - 高血糖
  { source: 1, target: 9, strength: 0.4 }, // 高血压 - 肝硬化
  { source: 2, target: 7, strength: 0.3 }, // 肾结石 - 前列腺炎
  { source: 4, target: 5, strength: 0.5 }, // 肠易激综合征 - 浅表性胃炎
  { source: 5, target: 8, strength: 0.2 }, // 浅表性胃炎 - 胆囊炎
  { source: 6, target: 0, strength: 0.2 }, // 偏头痛 - 二型糖尿病
  { source: 8, target: 9, strength: 0.5 }, // 胆囊炎 - 肝硬化
  { source: 4, target: 8, strength: 0.3 }, // 肠易激综合征 - 胆囊炎
  { source: 0, target: 7, strength: 0.1 }, // 二型糖尿病 - 前列腺炎
  { source: 3, target: 6, strength: 0.2 }, // 高血糖 - 偏头痛
];

const RiskReport: React.FC = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const height = 320;

  useEffect(() => {
    if (!svgRef.current) return;

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;

    // 创建力导向图
    const simulation = d3.forceSimulation(DiseaseData)
      .force("link", d3.forceLink(DiseaseLinks).id(d => (d as any).id - 1).distance(d => 100 - (d as any).strength * 50))
      .force("charge", d3.forceManyBody().strength(-80))
      .force("center", d3.forceCenter(width / 2, height / 2.5))
      .force("collide", d3.forceCollide().radius(d => Math.sqrt((d as any).risk * 100) + 15));

    // 定义疾病类别的颜色
    const colorScale = d3.scaleOrdinal<string>()
      .domain(["代谢疾病", "心血管疾病", "泌尿系统疾病", "消化系统疾病", "神经系统疾病"])
      .range(["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA500", "#9370DB"]);

    // 绘制连接线
    const links = svg.append("g")
      .selectAll("line")
      .data(DiseaseLinks)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-opacity", d => (d as any).strength)
      .attr("stroke-width", d => (d as any).strength * 2);

    // 创建节点组
    const nodes = svg.append("g")
      .selectAll("g")
      .data(DiseaseData)
      .enter()
      .append("g")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // 添加圆圈
    nodes.append("circle")
      .attr("r", d => Math.sqrt(d.risk * 100) + 10)
      .attr("fill", d => colorScale(d.category))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.8);

    // 添加疾病名称
    nodes.append("text")
      .text(d => d.name)
      .attr("font-size", "8px")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("dy", "0.3em");

    // 动画效果
    simulation.nodes(DiseaseData).on("tick", () => {
      links
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      nodes.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // 拖拽函数
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // 添加缩放功能
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        svg.selectAll("g").attr("transform", event.transform);
      });

    svg.call(zoom);

    // 添加周期性的动画以保持图形活跃
    setInterval(() => {
      simulation.alpha(0.3).restart();
    }, 3000);

  }, []);

  const handleExploreHealthTrajectory = () => {
    navigate('/health-trajectory');
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-4 px-4 flex justify-between items-center">
        <BackButton />
        <h1 className="text-lg font-medium text-white">建立疾病风险报告</h1>
        <div className="w-8"></div> {/* 占位，使标题居中 */}
      </div>
      
      <ProgressIndicator currentStep={7} totalSteps={7} />
      
      <div className="mx-4 mt-2 bg-gradient-to-b from-gray-900 to-black rounded-3xl p-6 shadow-lg border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-center text-white flex items-center justify-center">
          <Heart className="text-red-500 mr-2" />
          潜在疾病风险网络
        </h2>
        
        {/* 疾病网络可视化 */}
        <div className="w-full mb-4 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl">
          <svg 
            ref={svgRef} 
            width="100%" 
            height={height} 
            className="touch-none"
          />
        </div>
        
        {/* 疾病风险排名 */}
        <div className="w-full mt-4">
          <h3 className="text-lg font-semibold mb-2 text-white">疾病风险排名</h3>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="grid grid-cols-12 text-sm font-medium text-white mb-2">
              <div className="col-span-1">排名</div>
              <div className="col-span-9">疾病名称</div>
              <div className="col-span-2 text-right">风险</div>
            </div>

            {DiseaseData.map((disease, index) => (
              <div 
                key={disease.id} 
                className={`grid grid-cols-12 text-sm py-2 ${index % 2 === 0 ? 'bg-gray-700/40' : 'bg-gray-800/40'} rounded-lg mb-1 items-center`}
              >
                <div className="col-span-1 font-bold text-white">{index + 1}</div>
                <div className="col-span-9 text-gray-200">{disease.name}</div>
                <div className="col-span-2 text-right font-mono text-yellow-400">{disease.risk}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 健康评估与引导 */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-5 shadow-lg">
        <h3 className="text-lg font-semibold mb-2 text-white">健康状况评估</h3>
        <p className="text-gray-200 text-sm mb-4">
          基于您的体重指数(BMI)分析，您当前处于<span className="text-yellow-300 font-bold">超重</span>状态，这显著增加了您患上代谢性疾病和心血管疾病的风险。
        </p>
        <p className="text-gray-200 text-sm">
          研究表明，减轻5-10%的体重可以显著降低二型糖尿病和高血压等慢性疾病的发生风险。
        </p>
      </div>
      
      {/* 引导按钮 */}
      <div className="mx-4 mt-4 bg-gradient-to-b from-indigo-900 to-indigo-950 rounded-3xl p-5 shadow-lg cursor-pointer" onClick={handleExploreHealthTrajectory}>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="text-white" size={20} />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-white">探索减重效果</h3>
            <p className="text-gray-300 text-sm">
              了解减轻体重将如何降低您的疾病风险，提升健康状况
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskReport;
