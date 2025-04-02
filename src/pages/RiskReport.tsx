import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BackButton from '../components/BackButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { Heart } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

const DiseaseDataInput = [
  { id: 1, name: "二型糖尿病", risk: 0.73, category: "代谢疾病" },
  { id: 2, name: "高血压", risk: 0.61, category: "心血管疾病" },
  { id: 3, name: "肾结石", risk: 0.55, category: "泌尿系统疾病" },
  { id: 4, name: "高血糖", risk: 0.43, category: "代谢疾病" },
  { id: 5, name: "肠易激综合征", risk: 0.31, category: "消化系统疾病" },
  { id: 6, name: "浅表性胃炎", risk: 0.28, category: "消化系统疾病" },
  { id: 7, name: "偏头痛", risk: 0.16, category: "神经系统疾病" },
  { id: 8, name: "前列腺炎", risk: 0.11, category: "泌尿系统疾病" },
  { id: 9, name: "胆囊炎", risk: 0.04, category: "消化系统疾病" },
  { id: 10, name: "肝硬化", risk: 0.02, category: "消化系统疾病" },
];

const DiseaseLinksInput = [
  { source: 0, target: 3, strength: 0.9 }, // 二型糖尿病 - 高血糖 (Index based)
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

// 3D 可视化配置
const NETWORK_RADIUS = 8; // 网络分布半径
const CATEGORY_COLORS = { // 疾病类别颜色映射
  "代谢疾病": "#FF6B6B",
  "心血管疾病": "#4ECDC4",
  "泌尿系统疾病": "#45B7D1",
  "消化系统疾病": "#FFA500",
  "神经系统疾病": "#9370DB",
  "default": "#AAAAAA"
};
const NODE_BASE_RADIUS = 0.25; // 节点基础半径
const NODE_RADIUS_SCALE = 0.6; // 节点半径风险缩放因子
const NODE_MOVEMENT_SPEED = 0.08; // 节点移动速度
const NODE_MOVEMENT_AMOUNT = 0.1; // 节点最大移动距离
const NETWORK_ROTATION_SPEED = 0.03; // 整体网络旋转速度

// 数据处理: 生成节点和边数据 (用于 Three.js)
function processNetworkData(diseases, links) {
  const nodes = diseases.map((disease, i) => {
    const numNodes = diseases.length;
    // 使用斐波那契球体算法 (Fibonacci sphere) 分配初始位置
    const phi = Math.acos(-1 + (2 * i) / numNodes);
    const theta = Math.sqrt(numNodes * Math.PI) * phi;
    const position = [
        NETWORK_RADIUS * Math.sin(phi) * Math.cos(theta),
        NETWORK_RADIUS * Math.sin(phi) * Math.sin(theta),
        NETWORK_RADIUS * Math.cos(phi)
    ];
    return {
      ...disease, // 保留原始数据
      index: i, // 添加索引，方便连接边
      position: new THREE.Vector3(...position), // 3D 坐标
      color: CATEGORY_COLORS[disease.category] || CATEGORY_COLORS.default, // 颜色
      radius: NODE_BASE_RADIUS + disease.risk * NODE_RADIUS_SCALE // 半径基于风险
    };
  });

  const edges = links.map(link => ({
      source: link.source, // 使用原始索引
      target: link.target, // 使用原始索引
      weight: link.strength // 使用强度作为权重
  }));

  return { nodes, edges };
}

const { nodes: processedNodes, edges: processedEdges } = processNetworkData(DiseaseDataInput, DiseaseLinksInput);

// Node Component
function Node({ node, onNodeHover, onNodeClick, isHighlighted, isSelected }) {
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
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setIsHovered(true);
    onNodeHover(node, e.clientX, e.clientY);
    document.body.style.cursor = 'pointer';
  }, [node, onNodeHover]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setIsHovered(false);
    onNodeHover(null, 0, 0);
    document.body.style.cursor = 'auto';
  }, [onNodeHover]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onNodeClick(node.index); // 传递节点索引
  }, [node.index, onNodeClick]);

  return (
    <mesh
      ref={meshRef}
      position={node.position} // 使用传入的初始位置
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
         transparent={!isHighlighted && !isSelected} // 未高亮且未选中时半透明
         opacity={isHighlighted || isSelected ? 1 : 0.3} // 高亮或选中时完全不透明，否则半透明
      />
       {/* 简单显示疾病名称 - 可选，可能影响性能 */}
       {/* <Text
         position={[0, node.radius + 0.2, 0]} // Position text above the node
         fontSize={0.2}
         color="white"
         anchorX="center"
         anchorY="middle"
         visible={isHovered || isSelected} // Only show on hover/select
       >
         {node.name}
       </Text> */}
    </mesh>
  );
}

// Edge Component
function Edge({ startNode, endNode, weight, isHighlighted }) {
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
            depthWrite={false}
        />
    );
}

// Network Container (for global rotation)
function NetworkContainer({ children }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * NETWORK_ROTATION_SPEED;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

// Main Network Graph Component
function NetworkGraph({ nodes, edges, onNodeHover, onNodeClick, selectedNodeIndex }) {
  // 创建节点索引到节点数据的映射，方便查找
  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach(node => map.set(node.index, node));
    return map;
  }, [nodes]);

  // 确定哪些节点和边需要高亮
  const { highlightedNodes, highlightedEdges } = useMemo(() => {
    if (selectedNodeIndex === null) {
      // 没有选中节点，所有节点和边都"高亮"（即正常显示）
      return {
        highlightedNodes: new Set(nodes.map(n => n.index)),
        highlightedEdges: new Set(edges.map((_, i) => i))
      };
    }
    // 选中了节点，找出选中节点及其直接邻居和相关边
    const hn = new Set([selectedNodeIndex]);
    const he = new Set();
    edges.forEach((edge, index) => {
      if (edge.source === selectedNodeIndex) {
        hn.add(edge.target);
        he.add(index);
      } else if (edge.target === selectedNodeIndex) {
        hn.add(edge.source);
        he.add(index);
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
        if (sourceNode && targetNode) {
          return (
            <Edge
              key={`edge-${edge.source}-${edge.target}-${index}`}
              startNode={sourceNode} // 传递整个节点对象
              endNode={targetNode}   // 传递整个节点对象
              weight={edge.weight}
              isHighlighted={highlightedEdges.has(index)} // 传递高亮状态
            />
          );
        }
        return null;
      })}

      {/* Render Nodes */}
      {nodes.map(node => (
        <Node
          key={`node-${node.index}`}
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

const RiskReport: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredNodeData, setHoveredNodeData] = useState<any>(null); // 存储悬浮节点信息
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }); // Tooltip 位置
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null); // 存储选中节点的索引

  // 节点悬浮处理
  const handleNodeHover = useCallback((nodeData, screenX, screenY) => {
    setHoveredNodeData(nodeData);
    if (nodeData) {
        setTooltipPosition({ x: screenX + 10, y: screenY - 10 }); // 调整 Tooltip 位置
    }
  }, []);

  // 节点点击处理
  const handleNodeClick = useCallback((nodeIndex: number) => {
    setSelectedNodeIndex(prev => (prev === nodeIndex ? null : nodeIndex)); // 点击已选中的节点则取消选中
  }, []);

  // 点击 Canvas 空白处取消选中
  const handleCanvasClick = useCallback(() => {
      if (selectedNodeIndex !== null) {
          //   setSelectedNodeIndex(null); // 取消选中
      }
      // console.log("Canvas clicked");
       // 这里可以添加逻辑，比如如果鼠标没有点在任何node上，则取消选中
       // 但需要更复杂的事件处理来区分节点点击和背景点击
       // 暂时保持简单，点击节点切换选中状态
  }, [selectedNodeIndex]);

   // 获取选中的节点数据
   const selectedNode = selectedNodeIndex !== null ? processedNodes[selectedNodeIndex] : null;

   // 对疾病数据按风险排序，并包含原始索引，用于列表显示
   const sortedDiseaseData = useMemo(() => {
        // 映射原始数据，添加 index
        const indexedData = DiseaseDataInput.map((disease, index) => ({
             ...disease,
             index: index // 添加原始索引
        }));
        // 基于风险排序
        return indexedData.sort((a, b) => b.risk - a.risk);
   }, []);

  // 处理下一步按钮点击
  const handleNext = useCallback(() => {
    window.scrollTo(0, 0);
    navigate('/health-trajectory');
  }, [navigate]);

  return (
    <div className="px-4 relative bg-black text-white flex flex-col h-screen overflow-y-auto">
      <StatusBar />

      {/* Header */}
      <div className="mt-10 px-4 flex justify-between items-center flex-shrink-0">
        <BackButton />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-medium"></h1>
        <div className="w-8"></div> {/* Placeholder */}
      </div>

      {/* Progress Indicator */}
      <div className="mt-10"> {/* 添加上边距，让进度条下移 */}
        <ProgressIndicator currentStep={6} totalSteps={7} />
      </div>

      {/* Main Content Area (Network and Ranking) - 修改为响应式上下布局 */}
      <div className="flex flex-col mt-4 gap-4 pb-6">

        {/* 3D Network Visualization Area - 调整为固定高度 */}
        <div className="h-[60vh] md:h-[65vh] relative rounded-3xl bg-gradient-to-br from-gray-900 via-black to-indigo-900 border border-gray-800 shadow-lg overflow-hidden">
          <h2 className="absolute top-4 left-4 right-4 text-2xl font-bold z-10 text-white bg-black/30 px-3 py-1 rounded-lg flex items-center justify-center">
            <Heart className="text-red-500 mr-2 w-5 h-5" />
            疾病风险网络
          </h2>

           {/* HTML Tooltip */}
            {hoveredNodeData && (
                <div style={{
                    position: 'absolute',
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none', // 重要：允许事件穿透
                    transform: 'translateY(-100%)', // 显示在鼠标上方
                    zIndex: 1000, // 确保在最上层
                    fontFamily: 'sans-serif'
                 }}>
                    {hoveredNodeData.name} (风险: {(hoveredNodeData.risk * 100).toFixed(1)}%)
                 </div>
            )}

            {/* Selection Info Panel */}
            {selectedNode && (
                 <div className="absolute bottom-4 left-4 z-10 bg-black/50 p-3 rounded-lg text-sm shadow-md max-w-xs">
                    <h4 className="font-semibold mb-1 text-base" style={{color: selectedNode.color}}>{selectedNode.name}</h4>
                    <p><span className="font-medium">风险等级:</span> <span className="text-yellow-400 font-bold">{(selectedNode.risk * 100).toFixed(1)}%</span></p>
                    <p><span className="font-medium">类别:</span> {selectedNode.category}</p>
                    {/* 可以添加更多信息 */}
                     <button
                        onClick={() => setSelectedNodeIndex(null)}
                        className="mt-2 text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                    >
                         清除选择
                     </button>
                 </div>
             )}


    <Canvas
      camera={{ position: [0, 0, NETWORK_RADIUS * 2.2], fov: 50 }} // 调整相机位置和视野
      style={{ background: 'transparent' }} // 画布背景透明，由父 div 控制渐变
      onClick={handleCanvasClick} // 点击画布空白处
    >
      {/* 光照设置 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 8]} intensity={1.0} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#ffdddd" />
      <hemisphereLight args={["#ffffff", "#555555", 0.3]} />
      {/* <fog attach="fog" args={['#0a0a1a', NETWORK_RADIUS * 1.5, NETWORK_RADIUS * 3]} /> */}

       <NetworkContainer>
         <NetworkGraph
             nodes={processedNodes}
             edges={processedEdges}
             onNodeHover={handleNodeHover}
             onNodeClick={handleNodeClick}
             selectedNodeIndex={selectedNodeIndex} // 传递选中节点索引
         />
       </NetworkContainer>

      {/* 交互控制 */}
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={3} maxDistance={NETWORK_RADIUS * 3} />
    </Canvas>
  </div>

  {/* Disease Risk Ranking Area - 修改为全部显示，不使用滚动条 */}
  <div className="bg-gray-900 rounded-3xl p-4 shadow-lg border border-gray-800">
    <h3 className="text-lg font-semibold mb-3 text-white text-center">疾病风险排名</h3>
    <div>
      {/* Header Row */}
      <div className="grid grid-cols-12 text-sm font-medium text-gray-400 mb-2 sticky top-0 bg-gray-900 py-1">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-7">疾病名称</div>
        <div className="col-span-4 text-right pr-2">风险值</div>
      </div>
      {/* Data Rows */}
      {sortedDiseaseData.map((disease, index) => (
        <div
          key={disease.id}
          className={`grid grid-cols-12 text-sm py-2 px-2 ${selectedNodeIndex === disease.index ? 'bg-indigo-800/60 ring-1 ring-indigo-500' : (index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/50')} rounded-lg mb-1 items-center transition-colors duration-200 cursor-pointer hover:bg-gray-700/70`}
          onClick={() => handleNodeClick(disease.index)} // 点击列表项也能选中节点
        >
          <div className={`col-span-1 font-bold text-center ${selectedNodeIndex === disease.index ? 'text-white' : 'text-gray-400'}`}>{index + 1}</div>
          <div className={`col-span-7 ${selectedNodeIndex === disease.index ? 'text-white font-medium' : 'text-gray-200'}`}>{disease.name}</div>
          <div className={`col-span-4 text-right font-mono pr-2 ${selectedNodeIndex === disease.index ? 'text-yellow-300 font-bold' : 'text-yellow-400'}`}>
            {(disease.risk * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  {/* 下一步按钮 - 移出了上面的flex容器，现在是独立的 */}
  <div className="flex justify-center mt-4 mb-8">
    <button 
        onClick={handleNext}
        className="primary-button"
      >
        下一步
      </button>
  </div>

    </div>
  );
};

export default RiskReport;
