
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import StatusBar from '../components/StatusBar';

// 产品数据类型定义
interface Product {
  id: number;
  name: string;
  price: number;
  sales: number;
  image: string;
  tags?: string[];
  size: 'small' | 'medium' | 'large';
}

// 分类数据类型定义
interface Category {
  id: number;
  name: string;
  active: boolean;
}

const Shop = () => {
  const navigate = useNavigate();
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  // 分类数据
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: '好物推荐', active: true },
    { id: 2, name: '膳食管理', active: false },
    { id: 3, name: '健康生活', active: false },
    { id: 4, name: '健身设备', active: false },
    { id: 5, name: '运动服饰', active: false },
    { id: 6, name: '营养补剂', active: false },
    { id: 7, name: '睡眠健康', active: false },
    { id: 8, name: '心理减压', active: false },
    { id: 9, name: '健康监测', active: false },
    { id: 10, name: '健康书籍', active: false },
  ]);

  // 商品数据
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: '膳食营养',
      price: 0,
      sales: 0,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      tags: ['爆品'],
      size: 'medium'
    },
    {
      id: 2,
      name: '万益即食益生菌组合',
      price: 208,
      sales: 118,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
    {
      id: 3,
      name: 'TEAUS果蔬纤维代餐',
      price: 68,
      sales: 58,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 4,
      name: '10kg室内居家哑铃组',
      price: 80,
      sales: 16,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
    {
      id: 5,
      name: 'ATRL运动压缩裤',
      price: 129,
      sales: 87,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
    {
      id: 6,
      name: '有机蔬菜营养包',
      price: 89,
      sales: 45,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 7,
      name: '智能健康监测手环',
      price: 299,
      sales: 231,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 8,
      name: '蛋白质营养粉',
      price: 128,
      sales: 94,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 9,
      name: '可调节健身哑铃',
      price: 198,
      sales: 75,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 10,
      name: '瑜伽垫专业健身垫',
      price: 138,
      sales: 63,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 11,
      name: '健康睡眠枕',
      price: 219,
      sales: 42,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 12,
      name: '保健茶组合装',
      price: 98,
      sales: 112,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 13,
      name: '跑步机家用健身',
      price: 2399,
      sales: 31,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
    {
      id: 14,
      name: '有机杂粮组合',
      price: 65,
      sales: 98,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 15,
      name: '维生素组合套装',
      price: 156,
      sales: 134,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 16,
      name: '健身弹力带套装',
      price: 79,
      sales: 211,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 17,
      name: '静音划船机',
      price: 1599,
      sales: 27,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
    {
      id: 18,
      name: '减压助眠精油',
      price: 88,
      sales: 76,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 19,
      name: '健康食谱套装',
      price: 149,
      sales: 43,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 20,
      name: '运动速干衣套装',
      price: 189,
      sales: 156,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 21,
      name: '家用筋膜枪',
      price: 299,
      sales: 87,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 22,
      name: '血压心率监测仪',
      price: 359,
      sales: 62,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 23,
      name: '冥想助眠头戴设备',
      price: 799,
      sales: 19,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
    {
      id: 24,
      name: '健康饮食指南书籍',
      price: 56,
      sales: 93,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 25,
      name: '骑行动感单车',
      price: 1799,
      sales: 38,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
    {
      id: 26,
      name: '便携式蛋白粉摇杯',
      price: 39,
      sales: 218,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 27,
      name: '瑜伽拉伸辅助带',
      price: 45,
      sales: 124,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 28,
      name: '无麸质健康面包',
      price: 48,
      sales: 67,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'small'
    },
    {
      id: 29,
      name: '健身训练手套',
      price: 59,
      sales: 186,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'medium'
    },
    {
      id: 30,
      name: '多功能健身器械',
      price: 2899,
      sales: 21,
      image: '/lovable-uploads/cee1e34d-c6ee-4a8b-9242-0a635a69c823.png',
      size: 'large'
    },
  ]);

  // 切换分类
  const handleCategoryClick = (id: number) => {
    setCategories(categories.map(cat => ({
      ...cat,
      active: cat.id === id
    })));
  };

  // 滚动到主页
  const goToHome = () => {
    navigate('/home');
  };

  return (
    <div className="flex flex-col bg-black min-h-screen pb-16">
      <StatusBar />
      
      {/* 头部导航 */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="w-8 h-8 flex items-center justify-center" onClick={() => navigate(-1)}>
          <div className="w-6 h-0.5 bg-white"></div>
        </div>
        <h1 className="text-xl font-medium">健康商城</h1>
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-app-blue rounded-full flex items-center justify-center text-[10px]">
            8
          </div>
        </div>
      </div>
      
      {/* 分类滚动区 */}
      <div 
        className="w-full overflow-x-auto py-3 px-2 border-b border-gray-800 no-scrollbar"
        ref={categoriesRef}
      >
        <div className="flex space-x-3 min-w-max px-3">
          {categories.map(category => (
            <div 
              key={category.id}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap ${
                category.active 
                  ? 'bg-app-blue text-white' 
                  : 'bg-white text-black'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* 商品瀑布流 */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            {products
              .filter((_, index) => index % 2 === 0)
              .map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
          <div className="flex flex-col gap-2">
            {products
              .filter((_, index) => index % 2 === 1)
              .map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      </div>
      
      {/* 底部固定搜索框 */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-gray-900 rounded-t-3xl">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <span className="text-gray-500">搜索商品，更快实现目标</span>
        </div>
      </div>
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#1A1A1A] flex items-center justify-around border-t border-gray-800">
        <div className="flex flex-col items-center" onClick={goToHome}>
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="text-xs text-gray-400">主页</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
              <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm9 0a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs text-white">商城</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
          </div>
          <span className="text-xs text-gray-400">圈子</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M7 20.662V19c0-1.105.895-2 2-2h6c1.105 0 2 .895 2 2v1.662"></path>
            </svg>
          </div>
          <span className="text-xs text-gray-400">我的</span>
        </div>
      </div>
    </div>
  );
};

// 商品卡片组件
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  // 根据产品尺寸确定高度
  const getCardHeight = () => {
    switch (product.size) {
      case 'small': return 'h-48';
      case 'medium': return 'h-64';
      case 'large': return 'h-80';
      default: return 'h-64';
    }
  };

  return (
    <div className={`bg-white rounded-xl overflow-hidden ${getCardHeight()} flex flex-col`}>
      {/* 商品图片区域 */}
      <div className="relative flex-1 overflow-hidden">
        {product.tags && product.tags.map((tag, index) => (
          <div 
            key={index} 
            className="absolute top-2 left-2 z-10 bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs"
          >
            {tag}
          </div>
        ))}
        
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        
        {/* 如果是第一个特殊产品 */}
        {product.id === 1 && (
          <div className="absolute inset-0 flex flex-col justify-center px-4">
            <span className="text-2xl font-bold text-green-800 mb-2">膳</span>
            <span className="text-2xl font-bold text-green-800 mb-2">食</span>
            <span className="text-2xl font-bold text-green-800">营</span>
            <span className="text-2xl font-bold text-green-800">养</span>
          </div>
        )}
      </div>
      
      {/* 商品信息区域 */}
      {product.id !== 1 && (
        <div className="p-3">
          <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
          
          {/* 标签区域 */}
          <div className="flex gap-2 mb-2">
            <div className="bg-purple-100 rounded-full px-3 py-0.5 text-xs"></div>
            <div className="bg-purple-100 rounded-full px-3 py-0.5 text-xs"></div>
          </div>
          
          {/* 价格和销量 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xs text-gray-500">¥</span>
              <span className="text-xl font-semibold text-purple-500">{product.price}</span>
              <span className="text-xs text-gray-500 ml-1">起</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z"></path>
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z"></path>
              </svg>
              <span className="text-sm text-gray-400 ml-1">{product.sales}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
