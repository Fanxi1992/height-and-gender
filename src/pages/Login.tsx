import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { toast } from '@/components/ui/use-toast';
import { postFormData, ApiResponse } from '../utils/api';
import useAuthStore from '../stores/authStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!email.trim()) {
      toast({
        title: "请输入邮箱",
        variant: "destructive",
      });
      return;
    }
    
    if (!password.trim()) {
      toast({
        title: "请输入密码",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreedToTerms) {
      toast({
        title: "请同意用户协议和隐私协议",
        variant: "destructive",
      });
      return;
    }

    // 发送登录请求到后端
    setIsLoading(true);
    try {
      // 创建表单数据
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      // 使用API工具发送登录请求
      const response = await postFormData<{
        access_token: string;
        refresh_token: string;
        token_type: string;
      }>('/auth/login', formData, false);
      
      if (response.data) {
        // 登录成功，保存 tokens 到 Zustand
        const { access_token, refresh_token } = response.data;
        setToken({ accessToken: access_token, refreshToken: refresh_token });
        
        // 登录成功提示
        toast({
          title: "登录成功",
          variant: "default",
        });
        
        // 跳转到性别选择页
        navigate('/gender');
      } else {
        // 登录失败
        toast({
          title: response.message || "邮箱或密码不正确",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      let errorMessage = "登录失败，请稍后再试";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-16 w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-3">账号密码登录</h1>
        <p className="text-gray-400 text-sm mb-8">欢迎回来，请输入您的登录信息</p>
        
        <form onSubmit={handleLogin} className="w-full">
          <input
            type="email"
            placeholder="请输入您的邮箱"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <input
            type="password"
            placeholder="请输入密码"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="flex items-center mb-6 mt-2">
            <div 
              className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                agreedToTerms ? 'bg-app-blue border-app-blue' : 'border-gray-400'
              }`}
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="text-sm text-gray-400">
              我已阅读并同意《<span className="text-app-blue">用户协议</span>》和《<span className="text-app-blue">隐私协议</span>》
            </div>
          </div>
          
          <button 
            type="submit" 
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
          
          <div className="flex justify-between mt-6 text-sm text-gray-400">
            <span onClick={() => navigate('/forgot-password')} className="cursor-pointer hover:text-app-blue">忘记密码</span>
            <span onClick={() => navigate('/register')} className="cursor-pointer hover:text-app-blue">立即注册</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
