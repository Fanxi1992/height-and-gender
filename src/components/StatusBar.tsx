import React from 'react';

// 添加title属性的接口定义
interface StatusBarProps {
  title?: string; // 可选的标题属性
}

const StatusBar: React.FC<StatusBarProps> = ({ title }) => {
  // 获取当前时间并格式化为"9:41"样式
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 pt-2 pb-1">
      <span className="text-white font-medium text-sm">{getCurrentTime()}</span>
      {/* 如果有标题则显示在中间 */}
      {title && (
        <span className="text-white font-medium text-base absolute left-1/2 transform -translate-x-1/2">
          {title}
        </span>
      )}
    </div>
  );
};

export default StatusBar;
