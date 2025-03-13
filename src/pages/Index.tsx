
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 重定向到主页而不是登录页
    navigate("/home");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">康友AI</h1>
        <p className="text-gray-400 mb-2">你的24h慢病管理专家</p>
        <div className="flex justify-center mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1 animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full mx-1 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
