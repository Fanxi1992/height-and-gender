import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import { Tel } from '@/voice-chat/components/Tel';
import { ChatMessageList } from '@/voice-chat/components/ChatMessageList';
import { AudioChatProvider } from '@/voice-chat/components/AudioChatProvider';
import { AudioChatServiceProvider } from '@/voice-chat/components/AudioChatServiceProvider';
import StatusBar from '@/components/StatusBar';

const Index = () => {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate(-1);
  };

  return (
    <AudioChatProvider>
      <AudioChatServiceProvider>
        <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
          <StatusBar />
          
          <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-black">
            <button onClick={goBack} className="p-2">
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">语音对话</h1>
            <div className="w-10"></div> {/* 占位元素保持标题居中 */}
          </div>

          <div className="flex-grow flex flex-col items-center px-2 overflow-hidden space-y-4"> {/* 添加 space-y-4 确保组件间有间距 */}
            <div className="w-full">
              <Tel />
            </div>
            <div className="flex-grow w-full overflow-y-auto pb-4"> {/* 添加 pb-4 */}
               <ChatMessageList />
            </div>
          </div>
        </div>
      </AudioChatServiceProvider>
    </AudioChatProvider>
  );
};

export default Index;
