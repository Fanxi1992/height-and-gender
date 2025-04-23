import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { Search, ChevronRight, Clock, RefreshCw, ArrowLeft, MoreHorizontal, Dot } from 'lucide-react';

// 假数据（可替换为后端数据）
const privateDoctors = [
  {
    id: '1',
    name: '张主任',
    title: '营养科 | 主任医师',
    desc: '协和营养科医师，20年经验，擅长饮食调理及代谢病营养干预。',
    avatar: '/数字医生1.jpg',
    unread: '99+',
    time: '12:35',
  },
  {
    id: '2',
    name: '刘主任',
    title: '心内科 | 主任医师',
    desc: '三甲心内科主任，25年经验，专注心脑血管疾病预防与管理。',
    avatar: '/数字医生2.jpg',
    unread: '99+',
    time: '12:35',
  },
  {
    id: '3',
    name: '马主任',
    title: '骨科 | 主任医师',
    desc: '骨科专家，22年经验，擅长骨关节、运动损伤、慢性疼痛非手术管理。',
    avatar: '/数字医生3.jpg',
    unread: '99+',
    time: '12:35',
  },
];

// --- 新增: 医生 ID 到 agentId 的映射 ---
const doctorAgentMap: Record<string, string> = {
  '1': 'doctor1', // 张主任
  '2': 'doctor2', // 刘主任
  '3': 'doctor3', // 马主任
};

const publicRooms = [
  {
    id: 'food',
    name: '均衡饮食社',
    desc: '爱美食也爱健康，来这里分享你的营养餐盘与饮食心得！',
    people: 25,
    bg: 'bg-[#FEECEC]',
    bubbleColor: 'bg-[#FDBFBF] text-[#C45656]',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop',
    isTall: true,
  },
  {
    id: 'sport',
    name: '运动加油站',
    desc: '运动技巧、互相鼓励，这里是活力的加油站！',
    people: 25,
    bg: 'bg-[#E8E8FB]',
    bubbleColor: 'bg-[#CBCBFA] text-[#6A6ADF]',
    img: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&w=600',
  },
  {
    id: 'weight',
    name: '科学减重站',
    desc: '和认真减肥、拒绝极端节食的朋友交流科学减重之道',
    people: 25,
    bg: 'bg-[#E1F5FE]',
    bubbleColor: 'bg-[#B3E5FC] text-[#3C99D4]',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1770&auto=format&fit=crop',
    isTall: true,
  },
  {
    id: 'lecture',
    name: '健康大讲堂',
    desc: '和"医生"一起聊聊健康管理的冷知识与热点话题',
    people: 25,
    bg: 'bg-[#FEECEC]',
    bubbleColor: 'bg-[#FDBFBF] text-[#C45656]',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop',
  },
  {
    id: 'sugar',
    name: '控糖生活圈',
    desc: '聊聊低糖食谱、血糖监测和控糖技巧，一起让生活更甜',
    people: 25,
    bg: 'bg-[#E8E8FB]',
    bubbleColor: 'bg-[#CBCBFA] text-[#6A6ADF]',
    img: 'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg?auto=compress&w=600',
  },
  {
    id: 'lipid',
    name: '血脂管理营',
    desc: '和管理血脂的朋友们交流饮食、运动和生活经验',
    people: 25,
    bg: 'bg-[#FEECEC]',
    bubbleColor: 'bg-[#FDBFBF] text-[#C45656]',
    img: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1965&auto=format&fit=crop',
  },
  {
    id: 'pressure',
    name: '血压健康圈',
    desc: '与高血压患者一同交流血压问题，稳住血压每一天',
    people: 25,
    bg: 'bg-[#E1F5FE]',
    bubbleColor: 'bg-[#B3E5FC] text-[#3C99D4]',
    img: 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&w=600',
  },
  {
    id: 'campus',
    name: '校园健康派',
    desc: '熬夜党、外卖党、减肥党都能找到共鸣！',
    people: 25,
    bg: 'bg-[#E6F2FF]',
    bubbleColor: 'bg-[#C0DFFF] text-[#4A8FEC]',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1770&auto=format&fit=crop',
  },
  {
    id: 'work',
    name: '上班族养生',
    desc: '白天拼命上班？来这里聊聊你的职场健康生存术！',
    people: 25,
    bg: 'bg-[#FFF3E6]',
    bubbleColor: 'bg-[#FFDBB3] text-[#D9822B]',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1770&auto=format&fit=crop',
  },
];

const Circle = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  // 跳转到聊天室
  const goToChatRoom = (roomId: string, roomName: string) => {
    navigate(`/chatroom/${roomId}`, { state: { roomName } });
  };

  // --- 新增: 跳转到数字医生聊天页 ---
  const goToDoctorChat = (doctor: typeof privateDoctors[0]) => {
    const agentId = doctorAgentMap[doctor.id];
    if (!agentId) {
      console.error(`无法找到医生 ID ${doctor.id} 对应的 agentId`);
      // 可以添加一个 toast 提示
      return;
    }

    // 根据医生 ID 生成不同的介绍语
    let doctorIntro = '';
    switch (doctor.id) {
      case '1':
        doctorIntro = "我是张主任，协和营养科医师。擅长通过饮食调理改善健康，尤其是代谢性疾病。有什么营养问题可以问我。";
        break;
      case '2':
        doctorIntro = "我是刘主任，心内科医师。专注于心脑血管疾病的预防和管理。有相关问题可以向我咨询。";
        break;
      case '3':
        doctorIntro = "我是马主任，骨科医师。擅长骨关节问题、运动损伤和慢性疼痛的非手术管理。欢迎咨询骨骼健康相关问题。";
        break;
      default:
        // 对于其他未定义的医生ID，可以使用默认描述或提示信息
        doctorIntro = `欢迎咨询 ${doctor.name}。`;
    }

    navigate(`/doctor-chat/${agentId}`, {
      state: {
        doctorName: doctor.name,
        doctorAvatar: doctor.avatar,
        doctorIntro: doctorIntro, // 使用生成的精简介绍语
        // 你可以根据需要传递更多信息，例如 doctor.title 作为 specialty
        doctorSpecialty: doctor.title // 使用更新后的 title 作为 specialty
      }
    });
  };

  return (
    <div
      className="bg-black flex flex-col relative"
      style={{
        overscrollBehavior: 'contain', // 禁止弹性滚动
        touchAction: 'pan-y',          // 只允许垂直滚动
      }}
    >
      {/* 顶部状态栏 */}
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <ArrowLeft className="text-white cursor-pointer" size={24} onClick={goBack} />
        <span className="text-white text-xl font-semibold tracking-wide">健康聊天室</span>
        {/* 移除了右侧的小程序图标 */}
        <div className="w-6"></div> {/* 添加空白元素保持布局平衡 */}
      </div>
      {/* 搜索栏 */}
      <div className="px-4 pb-2">
        <div className="flex items-center bg-[#1e1e1e] rounded-lg px-3 py-2">
          <Search className="text-gray-500 mr-2" size={20} />
          <input
            className="bg-transparent text-white flex-1 outline-none placeholder-gray-500 text-sm"
            placeholder="搜索健康聊天室"
          />
        </div>
      </div>
      {/* 私人问诊 */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white text-lg font-semibold">数字专家</div>
          {/* 移除了时钟和刷新图标 */}
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {privateDoctors.map(doctor => {
            // 根据医生ID分配不同的淡色背景
            let bgColor = '';
            if (doctor.id === '1') bgColor = 'bg-[#FFF7E6]'; // 张主任-淡橙色
            else if (doctor.id === '2') bgColor = 'bg-[#E6F7FF]'; // 刘主任-淡蓝色
            else if (doctor.id === '3') bgColor = 'bg-[#F3EFFF]'; // 马主任-淡紫色
            else bgColor = 'bg-white'; // 兜底
            return (
              <div
                key={doctor.id}
                className={`${bgColor} rounded-xl shadow-md flex-shrink-0 w-[170px] p-3 flex flex-col relative cursor-pointer transition-all duration-150 active:scale-95`}
                style={{ minWidth: 170 }}
                onClick={() => goToDoctorChat(doctor)}
              >
                <div className="flex items-center mb-2">
                  <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  <div>
                    <div className="text-black font-semibold text-sm leading-tight">{doctor.name}</div>
                    <div className="text-[11px] text-gray-500 font-medium leading-tight">{doctor.title}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3 h-8 leading-snug line-clamp-2">{doctor.desc}</div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="bg-[#FFF2E8] text-[#FA8C16] text-[11px] font-bold rounded-full px-2 py-0.5">{doctor.unread}</span>
                  <span className="text-xs text-gray-400 font-medium">{doctor.unread}人聊过</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* 公共聊天室 */}
      <div className="px-4 pt-4">
        <div className="text-white text-lg font-semibold mb-2">公共聊天室</div>
        <div className="grid grid-cols-2 gap-3 auto-rows-min">
          {publicRooms.map(room => (
            <div
              key={room.id}
              className={`rounded-xl p-3 relative cursor-pointer transition-all duration-150 active:scale-95 ${room.bg} flex flex-col justify-between overflow-hidden 
                         ${room.isTall ? 'row-span-2 min-h-[290px]' : 'min-h-[140px]'}`}
              onClick={() => goToChatRoom(room.id, room.name)}
              style={{
                backgroundImage: `url(${room.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* 半透明遮罩层，提升文字可读性 */}
              <div className="absolute inset-0 bg-white/70 pointer-events-none"></div>
              {/* 内容层 */}
              <div className="relative z-10 flex flex-col h-full">
                <ChevronRight size={20} className="absolute top-3 right-3 text-gray-600 opacity-50" />
                <div className="text-black font-semibold text-base mb-1 w-[calc(100%-24px)]">
                  {room.name}
                </div>
                <div className={`text-xs text-gray-700 mb-2 leading-snug pr-2 ${room.isTall ? 'line-clamp-4 min-h-[64px]' : 'line-clamp-2 min-h-[32px]'}`}
                >
                  {room.desc}
                </div>
                <div className="mt-auto">
                  <span className={`text-xs font-semibold rounded-full px-3 py-0.5 inline-flex items-center ${room.bubbleColor}`}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="mr-1 opacity-70"><path d="M10 10.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z M7.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z M8 .5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM4 8a4 4 0 0 1 8 0H4Z"/></svg>
                    {room.people}人活跃
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1C1C1E] flex justify-around items-center py-1 rounded-t-xl shadow-lg z-10 border-t border-[#2c2c2e]">
        <div className="flex flex-col items-center text-gray-400 text-[10px] py-1 px-2">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
          <span>主页</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 text-[10px] py-1 px-2">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z M13.73 21a2 2 0 0 1-3.46 0"/><path d="M10.3 2.04a2 2 0 0 0-1.96 0 6.001 6.001 0 0 0-4.29 4.29C3.44 6.89 3 7.92 3 9c0 .6.08 1.18.24 1.72M15.7 2.04a2 2 0 0 1 1.96 0 6.001 6.001 0 0 1 4.29 4.29c.61.54 1.05 1.57 1.05 2.67 0 .6-.08 1.18-.24 1.72"/></svg>
          <span>机器人</span>
        </div>
        <div className="flex flex-col items-center text-[#0A84FF] text-[10px] py-1 px-2">
          <svg width="26" height="26" fill="#0A84FF" stroke="#0A84FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>
          <span className="font-semibold">聊天室</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 text-[10px] py-1 px-2">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span>我的</span>
        </div>
      </div>
    </div>
  );
};

export default Circle;
