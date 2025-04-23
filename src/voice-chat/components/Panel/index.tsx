import { useState } from 'react';
import { Info, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useAudioChatState } from '@/voice-chat/components/AudioChatProvider/hooks/useAudioChatState';
import { useLogContent } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useLogContent';
import { useAudioRecorder } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useAudioRecorder';
import { useVoiceBotService } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useVoiceBotService';
import { useCurrentSentence } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useCurrentSentence';
import { useWsUrl } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useWsUrl';

export const Panel = () => {
  const {
    wsConnected,
    botSpeaking,
    userSpeaking,
    botAudioPlaying,
  } = useAudioChatState();

  const { handleConnect } = useVoiceBotService();
  const { currentBotSentence, currentUserSentence } = useCurrentSentence();
  const { recStart, recStop } = useAudioRecorder();
  const { logContent } = useLogContent();
  const { wsUrl, setWsUrl } = useWsUrl();
  const [draftWsUrl, setDraftWsUrl] = useState(wsUrl);

  return (
    <div className={'flex flex-col gap-4 w-full max-w-md'}>
      <div className={'w-full flex flex-col gap-4'}>
        <div className={'flex flex-col sm:flex-row gap-2'}>
          <Input
            className="flex-grow"
            placeholder="ws_url"
            prefix="ws_url"
            value={draftWsUrl}
            onChange={(e) => setDraftWsUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setWsUrl(draftWsUrl);
                handleConnect();
              }}
              className="whitespace-nowrap"
            >
              连接
            </Button>
            <Button 
              disabled={!wsConnected} 
              onClick={recStart}
              className="whitespace-nowrap"
            >
              <Phone className="h-4 w-4 mr-1" />
              打电话
            </Button>
            <Button 
              disabled={!wsConnected} 
              onClick={recStop}
              className="whitespace-nowrap"
            >
              <PhoneOff className="h-4 w-4 mr-1" />
              挂断
            </Button>
          </div>
        </div>
        
        {/* 状态描述 */}
        <div className="border rounded-md p-3 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center justify-between border-b pb-1 sm:border-none">
              <span className="font-medium text-sm">正在收听用户语音</span>
              <span>{userSpeaking ? '是' : '否'}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-1 sm:border-none">
              <span className="font-medium text-sm">正在输出回答</span>
              <span>{botSpeaking ? '是' : '否'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">正在播放语音</span>
              <span>{botAudioPlaying ? '是' : '否'}</span>
            </div>
          </div>
        </div>
        
        {/* 语音识别结果 */}
        <div className="border rounded-md p-3 bg-white">
          <div className="flex flex-col gap-3">
            <div>
              <div className="font-medium text-sm mb-1">User 语音识别结果</div>
              <div className="truncate max-w-full" title={currentUserSentence}>
                {currentUserSentence || '-'}
              </div>
            </div>
            <div>
              <div className="font-medium text-sm mb-1">Bot 语音文本</div>
              <div className="truncate max-w-full" title={currentBotSentence}>
                {currentBotSentence || '-'}
              </div>
            </div>
          </div>
        </div>
        
        <Textarea
          id={'log'}
          readOnly
          className={'w-full h-[200px] text-[12px] flex flex-col-reverse'}
          value={logContent.reverse().join('\n')}
        />
      </div>
    </div>
  );
};
