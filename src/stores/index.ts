// 导出所有状态存储模块
export { default as useUserStore } from './userStore';
export { default as useAuthStore } from './authStore';
export { default as useChatStore } from './chatStore';

// 重新导出类型
export type { AIAssistant, ChatMessage, FilePreview } from './chatStore';

// 提供一个方便的hook来获取所有状态
import { useCallback } from 'react';
import useUserStore from './userStore';
import useAuthStore from './authStore';
import useChatStore from './chatStore';

/**
 * 使用所有存储的组合hook
 * 用于在组件中一次性访问所有状态
 */
export const useAppStore = () => {
  // 获取各个存储的状态和方法
  const user = useUserStore();
  const auth = useAuthStore();
  const chat = useChatStore();

  // 清除所有应用数据的方便方法
  const clearAllData = useCallback(() => {
    user.clearUserData();
    auth.logout();
    chat.resetAllChats();
  }, [user, auth, chat]);

  return {
    user,
    auth,
    chat,
    clearAllData
  };
};

/**
 * 通用的类型声明，获取Zustand存储的状态类型
 */
export type UserState = ReturnType<typeof useUserStore>;
export type AuthState = ReturnType<typeof useAuthStore>;
export type ChatState = ReturnType<typeof useChatStore>; 