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

import { type FC, type PropsWithChildren, useRef, useState, useEffect } from 'react';
import { AudioChatServiceContext } from '@/voice-chat/components/AudioChatServiceProvider/context';
import type VoiceBotService from '@/voice-chat/utils/voice_bot_service';
import { useSyncRef } from '@/voice-chat/hooks/useSyncRef';

export const AudioChatServiceProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  // const [wsUrl, setWsUrl] = useState('wss://comorbidity.top/api/live_voice_call/chat'); //生产环境
  const [wsUrl, setWsUrl] = useState('ws://localhost:8888/api/live_voice_call/chat'); //本地开发环境
  const waveRef = useRef<any>(null);
  const recorderRef = useRef<any>(null);
  const sendPcmBufferRef = useRef(new Int16Array(0));
  const sendChunkRef = useRef(null); //SampleData需要的上次转换结果，用于连续转换采样率
  const sendLastFrameRef = useRef<Int16Array | null>(null);

  const serviceRef = useRef<VoiceBotService>(null);
  const configNeedUpdateRef = useSyncRef(false);
  const wsReadyRef = useRef(false);

  // 组件卸载时断开 WebSocket 连接并停止一切音频播放和录音
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
      // 停止录音器，释放麦克风资源
      recorderRef.current?.close();
    };
  }, []);

  const [currentSpeaker, setCurrentSpeaker] = useState(
    'zh_female_shuangkuaisisi_moon_bigtts',
  );

  const [currentUserSentence, setCurrentUserSentence] = useState('');
  const [currentBotSentence, setCurrentBotSentence] = useState('');

  const [logContent, setLogContent] = useState<string[]>([]);

  return (
    <AudioChatServiceContext.Provider
      value={{
        wsUrl,
        setWsUrl,
        waveRef,
        recorderRef,
        sendPcmBufferRef,
        sendChunkRef,
        sendLastFrameRef,
        serviceRef,
        configNeedUpdateRef,
        wsReadyRef,
        currentSpeaker,
        setCurrentSpeaker,
        currentUserSentence,
        setCurrentUserSentence,
        currentBotSentence,
        setCurrentBotSentence,
        logContent,
        setLogContent,
      }}
    >
      {children}
    </AudioChatServiceContext.Provider>
  );
};
