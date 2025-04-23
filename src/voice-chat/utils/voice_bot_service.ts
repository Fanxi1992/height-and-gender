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

import { decodeWebSocketResponse, pack } from '.';
import type { JSONResponse, WebRequest } from '@/voice-chat/types';
import { CONST } from '@/voice-chat/constant';

interface IVoiceBotService {
  ws_url: string;
  handleJSONMessage: (json: JSONResponse) => void; // 必须提供一个处理 JSON 指令消息的函数
  onStartPlayAudio: (data: ArrayBuffer) => void;// 必须提供一个在开始播放音频时要调用的函数
  onStopPlayAudio: () => void;// 必须提供一个在音频播放结束时要调用的函数
}
export default class VoiceBotService {
  private ws_url: string;
  private ws?: WebSocket;
  // private sonic:any;
  private audioCtx: AudioContext;
  private source: AudioBufferSourceNode | undefined;
  private audioChunks: ArrayBuffer[] = [];
  private handleJSONMessage: (json: JSONResponse) => void;
  private onStartPlayAudio: (data: ArrayBuffer) => void;
  private onStopPlayAudio: () => void;
  protected playing = false;

  // 这个构造函数接收一个 IVoiceBotService 类型的对象，并根据这个对象的属性来初始化 VoiceBotService 实例
  constructor(props: IVoiceBotService) {
    this.ws_url = props.ws_url;
    this.audioCtx = new AudioContext();
    this.handleJSONMessage = props.handleJSONMessage;
    this.onStartPlayAudio = props.onStartPlayAudio;
    this.onStopPlayAudio = props.onStopPlayAudio;
  }


  // public: 表示这个 connect 方法是公开的，可以从 VoiceBotService 类的外部被调用。
  // async: 表明这个方法内部可能包含需要等待的操作（虽然这里没直接用 await，但 Promise 本身就是处理异步等待的）。
  // connect(): 方法的名字，就是"连接"。
  // : Promise<WebSocket> : 这是 TypeScript 的类型注解，意思是这个方法【不直接】返回 WebSocket 对象， 而是返回一个 Promise (承诺)。这个 Promise 将来【要么】成功兑现并给出一个 WebSocket 对象，[要么】失败并给出一个错误。这是处理网络连接这种【耗时操作】的标准方式。


  public async connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.ws_url);
      ws.onopen = () => {
        this.ws = ws;
        resolve(ws);
      };
      ws.onerror = e => {
        reject(e);
        this.onError(e);
      };
      ws.onmessage = e => this.onMessage(e);
    });
  }

  // 发送消息
  public sendMessage(message: WebRequest) {
    const data = pack(message);
    this.ws?.send(data);
  }

  // 接收消息
  public onMessage(e: MessageEvent<any>) {
    try {
      e.data.arrayBuffer().then((buffer: ArrayBuffer) => {
        const resp = decodeWebSocketResponse(buffer);
        if (resp.messageType === CONST.SERVER_FULL_RESPONSE) {
          this.handleJSONMessage(resp.payload as JSONResponse);
        }
        if (resp.messageType === CONST.SERVER_AUDIO_ONLY_RESPONSE) {
          this.handleAudioOnlyResponse(resp.payload as ArrayBuffer);
        }
        // handleMessage?.(json);
      });
    } catch (e) {
      this.onError(e);
    }
  }

  // 处理音频数据
  private async handleAudioOnlyResponse(data: ArrayBuffer) {
    this.audioChunks.push(data);
    if (!this.playing) {
      this.onStartPlayAudio(data);
      this.playNextAudioChunk();
      this.playing = true;
    }
  }

  // 播放下一个音频块
  private async playNextAudioChunk() {
    const data = this.audioChunks.shift();
    if (!data) {
      this.onStopPlayAudio();
      this.playing = false;
      return;
    }

    // 解码音频数据，把原始二进制转成可播放的 AudioBuffer
    const audioBuffer = await this.audioCtx.decodeAudioData(
      new Uint8Array(data).buffer,
    );

    // 创建一个音频源，准备播放
    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioCtx.destination);
    source.addEventListener('ended', () => this.playNextAudioChunk());
    this.source = source;
    source.start(0);
  }

  // 处理错误
  private onError(e: any) {
    console.error(e);
    this.dispose();
  }

  // 新增: 公共的断开连接方法
  public disconnect() {
    this.dispose(); // 调用私有的清理方法
    // 手动调用一次停止播放回调，确保状态被重置
    if (this.playing) {
        this.onStopPlayAudio();
        this.playing = false;
    }
  }

  // 清理资源
  private dispose() {
    this.ws?.close();
    this.ws = undefined; // 清除引用
    this.reset();
  }

  // 重置音频状态
  private reset() {
    this.audioChunks = [];
    // 移除事件监听器以防内存泄漏 - 注意：直接移除匿名函数可能无效，需要确保 playNextAudioChunk 绑定正确
    // 更好的做法是在 addEventListener 时保存函数引用
    // 为了简单起见，这里暂时保留之前的逻辑，但理想情况下应改进事件监听器处理
    // this.source?.removeEventListener('ended', () => this.playNextAudioChunk()); 
    this.source?.stop();
    this.source = undefined;
    // 注意：这里不重置 playing 状态，让 disconnect 方法来处理
  }
}
