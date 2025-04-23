import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ArrowRight, MessageCircle, Mic, Activity, Heart, Database, ThumbsUp, Play, RotateCw, User, Utensils, Globe, Flame, Check, X as CancelIcon, Camera, HeartPulse, AlertTriangle, ChefHat, FileText, MessageSquare, Radio, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import QRCodeScannerIcon from '../components/QRCodeScannerIcon';
import { Article, articles } from '../data/articles';
import { Video, videos } from '../data/videos';
import axios from 'axios';
import { apiBaseUrl } from '@/config/api';
import { toast } from '@/components/ui/use-toast';
import useAuthStore from '@/stores/authStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [networkAnimate, setNetworkAnimate] = useState(false);
  const [isTongueModalOpen, setIsTongueModalOpen] = useState(false);
  const [isPalmModalOpen, setIsPalmModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isUploadingPresetImage, setIsUploadingPresetImage] = useState(false);
  const [isUploadingPresetPalmImage, setIsUploadingPresetPalmImage] = useState(false);
  const [isUploadingPresetFaceImage, setIsUploadingPresetFaceImage] = useState(false);

  // 新增：从Knowledge板块取随机内容展示
  const recommendedContent = useMemo(() => {
    // 从三类资讯中随机抽取内容
    const getRandomItems = () => {
      // 1. 将文章按标签分类
      const methodologyArticles = articles.filter(article => article.tag === '#减重方法论');
      const policyArticles = articles.filter(article => article.tag === '#政策热点');
      // 视频已经是单独的数组
      
      // 2. 计算每类要抽取的数量（30%向上取整）
      const methodologyCount = Math.ceil(methodologyArticles.length * 0.3);
      const policyCount = Math.ceil(policyArticles.length * 0.3);
      const videoCount = Math.ceil(videos.length * 0.3);
      
      // 3. 随机抽取内容
      const getRandomItems = (items: any[], count: number) => {
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };
      
      const selectedMethodologies = getRandomItems(methodologyArticles, methodologyCount);
      const selectedPolicies = getRandomItems(policyArticles, policyCount);
      const selectedVideos = getRandomItems(videos, videoCount);
      
      // 4. 转换为统一格式
      const formatArticle = (article: Article) => ({
        id: article.id,
        type: 'article' as const,
        title: article.title,
        image: article.image,
        tag: article.tag.replace('#', ''),
        author: article.source,
        likes: article.likes,
        comments: article.comments,
        articleId: article.id, // 关联到原文章ID
      });
      
      const formatVideo = (video: Video) => ({
        id: video.id,
        type: 'video' as const,
        title: video.title,
        image: video.thumbnail,
        tag: video.source?.split('/')[0] || '专家视频',
        author: video.source?.split('/')[1] || '专家讲座',
        likes: Math.floor(Math.random() * 1000), // 随机生成点赞数
        views: Math.floor(Math.random() * 5000 + 1000), // 随机生成浏览量
        articleId: 0, // 视频没有对应的文章ID，暂时设为0
        videoId: video.id, // 保存原视频ID用于跳转
      });
      
      // 5. 合并所有内容并随机排序
      const allItems = [
        ...selectedMethodologies.map(formatArticle),
        ...selectedPolicies.map(formatArticle),
        ...selectedVideos.map(formatVideo)
      ].sort(() => 0.5 - Math.random());
      
      return allItems;
    };
    
    return getRandomItems();
  }, []);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setNetworkAnimate(true);
      setTimeout(() => setNetworkAnimate(false), 2000);
    }, 6000);

    return () => clearInterval(animationInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (chatbotRef.current && containerRef.current) {
        const rect = chatbotRef.current.getBoundingClientRect();
        setShowFloatingButton(rect.bottom < 0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // --- 页面导航函数 (保持不变) ---
  const goToHealthRiskReport = () => {
    navigate('/health-risk-report');
  };

  const goToHealthTrajectory = () => {
    navigate('/health-trajectory');
  };

  const goToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  const goToCircle = () => {
    navigate('/circle');
  };

  const goToDetailedRisk = () => {
    navigate('/disease-risk-detail');
  };

  const goToAIChat = () => {
    navigate('/aichat');
  };

  const restartRiskAssessment = () => {
    navigate('/gender');
  };

  const goToFoodAI = () => {
    navigate('/food-ai');
  };

  const goToVoiceChat = () => {
    navigate('/voice-chat');
  };

  // 新增：打开舌苔检测模态框
  const openTongueModal = () => {
    setIsTongueModalOpen(true);
  };

  // 新增：关闭舌苔检测模态框
  const closeTongueModal = () => {
    setIsTongueModalOpen(false);
    setIsUploadingPresetImage(false);
  };

  // 新增：打开手相检测模态框
  const openPalmModal = () => {
    setIsPalmModalOpen(true);
  };

  // 新增：关闭手相检测模态框
  const closePalmModal = () => {
    setIsPalmModalOpen(false);
    setIsUploadingPresetPalmImage(false);
  };

  // 新增：打开面相检测模态框
  const openFaceModal = () => {
    setIsFaceModalOpen(true);
  };

  // 新增：关闭面相检测模态框
  const closeFaceModal = () => {
    setIsFaceModalOpen(false);
    setIsUploadingPresetFaceImage(false);
  };

  // --- 新增: 处理舌苔图片上传和导航的函数 ---
  const handleTongueConfirm = async () => {
    if (isUploadingPresetImage) return;
    setIsUploadingPresetImage(true);

    try {
      // 1. 获取预设图片 Blob
      console.log("开始获取舌苔图片 Blob...");
      const imageResponse = await fetch('/舌苔图.png');
      if (!imageResponse.ok) {
        throw new Error(`获取图片失败: ${imageResponse.statusText}`);
      }
      const imageBlob = await imageResponse.blob();
      console.log("成功获取图片 Blob:", imageBlob);

      // 2. 创建 File 对象
      const imageFile = new File([imageBlob], '舌苔图.png', { type: imageBlob.type || 'image/png' });
      console.log("创建 File 对象:", imageFile);

      // 3. 创建 FormData
      const formData = new FormData();
      formData.append('file', imageFile);

      // 4. 上传图片
      console.log("开始上传舌苔图片到服务器...");
      const uploadResponse = await axios.post(`${apiBaseUrl}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });

      if (uploadResponse.data && uploadResponse.data.success) {
        const imageUrl = uploadResponse.data.url;
        console.log("图片上传成功, URL:", imageUrl);

        // 5. 关闭模态框并导航
        closeTongueModal();
        navigate('/aichat', {
          state: {
            targetAssistantId: '4',
            imageUrl: imageUrl
          }
        });
        console.log("导航到 AIChat 页面");

      } else {
        console.error("图片上传失败:", uploadResponse.data?.error);
        throw new Error(uploadResponse.data?.error || '图片上传失败');
      }

    } catch (error: any) {
      console.error("处理舌苔确认流程出错:", error);
      const errorMsg = error.message || '处理失败，请稍后再试';
      toast({
        title: "错误",
        description: errorMsg,
        variant: "destructive",
        duration: 3000,
      });
      setIsUploadingPresetImage(false);
    }
  };

  // --- 新增: 处理手相图片上传和导航的函数 ---
  const handlePalmConfirm = async () => {
    if (isUploadingPresetPalmImage) return;
    setIsUploadingPresetPalmImage(true);

    try {
      // 1. 获取预设图片 Blob
      console.log("开始获取手相图片 Blob...");
      const imageResponse = await fetch('/手相图.png');
      if (!imageResponse.ok) {
        throw new Error(`获取图片失败: ${imageResponse.statusText}`);
      }
      const imageBlob = await imageResponse.blob();
      console.log("成功获取图片 Blob:", imageBlob);

      // 2. 创建 File 对象
      const imageFile = new File([imageBlob], '手相图.png', { type: imageBlob.type || 'image/png' });
      console.log("创建 File 对象:", imageFile);

      // 3. 创建 FormData
      const formData = new FormData();
      formData.append('file', imageFile);

      // 4. 上传图片
      console.log("开始上传手相图片到服务器...");
      const uploadResponse = await axios.post(`${apiBaseUrl}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });

      if (uploadResponse.data && uploadResponse.data.success) {
        const imageUrl = uploadResponse.data.url;
        console.log("图片上传成功, URL:", imageUrl);

        // 5. 关闭模态框并导航
        closePalmModal();
        navigate('/aichat', {
          state: {
            targetAssistantId: '6',
            imageUrl: imageUrl
          }
        });
        console.log("导航到 AIChat 页面 (手相)");

      } else {
        console.error("图片上传失败:", uploadResponse.data?.error);
        throw new Error(uploadResponse.data?.error || '图片上传失败');
      }

    } catch (error: any) {
      console.error("处理手相确认流程出错:", error);
      const errorMsg = error.message || '处理失败，请稍后再试';
      toast({
        title: "错误",
        description: errorMsg,
        variant: "destructive",
        duration: 3000,
      });
      setIsUploadingPresetPalmImage(false);
    }
  };

  // --- 新增: 处理面相图片上传和导航的函数 ---
  const handleFaceConfirm = async () => {
    if (isUploadingPresetFaceImage) return;
    setIsUploadingPresetFaceImage(true);

    try {
      // 1. 获取预设图片 Blob
      console.log("开始获取面相图片 Blob...");
      const imageResponse = await fetch('/面相图.png');
      if (!imageResponse.ok) {
        throw new Error(`获取图片失败: ${imageResponse.statusText}`);
      }
      const imageBlob = await imageResponse.blob();
      console.log("成功获取图片 Blob:", imageBlob);

      // 2. 创建 File 对象
      const imageFile = new File([imageBlob], '面相图.png', { type: imageBlob.type || 'image/png' });
      console.log("创建 File 对象:", imageFile);

      // 3. 创建 FormData
      const formData = new FormData();
      formData.append('file', imageFile);

      // 4. 上传图片
      console.log("开始上传面相图片到服务器...");
      const uploadResponse = await axios.post(`${apiBaseUrl}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });

      if (uploadResponse.data && uploadResponse.data.success) {
        const imageUrl = uploadResponse.data.url;
        console.log("图片上传成功, URL:", imageUrl);

        // 5. 关闭模态框并导航
        closeFaceModal();
        navigate('/aichat', {
          state: {
            targetAssistantId: '5',
            imageUrl: imageUrl
          }
        });
        console.log("导航到 AIChat 页面 (面相)");

      } else {
        console.error("图片上传失败:", uploadResponse.data?.error);
        throw new Error(uploadResponse.data?.error || '图片上传失败');
      }

    } catch (error: any) {
      console.error("处理面相确认流程出错:", error);
      const errorMsg = error.message || '处理失败，请稍后再试';
      toast({
        title: "错误",
        description: errorMsg,
        variant: "destructive",
        duration: 3000,
      });
      setIsUploadingPresetFaceImage(false);
    }
  };

  // 新增：处理推荐内容点击
  const handleRecommendedItemClick = (item: any) => {
    if (item.type === 'article') {
      // 跳转到文章详情页
      navigate(`/knowledge/${item.articleId}`); 
    } else if (item.type === 'video') {
      // 跳转到知识库并打开视频模态框
      navigate('/knowledge-base', { 
        state: { 
          openVideo: true,
          videoId: item.videoId
        }
      });
    }
  };

  // --- 渲染逻辑 (修改) ---
  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-black text-white overflow-y-auto"
      style={{
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
      }}
    >

      {/* 页面顶部内容 (保持不变) */}
      <div className="w-full px-5 py-2 pt-10 flex justify-center items-center">
        <div className="flex items-center justify-center">
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'cursive' }}>康友AI，健康同行</span>
        </div>
      </div>

      <div
        ref={chatbotRef}
        className={cn(
          "relative w-32 h-32 mb-4 mx-auto transition-all duration-300 ease-in-out scale-100"
        )}
        role="button"
        tabIndex={0}
        onClick={goToVoiceChat}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-50 blur-md animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-white/70 animate-[ping_4s_ease-in-out_infinite]"></div>
        <div className="absolute inset-[8px] rounded-full border-[3px] border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        <div className="absolute inset-[16px] rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-inner overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <Mic size={28} className="text-white mb-1" />
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-0.5 h-2 bg-white rounded-full animate-[bounce_1.5s_ease-in-out_infinite]"
                  style={{animationDelay: `${i * 0.2}s`}}
                ></div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 mix-blend-overlay"></div>
        </div>
      </div>

      <p className="mt-1 mb-6 text-center font-medium relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 animate-pulse">
          轻触对话您的专属健康顾问 ✨
        </span>
      </p>

      <div className="w-full px-5 mb-4">
        <div className="relative rounded-3xl overflow-hidden shadow-lg p-5 min-h-[200px] flex flex-col justify-between bg-gradient-to-br from-[#6978FF] via-[#7D88FF] to-[#A9B3FF]">
          <img
            src="/public/主页相关/测一测您的健康风险_背景图.png"
            alt="健康风险网络图背景"
            className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
          />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between cursor-pointer mb-6" onClick={goToHealthRiskReport}>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center mr-3 shadow-sm">
                  <HeartPulse size={18} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white">点击查看详细风险报告</span>
              </div>
              <ArrowRight size={20} className="text-white/80" />
            </div>

            <div className="flex-grow flex items-start mb-3">
              <h2 className="text-3xl font-bold text-white tracking-wider">测一测您的健康风险</h2>
            </div>

            <div className="flex flex-row space-x-2 mb-5">
              <div className="bg-[#4A4DE6]/80 px-3 py-1.5 rounded-full flex items-center text-xs font-medium text-white backdrop-blur-sm shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                高风险 3项
              </div>
              <div className="bg-[#B477F4]/80 px-3 py-1.5 rounded-full flex items-center text-xs font-medium text-white backdrop-blur-sm shadow-sm">
                <AlertTriangle size={13} className="mr-1" strokeWidth={2.5} />
                中风险 3项
              </div>
            </div>

            <div>
              <div
                className="inline-flex items-center bg-white px-5 py-2.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-md"
                onClick={restartRiskAssessment}
              >
                <RotateCw size={16} className="mr-2 text-[#505CEA] font-bold" strokeWidth={2.5}/>
                <span className="text-sm text-[#505CEA] font-semibold">重新测算</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full px-5 mb-4">
        <div className="grid grid-cols-4 gap-4 auto-rows-min">

          <div
            className="col-span-2 bg-gradient-to-br from-[#E490A1] to-[#D9798C] rounded-3xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[160px] cursor-pointer"
            onClick={goToFoodAI}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center shadow-sm">
                  <ChefHat size={22} className="text-white" />
                </div>
                <ArrowRight size={20} className="text-white/80 mt-1" />
              </div>
              <div className="mt-auto">
                <h3 className="text-xl font-semibold text-white mb-1">食刻AI</h3>
                <p className="text-xs text-white/90">AI营养师定制菜谱能量</p>
              </div>
            </div>
          </div>

          <div
            className="col-span-2 bg-gradient-to-br from-[#747EF7] to-[#5F67E5] rounded-3xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[160px] cursor-pointer"
            onClick={goToKnowledgeBase}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center shadow-sm">
                  <FileText size={20} className="text-white" />
                </div>
                <ArrowRight size={20} className="text-white/80 mt-1" />
              </div>
              <div className="mt-auto">
                <h3 className="text-xl font-semibold text-white mb-1">健康看点</h3>
                <p className="text-xs text-white/90">全方位知识减轻健康风险</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="w-full px-5 mb-6">
        <div className="relative bg-gradient-to-br from-[#A37FFF] to-[#8B65FF] rounded-3xl shadow-lg p-6 overflow-hidden flex min-h-[220px]">
          <div className="flex flex-col w-1/2 pr-3 justify-between">
            <div className="mt-1">
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center mb-4 shadow-md">
                <MessageCircle size={22} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1.5">健康聊天室</h3>
              <p className="text-xs text-white/75 leading-snug">看看今天的主题与他人交流经验吧！</p>
            </div>
            <button
              className="bg-white text-[#7C5BFF] font-semibold py-3.5 px-8 rounded-full mt-auto self-start shadow-md hover:bg-gray-100 transition-colors text-base mb-1"
              onClick={goToCircle}
            >
              匿名加入
            </button>
          </div>

          <div className="w-1/2 pl-3 relative flex flex-col">
            <svg viewBox="0 0 100 100" className="absolute bottom-[-25px] right-[-25px] w-[130px] h-[130px] opacity-20 text-white pointer-events-none z-0">
              <path d="M85.7,77.1C82.2,89.5,70.2,98,57.1,98C42.3,98,30.2,86.6,29,72.2c-0.1-1.7-0.1-3.4-0.1-5.1c0-18.1,14.7-32.8,32.8-32.8S94.5,49,94.5,67.1c0,1.1-0.1,2.3-0.2,3.4C93.5,73.5,90.1,75.9,85.7,77.1z M50,18c-17.7,0-32,14.3-32,32s14.3,32,32,32s32-14.3,32-32S67.7,18,50,18z"/>
            </svg>

            <div className="relative z-10 bg-black/30 rounded-2xl p-4 flex flex-col flex-grow backdrop-blur-sm shadow-inner">
              <div className="absolute top-4 left-4 bg-[#FFC75F] text-[#A0522D] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center shadow-sm z-20">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1 animate-pulse"><path d="M2 13.151a13.46 13.46 0 0 1 8-3.151M14 10a13.46 13.46 0 0 1 8 3.151M2 18.849a18.91 18.91 0 0 1 8-3.142M14 15.707a18.91 18.91 0 0 1 8 3.142"></path><circle cx="12" cy="20" r="1"></circle></svg>
                话题热聊中
              </div>
              <h4 className="text-white text-xl font-extrabold mt-9 mb-3.5">#食物中隐形的糖分</h4>
              <div className="flex flex-col items-start space-y-1.5 mt-auto">
                <div className="bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-xl shadow-sm w-full overflow-hidden whitespace-nowrap text-ellipsis">
                  高糖分食物有哪些
                </div>
                <div className="bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-xl shadow-sm w-full overflow-hidden whitespace-nowrap text-ellipsis">
                  健康周期性控糖指南
                </div>
                <div className="bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-xl shadow-sm w-full overflow-hidden whitespace-nowrap text-ellipsis">
                  碳水是肥胖根源吗
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-5 mb-8">
        <div className="flex justify-around items-center text-center bg-white/10 rounded-2xl py-6">

          <div
            className="flex flex-col items-center space-y-2 w-1/4 cursor-pointer"
            onClick={openTongueModal}
          >
            <img src="/舌苔.png" alt="舌苔" className="w-14 h-14 object-contain shadow-md hover:opacity-90 transition-opacity" />
            <span className="text-white text-sm font-medium">舌苔检测</span>
          </div>

          <div
            className="flex flex-col items-center space-y-2 w-1/4 cursor-pointer"
            onClick={openPalmModal}
          >
            <img src="/手相.png" alt="手相" className="w-14 h-14 object-contain shadow-md hover:opacity-90 transition-opacity" />
            <span className="text-white text-sm font-medium">手相检测</span>
          </div>

          <div
            className="flex flex-col items-center space-y-2 w-1/4 cursor-pointer"
            onClick={openFaceModal}
          >
            <img src="/面相.png" alt="面相" className="w-14 h-14 object-contain shadow-md hover:opacity-90 transition-opacity" />
            <span className="text-white text-sm font-medium">面相检测</span>
          </div>

          <div className="flex flex-col items-center w-1/4">
             <span className="text-white/70 text-sm font-medium">更多工具敬请期待...</span>
           </div>

        </div>
      </div>

      <div className="w-full px-3 mt-6">
        <h2 className="text-xl font-bold text-white text-left mb-4 ml-2">今日看点推荐</h2>

        <div className="px-0">
          <div className="grid grid-cols-2 gap-3">
            {recommendedContent.map((item) => {
              const getTagColor = (tag: string) => {
                switch (tag) {
                  case '减重方法论':
                    return 'bg-blue-500';
                  case '政策热点':
                  case '实时政策':
                  case '官方指导':
                  case '官方发布':
                    return 'bg-purple-600';
                  case '专家视频':
                  case '专家观点':
                  case '专家讲座':
                  case '专家访谈':
                  case '科普知识':
                    return 'bg-pink-500';
                  case '体重管理年系列':
                  case '减重挑战':
                  case '减重日记':
                    return 'bg-blue-500';
                  case '饮食控制':
                  case '饮食计划':
                  case '减脂食谱':
                  case '减脂餐制作':
                  case '小米粥':
                    return 'bg-green-500';
                  default:
                    return 'bg-gray-600';
                }
              };

              return (
                <div
                  key={item.id}
                  className="bg-white/10 rounded-2xl overflow-hidden h-64 flex flex-col cursor-pointer"
                  onClick={() => handleRecommendedItemClick(item)}
                >
                  <div className="relative h-36 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                          <Play size={16} className="text-white ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-md text-white font-medium",
                          getTagColor(item.tag)
                        )}
                      >
                        #{item.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 flex flex-col flex-grow justify-between">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-white/70 mt-auto">
                      <div className="flex items-center">
                        <span className="truncate max-w-[70px]">{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.type === 'video' ? (
                          <>
                            <span className="flex items-center">
                              <Play size={12} className="mr-0.5" />
                              {item.views}
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center">
                            <MessageCircle size={12} className="mr-0.5" />
                            {item.comments}
                          </span>
                        )}
                        <span className="flex items-center">
                          <ThumbsUp size={12} className="mr-0.5" />
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 添加"查看更多"按钮 */}
      <div className="flex justify-center mt-4 mb-8">
        <button 
          onClick={goToKnowledgeBase}
          className="px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium flex items-center hover:bg-white/15 transition-colors"
        >
          查看更多 <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      {showFloatingButton && (
        <div className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 border-2 border-purple-300 flex items-center justify-center z-30 shadow-lg shadow-purple-500/20"
          role="button"
          tabIndex={0}
          title="语音提问"
          onClick={goToVoiceChat}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 opacity-70 animate-pulse"></div>
          <Mic size={20} className="text-white z-10" />
        </div>
      )}

      {isTongueModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeTongueModal}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col items-center relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeTongueModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
              aria-label="关闭模态框"
              disabled={isUploadingPresetImage}
            >
              <CancelIcon size={24} />
            </button>

            <img
              src="/舌苔提示.png"
              alt="舌苔检测示例"
              className="w-full max-w-xs h-auto rounded-xl mb-6 shadow-lg"
            />

            <div className="flex w-full space-x-4">
              <button
                onClick={() => {
                  console.log('不再提示 clicked - 舌苔');
                  closeTongueModal();
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                disabled={isUploadingPresetImage}
              >
                不再提示
              </button>
              <button
                onClick={handleTongueConfirm}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center ${isUploadingPresetImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isUploadingPresetImage}
              >
                {isUploadingPresetImage ? (
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

      {isPalmModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closePalmModal}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col items-center relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePalmModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
              aria-label="关闭模态框"
              disabled={isUploadingPresetPalmImage}
            >
              <CancelIcon size={24} />
            </button>

            <img
              src="/手相提示.png"
              alt="手相检测示例"
              className="w-full max-w-xs h-auto rounded-xl mb-6 shadow-lg"
            />

            <div className="flex w-full space-x-4">
              <button
                onClick={() => {
                  console.log('不再提示 clicked - 手相');
                  closePalmModal();
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                disabled={isUploadingPresetPalmImage}
              >
                不再提示
              </button>
              <button
                onClick={handlePalmConfirm}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center ${isUploadingPresetPalmImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isUploadingPresetPalmImage}
              >
                {isUploadingPresetPalmImage ? (
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

      {isFaceModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeFaceModal}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col items-center relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeFaceModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
              aria-label="关闭模态框"
              disabled={isUploadingPresetFaceImage}
            >
              <CancelIcon size={24} />
            </button>

            <img
              src="/面相提示.png"
              alt="面相检测示例"
              className="w-full max-w-xs h-auto rounded-xl mb-6 shadow-lg"
            />

            <div className="flex w-full space-x-4">
              <button
                onClick={() => {
                  console.log('不再提示 clicked - 面相');
                  closeFaceModal();
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                disabled={isUploadingPresetFaceImage}
              >
                不再提示
              </button>
              <button
                onClick={handleFaceConfirm}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center ${isUploadingPresetFaceImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isUploadingPresetFaceImage}
              >
                {isUploadingPresetFaceImage ? (
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

export default HomePage;