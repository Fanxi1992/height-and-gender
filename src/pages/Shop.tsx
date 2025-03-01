import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

// 商品分类
const categories = [
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

// 商品数据
const products = [
  {
    id: 1,
    name: 'TEAUS果蔬纤维代餐',
    price: 68,
    sales: 58,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['高纤维', '低热量'],
    size: 'medium'
  },
  {
    id: 2,
    name: '万益即食益生菌组合',
    price: 208,
    sales: 118,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['益生菌', '肠道健康'],
    size: 'large',
    hot: true
  },
  {
    id: 3,
    name: '10kg室内居家哑铃组',
    price: 80,
    sales: 16,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['居家健身', '力量训练'],
    size: 'medium'
  },
  {
    id: 4,
    name: 'ATRL运动压缩裤',
    price: 120,
    sales: 67,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['弹力舒适', '速干'],
    size: 'small'
  },
  {
    id: 5,
    name: '有机蛋白粉',
    price: 159,
    sales: 105,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['增肌', '植物蛋白'],
    size: 'medium'
  },
  {
    id: 6,
    name: '全谷物早餐麦片',
    price: 56,
    sales: 89,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['膳食纤维', '低糖'],
    size: 'small'
  },
  {
    id: 7,
    name: '智能血压监测仪',
    price: 299,
    sales: 45,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['精准测量', '数据同步'],
    size: 'medium',
    hot: true
  },
  {
    id: 8,
    name: '温控助眠枕',
    price: 328,
    sales: 37,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['记忆棉', '温度调节'],
    size: 'large'
  },
  {
    id: 9,
    name: '维生素D3+K2胶囊',
    price: 88,
    sales: 152,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['骨骼健康', '免疫增强'],
    size: 'small'
  },
  {
    id: 10,
    name: '高强度训练弹力带',
    price: 45,
    sales: 76,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['多级阻力', '便携'],
    size: 'medium'
  },
  {
    id: 11,
    name: '静音跑步机',
    price: 1599,
    sales: 28,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['家用', '折叠便携'],
    size: 'large'
  },
  {
    id: 12,
    name: '瑜伽垫',
    price: 99,
    sales: 124,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['环保材质', '防滑'],
    size: 'small'
  },
  {
    id: 13,
    name: '健康代餐奶昔',
    price: 128,
    sales: 95,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['低卡', '饱腹感'],
    size: 'medium'
  },
  {
    id: 14,
    name: '运动智能手表',
    price: 499,
    sales: 87,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['心率监测', 'GPS定位'],
    size: 'large',
    hot: true
  },
  {
    id: 15,
    name: '颈椎按摩仪',
    price: 259,
    sales: 63,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['热敷', '脉冲按摩'],
    size: 'medium'
  },
  {
    id: 16,
    name: '健身环',
    price: 149,
    sales: 55,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['全身锻炼', '游戏互动'],
    size: 'small'
  },
  {
    id: 17,
    name: '有机坚果礼盒',
    price: 168,
    sales: 77,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['原味', '无添加'],
    size: 'medium'
  },
  {
    id: 18,
    name: '冷压椰子油',
    price: 78,
    sales: 94,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['护肤', '烹饪'],
    size: 'small'
  },
  {
    id: 19,
    name: '负离子空气净化器',
    price: 899,
    sales: 41,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['除甲醛', '智能控制'],
    size: 'large'
  },
  {
    id: 20,
    name: '运动腰包',
    price: 49,
    sales: 118,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['防水', '轻便'],
    size: 'small'
  },
  {
    id: 21,
    name: '膳食纤维粉',
    price: 108,
    sales: 86,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['肠道健康', '排毒'],
    size: 'medium'
  },
  {
    id: 22,
    name: '瑜伽球',
    price: 65,
    sales: 72,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['平衡训练', '防爆'],
    size: 'large'
  },
  {
    id: 23,
    name: '防蓝光眼镜',
    price: 129,
    sales: 66,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['护眼', '时尚'],
    size: 'small'
  },
  {
    id: 24,
    name: '便携按摩棒',
    price: 189,
    sales: 59,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['肌肉放松', '筋膜松解'],
    size: 'medium',
    hot: true
  },
  {
    id: 25,
    name: '有机蓝莓干',
    price: 68,
    sales: 112,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['抗氧化', '护眼'],
    size: 'small'
  },
  {
    id: 26,
    name: '可折叠水壶',
    price: 39,
    sales: 83,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['便携', '食品级硅胶'],
    size: 'medium'
  },
  {
    id: 27,
    name: '足底按摩垫',
    price: 145,
    sales: 44,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['穴位按摩', '促进血液循环'],
    size: 'large'
  },
  {
    id: 28,
    name: '运动护膝',
    price: 58,
    sales: 126,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['防护', '减震'],
    size: 'small'
  },
  {
    id: 29,
    name: '植物蛋白能量棒',
    price: 78,
    sales: 97,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['运动补给', '低糖'],
    size: 'medium'
  },
  {
    id: 30,
    name: '光疗助眠仪',
    price: 259,
    sales: 38,
    image: '/lovable-uploads/85300bbb-8da9-4e89-bd78-9f374ae799f3.png',
    tags: ['改善睡眠', '智能定时'],
    size: 'large'
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

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { leftColumn, rightColumn } = arrangeProducts(products);

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
      
      {/* 分类导航 */}
      <div className="relative w-full mt-2 mb-4">
        <div 
          ref={categoriesRef}
          className="flex overflow-x-scroll no-scrollbar px-4 py-2 space-x-2"
        >
          {categories.map((category) => (
            <div 
              key={category.id}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap text-sm",
                category.active 
                  ? "bg-blue-400 text-white" 
                  : "bg-white text-black"
              )}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* 商品列表 - 瀑布流布局 */}
      <div className="flex-1 overflow-y-auto px-2 pb-24">
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
                <div className="w-full h-2/3 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.size === 'medium' && product.id === 1 && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center">
                      <div className="text-2xl font-bold text-black writing-vertical">
                        膳食营养
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-black font-medium text-sm line-clamp-1">{product.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-[10px] bg-purple-100 text-purple-500 rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-purple-500 font-semibold">
                      ¥{product.price} <span className="text-xs">起</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <span className="text-sm">
                        <img 
                          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNob3BwaW5nLWNhcnQiPjxjaXJjbGUgY3g9IjgiIGN5PSIyMSIgcj0iMSIvPjxjaXJjbGUgY3g9IjE5IiBjeT0iMjEiIHI9IjEiLz48cGF0aCBkPSJNMiAyaDQuMTM0YTEgMSAwIDAgMSAuODkuNmwyLjk3NiA2LjM0YTEgMSAwIDAgMCAuODkuNTloMTEuODRhMSAxIDAgMCAxIC44OS42bDEuNDE0IDIuNzFhMSAxIDAgMCAxLS44OSAxLjRIOC4xODRhMSAxIDAgMCAxLS44OS0uNkw0IDQuOVYySDJ6Ii8+PC9zdmc+"
                          alt="cart"
                          className="w-4 h-4 inline-block"
                        />
                        {product.sales}
                      </span>
                    </div>
                  </div>
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
                    {product.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-[10px] bg-purple-100 text-purple-500 rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-purple-500 font-semibold">
                      ¥{product.price} <span className="text-xs">起</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <span className="text-sm">
                        <img 
                          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNob3BwaW5nLWNhcnQiPjxjaXJjbGUgY3g9IjgiIGN5PSIyMSIgcj0iMSIvPjxjaXJjbGUgY3g9IjE5IiBjeT0iMjEiIHI9IjEiLz48cGF0aCBkPSJNMiAyaDQuMTM0YTEgMSAwIDAgMSAuODkuNmwyLjk3NiA2LjM0YTEgMSAwIDAgMCAuODkuNTloMTEuODRhMSAxIDAgMCAxIC44OS42bDEuNDE0IDIuNzFhMSAxIDAgMCAxLS44OSAxLjRIOC4xODRhMSAxIDAgMCAxLS44OS0uNkw0IDQuOVYySDJ6Ii8+PC9zdmc+"
                          alt="cart"
                          className="w-4 h-4 inline-block"
                        />
                        {product.sales}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
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
        </div>
      </div>
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center text-gray-500" onClick={goToHome}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path><path d="M10 2c1 .5 2 2 2 5"></path></svg>
          <span className="text-xs">商城</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z"></path><path d="M6 11V8h12v3"></path></svg>
          <span className="text-xs">社区</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
          <span className="text-xs">我的</span>
        </div>
      </div>
    </div>
  );
};

export default Shop;
