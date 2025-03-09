import React from 'react';
import { 
  UserPlus, 
  Heart, 
  Pill, 
  CalendarCheck, 
  CloudSun, 
  Activity,
  Bed, 
  Utensils, 
  Gift, 
  Coins
} from 'lucide-react';

const Family: React.FC = () => {
  // 处理添加家庭成员
  const handleAddMember = () => {
    alert('邀请家庭成员功能即将上线！');
  };

  // 查看家庭成员健康状态
  const handleViewMemberHealth = (memberName: string) => {
    alert(`查看${memberName}的详细健康数据`);
  };

  // 处理健康关怀按钮
  const handleCareAction = (action: string, title: string) => {
    alert(`已${action}：${title}`);
  };

  // 创建家庭挑战
  const handleCreateChallenge = () => {
    alert('创建家庭专属挑战');
  };

  // 分享今日饮食
  const handleShareMeal = () => {
    alert('分享今日饮食');
  };

  // 处理饮食互动
  const handleMealAction = (action: string) => {
    if (action === 'like') {
      // 点赞逻辑
    } else if (action === 'comment') {
      alert('评论功能即将上线');
    } else if (action === 'share') {
      alert('分享功能即将上线');
    }
  };

  // 积分转赠和兑换
  const handleTransferPoints = () => {
    alert('转赠积分给家人');
  };

  const handleExchangePoints = () => {
    alert('前往积分兑换商城');
  };

  // 查看产品详情
  const handleViewProduct = (productName: string) => {
    alert(`查看${productName}详情`);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 家庭成员管理板块 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">我的家庭</h2>
        <button 
          onClick={handleAddMember}
          className="flex items-center gap-1 px-3 py-2 bg-app-blue/20 rounded-lg text-app-blue text-sm"
        >
          <UserPlus size={16} />
          <span>添加成员</span>
        </button>
      </div>
      
      {/* 家庭成员列表 */}
      <div className="space-y-3">
        {/* 成员1 */}
        <div className="bg-white rounded-xl p-4 text-black flex items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="家庭成员头像" 
              className="w-12 h-12 rounded-lg object-cover" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center">
              <span className="font-medium">爸爸</span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">家庭管理员</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">刚刚完成了10000步</div>
          </div>
          <button 
            onClick={() => handleViewMemberHealth('爸爸')}
            className="w-8 h-8 rounded-full bg-app-blue/10 flex items-center justify-center text-app-blue"
          >
            <Heart size={16} />
          </button>
        </div>
        
        {/* 成员2 */}
        <div className="bg-white rounded-xl p-4 text-black flex items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="家庭成员头像" 
              className="w-12 h-12 rounded-lg object-cover" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="font-medium">妈妈</div>
            <div className="text-xs text-gray-500 mt-1">3小时前测量了血压</div>
          </div>
          <button 
            onClick={() => handleViewMemberHealth('妈妈')}
            className="w-8 h-8 rounded-full bg-app-blue/10 flex items-center justify-center text-app-blue"
          >
            <Heart size={16} />
          </button>
        </div>
        
        {/* 成员3 */}
        <div className="bg-white rounded-xl p-4 text-black flex items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="家庭成员头像" 
              className="w-12 h-12 rounded-lg object-cover" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="font-medium">儿子</div>
            <div className="text-xs text-gray-500 mt-1">1小时前参加了篮球训练</div>
          </div>
          <button 
            onClick={() => handleViewMemberHealth('儿子')}
            className="w-8 h-8 rounded-full bg-app-blue/10 flex items-center justify-center text-app-blue"
          >
            <Heart size={16} />
          </button>
        </div>
      </div>
      
      {/* 家庭健康关怀提醒 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">健康关怀</h2>
          <button className="text-sm text-app-blue">全部</button>
        </div>
        
        <div className="space-y-3">
          {/* 关怀卡片1 */}
          <div className="bg-white rounded-xl p-4 text-black">
            <div className="flex">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500 mr-3">
                <Pill />
              </div>
              <div className="flex-1">
                <div className="font-medium">妈妈的药物提醒</div>
                <div className="text-sm text-gray-600 mt-1">今天傍晚18:30需服用高血压药</div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => handleCareAction('提醒', '妈妈的药物提醒')}
                    className="px-3 py-1.5 bg-app-blue text-white text-xs rounded-lg"
                  >
                    提醒
                  </button>
                  <button 
                    onClick={() => handleCareAction('标记', '妈妈的药物提醒')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg"
                  >
                    已服用
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 关怀卡片2 */}
          <div className="bg-white rounded-xl p-4 text-black">
            <div className="flex">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                <CalendarCheck />
              </div>
              <div className="flex-1">
                <div className="font-medium">爸爸的体检预约</div>
                <div className="text-sm text-gray-600 mt-1">明天上午9:00需到市中心医院进行年度体检</div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => handleCareAction('提醒', '爸爸的体检预约')}
                    className="px-3 py-1.5 bg-app-blue text-white text-xs rounded-lg"
                  >
                    提醒
                  </button>
                  <button 
                    onClick={() => handleCareAction('导航', '爸爸的体检预约')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg"
                  >
                    导航
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 关怀卡片3 */}
          <div className="bg-white rounded-xl p-4 text-black">
            <div className="flex">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500 mr-3">
                <CloudSun />
              </div>
              <div className="flex-1">
                <div className="font-medium">天气变化提醒</div>
                <div className="text-sm text-gray-600 mt-1">明天气温下降10°C，提醒家人增添衣物</div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => handleCareAction('发送', '天气变化提醒')}
                    className="px-3 py-1.5 bg-app-blue text-white text-xs rounded-lg"
                  >
                    发送提醒
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 家庭健康统计 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">家庭健康指数</h2>
          <button className="text-sm text-app-blue">详情</button>
        </div>
        
        <div className="bg-white rounded-xl p-4 text-black">
          <div className="flex justify-between mb-3">
            <div className="text-base font-medium">本周总览</div>
            <div className="text-xs text-gray-500">10月15日-10月21日</div>
          </div>
          
          {/* 健康得分 */}
          <div className="flex items-center justify-center my-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-app-blue to-purple-500 flex flex-col items-center justify-center text-white">
              <div className="text-2xl font-bold">86</div>
              <div className="text-xs">优秀</div>
            </div>
          </div>
          
          {/* 统计详情 */}
          <div className="space-y-4">
            {/* 运动 */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-500 mr-3">
                <Activity size={16} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <div className="text-sm">运动总时长</div>
                  <div className="text-sm font-medium">12.5小时</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[78%]"></div>
                </div>
              </div>
            </div>
            
            {/* 睡眠 */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                <Bed size={16} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <div className="text-sm">平均睡眠</div>
                  <div className="text-sm font-medium">7.2小时/天</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[85%]"></div>
                </div>
              </div>
            </div>
            
            {/* 饮食 */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500 mr-3">
                <Utensils size={16} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <div className="text-sm">健康饮食</div>
                  <div className="text-sm font-medium">82分</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[82%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 家庭专属挑战 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">家庭挑战</h2>
          <button 
            onClick={handleCreateChallenge}
            className="text-sm text-app-blue"
          >
            创建
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-4 text-black relative">
          <div className="absolute top-4 right-4 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
            进行中
          </div>
          
          <div className="mb-4">
            <h3 className="text-base font-medium mb-1">家庭步数挑战</h3>
            <div className="text-sm text-gray-600">本周目标: 150,000步</div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <div>已完成: 96,450步</div>
              <div>剩余: 53,550步</div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-app-blue w-[64%]"></div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {/* 成员1贡献 */}
            <div className="flex items-center">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="成员头像" 
                className="w-6 h-6 rounded-full object-cover mr-2" 
              />
              <div className="text-xs">38,200步</div>
            </div>
            
            {/* 成员2贡献 */}
            <div className="flex items-center">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="成员头像" 
                className="w-6 h-6 rounded-full object-cover mr-2" 
              />
              <div className="text-xs">28,150步</div>
            </div>
            
            {/* 成员3贡献 */}
            <div className="flex items-center">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="成员头像" 
                className="w-6 h-6 rounded-full object-cover mr-2" 
              />
              <div className="text-xs">30,100步</div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs font-medium mb-1">奖励</div>
            <div className="text-sm text-amber-500">家庭电影之夜 + 500积分</div>
          </div>
        </div>
      </div>
      
      {/* 家庭健康饮食分享 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">今日饮食分享</h2>
          <button 
            onClick={handleShareMeal}
            className="text-sm text-app-blue"
          >
            分享
          </button>
        </div>
        
        <div className="space-y-4">
          {/* 饮食分享1 */}
          <div className="bg-white rounded-xl p-4 text-black">
            <div className="flex items-center mb-3">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="成员头像" 
                className="w-8 h-8 rounded-full object-cover mr-2" 
              />
              <div>
                <div className="text-sm font-medium">妈妈的健康午餐</div>
                <div className="text-xs text-gray-500">今天 12:30</div>
              </div>
            </div>
            
            <div className="mb-3">
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="餐食图片" 
                className="w-full h-40 object-cover rounded-lg" 
              />
            </div>
            
            <div className="text-sm text-gray-700 mb-3">
              鸡胸肉沙拉配藜麦，富含蛋白质和纤维，低脂低卡路里，健康又美味！
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="mr-1">🔥</div>
                  <span>380千卡</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="mr-1">🍗</div>
                  <span>蛋白质: 28g</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleMealAction('like')}
                  className="text-gray-400"
                >
                  <Heart size={18} />
                </button>
                <button 
                  onClick={() => handleMealAction('comment')}
                  className="text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
                <button 
                  onClick={() => handleMealAction('share')}
                  className="text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* 饮食分享2 */}
          <div className="bg-white rounded-xl p-4 text-black">
            <div className="flex items-center mb-3">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="成员头像" 
                className="w-8 h-8 rounded-full object-cover mr-2" 
              />
              <div>
                <div className="text-sm font-medium">儿子的训练餐</div>
                <div className="text-xs text-gray-500">今天 17:45</div>
              </div>
            </div>
            
            <div className="mb-3">
              <img 
                src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="餐食图片" 
                className="w-full h-40 object-cover rounded-lg" 
              />
            </div>
            
            <div className="text-sm text-gray-700 mb-3">
              训练后的能量补充，全麦三明治配香蕉和蛋白奶昔，补充碳水和蛋白质！
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="mr-1">🔥</div>
                  <span>520千卡</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="mr-1">🍗</div>
                  <span>蛋白质: 35g</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleMealAction('like')}
                  className="text-gray-400"
                >
                  <Heart size={18} />
                </button>
                <button 
                  onClick={() => handleMealAction('comment')}
                  className="text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
                <button 
                  onClick={() => handleMealAction('share')}
                  className="text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 家庭专属福利 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">家庭专属福利</h2>
          <button className="text-sm text-app-blue">更多</button>
        </div>
        
        <div className="bg-white rounded-xl p-4 text-black mb-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-500 mr-3">
              <Gift size={20} />
            </div>
            <div className="text-base font-medium">家庭积分共享计划</div>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            家庭成员可共享积分用于兑换奖励和商品，共同努力获得更多优惠！
          </div>
          
          <div className="flex items-center bg-gray-50 p-3 rounded-lg mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mr-3">
              <Coins size={18} />
            </div>
            <div>
              <div className="text-xs text-gray-500">家庭总积分</div>
              <div className="text-xl font-bold text-amber-500">3,850</div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {/* 成员1积分 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="成员头像" 
                  className="w-6 h-6 rounded-full object-cover mr-2" 
                />
                <div className="text-sm">爸爸</div>
              </div>
              <div className="text-sm text-gray-600">贡献: 1,450分</div>
            </div>
            
            {/* 成员2积分 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="成员头像" 
                  className="w-6 h-6 rounded-full object-cover mr-2" 
                />
                <div className="text-sm">妈妈</div>
              </div>
              <div className="text-sm text-gray-600">贡献: 1,200分</div>
            </div>
            
            {/* 成员3积分 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="成员头像" 
                  className="w-6 h-6 rounded-full object-cover mr-2" 
                />
                <div className="text-sm">儿子</div>
              </div>
              <div className="text-sm text-gray-600">贡献: 1,200分</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleTransferPoints}
              className="flex-1 py-2 text-sm font-medium bg-white border border-app-blue text-app-blue rounded-lg"
            >
              转赠积分
            </button>
            <button 
              onClick={handleExchangePoints}
              className="flex-1 py-2 text-sm font-medium bg-app-blue text-white rounded-lg"
            >
              兑换礼品
            </button>
          </div>
        </div>
        
        {/* 家人推荐 */}
        <div>
          <div className="text-base font-medium mb-3">为家人推荐</div>
          <div className="grid grid-cols-2 gap-3">
            {/* 推荐产品1 */}
            <div 
              className="bg-white rounded-xl overflow-hidden" 
              onClick={() => handleViewProduct('智能血压计')}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1610925868227-396927c87e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="产品图片" 
                  className="w-full h-24 object-cover" 
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
                  适合爸爸
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium mb-1">智能血压计</div>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span className="font-medium text-app-blue">¥299</span>
                  <span>或 1,500积分</span>
                </div>
              </div>
            </div>
            
            {/* 推荐产品2 */}
            <div 
              className="bg-white rounded-xl overflow-hidden" 
              onClick={() => handleViewProduct('便携按摩仪')}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1592194780323-5a888b4a9432?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="产品图片" 
                  className="w-full h-24 object-cover" 
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
                  适合妈妈
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium mb-1">便携按摩仪</div>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span className="font-medium text-app-blue">¥199</span>
                  <span>或 1,000积分</span>
                </div>
              </div>
            </div>
            
            {/* 推荐产品3 */}
            <div 
              className="bg-white rounded-xl overflow-hidden" 
              onClick={() => handleViewProduct('家庭水果券')}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1528137825877-4a0dcb38a614?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="产品图片" 
                  className="w-full h-24 object-cover" 
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
                  适合全家
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium mb-1">家庭水果券</div>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span className="font-medium text-app-blue">¥99</span>
                  <span>或 500积分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部间距 */}
      <div className="h-20"></div>
    </div>
  );
};

export default Family; 