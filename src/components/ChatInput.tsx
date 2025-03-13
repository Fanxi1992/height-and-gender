
import React, { useState } from 'react';
import { Keyboard, Mic, Camera, Image, SendHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onlyShouldShowOnHomePage?: boolean;
  currentPath: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onlyShouldShowOnHomePage = true, 
  currentPath 
}) => {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [inputText, setInputText] = useState('');
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  
  // Only show on home page if that setting is enabled
  if (onlyShouldShowOnHomePage && currentPath !== '/home') {
    return null;
  }

  const toggleInputMode = () => {
    setInputMode(inputMode === 'voice' ? 'text' : 'voice');
  };

  const handleSend = () => {
    console.log('Sending message:', inputText);
    setInputText('');
  };

  const toggleCameraOptions = () => {
    setShowCameraOptions(!showCameraOptions);
  };

  return (
    <div className="relative">
      {/* Camera options overlay */}
      {showCameraOptions && (
        <div className="absolute bottom-16 left-0 right-0 bg-gray-100 rounded-t-xl p-4 shadow-lg z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-700 text-sm">可以发送：检验/检查报告、病例、药物等含文字的图片</p>
            <button onClick={toggleCameraOptions} className="text-gray-500">
              <X size={18} />
            </button>
          </div>
          <div className="flex justify-around">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Camera size={24} className="text-blue-500" />
              </div>
              <span className="text-sm text-gray-700">拍摄</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Image size={24} className="text-blue-500" />
              </div>
              <span className="text-sm text-gray-700">相册</span>
            </div>
          </div>
        </div>
      )}

      {/* Main chat input bar */}
      <div className={cn(
        "w-full px-2 py-2 bg-white border-t border-gray-200 flex items-center space-x-2",
        showCameraOptions ? "pb-2" : ""
      )}>
        {/* Left icon - keyboard or mic depending on mode */}
        <button 
          onClick={toggleInputMode} 
          className="w-10 h-10 flex items-center justify-center rounded-full"
        >
          {inputMode === 'voice' 
            ? <Keyboard size={24} className="text-gray-600" /> 
            : <Mic size={24} className="text-gray-600" />
          }
        </button>
        
        {/* Middle input area - changes based on mode */}
        {inputMode === 'voice' ? (
          <div className="flex-1 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium">
            按下说话
          </div>
        ) : (
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="任何问题，欢迎问我哦~"
              className="w-full h-10 bg-gray-100 rounded-full px-4 text-black placeholder:text-gray-500 focus:outline-none"
            />
            {inputText && (
              <button 
                onClick={handleSend} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <SendHorizontal size={20} className="text-blue-500" />
              </button>
            )}
          </div>
        )}
        
        {/* Right icon - camera */}
        <button 
          onClick={toggleCameraOptions} 
          className="w-10 h-10 flex items-center justify-center rounded-full"
        >
          <Camera size={24} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
