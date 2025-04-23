// API基础URL配置
// export const apiBaseUrl = 'https://comorbidity.top/api/v1'; // 生产环境
export const apiBaseUrl = 'http://127.0.0.1:8300/api/v1'; // 本地开发环境

// --- WebSocket URL配置 ---
// 根据后端实际地址配置
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// const wsHost = 'comorbidity.top'; // 生产环境
const wsHost = '127.0.0.1:8300'; // 本地开发环境



const wsPath = '/api/v1/tts/stream'; // 后端WebSocket路由路径


export const apiWsBaseUrl = `${wsProtocol}//${wsHost}${wsPath}`; // 完整的WebSocket URL
