
// 用户信息存储的键名
export const STORAGE_KEYS = {
  GENDER: 'app_user_gender',
  HEIGHT: 'app_user_height',
  ONBOARDING_COMPLETED: 'app_onboarding_completed',
};

// 保存性别信息
export const saveGender = (gender: 'male' | 'female'): void => {
  localStorage.setItem(STORAGE_KEYS.GENDER, gender);
};

// 获取性别信息
export const getGender = (): 'male' | 'female' | null => {
  const gender = localStorage.getItem(STORAGE_KEYS.GENDER);
  if (gender === 'male' || gender === 'female') {
    return gender;
  }
  return null;
};

// 保存身高信息
export const saveHeight = (height: number): void => {
  localStorage.setItem(STORAGE_KEYS.HEIGHT, height.toString());
};

// 获取身高信息
export const getHeight = (): number | null => {
  const height = localStorage.getItem(STORAGE_KEYS.HEIGHT);
  return height ? parseInt(height, 10) : null;
};

// 标记引导流程已完成
export const markOnboardingCompleted = (): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
};

// 检查引导流程是否已完成
export const isOnboardingCompleted = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
};

// 清除所有存储的用户数据
export const clearUserData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.GENDER);
  localStorage.removeItem(STORAGE_KEYS.HEIGHT);
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
};
