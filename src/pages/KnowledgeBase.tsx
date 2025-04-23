import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { Search, ChevronLeft, MoreHorizontal, MessageSquare, Heart, PlayCircle, X, Clock, Info } from 'lucide-react';
import { Article, articles } from '../data/articles';
import { Video, videos } from '../data/videos';


const KnowledgeBase: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const initialCategory = searchParams.get('category') || '减重方法论';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '减重方法论';
    if (categoryFromUrl !== activeCategory) {
        setActiveCategory(categoryFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const state = location.state as any;
    if (state?.openVideo && state?.videoId) {
      const videoToOpen = videos.find(v => v.id === state.videoId);
      if (videoToOpen) {
        setCurrentVideo(videoToOpen);
        setIsVideoModalOpen(true);
        if (activeCategory !== '专家视频') {
          setActiveCategory('专家视频');
          setSearchParams({ category: '专家视频' }, { replace: true });
        }
      }

      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, setSearchParams, activeCategory]);

  const categories = ['减重方法论', '专家视频', '政策热点'];

  const goBack = () => {
    navigate('/home');
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setSearchParams({ category }, { replace: true });
  };

  const openVideoModal = (video: Video) => {
    setCurrentVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideo(null);
  };

  const getEmbedUrl = (video: Video | null): string => {
    if (!video) return '';
    switch (video.platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
      case 'vimeo':
        return `https://player.vimeo.com/video/${video.videoId}?autoplay=1`;
      case 'bilibili':
        if (video.bvid) {
          return `//player.bilibili.com/player.html?bvid=${video.bvid}&autoplay=1`;
        }
        if (video.aid) {
          return `//player.bilibili.com/player.html?aid=${video.aid}&autoplay=1`;
        }
        return '';
      case 'tencent':
        return `https://v.qq.com/txp/iframe/player.html?vid=${video.videoId}&autoplay=1`;
      default:
        return '';
    }
  };

  const handleArticleClick = (articleId: number) => {
    navigate(`/knowledge/${articleId}`);
  };

  const handleVideoClick = (video: Video) => {
    openVideoModal(video);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white">
      <StatusBar />

      <div className="w-full px-4 py-2 pt-8 flex justify-center items-center sticky top-0 bg-black z-10">
        <button onClick={goBack} className="absolute left-4 p-1 -ml-1">
          <ChevronLeft size={24} />
        </button>
        <div className="text-lg font-semibold">健康看点</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 relative">
        <div className="flex items-center bg-zinc-800 rounded-lg px-3 py-2 my-4 mt-2">
          <Search size={18} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="搜索今日健康看点"
            className="bg-transparent flex-1 border-none text-white focus:outline-none placeholder-gray-500 text-sm"
          />
        </div>

        <div className="flex justify-between border-b border-zinc-800 mb-5 bg-black">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className="flex-1 text-center py-2 text-base font-medium relative focus:outline-none"
              style={{ color: activeCategory === category ? '#fff' : '#A1A1AA' }}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {activeCategory === '减重方法论' && (
          <div className="flex flex-col gap-3">
            {articles.filter(article => article.tag === '#减重方法论').map((article, idx) => (
              idx === 0 ? (
                <div
                  key={article.id}
                  className="bg-zinc-900 rounded-xl overflow-hidden flex flex-col cursor-pointer"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold text-white ${article.tagColor}`}>{article.tag}</div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-xl mb-2 text-white">{article.title}</h2>
                    <div className="flex items-center mb-2 text-xs text-gray-400">
                      <span>{article.source}</span>
                    </div>
                    <div className="text-gray-300 text-sm line-clamp-2 mb-2">{article.content}</div>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span><MessageSquare size={14} className="inline mr-1" />{article.comments}</span>
                      <span><Heart size={14} className="inline mr-1" />{article.likes}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={article.id}
                  className="bg-zinc-900 rounded-xl overflow-hidden flex cursor-pointer"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-28 h-28 object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between p-3 flex-1">
                    <div>
                      <h4 className="font-semibold text-base mb-1 text-white line-clamp-2">{article.title}</h4>
                      <div className="text-xs text-gray-400 mb-1">{article.source}</div>
                      <div className="text-gray-300 text-xs line-clamp-2">{article.content}</div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 space-x-4 mt-2">
                      <span><MessageSquare size={12} className="inline mr-1" />{article.comments}</span>
                      <span><Heart size={12} className="inline mr-1" />{article.likes}</span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {activeCategory === '专家视频' && (
          <div className="flex flex-col space-y-4">
            {videos.length > 0 && (
              <div 
                key={videos[0].id}
                className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                onClick={() => handleVideoClick(videos[0])}
                onMouseEnter={() => setHoveredVideoId(videos[0].id)}
                onMouseLeave={() => setHoveredVideoId(null)}
              >
                <div className="relative">
                  <img
                    src={videos[0].thumbnail}
                    alt={videos[0].title}
                    className="w-full aspect-video object-cover transform transition-transform duration-700 hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent ${hoveredVideoId === videos[0].id ? 'opacity-90' : 'opacity-70'} flex justify-center items-center transition-all duration-300`}>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className={`w-16 h-16 bg-blue-500 bg-opacity-80 rounded-full flex items-center justify-center shadow-lg transform ${hoveredVideoId === videos[0].id ? 'scale-110' : 'scale-100'} transition-all duration-300`}>
                        <PlayCircle size={40} className="text-white" />
                      </div>
                    </div>
                  </div>
                  {videos[0].source && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 rounded-full text-xs font-bold text-white shadow-md">
                      {videos[0].source}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-xl text-white mb-2 line-clamp-2">{videos[0].title}</h3>
                  {videos[0].description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{videos[0].description}</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-lg font-bold mb-3 text-white">更多视频</h3>
              <div className="space-y-3">
                {videos.slice(1).map((video) => (
                  <div
                    key={video.id}
                    className="bg-zinc-900 rounded-xl overflow-hidden flex cursor-pointer transform transition-all duration-200 hover:bg-zinc-800 hover:shadow-md"
                    onClick={() => handleVideoClick(video)}
                    onMouseEnter={() => setHoveredVideoId(video.id)}
                    onMouseLeave={() => setHoveredVideoId(null)}
                  >
                    <div className="relative h-24 w-36 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-black ${hoveredVideoId === video.id ? 'bg-opacity-40' : 'bg-opacity-20'} flex justify-center items-center transition-all duration-300`}>
                        <div className={`w-10 h-10 bg-blue-500 bg-opacity-80 rounded-full flex items-center justify-center shadow-md transform ${hoveredVideoId === video.id ? 'scale-110' : 'scale-100'} transition-all duration-300`}>
                          <PlayCircle size={24} className="text-white" />
                        </div>
                      </div>
                      {video.source && (
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-600 bg-opacity-90 rounded-sm text-[10px] font-medium text-white">
                          {video.source}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between p-3 flex-1">
                      <div>
                        <h4 className="font-semibold text-sm text-white line-clamp-2">{video.title}</h4>
                        {video.description && (
                          <p className="text-gray-400 text-xs mt-1 line-clamp-1">{video.description}</p>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-2 space-x-3">
                        <span className="flex items-center"><Clock size={12} className="mr-1" />5:30</span>
                        <span className="flex items-center"><Info size={12} className="mr-1" />专家分享</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === '政策热点' && (
          <div className="grid grid-cols-2 gap-3">
            {articles
              .filter(article => article.tag === '#政策热点')
              .map((article) => (
                <div
                  key={article.id}
                  className="bg-zinc-900 rounded-xl overflow-hidden flex flex-col cursor-pointer"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold text-white ${article.tagColor}`}>{article.tag}</div>
                  </div>
                  <div className="p-2 flex flex-col flex-grow">
                    <h4 className="font-semibold text-base mb-1 text-white line-clamp-2 flex-grow">{article.title}</h4>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                      <span className="truncate w-1/2">{article.time}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <MessageSquare size={12} className="mr-0.5" />
                          <span>{article.comments}</span>
                        </div>
                        <div className="flex items-center">
                          <Heart size={12} className="mr-0.5" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {isVideoModalOpen && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50" onClick={closeVideoModal}>
          <div className="relative w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeVideoModal}
              className="absolute -top-8 right-0 text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 z-10 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-zinc-800">
              <iframe
                key={currentVideo.id}
                src={getEmbedUrl(currentVideo)}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-xl font-bold text-white">{currentVideo.title}</h3>
              {currentVideo.description && (
                <p className="text-base text-gray-300 mt-2 leading-relaxed">{currentVideo.description}</p>
              )}
              {currentVideo.source && (
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-600 bg-opacity-30 text-blue-400 text-sm font-medium">
                  {currentVideo.source}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;