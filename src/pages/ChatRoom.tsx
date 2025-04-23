import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Image, X, Users, Smile, AlertCircle } from 'lucide-react'; // 引入所需图标
import { MessageMarkdown } from '@/components/MessageMarkdown'; // 导入 Markdown 解析组件

// 后端 WebSocket 和 API 地址 (根据实际部署情况修改)
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = 'comorbidity.top'; // 修改为你的后端主机和端口
// 本地开发时，通常是 ws://localhost:8000 和 http://localhost:8000
const port = window.location.protocol === 'https:' ? '443' : '8300';
const BACKEND_WS_URL = `${wsProtocol}//${window.location.hostname}:${port}/api/v1/chatroom`;
const BACKEND_API_URL = `${window.location.protocol}//${window.location.hostname}:${port}/api/v1/chatroom`;

// 1. 更克制的全局自定义CSS，去掉浮夸发光和动画，阴影变淡
const styles = `
  @keyframes highlight-pulse {
    0% { background-color: rgba(99, 102, 241, 0.18); }
    50% { background-color: rgba(99, 102, 241, 0.10); }
    100% { background-color: rgba(99, 102, 241, 0); }
  }
  .highlight-mention {
    animation: highlight-pulse 1.2s ease-in-out;
    scroll-margin-top: 50vh;
  }
  .system-message {
    transition: opacity 0.3s ease;
    opacity: 0.92;
    backdrop-filter: blur(6px) saturate(1.2);
    box-shadow: 0 2px 8px 0 rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.10);
  }
  .glass-panel {
    background: rgba(30, 41, 59, 0.45);
    backdrop-filter: blur(10px) saturate(1.1);
    border-radius: 1.2rem;
    border: 1px solid rgba(99,102,241,0.10);
    box-shadow: 0 2px 12px 0 rgba(99,102,241,0.06);
  }
  .glow-border {
    border: 1.5px solid rgba(99,102,241,0.13);
    background: none;
    box-shadow: none;
  }
  ::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #363b4d;
    border-radius: 8px;
  }
  .btn-glow {
    transition: background 0.18s, color 0.18s;
    box-shadow: none;
  }
  .btn-glow:hover {
    background: #3b4266;
    color: #fff;
    box-shadow: none;
  }
`;

// 定义消息类型接口
interface Message {
  id?: string;
  sender: {
    id: string;
    name: string;
  };
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
  type?: string;
  timestamp?: string;
  mentions?: string[];  // 添加mentions字段，存储被@的用户ID
  replyTo?: string;     // 添加replyTo字段，表示这条消息是对谁的回复
}

// 定义系统消息的发送者，用于所有系统消息
const SYSTEM_SENDER = {
  id: 'system',
  name: '系统'
};

// 定义用户接口
interface User {
  id: string;
  name: string;
}

// 生成随机字符串的辅助函数
const generateRandomId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// 生成随机昵称的辅助函数
const generateRandomName = () => {
  const adjectives = ["快乐的", "勇敢的", "聪明的", "神秘的", "活泼的", "优雅的", "机智的", "善良的", "耐心的", "热情的"];
  const nouns = ["猫咪", "狐狸", "老虎", "小鸟", "开发者", "探险家", "旅行者", "科学家", "艺术家", "工程师"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

const ChatRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // 使用 useLocation 获取 state

  // 状态管理
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [aiAgents, setAiAgents] = useState<User[]>([]); // 新增：专门管理AI代理用户
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false); // 在移动设备上控制用户列表的显示
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false); // 添加延迟显示连接状态的变量
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3秒
  
  // @功能相关状态
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [unreadMentions, setUnreadMentions] = useState<string[]>([]); // 存储未读@消息ID
  const [hasNewMention, setHasNewMention] = useState(false); // 用于显示有新@提醒
  const [roomName, setRoomName] = useState<string | null>(null);

  // refs
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesAreaRef = useRef<HTMLDivElement | null>(null);
  const oldestMessageTimestamp = useRef<string | null>(null);
  const initialLoadComplete = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionListRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // 新增：防止多次重连的锁
  const reconnectingRef = useRef(false);

  // 新增: 加载聊天室信息，包括AI代理
  const fetchChatRoomInfo = useCallback(async () => {
    if (!roomId) return;
    try {
      console.log(`加载聊天室 ${roomId} 详细信息...`);
      const response = await fetch(`${BACKEND_API_URL}/api/chatrooms/${roomId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const roomInfo = await response.json();
      console.log(`聊天室信息加载成功:`, roomInfo);
      // 设置聊天室名称 (仅当 state 中没有或者 API 返回了更准确的名称时更新)
      if (roomInfo.name && roomInfo.name !== roomName) {
        setRoomName(roomInfo.name);
        console.log(`通过 API 更新聊天室名称为: ${roomInfo.name}`);
      } else if (!roomName) {
        // 如果 state 和 API 都没有提供名称，使用 roomId 作为备用
        setRoomName(roomId || '未知聊天室');
        console.warn(`State 和 API 均未提供聊天室名称，使用 Room ID: ${roomId}`);
      }
      // 如果聊天室有AI代理，将它们添加到AI代理列表中
      if (roomInfo.agents && roomInfo.agents.length > 0) {
        console.log(`聊天室有 ${roomInfo.agents.length} 个AI代理`);
        const aiAgentsList = roomInfo.agents.map(agent => ({
          id: agent.id,
          name: agent.name
        }));
        // 将AI代理设置到独立的状态中，不再合并到用户列表中
        setAiAgents(aiAgentsList);
      }
    } catch (err) {
      console.error(`加载聊天室信息失败:`, err);
    }
  }, [roomId, location.state?.roomName, setRoomName]);

  // --- 历史消息加载函数 ---
  const fetchHistory = useCallback(async (beforeTimestamp = null) => {
    if (isLoadingHistory || !roomId) return Promise.resolve();
    setIsLoadingHistory(true);
    setError(null);
    
    // 使用合适的消息数量
    const limit = 20; 
    const url = getHistoryApiUrl(roomId, beforeTimestamp, limit);
    console.log(`正在加载历史消息: ${url}`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('历史消息API返回数据:', data);
      
      // 检测返回格式，应对新旧两种API结构
      let historyMessages;
      
      // 判断响应是数组还是对象
      if (Array.isArray(data)) {
        // 旧API格式：直接返回消息数组
        historyMessages = data;
        console.log(`收到 ${historyMessages.length} 条历史消息 (旧API格式)`);
      } else if (data.success && Array.isArray(data.messages)) {
        // 新API格式：成功响应包含messages数组
        historyMessages = data.messages;
        console.log(`收到 ${historyMessages.length} 条历史消息 (新API格式)`);
      } else {
        // 其他情况，可能是错误响应或格式变更
        console.error('无法解析API返回的历史消息数据:', data);
        historyMessages = [];
      }
      
      if (historyMessages.length > 0) {
        // 保存最早消息的时间戳，用于下次加载更多
        oldestMessageTimestamp.current = historyMessages[0].timestamp;
        
        // 在更新状态前保存滚动位置信息
        const prevScrollHeight = messagesAreaRef.current?.scrollHeight || 0;
        const prevScrollTop = messagesAreaRef.current?.scrollTop || 0;
        
        // 更新消息状态
        setMessages((prevMessages) => {
          // 过滤掉重复的消息
          const newMessages = historyMessages.filter(
            msg => !prevMessages.some(prevMsg => prevMsg.id === msg.id)
          );
          // 追加到现有消息前面
          return [...newMessages, ...prevMessages];
        });
        
        // 判断是否还有更多历史消息
        if (Array.isArray(data)) {
          // 旧API逻辑
          setHasMoreHistory(historyMessages.length >= limit);
        } else if (data.pagination) {
          // 新API逻辑
          setHasMoreHistory(data.pagination.has_more);
        } else {
          setHasMoreHistory(historyMessages.length >= limit);
        }
        
        // 等待DOM更新后恢复滚动位置
        if (!initialLoadComplete.current) {
          // 首次加载时滚动到底部
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 100);
        } else {
          // 加载更多历史时保持相对滚动位置
          setTimeout(() => {
            if (messagesAreaRef.current) {
              const newScrollHeight = messagesAreaRef.current.scrollHeight;
              const heightDiff = newScrollHeight - prevScrollHeight;
              messagesAreaRef.current.scrollTop = prevScrollTop + heightDiff;
            }
          }, 50);
        }
      } else {
        // 没有更多历史消息
        setHasMoreHistory(false);
        console.log("没有历史消息或已到达最早消息");
      }
      
      return new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      
    } catch (err) {
      console.error('加载历史消息失败:', err);
      setError('加载历史消息失败，请稍后重试。');
      return Promise.reject(err);
    } finally {
      setIsLoadingHistory(false);
      if (!initialLoadComplete.current) {
        initialLoadComplete.current = true;
      }
    }
  }, [isLoadingHistory, roomId]);

  // --- WebSocket 连接管理 ---
  const connectWebSocket = useCallback(() => {
    if (!userId || !userName || !roomId) {
      console.log("WebSocket 连接条件不满足。");
      return;
    }
    // 如果正在重连，直接返回，防止多次重连
    if (reconnectingRef.current) {
      console.log("正在重连中，跳过本次连接尝试");
      return;
    }
    // 如果已有连接且未关闭，先关闭
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      try {
        ws.current.close(4000, "重连前主动关闭旧连接");
      } catch (e) {}
      ws.current = null;
    }
    setIsConnecting(true);
    setError(null);
    const wsUrl = getWebSocketUrl(userId, userName, roomId);
    console.log(`正在连接 WebSocket: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    ws.current = socket;
    reconnectingRef.current = false; // 连接开始，重连锁解除

    socket.onopen = () => {
      console.log('WebSocket 连接成功');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      setReconnectAttempts(0);
      reconnectingRef.current = false;
      // 只在首次连接时加载历史消息
      if (!initialLoadComplete.current) {
        initialLoadComplete.current = true;
        fetchHistory();
      }
      // 连接成功后，加载聊天室信息，包括AI代理
      fetchChatRoomInfo();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('收到消息:', message);

        if (message.type === 'message') {
          // 调试信息，帮助排查问题
          console.log('收到新消息, ID:', message.id, 'Content:', message.content);
          
          setMessages((prevMessages) => {
            // 检查消息是否已存在，避免重复
            if (message.id && prevMessages.some(msg => msg.id === message.id)) {
              console.log('消息已存在，忽略', message.id);
              return prevMessages;
            }
            
            // 检查是否已经有相同内容且是当前用户发送的本地消息
            // 这用于处理本地添加的消息与服务器广播回来的消息重复的情况
            const isDuplicate = message.sender && message.sender.id === userId && 
              prevMessages.some(msg => 
                msg.sender && msg.sender.id === userId && 
                msg.content === message.content && 
                msg.id?.startsWith('local_')
              );
              
            if (isDuplicate) {
              console.log('检测到重复的本地消息和服务器消息，将替换本地消息');
              // 用服务器消息替换本地消息
              return prevMessages.map(msg => 
                (msg.sender && msg.sender.id === userId && 
                 msg.content === message.content && 
                 msg.id?.startsWith('local_')) 
                  ? message 
                  : msg
              );
            }
            
            console.log('添加新消息到列表');
            return [...prevMessages, message];
          });
        } else if (message.type === 'user_list_update') {
          // 更新用户列表，但只处理真实用户(非AI代理)
          // AI代理存储在独立的状态中，不会被WebSocket更新覆盖
          const realUsers = message.users.filter(user => !user.id.startsWith('agent_'));
          setUsers(realUsers);
        } else if (message.type === 'system') {
          // 为系统消息添加去重逻辑
          setMessages((prevMessages) => {
            // 获取最近的系统消息
            const recentSystemMessages = prevMessages
              .filter(msg => msg.type === 'system')
              .slice(-3);
            
            // 检查是否已存在相同内容的系统消息
            const isDuplicate = recentSystemMessages.some(msg => 
              msg.content === message.content
            );
            
            if (isDuplicate) {
              console.log('检测到重复的系统消息，忽略:', message.content);
              return prevMessages;
            }
            
            // 为系统消息创建标准格式，确保有唯一ID
            console.log('添加新系统消息:', message.content);
            const systemMessage: Message = {
              id: `system_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              type: 'system',
              content: message.content,
              timestamp: new Date().toISOString(),
              messageType: 'SYSTEM',
              sender: SYSTEM_SENDER
            };
            
            // 如果系统消息过多，移除旧的系统消息，保留最新的10条
            const existingSystemMessages = prevMessages.filter(msg => msg.type === 'system');
            if (existingSystemMessages.length >= 10) {
              const nonSystemMessages = prevMessages.filter(msg => msg.type !== 'system');
              const latestSystemMessages = existingSystemMessages.slice(-9);
              return [...nonSystemMessages, ...latestSystemMessages, systemMessage];
            }
            
            return [...prevMessages, systemMessage];
          });
        } else if (message.type === 'mention') {
          // 处理@通知消息
          console.log('收到@通知:', message);
          // 设置有新@提醒标志
          setHasNewMention(true);
          // 添加到未读@消息列表
          if (message.messageId) {
            console.log(`将消息ID ${message.messageId} 添加到未读@列表`);
            // 确保messageId是字符串类型
            const messageIdStr = String(message.messageId);
            setUnreadMentions(prev => {
              if (prev.includes(messageIdStr)) {
                console.log(`消息ID ${messageIdStr} 已在未读列表中`);
                return prev;
              }
              console.log(`添加消息ID ${messageIdStr} 到未读列表`);
              return [...prev, messageIdStr];
            });
          }
        } else {
          console.warn("收到未知类型的消息:", message);
        }
      } catch (err) {
        console.error('处理消息失败:', err);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket 错误:', event);
      setError('WebSocket 连接出错，请检查后端服务或网络连接。');
      setIsConnected(false);
      setIsConnecting(false);
      if (ws.current) {
        try { ws.current.close(4001, "onerror自动关闭"); } catch (e) {}
      }
      ws.current = null;
      // 触发重连
      if (!reconnectingRef.current && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectingRef.current = true;
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, RECONNECT_DELAY);
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket 连接关闭:', event.code, event.reason);
      setIsConnected(false);
      setIsConnecting(false);
      ws.current = null;
      // 触发重连
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setError('连接断开，正在尝试重新连接...');
        if (!reconnectingRef.current) {
          reconnectingRef.current = true;
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, RECONNECT_DELAY);
        }
      } else if (event.code !== 1000) {
        setError('WebSocket 连接意外断开，请刷新页面重试。');
      }
    };
  }, [userId, userName, roomId, fetchHistory, reconnectAttempts, fetchChatRoomInfo]);

  // 返回上一页 (聊天室页面)
  const goBack = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close(1000, "用户离开聊天室");
    }
    navigate(-1);
  };

  // --- 用户身份初始化 ---
  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    let storedUserName = localStorage.getItem('userName');

    if (!storedUserId || !storedUserName) {
      storedUserId = generateRandomId();
      storedUserName = generateRandomName();
      localStorage.setItem('userId', storedUserId);
      localStorage.setItem('userName', storedUserName);
    }
    setUserId(storedUserId);
    setUserName(storedUserName);
    console.log(`用户身份: ${storedUserId} (${storedUserName})`);

    // --- 初始化聊天室名称 --- 
    // 优先从 location.state 获取
    const initialRoomName = location.state?.roomName;
    if (initialRoomName) {
      setRoomName(initialRoomName);
      console.log(`从 navigation state 初始化聊天室名称: ${initialRoomName}`);
    } else if (roomId) {
      // 如果 state 中没有，先用 roomId 作为临时名称，并尝试从API获取
      setRoomName(roomId); // 临时显示 roomId
      console.log(`State 中无 roomName, 临时使用 roomId: ${roomId}, 尝试 API 获取...`);
      fetchChatRoomInfo(); // 尝试从API获取
    } else {
      console.log("无法获取聊天室名称");
    }
    // roomId 的变化也应该触发 fetchChatRoomInfo (如果名称未从 state 获取)
  }, [roomId, location.state?.roomName, fetchChatRoomInfo]);

  // 定义WebSocket连接URL构建函数
  const getWebSocketUrl = (userId: string, userName: string, roomId: string) => {
    return `${BACKEND_WS_URL}/ws/${userId}/${userName}?room_id=${roomId}`;
  };

  // 构建API URL，添加房间ID参数
  const getHistoryApiUrl = (roomId: string, beforeTimestamp: string | null = null, limit: number = 20) => {
    let url = `${BACKEND_API_URL}/api/messages?room_id=${roomId}&limit=${limit}`;
    if (beforeTimestamp) {
      url += `&before_timestamp=${encodeURIComponent(beforeTimestamp)}`;
    }
    return url;
  };

  // 当 userId, userName 和 roomId 设置好后，开始连接 WebSocket
  useEffect(() => {
    if (userId && userName && roomId) {
      // 仅在首次连接或用户信息/房间ID变化时获取房间信息
      // (现在初始化时已处理，这里保留以防万一)
      if (!roomName && initialLoadComplete.current === false) {
         fetchChatRoomInfo();
      }
      connectWebSocket();
    }

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        console.log("组件卸载，关闭 WebSocket");
        ws.current.close(1000, "组件卸载");
      }
      ws.current = null;
    };
  }, [userId, userName, roomId, connectWebSocket, fetchChatRoomInfo, roomName, initialLoadComplete.current]);

  // 延迟显示连接状态提示，避免短暂连接过程中的闪烁
  useEffect(() => {
    let timer: number;
    
    if (isConnecting) {
      // 连接开始后，延迟500ms再显示连接状态
      timer = window.setTimeout(() => {
        setShowConnectionStatus(true);
      }, 500);
    } else {
      // 连接结束后，立即更新状态
      setShowConnectionStatus(false);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isConnecting]);

  // --- 消息发送 ---
  const sendMessage = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && inputValue.trim()) {
      const messageData = {
        type: 'message',
        content: inputValue,
        messageType: 'TEXT',
        mentions: selectedMentions.length > 0 ? selectedMentions : undefined
      };
      ws.current.send(JSON.stringify(messageData));
      console.log('发送消息:', messageData);
      
      // 本地消息已发送但尚未从服务器收到确认的标记
      const pendingMessageContent = inputValue;
      
      setInputValue('');
      // 清空选中的@用户
      setSelectedMentions([]);
    } else {
      console.warn("无法发送消息：WebSocket 未连接或输入为空");
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        setError("连接已断开，无法发送消息。请尝试刷新页面重连。");
      }
    }
  }, [inputValue, userId, userName, selectedMentions]);

  // 处理回车键发送
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // --- 图片上传与发送 ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("选择了文件:", file.name);
      uploadFile(file);
      event.target.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError("连接已断开，无法上传图片。");
      return;
    }
    if (!userId) {
      setError("用户信息丢失，无法上传图片。");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    try {
      console.log(`上传图片到: ${BACKEND_API_URL}/api/upload`);
      const response = await fetch(`${BACKEND_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.url) {
        console.log('图片上传成功:', result.url);
        const imageUrlMessage = {
          type: 'message',
          content: result.url,
          messageType: 'IMAGE',
        };
        ws.current.send(JSON.stringify(imageUrlMessage));
        console.log('发送图片消息:', imageUrlMessage);
      } else {
        console.error('图片上传失败:', result.error || '未知错误');
        setError(`图片上传失败: ${result.error || '服务器内部错误'}`);
      }
    } catch (err: any) {
      console.error('上传文件 fetch 错误:', err);
      setError(`网络错误或服务器无响应: ${err.message}`);
    }
  };

  // --- 图片查看器处理函数 ---
  const openImageViewer = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setShowImageViewer(true);
    console.log('打开图片查看器:', imageUrl);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setCurrentImage(null);
  };

  // --- 切换身份 ---
  const changeIdentity = () => {
    console.log("正在切换身份...");
    // 保存旧身份ID，用于辅助判断重连后是否已经变更身份
    const oldUserId = userId;
    // 保存旧的WebSocket连接，用于发送离开消息
    const oldWs = ws.current;
    // 如果有有效连接，先发送一个用户离开的通知，这样其他用户会看到该用户已离开
    if (oldWs && oldWs.readyState === WebSocket.OPEN) {
      try {
        // 发送离开消息，让服务器清理旧用户身份
        const leaveMessage = {
          type: 'leave',
          reason: 'user_change_identity'
        };
        oldWs.send(JSON.stringify(leaveMessage));
        console.log('发送离开消息:', leaveMessage);
      } catch (err) {
        console.error('发送离开消息失败:', err);
      }
      // 延迟一下再关闭连接，确保消息能发送出去
      setTimeout(() => {
        oldWs.close(1000, "用户切换身份");
        ws.current = null;
      }, 300);
    } else {
      ws.current = null;
    }
    // 重置历史消息控制变量，确保重新加载消息
    oldestMessageTimestamp.current = null;
    setHasMoreHistory(true); // 直接重置为true
    initialLoadComplete.current = false; // 强制重置，确保fetchHistory会重新加载
    // 清除本地存储中的用户信息
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // 重置状态
    setMessages([]);
    setUsers([]);
    setAiAgents([]);
    setIsConnected(false);
    setIsConnecting(true);
    setError(null);
    setReconnectAttempts(0);
    setUnreadMentions([]);
    setHasNewMention(false);
    // 生成新的用户身份
    const newUserId = generateRandomId();
    const newUserName = generateRandomName();
    // 保存到本地存储
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('userName', newUserName);
    // 更新状态（会触发useEffect，自动重连并加载消息）
    setUserId(newUserId);
    setUserName(newUserName);
    console.log(`新用户身份: ${newUserId} (${newUserName})`);
    // 显示身份变更提示，一小段延迟后会被重连的WebSocket连接发来的系统消息覆盖
    const identityChangeMsg: Message = {
      id: `system_identity_${Date.now()}`,
      content: `你的身份已从 ${oldUserId ? localStorage.getItem('userName') || '未知用户' : '初始用户'} 切换为 ${newUserName}`,
      timestamp: new Date().toISOString(),
      messageType: 'SYSTEM',
      type: 'system',
      sender: SYSTEM_SENDER
    };
    setMessages([identityChangeMsg]);
    // WebSocket连接将通过useEffect自动建立，因为userId和userName已更新
  };

  // --- 自动滚动到消息列表底部 ---
  useEffect(() => {
    if (initialLoadComplete.current && !isLoadingHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoadingHistory]);

  // --- 滚动加载更多历史消息 ---
  useEffect(() => {
    const messageArea = messagesAreaRef.current;
    if (!messageArea) return;

    // 使用节流防止频繁触发
    let scrollTimeout: number | null = null;
    let isLoading = false;

    const handleScroll = () => {
      // 防止重复触发
      if (isLoading || !hasMoreHistory || !initialLoadComplete.current) return;

      // 检测是否滚动到顶部附近
      if (messageArea.scrollTop < 100) {
        console.log("接近顶部，准备加载更多历史...");
        
        if (oldestMessageTimestamp.current) {
          isLoading = true;
          fetchHistory(oldestMessageTimestamp.current)
            .finally(() => {
              isLoading = false;
            });
        }
      }
    };

    // 节流函数
    const throttledScrollHandler = () => {
      if (scrollTimeout === null) {
        scrollTimeout = window.setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 300); // 300ms的节流延迟
      }
    };

    messageArea.addEventListener('scroll', throttledScrollHandler);

    return () => {
      messageArea.removeEventListener('scroll', throttledScrollHandler);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [isLoadingHistory, hasMoreHistory, fetchHistory]);

  // --- @功能相关函数 ---
  // 处理输入变化，检测@符号
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // 检测是否输入了@符号
    const atPos = newValue.lastIndexOf('@');
    if (atPos !== -1 && (atPos === 0 || newValue[atPos - 1] === ' ')) {
      // 提取@后面的文本作为过滤条件
      const filterText = newValue.substring(atPos + 1);
      setMentionFilter(filterText);
      setMentionQuery(newValue.substring(0, atPos + 1));
      
      // 计算@下拉菜单位置
      if (inputRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        // 这里位置计算可能需要根据实际DOM结构进行调整
        setMentionPosition({ 
          top: inputRect.top - 200, // 在输入框上方显示，可根据需求调整
          left: inputRect.left + 20
        });
      }
      
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };
  
  // 选择@用户
  const selectMention = (user: User) => {
    // 将@用户名插入到输入框中
    const newInput = mentionQuery + user.name + ' ';
    setInputValue(newInput);
    setShowMentionList(false);
    
    // 记录被@的用户ID
    if (!selectedMentions.includes(user.id)) {
      setSelectedMentions([...selectedMentions, user.id]);
    }
    
    // 聚焦回输入框
    inputRef.current?.focus();
  };
  
  // 清理过期的消息引用
  useEffect(() => {
    // 获取当前存在的所有消息ID
    const currentMessageIds = messages.map(msg => msg.id || '').filter(id => id);
    
    // 清理不再显示的消息引用
    const existingRefs = Object.keys(messageRefs.current);
    existingRefs.forEach(refId => {
      if (!currentMessageIds.includes(refId)) {
        delete messageRefs.current[refId];
      }
    });
  }, [messages]);
  
  // 合并用户列表和AI代理列表用于展示
  const mergedUsersList = useMemo(() => {
    return [...users, ...aiAgents];
  }, [users, aiAgents]);
  
  // 获取过滤后的用户列表
  const filteredUsers = useMemo(() => {
    return mergedUsersList.filter(user => 
      user.id !== userId && // 不显示自己
      user.name.toLowerCase().includes(mentionFilter.toLowerCase())
    );
  }, [mergedUsersList, mentionFilter, userId]);

  // 点击消息区域时关闭@列表
  const handleMessageAreaClick = () => {
    setShowMentionList(false);
  };
  
  // 检查消息元素是否在视图中可见
  const isMessageVisible = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (!messageElement || !messagesAreaRef.current) return false;

    const containerRect = messagesAreaRef.current.getBoundingClientRect();
    const messageRect = messageElement.getBoundingClientRect();

    // 检查消息元素是否至少有一部分在可视区域内
    return (
      messageRect.top < containerRect.bottom &&
      messageRect.bottom > containerRect.top
    );
  };
  
  // 跳转到未读@消息位置
  const scrollToMention = useCallback(() => {
    if (unreadMentions.length === 0) {
      console.log('没有未读@消息');
      return;
    }
    
    // 找到第一个未读@消息的ID
    const messageId = unreadMentions[0];
    console.log(`尝试跳转到消息ID: ${messageId}`);
    console.log(`当前所有消息引用:`, Object.keys(messageRefs.current));
    
    // 查找对应的消息元素
    const messageElement = messageRefs.current[messageId];
    
    if (messageElement) {
      console.log(`找到消息元素:`, messageElement);
      // 确保消息区域存在
      if (messagesAreaRef.current) {
        console.log('开始滚动到消息位置');
        
        // 先尝试将消息区域滚动到顶部，以确保能看到历史消息
        if (oldestMessageTimestamp.current) {
          console.log('先加载历史消息以确保目标消息可见');
          fetchHistory(oldestMessageTimestamp.current);
        }
        
        // 使用setTimeout确保DOM已经更新
        setTimeout(() => {
          try {
            // 直接使用scrollIntoView，确保消息元素在视图中居中显示
            messageElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            
            console.log('滚动执行完成');
          } catch (err) {
            console.error('滚动到消息位置时出错:', err);
          }
        }, 300);
        
        // 从未读列表中移除该消息
        setUnreadMentions(prev => prev.filter(id => id !== messageId));
        
        // 如果没有更多未读@消息，隐藏提示
        if (unreadMentions.length <= 1) {
          setHasNewMention(false);
        }
      }
    } else {
      console.warn(`找不到ID为 ${messageId} 的消息元素，可能需要加载更多历史消息`);
      
      // 尝试加载更多历史消息，然后再次尝试滚动
      if (oldestMessageTimestamp.current && hasMoreHistory) {
        console.log('尝试加载更多历史消息以找到目标消息');
        fetchHistory(oldestMessageTimestamp.current).then(() => {
          // 等待历史消息加载完成后再次尝试滚动
          setTimeout(() => {
            // 重新检查消息元素是否存在
            const updatedMessageElement = messageRefs.current[messageId];
            if (updatedMessageElement) {
              console.log('历史消息加载后找到了目标消息，开始滚动');
              updatedMessageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            } else {
              console.warn('即使加载了更多历史消息，仍然找不到目标消息');
            }
          }, 500);
        });
      }
      
      // 如果找不到元素，从未读列表中移除
      setUnreadMentions(prev => prev.filter(id => id !== messageId));
      if (unreadMentions.length <= 1) {
        setHasNewMention(false);
      }
    }
  }, [unreadMentions, fetchHistory, hasMoreHistory, oldestMessageTimestamp]);
  
  // 检查消息是否在视图中可见，如果可见则从未读列表中移除
  useEffect(() => {
    if (unreadMentions.length === 0) return;
    
    const checkVisibleMentions = () => {
      const stillUnread = unreadMentions.filter(id => !isMessageVisible(id));
      
      if (stillUnread.length !== unreadMentions.length) {
        setUnreadMentions(stillUnread);
        if (stillUnread.length === 0) {
          setHasNewMention(false);
        }
      }
    };
    
    // 创建观察器以检测滚动和其他可能导致可见性变化的事件
    const messagesArea = messagesAreaRef.current;
    if (messagesArea) {
      messagesArea.addEventListener('scroll', checkVisibleMentions);
      // 也检查初始加载时
      checkVisibleMentions();
      
      return () => {
        messagesArea.removeEventListener('scroll', checkVisibleMentions);
      };
    }
  }, [unreadMentions, messages]);

  // ====== 工具函数：格式化日期和时间 ======
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`;
  }
  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function isSameDay(dateStr1: string, dateStr2: string) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }
  function isTimeGapLarge(dateStr1: string, dateStr2: string, gapMinutes = 5) {
    const t1 = new Date(dateStr1).getTime();
    const t2 = new Date(dateStr2).getTime();
    return Math.abs(t2 - t1) > gapMinutes * 60 * 1000;
  }

  // ====== 渲染消息时插入日期/时间分割条 ======
  // 生成带分割条的消息渲染列表
  const renderMessagesWithDividers = useMemo(() => {
    const items: React.ReactNode[] = [];
    let lastMsgTime: string | null = null;
    let lastMsgDay: string | null = null;
    
    // 只处理非系统消息
    const nonSystemMessages = messages.filter(msg => msg.type !== 'system');
    
    nonSystemMessages.forEach((msg, index) => {
      const msgTime = msg.timestamp || '';
      
      // 判断是否新的一天
      if (!lastMsgDay || !isSameDay(lastMsgDay, msgTime)) {
        items.push(
          <div key={`date-divider-${msgTime}`} className="flex justify-center my-4">
            <div className="bg-gray-700/80 text-indigo-100 px-4 py-1 rounded-full text-xs font-bold shadow system-message">
              {formatDate(msgTime)}
            </div>
          </div>
        );
        lastMsgDay = msgTime;
        lastMsgTime = msgTime;
      } else if (lastMsgTime && isTimeGapLarge(lastMsgTime, msgTime, 5)) {
        // 判断是否与上一条消息间隔超过5分钟
        items.push(
          <div key={`time-divider-${msgTime}`} className="flex justify-center my-2">
            <div className="bg-gray-700/60 text-indigo-200 px-3 py-0.5 rounded-full text-xs shadow system-message">
              {formatTime(msgTime)}
            </div>
          </div>
        );
        lastMsgTime = msgTime;
      } else {
        lastMsgTime = msgTime;
      }
      
      // 渲染消息本身
      const isAgent = msg.sender?.id?.startsWith('agent_');
      const isMyMessage = msg.sender?.id === userId;
      const isReplyToMe = msg.replyTo === userId;
      const messageId = msg.id || `msg-${index}-${msg.timestamp || Date.now()}`;
      
      items.push(
        <div 
          key={`${msg.timestamp || index}-${messageId}`} 
          ref={el => messageRefs.current[messageId] = el}
          className={`fade-in duration-200 ${isMyMessage ? 'flex justify-end' : 'flex justify-start'} transition-all ${
            unreadMentions.includes(messageId) ? 'highlight-mention' : ''
          }`}
        >
          <div className={`max-w-[80%] ${isMyMessage ? 'order-2' : 'order-1'}`}> 
            {/* 发送者名称 (仅对非自己消息显示) */}
            {!isMyMessage && (
              <div className="flex items-center ml-2 mb-1 gap-1.5">
                <span className="text-sm font-semibold text-indigo-200">{msg.sender?.name}</span>
                {isAgent && (
                  <span className="bg-cyan-900/30 text-cyan-200 text-[10px] px-1.5 rounded font-bold ml-1">AI</span>
                )}
              </div>
            )}
            
            {/* 回复指示器 */}
            {isReplyToMe && (
              <div className="mb-1 ml-2 text-xs text-cyan-300 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                回复了你
              </div>
            )}
            
            {/* 消息气泡 */}
            <div className={`rounded-2xl p-3 shadow-sm transition-all duration-200
              ${isMyMessage 
                ? 'bg-indigo-700/80 text-white rounded-tr-xl border border-indigo-400/20' 
                : isAgent 
                  ? 'bg-cyan-900/40 border border-cyan-300/20 text-white rounded-tl-xl' 
                  : 'bg-gray-800/90 border border-indigo-700/10 text-white rounded-tl-xl'}
            `}>
              {/* 文本消息 */}
              {msg.messageType === 'TEXT' && (
                <div className="text-base leading-relaxed tracking-wide">
                  <MessageMarkdown content={msg.content} />
                </div>
              )}
              
              {/* 图片消息 */}
              {msg.messageType === 'IMAGE' && (
                <img
                  src={msg.content.startsWith('/') ? `${BACKEND_API_URL}${msg.content}` : msg.content}
                  alt="聊天图片"
                  className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-cyan-400/20 shadow"
                  onClick={() => openImageViewer(msg.content.startsWith('/') ? `${BACKEND_API_URL}${msg.content}` : msg.content)}
                  loading="lazy" // 添加懒加载属性，提高渲染性能
                />
              )}
            </div>
          </div>
        </div>
      );
    });
    
    return items;
  }, [messages, userId, unreadMentions]); // 添加依赖项，只在相关状态变化时重新计算

  // 单独渲染系统消息，避免不必要的重绘
  const systemMessages = useMemo(() => {
    return messages
      .filter(msg => msg.type === 'system')
      .map((msg, index) => (
        <div 
          key={`system-${msg.id || index}`} 
          className="flex justify-center pointer-events-none"
        >
          <div className="bg-gray-800/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-400 max-w-[80%] system-message">
            {msg.content}
          </div>
        </div>
      ));
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* 注入动画CSS */}
      <style>{styles}</style>
      
      {/* Header with Back Button */}
      <div className="flex items-center justify-between px-6 pt-10 pb-3 border-b border-indigo-800/30 bg-gradient-to-r from-gray-900/90 via-indigo-900/80 to-gray-900/90 glass-panel shadow-md sticky top-0 z-20">
        <div className="flex items-center">
          <button 
            onClick={goBack} 
            className="text-indigo-200 hover:text-white mr-4 p-2 rounded-full btn-glow bg-gray-800 border border-indigo-700/20"
            title="返回"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold tracking-wide text-indigo-100 select-none">
            {/* 优先显示 roomName，然后是 roomId，最后是加载中 */}
            {roomName ? roomName : (roomId ? `${roomId}` : '加载中...')}
          </h1>
        </div>
        <button 
          onClick={() => setShowUserList(!showUserList)} 
          className="md:hidden p-2 rounded-full btn-glow text-indigo-200 hover:text-white bg-gray-800 border border-indigo-700/20 relative"
          title="在线用户"
        >
          <Users size={22} />
          <span className="absolute -top-1 -right-1 bg-indigo-500 text-xs text-white w-5 h-5 rounded-full flex items-center justify-center shadow border-2 border-indigo-900">
            {mergedUsersList.length}
          </span>
        </button>
      </div>

      {/* 连接状态提示 */}
      {!isLoadingHistory && ((showConnectionStatus && isConnecting) || error || !isConnected) && (
        <div className={`px-4 py-2 text-sm text-center ${
          isConnecting ? 'bg-yellow-500/20 text-yellow-300' :
          error ? 'bg-red-500/20 text-red-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          <div className="flex items-center justify-center">
            <AlertCircle size={16} className="mr-2" />
            {isConnecting ? '加载中...' :
             error ? `错误: ${error}` :
             '未连接到服务器'}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* 用户列表面板 - 桌面端始终显示，移动端条件显示 */}
        <div className={`${showUserList ? 'block' : 'hidden'} md:block w-full md:w-72 glass-panel glow-border border-indigo-800/20 overflow-y-auto flex flex-col z-30 md:relative absolute inset-0 shadow-md transition-all duration-300`}>
          <div className="p-4 border-b border-indigo-800/20 sticky top-0 bg-gray-900/90 z-10 flex justify-between items-center rounded-t-2xl">
            <h2 className="font-semibold text-indigo-200 flex items-center">
              <Users size={18} className="mr-2 text-cyan-400" />
              在线用户 ({mergedUsersList.length})
            </h2>
            <button 
              onClick={() => setShowUserList(false)}
              className="md:hidden text-indigo-300 hover:text-white p-1 rounded-full btn-glow"
              title="关闭用户列表"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-2">
              {mergedUsersList.map((user) => (
                <li 
                  key={user.id} 
                  className={`px-3 py-2 rounded-xl flex items-center transition-all duration-200 select-none cursor-pointer
                    ${user.id === userId 
                      ? 'bg-indigo-700/40 text-white border border-indigo-400/30' 
                      : user.id.startsWith('agent_')
                        ? 'bg-gray-800/60 text-blue-100 border border-cyan-400/30' 
                        : 'hover:bg-indigo-900/30 text-indigo-100 border border-indigo-700/10'}
                  `}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 text-base font-bold
                    ${user.id === userId 
                      ? 'bg-gradient-to-br from-indigo-500/80 to-cyan-400/60 text-white border border-white/20' 
                      : user.id.startsWith('agent_')
                        ? 'bg-gradient-to-br from-blue-900/60 to-cyan-800/40 text-white border border-cyan-300/40' 
                        : 'bg-gradient-to-br from-indigo-900/60 to-indigo-700/40 text-white border border-indigo-300/10'}
                  `}>
                    {user.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {user.name}
                      {user.id === userId && <span className="ml-1 text-xs text-cyan-200">(你)</span>}
                    </div>
                    {user.id.startsWith('agent_') && (
                      <div className="text-xs text-cyan-300 flex items-center">
                        <span className="bg-cyan-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">AI</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
              {mergedUsersList.length === 0 && (
                <li className="px-3 py-2 text-indigo-400 text-sm italic text-center">
                  暂无用户在线...
                </li>
              )}
            </ul>
          </div>
          <div className="p-3 border-t border-indigo-800/20 bg-gray-900/90 rounded-b-2xl">
            <button 
              onClick={changeIdentity}
              className="w-full py-2 px-3 bg-indigo-700/80 hover:bg-indigo-600/80 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center btn-glow"
            >
              <Smile size={18} className="mr-2" />
              随机切换身份
            </button>
            {userId && userName && (
              <div className="mt-2 text-xs text-center text-indigo-200">
                当前身份: {userName}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Messages Display */}
          <div 
            ref={messagesAreaRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/30"
            onClick={handleMessageAreaClick}
          >
            {/* 加载历史指示器 */}
            {isLoadingHistory && (
              <div className="sticky top-2 mx-auto bg-indigo-600/30 backdrop-blur-sm text-indigo-100 px-4 py-1.5 rounded-full text-xs font-medium z-10 w-fit flex items-center shadow-md">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载历史消息中...
              </div>
            )}
            
            {messages.length === 0 && !isLoadingHistory && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-800/80 flex items-center justify-center">
                  <Smile size={32} className="text-gray-300" />
                </div>
                {/* 使用 roomName 或 roomId 显示欢迎信息 */}
                <p>欢迎来到 <span className="text-indigo-400 font-medium">{roomName || roomId || '聊天室'}</span>！</p>
                <p className="mt-2 text-sm">快来开始聊天吧，所有消息均为匿名</p>
              </div>
            )}
            
            {/* 分开渲染系统消息和用户消息，减少状态变化引起的闪烁 */}
            <div className="relative z-10 space-y-2">
              {systemMessages}
            </div>
            
            {/* 用户消息（带分割条） */}
            <div className="space-y-3 relative z-20">
              {renderMessagesWithDividers}
            </div>
            
            {/* 用于自动滚动的空元素 */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-indigo-800/20 bg-gray-900/90 p-4 glass-panel glow-border shadow-md">
            {/* 有新@提醒的指示器 */}
            {hasNewMention && (
              <div 
                className="mb-2 px-3 py-1.5 bg-indigo-700/20 text-indigo-100 rounded-lg text-sm flex items-center cursor-pointer hover:bg-indigo-700/40 transition-colors shadow"
                onClick={scrollToMention}
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                有人@了你，点击查看 {unreadMentions.length > 1 ? `(${unreadMentions.length})` : ''}
              </div>
            )}
            <div className="flex items-end space-x-3">
              <div className="flex-1 glass-panel glow-border p-2 border border-indigo-700/10 focus-within:border-cyan-400/40 transition-colors">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息... (Shift+Enter 换行) 输入@可提及其他用户"
                  className="w-full bg-transparent resize-none outline-none text-white placeholder-indigo-300 max-h-28 min-h-[2.5rem] text-base font-medium"
                  rows={1}
                  disabled={!isConnected}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isConnected}
                  className={`p-3 rounded-full btn-glow bg-gray-800 border border-indigo-700/20 ${isConnected ? 'hover:bg-indigo-700/40' : 'opacity-60 cursor-not-allowed'}`}
                  title="发送图片"
                >
                  <Image size={20} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!isConnected || !inputValue.trim()}
                  className={`p-3 rounded-full btn-glow bg-indigo-700/80 border border-indigo-700/20 ${isConnected && inputValue.trim() ? 'hover:bg-indigo-600/80' : 'opacity-60 cursor-not-allowed'}`}
                  title="发送消息"
                >
                  <Send size={20} />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 图片查看器 */}
      {showImageViewer && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={closeImageViewer}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-black/30 hover:bg-black/50 p-2 rounded-full transition-colors"
            onClick={closeImageViewer}
          >
            <X size={24} />
          </button>
          <img 
            src={currentImage || ''} 
            alt="查看图片" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* @用户下拉列表 */}
      {showMentionList && filteredUsers.length > 0 && (
        <div 
          ref={mentionListRef}
          className="absolute z-50 glass-panel glow-border border-indigo-800/20 shadow-md overflow-y-auto max-h-60 min-w-[180px]"
          style={{ left: mentionPosition.left, top: mentionPosition.top }}
        >
          <div className="p-2 text-xs text-indigo-300 border-b border-indigo-800/20 font-semibold tracking-wide">
            选择要@的用户
          </div>
          <div className="overflow-y-auto">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="px-3 py-2 hover:bg-indigo-900/30 cursor-pointer flex items-center rounded-lg transition-all duration-150"
                onClick={() => selectMention(user)}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2
                  ${user.id.startsWith('agent_') ? 'bg-cyan-900/40 text-white border border-cyan-300/40' : 'bg-indigo-900/40 text-white border border-indigo-300/10'}`}
                >
                  {user.name.substring(0, 2)}
                </div>
                <div>
                  <div className="text-sm text-white font-semibold">{user.name}</div>
                  {user.id.startsWith('agent_') && (
                    <div className="text-xs text-cyan-300 font-bold">AI 助手</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom; 