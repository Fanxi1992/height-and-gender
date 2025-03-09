
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { Search } from 'lucide-react';

const Shop = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('全部');
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    '全部', '减脂', '增肌', '营养补充', '中医养生', 
    '运动装备', '健康检测', '睡眠改善', '孕产妇', '老年保健'
  ];

  // Helper function to get random numbers for prices and sales
  const getRandomPrice = () => (Math.random() * 200 + 50).toFixed(2);
  const getRandomSales = () => Math.floor(Math.random() * 1000);
  
  // Helper function to get random height class for product cards
  const getRandomHeightClass = () => {
    const heights = ['product-card-small', 'product-card-medium', 'product-card-large'];
    return heights[Math.floor(Math.random() * heights.length)];
  };
  
  // Generate 30 random products
  const products = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `健康产品 ${i + 1}`,
    price: getRandomPrice(),
    sales: getRandomSales(),
    image: `https://source.unsplash.com/random/300x300/?health,${i}`,
    heightClass: getRandomHeightClass(),
    tag: Math.random() > 0.5 ? '热销' : '新品'
  }));
  
  // Create two columns for waterfall layout
  const leftColumnProducts = products.filter((_, i) => i % 2 === 0);
  const rightColumnProducts = products.filter((_, i) => i % 2 === 1);

  const goToHome = () => {
    navigate('/home');
  };
  
  const goToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };
  
  const goToCircle = () => {
    navigate('/circle');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <StatusBar />
      
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-10 pb-4">
        <h1 className="text-xl font-bold">健康商城</h1>
      </div>
      
      {/* Categories */}
      <div 
        ref={horizontalScrollRef}
        className="flex overflow-x-auto no-scrollbar px-5 pb-4"
      >
        {categories.map((category) => (
          <button
            key={category}
            className={`${
              activeCategory === category
                ? 'category-pill-active'
                : 'category-pill-inactive'
            } mr-2 whitespace-nowrap`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Products Waterfall Layout */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="flex gap-3">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-3">
            {leftColumnProducts.map((product) => (
              <div key={product.id} className={`${product.heightClass} relative`}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-2/3 object-cover rounded-t-xl"
                />
                <div className="absolute top-2 left-2">
                  <span className="product-tag">{product.tag}</span>
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-sm line-clamp-2 text-black">{product.name}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-red-500 font-semibold">¥{product.price}</span>
                    <span className="text-xs text-gray-500">{product.sales}人已购</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-3">
            {rightColumnProducts.map((product) => (
              <div key={product.id} className={`${product.heightClass} relative`}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-2/3 object-cover rounded-t-xl"
                />
                <div className="absolute top-2 left-2">
                  <span className="product-tag">{product.tag}</span>
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-sm line-clamp-2 text-black">{product.name}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-red-500 font-semibold">¥{product.price}</span>
                    <span className="text-xs text-gray-500">{product.sales}人已购</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fixed Search Bar at Bottom */}
      <div className="fixed bottom-16 left-0 right-0 px-5 pb-3">
        <div className="flex items-center bg-white rounded-full px-4 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="搜索健康商品..." 
            className="bg-transparent flex-1 border-none text-black"
          />
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-2">
        <div className="flex flex-col items-center text-gray-500" onClick={goToHome}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-xs">主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToKnowledgeBase}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <span className="text-xs">知识库</span>
        </div>
        <div className="flex flex-col items-center text-gray-500" onClick={goToCircle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span className="text-xs">圈子</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span className="text-xs">商城</span>
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
