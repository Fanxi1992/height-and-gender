import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ChevronLeft, MessageSquare, Heart, Share2 } from 'lucide-react';
import { articles } from '../data/articles'; // 导入文章数据

const ArticleDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { articleId } = useParams<{ articleId: string }>(); // 获取 URL 中的 articleId

  // 根据 articleId 查找文章，注意 articleId 是字符串，需要转换为数字
  const article = articles.find(a => a.id === Number(articleId));
  
  // 记录页面浏览，未来可以实现真实的浏览数据统计
  useEffect(() => {
    if (article) {
      console.log(`查看文章: ${article.title}, ID: ${article.id}`);
      // 这里可以添加实际的统计逻辑，如API调用
    }
  }, [article]);

  const goBack = () => {
    navigate(-1); // 返回上一页
  };

  // 如果找不到文章，显示提示信息
  if (!article) {
    return (
      <div className="flex flex-col h-screen w-full bg-black text-white items-center justify-center">
        <StatusBar />
        <p>文章未找到</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-blue-600 rounded">返回</button>
      </div>
    );
  }

  // 分享文章功能
  const shareArticle = () => {
    // 实现分享逻辑，目前仅打印信息
    console.log(`分享文章: ${article.title}`);
    // 如果有Web Share API支持，可以使用它
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `来自健康管理App的文章: ${article.title}`,
        url: window.location.href,
      })
      .catch(err => console.log('分享失败:', err));
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('链接已复制到剪贴板'))
        .catch(err => console.log('复制失败:', err));
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white">
      <StatusBar />

      {/* Header */}
      <div className="w-full px-4 py-2 pt-8 flex justify-between items-center sticky top-0 bg-black z-10">
        <button onClick={goBack} className="p-1 -ml-1">
          <ChevronLeft size={24} />
        </button>
        {/* 可以根据需要显示文章来源或其他信息作为标题 */}
        <div className="text-lg font-semibold truncate w-2/3 text-center">{article.source}</div>
        <button onClick={shareArticle} className="p-1">
          <Share2 size={20} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* 文章标题 */}
        <h1 className="text-2xl font-bold my-4">{article.title}</h1>

        {/* 作者信息和发布时间 (暂无发布时间数据) */}
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <span>{article.source}</span>
          {/* 可以添加发布时间 */}
          <span className="ml-4">2023-06-10</span> {/* 示例日期，未来应该从API获取 */}
        </div>

        {/* 文章标签 */}
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${article.tagColor}`}>
            {article.tag}
          </span>
        </div>

        {/* 文章主图片 */}
        <img
          src={article.image.replace('w=300', 'w=600')} // 使用更高分辨率的图片
          alt={article.title}
          className="w-full rounded-lg mb-6"
        />

        {/* 文章正文 - 目前使用 content 字段 */}
        <div className="prose prose-invert max-w-none text-base leading-relaxed">
            {/* 你可以在这里渲染更复杂的 HTML 内容，如果 content 是 HTML 字符串的话 */}
            {/* 例如使用 dangerouslySetInnerHTML={{ __html: article.content }} (注意 XSS 风险) */}
            {/* 目前简单显示文本 */}
            <p>{article.content || '暂无详细内容...'}</p>
            
            {/* 添加一些额外的模拟内容使文章看起来更完整 */}
            {!article.content?.includes('未来会从数据库加载') && (
              <>
                <p className="mt-4">
                  这是一篇关于健康生活方式的重要文章。健康的生活习惯对我们的生活质量有着重要影响。
                </p>
                <p className="mt-4">
                  科学研究表明，保持健康的生活方式可以显著降低慢性疾病的风险，提高生活质量。
                </p>
              </>
            )}
        </div>

        {/* 底部互动信息 - 可以保留或移除 */}
        <div className="flex justify-between items-center text-gray-500 mt-8 border-t border-zinc-700 pt-4">
          <div className="text-sm text-gray-400">
            阅读 1.2k
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MessageSquare size={16} className="mr-1" />
              <span>{article.comments}</span>
            </div>
            <div className="flex items-center">
              <Heart size={16} className="mr-1" />
              <span>{article.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail; 