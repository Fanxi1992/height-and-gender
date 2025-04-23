import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { Search, ShoppingCart, Menu, X, Users, Medal, TicketPercent, Star, Zap, Gift, Clock, Award, Sparkles, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHeight, getWeight, getGender } from '../utils/storage';

// 商品分类
const categoryList = [
  { id: 1, name: '好物推荐', active: true },
  { id: 2, name: '膳食管理', active: false },
  { id: 3, name: '健康生活', active: false },
  { id: 4, name: '健身设备', active: false },
  { id: 5, name: '运动服饰', active: false },
  { id: 6, name: '健康监测', active: false },
  { id: 7, name: '营养补充', active: false },
  { id: 8, name: '睡眠辅助', active: false },
  { id: 9, name: '康复器材', active: false },
  { id: 10, name: '居家保健', active: false },
];

// 商品数据 - 添加积分兑换和社交价格
const productList = [
  {
    id: 1,
    name: 'TEAUS果蔬纤维代餐',
    price: 68,
    pointsPrice: 680,
    groupPrice: 58,
    groupSize: 3,
    sales: 58,
    image: 'https://img.freepik.com/free-photo/green-detox-smoothie-bowl-with-kiwi-berries-superfoods_53876-149997.jpg',
    tags: ['高纤维', '低热量'],
    size: 'medium',
    category: ['膳食管理', '好物推荐'],
    discount: 15,
    activeGroupBuying: 2
  },
  {
    id: 2,
    name: '万益即食益生菌组合',
    price: 208,
    pointsPrice: 1980,
    groupPrice: 168,
    groupSize: 5,
    sales: 118,
    image: 'https://img.freepik.com/free-photo/gut-healthy-foods-composition_23-2148982284.jpg',
    tags: ['益生菌', '肠道健康'],
    size: 'large',
    hot: true,
    category: ['膳食管理', '营养补充'],
    discount: 20,
    activeGroupBuying: 4
  },
  {
    id: 3,
    name: '10kg室内居家哑铃组',
    price: 80,
    sales: 16,
    image: 'https://img.freepik.com/free-photo/workout-gym-with-kettlebell-dumbbell-weights_482257-12955.jpg',
    tags: ['居家健身', '力量训练'],
    size: 'medium',
    category: ['健身设备', '好物推荐']
  },
  {
    id: 4,
    name: 'ATRL运动压缩裤',
    price: 120,
    sales: 67,
    image: 'https://img.freepik.com/free-photo/training-pants-set-still-life_23-2149455130.jpg',
    tags: ['弹力舒适', '速干'],
    size: 'small',
    category: ['运动服饰']
  },
  {
    id: 5,
    name: '有机蛋白粉',
    price: 159,
    sales: 105,
    image: 'https://img.freepik.com/free-photo/protein-powder-wooden-spoon-wooden-table_1150-28707.jpg',
    tags: ['增肌', '植物蛋白'],
    size: 'medium',
    category: ['营养补充', '好物推荐']
  },
  {
    id: 6,
    name: '全谷物早餐麦片',
    price: 56,
    sales: 89,
    image: 'https://img.freepik.com/free-photo/homemade-muesli-with-fruits-ceramic-bowl-healthy-breakfast_114579-85740.jpg',
    tags: ['膳食纤维', '低糖'],
    size: 'small',
    category: ['膳食管理']
  },
  {
    id: 7,
    name: '智能血压监测仪',
    price: 299,
    sales: 45,
    image: 'https://img.freepik.com/free-photo/tonometer-wooden-table_144627-6219.jpg',
    tags: ['精准测量', '数据同步'],
    size: 'medium',
    hot: true,
    category: ['健康监测', '好物推荐']
  },
  {
    id: 8,
    name: '温控助眠枕',
    price: 328,
    sales: 37,
    image: 'https://img.freepik.com/free-photo/pillow-bed-with-room-service-breakfast_23-2149454211.jpg',
    tags: ['记忆棉', '温度调节'],
    size: 'large',
    category: ['睡眠辅助']
  },
  {
    id: 9,
    name: '维生素D3+K2胶囊',
    price: 88,
    sales: 152,
    image: 'https://img.freepik.com/free-photo/vitamin-d-supplements-scattered-wooden-surface-vitamin-d-deficiency-concept_123827-21380.jpg',
    tags: ['骨骼健康', '免疫增强'],
    size: 'small',
    category: ['营养补充']
  },
  {
    id: 10,
    name: '高强度训练弹力带',
    price: 45,
    sales: 76,
    image: 'https://img.freepik.com/free-photo/high-angle-resistance-bands-stacked-wooden-floor_23-2149888034.jpg',
    tags: ['多级阻力', '便携'],
    size: 'medium',
    category: ['健身设备']
  },
  {
    id: 11,
    name: '静音跑步机',
    price: 1599,
    sales: 28,
    image: 'https://img.freepik.com/free-photo/interior-gym-with-treadmill-machine-empty-room_482257-20349.jpg',
    tags: ['家用', '折叠便携'],
    size: 'large',
    category: ['健身设备', '好物推荐']
  },
  {
    id: 12,
    name: '瑜伽垫',
    price: 99,
    sales: 124,
    image: 'https://img.freepik.com/free-photo/high-angle-woman-holding-yoga-mat_23-2149424282.jpg',
    tags: ['环保材质', '防滑'],
    size: 'small',
    category: ['健身设备', '健康生活']
  },
  {
    id: 13,
    name: '健康代餐奶昔',
    price: 128,
    sales: 95,
    image: 'https://img.freepik.com/free-photo/healthy-breakfast-concept-with-yogurt_23-2147759317.jpg',
    tags: ['低卡', '饱腹感'],
    size: 'medium',
    category: ['膳食管理']
  },
  {
    id: 14,
    name: '运动智能手表',
    price: 499,
    sales: 87,
    image: 'https://img.freepik.com/free-photo/smart-watch-with-fitness-health-tracking-apps-screen_53876-107014.jpg',
    tags: ['心率监测', 'GPS定位'],
    size: 'large',
    hot: true,
    category: ['健康监测', '运动服饰']
  },
  {
    id: 15,
    name: '颈椎按摩仪',
    price: 259,
    sales: 63,
    image: 'https://img.freepik.com/free-photo/woman-getting-neck-massage-from-masseuse_107420-95344.jpg',
    tags: ['热敷', '脉冲按摩'],
    size: 'medium',
    category: ['康复器材', '健康生活']
  },
  {
    id: 16,
    name: '健身环',
    price: 149,
    sales: 55,
    image: 'https://img.freepik.com/free-photo/pilates-ring-pink-background_53876-133613.jpg',
    tags: ['全身锻炼', '游戏互动'],
    size: 'small',
    category: ['健身设备']
  },
  {
    id: 17,
    name: '有机坚果礼盒',
    price: 168,
    sales: 77,
    image: 'https://img.freepik.com/free-photo/various-nuts-composition-dark-stone-table_114579-76361.jpg',
    tags: ['原味', '无添加'],
    size: 'medium',
    category: ['健康生活', '膳食管理']
  },
  {
    id: 18,
    name: '冷压椰子油',
    price: 78,
    sales: 94,
    image: 'https://img.freepik.com/free-photo/coconut-oil-coconut-fruit-old-wooden-table_1150-12571.jpg',
    tags: ['护肤', '烹饪'],
    size: 'small',
    category: ['居家保健', '膳食管理']
  },
  {
    id: 19,
    name: '负离子空气净化器',
    price: 899,
    sales: 41,
    image: 'https://img.freepik.com/free-photo/appliance-purifies-air-living-room-home-digital-clean-environment_53876-134276.jpg',
    tags: ['除甲醛', '智能控制'],
    size: 'large',
    category: ['居家保健', '好物推荐']
  },
  {
    id: 20,
    name: '运动腰包',
    price: 49,
    sales: 118,
    image: 'https://img.freepik.com/free-photo/sport-fanny-pack-blue-background_125540-3377.jpg',
    tags: ['防水', '轻便'],
    size: 'small',
    category: ['运动服饰']
  },
  {
    id: 21,
    name: '膳食纤维粉',
    price: 108,
    sales: 86,
    image: 'https://img.freepik.com/free-photo/close-up-dietary-fiber-powder-bowls_23-2148857792.jpg',
    tags: ['肠道健康', '排毒'],
    size: 'medium',
    category: ['膳食管理', '营养补充']
  },
  {
    id: 22,
    name: '瑜伽球',
    price: 65,
    sales: 72,
    image: 'https://img.freepik.com/free-photo/medium-shot-woman-sitting-fitness-ball_23-2148236721.jpg',
    tags: ['平衡训练', '防爆'],
    size: 'large',
    category: ['健身设备', '健康生活']
  },
  {
    id: 23,
    name: '防蓝光眼镜',
    price: 129,
    sales: 66,
    image: 'https://img.freepik.com/free-photo/pair-eyeglasses-table_23-2147729698.jpg',
    tags: ['护眼', '时尚'],
    size: 'small',
    category: ['居家保健', '健康生活']
  },
  {
    id: 24,
    name: '便携按摩棒',
    price: 189,
    sales: 59,
    image: 'https://img.freepik.com/free-photo/woman-visiting-masseur-clinic_1303-26251.jpg',
    tags: ['肌肉放松', '筋膜松解'],
    size: 'medium',
    hot: true,
    category: ['康复器材', '健康生活']
  },
  {
    id: 25,
    name: '有机蓝莓',
    price: 68,
    sales: 112,
    image: 'https://img.freepik.com/free-photo/dried-blueberries-wooden-bowl-table_114579-72682.jpg',
    tags: ['抗氧化', '护眼'],
    size: 'small',
    category: ['膳食管理', '营养补充']
  },
  {
    id: 26,
    name: '可折叠水壶',
    price: 39,
    sales: 83,
    image: 'https://img.freepik.com/free-photo/plastic-sport-bottle-with-water_93675-132551.jpg',
    tags: ['便携', '食品级硅胶'],
    size: 'medium',
    category: ['健康生活', '运动服饰']
  },
  {
    id: 27,
    name: '足底按摩垫',
    price: 145,
    sales: 44,
    image: 'https://img.freepik.com/free-photo/foot-massage-stones-mat_23-2148270039.jpg',
    tags: ['穴位按摩', '促进血液循环'],
    size: 'large',
    category: ['康复器材', '居家保健']
  },
  {
    id: 28,
    name: '运动护膝',
    price: 58,
    sales: 126,
    image: 'https://img.freepik.com/free-photo/leg-warming-device-side-view_23-2149080416.jpg',
    tags: ['防护', '减震'],
    size: 'small',
    category: ['运动服饰', '健身设备']
  },
  {
    id: 29,
    name: '植物蛋白能量棒',
    price: 78,
    sales: 97,
    image: 'https://img.freepik.com/free-photo/stack-colorful-energy-bars-with-nuts-seeds-dried-fruits-wooden-cutting-board-healthy-snack-concept_114579-78271.jpg',
    tags: ['运动补给', '低糖'],
    size: 'medium',
    category: ['营养补充', '健康生活']
  },
  {
    id: 30,
    name: '光疗助眠仪',
    price: 259,
    sales: 38,
    image: 'https://img.freepik.com/free-photo/composition-spa-elements-with-candles_23-2148282227.jpg',
    tags: ['改善睡眠', '智能定时'],
    size: 'large',
    category: ['睡眠辅助', '居家保健']
  },
];

// 按照瀑布流布局排列商品
const arrangeProducts = (products: any[]) => {
  const leftColumn: any[] = [];
  const rightColumn: any[] = [];
  
  products.forEach((product, index) => {
    if (index % 2 === 0) {
      leftColumn.push(product);
    } else {
      rightColumn.push(product);
    }
  });
  
  return { leftColumn, rightColumn };
};

// 用户会员和积分数据
const userPointsInfo = {
  points: 2580,
  level: 3,
  levelName: "活力会员",
  teamDiscount: 5, // 百分比
  nextLevelPoints: 5000,
  progress: 52, // 百分比
  teamMembers: 5,
  achievements: ["完成减脂挑战", "连续打卡30天", "推荐5位好友"],
};

// 推荐积分兑换商品
const recommendedPointsProducts = [
  {
    id: 101,
    name: '有机蛋白能量棒',
    pointsPrice: 580,
    originalPrice: 78,
    image: 'https://img.freepik.com/free-photo/stack-colorful-energy-bars-with-nuts-seeds-dried-fruits-wooden-cutting-board-healthy-snack-concept_114579-78271.jpg',
    limited: true,
    remaining: 12
  },
  {
    id: 102,
    name: '便携按摩棒',
    pointsPrice: 1200,
    originalPrice: 189,
    image: 'https://img.freepik.com/free-photo/woman-visiting-masseur-clinic_1303-26251.jpg',
    limited: false
  },
  {
    id: 103,
    name: '运动腰包',
    pointsPrice: 360,
    originalPrice: 49,
    image: 'https://img.freepik.com/free-photo/sport-fanny-pack-blue-background_125540-3377.jpg',
    limited: true,
    remaining: 5
  }
];

// 限时团购活动
const groupBuyingEvents = [
  {
    id: 201,
    name: '负离子空气净化器',
    originalPrice: 899,
    groupPrice: 599,
    discount: 33,
    minGroupSize: 3,
    currentParticipants: 2,
    endTime: new Date(Date.now() + 34 * 60 * 60 * 1000), // 34小时后
    image: 'https://img.freepik.com/free-photo/appliance-purifies-air-living-room-home-digital-clean-environment_53876-134276.jpg',
  },
  {
    id: 202,
    name: '运动智能手表',
    originalPrice: 499,
    groupPrice: 359,
    discount: 28,
    minGroupSize: 5,
    currentParticipants: 3,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12小时后
    image: 'https://img.freepik.com/free-photo/smart-watch-with-fitness-health-tracking-apps-screen_53876-107014.jpg',
  }
];

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState(categoryList);
  const [products, setProducts] = useState(productList);
  const [filteredProducts, setFilteredProducts] = useState(productList);
  const { leftColumn, rightColumn } = arrangeProducts(filteredProducts);
  const [activeTab, setActiveTab] = useState('shopping'); // shopping, points, groupBuy
  
  // 处理分类点击
  const handleCategoryClick = (id: number) => {
    const updatedCategories = categories.map(category => ({
      ...category,
      active: category.id === id
    }));
    setCategories(updatedCategories);

    // 根据选中的分类筛选商品
    const selectedCategory = categories.find(category => category.id === id);
    if (selectedCategory) {
      if (selectedCategory.name === '好物推荐') {
        // 好物推荐展示所有商品
        setFilteredProducts(products);
      } else {
        // 筛选包含当前分类的商品
        const filtered = products.filter(product => 
          product.category.includes(selectedCategory.name)
        );
        setFilteredProducts(filtered);
      }
    }
    
    // 重置搜索
    setSearchValue('');
    setIsSearchActive(false);
  };

  // 处理滚动分类
  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      categoriesRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 回到主页
  const goToHome = () => {
    navigate('/home');
  };

  // 获取商品大小对应的高度类名
  const getProductHeightClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'h-48';
      case 'medium':
        return 'h-64';
      case 'large':
        return 'h-80';
      default:
        return 'h-64';
    }
  };
  
  // 搜索关键词计算相似度评分 (用于排序)
  const calculateRelevanceScore = (product: any, keyword: string) => {
    if (!keyword) return 0;
    
    const lowercaseKeyword = keyword.toLowerCase();
    let score = 0;
    
    // 名称匹配得分
    const nameLower = product.name.toLowerCase();
    if (nameLower === lowercaseKeyword) {
      score += 100; // 完全匹配名称
    } else if (nameLower.startsWith(lowercaseKeyword)) {
      score += 80; // 名称开头匹配
    } else if (nameLower.includes(lowercaseKeyword)) {
      score += 60; // 名称包含关键词
    }
    
    // 标签匹配得分
    const matchingTags = product.tags.filter((tag: string) => 
      tag.toLowerCase().includes(lowercaseKeyword)
    );
    score += matchingTags.length * 40; // 每个匹配标签加分
    
    // 完全匹配标签额外加分
    const exactMatchTags = product.tags.filter((tag: string) => 
      tag.toLowerCase() === lowercaseKeyword
    );
    score += exactMatchTags.length * 30;
    
    // 类别匹配得分
    const matchingCategories = product.category.filter((cat: string) => 
      cat.toLowerCase().includes(lowercaseKeyword)
    );
    score += matchingCategories.length * 20;
    
    // 热门商品加分
    if (product.hot) {
      score += 15;
    }
    
    // 销量影响 (热销商品略微提升排名)
    score += Math.min(product.sales / 10, 10);
    
    return score;
  };
  
  // 处理搜索
  const handleSearch = () => {
    if (!searchValue.trim()) {
      // 如果搜索框为空，恢复到原有分类筛选结果
      const activeCategory = categories.find(category => category.active);
      if (activeCategory) {
        handleCategoryClick(activeCategory.id);
      }
      setIsSearchActive(false);
      return;
    }
    
    setIsSearchActive(true);
    
    // 获取所有可能匹配的商品
    const searchResults = products.filter(product => {
      const keyword = searchValue.toLowerCase();
      
      // 检查商品名称是否包含关键词
      const nameMatches = product.name.toLowerCase().includes(keyword);
      
      // 检查标签是否包含关键词
      const tagMatches = product.tags.some((tag: string) => 
        tag.toLowerCase().includes(keyword)
      );
      
      // 检查分类是否包含关键词
      const categoryMatches = product.category.some((cat: string) => 
        cat.toLowerCase().includes(keyword)
      );
      
      return nameMatches || tagMatches || categoryMatches;
    });
    
    // 计算每个商品的相关性得分并排序
    const scoredProducts = searchResults.map(product => ({
      ...product,
      relevanceScore: calculateRelevanceScore(product, searchValue)
    }));
    
    // 按照相关性得分降序排序
    const sortedProducts = scoredProducts.sort((a, b) => 
      b.relevanceScore - a.relevanceScore
    );
    
    setFilteredProducts(sortedProducts);
  };
  
  // 清除搜索
  const clearSearch = () => {
    setSearchValue('');
    setIsSearchActive(false);
    
    // 恢复到活跃分类的筛选结果
    const activeCategory = categories.find(category => category.active);
    if (activeCategory) {
      handleCategoryClick(activeCategory.id);
    }
  };
  
  // 监听搜索输入变化，实时更新搜索结果
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchValue) {
        handleSearch();
      }
    }, 300); // 300ms防抖
    
    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  // 根据用户性别生成个性化商品推荐
  const getPersonalizedRecommendations = () => {
    const gender = getGender();
    const weight = getWeight();
    
    let personalizedProducts = [...products];
    
    if (gender === 'female') {
      personalizedProducts = personalizedProducts.filter(product => 
        product.category.includes('膳食管理') || 
        product.category.includes('健康生活') || 
        product.tags.includes('低热量')
      ).slice(0, 6);
    } else {
      personalizedProducts = personalizedProducts.filter(product => 
        product.category.includes('健身设备') || 
        product.category.includes('运动服饰') || 
        product.tags.includes('增肌')
      ).slice(0, 6);
    }
    
    return personalizedProducts;
  };
  
  // 格式化剩余时间
  const formatRemainingTime = (endTime: Date) => {
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();
    if (diffMs <= 0) return "已结束";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}小时${minutes}分钟`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white relative">
      <StatusBar />
      
      {/* 顶部导航栏 */}
      <div className="w-full px-4 py-2 flex justify-between items-center mt-6">
        <Menu size={24} />
        <h1 className="text-xl font-medium">健康商城</h1>
        <div className="relative">
          <ShoppingCart size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px]">
            8
          </div>
        </div>
      </div>
      
      {/* 用户会员积分信息 - 新增 */}
      <div className="mx-4 my-3 p-3 bg-gradient-to-r from-purple-700 to-blue-600 rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Medal size={20} className="text-purple-900" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-bold">{userPointsInfo.levelName}</div>
              <div className="text-xs opacity-80">LV{userPointsInfo.level} · {userPointsInfo.teamMembers}人团队</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm font-bold flex items-center">
              <Star size={16} className="mr-1 text-yellow-400" fill="currentColor" />
              {userPointsInfo.points} 积分
            </div>
            <div className="text-xs opacity-80">团队折扣 {userPointsInfo.teamDiscount}%</div>
          </div>
        </div>
        <div className="mt-2 w-full">
          <div className="text-xs flex justify-between mb-1">
            <span>当前进度</span>
            <span>{userPointsInfo.points}/{userPointsInfo.nextLevelPoints}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300" 
              style={{width: `${userPointsInfo.progress}%`}}
            ></div>
          </div>
        </div>
      </div>
      
      {/* 商城选项卡 - 新增 */}
      <div className="flex mx-4 mb-3 bg-gray-800 rounded-lg overflow-hidden">
        <button 
          className={cn(
            "flex-1 py-2 text-sm font-medium",
            activeTab === 'shopping' ? "bg-blue-600 text-white" : "text-gray-300"
          )}
          onClick={() => setActiveTab('shopping')}
        >
          商品购买
        </button>
        <button 
          className={cn(
            "flex-1 py-2 text-sm font-medium",
            activeTab === 'points' ? "bg-blue-600 text-white" : "text-gray-300"
          )}
          onClick={() => setActiveTab('points')}
        >
          积分兑换
        </button>
        <button 
          className={cn(
            "flex-1 py-2 text-sm font-medium",
            activeTab === 'groupBuy' ? "bg-blue-600 text-white" : "text-gray-300"
          )}
          onClick={() => setActiveTab('groupBuy')}
        >
          限时拼团
        </button>
      </div>
      
      {/* 分类导航 - 仅在商品购买选项卡显示 */}
      {activeTab === 'shopping' && (
        <div className="relative w-full mb-4">
          <div 
            ref={categoriesRef}
            className="flex overflow-x-scroll no-scrollbar px-4 py-2 space-x-2"
          >
            {categories.map((category) => (
              <div 
                key={category.id}
                className={cn(
                  "px-4 py-2 rounded-full whitespace-nowrap text-sm cursor-pointer",
                  category.active 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-black"
                )}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 搜索状态提示 */}
      {isSearchActive && activeTab === 'shopping' && (
        <div className="px-4 flex items-center mb-2">
          <div className="flex-1 text-sm text-blue-400">
            搜索: "{searchValue}" ({filteredProducts.length} 个结果)
          </div>
          <button 
            onClick={clearSearch}
            className="flex items-center text-xs text-gray-400"
          >
            <X size={14} className="mr-1" />
            清除搜索
          </button>
        </div>
      )}
      
      {/* 商品列表 - 商品购买选项卡 */}
      {activeTab === 'shopping' && (
        <div className="flex-1 overflow-y-auto px-2 pb-24">
          {!isSearchActive && (
            <div className="p-2 mb-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                <h2 className="text-lg font-bold mb-1">团队购物特惠</h2>
                <p className="text-sm opacity-90 mb-3">组队购物，额外享{userPointsInfo.teamDiscount}%折扣</p>
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[...Array(Math.min(3, userPointsInfo.teamMembers))].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full bg-white border-2 border-purple-600 -ml-2 first:ml-0 overflow-hidden"
                      >
                        <img 
                          src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 30}.jpg`}
                          alt="Team member"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {userPointsInfo.teamMembers > 3 && (
                      <div className="w-8 h-8 rounded-full bg-purple-800 border-2 border-purple-600 -ml-2 flex items-center justify-center text-xs">
                        +{userPointsInfo.teamMembers - 3}
                      </div>
                    )}
                  </div>
                  <button className="bg-white text-purple-600 rounded-full px-4 py-1 text-sm font-medium">
                    邀请好友
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {filteredProducts.length > 0 ? (
            <div className="flex space-x-2">
              {/* 左列 */}
              <div className="w-1/2 flex flex-col space-y-2">
                {leftColumn.map((product) => (
                  <div 
                    key={product.id}
                    className={cn(
                      "bg-white rounded-xl overflow-hidden relative",
                      getProductHeightClass(product.size)
                    )}
                  >
                    {product.hot && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        爆品
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Percent size={10} className="mr-0.5" />
                        {product.discount}%
                      </div>
                    )}
                    <div className="w-full h-2/3 bg-gray-200 relative overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="text-black font-medium text-sm line-clamp-1">{product.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags.map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className={cn(
                              "text-[10px] bg-purple-100 text-purple-500 rounded-full px-2 py-0.5",
                              searchValue && tag.toLowerCase().includes(searchValue.toLowerCase()) && "bg-blue-100 text-blue-600"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-purple-500 font-semibold">
                          ¥{product.groupPrice} <span className="text-xs">起</span>
                          {product.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through ml-1">¥{product.price}</span>
                          )}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <span className="text-sm">
                            <ShoppingCart size={14} className="inline-block mr-1" />
                            {product.sales}
                          </span>
                        </div>
                      </div>
                      {product.activeGroupBuying > 0 && (
                        <div className="mt-1 flex items-center">
                          <div className="text-[10px] bg-red-100 text-red-500 rounded-full px-2 py-0.5 flex items-center">
                            <Users size={10} className="mr-0.5" />
                            {product.activeGroupBuying}人正在拼团
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 右列 */}
              <div className="w-1/2 flex flex-col space-y-2">
                {rightColumn.map((product) => (
                  <div 
                    key={product.id}
                    className={cn(
                      "bg-white rounded-xl overflow-hidden relative",
                      getProductHeightClass(product.size)
                    )}
                  >
                    {product.hot && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        爆品
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Percent size={10} className="mr-0.5" />
                        {product.discount}%
                      </div>
                    )}
                    <div className="w-full h-2/3 bg-gray-200 relative overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="text-black font-medium text-sm line-clamp-1">{product.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags.map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className={cn(
                              "text-[10px] bg-purple-100 text-purple-500 rounded-full px-2 py-0.5",
                              searchValue && tag.toLowerCase().includes(searchValue.toLowerCase()) && "bg-blue-100 text-blue-600"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-purple-500 font-semibold">
                          ¥{product.groupPrice} <span className="text-xs">起</span>
                          {product.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through ml-1">¥{product.price}</span>
                          )}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <span className="text-sm">
                            <ShoppingCart size={14} className="inline-block mr-1" />
                            {product.sales}
                          </span>
                        </div>
                      </div>
                      {product.activeGroupBuying > 0 && (
                        <div className="mt-1 flex items-center">
                          <div className="text-[10px] bg-red-100 text-red-500 rounded-full px-2 py-0.5 flex items-center">
                            <Users size={10} className="mr-0.5" />
                            {product.activeGroupBuying}人正在拼团
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Search size={40} strokeWidth={1} className="mb-2" />
              <p>未找到与 "{searchValue}" 相关的商品</p>
              <button 
                onClick={clearSearch}
                className="mt-2 text-blue-400 text-sm"
              >
                清除搜索
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 积分兑换选项卡 */}
      {activeTab === 'points' && (
        <div className="flex-1 overflow-y-auto px-2 pb-24">
          {/* 积分兑换头部信息 */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl p-4 text-white mx-2 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Star size={18} className="mr-1" fill="currentColor" />
                <span className="text-lg font-bold">{userPointsInfo.points}</span>
              </div>
              <button className="text-xs bg-white/25 rounded-full px-3 py-1">积分明细</button>
            </div>
            <div className="flex justify-between text-xs text-white/90">
              <div>下月到期: 120积分</div>
              <div>本月已用: 320积分</div>
            </div>
          </div>
          
          {/* 积分任务 */}
          <div className="px-2 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold flex items-center">
                <Zap size={18} className="mr-1 text-yellow-500" />
                积分任务
              </h3>
              <span className="text-xs text-blue-400">全部任务</span>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                    <Clock size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">每日签到</div>
                    <div className="text-xs text-gray-400">连续签到额外奖励</div>
                  </div>
                </div>
                <button className="text-xs bg-blue-600 text-white rounded-full px-3 py-1">
                  +5分
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-3">
                    <Users size={16} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">邀请好友</div>
                    <div className="text-xs text-gray-400">每邀请1位好友</div>
                  </div>
                </div>
                <button className="text-xs bg-green-600 text-white rounded-full px-3 py-1">
                  +50分
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                    <Award size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">完成挑战</div>
                    <div className="text-xs text-gray-400">参与并完成团队挑战</div>
                  </div>
                </div>
                <button className="text-xs bg-purple-600 text-white rounded-full px-3 py-1">
                  +100分
                </button>
              </div>
            </div>
          </div>
          
          {/* 热门积分兑换 */}
          <div className="px-2 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold flex items-center">
                <Gift size={18} className="mr-1 text-red-500" />
                热门兑换
              </h3>
              <span className="text-xs text-blue-400">更多</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recommendedPointsProducts.map(product => (
                <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-32 object-cover"
                    />
                    {product.limited && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        仅剩{product.remaining}件
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star size={12} className="text-yellow-500 mr-1" fill="currentColor" />
                      <span className="text-sm font-bold">{product.pointsPrice}</span>
                      <span className="text-xs ml-1">积分</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">原价: ¥{product.originalPrice}</span>
                      <button className="text-xs bg-blue-600 text-white rounded-full px-3 py-1">
                        兑换
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 个性化推荐 */}
          <div className="px-2 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold flex items-center">
                <Sparkles size={18} className="mr-1 text-purple-400" />
                为你推荐
              </h3>
            </div>
            <div className="space-y-3">
              {getPersonalizedRecommendations().slice(0, 3).map(product => (
                <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden flex">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="p-2 flex-1">
                    <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.slice(0, 2).map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="text-[10px] bg-gray-700 text-gray-300 rounded-full px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <div className="text-sm text-purple-400 font-bold">
                          {product.pointsPrice} <span className="text-xs">积分</span>
                        </div>
                        <div className="text-xs text-gray-400">现金价: ¥{product.price}</div>
                      </div>
                      <button className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-3 py-1">
                        兑换
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 限时拼团选项卡 */}
      {activeTab === 'groupBuy' && (
        <div className="flex-1 overflow-y-auto px-2 pb-24">
          {/* 拼团活动倒计时 */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-4 text-white mx-2 mb-4">
            <div className="flex items-center mb-2">
              <TicketPercent size={20} className="mr-2" />
              <h3 className="text-lg font-bold">限时拼团优惠</h3>
            </div>
            <p className="text-sm opacity-80 mb-3">组队购买，享受超低团购价！</p>
            <div className="flex justify-between items-center">
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs">
                每日限量 · 先到先得
              </div>
              <div className="text-xs">
                更新倒计时: <span className="font-bold">05:36:18</span>
              </div>
            </div>
          </div>
          
          {/* 进行中的拼团 */}
          <div className="px-2 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold flex items-center">
                <Zap size={18} className="mr-1 text-yellow-500" />
                进行中的拼团
              </h3>
              <span className="text-xs text-blue-400">查看全部</span>
            </div>
            
            <div className="space-y-3">
              {groupBuyingEvents.map(event => (
                <div key={event.id} className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="flex">
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className="w-28 h-28 object-cover"
                    />
                    <div className="p-3 flex-1">
                      <h3 className="text-sm font-medium line-clamp-2">{event.name}</h3>
                      <div className="flex items-baseline mt-1">
                        <div className="text-base text-red-500 font-bold">¥{event.groupPrice}</div>
                        <div className="text-xs text-gray-400 line-through ml-2">¥{event.originalPrice}</div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-400">
                          还差{event.minGroupSize - event.currentParticipants}人成团
                        </div>
                        <div className="text-xs text-yellow-400">
                          剩余{formatRemainingTime(event.endTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="flex items-center">
                      <div className="flex flex-1">
                        {[...Array(event.currentParticipants)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-800 -ml-1 first:ml-0"
                          >
                            <img 
                              src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 20}.jpg`}
                              alt="Participant"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {[...Array(event.minGroupSize - event.currentParticipants)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 -ml-1 flex items-center justify-center"
                          >
                            <span className="text-xs text-gray-400">?</span>
                          </div>
                        ))}
                      </div>
                      <button className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm rounded-full px-4 py-1.5">
                        去拼团
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 往期热卖拼团 */}
          <div className="px-2 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold">往期热卖</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {getPersonalizedRecommendations().slice(0, 4).map(product => (
                <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden pb-2">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-black/30 flex items-center justify-center">
                      <div className="bg-red-500/80 text-white text-xs px-3 py-1 rounded">
                        已结束
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                    <div className="flex items-baseline mt-1">
                      <div className="text-sm text-gray-300 font-bold">¥{product.groupPrice}</div>
                      <div className="text-xs text-gray-400 line-through ml-2">¥{product.price}</div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-gray-400">
                        上期成团: {product.sales}人
                      </div>
                      <button className="text-xs bg-gray-700 text-gray-300 rounded-full px-3 py-1">
                        提醒我
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 底部搜索框 */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3">
        <div className="bg-gray-100 rounded-full flex items-center px-4 py-3">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="搜索商品，更快实现目标"
            className="bg-transparent text-gray-800 text-sm w-full focus:outline-none"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button onClick={clearSearch}>
              <X size={18} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center text-gray-500" onClick={goToHome}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={() => navigate('/knowledge-base')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <span className="text-xs">知识库</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={() => navigate('/circle')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span className="text-xs">聊天室</span>
        </div>
        <div className="flex flex-col items-center text-white" onClick={() => navigate('/shop')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span className="text-xs">商城</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={() => navigate('/my')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </div>
      </div>
    </div>
  );
};

export default Shop;

