import React from 'react';

interface ImageGuidanceModalProps {
  isOpen: boolean;
  guidanceType: 'ingredient' | 'meal' | null; // 添加新属性，接收触发弹窗的类型
  onConfirm: () => void;
  onDismiss: () => void; // 处理"不再提示"
}

const ImageGuidanceModal: React.FC<ImageGuidanceModalProps> = ({ isOpen, guidanceType, onConfirm, onDismiss }) => {
  if (!isOpen) {
    return null;
  }

  // 处理"不再提示"按钮点击
  const handleDismiss = () => {
    // 根据 guidanceType 设置不同的 localStorage 键
    if (guidanceType === 'ingredient') {
      localStorage.setItem('hideIngredientGuidance', 'true');
    } else if (guidanceType === 'meal') {
      localStorage.setItem('hideMealImageGuidance', 'true'); // 使用不同的键名
    }
    onDismiss(); // 关闭弹窗
  };

  // 处理"确认"按钮点击
  const handleConfirm = () => {
    onConfirm(); // 调用父组件传递的 confirm 回调，通常用于关闭弹窗并继续操作
  };


  return (
    // 半透明背景遮罩层
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
      {/* 弹窗主体 - 样式基于参考图 */}
      <div className="bg-white rounded-xl p-4 w-80 max-w-[90%] flex flex-col items-center shadow-lg">
        {/* 标题 */}
        {/* <h2 className="text-lg font-semibold text-gray-800 mb-4">图像识别引导</h2> */}

        {/* 引导图片 - 请确保图片路径正确 */}
        <img
          src="/public/ai互动/图像识别引导图.png" // !请替换为实际图片路径!
          alt="图像识别引导"
          className="w-full max-w-[200px] h-auto object-contain mb-4" // 控制图片大小
        />

        {/* 说明文字 */}
        <p className="text-sm text-gray-600 text-center mb-6">
          请清晰拍摄食材全貌，避免遮挡和模糊
        </p>

        {/* 按钮组 */}
        <div className="flex justify-between w-full space-x-3">
          {/* 不再提示按钮 */}
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-200 text-gray-700 font-medium py-2.5 rounded-full hover:bg-gray-300 transition-colors text-sm" // 浅灰色背景，圆角
          >
            不再提示
          </button>
          {/* 确认按钮 */}
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-full hover:bg-blue-700 transition-colors text-sm" // 蓝色背景，圆角
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGuidanceModal;
