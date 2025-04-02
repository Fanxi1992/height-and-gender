import React from 'react';

interface QRCodeScannerIconProps {
  size?: number;
  className?: string;
}

/**
 * 二维码扫描图标组件
 * 用于显示扫描食材等功能的扫描图标
 */
const QRCodeScannerIcon: React.FC<QRCodeScannerIconProps> = ({ 
  size = 24, 
  className = ""
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* 绘制二维码扫描框 */}
      <rect x="3" y="3" width="18" height="18" rx="2" />
      
      {/* 扫描线 */}
      <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" />
      
      {/* 二维码内部方块 */}
      <rect x="7" y="7" width="3" height="3" />
      <rect x="14" y="7" width="3" height="3" />
      <rect x="7" y="14" width="3" height="3" />
      
      {/* 扫描状态指示点 */}
      <circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
  );
};

export default QRCodeScannerIcon; 