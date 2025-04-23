import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 认证状态接口
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // 操作认证状态的方法
  setToken: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearToken: () => void;
  logout: () => void;
}

// 创建认证状态存储
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      // 操作方法
      setToken: (tokens) => set({ 
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true 
      }),
      clearToken: () => set({ 
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false 
      }),
      logout: () => set({ 
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', // 存储的唯一名称
    }
  )
);

export default useAuthStore; 