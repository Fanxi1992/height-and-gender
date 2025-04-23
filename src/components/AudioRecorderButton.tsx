import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // 假设你的 cn 函数路径

interface AudioRecorderButtonProps {
  isListening: boolean;
  isLoading?: boolean; // 可选的加载状态
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const AudioRecorderButton: React.FC<AudioRecorderButtonProps> = ({
  isListening,
  isLoading = false,
  onClick,
  disabled = false,
  className,
  ariaLabel = 'Toggle voice input',
}) => {
  const renderIcon = () => {
    if (isLoading) {
      return <Loader2 size={20} className="animate-spin text-gray-400" />;
    }
    if (isListening) {
      return <Mic size={20} className="text-red-500" />;
    }
    return <MicOff size={20} className="text-gray-400" />;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 flex-shrink-0 transition-colors',
        className,
        isListening ? 'bg-gray-700' : '',
      )}
      aria-label={ariaLabel}
      aria-pressed={isListening}
    >
      {renderIcon()}
    </button>
  );
};

export default AudioRecorderButton; 