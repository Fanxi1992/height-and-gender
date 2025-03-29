
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  onlyShouldShowOnHomePage?: boolean;
  currentPath?: string;
  locationProcessed?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onlyShouldShowOnHomePage = false, 
  currentPath = '',
  locationProcessed = true
}) => {
  const [inputText, setInputText] = useState('');
  
  // Only show on home page if that setting is enabled
  if (onlyShouldShowOnHomePage && currentPath !== '/home') {
    return null;
  }

  const handleSend = () => {
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center bg-[#333333] rounded-full px-4 py-2">
        <input
          type="text"
          placeholder="给 Healthbot 发送消息"
          className="flex-1 bg-transparent text-white border-none outline-none text-sm"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <button className="ml-2 text-gray-400" onClick={handleSend}>
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
