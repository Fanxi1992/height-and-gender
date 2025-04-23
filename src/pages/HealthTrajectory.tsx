import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import { Minus, Plus, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import * as d3 from 'd3';
import ProgressIndicator from '../components/ProgressIndicator';
import useUserStore from '../stores/userStore';

// 定义组件内部使用的疾病数据结构
interface DiseaseDataType {
  id: number | string;
  name: string;
  initialRisk: number;
  currentRisk: number; // 在此阶段，它将与 initialRisk 相同
  category: string;
  sensitivity: number; // 暂时设为 0
  ageSensitivity: number; // 暂时设为 0
}

// D3 图表的边距和高度配置
const chartHeightConfig = {
  containerHeight: 350, // 容器总高度
  margin: { top: 25, right: 10, bottom: 90, left: 40 }
};

const HealthTrajectory: React.FC = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);

  // 从 Zustand 获取数据（只获取一次，避免 rerender 时频繁访问 store）
  const storeData = useMemo(() => {
    return {
      riskReportData: useUserStore.getState().riskReportData || [],
      baseInfos: useUserStore.getState().getBaseInfos() || {}
    };
  }, []);

  // 使用 useState 管理处理后的数据
  const [diseaseData, setDiseaseData] = useState<DiseaseDataType[]>(() => {
    // 直接在 state 初始化函数中处理数据，避免在 useEffect 中处理
    const { riskReportData } = storeData;
    
    if (riskReportData && riskReportData.length > 0) {
      // 1. 过滤掉风险为 1 (既有疾病) 的数据
      const filteredData = riskReportData.filter(d => d.risk < 1);
      
      // 2. 取 Top 10
      const topDiseases = filteredData.slice(0, 10);
      
      // 3. 转换为内部数据结构 DiseaseDataType
      return topDiseases.map(d => ({
        id: d.id || d.index || d.name,
        name: d.name.replace('（既有疾病）', '').trim(),
        initialRisk: d.risk,
        currentRisk: d.risk,
        category: d.category || '未知分类',
        sensitivity: 0,
        ageSensitivity: 0,
      }));
    }
    return []; // 如果没有数据，返回空数组
  });

  // 使用 useMemo 从初始化的 storeData 中提取数据
  const initialWeight = useMemo(() => {
    const weightStr = storeData.baseInfos["体重(102)"];
    return weightStr ? parseFloat(String(weightStr)) : 70;
  }, [storeData.baseInfos]);
  
  const initialAge = useMemo(() => {
    const ageStr = storeData.baseInfos["年龄"];
    return ageStr ? parseInt(String(ageStr), 10) : 30;
  }, [storeData.baseInfos]);

  // 新增：计算初始 BMI 及分类
  const bmiInfo = useMemo(() => {
    const heightCmStr = storeData.baseInfos["身高(101)"];
    const heightCm = heightCmStr ? parseFloat(String(heightCmStr)) : null;

    if (!heightCm || heightCm <= 0 || !initialWeight || initialWeight <= 0) {
      return null; // 身高或体重无效，无法计算 BMI
    }

    const heightM = heightCm / 100;
    const bmi = initialWeight / (heightM * heightM);

    let category: string;
    let advice: string;
    let colorClass: string;

    if (bmi < 18.5) {
      category = "体重过轻 (偏瘦)";
      advice = "您的体重可能偏低，建议增加营养摄入，进行适度增肌运动，保持健康体重。";
      colorClass = "text-blue-400";
    } else if (bmi >= 18.5 && bmi < 24) {
      category = "正常范围";
      advice = "恭喜！您的体重在健康范围内，请继续保持均衡饮食和规律运动。";
      colorClass = "text-green-400";
    } else if (bmi >= 24 && bmi < 28) {
      category = "超重 (偏胖)";
      advice = "您的体重已进入超重范围，建议调整饮食结构，控制总热量摄入，并增加有氧运动。";
      colorClass = "text-yellow-400";
    } else { // bmi >= 28
      category = "肥胖";
      advice = "您的体重已属肥胖，是多种慢性病的高风险因素。强烈建议寻求专业指导，制定科学减重计划。";
      colorClass = "text-red-400";
    }

    return {
      value: bmi.toFixed(1),
      category,
      advice,
      colorClass
    };
  }, [initialWeight, storeData.baseInfos]);

  // 新增：体重变化状态和新风险状态
  const [weightChange, setWeightChange] = useState(0); // 体重变化（kg）
  const [newDiseaseRisk, setNewDiseaseRisk] = useState<{ [key: string]: number } | null>(null); // 新风险
  const [loading, setLoading] = useState(false); // 是否正在请求
  const [popupMessage, setPopupMessage] = useState<string | null>(null); // 新增：科普弹窗消息状态

  // 定义科普消息
  const weightLossMessages = [
    "真实案例：李先生通过坚持运动和健康饮食，成功减重2公斤，不仅血糖指标得到改善，精神状态也焕然一新！", // -2kg
    "科学研究：体重降低4公斤，可以显著降低患高血压的风险约20%，减轻心脏负担。", // -4kg
    "健康益处：减重6公斤有助于改善睡眠呼吸暂停综合征，提高夜间睡眠质量。", // -6kg
    "生活改变：王女士减重8公斤后，膝关节疼痛明显缓解，重新享受户外活动的乐趣。", // -8kg
    "长期效果：持续减重10公斤，不仅能大幅降低多种慢性病风险，更能提升自信心和生活品质！", // -10kg
  ];

  const weightGainMessages = [
    "健康警示：体重增加2公斤可能导致身体脂肪比例升高，增加患代谢综合征的初期风险。", // +2kg
    "风险提示：体重增加4公斤会加重心脏负担，增加患心血管疾病的可能性。", // +4kg
    "研究表明：体重增加6公斤与患2型糖尿病的风险显著相关，需警惕血糖变化。", // +6kg
    "关注健康：体重增加8公斤可能导致关节压力增大，增加患骨关节炎的风险，尤其是膝关节。", // +8kg
    "重要警告：体重增加10公斤将大幅提升多种癌症（如结直肠癌、乳腺癌）的风险，请务必关注体重管理。", // +10kg
  ];

  // 体重调节按钮处理
  const handleWeightChange = (delta: number) => {
    const newChange = Math.max(-10, Math.min(10, weightChange + delta));
    setWeightChange(newChange);
  };

  // 计算当前体重
  const currentWeight = initialWeight + weightChange;

  // 构造 predict_dict（疾病名: 风险值）
  const predictDict = useMemo(() => {
    const dict: { [key: string]: number } = {};
    diseaseData.forEach(d => {
      dict[d.name] = d.initialRisk;
    });
    return dict;
  }, [diseaseData]);

  // 体重变化时请求后端
  useEffect(() => {
    if (weightChange === 0 || diseaseData.length === 0) {
      setNewDiseaseRisk(null);
      setLoading(false);
      return;
    }
    setLoading(true); // 开始loading
    const payload = {
      年龄: initialAge,
      性别: storeData.baseInfos["性别"],
      身高: storeData.baseInfos["身高(101)"],
      体重: currentWeight,
      吸烟史等级: storeData.baseInfos["吸烟史等级"],
      饮酒史等级: storeData.baseInfos["饮酒史等级"],
      运动习惯等级: storeData.baseInfos["运动习惯等级"],
      疾病历史: useUserStore.getState().getDiseaseInput() || [],
      weight_change: weightChange,
      predict_dict: predictDict,
    };
    fetch('/api/v1/health/predict_weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(response => { // 先检查原始响应状态
        console.log('原始响应状态:', response.status, response.statusText);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // 再尝试解析JSON
      })
      .then(res => {
        console.log('解析后的响应:', res); // <--- 打印完整的响应体
        // 检查条件，注意code可能为200或其他成功码
        if ((res.code === 0 || res.code === 200) && res.data && res.data.predict_dict_change) {
          console.log('体重变更预测结果', res.data.predict_dict_change); // 目标打印语句
          setNewDiseaseRisk(res.data.predict_dict_change);
        } else {
          // 如果条件不满足，打印原因
          console.error('条件检查失败:', {
              code: res.code,
              hasData: !!res.data,
              hasPredictDict: !!(res.data && res.data.predict_dict_change)
          });
          setNewDiseaseRisk(null);
        }
        setLoading(false); // 结束loading
      })
      .catch((err) => { // 捕获 fetch 或 .json() 的错误
        console.error('Fetch 或 JSON 解析失败:', err);
        setNewDiseaseRisk(null);
        setLoading(false); // 结束loading
      });
  }, [weightChange, currentWeight, initialAge, storeData.baseInfos, predictDict, diseaseData]);

  // 使用组件级常量计算图表的实际绘制高度
  const calculatedChartHeight = chartHeightConfig.containerHeight - chartHeightConfig.margin.top - chartHeightConfig.margin.bottom;
  
  // 新增 Effect Hook: 根据体重变化更新科普消息
  useEffect(() => {
    const absChange = Math.abs(weightChange);
    const index = Math.floor((absChange - 1) / 2); // 计算消息索引 (每2kg一个)

    if (weightChange < 0 && index >= 0 && index < weightLossMessages.length) {
      setPopupMessage(weightLossMessages[index]);
    } else if (weightChange > 0 && index >= 0 && index < weightGainMessages.length) {
      setPopupMessage(weightGainMessages[index]);
    } else {
      setPopupMessage(null); // 其他情况清除消息
    }
  }, [weightChange]); // 仅依赖体重变化

  // Effect Hook: 渲染风险变化图表 (现在只显示初始风险)
  useEffect(() => {
    if (!svgRef.current || diseaseData.length === 0) {
       // 如果没有引用或没有数据，则清除 SVG 内容并返回
       if (svgRef.current) {
           d3.select(svgRef.current).selectAll("*").remove();
       }
       return;
    }

    console.log("Rendering D3 chart with data:", diseaseData);

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const container = svgRef.current.parentElement;
    const width = container ? container.clientWidth : 300;
    // 使用常量中的配置
    const { margin, containerHeight } = chartHeightConfig;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = containerHeight - margin.top - margin.bottom; // 使用常量计算

    // 比例尺 (保持不变)
    const x = d3.scaleBand<string>()
      .domain(diseaseData.map(d => d.name))
      .range([0, chartWidth])
      .padding(0.3);

    // 动态调整 Y 轴域 (保持不变)
    const maxRisk = Math.max(...diseaseData.map(d => d.initialRisk), ...(newDiseaseRisk ? Object.values(newDiseaseRisk) : []), 0.01);
    const y = d3.scaleLinear()
      .domain([0, maxRisk * 1.1])
      .range([chartHeight, 0]);

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 绘制 X 轴 (保持不变)
    chart.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-size", "11px")
        .attr("fill", "#ccc")
        .style("max-width", `${x.bandwidth() * 2}px`)
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis")
        .style("white-space", "nowrap");

    // 绘制 Y 轴 (保持不变)
    chart.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(1)}%`))
      .selectAll("text")
        .attr("font-size", "10px")
        .attr("fill", "#ccc");
        
    // --- 新增：基于风险的颜色比例尺 --- 
    // 使用从绿色 (低风险) 到黄色 (中风险) 再到红色 (高风险) 的插值
    // 设定风险值的预期范围，例如 0 到 maxRisk (或者一个固定的最大值，如 0.5，如果 maxRisk 很小)
    const riskColorScale = d3.scaleSequential(d3.interpolateRgbBasis(["#34d399", "#facc15", "#f87171"]))
        .domain([0, Math.max(maxRisk, 0.1)]); // 确保 domain 不会太小，最低为 0.1
  
    // 1. 渲染原始风险（影子）(保持不变)
    chart.selectAll(".bar-initial-shadow")
      .data(diseaseData)
      .enter()
      .append("rect")
      .attr("class", "bar-initial-shadow")
      .attr("x", d => x(d.name)!)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.initialRisk))
      .attr("height", d => chartHeight - y(d.initialRisk))
      // 影子使用稍微暗淡的风险颜色
      .attr("fill", d => riskColorScale(d.initialRisk))
      .attr("opacity", 0.25);
  
    // 2. 渲染新风险或原始风险 (柱状图主体)
    const riskBars = chart.selectAll(".bar-current")
      .data(diseaseData)
      .enter()
      .append("rect")
      .attr("class", newDiseaseRisk ? "bar-new" : "bar-initial") // 根据是否有新风险决定类名
      .attr("x", d => x(d.name)!)
      .attr("width", x.bandwidth())
      .attr("y", d => y(newDiseaseRisk ? (newDiseaseRisk[d.name] ?? d.initialRisk) : d.initialRisk))
      .attr("height", d => chartHeight - y(newDiseaseRisk ? (newDiseaseRisk[d.name] ?? d.initialRisk) : d.initialRisk))
      // 主柱体使用风险颜色
      .attr("fill", d => riskColorScale(newDiseaseRisk ? (newDiseaseRisk[d.name] ?? d.initialRisk) : d.initialRisk))
      .attr("opacity", 0.8);

    // 3. --- 新增：渲染风险变化百分比文本 ---
    if (newDiseaseRisk) { // 只在有新风险时显示百分比
      chart.selectAll(".percentage-change-text")
        .data(diseaseData)
        .enter()
        .append("text")
        .attr("class", "percentage-change-text")
        .attr("x", d => x(d.name)! + x.bandwidth() / 2) // 水平居中于柱子
        .attr("y", d => {
          const currentY = y(newDiseaseRisk[d.name] ?? d.initialRisk);
          // 将文本放在柱子上方一点点，但不要超出图表顶部
          return Math.max(currentY - 5, 0);
        })
        .attr("text-anchor", "middle") // 水平居中对齐
        .attr("font-size", "10px")
        .attr("fill", d => { // 根据变化正负决定颜色
            const initial = d.initialRisk;
            const current = newDiseaseRisk[d.name] ?? initial;
            if (current > initial) return "#f87171"; // 红色表示增加
            if (current < initial) return "#34d399"; // 绿色表示减少
            return "#9ca3af"; // 灰色表示不变
        })
        .text(d => {
            const initial = d.initialRisk;
            const current = newDiseaseRisk[d.name] ?? initial; // 使用新风险，若无则用初始风险

            if (initial === current) {
                return "0%"; // 无变化
            } else if (initial === 0) {
                // 初始为0，显示当前值
                return `→${(current * 100).toFixed(0)}%`;
            } else {
                const percentageChange = ((current - initial) / initial) * 100;
                const sign = percentageChange > 0 ? "+" : "";
                return `${sign}${percentageChange.toFixed(0)}%`; // 带符号的百分比，保留整数
            }
        });
    }
  }, [diseaseData, newDiseaseRisk]); // 移除 height 依赖，因为它现在是常量的一部分

  const handleStartJourney = () => {
    // 可以根据需要修改导航目标，暂时保持不变
    navigate('/home');
  };

  return (
    <div className="page-container bg-black text-white flex flex-col min-h-screen">
      <StatusBar />
      
      <div className="mt-10 px-4 flex justify-between items-center flex-shrink-0">
        <BackButton />
        <div className="w-8"></div>
      </div>
      <h1 className="text-center text-xl font-bold mt-4 mb-2 text-white">体重如何影响健康风险</h1>
      <ProgressIndicator currentStep={7} totalSteps={7} />

      <div className="flex items-center justify-center my-4">
        <button
          className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          onClick={() => handleWeightChange(-1)}
          disabled={weightChange <= -10 || loading}
        >
          <Minus size={24} />
        </button>
        <span className="mx-4 text-lg font-bold">
          {weightChange === 0
            ? '真实体重：'
            : weightChange < 0
            ? '体重减少：'
            : '体重增加：'}{currentWeight.toFixed(1)} kg
        </span>
        <button
          className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          onClick={() => handleWeightChange(1)}
          disabled={weightChange >= 10 || loading}
        >
          <Plus size={24} />
        </button>
      </div>
      <div className="flex-grow flex flex-col mt-4 px-4 pb-6">
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl px-4 pt-2 pb-4 shadow-lg border border-gray-800 flex-grow flex flex-col">
          <div className="w-full flex-grow overflow-hidden bg-gray-900 rounded-xl relative" style={{ minHeight: `${calculatedChartHeight + 20}px` }}>
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
                <span className="animate-spin text-3xl text-blue-400">⏳</span>
              </div>
            )}
            {diseaseData.length > 0 ? (
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                className="touch-none"
                viewBox={`0 0 ${svgRef.current?.parentElement?.clientWidth || 300} ${chartHeightConfig.containerHeight}`}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>正在加载风险数据或无数据显示...</p>
              </div>
            )}
          </div>
        </div>

        {/* 条件渲染：体重调整时显示科普信息，真实体重时显示 BMI 信息 */}
        {popupMessage && (
          <div className="mt-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-4 rounded-xl shadow-lg border border-indigo-700 animate-fade-in">
            <div className="flex items-center mb-2">
              {weightChange < 0 ? (
                <TrendingDown className="text-green-400 mr-2 flex-shrink-0" />
              ) : (
                <TrendingUp className="text-red-400 mr-2 flex-shrink-0" />
              )}
              <h3 className="text-base font-semibold">健康小贴士</h3>
            </div>
            <p className="text-sm text-gray-200">{popupMessage}</p>
          </div>
        )}

        {/* 新增：BMI 信息显示 (仅当 weightChange === 0 且 bmiInfo 有效时) */}
        {weightChange === 0 && bmiInfo && (
          <div className="mt-2 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white p-4 rounded-xl shadow-lg border border-gray-700 animate-fade-in">
            <div className="flex items-center mb-2">
              <Activity className="text-teal-400 mr-2 flex-shrink-0" />
              <h3 className="text-base font-semibold">您的身体质量指数 (BMI)</h3>
            </div>
            <div className="text-center mb-2">
              <span className={`text-3xl font-bold ${bmiInfo.colorClass}`}>{bmiInfo.value}</span>
              <span className={`ml-2 text-sm font-medium ${bmiInfo.colorClass}`}>({bmiInfo.category})</span>
            </div>
            <p className="text-sm text-gray-300 text-center">{bmiInfo.advice}</p>
          </div>
        )}
        
        <div className="mt-6 flex-shrink-0">
          <button
            onClick={handleStartJourney}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            开始探索吧！
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthTrajectory;
