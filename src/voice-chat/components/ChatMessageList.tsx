// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// Licensed under the 【火山方舟】原型应用软件自用许可协议
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
//     https://www.volcengine.com/docs/82379/1433703
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License. 

import { useMessageList } from '@/voice-chat/components/AudioChatProvider/hooks/useMessageList';
import { useEffect, useRef } from 'react';
import { useAudioChatState } from '@/voice-chat/components/AudioChatProvider/hooks/useAudioChatState';
import { useVoiceBotService } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useVoiceBotService';
import { useAudioRecorder } from '@/voice-chat/components/AudioChatServiceProvider/hooks/useAudioRecorder';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export const ChatMessageList = () => {
  const { chatMessages } = useMessageList();
  const { botSpeaking, botAudioPlaying } = useAudioChatState();
  const { handleConnect, handleDisconnect } = useVoiceBotService();
  const { recStop } = useAudioRecorder();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleInterrupt = () => {
    recStop();
    handleDisconnect();
    setTimeout(() => {
      handleConnect();
    }, 100);
  };

  return (
    <div
      ref={listRef}
      className={
        'w-full max-w-md h-full flex-shrink-0 pt-6 px-4 pb-4 rounded-[20px] bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col overflow-y-scroll gap-4'
      }
    >
      {!chatMessages.length && <div className="text-white/70">对话后展示消息记录...</div>}
      {chatMessages.map(msg =>
        msg.role === 'bot' ? (
          <div key={`${msg.content?.slice(0, 10)}-${chatMessages.indexOf(msg)}` || Math.random()} className="flex flex-row items-start gap-2">
            <img
              className="w-10 h-10 rounded-full border-2 border-pink-200 shadow-lg bg-white/80 object-cover mt-1"
              src={'/voice_chat头像.jpg'}
              alt={''}
            />
            <div className="flex flex-col">
              <div
                className="max-w-[calc(100%-3rem)] p-3 rounded-2xl rounded-tl-3xl bg-gradient-to-br from-[#A0B8FF] via-[#C7D6FF] to-[#E0E7FF] text-black shadow-lg"
                style={{ position: 'relative' }}
              >
                {msg.content}
              </div>
              {chatMessages.indexOf(msg) === chatMessages.length - 1 && (botSpeaking || botAudioPlaying) && (
                <Button
                  onClick={handleInterrupt}
                  variant="destructive"
                  size="sm"
                  className="mt-1 self-start ml-8 whitespace-nowrap bg-[#FF7D7D] hover:bg-[#FF9999] text-white font-bold shadow-md"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  中断
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div key={`${msg.content?.slice(0, 10)}-${chatMessages.indexOf(msg)}` || Math.random()} className="flex justify-end items-start gap-2">
            <div
              className="flex items-end max-w-[85%] p-3 rounded-2xl rounded-tr-3xl bg-pink-200/80 text-pink-700 shadow-lg backdrop-blur-sm relative"
              style={{ position: 'relative' }}
            >
              {msg.content}
            </div>
          </div>
        ),
      )}
    </div>
  );
};
