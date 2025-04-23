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


// 这个文件是用来获取和修改音频聊天状态的，专门为 AudioChatContext 设计的、方便易用的“读写窗口”。组件不需要直接去操作复杂的 AudioChatContext，只需要通过这个窗口就能轻松获取信息或提交更改。

import { useContext } from 'react';
import { AudioChatContext } from '@/voice-chat/components/AudioChatProvider/context';

export const useAudioChatState = () => {
  const {
    botSpeaking,
    setBotSpeaking,
    userSpeaking,
    setUserSpeaking,
    wsConnected,
    setWsConnected,
    botAudioPlaying,
    setBotAudioPlaying,
  } = useContext(AudioChatContext);
  return {
    botSpeaking,
    setBotSpeaking,
    userSpeaking,
    setUserSpeaking,
    wsConnected,
    setWsConnected,
    botAudioPlaying,
    setBotAudioPlaying,
  };
};
