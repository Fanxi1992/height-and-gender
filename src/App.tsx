import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GenderSelection from "./pages/GenderSelection";
import HeightSelection from "./pages/HeightSelection";
import WeightSelection from "./pages/WeightSelection";
import HeightWeightSelection from "./pages/HeightWeightSelection";
import BirthdateSelection from "./pages/BirthdateSelection";
import HabitSelection from './pages/HabitSelection';
import DiseaseSelection from "./pages/DiseaseSelection";
import RiskReport from "./pages/RiskReport";
import HomePage from "./pages/HomePage";
import HealthRiskReport from "./pages/HealthRiskReport";
import DiseaseRiskDetail from "./pages/DiseaseRiskDetail";
import HealthTrajectory from "./pages/HealthTrajectory";
import Shop from "./pages/Shop";
import KnowledgeBase from "./pages/KnowledgeBase";
import ArticleDetail from "./pages/ArticleDetail";
import Circle from "./pages/Circle";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";
import My from "./pages/My";
import AIChat from "./pages/AIChat";
import FoodAIPage from './pages/FoodAIPage';
import ChatRoom from './pages/ChatRoom.tsx';
import MainLayout from './components/MainLayout';
import VoiceChatPage from "./voice-chat/VoiceChatPage";
import CommonFoodPage from "./pages/CommonFoodPage";
import DoctorChat from "./pages/DoctorChat";
const queryClient = new QueryClient();

// 防止双击缩放的处理函数
const preventZoom = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
};

// 防止双击缩放的处理函数
const preventDoubleTapZoom = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
};

// 页面包装组件，用于添加页面效果
const PageWrapper = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  
  // 添加滚动到顶部的效果
  useEffect(() => {
    // 当路由变化时，滚动到页面顶部
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // 添加防止双击缩放的效果
  useEffect(() => {
    // 防止双击缩放
    document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false });
    
    // 防止双指缩放
    document.addEventListener('touchmove', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventDoubleTapZoom);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);
  
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
};



// 页面包装组件，用于添加过渡效果
const PageWrapperwithTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  
  // 添加滚动到顶部的效果
  useEffect(() => {
    // 当路由变化时，滚动到页面顶部
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // 添加防止双击缩放的效果
  useEffect(() => {
    // 防止双击缩放
    document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false });
    
    // 防止双指缩放
    document.addEventListener('touchmove', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventDoubleTapZoom);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);
  
  return (
    <PageTransition location={location.pathname}>
      <div className="w-full h-full">
        {children}
      </div>
    </PageTransition>
  );
};






const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/login" 
            element={
              <PageWrapperwithTransition>
                <Login />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PageWrapperwithTransition>
                <Register />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/gender" 
            element={
              <PageWrapperwithTransition>
                <GenderSelection />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/height-weight" 
            element={
              <PageWrapperwithTransition>
                <HeightWeightSelection />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/habit-selection" 
            element={
              <PageWrapperwithTransition>
                <HabitSelection />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/height" 
            element={
              <PageWrapperwithTransition>
                <HeightSelection />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/weight" 
            element={
              <PageWrapperwithTransition>
                <WeightSelection />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/birthdate" 
            element={
              <PageWrapperwithTransition>
                <BirthdateSelection />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/disease-selection" 
            element={
              <PageWrapperwithTransition>
                <DiseaseSelection />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/risk-report" 
            element={
              <PageWrapperwithTransition>
                <RiskReport />
              </PageWrapperwithTransition>
            } 
          />
          <Route
            path="/voice-chat"
            element={
              <PageWrapperwithTransition>
                <VoiceChatPage />
              </PageWrapperwithTransition>
            }
          />
          
          
          {/* --- 新增: DoctorChat 路由 (不使用 MainLayout) --- */}
          <Route
            path="/doctor-chat/:agentId"
            element={
              <PageWrapper>
                <DoctorChat />
              </PageWrapper>
            }
          />

          {/* 主布局及其子路由 - 四个主要一级页面 */}
          <Route element={<MainLayout />}>
            <Route 
              path="/home" 
              element={
                <PageWrapper>
                  <HomePage />
                </PageWrapper>
              } 
            />
            <Route 
              path="/aichat" 
              element={
                <PageWrapper>
                  <AIChat />
                </PageWrapper>
              } 
            />
            <Route 
              path="/circle" 
              element={
                <PageWrapper>
                  <Circle />
                </PageWrapper>
              } 
            />
            <Route 
              path="/my" 
              element={
                <PageWrapper>
                  <My />
                </PageWrapper>
              } 
            />
          </Route>
          
          <Route 
            path="/health-risk-report" 
            element={
              <PageWrapperwithTransition>
                <HealthRiskReport />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/disease-risk-detail" 
            element={
              <PageWrapperwithTransition>
                <DiseaseRiskDetail />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/health-trajectory" 
            element={
              <PageWrapperwithTransition>
                <HealthTrajectory />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/shop" 
            element={
              <PageWrapperwithTransition>
                <Shop />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/knowledge-base" 
            element={
              <PageWrapperwithTransition>
                <KnowledgeBase />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/knowledge/:articleId" 
            element={
              <PageWrapperwithTransition>
                <ArticleDetail />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/article/:articleId" 
            element={
              <PageWrapperwithTransition>
                <ArticleDetail />
              </PageWrapperwithTransition>
            } 
          />
          <Route 
            path="/food-ai" 
            element={
              <PageWrapperwithTransition>
                <FoodAIPage />
              </PageWrapperwithTransition>
            } 
          />
          <Route
            path="/common-food"
            element={
              <PageWrapperwithTransition>
                <CommonFoodPage />
              </PageWrapperwithTransition>
            }
          />
          <Route
            path="/chatroom/:roomId"
            element={
              <PageWrapperwithTransition>
                <ChatRoom />
              </PageWrapperwithTransition>
            }
          />
          <Route 
            path="*" 
            element={
              <PageWrapper>
                <NotFound />
              </PageWrapper>
            } 
          />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
