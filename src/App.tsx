import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import Login from "./pages/Login";
import GenderSelection from "./pages/GenderSelection";
import HeightSelection from "./pages/HeightSelection";
import WeightSelection from "./pages/WeightSelection";
import TargetWeightSelection from "./pages/TargetWeightSelection";
import BirthdateSelection from "./pages/BirthdateSelection";
import DiseaseSelection from "./pages/DiseaseSelection";
import RiskReport from "./pages/RiskReport";
import HomePage from "./pages/HomePage";
import HealthRiskReport from "./pages/HealthRiskReport";
import DiseaseRiskDetail from "./pages/DiseaseRiskDetail";
import HealthTrajectory from "./pages/HealthTrajectory";
import Shop from "./pages/Shop";
import KnowledgeBase from "./pages/KnowledgeBase";
import Circle from "./pages/Circle";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";
import My from "./pages/My";
import AIChat from "./pages/AIChat";

const queryClient = new QueryClient();

// 防止双击缩放的处理函数
const preventZoom = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
};

// 页面包装组件，用于添加过渡效果
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
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // 防止双指缩放
    document.addEventListener('touchmove', preventZoom, { passive: false });
    
    return () => {
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
              <PageWrapper>
                <Login />
              </PageWrapper>
            } 
          />
          <Route 
            path="/gender" 
            element={
              <PageWrapper>
                <GenderSelection />
              </PageWrapper>
            } 
          />
          <Route 
            path="/height" 
            element={
              <PageWrapper>
                <HeightSelection />
              </PageWrapper>
            } 
          />
          <Route 
            path="/weight" 
            element={
              <PageWrapper>
                <WeightSelection />
              </PageWrapper>
            } 
          />
          <Route 
            path="/target-weight" 
            element={
              <PageWrapper>
                <TargetWeightSelection />
              </PageWrapper>
            } 
          />
          <Route 
            path="/birthdate" 
            element={
              <PageWrapper>
                <BirthdateSelection />
              </PageWrapper>
            } 
          />
          <Route 
            path="/disease-selection" 
            element={
              <PageWrapper>
                <DiseaseSelection />
              </PageWrapper>
            } 
          />
          <Route 
            path="/risk-report" 
            element={
              <PageWrapper>
                <RiskReport />
              </PageWrapper>
            } 
          />
          <Route 
            path="/home" 
            element={
              <PageWrapper>
                <HomePage />
              </PageWrapper>
            } 
          />
          <Route 
            path="/health-risk-report" 
            element={
              <PageWrapper>
                <HealthRiskReport />
              </PageWrapper>
            } 
          />
          <Route 
            path="/disease-risk-detail" 
            element={
              <PageWrapper>
                <DiseaseRiskDetail />
              </PageWrapper>
            } 
          />
          <Route 
            path="/health-trajectory" 
            element={
              <PageWrapper>
                <HealthTrajectory />
              </PageWrapper>
            } 
          />
          <Route 
            path="/shop" 
            element={
              <PageWrapper>
                <Shop />
              </PageWrapper>
            } 
          />
          <Route 
            path="/knowledge-base" 
            element={
              <PageWrapper>
                <KnowledgeBase />
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
          <Route 
            path="/ai-chat" 
            element={
              <PageWrapper>
                <AIChat />
              </PageWrapper>
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
