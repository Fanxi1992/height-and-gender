
import React from 'react';

interface SkipButtonProps {
  onClick: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="absolute right-4 top-16 z-10 p-2 text-gray-400 hover:text-white transition-colors"
    >
      跳过
    </button>
  );
};

export default SkipButton;
