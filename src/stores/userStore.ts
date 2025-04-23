import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 用户基本信息接口
interface UserInfo {
  gender: 'male' | 'female' | null;
  height: number | null;
  weight: number | null;
  targetWeight: number | null;
  birthdate: { year: number; month: number; day: number } | null;
  onboardingCompleted: boolean;
  diseases: string[];
  smokingLevel: number | null; // 0-4
  alcoholLevel: number | null; // 0-4
  exerciseLevel: number | null; // 0-3
}

// 新增：定义风险报告数据项接口并导出
export interface RiskReportItem {
  name: string;
  risk: number;
  [key: string]: any; // 保持与原来一致，允许其他可能的字段
}

// 后端需要的数据格式接口
interface BaseInfos {
  "年龄": number;
  "性别": number; // 男性为1 女性为0
  "身高(101)": number;
  "体重(102)": number;
  "体重指数(6057)": number;
  "吸烟史等级": number;
  "饮酒史等级": number;
  "运动习惯等级": number;
}

// 用户状态接口
interface UserState extends UserInfo {
  riskReportData: RiskReportItem[]; // <-- 使用导出的类型
  // 操作用户信息的方法
  setGender: (gender: 'male' | 'female') => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setTargetWeight: (weight: number) => void;
  setBirthdate: (year: number, month: number, day: number) => void;
  markOnboardingCompleted: () => void;
  setDiseases: (diseases: string[]) => void;
  setSmokingLevel: (level: number) => void;
  setAlcoholLevel: (level: number) => void;
  setExerciseLevel: (level: number) => void;
  setRiskReportData: (data: RiskReportItem[]) => void; // <-- 使用导出的类型
  clearUserData: () => void;
  
  // 新增：获取转换后的数据格式
  getBaseInfos: () => BaseInfos | null;
  getDiseaseInput: () => string[];
}

// 创建用户状态存储
const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      gender: null,
      height: null,
      weight: null,
      targetWeight: null,
      birthdate: null,
      onboardingCompleted: false,
      diseases: [],
      smokingLevel: null,
      alcoholLevel: null,
      exerciseLevel: null,
      riskReportData: [], // 新增：初始化风险报告数据

      // 操作方法
      setGender: (gender) => set({ gender }),
      setHeight: (height) => set({ height }),
      setWeight: (weight) => set({ weight }),
      setTargetWeight: (weight) => set({ targetWeight: weight }),
      setBirthdate: (year, month, day) => set({ birthdate: { year, month, day } }),
      markOnboardingCompleted: () => set({ onboardingCompleted: true }),
      setDiseases: (diseases) => set({ diseases }),
      setSmokingLevel: (level) => set({ smokingLevel: level }),
      setAlcoholLevel: (level) => set({ alcoholLevel: level }),
      setExerciseLevel: (level) => set({ exerciseLevel: level }),
      setRiskReportData: (data) => set({ riskReportData: data }), // 新增：实现更新风险报告数据的方法
      clearUserData: () => set({
        gender: null,
        height: null,
        weight: null,
        targetWeight: null,
        birthdate: null,
        onboardingCompleted: false,
        diseases: [],
        smokingLevel: null,
        alcoholLevel: null,
        exerciseLevel: null,
        riskReportData: [], // 新增：清除风险报告数据
      }),
      
      // 新增：计算年龄的辅助函数
      getBaseInfos: () => {
        const state = get();
        
        // 检查必要数据是否存在
        if (!state.gender || !state.height || !state.weight || !state.birthdate || state.smokingLevel === null || state.alcoholLevel === null || state.exerciseLevel === null) {
          console.warn("用户基础信息不完整，无法生成 BaseInfos");
          return null;
        }
        
        // 计算年龄
        const birthDate = new Date(
          state.birthdate.year, 
          state.birthdate.month - 1, 
          state.birthdate.day
        );
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // 构建 base_infos 对象
        const baseInfos: BaseInfos = {
          "年龄": age,
          "性别": state.gender === 'male' ? 1 : 0,
          "身高(101)": state.height,
          "体重(102)": state.weight,
          "吸烟史等级": state.smokingLevel,
          "饮酒史等级": state.alcoholLevel,
          "运动习惯等级": state.exerciseLevel,
          "体重指数(6057)": 0 // 临时值，将在下一行计算
        };
        
        // 计算 BMI
        baseInfos["体重指数(6057)"] = parseFloat((baseInfos["体重(102)"] / ((baseInfos["身高(101)"] / 100) ** 2)).toFixed(2)); // 保留两位小数
        
        return baseInfos;
      },
      
      // 新增：获取疾病输入
      getDiseaseInput: () => {
        return get().diseases;
      }
    }),
    {
      name: 'user-storage', // 存储的唯一名称
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore; 