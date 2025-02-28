
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { toast } from '@/components/ui/use-toast';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
    if (!phone.trim()) {
      toast({
        title: "请输入手机号",
        variant: "destructive",
      });
      return;
    }
    
    if (!verificationCode.trim()) {
      toast({
        title: "请输入验证码",
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

    // 模拟登录成功，跳转到性别选择页
    navigate('/gender');
  };

  return (
    <div className="page-container bg-black">
      <StatusBar />
      
      <div className="mt-16 w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-3">短信验证码登录</h1>
        <p className="text-gray-400 text-sm mb-8">未注册的手机号验证后将自动注册</p>
        
        <form onSubmit={handleLogin} className="w-full">
          <input
            type="tel"
            placeholder="请输入您的手机号"
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          
          <input
            type="text"
            placeholder="请输入验证码"
            className="input-field"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
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
          
          <button type="submit" className="primary-button">
            登录
          </button>
          
          <div className="flex justify-between mt-6 text-sm text-gray-400">
            <span>一键登录</span>
            <span>密码登录</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
