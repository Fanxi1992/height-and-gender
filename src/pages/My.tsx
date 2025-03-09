
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, BookOpen, Users, Calendar, ShoppingBag, MapPin, List, FileText, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBar from "@/components/StatusBar";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

const My = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");

  // Placeholder user data - in a real app this would come from an API or context
  const userData = {
    avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    nickname: "健康达人",
    id: "HealthMaster_2023",
    followers: 128,
    following: 56,
    posts: 23,
    points: 3450,
    membership: "黄金会员",
    level: 8
  };

  // Health metrics
  const healthMetrics = [
    { name: "BMI", value: "22.6", status: "正常" },
    { name: "心率", value: "72", unit: "bpm", status: "优" },
    { name: "血压", value: "118/78", unit: "mmHg", status: "优" },
    { name: "睡眠", value: "7.5", unit: "h/天", status: "良" }
  ];

  // Sections data for the menu
  const sections = [
    { id: "profile", icon: <User size={20} />, name: "个人资料" },
    { id: "health", icon: <HeartPulse size={20} />, name: "健康数据" },
    { id: "articles", icon: <BookOpen size={20} />, name: "收藏文章" },
    { id: "groups", icon: <Users size={20} />, name: "我的圈子" },
    { id: "activities", icon: <Calendar size={20} />, name: "活动日程" },
    { id: "orders", icon: <ShoppingBag size={20} />, name: "订单记录" },
    { id: "addresses", icon: <MapPin size={20} />, name: "收货地址" },
    { id: "mood", icon: <Heart size={20} />, name: "心情记录" },
    { id: "records", icon: <FileText size={20} />, name: "健康档案" },
    { id: "settings", icon: <List size={20} />, name: "设置" }
  ];

  // Sample data for saved articles
  const savedArticles = [
    {
      id: 1,
      title: "每日饮水指南：保持水分摄入的科学方法",
      author: "张健康",
      date: "2023-10-18",
      likes: 128,
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504"
    },
    {
      id: 2,
      title: "跑步前后应该吃什么？科学饮食指南",
      author: "王营养师",
      date: "2023-10-15",
      likes: 196,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
    },
    {
      id: 3,
      title: "如何科学减脂不反弹？专家解析",
      author: "李医生",
      date: "2023-10-10",
      likes: 253,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
    }
  ];

  // Sample data for groups
  const groups = [
    { 
      id: 1, 
      name: "每日万步行", 
      members: 6, 
      progress: "15/31天", 
      progressPercent: 48,
      icon: "🏃‍♂️",
      color: "#34c759" 
    },
    { 
      id: 2, 
      name: "21天减重挑战", 
      members: 5, 
      progress: "5/21天", 
      progressPercent: 24,
      icon: "⚖️",
      color: "#ff9500" 
    }
  ];

  // Sample data for activities
  const activities = [
    {
      id: 1,
      name: "城市健步走",
      date: "2023-10-25",
      time: "09:00",
      location: "中央公园",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
    },
    {
      id: 2,
      name: "瑜伽工作坊",
      date: "2023-11-05",
      time: "15:30",
      location: "阳光健身中心",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"
    }
  ];

  // Sample data for orders
  const orders = [
    {
      id: "ORD-2023-1015",
      date: "2023-10-15",
      items: [
        { name: "智能体脂秤", points: 2000, status: "已发货" }
      ],
      total: 2000,
      status: "已发货"
    },
    {
      id: "ORD-2023-0928",
      date: "2023-09-28",
      items: [
        { name: "营养代餐粉", points: 1200, status: "已完成" },
        { name: "蛋白粉", points: 1500, status: "已完成" }
      ],
      total: 2700,
      status: "已完成"
    }
  ];

  // Sample data for mood records
  const moodRecords = [
    { date: "今天", mood: "😊", note: "跑步5公里，感觉精力充沛！" },
    { date: "昨天", mood: "😌", note: "饮食规律，睡眠充足" },
    { date: "10月18日", mood: "😓", note: "工作压力大，睡眠不足" },
    { date: "10月17日", mood: "😊", note: "参加了健身课，很开心" }
  ];

  // Sample data for health records
  const healthRecords = [
    { 
      date: "2023-10-20", 
      type: "体检", 
      values: [
        { name: "身高", value: "175cm" },
        { name: "体重", value: "68kg" },
        { name: "血压", value: "118/78mmHg" },
        { name: "血糖", value: "5.2mmol/L" }
      ]
    },
    { 
      date: "2023-09-15", 
      type: "体检", 
      values: [
        { name: "身高", value: "175cm" },
        { name: "体重", value: "70kg" },
        { name: "血压", value: "120/80mmHg" },
        { name: "血糖", value: "5.4mmol/L" }
      ]
    }
  ];

  return (
    <div className="page-container pb-20">
      <StatusBar title="我的" showBack={false} />
      
      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-app-blue to-app-purple w-full rounded-2xl p-5 mb-4">
        <div className="flex items-center">
          <img 
            src={userData.avatar} 
            alt="头像" 
            className="w-20 h-20 rounded-full border-2 border-white mr-4 object-cover"
          />
          <div className="text-white">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">{userData.nickname}</h2>
              <Badge className="ml-2 bg-yellow-500/80">Lv.{userData.level}</Badge>
            </div>
            <p className="text-sm opacity-90 mt-1">ID: {userData.id}</p>
            <div className="flex mt-2">
              <div className="mr-4">
                <p className="text-sm opacity-80">关注</p>
                <p className="font-semibold">{userData.following}</p>
              </div>
              <div className="mr-4">
                <p className="text-sm opacity-80">粉丝</p>
                <p className="font-semibold">{userData.followers}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">动态</p>
                <p className="font-semibold">{userData.posts}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 bg-white/10 rounded-xl p-3">
          <div className="text-center text-white">
            <p className="text-xs opacity-80">积分</p>
            <p className="font-bold">{userData.points}</p>
          </div>
          <div className="text-center text-white">
            <p className="text-xs opacity-80">会员</p>
            <p className="font-bold">{userData.membership}</p>
          </div>
          <div className="text-center text-white">
            <p className="text-xs opacity-80">等级</p>
            <p className="font-bold">{userData.level}</p>
          </div>
        </div>
      </div>
      
      {/* Health Metrics */}
      <div className="bg-white rounded-2xl p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3">健康指标</h3>
        <div className="grid grid-cols-4 gap-2">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-1">
                <div className="text-center">
                  <p className="font-bold text-sm">{metric.value}</p>
                  {metric.unit && <p className="text-xs text-gray-500">{metric.unit}</p>}
                </div>
              </div>
              <p className="text-xs">{metric.name}</p>
              <p className={cn(
                "text-xs font-semibold",
                metric.status === "优" ? "text-green-500" : 
                metric.status === "良" ? "text-blue-500" : 
                metric.status === "正常" ? "text-gray-500" : "text-red-500"
              )}>{metric.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4 bg-white">
          {sections.slice(0, 5).map(section => (
            <TabsTrigger 
              key={section.id} 
              value={section.id}
              className="flex flex-col items-center py-2 text-xs data-[state=active]:text-app-blue"
            >
              {section.icon}
              <span className="mt-1">{section.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-5 mb-4 bg-white">
          {sections.slice(5, 10).map(section => (
            <TabsTrigger 
              key={section.id} 
              value={section.id}
              className="flex flex-col items-center py-2 text-xs data-[state=active]:text-app-blue"
            >
              {section.icon}
              <span className="mt-1">{section.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile Tab Content */}
        <TabsContent value="profile" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">个人资料</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">头像</span>
                <div className="flex items-center">
                  <img src={userData.avatar} alt="头像" className="w-10 h-10 rounded-full object-cover" />
                  <span className="ml-2 text-gray-400">＞</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">昵称</span>
                <div className="flex items-center">
                  <span>{userData.nickname}</span>
                  <span className="ml-2 text-gray-400">＞</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">ID</span>
                <div className="flex items-center">
                  <span>{userData.id}</span>
                  <span className="ml-2 text-gray-400">＞</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">手机号</span>
                <div className="flex items-center">
                  <span>138****8888</span>
                  <span className="ml-2 text-gray-400">＞</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">生日</span>
                <div className="flex items-center">
                  <span>1990-01-01</span>
                  <span className="ml-2 text-gray-400">＞</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Health Tab Content */}
        <TabsContent value="health" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">健康趋势</h3>
            <div className="h-36 flex items-center justify-center bg-gray-100 rounded-lg mb-3">
              <p className="text-gray-500">健康数据图表</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-500">本周活动量</p>
                <p className="text-xl font-bold">78<span className="text-sm font-normal">/100</span></p>
                <div className="w-full bg-gray-300 h-2 rounded-full mt-2">
                  <div className="bg-app-blue h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-500">睡眠质量</p>
                <p className="text-xl font-bold">良好</p>
                <p className="text-xs text-gray-500 mt-2">平均7.5小时/天</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Articles Tab Content */}
        <TabsContent value="articles" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">收藏文章</h3>
            <div className="space-y-4">
              {savedArticles.map(article => (
                <div key={article.id} className="flex border-b pb-3">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-20 h-20 rounded-lg object-cover mr-3"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-2">{article.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{article.author} · {article.date}</p>
                    <div className="flex items-center mt-2">
                      <Heart size={14} className="text-red-500" />
                      <span className="text-xs ml-1">{article.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Groups Tab Content */}
        <TabsContent value="groups" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">我的圈子</h3>
            <div className="space-y-4">
              {groups.map(group => (
                <div key={group.id} className="border rounded-xl p-3">
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white mr-3"
                      style={{ backgroundColor: group.color }}
                    >
                      <span className="text-xl">{group.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-xs text-gray-500">{group.members}名成员</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">团队进度</span>
                      <span>{group.progress}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-app-blue h-2 rounded-full" 
                        style={{ width: `${group.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Activities Tab Content */}
        <TabsContent value="activities" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">活动日程</h3>
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="flex border rounded-xl overflow-hidden">
                  <img 
                    src={activity.image} 
                    alt={activity.name} 
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1 p-3">
                    <h4 className="font-medium">{activity.name}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs flex items-center text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        {activity.date} {activity.time}
                      </p>
                      <p className="text-xs flex items-center text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        {activity.location}
                      </p>
                    </div>
                    <button className="mt-2 text-xs bg-app-blue text-white px-3 py-1 rounded-full">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Orders Tab Content */}
        <TabsContent value="orders" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">订单记录</h3>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-xl p-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">订单号: {order.id}</p>
                    <p className={cn(
                      "text-xs",
                      order.status === "已完成" ? "text-green-500" : 
                      order.status === "已发货" ? "text-blue-500" : "text-gray-500"
                    )}>{order.status}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                  <div className="border-t border-b my-2 py-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm">{item.points} 积分</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">合计:</span>
                    <span className="text-sm font-bold">{order.total} 积分</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Addresses Tab Content */}
        <TabsContent value="addresses" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">收货地址</h3>
              <button className="text-xs bg-app-blue text-white px-3 py-1 rounded-full">
                添加地址
              </button>
            </div>
            <div className="space-y-4">
              <div className="border rounded-xl p-3">
                <div className="flex justify-between">
                  <p className="font-medium">李明</p>
                  <p className="text-sm text-gray-500">138****8888</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">广东省深圳市南山区科技园南区8栋501室</p>
                <div className="flex justify-between mt-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full border border-app-blue flex items-center justify-center mr-1">
                      <div className="w-2 h-2 rounded-full bg-app-blue"></div>
                    </div>
                    <span className="text-xs">默认地址</span>
                  </div>
                  <div className="flex space-x-3">
                    <span className="text-xs text-gray-500">编辑</span>
                    <span className="text-xs text-gray-500">删除</span>
                  </div>
                </div>
              </div>
              <div className="border rounded-xl p-3">
                <div className="flex justify-between">
                  <p className="font-medium">张伟</p>
                  <p className="text-sm text-gray-500">139****6666</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">北京市朝阳区建国路88号中央公园1号楼2单元303室</p>
                <div className="flex justify-between mt-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-1"></div>
                    <span className="text-xs">设为默认</span>
                  </div>
                  <div className="flex space-x-3">
                    <span className="text-xs text-gray-500">编辑</span>
                    <span className="text-xs text-gray-500">删除</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Mood Tab Content */}
        <TabsContent value="mood" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">心情记录</h3>
              <button className="text-xs bg-app-blue text-white px-3 py-1 rounded-full">
                记录今日心情
              </button>
            </div>
            <div className="space-y-3">
              {moodRecords.map((record, index) => (
                <div key={index} className="flex border-b pb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl mr-3">
                    {record.mood}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{record.date}</p>
                      <p className="text-xs text-gray-500">详情</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{record.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Records Tab Content */}
        <TabsContent value="records" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">健康档案</h3>
              <button className="text-xs bg-app-blue text-white px-3 py-1 rounded-full">
                添加记录
              </button>
            </div>
            <div className="space-y-4">
              {healthRecords.map((record, index) => (
                <div key={index} className="border rounded-xl p-3">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">{record.type}</p>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {record.values.map((value, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">{value.name}</p>
                        <p className="text-sm font-medium">{value.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab Content */}
        <TabsContent value="settings" className="mt-0">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">设置</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span>账号与安全</span>
                <span className="text-gray-400">＞</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>隐私设置</span>
                <span className="text-gray-400">＞</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>通知设置</span>
                <span className="text-gray-400">＞</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>关于我们</span>
                <span className="text-gray-400">＞</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>退出登录</span>
                <span className="text-gray-400">＞</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default My;
