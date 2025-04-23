import React from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // Assuming Sheet is available
import { FoodDetails } from '@/data/foodData'; // Import the interface
import { Button } from "@/components/ui/button"; // For styling buttons

interface FoodDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  foodName: string | null;
  foodDetails: FoodDetails | null;
}

// Static ruler component for visual representation
const Ruler: React.FC = () => (
  <div className="flex flex-col items-center my-4 px-4">
    <div className="relative w-full h-12">
      {/* Ticks */}
      <div className="absolute inset-0 flex justify-between items-end">
        {[...Array(41)].map((_, i) => {
          const value = 80 + i;
          const isMajorTick = (value % 10 === 0);
          const isHalfTick = (value % 5 === 0 && !isMajorTick);
          const height = isMajorTick ? 'h-4' : isHalfTick ? 'h-3' : 'h-2';
          return (
            <div key={value} className={`w-px ${height} bg-gray-500`}></div>
          );
        })}
      </div>
      {/* Center Indicator */}
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 flex flex-col items-center">
         <div className="w-px h-6 bg-teal-400"></div> {/* Highlighted center line */}
         <div className="w-3 h-3 border-t-0 border-r border-b border-l border-teal-400 bg-gray-900 transform rotate-45 -mt-1.5"></div> {/* Diamond indicator */}
         {/* Triangle pointing down */}
         {/* <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-teal-400 -mt-1"></div> */}
      </div>
    </div>
     {/* Labels */}
     <div className="flex justify-between w-full text-xs text-gray-500 px-2 mt-1">
        <span>80</span>
        <span>90</span>
        <span>100</span>
        <span>110</span>
        <span>120</span>
     </div>
  </div>
);


const FoodDetailSheet: React.FC<FoodDetailSheetProps> = ({ isOpen, onClose, foodName, foodDetails }) => {
  if (!foodDetails || !foodName) {
    return null; // Don't render if no food is selected
  }

  // Calculate values based on 100g (currently static)
  const weight = 100;
  const calories = foodDetails.卡路里;
  const carbs = foodDetails.碳水化合物 ?? 0; // Default to 0 if undefined
  const protein = foodDetails.蛋白质 ?? 0; // Default to 0 if undefined
  const fat = foodDetails.脂肪 ?? 0; // Default to 0 if undefined

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="bg-gray-900 text-white border-gray-700 rounded-t-2xl p-0">
        <div className="p-4 relative">
           {/* Header */}
           <SheetHeader className="text-center mb-4">
             <SheetTitle className="text-white text-lg">添加食物</SheetTitle>
           </SheetHeader>

           {/* Food Info */}
           <div className="mb-4 px-2">
              <h3 className="text-xl font-semibold text-white mb-1">{foodName}</h3>
              <p className="text-sm text-gray-400 mb-3">{calories}千卡 / 100克</p>

              {/* Nutrient Details */}
              <div className="space-y-1.5 text-sm">
                 {foodDetails.碳水化合物 !== undefined && (
                    <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <span className="w-3 h-3 rounded-sm bg-teal-400 mr-2"></span>
                         <span>碳水化合物</span>
                       </div>
                       <span className="text-gray-300">{carbs.toFixed(1)}克</span>
                    </div>
                 )}
                 {foodDetails.蛋白质 !== undefined && (
                   <div className="flex items-center justify-between">
                      <div className="flex items-center">
                         <span className="w-3 h-3 rounded-sm bg-orange-400 mr-2"></span>
                         <span>蛋白质</span>
                      </div>
                      <span className="text-gray-300">{protein.toFixed(1)}克</span>
                   </div>
                 )}
                 {foodDetails.脂肪 !== undefined && (
                   <div className="flex items-center justify-between">
                      <div className="flex items-center">
                         <span className="w-3 h-3 rounded-sm bg-yellow-400 mr-2"></span>
                         <span>脂肪</span>
                      </div>
                      <span className="text-gray-300">{fat.toFixed(1)}克</span>
                   </div>
                 )}
              </div>
           </div>

           {/* Calorie and Weight Display */}
           <div className="flex justify-around items-baseline my-4 px-2">
              <div className="text-center">
                 <span className="text-3xl font-bold text-white">{calories}</span>
                 <span className="text-sm text-gray-400 ml-1">千卡</span>
              </div>
              <div className="text-center">
                 <span className="text-3xl font-bold text-white">{weight}</span>
                 <span className="text-sm text-gray-400 ml-1">克</span>
              </div>
           </div>

           {/* Ruler */}
           <Ruler />

           {/* Unit Selection */}
           <div className="flex justify-center space-x-2 my-4">
             <Button variant="outline" size="sm" className="bg-teal-600/30 border-teal-500 text-teal-300 rounded-full px-4 hover:bg-teal-600/40 cursor-not-allowed">克</Button>
             <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-400 rounded-full px-4 hover:bg-gray-600 cursor-not-allowed">盘</Button>
             <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-400 rounded-full px-4 hover:bg-gray-600 cursor-not-allowed">食堂勺</Button>
           </div>

        </div>

        {/* Confirm Button Area */}
        <div className="p-4 border-t border-gray-700 mt-auto sticky bottom-0 bg-gray-900">
            <Button
                className="w-full bg-gray-600 text-gray-400 hover:bg-gray-600 cursor-not-allowed"
                disabled={true} // Explicitly disable
            >
                确定 (正在开发)
            </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
};

export default FoodDetailSheet; 