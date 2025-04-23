import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, FileText, ArrowUpRight, Utensils, Vegan, Egg, Milk, Info, X as CancelIcon, Loader2 } from 'lucide-react';
import StatusBar from '../components/StatusBar';
import axios from 'axios';
import { apiBaseUrl } from '@/config/api';
import useAuthStore from '@/stores/authStore';
import useUserStore from '@/stores/userStore';
import { toast } from '@/components/ui/use-toast';

const FoodAIPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'ingredient' | 'meal' | null>(null);
  const [shouldShowIngredientModal, setShouldShowIngredientModal] = useState(true);
  const [shouldShowMealModal, setShouldShowMealModal] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadContext, setCurrentUploadContext] = useState<'ingredient' | 'meal' | null>(null);
  
  const userBaseInfo = useMemo(() => {
    return useUserStore.getState().getBaseInfos();
  }, []);
  
  const recommendedCalories = useMemo(() => {
    const calculateRecommendedCalories = () => {
      if (!userBaseInfo) {
        return {
          calories: 2000,
          isPersonalized: false,
          bmiCategory: ''
        };
      }
      
      const { "年龄": age, "性别": gender, "身高(101)": height, "体重(102)": weight, "体重指数(6057)": bmi, "运动习惯等级": exerciseLevel } = userBaseInfo;
      
      let bmiCategory = '';
      if (bmi < 18.5) bmiCategory = '偏瘦';
      else if (bmi < 24) bmiCategory = '正常';
      else if (bmi < 28) bmiCategory = '超重';
      else bmiCategory = '肥胖';
      
      let bmr = 0;
      if (gender === 1) {
        bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
      } else {
        bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
      }
      
      const activityMultipliers = [1.2, 1.375, 1.55, 1.725];
      const activityMultiplier = exerciseLevel !== null && exerciseLevel < activityMultipliers.length 
        ? activityMultipliers[exerciseLevel] 
        : 1.2;
      
      const totalCalories = Math.round(bmr * activityMultiplier);
      
      return {
        calories: totalCalories,
        isPersonalized: true,
        bmiCategory
      };
    };
    
    return calculateRecommendedCalories();
  }, [userBaseInfo]);

  useEffect(() => {
    const hideIngredientGuidance = localStorage.getItem('hideIngredientGuidance');
    if (hideIngredientGuidance === 'true') {
    //   setShouldShowIngredientModal(false);
    }
    const hideMealGuidance = localStorage.getItem('hideMealImageGuidance');
    if (hideMealGuidance === 'true') {
    //   setShouldShowMealModal(false);
    }
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  const handleTakeIngredientPhotoClick = () => {
    if (shouldShowIngredientModal) {
      setModalContext('ingredient');
      setIsModalOpen(true);
    } else {
      setCurrentUploadContext('ingredient');
      proceedToIngredientCamera();
    }
  };

  const handleTakeMealPhotoClick = () => {
    if (shouldShowMealModal) {
      setModalContext('meal');
      setIsModalOpen(true);
    } else {
      setCurrentUploadContext('meal');
      proceedToMealCamera();
    }
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    setCurrentUploadContext(modalContext);
    if (modalContext === 'ingredient') {
      proceedToIngredientCamera();
    } else if (modalContext === 'meal') {
      proceedToMealCamera();
    }
    setModalContext(null);
  };

  const handleModalDismiss = () => {
    setIsModalOpen(false);
    if (modalContext === 'ingredient') {
    //   setShouldShowIngredientModal(false);
    } else if (modalContext === 'meal') {
    //   setShouldShowMealModal(false);
    }
    setModalContext(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        uploadImage(selectedFile, currentUploadContext);
      } else {
        toast({
          title: "提示",
          description: "请选择图片文件 (jpg, png, gif)",
          variant: "default",
        });
        setCurrentUploadContext(null);
      }
      event.target.value = '';
    } else {
      setCurrentUploadContext(null);
    }
  };

  const uploadImage = async (file: File, context: 'ingredient' | 'meal' | null) => {
    console.log('[uploadImage] 开始上传图片:', file.name, '上下文:', context);
    if (!context) {
       console.error('[uploadImage] 上下文无效，取消上传:', context);
       toast({
           title: "错误",
           description: "操作上下文丢失，请重试",
           variant: "destructive",
       });
       setCurrentUploadContext(null);
       return;
    }
    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${apiBaseUrl}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });

      if (response.data && response.data.success) {
        const imageUrl = response.data.url;
        console.log('[uploadImage] 图片上传成功, URL:', imageUrl);
        console.log('[uploadImage] 当前上下文:', context);
        
        if (context === 'ingredient') {
          console.log('[uploadImage] 准备导航到菜谱大师 (ID: 3)');
          navigate('/aichat', { 
            state: { 
              targetAssistantId: '3', 
              initialMessage: "万能的bot，帮我看看我这些食材可以做成什么好吃的菜哦~",
              imageUrl: imageUrl
            } 
          });
          console.log('[uploadImage] navigate 调用完成 (菜谱大师)');
        } else if (context === 'meal') {
          console.log('[uploadImage] 准备导航到卡路里专家 (ID: 2)');
          navigate('/aichat', { 
            state: { 
              targetAssistantId: '2', 
              initialMessage: "神奇的大厨你好，帮我看看我这餐健康不，有没有热量超标，给点建议~",
              imageUrl: imageUrl
            } 
          });
           console.log('[uploadImage] navigate 调用完成 (卡路里专家)');
        }
      } else {
        console.error('[uploadImage] 图片上传失败:', response.data?.error);
        toast({
          title: "错误",
          description: `图片上传失败: ${response.data?.error || '未知错误'}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('[uploadImage] 图片上传请求出错:', error);
      const errorMsg = error.response?.data?.detail || error.message || '网络错误';
      toast({
        title: "错误",
        description: `图片上传请求出错: ${errorMsg}`,
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      setCurrentUploadContext(null);
      console.log('[uploadImage] 上传流程结束');
    }
  };

  const proceedToIngredientCamera = () => {
    console.log("准备触发 食材 文件输入...");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const proceedToMealCamera = () => {
    console.log("准备触发 餐食 文件输入...");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleViewCommonFoods = () => {
    navigate('/common-food');
  };

  const recommendedRecipes = [
    { id: 1, name: '香橙鸡胸肉\n藜麦沙拉' },
    { id: 2, name: '猪里脊豆腐\n海带汤' },
    { id: 3, name: '蒜香西兰花\n炒虾仁' },
    { id: 4, name: '紫薯燕麦\n能量碗' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <StatusBar />

      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-black">
        <button onClick={goBack} className="p-2">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">食刻AI</h1>
        <div className="flex items-center space-x-2">
           <div className="flex items-center space-x-1 p-1.5 rounded-full bg-gray-700/50">
             <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
             <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
             <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
           </div>
           <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
           </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/gif"
        disabled={isUploadingImage}
      />

      <div className="flex-grow overflow-y-auto px-4 pt-4 pb-8 space-y-6">

        {/* 每日推荐摄入卡片 - 重新设计版本 */}
        <div
          className="rounded-3xl p-5 flex flex-col relative overflow-hidden shadow-lg"
          style={{ background: '#232427' }}
        >
          {/* 标题部分 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-white text-xl font-bold leading-tight">每日推荐摄入</div>
              {recommendedCalories.isPersonalized && (
                <div className="ml-2 px-2 py-0.5 bg-[#4DE6C1]/20 text-[#4DE6C1] text-xs font-medium rounded-full">
                  基于代谢公式
                </div>
              )}
            </div>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#35363A]">
              <Info size={16} className="text-[#B2B2B2]" />
            </button>
          </div>
          
          {/* 推荐摄入信息 */}
          <div className="flex items-center mb-4">
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="text-white text-4xl font-bold">{recommendedCalories.calories}</span>
                <span className="text-[#B2B2B2] text-xl ml-1">卡路里</span>
              </div>
              <div className="text-[#B2B2B2] text-xs mt-1">
                {recommendedCalories.isPersonalized 
                  ? 'Harris-Benedict 代谢公式计算' 
                  : '基于标准成年人平均推荐值'}
              </div>
            </div>
            
            {userBaseInfo && (
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-[#4DE6C1] ml-auto">
                <div className="flex flex-col items-center">
                  <div className="text-[#4DE6C1] text-xl font-bold">{userBaseInfo["体重指数(6057)"]}</div>
                  <div className="text-[#B2B2B2] text-xs">BMI</div>
                </div>
              </div>
            )}
          </div>
          
          {/* 个性化提示信息 */}
          {recommendedCalories.isPersonalized ? (
            <div className="bg-[#35363A] rounded-lg p-3 mb-4">
              <div className="text-white text-sm font-medium">您的身体质量指数属于"{recommendedCalories.bmiCategory}"</div>
              <div className="text-[#B2B2B2] text-xs mt-1">
                基于Harris-Benedict公式，考虑您的性别、年龄({userBaseInfo?.["年龄"]}岁)、身高({userBaseInfo?.["身高(101)"]}cm)、
                体重({userBaseInfo?.["体重(102)"]}kg)及运动习惯计算
              </div>
            </div>
          ) : (
            <div className="bg-[#35363A] rounded-lg p-3 mb-4">
              <div className="text-white text-sm font-medium">完善个人信息获取科学推荐</div>
              <div className="text-[#B2B2B2] text-xs mt-1">
                更新您的生理参数后，系统将使用Harris-Benedict代谢公式为您提供更准确的每日能量需求估算
              </div>
            </div>
          )}
          
          {/* 分割线 */}
          <div className="h-px w-full bg-[#35363A] my-3"></div>
          
          {/* 常见食物热量 */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-white text-base font-semibold">常见食物热量</div>
            <button 
              onClick={handleViewCommonFoods}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#35363A] hover:bg-[#4a4b4f] transition-colors"
            >
               <ArrowUpRight size={16} className="text-[#B2B2B2]" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-1">
            {/* 糯米饭 */}
            <div className="flex flex-col items-center bg-[#4F3A3A] rounded-xl px-2 py-3 shadow-sm">
              <div className="w-8 h-8 mb-1.5 flex items-center justify-center rounded-full bg-[#D47C9A]">
                <Utensils size={16} className="text-white" />
              </div>
              <div className="text-white text-xs font-semibold">糯米饭</div>
              <div className="text-[#B2B2B2] text-[11px] mt-0.5">111cal</div>
            </div>
            {/* 老豆腐 */}
            <div className="flex flex-col items-center bg-[#403A4F] rounded-xl px-2 py-3 shadow-sm">
              <div className="w-8 h-8 mb-1.5 flex items-center justify-center rounded-full bg-[#8E84D4]">
                 <Vegan size={16} className="text-white" />
              </div>
              <div className="text-white text-xs font-semibold">老豆腐</div>
              <div className="text-[#B2B2B2] text-[11px] mt-0.5">93 cal</div>
            </div>
            {/* 煎蛋 */}
            <div className="flex flex-col items-center bg-[#4F443A] rounded-xl px-2 py-3 shadow-sm">
              <div className="w-8 h-8 mb-1.5 flex items-center justify-center rounded-full bg-[#D4A97C]">
                 <Egg size={16} className="text-white" />
              </div>
              <div className="text-white text-xs font-semibold">煎蛋</div>
              <div className="text-[#B2B2B2] text-[11px] mt-0.5">200 cal</div>
            </div>
            {/* 鲜牛奶 */}
            <div className="flex flex-col items-center bg-[#3A4A4F] rounded-xl px-2 py-3 shadow-sm">
              <div className="w-8 h-8 mb-1.5 flex items-center justify-center rounded-full bg-[#7CC8D4]">
                 <Milk size={16} className="text-white" />
              </div>
              <div className="text-white text-xs font-semibold">鲜牛奶</div>
              <div className="text-[#B2B2B2] text-[11px] mt-0.5">66 cal</div>
            </div>
          </div>
        </div>

        <h1 className='text-white text-2xl font-bold mb-4'>AI食物图像分析</h1>

        <div
          className="rounded-3xl p-5 relative overflow-hidden min-h-[220px] flex flex-col justify-between"
          style={{ backgroundColor: '#6B76F7' }}
        >
           <img
            src="/public/ai互动/拍摄食材的背景图.png"
            alt="蔬菜食材背景"
            className="absolute -bottom-8 -right-10 w-[280px] h-auto object-contain pointer-events-none z-0 opacity-90"
            />

          <div className='relative z-10 flex flex-col h-full'>
            <h2 className="text-white text-xl font-bold mb-1.5">拍摄食材获得AI健康食谱</h2>
            <p className="text-white/80 text-xs mb-6 max-w-[60%]">
              点击拍摄按钮，按指引向菜谱大师助手拍摄食材照片获取健康菜谱建议
            </p>
            <div className="mt-auto">
              <button
                onClick={handleTakeIngredientPhotoClick}
                className="inline-flex items-center bg-white text-[#4B56D0] font-semibold py-3 px-6 rounded-full shadow-md hover:bg-gray-100 transition-colors text-sm"
                disabled={isUploadingImage}
              >
                <Camera size={16} className="mr-2" />
                拍摄食材
              </button>
            </div>
          </div>
        </div>

        <div
          className="rounded-3xl p-5 relative overflow-hidden min-h-[220px] flex flex-col justify-between"
          style={{ backgroundColor: '#D16D9B' }}
        >
           <img
            src="/public/ai互动/拍摄餐食的背景图.png"
            alt="烤鸡餐食背景"
            className="absolute -bottom-4 -right-12 w-[280px] h-auto object-contain pointer-events-none z-0 opacity-95"
            />

           <div className='relative z-10 flex flex-col h-full'>
             <h2 className="text-white text-xl font-bold mb-1.5">拍摄食物获取饮食健康报告</h2>
             <p className="text-white/80 text-xs mb-6 max-w-[60%]">
               点击拍摄按钮，按指引向卡路里专家助手拍摄当餐食物照片获取饮食健康评价
             </p>
             <div className="mt-auto">
               <button
                  onClick={handleTakeMealPhotoClick}
                  className="inline-flex items-center bg-white text-[#B64E81] font-semibold py-3 px-6 rounded-full shadow-md hover:bg-gray-100 transition-colors text-sm"
                  disabled={isUploadingImage}
                >
                 <Camera size={16} className="mr-2" />
                 拍摄餐食
               </button>
             </div>
           </div>
        </div>

      </div>

      {/* 新增：内联模态框，样式参考 HomePage */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={handleModalDismiss}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col items-center relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleModalDismiss}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
              aria-label="关闭模态框"
              disabled={isUploadingImage}
            >
              <CancelIcon size={24} />
            </button>

            <img
              src="/食材提示.png"
              alt={`${modalContext === 'ingredient' ? '食材' : '餐食'}拍摄提示`}
              className="w-full max-w-xs h-auto rounded-xl mb-6 shadow-lg"
            />

            <div className="flex w-full space-x-4">
              <button
                onClick={handleModalDismiss}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                disabled={isUploadingImage}
              >
                不再提示
              </button>
              <button
                onClick={handleModalConfirm}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center ${isUploadingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    处理中...
                  </>
                ) : (
                  '确认'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FoodAIPage;
