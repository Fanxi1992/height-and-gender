import React, { useState } from 'react';
import { Pen, Image, Video, Link2, Heart, MessageCircle, Share2, Search, Calendar, MapPin } from 'lucide-react';

// 动态子页面组件
const Feed = () => {
  // 状态管理
  const [activeFilter, setActiveFilter] = useState('全部');

  // 处理筛选选项变更
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="space-y-5">
      {/* 发布框 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center mb-4">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
            alt="用户头像" 
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <input 
            type="text" 
            className="flex-1 bg-gray-100 rounded-full py-2.5 px-4 text-sm text-gray-500" 
            placeholder="分享你的健康心得..."
          />
        </div>
        <div className="flex justify-between">
          <div className="flex">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 mr-2">
              <Image size={20} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 mr-2">
              <Video size={20} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500">
              <Link2 size={20} />
            </button>
          </div>
          <button className="bg-gray-200 text-gray-400 px-4 py-2 rounded-full text-sm font-medium" disabled>
            发布
          </button>
        </div>
      </div>

      {/* 筛选选项 */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="flex">
          {['全部', '文章', '帖子'].map((filter) => (
            <button
              key={filter}
              className={`flex-1 text-center py-2.5 text-sm relative ${
                activeFilter === filter 
                  ? 'text-app-blue font-medium' 
                  : 'text-gray-500'
              }`}
              onClick={() => handleFilterChange(filter)}
            >
              {filter}
              {activeFilter === filter && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-app-blue"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 活动横幅 */}
      <div className="bg-gradient-to-r from-amber-500 to-red-500 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 bg-cover" 
             style={{backgroundImage: "url('https://i.imgur.com/JHkBUXX.png')"}}></div>
        <h3 className="text-xl font-semibold mb-2 text-white">线下活动中心</h3>
        <p className="text-sm text-white opacity-90">参与线下健康活动，结交志同道合的朋友！</p>
      </div>

      {/* 活动卡片列表 */}
      <div className="flex overflow-x-auto gap-4 pb-1 no-scrollbar">
        <div className="min-w-[200px] bg-white rounded-xl overflow-hidden shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
            alt="活动图片" 
            className="w-full h-32 object-cover"
          />
          <div className="p-3">
            <div className="font-medium text-base mb-2">城市健步走</div>
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar size={12} className="mr-1" />
              <span className="mr-3">10月15日</span>
              <MapPin size={12} className="mr-1" />
              <span>中央公园</span>
            </div>
            <button className="w-full bg-app-blue text-white text-sm py-2 rounded-lg">
              报名参加
            </button>
          </div>
        </div>

        <div className="min-w-[200px] bg-white rounded-xl overflow-hidden shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
            alt="活动图片" 
            className="w-full h-32 object-cover"
          />
          <div className="p-3">
            <div className="font-medium text-base mb-2">瑜伽工作坊</div>
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar size={12} className="mr-1" />
              <span className="mr-3">10月20日</span>
              <MapPin size={12} className="mr-1" />
              <span>阳光健身中心</span>
            </div>
            <button className="w-full bg-app-blue text-white text-sm py-2 rounded-lg">
              报名参加
            </button>
          </div>
        </div>

        <div className="min-w-[200px] bg-white rounded-xl overflow-hidden shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
            alt="活动图片" 
            className="w-full h-32 object-cover"
          />
          <div className="p-3">
            <div className="font-medium text-base mb-2">健康饮食讲座</div>
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar size={12} className="mr-1" />
              <span className="mr-3">10月25日</span>
              <MapPin size={12} className="mr-1" />
              <span>社区中心</span>
            </div>
            <button className="w-full bg-app-blue text-white text-sm py-2 rounded-lg">
              报名参加
            </button>
          </div>
        </div>
      </div>

      {/* 推荐专栏 */}
      <h3 className="text-lg font-semibold py-2">推荐专栏</h3>

      {/* 专栏文章 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="用户头像" 
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <div className="flex items-center">
                <span className="font-medium text-sm">张健康</span>
                <span className="ml-2 text-white text-[10px] bg-black px-2 py-0.5 rounded-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-0.5">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  专栏作者
                </span>
              </div>
              <div className="text-xs text-gray-500">今天 09:45</div>
            </div>
          </div>
          <div className="inline-block bg-black text-white text-xs px-2 py-0.5 rounded mb-2">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
              文章
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2">每日饮水指南：保持水分摄入的科学方法</h2>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            水是生命之源，保持充足的水分摄入对身体健康至关重要。本文将为您介绍科学的饮水方法和时间安排，以及如何养成良好的饮水习惯。
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
          alt="文章封面" 
          className="w-full h-48 object-cover"
        />
        <div className="p-3 border-t border-gray-100">
          <div className="flex text-xs text-gray-500 mb-3">
            <span className="mr-4">128 赞</span>
            <span className="mr-4">36 评论</span>
            <span>15 分享</span>
          </div>
          <div className="flex border-t border-gray-100 pt-3">
            <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <Heart size={16} className="mr-1" />
              <span>赞</span>
            </button>
            <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <MessageCircle size={16} className="mr-1" />
              <span>评论</span>
            </button>
            <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <Share2 size={16} className="mr-1" />
              <span>分享</span>
            </button>
          </div>
          <button className="w-full text-center text-app-blue text-sm py-3 border-t border-gray-100 mt-3 flex items-center justify-center">
            阅读全文
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* 第二篇专栏文章 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <img 
              src="https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="用户头像" 
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <div className="flex items-center">
                <span className="font-medium text-sm">王营养师</span>
                <span className="ml-2 text-white text-[10px] bg-black px-2 py-0.5 rounded-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-0.5">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  专栏作者
                </span>
              </div>
              <div className="text-xs text-gray-500">昨天 14:30</div>
            </div>
          </div>
          <div className="inline-block bg-black text-white text-xs px-2 py-0.5 rounded mb-2">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
              文章
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2">跑步前后应该吃什么？科学饮食指南</h2>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            合理的饮食搭配可以提高跑步效果，减少受伤风险。本文详细解析跑步前后的饮食科学，帮助你更好地规划运动时的营养摄入。
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
          alt="文章封面" 
          className="w-full h-48 object-cover"
        />
        <div className="p-3 border-t border-gray-100">
          <div className="flex text-xs text-gray-500 mb-3">
            <span className="mr-4">196 赞</span>
            <span className="mr-4">42 评论</span>
            <span>28 分享</span>
          </div>
          <div className="flex border-t border-gray-100 pt-3">
            <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <Heart size={16} className="mr-1" />
              <span>赞</span>
            </button>
            <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <MessageCircle size={16} className="mr-1" />
              <span>评论</span>
            </button>
            <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <Share2 size={16} className="mr-1" />
              <span>分享</span>
            </button>
          </div>
          <button className="w-full text-center text-app-blue text-sm py-3 border-t border-gray-100 mt-3 flex items-center justify-center">
            阅读全文
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* 动态列表标题 */}
      <h3 className="text-lg font-semibold py-2">动态</h3>

      {/* 动态帖子 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <img 
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="用户头像" 
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <div className="font-medium text-sm">李瑜伽</div>
              <div className="text-xs text-gray-500">昨天 18:30</div>
            </div>
          </div>
          <button className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm mb-3">
            今天完成了"每日万步行"挑战的第15天！走了12,568步，超额完成目标。感觉整个人都更有活力了，之前的膝盖问题也有所改善。坚持真的很重要！#健康生活 #每日万步行
          </p>
          <div className="grid grid-cols-3 gap-1">
            <img 
              src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="帖子图片" 
              className="w-full aspect-square rounded-md object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="帖子图片" 
              className="w-full aspect-square rounded-md object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1461468611824-46457c0e11fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="帖子图片" 
              className="w-full aspect-square rounded-md object-cover"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-3 flex">
          <span className="mr-4">86 赞</span>
          <span className="mr-4">24 评论</span>
          <span>7 分享</span>
        </div>
        <div className="flex border-t border-gray-100 pt-3">
          <button className="flex-1 flex items-center justify-center text-red-500 text-sm">
            <Heart size={16} className="mr-1" fill="currentColor" />
            <span>已赞</span>
          </button>
          <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            <MessageCircle size={16} className="mr-1" />
            <span>评论</span>
          </button>
          <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            <Share2 size={16} className="mr-1" />
            <span>分享</span>
          </button>
        </div>
      </div>

      {/* 第二个动态帖子 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="用户头像" 
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <div className="font-medium text-sm">王跑步</div>
              <div className="text-xs text-gray-500">2天前</div>
            </div>
          </div>
          <button className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm">
            大家有没有什么推荐的跑步音乐？最近训练感觉有点枯燥，想找一些节奏感强的音乐提升训练效果，求推荐！
          </p>
        </div>
        <div className="text-xs text-gray-500 mb-3 flex">
          <span className="mr-4">42 赞</span>
          <span className="mr-4">53 评论</span>
          <span>2 分享</span>
        </div>
        <div className="flex border-t border-gray-100 pt-3">
          <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            <Heart size={16} className="mr-1" />
            <span>赞</span>
          </button>
          <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            <MessageCircle size={16} className="mr-1" />
            <span>评论</span>
          </button>
          <button className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            <Share2 size={16} className="mr-1" />
            <span>分享</span>
          </button>
        </div>
      </div>

      {/* 浮动发布按钮 */}
      <button className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg z-10">
        <Pen size={22} />
      </button>
    </div>
  );
};

export default Feed;

// CSS样式：添加隐藏滚动条的类
// 可以在全局CSS文件中添加
// .hide-scrollbar::-webkit-scrollbar {
//   display: none;
// }
// .hide-scrollbar {
//   -ms-overflow-style: none;
//   scrollbar-width: none;
// } 