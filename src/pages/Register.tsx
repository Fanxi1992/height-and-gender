import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { toast } from '@/components/ui/use-toast';
import { post, ApiResponse } from '../utils/api';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 验证邮箱格式
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证密码格式（包含字母和数字）
  const isValidPassword = (password: string): boolean => {
    // 密码必须包含至少一个字母和一个数字
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return password.length >= 6 && hasLetter && hasNumber;
  };

  // 实时验证邮箱和密码
  useEffect(() => {
    if (emailTouched) {
      if (!email.trim()) {
        setEmailError('请输入邮箱');
      } else if (!isValidEmail(email)) {
        setEmailError('请输入有效的邮箱地址');
      } else {
        setEmailError('');
      }
    }

    if (passwordTouched) {
      if (!password.trim()) {
        setPasswordError('请设置密码');
      } else if (!isValidPassword(password)) {
        setPasswordError('密码必须包含字母和数字，且长度不少于6位');
      } else {
        setPasswordError('');
      }
    }
  }, [email, password, emailTouched, passwordTouched]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 强制触发表单验证
    setEmailTouched(true);
    setPasswordTouched(true);
    
    // 表单验证
    if (!email.trim() || !isValidEmail(email)) {
      toast({
        title: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }
    
    if (!password.trim() || !isValidPassword(password)) {
      toast({
        title: "密码必须包含字母和数字，且长度不少于6位",
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

    setIsLoading(true);
    try {
      // 发送注册请求到后端
      const response = await post<{
        code: number;
        msg: string;
        data: any;
      }>('/auth/register', {
        phone: "", // 可选字段
        password: password,
        username: email, // 使用邮箱作为用户名
        gender: "other", // 默认值，可在后续页面修改
      }, { authenticated: false });
      // const { code, msg, data } = response.data;
      // const { code, msg, data } = response.data;
      if (response.code === 200) {
        // 注册成功，跳转到登录页面
        toast({
          title: "注册成功，请登录",
          variant: "default",
        });
        navigate('/login');
      } else {
        // 注册失败，显示错误信息
        toast({
          title: response.msg || "注册失败，请稍后再试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('注册错误:', error);
      let errorMessage = "网络错误，请稍后再试";
      
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
        <h1 className="text-2xl font-bold mb-3">注册账号</h1>
        <p className="text-gray-400 text-sm mb-8">创建您的账号，开始健康之旅</p>
        
        <form onSubmit={handleRegister} className="w-full">
          <div className="mb-4">
            <input
              type="email"
              placeholder="请输入您的邮箱"
              className={`input-field ${emailTouched && emailError ? 'border-red-500' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
            />
            {emailTouched && emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          
          <div className="mb-4">
            <input
              type="password"
              placeholder="请设置密码（包含字母和数字）"
              className={`input-field ${passwordTouched && passwordError ? 'border-red-500' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
            />
            {passwordTouched && passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2 mt-2">
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
            {!agreedToTerms && (
              <p className="text-red-500 text-xs ml-7">请勾选同意用户协议和隐私协议</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className={`primary-button ${
              (!email || !password || !agreedToTerms || !isValidEmail(email) || !isValidPassword(password) || isLoading) 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
            disabled={!email || !password || !agreedToTerms || !isValidEmail(email) || !isValidPassword(password) || isLoading}
            onClick={(e) => {
              if (!email || !password || !agreedToTerms || !isValidEmail(email) || !isValidPassword(password)) {
                e.preventDefault();
                
                if (!email) {
                  toast({
                    title: "请输入邮箱",
                    variant: "destructive",
                  });
                } else if (!isValidEmail(email)) {
                  toast({
                    title: "请输入有效的邮箱地址",
                    variant: "destructive",
                  });
                } else if (!password) {
                  toast({
                    title: "请设置密码",
                    variant: "destructive",
                  });
                } else if (!isValidPassword(password)) {
                  toast({
                    title: "密码必须包含字母和数字，且长度不少于6位",
                    variant: "destructive",
                  });
                } else if (!agreedToTerms) {
                  toast({
                    title: "请同意用户协议和隐私协议",
                    variant: "destructive",
                  });
                }
              }
            }}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
          
          <div className="flex justify-center mt-6 text-sm text-gray-400">
            <span>已有账号？<span onClick={() => navigate('/login')} className="text-app-blue cursor-pointer">立即登录</span></span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 