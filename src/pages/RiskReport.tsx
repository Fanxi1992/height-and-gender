import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { Heart, AlertTriangle, Loader } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import useUserStore from '../stores/userStore';


// ---------------- 3D VISUALIZATION CONFIG ----------------
const NETWORK_RADIUS = 8; // 网络分布半径
const NODE_BASE_RADIUS = 0.25; // 节点基础半径
const NODE_RADIUS_SCALE = 0.6; // 节点半径风险缩放因子
const NODE_MOVEMENT_SPEED = 0.08; // 节点移动速度
const NODE_MOVEMENT_AMOUNT = 0.1; // 节点最大移动距离
const NETWORK_ROTATION_SPEED = 0.03; // 整体网络旋转速度
// ---------------- END 3D VISUALIZATION CONFIG ----------------

// ---------------- INTERFACES ----------------
interface DiseaseNodeData {
  id: number | string; // Use string for API IDs, number for mock
  name: string;
  risk: number;
  category: string;
  index?: number; // Will be added during processing
}

interface DiseaseLinkData {
  source: number; // Index of source node in the nodes array
  target: number; // Index of target node in the nodes array
  strength: number;
}

interface ProcessedNode extends DiseaseNodeData {
  index: number;
  position: THREE.Vector3;
  color: string;
  radius: number;
}

interface ProcessedEdge {
  source: number; // Index
  target: number; // Index
  weight: number;
}

interface NetworkData {
    nodes: DiseaseNodeData[];
    links: DiseaseLinkData[];
    categoryColors: Record<string, string>;
}

interface ProcessedNetworkData {
    nodes: ProcessedNode[];
    edges: ProcessedEdge[];
}

// Backend response data structure (parsed from echarts_json)
interface EchartsNode {
    id: number | string; // Backend might use string or number IDs
    name: string;
    value: number; // Risk probability
    category: number; // Index referring to categories array
}

interface EchartsLink {
    source: string; // Disease name
    target: string; // Disease name
    value: number; // Link strength/effect
}

interface EchartsCategory {
    name: string;
}

interface EchartsData {
    nodes: EchartsNode[];
    links: EchartsLink[];
    categories: EchartsCategory[];
}

// ---------------- END INTERFACES ----------------


// ---------------- HELPER FUNCTIONS ----------------

// 修改获取用户数据的函数，使用userStore提供的方法
const getUserHealthInfo = () => {
  const getBaseInfos = useUserStore.getState().getBaseInfos();
  const getDiseaseInput = useUserStore.getState().getDiseaseInput();
  
  // 如果基本信息不存在，返回null
  if (!getBaseInfos) {
    return null;
  }
  
  return {
    年龄: getBaseInfos["年龄"],
    性别: getBaseInfos["性别"],
    身高: getBaseInfos["身高(101)"], // 映射到"身高"
    体重: getBaseInfos["体重(102)"], // 映射到"体重"
    吸烟史等级: getBaseInfos["吸烟史等级"],
    饮酒史等级: getBaseInfos["饮酒史等级"],
    运动习惯等级: getBaseInfos["运动习惯等级"],
    疾病历史: getDiseaseInput // 重命名为"疾病历史"
    // 不包括bmi，由后端计算
  };

};

// Generates colors for categories, trying to reuse predefined ones
const PREDEFINED_CATEGORY_COLORS = {
  "代谢疾病": "#FF6B6B", // Mock category name
  "心血管疾病": "#4ECDC4", // Mock category name
  "泌尿系统疾病": "#45B7D1", // Mock category name
  "消化系统疾病": "#FFA500", // Mock/Backend category name
  "神经系统疾病": "#9370DB", // Mock/Backend category name
  // Map potential backend names to colors
  "内分泌、营养和代谢疾病": "#FF6B6B",
  "循环系统疾病": "#4ECDC4",
  "泌尿生殖系统疾病": "#45B7D1",
  "肿瘤": "#FF6347",
  "症状、体征和临床与实验室异常所见": "#6A5ACD",
  "眼和附器疾病": "#20B2AA",
  "血液及造血器官疾病和涉及免疫机制的某些疾患": "#FFD700",
  "先天性畸形、变形和染色体异常": "#DB7093",
  "损伤、中毒和外因的某些其他后果": "#8A2BE2",
  "妊娠、分娩和产褥期": "#FF8C00",
  "皮肤和皮下组织疾病": "#ADFF2F",
  "某些传染病和寄生虫病": "#00CED1",
  "肌肉骨骼系统和结缔组织疾病": "#FF4500",
  "呼吸系统疾病": "#7FFF00", // Added more diverse colors
  "耳和乳突疾病": "#BA55D3",
  "default": "#AAAAAA"
};

function generateCategoryColors(categories: { name: string }[]): Record<string, string> {
  const colors: Record<string, string> = { ...PREDEFINED_CATEGORY_COLORS };
  const availableColors = ["#FF1493", "#00BFFF", "#32CD32", "#FFD700", "#8A2BE2", "#FF7F50"]; // Fallback colors
  let colorIndex = 0;

  categories.forEach(category => {
    if (!colors[category.name]) {
      // Try to find a similar predefined key (simple substring match)
      const predefinedKey = Object.keys(PREDEFINED_CATEGORY_COLORS).find(key => key.includes(category.name) || category.name.includes(key));
      if (predefinedKey && predefinedKey !== 'default') {
          colors[category.name] = PREDEFINED_CATEGORY_COLORS[predefinedKey];
      } else {
          colors[category.name] = availableColors[colorIndex % availableColors.length] || colors.default;
          colorIndex++;
      }
    }
  });
  colors["default"] = PREDEFINED_CATEGORY_COLORS.default; // Ensure default exists
  return colors;
}


// Transforms backend EchartsData to frontend NetworkData format
function transformApiData(echartsData: EchartsData): NetworkData {
    const categoryMap = new Map(echartsData.categories.map((cat, index) => [index + 1, cat.name])); // Backend category index starts from 1
    const nameToIndexMap = new Map<string, number>();

    const nodes: DiseaseNodeData[] = echartsData.nodes.map((node, index) => {
        nameToIndexMap.set(node.name, index); // Map name to the index in the *new* array
        return {
            id: node.id, // Keep original ID from backend
            name: node.name,
            risk: node.value,
            category: categoryMap.get(node.category) || "未知分类", // Use category name
        };
    });

    const links: DiseaseLinkData[] = echartsData.links
        .map(link => {
            const sourceIndex = nameToIndexMap.get(link.source);
            const targetIndex = nameToIndexMap.get(link.target);
            // Ensure both source and target nodes exist in our filtered node list
            if (sourceIndex !== undefined && targetIndex !== undefined) {
                return {
                    source: sourceIndex,
                    target: targetIndex,
                    strength: Math.abs(link.value), // Use absolute value for strength visualization
                };
            }
            return null;
        })
        .filter((link): link is DiseaseLinkData => link !== null); // Filter out nulls

    const categoryColors = generateCategoryColors(echartsData.categories);

    return { nodes, links, categoryColors };
}


// 数据处理: 生成用于 Three.js 的节点和边数据 (计算位置等)
function processNetworkData(
    initialNodesData: DiseaseNodeData[],
    initialLinksData: DiseaseLinkData[],
    categoryColors: Record<string, string>
): ProcessedNetworkData {
  const nodes = initialNodesData.map((disease, i) => {
    const numNodes = initialNodesData.length;
    // 使用斐波那契球体算法 (Fibonacci sphere) 分配初始位置
    const phi = Math.acos(-1 + (2 * i) / numNodes);
    const theta = Math.sqrt(numNodes * Math.PI) * phi;
    const position = [
        NETWORK_RADIUS * Math.sin(phi) * Math.cos(theta),
        NETWORK_RADIUS * Math.sin(phi) * Math.sin(theta),
        NETWORK_RADIUS * Math.cos(phi)
    ];

    // --- 修改开始: 根据 risk 值确定节点颜色 ---
    const isUserReported = disease.risk === 1;
    const nodeColor = isUserReported
      ? '#FF0000' // 用户上报的疾病使用红色
      : categoryColors[disease.category] || categoryColors.default; // 其他疾病使用类别颜色
    // --- 修改结束 ---

    return {
      ...disease, // 保留原始数据 (id, name, risk, category)
      index: i, // 添加索引
      position: new THREE.Vector3(...position), // 3D 坐标
      color: nodeColor, // 使用新的颜色逻辑
      radius: NODE_BASE_RADIUS + disease.risk * NODE_RADIUS_SCALE // 半径基于风险
    };
  });

  // Edges remain mostly the same, just mapping source/target indices and strength/weight
  const edges: ProcessedEdge[] = initialLinksData.map(link => ({
      source: link.source, // Already an index
      target: link.target, // Already an index
      weight: link.strength // Use strength as weight
  }));

  return { nodes, edges };
}

// ---------------- END HELPER FUNCTIONS ----------------


// ---------------- 3D COMPONENTS (Node, Edge, NetworkContainer, NetworkGraph) ----------------
// (These components remain largely unchanged, but will receive data dynamically)

// Node Component
function Node({ node, onNodeHover, onNodeClick, isHighlighted, isSelected }: {
    node: ProcessedNode;
    onNodeHover: (node: ProcessedNode | null, x: number, y: number) => void;
    onNodeClick: (nodeIndex: number) => void;
    isHighlighted: boolean;
    isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [isHovered, setIsHovered] = useState(false);
  const initialPos = useRef(node.position.clone());
  const randomOffset = useRef(Math.random() * 1000);

  // 节点轻微随机移动和自转动画
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      const time = state.clock.elapsedTime + randomOffset.current;
      const x = Math.sin(time * NODE_MOVEMENT_SPEED) * NODE_MOVEMENT_AMOUNT;
      const y = Math.cos(time * NODE_MOVEMENT_SPEED * 1.1) * NODE_MOVEMENT_AMOUNT;
      const z = Math.sin(time * NODE_MOVEMENT_SPEED * 0.9) * NODE_MOVEMENT_AMOUNT;
      meshRef.current.position.lerp(initialPos.current.clone().add(new THREE.Vector3(x, y, z)), 0.1); // 平滑移动
    }
  });

  // 悬浮和选中时的放大效果
  const targetScale = isHovered || isSelected ? 1.5 : (isHighlighted ? 1.2 : 1); // 选中 > 悬浮 > 邻居 > 默认
  useFrame(() => {
      if (meshRef.current) {
         meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      }
  });

  // 事件处理
  const handlePointerOver = useCallback((e: any) => { // Use any for event type for simplicity
    e.stopPropagation();
    setIsHovered(true);
    onNodeHover(node, e.clientX, e.clientY);
    document.body.style.cursor = 'pointer';
  }, [node, onNodeHover]);

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    setIsHovered(false);
    onNodeHover(null, 0, 0);
    document.body.style.cursor = 'auto';
  }, [onNodeHover]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onNodeClick(node.index); // 传递节点索引
  }, [node.index, onNodeClick]);

  return (
    <mesh
      ref={meshRef}
      position={node.position} // 使用计算后的初始位置
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[node.radius, 32, 32]} />
      <meshStandardMaterial
         color={node.color}
         roughness={0.4}
         metalness={0.1}
         emissive={(isHovered || isSelected) ? node.color : '#000000'} // 悬浮或选中时发光
         emissiveIntensity={(isHovered || isSelected) ? 0.7 : 0}
         transparent={!isHighlighted && !isSelected && node.risk !== 1} // 非高亮、非选中且非用户上报时半透明
         opacity={(isHighlighted || isSelected || node.risk === 1) ? 1 : 0.4} // 高亮、选中或用户上报时完全不透明，否则半透明
      />
       {/* --- 修改开始: 使用 Billboard 包裹 Text --- */}
       <Billboard
         follow={true} // 保持跟随节点
         lockX={false} // 允许 X 轴旋转（通常不需要锁）
         lockY={false} // 允许 Y 轴旋转（通常不需要锁）
         lockZ={false} // 允许 Z 轴旋转（通常不需要锁）
       >
         <Text
           position={[0, node.radius + 0.25, 0]} // 稍微调整文字位置
           fontSize={0.25} // 稍微调小字体
           color="white"
           anchorX="center"
           anchorY="middle"
           // visible={isHovered || isSelected} // 移除此行，使其始终可见
           material-depthTest={false} // 防止文字被遮挡
           material-transparent={true}
           material-opacity={0.85} // 设置一点透明度减少视觉干扰
         >
           {node.name}
         </Text>
       </Billboard>
       {/* --- 修改结束 --- */}
    </mesh>
  );
}

// Edge Component
function Edge({ startNode, endNode, weight, isHighlighted }: {
    startNode: ProcessedNode;
    endNode: ProcessedNode;
    weight: number;
    isHighlighted: boolean;
}) {
    // 显式声明 points 的类型为包含两个 THREE.Vector3 的元组
    const points: [THREE.Vector3, THREE.Vector3] = useMemo(() => [startNode.position, endNode.position], [startNode, endNode]);
    const baseWidth = 1;
    const scaleFactor = 3;
    const lineWidth = baseWidth + weight * scaleFactor;
    const opacity = isHighlighted ? (0.5 + weight * 0.5) : 0.08; // 高亮时更明显，否则很暗淡
    const color = isHighlighted ? "#ffffff" : "#aaaaaa";

    // 使用 Line 组件绘制边
    return (
        <Line
            points={points} // Line 需要点的位置数组
            color={color}
            lineWidth={isHighlighted ? lineWidth : 1} // 高亮时根据权重调整粗细
            transparent={true}
            opacity={opacity}
            depthWrite={false} // Helps with transparency rendering order
        />
    );
}

// Network Container (for global rotation)
function NetworkContainer({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    if (groupRef.current) {
      // subtle rotation based on mouse position for a bit of interaction
      const mouseX = state.pointer.x * 0.1; // Get normalized mouse x (-1 to 1)
      // Lerp rotation for smoothness
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, groupRef.current.rotation.y + delta * NETWORK_ROTATION_SPEED + mouseX * delta * 0.5, 0.1);
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

// Main Network Graph Component
function NetworkGraph({ nodes, edges, onNodeHover, onNodeClick, selectedNodeIndex }: {
    nodes: ProcessedNode[];
    edges: ProcessedEdge[];
    onNodeHover: (node: ProcessedNode | null, x: number, y: number) => void;
    onNodeClick: (nodeIndex: number) => void;
    selectedNodeIndex: number | null;
}) {
  // 创建节点索引到节点数据的映射，方便查找
  const nodeMap = useMemo(() => {
    const map = new Map<number, ProcessedNode>();
    nodes.forEach(node => map.set(node.index, node));
    return map;
  }, [nodes]);

  // 确定哪些节点和边需要高亮
  const { highlightedNodes, highlightedEdges } = useMemo(() => {
    if (selectedNodeIndex === null) {
      // 没有选中节点，所有节点和边都"高亮"（即正常显示）
      return {
        highlightedNodes: new Set(nodes.map(n => n.index)),
        highlightedEdges: new Set(edges.map((_, i) => i)) // Highlight edges by their index in the edges array
      };
    }
    // 选中了节点，找出选中节点及其直接邻居和相关边
    const hn = new Set([selectedNodeIndex]);
    const he = new Set<number>(); // Set to store indices of highlighted edges
    edges.forEach((edge, index) => {
      // Backend indices might not match array indices directly if filtering happened
      // We rely on the source/target properties matching the selectedNodeIndex
      if (edge.source === selectedNodeIndex) {
        hn.add(edge.target); // Add the neighbor node index
        he.add(index);       // Add the edge index
      } else if (edge.target === selectedNodeIndex) {
        hn.add(edge.source); // Add the neighbor node index
        he.add(index);       // Add the edge index
      }
    });
    return { highlightedNodes: hn, highlightedEdges: he };
  }, [selectedNodeIndex, nodes, edges]);


  return (
    <group>
      {/* Render Edges */}
      {edges.map((edge, index) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        // Check if both nodes exist (they should, but safety check)
        if (sourceNode && targetNode) {
          return (
            <Edge
              key={`edge-${sourceNode.id}-${targetNode.id}-${index}`} // Use node IDs for key stability
              startNode={sourceNode} // 传递整个节点对象
              endNode={targetNode}   // 传递整个节点对象
              weight={edge.weight}
              isHighlighted={highlightedEdges.has(index)} // Pass highlight status based on edge index
            />
          );
        }
        return null;
      })}

      {/* Render Nodes */}
      {nodes.map(node => (
        <Node
          key={`node-${node.id}`} // Use node ID for key stability
          node={node}
          onNodeHover={onNodeHover}
          onNodeClick={onNodeClick}
          isSelected={node.index === selectedNodeIndex} // 是否是当前选中的节点
          isHighlighted={highlightedNodes.has(node.index)} // 是否需要高亮（选中节点或其邻居）
        />
      ))}
    </group>
  );
}
// ---------------- END 3D COMPONENTS ----------------


// ---------------- MAIN RiskReport COMPONENT ----------------
const RiskReport: React.FC = () => {
  const navigate = useNavigate();
  const { markOnboardingCompleted, setRiskReportData } = useUserStore();
  
  // 从 store 获取转换后的数据
  const getBaseInfos = useUserStore(state => state.getBaseInfos);
  const getDiseaseInput = useUserStore(state => state.getDiseaseInput);
  
  const [baseInfos, setBaseInfos] = useState<any>(null);
  const [diseaseInput, setDiseaseInput] = useState<string[]>([]);
  const [dataReady, setDataReady] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], links: [], categoryColors: {} });
  const [processedNetworkData, setProcessedNetworkData] = useState<ProcessedNetworkData>({ nodes: [], edges: [] });

  const [hoveredNodeData, setHoveredNodeData] = useState<ProcessedNode | null>(null); // Use ProcessedNode for hover data
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }); // Tooltip 位置
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null); // 存储选中节点的索引
  const [riskThreshold, setRiskThreshold] = useState<number>(0.001); // 新增：风险阈值状态，默认为 0.1%

  // --- Data Fetching and Processing Logic ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setNetworkData({ nodes: [], links: [], categoryColors: {} }); // Clear previous data
      setProcessedNetworkData({ nodes: [], edges: [] }); // Clear processed data
      setSelectedNodeIndex(null); // Clear selection

      // 获取用户健康信息
      const userInfo = getUserHealthInfo();
      
      // 检查用户数据是否完整
      if (!userInfo) {
        setError("用户健康数据不完整，请返回完善您的信息。");
        setIsLoading(false);
        return;
      }

      // // --- USE MOCK DATA IN DEVELOPMENT ---
      // if (process.env.NODE_ENV === 'development' && false) { // 设置为false以便在开发环境也使用真实API
      //   console.log("Using mock data (development mode)");
      //   const mockCategories = Array.from(new Set(mockDiseaseData.map(d => d.category))).map(name => ({ name }));
      //   const mockCategoryColorsGenerated = generateCategoryColors(mockCategories);
      //   // Add index to mock data for consistency
      //   const indexedMockNodes = mockDiseaseData.map((node, index) => ({...node, index}));
      //   setNetworkData({
      //       nodes: indexedMockNodes,
      //       links: mockDiseaseLinks,
      //       categoryColors: mockCategoryColorsGenerated
      //   });
      //   setIsLoading(false);
      //   return;
      // }

      // --- FETCH REAL DATA IN PRODUCTION OR DEV (if mock is disabled) ---
      try {
        console.log("Fetching real data from backend...");
        console.log("发送用户数据:", userInfo);
        console.log("使用风险阈值:", riskThreshold); // 新增：打印当前阈值
        
        // 构建API请求数据
        const apiRequestData = {
          "年龄": userInfo.年龄,
          "性别": userInfo.性别,
          "身高": userInfo.身高, // 后端期望字段名为"身高"而非"身高(101)"
          "体重": userInfo.体重, // 后端期望字段名为"体重"而非"体重(102)"
          "吸烟史等级": userInfo.吸烟史等级,
          "饮酒史等级": userInfo.饮酒史等级,
          "运动习惯等级": userInfo.运动习惯等级,
          "疾病历史": userInfo.疾病历史, // 后端期望字段名为"疾病历史"而非"disease_input"
          "report_prob_threshold": riskThreshold // 新增：将阈值发送给后端
        };
        // BMI由后端自动计算，不需要发送
        console.log("发送用户数据:", apiRequestData);
        
        // const response = await fetch('https://comorbidity.top/api/v1/health/predict', { // 生产环境
        const response = await fetch('http://127.0.0.1:8300/api/v1/health/predict', { // 本地开发环境
          
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiRequestData),
        });

        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
              const errorData = await response.json();
              errorMsg = errorData.detail || errorData.message || errorMsg;
          } catch (e) {
              // Ignore if response is not JSON
          }
          throw new Error(errorMsg);
        }

        const result = await response.json();

        if (result.code === 200 && result.data && result.data.echarts_json) {
           const echartsData: EchartsData = JSON.parse(result.data.echarts_json);
           console.log("Raw EchartsData from API:", echartsData);
           const transformedData = transformApiData(echartsData); // Contains nodes, links (mapped to original indices), categoryColors
           console.log("Transformed NetworkData (before potential filtering):", transformedData);

           const MAX_NODES_TO_DISPLAY = 50;
           let finalNodes: DiseaseNodeData[] = [];
           let finalLinks: DiseaseLinkData[] = [];

           // 判断节点数量是否超过阈值
           if (transformedData.nodes.length > MAX_NODES_TO_DISPLAY) {
               console.log(`Node count (${transformedData.nodes.length}) exceeds limit (${MAX_NODES_TO_DISPLAY}). Filtering...`);

               // --- 开始：节点过滤和排序 (仅当节点数 > 50 时) ---
               // 1. 按风险排序 (用户上报优先，然后按风险降序)
               const sortedNodes = [...transformedData.nodes].sort((a, b) => {
                   if (a.risk === 1 && b.risk !== 1) return -1; // 用户上报的节点排在最前面
                   if (b.risk === 1 && a.risk !== 1) return 1;
                   return b.risk - a.risk; // 按风险降序排列
               });

               // 2. 截取前 MAX_NODES_TO_DISPLAY 个节点
               const topNodesRaw = sortedNodes.slice(0, MAX_NODES_TO_DISPLAY);

               // 3. 为选中的节点创建查找映射 (按名称) 并更新索引
               const topNodeNameToIndexMap = new Map<string, number>();
               finalNodes = topNodesRaw.map((node, newIndex) => {
                   topNodeNameToIndexMap.set(node.name, newIndex);
                   return { ...node, index: newIndex }; // 更新节点在新数组中的索引
               });
               console.log(`Filtered down to ${finalNodes.length} nodes.`);

               // 4. 过滤并重新索引连接 (使用原始 echartsData.links, 因为需要原始名称)
               finalLinks = echartsData.links
                   .filter(link => topNodeNameToIndexMap.has(link.source) && topNodeNameToIndexMap.has(link.target)) // 保留两端都在 topNodes 中的连接
                   .map(link => {
                       const sourceNewIndex = topNodeNameToIndexMap.get(link.source);
                       const targetNewIndex = topNodeNameToIndexMap.get(link.target);
                       // filter 保证了 sourceNewIndex 和 targetNewIndex 不是 undefined
                       return {
                           source: sourceNewIndex!,
                           target: targetNewIndex!,
                           strength: Math.abs(link.value),
                       };
                   });
               console.log(`Filtered down to ${finalLinks.length} links.`);
               // --- 结束：节点过滤和排序 ---
           } else {
               // 节点数量未超过阈值，直接使用转换后的数据，但要确保节点有索引
               console.log(`Node count (${transformedData.nodes.length}) is within limit. Using all transformed nodes.`);
               // Add index to each node based on its position in the original transformed array
               finalNodes = transformedData.nodes.map((node, index) => ({ ...node, index: index }));
               // Use the links already correctly indexed by transformApiData relative to the full node list
               finalLinks = transformedData.links;
           }

           // 使用最终确定的节点和连接设置状态
           setNetworkData({
               nodes: finalNodes,
               links: finalLinks,
               categoryColors: transformedData.categoryColors,
           });
        } else {
           throw new Error(result.msg || "Invalid data format received from backend.");
        }

      } catch (err) {
        console.error("Failed to fetch health prediction:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during data fetching.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [riskThreshold]); // 修改：添加 riskThreshold 作为依赖项，切换阈值时重新获取数据


  // --- Process Network Data whenever raw networkData changes ---
  useEffect(() => {
      if (networkData.nodes.length > 0 && networkData.links.length >= 0) { // Allow 0 links
          try {
              console.log("Processing network data for 3D visualization...");
              const processed = processNetworkData(networkData.nodes, networkData.links, networkData.categoryColors);
              setProcessedNetworkData(processed);
              console.log("Processed network data:", processed);
          } catch (processingError) {
               console.error("Error processing network data:", processingError);
               setError("Failed to process network data for visualization.");
               setProcessedNetworkData({ nodes: [], edges: [] }); // Reset processed data on error
          }
      } else {
           setProcessedNetworkData({ nodes: [], edges: [] }); // Clear if no data
      }
  }, [networkData]); // Re-run when networkData state updates


  // --- Event Handlers ---
  const handleNodeHover = useCallback((nodeData: ProcessedNode | null, screenX: number, screenY: number) => {
    setHoveredNodeData(nodeData);
    if (nodeData) {
        setTooltipPosition({ x: screenX + 10, y: screenY - 10 }); // Adjust Tooltip 位置
    }
  }, []);

  const handleNodeClick = useCallback((nodeIndex: number) => {
    setSelectedNodeIndex(prev => (prev === nodeIndex ? null : nodeIndex)); // 点击已选中的节点则取消选中
  }, []);

  // 点击 Canvas 空白处取消选中
  const handleCanvasClick = useCallback(() => {
      // We only deselect if clicking the background, node clicks handle their own logic (stopPropagation)
      // A simple way: deselect if a node wasn't just hovered (implies click was likely on background)
      // This isn't perfect but avoids complex raycasting for background clicks.
      if (!hoveredNodeData) {
         setSelectedNodeIndex(null);
      }
      // console.log("Canvas clicked");
  }, [hoveredNodeData]); // Depend on hoveredNodeData

   // --- Derived Data for Rendering ---
   // Get data for the selected node (using ProcessedNode for consistency)
   const selectedNode: ProcessedNode | null = useMemo(() => {
       return selectedNodeIndex !== null ? processedNetworkData.nodes[selectedNodeIndex] : null;
   }, [selectedNodeIndex, processedNetworkData.nodes]);

   // 对原始疾病数据按风险排序，用于列表显示
   const sortedDiseaseData = useMemo(() => {
        // 对节点数据进行排序，并为风险值为1的疾病（既有疾病）添加标记
        return [...networkData.nodes]
            .map(node => ({
                ...node,
                // 如果风险值为1，则在疾病名称后添加"（既有疾病）"标记
                name: node.risk === 1 ? `${node.name}（既有疾病）` : node.name
            }))
            .sort((a, b) => b.risk - a.risk);
   }, [networkData.nodes]);

   // --- 新增: 将排序后的数据存入 Zustand store ---
   useEffect(() => {
     if (sortedDiseaseData && sortedDiseaseData.length > 0) {
       console.log("Saving sortedDiseaseData to store:", sortedDiseaseData);
       // 存储原始数据，包含所有字段，以便 HealthRiskReport 可以访问原始 risk 值
       setRiskReportData(sortedDiseaseData);
     }
   }, [sortedDiseaseData, setRiskReportData]);
   // --- 新增结束 ---

    // --- 修改开始: 计算图例所需的类别和颜色 ---
    const displayedCategoryColors = useMemo(() => {
        if (!networkData || !networkData.nodes || !networkData.categoryColors) {
            return {};
        }
        // 获取节点数据中实际存在的所有唯一类别名称
        const uniqueNodeCategories = new Set(networkData.nodes.map(node => node.category));

        const colorsMap: Record<string, string> = {};

        uniqueNodeCategories.forEach(category => {
            // 只添加有效类别，暂时忽略'default'或'未知分类'（除非它们确实存在于节点中）
            if (category && category !== 'default') {
                colorsMap[category] = networkData.categoryColors[category] || networkData.categoryColors.default || '#AAAAAA';
            }
        });

        // 检查是否存在用户上报的节点 (risk === 1)
        const hasUserReportedNodes = networkData.nodes.some(node => node.risk === 1);
        // 如果存在，则明确添加"用户上报"及其颜色到图例
        if (hasUserReportedNodes) {
             colorsMap['用户既有疾病'] = '#FF0000'; // 对应 processNetworkData 中的红色
        }

        return colorsMap;
    }, [networkData]);
    // --- 修改结束 ---

  // 处理下一步按钮点击
  const handleNext = useCallback(() => {
    window.scrollTo(0, 0);
    navigate('/health-trajectory');
  }, [navigate]);

  // --- Rendering ---
  return (
    <div className="px-4 relative bg-black text-white flex flex-col h-screen overflow-y-auto">
      <StatusBar />

      {/* Header */}
      <div className="mt-10 px-4 flex justify-between items-center flex-shrink-0">
        <BackButton />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-medium"></h1>
        <div className="w-8"></div> {/* Placeholder */}
      </div>

      {/* 新增：将标题移到进度条上方 */}
      <h2 className="text-center text-xl font-bold mt-10 text-white">
          疾病风险网络
      </h2>
      {/* Progress Indicator */}
        <ProgressIndicator currentStep={6} totalSteps={7} />


      {/* Main Content Area */}
      <div className="flex flex-col mt-4 gap-4 pb-6 flex-grow"> {/* Make content grow */}

         {/* Loading State */}
         {isLoading && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
                <Loader className="animate-spin h-12 w-12 mb-4" />
                <p className="text-lg">正在分析您的健康数据，请稍候...</p>
            </div>
         )}

         {/* Error State */}
         {!isLoading && error && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-red-400 bg-red-900/20 rounded-lg p-6 border border-red-700">
                <AlertTriangle className="h-12 w-12 mb-4 text-red-500" />
                <p className="text-lg font-semibold mb-2">数据加载失败</p>
                <p className="text-sm text-center mb-4">{error}</p>
                {error.includes("用户健康数据不完整") ? (
                  <button
                      onClick={() => navigate('/gender-selection')} // 导航到引导流程开始页面
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm"
                  >
                      返回填写信息
                  </button>
                ) : (
                  <button
                      onClick={() => window.location.reload()} // Simple retry: reload page
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm"
                  >
                      重试
                  </button>
                )}
            </div>
         )}

         {/* Success State - Render Network and List */}
         {!isLoading && !error && processedNetworkData.nodes.length > 0 && (
            <>
              {/* 3D Network Visualization Area */}
              <div className="h-[60vh] md:h-[65vh] relative rounded-3xl bg-gradient-to-br from-gray-900 via-black to-indigo-900 border border-gray-800 shadow-lg overflow-hidden">
                {/* 移除这里的 h2 标题 */}
                {/* <h2 className="absolute top-4 left-4 right-4 text-2xl font-bold z-10 text-white bg-black/30 px-3 py-1 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Heart className="text-red-500 mr-2 w-5 h-5 flex-shrink-0" />
                  疾病风险网络
                </h2> */}

                {/* HTML Tooltip */}
                {hoveredNodeData && (
                    <div style={{
                        position: 'fixed', // Use fixed position relative to viewport
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        background: 'rgba(0, 0, 0, 0.85)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none', // IMPORTANT: Allow events to pass through
                        transform: 'translateY(-110%)', // Position above cursor
                        zIndex: 1000, // Ensure it's on top
                        fontFamily: 'sans-serif',
                        backdropFilter: 'blur(2px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                     }}>
                        {hoveredNodeData.name} (风险: {(hoveredNodeData.risk * 100).toFixed(1)}%)
                     </div>
                )}

                {/* Selection Info Panel */}
                {selectedNode && (
                     <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md p-3 rounded-lg text-sm shadow-md max-w-xs border border-gray-700">
                        <h4 className="font-semibold mb-1 text-base" style={{color: selectedNode.color}}>{selectedNode.name}</h4>
                        <p><span className="font-medium">风险等级:</span> <span className="text-yellow-400 font-bold">{(selectedNode.risk * 100).toFixed(1)}%</span></p>
                        <p><span className="font-medium">类别:</span> {selectedNode.category}</p>
                         <button
                            onClick={(e) => { e.stopPropagation(); setSelectedNodeIndex(null); }} // Prevent canvas click handler
                            className="mt-2 text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                        >
                             清除选择
                         </button>
                     </div>
                 )}

                {/* Canvas for 3D rendering */}
                <Canvas
                  camera={{ position: [0, 0, NETWORK_RADIUS * 2.2], fov: 50 }}
                  style={{ background: 'transparent' }}
                  onClick={handleCanvasClick} // Handle clicks on the canvas background
                >
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[5, 10, 8]} intensity={1.2} castShadow />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffdddd" />
                  <hemisphereLight args={["#ffffff", "#444444", 0.5]} />
                  {/* Optional: Add subtle fog */}
                  {/* <fog attach="fog" args={['#0a0a1a', NETWORK_RADIUS * 1.5, NETWORK_RADIUS * 3]} /> */}

                   <NetworkContainer>
                     <NetworkGraph
                         nodes={processedNetworkData.nodes}
                         edges={processedNetworkData.edges}
                         onNodeHover={handleNodeHover}
                         onNodeClick={handleNodeClick}
                         selectedNodeIndex={selectedNodeIndex}
                     />
                   </NetworkContainer>

                  {/* 增加自动旋转速度，autoRotateSpeed默认为2.0，这里提高到3.5 */}
                  <OrbitControls 
                    enablePan={true} 
                    enableZoom={true} 
                    enableRotate={true} 
                    minDistance={3} 
                    maxDistance={NETWORK_RADIUS * 3.5}
                    autoRotate={true}
                    autoRotateSpeed={0.6} 
                  />
                </Canvas>
              </div>

              {/* --- 新增：风险阈值选择器 --- */}
              <div className="flex justify-center items-center gap-4 my-3 px-4">
                 <span className="text-sm text-gray-400">风险阈值:</span>
                 <div className="flex gap-2">
                    <button
                        className={`px-3 py-1.5 rounded-md text-xs transition-colors duration-200 ${
                            riskThreshold === 0.001
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setRiskThreshold(0.001)}
                    >
                        患病风险&gt;0.1%
                    </button>
                    <button
                        className={`px-3 py-1.5 rounded-md text-xs transition-colors duration-200 ${
                            riskThreshold === 0.01
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setRiskThreshold(0.01)}
                    >
                        患病风险&gt;1%
                    </button>
                 </div>
              </div>
              {/* --- 新增结束 --- */}

              {/* --- 修改开始: 插入图例 --- */}
              {Object.keys(displayedCategoryColors).length > 0 && (
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-3 my-4 shadow-md border border-gray-700/50">
                    <h4 className="text-sm font-semibold mb-2 text-gray-300 text-center">图例 / Categories</h4>
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5">
                        {Object.entries(displayedCategoryColors).map(([category, color]) => (
                            <div key={category} className="flex items-center">
                                <span className="w-3 h-3 rounded-sm mr-1.5 flex-shrink-0" style={{ backgroundColor: color }}></span>
                                <span className="text-xs text-gray-300">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
              )}
              {/* --- 修改结束 --- */}

              {/* Disease Risk Ranking Area */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-4 shadow-lg border border-gray-800">
                <h3 className="text-lg font-semibold mb-3 text-white text-center">疾病风险排名</h3>
                <div>
                  {/* Header Row */}
                  <div className="grid grid-cols-12 text-sm font-medium text-gray-400 mb-2 sticky top-0 bg-gray-900/90 py-1 z-10"> {/* Add z-index */}
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-7 pl-2">疾病名称</div>
                    <div className="col-span-4 text-right pr-2">风险值</div>
                  </div>
                  {/* Data Rows */}
                  {sortedDiseaseData.length > 0 ? (
                      sortedDiseaseData.map((disease, rankIndex) => (
                          <div
                              key={disease.id || disease.index} // Use ID if available, fallback to index
                              className={`grid grid-cols-12 text-sm py-2 px-1 ${selectedNodeIndex === disease.index ? 'bg-indigo-800/70 ring-1 ring-indigo-500 scale-[1.01]' : (rankIndex % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/50')} rounded-lg mb-1 items-center transition-all duration-200 cursor-pointer hover:bg-gray-700/70`}
                              onClick={() => handleNodeClick(disease.index as number)} // Click list item to select node
                          >
                              <div className={`col-span-1 font-bold text-center ${selectedNodeIndex === disease.index ? 'text-white' : 'text-gray-400'}`}>{rankIndex + 1}</div>
                              <div className={`col-span-7 pl-2 truncate ${selectedNodeIndex === disease.index ? 'text-white font-medium' : 'text-gray-200'}`}>{disease.name}</div>
                              <div className={`col-span-4 text-right font-mono pr-2 ${selectedNodeIndex === disease.index ? 'text-yellow-300 font-bold' : 'text-yellow-400'}`}>
                                  {(disease.risk * 100).toFixed(1)}%
                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="text-center text-gray-500 py-4">暂无风险数据</p>
                  )}
                </div>
              </div>
            </>
         )}

         {/* Handle case where data loads but is empty */}
         {!isLoading && !error && processedNetworkData.nodes.length === 0 && networkData.nodes.length > 0 && (
             <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
                 <AlertTriangle className="h-12 w-12 mb-4 text-yellow-500" />
                 <p className="text-lg">处理后的数据显示为空</p>
                 <p className="text-sm text-center">无法生成可视化网络或排名。</p>
            </div>
         )}
         {!isLoading && !error && networkData.nodes.length === 0 && (
             <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
                 <AlertTriangle className="h-12 w-12 mb-4 text-gray-500" />
                 <p className="text-lg">未返回有效的风险数据</p>
                 <p className="text-sm text-center">无法生成疾病风险网络。</p>
            </div>
         )}


      </div> {/* End Main Content Area */}

      {/* Next Button - Conditionally render only if data is successfully loaded */}
      {!isLoading && !error && processedNetworkData.nodes.length > 0 && (
         <div className="flex justify-center mt-auto pt-4 mb-8"> {/* Ensure button is at bottom */}
            <button
                onClick={handleNext}
                className="primary-button" // Assuming this class provides styling
              >
                下一步
              </button>
          </div>
       )}

    </div>
  );
};

export default RiskReport;
