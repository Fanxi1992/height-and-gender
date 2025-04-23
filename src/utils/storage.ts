// 用户信息存储的键名
export const STORAGE_KEYS = {
  GENDER: 'app_user_gender',
  HEIGHT: 'app_user_height',
  WEIGHT: 'app_user_weight',
  TARGET_WEIGHT: 'app_user_target_weight',
  BIRTHDATE: 'app_user_birthdate',
  ONBOARDING_COMPLETED: 'app_onboarding_completed',
  AUTH_TOKEN: 'auth_token',
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

// 保存体重信息
export const saveWeight = (weight: number): void => {
  localStorage.setItem(STORAGE_KEYS.WEIGHT, weight.toString());
};

// 获取体重信息
export const getWeight = (): number | null => {
  const weight = localStorage.getItem(STORAGE_KEYS.WEIGHT);
  return weight ? parseFloat(weight) : null;
};

// 保存目标体重信息
export const saveTargetWeight = (weight: number): void => {
  localStorage.setItem(STORAGE_KEYS.TARGET_WEIGHT, weight.toString());
};

// 获取目标体重信息
export const getTargetWeight = (): number | null => {
  const weight = localStorage.getItem(STORAGE_KEYS.TARGET_WEIGHT);
  return weight ? parseFloat(weight) : null;
};

// 保存出生日期信息
export const saveBirthdate = (year: number, month: number, day: number): void => {
  const birthdate = `${year}-${month}-${day}`;
  localStorage.setItem(STORAGE_KEYS.BIRTHDATE, birthdate);
};

// 获取出生日期信息
export const getBirthdate = (): { year: number; month: number; day: number } | null => {
  const birthdate = localStorage.getItem(STORAGE_KEYS.BIRTHDATE);
  if (!birthdate) return null;
  
  const [year, month, day] = birthdate.split('-').map(Number);
  return { year, month, day };
};

// 标记引导流程已完成
export const markOnboardingCompleted = (): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
};

// 检查引导流程是否已完成
export const isOnboardingCompleted = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
};

// 保存认证令牌
export const saveAuthToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

// 获取认证令牌
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// 移除认证令牌（登出时使用）
export const removeAuthToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// 清除所有存储的用户数据
export const clearUserData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.GENDER);
  localStorage.removeItem(STORAGE_KEYS.HEIGHT);
  localStorage.removeItem(STORAGE_KEYS.WEIGHT);
  localStorage.removeItem(STORAGE_KEYS.TARGET_WEIGHT);
  localStorage.removeItem(STORAGE_KEYS.BIRTHDATE);
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

// 保存疾病信息
export const saveDiseases = (diseases: string[]) => {
  localStorage.setItem('diseases', JSON.stringify(diseases));
};

// 获取疾病信息
export const getDiseases = (): string[] => {
  const diseases = localStorage.getItem('diseases');
  return diseases ? JSON.parse(diseases) : [];
};
