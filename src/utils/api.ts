import { getAuthToken } from './storage';
import useAuthStore from '../stores/authStore';

// API基础URL
const API_BASE_URL = '/api/v1';

// 创建请求选项
interface RequestOptions extends RequestInit {
  authenticated?: boolean;
}

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  data?: T;
}

/**
 * 发送API请求的辅助函数
 * @param endpoint API端点
 * @param options 请求选项
 * @returns 返回解析后的响应数据
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { authenticated = true, headers = {}, ...restOptions } = options;
  
  // 构建完整URL
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 设置默认请求头
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  // 如果需要认证，添加Authorization头
  if (authenticated) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  
  // 发送请求
  const response = await fetch(url, {
    ...restOptions,
    headers: defaultHeaders,
  });
  
  // 解析响应
  const data = await response.json();
  
  // 检查是否成功
  if (!response.ok) {
    // 处理401错误（未授权）
    if (response.status === 401) {
      // 可以在这里添加重定向到登录页面的逻辑
      console.error('身份验证失败，请重新登录');
    }
    
    throw new Error(data.message || '请求失败');
  }
  
  return data as ApiResponse<T>;
}

/**
 * 发送GET请求
 */
export function get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET', ...options });
}

/**
 * 发送POST请求
 */
export function post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 发送PUT请求
 */
export function put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 发送DELETE请求
 */
export function del<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE', ...options });
}

/**
 * 发送表单数据POST请求（适用于登录/注册）
 */
export async function postFormData<T>(endpoint: string, formData: FormData, authenticated = false): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {};
  
  if (authenticated) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }
  
  return data as ApiResponse<T>;
} 