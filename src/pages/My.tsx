import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Heart, BookOpen, Users, ShoppingBag, MapPin, Settings, FileText, Calendar, Activity } from "lucide-react";
import StatusBar from "@/components/StatusBar";
import { Link, useNavigate } from 'react-router-dom';

const My = () => {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const navigate = useNavigate();

  // 模拟用户数据
  const userData = {
    name: "张小健",
    id: "health_123456",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    followers: 128,
    following: 87,
    posts: 32,
    points: 2680,
    level: 8,
    memberType: "健康达人",
    bio: "热爱健康生活，关注减重与健康管理，希望与志同道合的朋友一起进步！",
    healthMetrics: {
      height: 178,
      weight: 68.5,
      bmi: 21.6,
      bloodPressure: "120/80",
      bloodSugar: "5.2",
      steps: 8632
    }
  };

  const menuItems = [
    { icon: <BookOpen size={20} />, title: "收藏文章", count: 18, link: "/knowledge-base" },
    { icon: <Users size={20} />, title: "我的小组", count: 3, link: "/circle" },
    { icon: <Calendar size={20} />, title: "线下活动", count: 2, link: "/circle" },
    { icon: <ShoppingBag size={20} />, title: "我的订单", count: 5, link: "/shop" },
    { icon: <MapPin size={20} />, title: "收货地址", count: 2, link: "#" },
    { icon: <Heart size={20} />, title: "心情记录", count: 31, link: "#" },
    { icon: <FileText size={20} />, title: "健康档案", count: 4, link: "#" },
    { icon: <Settings size={20} />, title: "设置", count: null, link: "#" }
  ];

  // 收藏的文章
  const savedArticles = [
    { id: 1, title: "如何科学减重：30天计划", date: "2023-10-15", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" },
    { id: 2, title: "健康饮食的5个关键原则", date: "2023-10-10", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" }
  ];

  // 我的小组
  const myGroups = [
    { id: 1, name: "减肥先锋队", members: 8, progress: 65, image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 2, name: "健康生活团", members: 6, progress: 42, image: "https://images.unsplash.com/photo-1522543558187-768b6df7c25c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
  ];

  // 收藏的商品
  const savedProducts = [
    { id: 1, name: "智能体脂秤", points: 2000, originalPrice: "¥299", discountPrice: "¥249", image: "https://images.unsplash.com/photo-1578319439584-104c94d37305?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" },
    { id: 2, name: "高蛋白代餐粉", points: 1200, originalPrice: "¥129", discountPrice: "¥99", image: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" }
  ];

  // 心情记录
  const moodRecords = [
    { id: 1, date: "2023-10-20", mood: "开心", note: "今天完成了减重目标，很有成就感！", icon: "😊" },
    { id: 2, date: "2023-10-18", mood: "平静", note: "正常饮食，完成了日常锻炼。", icon: "😌" },
    { id: 3, date: "2023-10-15", mood: "疲惫", note: "工作太忙，没能坚持锻炼，明天要加油。", icon: "😓" }
  ];

  // 导航函数
  const goToHome = () => {
    navigate('/home');
  };
  
  const goToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };
  
  const goToShop = () => {
    navigate('/shop');
  };
  
  const goToCircle = () => {
    navigate('/circle');
  };

  return (
    <div className="page-container"
    style={{
      overscrollBehavior: 'contain', // 禁止弹性滚动
      touchAction: 'pan-y',          // 只允许垂直滚动
    }}>
      
      
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-r from-app-purple to-app-blue rounded-3xl p-4 w-full mb-4 text-white">
        <div className="flex items-center mb-3">
          <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden mr-4">
            <img src={userData.avatar} alt="用户头像" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <h2 className="text-xl font-bold mr-2">{userData.name}</h2>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">Lv.{userData.level}</span>
            </div>
            <p className="text-xs text-white/80">ID: {userData.id}</p>
            <p className="text-xs text-white/80 mt-1">{userData.memberType}</p>
          </div>
          <button className="bg-white/20 rounded-full px-3 py-1 text-xs">
            编辑资料
          </button>
        </div>
        
        <div className="text-xs line-clamp-2 text-white/80 mb-3">
          {userData.bio}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="font-bold">{userData.followers}</div>
            <div className="text-xs text-white/80">粉丝</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{userData.following}</div>
            <div className="text-xs text-white/80">关注</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{userData.posts}</div>
            <div className="text-xs text-white/80">动态</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{userData.points}</div>
            <div className="text-xs text-white/80">积分</div>
          </div>
        </div>
      </div>
      
      {/* 健康指标卡片 */}
      <div className="bg-white rounded-3xl p-4 w-full mb-4 text-black">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center">
            <Activity size={18} className="mr-1 text-app-blue" /> 健康指标
          </h3>
          <button className="text-xs text-app-blue">查看详情</button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-xs text-gray-500">身高</div>
            <div className="font-bold text-gray-800">{userData.healthMetrics.height}<span className="text-xs ml-1">cm</span></div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-xs text-gray-500">体重</div>
            <div className="font-bold text-gray-800">{userData.healthMetrics.weight}<span className="text-xs ml-1">kg</span></div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-xs text-gray-500">BMI</div>
            <div className="font-bold text-gray-800">{userData.healthMetrics.bmi}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-xs text-gray-500">血压</div>
            <div className="font-bold text-gray-800">{userData.healthMetrics.bloodPressure}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-xs text-gray-500">血糖</div>
            <div className="font-bold text-gray-800">{userData.healthMetrics.bloodSugar}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-xs text-gray-500">今日步数</div>
            <div className="font-bold text-gray-800">{userData.healthMetrics.steps}</div>
          </div>
        </div>
      </div>
      
      {/* 菜单列表 */}
      <div className="bg-white rounded-3xl p-4 w-full mb-4 text-black">
        <div className="grid grid-cols-4 gap-4">
          {menuItems.map((item, index) => (
            <Link to={item.link} key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-app-blue">
                {item.icon}
              </div>
              <div className="text-xs text-center">
                {item.title}
                {item.count !== null && (
                  <span className="bg-app-blue text-white text-[10px] rounded-full px-1 ml-1">
                    {item.count}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* 内容标签页 */}
      <div className="bg-white rounded-3xl p-4 w-full">
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="articles" className="text-xs">收藏文章</TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">我的小组</TabsTrigger>
            <TabsTrigger value="products" className="text-xs">收藏商品</TabsTrigger>
            <TabsTrigger value="mood" className="text-xs">心情记录</TabsTrigger>
          </TabsList>
          
          <TabsContent value="articles">
            {savedArticles.map(article => (
              <div key={article.id} className="flex items-center bg-gray-50 rounded-xl p-3 mb-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden mr-3">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{article.date}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-xs text-app-blue">查看更多</button>
          </TabsContent>
          
          <TabsContent value="groups">
            {myGroups.map(group => (
              <div key={group.id} className="bg-gray-50 rounded-xl p-3 mb-3">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                    <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{group.name}</h4>
                    <p className="text-xs text-gray-500">{group.members}名成员</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full">
                  <div 
                    className="bg-app-blue h-full rounded-full" 
                    style={{ width: `${group.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">挑战进度</span>
                  <span className="text-app-blue">{group.progress}%</span>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-xs text-app-blue">查看更多</button>
          </TabsContent>
          
          <TabsContent value="products">
            {savedProducts.map(product => (
              <div key={product.id} className="flex items-center bg-gray-50 rounded-xl p-3 mb-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden mr-3">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{product.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-app-blue mr-2">{product.points}积分</span>
                    <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                    <span className="text-xs text-red-500 ml-1">{product.discountPrice}</span>
                  </div>
                </div>
                <button className="bg-app-blue text-white text-xs px-3 py-1 rounded-full">
                  兑换
                </button>
              </div>
            ))}
            <button className="w-full py-2 text-xs text-app-blue">查看更多</button>
          </TabsContent>
          
          <TabsContent value="mood">
            {moodRecords.map(record => (
              <div key={record.id} className="bg-gray-50 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{record.icon}</span>
                    <span className="text-sm font-medium">{record.mood}</span>
                  </div>
                  <span className="text-xs text-gray-500">{record.date}</span>
                </div>
                <p className="text-xs text-gray-600">{record.note}</p>
              </div>
            ))}
            <button className="w-full py-2 text-xs text-app-blue">查看更多</button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default My;