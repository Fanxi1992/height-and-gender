import React, { useState } from 'react';
import { Loader, PhoneOff, RefreshCw, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { useAudioChatState } from '@/voice-chat/components/AudioChatProvider/hooks/useAudioChatState';
import { useVoiceBotService } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useVoiceBotService';
import { useAudioRecorder } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useAudioRecorder';
import { useWsUrl } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useWsUrl';

export const Tel = () => {
  const { wsConnected, botSpeaking, userSpeaking, botAudioPlaying, setWsConnected } =
    useAudioChatState();
  const { handleConnect, handleDisconnect } = useVoiceBotService();
  const { recStart, recStop } = useAudioRecorder();
  const { wsUrl, setWsUrl } = useWsUrl();
  const [draftWsUrl, setDraftWsUrl] = useState(wsUrl);
  
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={'chat w-full max-w-md'}>
      <div
        className={
          'relative w-full h-auto min-h-[300px] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#A0B8FF] via-[#C7D6FF] to-[#E0E7FF] p-4'
        }
      >
        <div className={'flex flex-col items-center justify-center gap-2'}>
          <div
            className={'h-10 text-xl font-bold text-[#7f4722] text-center py-0.5 drop-shadow-md'}
            style={{ textShadow: '0 2px 8px rgba(255,138,61,0.25)' }}
          >
            24h健康助手小青为您服务
          </div>
          <div className={'flex flex-col justify-center items-center mt-0'}>
            <div className="w-[90px] h-[90px] rounded-full flex items-center justify-center bg-white/40 shadow-lg">
              <img
                src={
                  '/voice_chat头像.jpg'
                }
                className={
                  'w-[80px] h-[80px] rounded-full select-none object-cover box-content border-4 border-white/80 shadow-md'
                }
                style={{ background: '#fff' }}
              />
            </div>
          </div>

          {/* 状态显示区域 */}
          <div
            className={
              'flex flex-col items-center text-white text-center text-lg'
            }
          >
            <div className={'wave w-[165px] h-[30px]'} /> {/* 减小波浪高度 */}
            <div 
              className={`bot-wave w-[165px] h-[10px] ${ (botSpeaking || botAudioPlaying) ? 'visible' : 'invisible' }`} 
            />
            <div className="h-6 -mt-1 text-[#4A4A4A]"> {/* 增加高度并上移，调整为深灰色文字 */}
              {userSpeaking && '用户说话中...'}
              {botSpeaking && '模型回复中...'}
              {botAudioPlaying && '模型说话中...'}
            </div>
          </div>
          
          {/* 控制按钮区域 */}
          <div className="flex gap-3 mb-2 mt-4"> {/* 增加上边距 */}
            <Button
              onClick={() => {
                setWsUrl(draftWsUrl);
                handleConnect();
              }}
              className="whitespace-nowrap bg-[#7D88FF] hover:bg-[#A0B8FF] text-white font-bold shadow-md"
              disabled={wsConnected}
            >
              连接
            </Button>
            <Button 
              onClick={() => {
                recStop();
                handleDisconnect();
              }}
              className="whitespace-nowrap bg-[#E0E7FF] hover:bg-[#C7D6FF] text-[#7D88FF] font-bold shadow-md"
              disabled={!wsConnected}
            >
              <PhoneOff className="h-4 w-4 mr-1 text-[#7D88FF]" />
              挂断
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Button
                    onClick={handleRefresh}
                    className="whitespace-nowrap bg-[#7D88FF] hover:bg-[#A0B8FF] text-white p-2 shadow-md"
                  >
                    <RefreshCw className="h-4 w-4 text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-transparent hover:bg-[#A0B8FF]/40 text-[#7D88FF] p-1 -ml-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>出现卡顿、重音的问题，或需重置对话，点击刷新</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
