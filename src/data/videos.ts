export interface Video {
  id: string;
  title: string;
  thumbnail: string; // 视频封面图URL
  platform: 'youtube' | 'bilibili' | 'vimeo' | 'tencent'; // 视频平台
  videoId?: string; // YouTube/Vimeo/Tencent ID (设为可选)
  bvid?: string; // Bilibili BVID (新格式)
  aid?: number; // Bilibili AID (旧格式)
  source?: string; // 视频来源，例如："名医讲堂"
  description?: string; // 视频描述
}

// 示例视频数据
export const videos: Video[] = [
  {
    id: 'vid-youtube-demo',
    title: '陈伟：膳食治疗如何实现与个人健康无缝对接？',
    thumbnail: 'https://img.youtube.com/vi/ROIDLB7J8OM/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'ROIDLB7J8OM',
    source: '专家讲座/协和陈伟',
    description: '北京协和医院陈伟教授讲解膳食治疗与个人健康的结合。'
  },
  {
    id: 'vid11-shorts',
    title: '陈伟：晚上不吃饭真的能减肥吗？',
    thumbnail: 'https://img.youtube.com/vi/ggkdWupFiTg/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'ggkdWupFiTg',
    source: '专家观点/协和陈伟/短视频',
    description: '北京协和医院陈伟教授短视频解答晚上不吃饭能否减肥。'
  },
  {
    id: 'vid12-shorts',
    title: '北京协和医院专家陈伟：减重，什么时候开始都不晚！',
    thumbnail: 'https://img.youtube.com/vi/d8pyLDLFU2c/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'd8pyLDLFU2c',
    source: '专家观点/协和陈伟/短视频',
    description: '北京协和医院陈伟教授短视频鼓励大家开始减重。'
  },
  {
    id: 'vid1',
    title: '科学减肚子，怎么减？',
    thumbnail: 'https://img.youtube.com/vi/mDTqGRaxMac/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'mDTqGRaxMac',
    source: '健康科普',
    description: '讲解科学减肚子的方法和原理。'
  },
  {
    id: 'vid2',
    title: '卫健委：三年减重计划重磅推出！',
    thumbnail: 'https://img.youtube.com/vi/43LpAhiYoDk/hqdefault.jpg',
    platform: 'youtube',
    videoId: '43LpAhiYoDk',
    source: '官方发布/新闻',
    description: '介绍国家卫健委发布的三年减重计划。'
  },
  {
    id: 'vid3',
    title: '张文宏：减重三年是必须的！',
    thumbnail: 'https://img.youtube.com/vi/v8tWiTCZUgc/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'v8tWiTCZUgc',
    source: '专家访谈/观点',
    description: '张文宏医生关于减重重要性的观点阐述。'
  },
  {
    id: 'vid5',
    title: '关于体重管理，你应该了解的方方面面',
    thumbnail: 'https://img.youtube.com/vi/K3XPNJHVGE8/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'K3XPNJHVGE8',
    source: '健康科普',
    description: '全面介绍体重管理的相关知识。'
  },
  {
    id: 'vid6',
    title: '间歇性轻断食，真的是减肥的良方吗？',
    thumbnail: 'https://img.youtube.com/vi/JalfxMdELLI/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'JalfxMdELLI',
    source: '健康科普/减肥方法',
    description: '探讨间歇性轻断食作为减肥方法的效果和争议。'
  },
  {
    id: 'vid7',
    title: '不吃早饭，你的身体会怎么样？',
    thumbnail: 'https://img.youtube.com/vi/A5Xzyp0qWb8/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'A5Xzyp0qWb8',
    source: '健康科普/生活习惯',
    description: '分析不吃早餐对身体可能产生的影响。'
  },
  {
    id: 'vid8',
    title: '国家出手让你减肥了！',
    thumbnail: 'https://img.youtube.com/vi/sX4UJWou-_w/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'sX4UJWou-_w',
    source: '新闻/政策解读',
    description: '解读国家层面推动减肥的相关政策或行动。'
  },
  {
    id: 'vid9-shorts',
    title: '三年减重计划，国家为什么这么重视？',
    thumbnail: 'https://img.youtube.com/vi/Hjj26fPL4is/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'Hjj26fPL4is',
    source: '政策解读/短视频',
    description: '短视频解读国家重视三年减重计划的原因。'
  },
  {
    id: 'vid10-shorts',
    title: '体重管理期，你应该怎么吃？',
    thumbnail: 'https://img.youtube.com/vi/vt-OJ5vgtSU/hqdefault.jpg',
    platform: 'youtube',
    videoId: 'vt-OJ5vgtSU',
    source: '健康科普/饮食指导/短视频',
    description: '短视频提供体重管理期间的饮食建议。'
  }
]; 