import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, Mic, Camera, Image, SendHorizontal, X, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioLines } from 'lucide-react';

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
  const [isRecording, setIsRecording] = useState(false);
  const [audioWaveValues, setAudioWaveValues] = useState<number[]>(Array(10).fill(5));
  const audioWaveTimer = useRef<NodeJS.Timeout | null>(null);
  
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

  const startRecording = () => {
    setIsRecording(true);
    
    // Animate audio waves
    if (!audioWaveTimer.current) {
      audioWaveTimer.current = setInterval(() => {
        setAudioWaveValues(prev => 
          prev.map(() => Math.floor(Math.random() * 20) + 3)
        );
      }, 150);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Clear the timer
    if (audioWaveTimer.current) {
      clearInterval(audioWaveTimer.current);
      audioWaveTimer.current = null;
    }
    
    // Reset the wave
    setAudioWaveValues(Array(10).fill(5));
  };

  return (
    <div className="relative">
      {/* Audio recording overlay */}
      {isRecording && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div className="mb-6">
            <Volume2 size={40} className="text-white animate-pulse" />
          </div>
          
          <div className="flex items-end h-20 space-x-1 mb-8">
            {audioWaveValues.map((value, index) => (
              <div 
                key={index}
                className="w-2 bg-blue-500 rounded-full transition-all duration-150 ease-in-out"
                style={{ height: `${value * 3}px` }}
              />
            ))}
          </div>
          
          <div className="text-white text-lg">松开发送，上滑取消</div>
        </div>
      )}

      {/* Camera options overlay */}
      {showCameraOptions && (
        <div className="absolute bottom-14 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-t-2xl p-4 shadow-lg z-40">
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-700 text-sm">可以发送：检验/检查报告、病例、药物等含文字的图片</p>
            <button onClick={toggleCameraOptions} className="text-gray-500">
              <X size={18} />
            </button>
          </div>
          <div className="flex justify-around">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <Camera size={24} className="text-blue-500" />
              </div>
              <span className="text-sm text-gray-700">拍摄</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <Image size={24} className="text-blue-500" />
              </div>
              <span className="text-sm text-gray-700">相册</span>
            </div>
          </div>
        </div>
      )}

      {/* Main chat input bar */}
      <div className={cn(
        "w-full px-3 py-1.5 bg-white border-t border-gray-100 flex items-center space-x-2",
        showCameraOptions ? "pb-2" : ""
      )}>
        {/* Left icon - keyboard or mic depending on mode */}
        <button 
          onClick={toggleInputMode} 
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600"
        >
          {inputMode === 'voice' 
            ? <Keyboard size={22} /> 
            : <Mic size={22} />
          }
        </button>
        
        {/* Middle input area - changes based on mode */}
        {inputMode === 'voice' ? (
          <div 
            className="flex-1 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm active:bg-gray-200 touch-none select-none"
            onTouchStart={startRecording}
            onMouseDown={startRecording}
            onTouchEnd={stopRecording}
            onMouseUp={stopRecording}
            onTouchCancel={stopRecording}
            onMouseLeave={stopRecording}
          >
            <div className="flex items-center">
              {isRecording ? (
                <AudioLines size={18} className="text-blue-500 mr-1 animate-pulse" />
              ) : null}
              <span>{isRecording ? "松开发送" : "按下说话"}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="任何问题，欢迎问我哦~"
              className="w-full h-9 bg-gray-100 rounded-full px-4 text-black text-sm placeholder:text-gray-500 focus:outline-none"
            />
            {inputText && (
              <button 
                onClick={handleSend} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <SendHorizontal size={18} className="text-blue-500" />
              </button>
            )}
          </div>
        )}
        
        {/* Right icon - camera */}
        <button 
          onClick={toggleCameraOptions} 
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600"
        >
          <Camera size={22} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
