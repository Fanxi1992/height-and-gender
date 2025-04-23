import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Camera } from 'lucide-react';
import StatusBar from '../components/StatusBar';
import { foodData, getFoodCategories, getFoodItems, FoodDetails } from '@/data/foodData';
import { toast } from '@/components/ui/use-toast';
// Import the new sheet component
import FoodDetailSheet from '@/components/FoodDetailSheet';

type Category = keyof typeof foodData;
type MealType = '早餐' | '午餐' | '晚餐' | '上午加餐'; // 定义餐次类型

// Define the type for a food item including its name
interface FoodItem {
  name: string;
  details: FoodDetails;
}

const CommonFoodPage: React.FC = () => {
  const navigate = useNavigate();
  // Use helper function to get categories
  const categories = getFoodCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '常见'); // Default to the first category or '常见'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('早餐');

  // State for the detail sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const goBack = () => {
    navigate(-1);
  };

  const mealTypes: MealType[] = ['早餐', '午餐', '晚餐', '上午加餐'];

  // Use helper function to get filtered items
  const filteredFoodItems: FoodItem[] = getFoodItems(selectedCategory, searchTerm);

  // Handler for the save button
  const handleSaveRecord = () => {
    toast({
      title: "提示",
      description: "更多记录功能正在开发中...",
      variant: "default", // Or choose another variant like 'info' if available
      duration: 2000,
    });
  };

  // Function to handle clicking on a food item
  const handleFoodItemClick = (item: FoodItem) => {
    setSelectedFood(item);
    setIsSheetOpen(true);
  };

  // Function to close the sheet
  const handleSheetClose = () => {
    setIsSheetOpen(false);
    // Optionally clear selected food after animation:
    // setTimeout(() => setSelectedFood(null), 300);
  };

  return (
    // 应用暗色主题
    <div className="flex flex-col h-screen bg-black text-gray-200">

      {/* 顶部导航 - 暗色主题 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <button onClick={goBack} className="p-2 text-gray-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        {/* 标题居中显示 */}
        <h1 className="text-lg font-semibold text-white flex-1 text-center">记饮食</h1>
        {/* 右侧空白区域保持布局平衡 */}
        <div className="w-[40px]"></div>
      </div>

      {/* 日期和餐次选择 - 新增部分 */}
      <div className="px-4 pt-3 pb-2 bg-gray-900 border-b border-gray-700 sticky top-[calc(env(safe-area-inset-top,0px)+52px)] z-10"> {/* Adjust sticky top */}
        {/* 日期显示 (仿照参考图，暂时硬编码) */}
        <div className="text-sm text-gray-400 mb-3">04.16 星期三 ▼</div>
        {/* 餐次标签 */}
        <div className="flex space-x-2 overflow-x-auto pb-1"> {/* Allow horizontal scroll for meals */}
          {mealTypes.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedMeal === meal
                  ? 'bg-blue-600 text-white' // 选中状态 (蓝色背景)
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600' // 未选中状态
              }`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索框 - 暗色主题 */}
      <div className="p-4 bg-gray-900 sticky top-[calc(env(safe-area-inset-top,0px)+52px+68px)] z-10"> {/* Adjust sticky top */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索你想要添加的食物..." // 更新 placeholder
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // 更新搜索框样式
            className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* 主要内容区域 - 暗色主题 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧分类 - 暗色主题 */}
        <div className="w-1/4 overflow-y-auto bg-gray-800 border-r border-gray-700 flex-shrink-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSearchTerm(''); // 点击分类时清空搜索词
              }}
              // 更新分类按钮样式
              className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-700 text-green-400 border-l-4 border-green-500' // 选中分类样式
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white' // 未选中分类样式
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 右侧食物列表 - 暗色主题 */}
        <div className="w-3/4 overflow-y-auto bg-gray-900 p-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">{selectedCategory}</h2> {/* 移除 "食物" 字样 */}
          {filteredFoodItems.length > 0 ? (
            <ul className="space-y-1"> {/* 减小间距 */}
              {filteredFoodItems.map((item) => (
                <li
                  key={item.name}
                  onClick={() => handleFoodItemClick(item)}
                  className="flex justify-between items-center border-b border-gray-700 py-2.5 hover:bg-gray-800 px-2 rounded cursor-pointer"
                >
                  <span className="text-gray-200">{item.name}</span>
                  {/* Access calories from item.details */}
                  <span className="text-gray-400 text-sm">{item.details.卡路里}千卡/100克</span>
                </li>
              ))}
            </ul>
          ) : (
             // 更新无结果提示样式
             <div className="text-center text-gray-500 mt-10 px-4">
               {/* Check if the original category data is empty or if search term yielded no results */}
               {!foodData[selectedCategory] || Object.keys(foodData[selectedCategory]).length === 0
                 ? `\"${selectedCategory}\" 分类下暂无食物`
                 : `在 \"${selectedCategory}\" 分类下未找到与 \"${searchTerm}\" 相关的食物`
               }
             </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 (仿照参考图，暂时放置) */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-t border-gray-700 sticky bottom-0 z-10">
         <div className="flex items-center space-x-2">
            {/* 左下角小图标和文字 */}
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                {/* Placeholder for image/icon */}
                 <span className="text-xs">🥦</span>
            </div>
            <span className="text-xs text-gray-400">还没有<br/>添加任何食物哦~</span>
         </div>
         <button
           onClick={handleSaveRecord}
           className="px-6 py-2 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-600"
         >
            保存记录
         </button>
      </div>

      {/* Render the Food Detail Sheet */}
      <FoodDetailSheet
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        foodName={selectedFood?.name ?? null}
        foodDetails={selectedFood?.details ?? null}
      />
    </div>
  );
};

export default CommonFoodPage;
