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

import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { IMessage } from '@/voice-chat/types';

type AudioChatContextType = {
  wsConnected: boolean; // 格子1: WebSocket 是否连接 (布尔值 true/false)
  setWsConnected: Dispatch<SetStateAction<boolean>>;// 配套工具1: 用来修改 wsConnected 的函数
  botSpeaking: boolean; // 格子2: 机器人是否正在说话 (布尔值 true/false)
  setBotSpeaking: Dispatch<SetStateAction<boolean>>; // 配套工具2: 用来修改 botSpeaking 的函数
  botAudioPlaying: boolean; // 格子3: 机器人音频是否正在播放 (布尔值 true/false)
  setBotAudioPlaying: Dispatch<SetStateAction<boolean>>; // 配套工具3: 用来修改 botAudioPlaying 的函数
  userSpeaking: boolean; // 格子4: 用户是否正在说话 (布尔值 true  /false)
  setUserSpeaking: Dispatch<SetStateAction<boolean>>; // 配套工具4: 用来修改 userSpeaking 的函数
  // 格子5: 聊天消息列表 (一个包含多个消息对象的数组)
  chatMessages: IMessage[];
  setChatMessages: Dispatch<SetStateAction<IMessage[]>>; // 配套工具5: 修改消息列表的函数
};


// 用 React 的 createContext 工具，按照上面的蓝图，正式创建出这块“信息板”
export const AudioChatContext = createContext<AudioChatContextType>(
  {} as unknown as never,
);

 // 这里给了一个空的默认值，是一种技巧，意思是“别担心这个默认值，我们保证在使用时会提供真正的值”
 // 因为 createContext 需要一个默认值，但这个默认值在实际使用时会被覆盖
 // 所以这里给了一个永远不会被使用的默认值，确保 createContext 不会报错
