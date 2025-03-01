
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import Login from "./pages/Login";
import GenderSelection from "./pages/GenderSelection";
import HeightSelection from "./pages/HeightSelection";
import WeightSelection from "./pages/WeightSelection";
import TargetWeightSelection from "./pages/TargetWeightSelection";
import BirthdateSelection from "./pages/BirthdateSelection";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";
import { isOnboardingCompleted } from "./utils/storage";

const queryClient = new QueryClient();

// 页面包装组件，用于添加过渡效果
const PageWrapper = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  
  return (
    <PageTransition location={location.pathname}>
      <div className="w-full h-full">
        {children}
      </div>
    </PageTransition>
  );
};

// 路由守卫：检查是否已完成引导
const RequireOnboarding = ({ children }: { children: ReactNode }) => {
  const onboardingCompleted = isOnboardingCompleted();
  
  if (onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
                <RequireOnboarding>
                  <GenderSelection />
                </RequireOnboarding>
              </PageWrapper>
            } 
          />
          <Route 
            path="/height" 
            element={
              <PageWrapper>
                <RequireOnboarding>
                  <HeightSelection />
                </RequireOnboarding>
              </PageWrapper>
            } 
          />
          <Route 
            path="/weight" 
            element={
              <PageWrapper>
                <RequireOnboarding>
                  <WeightSelection />
                </RequireOnboarding>
              </PageWrapper>
            } 
          />
          <Route 
            path="/target-weight" 
            element={
              <PageWrapper>
                <RequireOnboarding>
                  <TargetWeightSelection />
                </RequireOnboarding>
              </PageWrapper>
            } 
          />
          <Route 
            path="/birthdate" 
            element={
              <PageWrapper>
                <RequireOnboarding>
                  <BirthdateSelection />
                </RequireOnboarding>
              </PageWrapper>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PageWrapper>
                <Dashboard />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
