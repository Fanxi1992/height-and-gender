// src/data/contentItems.ts

// 定义首页内容项目类型
export interface ContentItem {
  id: number;
  type: 'article' | 'video';
  title: string;
  image: string;
  tag: string;
  author: string;
  likes: number;
  comments?: number;
  views?: number;
  articleId: number; // 关联到articles数组中的文章ID
}

// 首页内容项数据
export const contentItems: ContentItem[] = [
  {
    id: 1,
    type: 'article',
    title: '"体重管理年"系列: 体重篇',
    image: '/public/体重管理年系列 体重篇.jpg',
    tag: '体重管理年系列',
    author: '健康管理师',
    likes: 845,
    comments: 75,
    articleId: 1, // 关联到articles数组中的文章ID
  },
  {
    id: 2,
    type: 'video',
    title: '国家出手了！卫健委带你做"减脂餐"',
    image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '官方指导',
    author: '央视新闻',
    likes: 5100,
    views: 8600,
    articleId: 1,
  },
  {
    id: 3,
    type: 'article',
    title: '吃完这个，我怕你只剩一点点了',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    tag: '饮食控制',
    author: '饮食专家',
    likes: 328,
    comments: 42,
    articleId: 5,
  },
  {
    id: 4,
    type: 'article',
    title: '2025达减肥目标，挑战7斤公主减重',
    image: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '减重挑战',
    author: '减重达人',
    likes: 763,
    comments: 124,
    articleId: 4,
  },
  {
    id: 5,
    type: 'article',
    title: '为什么运动有这么大热量缺口，而且还喝水...',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    tag: '科普知识',
    author: '徐风暖阳',
    likes: 46,
    comments: 15,
    articleId: 2,
  },
  {
    id: 6,
    type: 'video',
    title: '第127天: 77.95kg，差2.95kg达标，今天...',
    image: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '减重日记',
    author: '瘦桐友友_3',
    likes: 23,
    views: 567,
    articleId: 3,
  },
  {
    id: 7,
    type: 'article',
    title: '光，理直气壮的干了...',
    image: 'https://images.unsplash.com/photo-1579126038374-6064e9370f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
    tag: '励志故事',
    author: '万物向阳',
    likes: 14,
    comments: 5,
    articleId: 6,
  },
  {
    id: 8,
    type: 'article',
    title: 'DAY 128 | 今天吃了好多好多大枣，上瘾了...',
    image: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '小米粥',
    author: '奇迹寒寒',
    likes: 9,
    comments: 3,
    articleId: 5,
  },
  {
    id: 9,
    type: 'video',
    title: '有氧减脂太快了！10MIN一跳瘦一小时',
    image: 'https://images.pexels.com/photos/4498148/pexels-photo-4498148.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '健身视频',
    author: '健身教练小王',
    likes: 1324,
    views: 23589,
    articleId: 3,
  },
  {
    id: 10,
    type: 'article',
    title: '低GI饮食法：稳定血糖轻松瘦',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '饮食计划',
    author: '营养师李明',
    likes: 568,
    comments: 47,
    articleId: 3,
  },
  {
    id: 11,
    type: 'article',
    title: '减脂期怎么吃？7天食谱大公开',
    image: 'https://images.pexels.com/photos/1660030/pexels-photo-1660030.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '减脂食谱',
    author: '厨师长张师傅',
    likes: 789,
    comments: 103,
    articleId: 5,
  },
  {
    id: 12,
    type: 'video',
    title: '15分钟早餐减脂餐制作，营养又美味',
    image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
    tag: '减脂餐制作',
    author: '健康厨房',
    likes: 432,
    views: 8976,
    articleId: 1,
  },
]; 