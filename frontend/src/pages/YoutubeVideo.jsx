import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ExternalLink, Loader2, Play, Share2 } from 'lucide-react';
import api from '../api/axios';

const formatUploadDate = (publishedAt) => {
  if (!publishedAt) return 'Recently uploaded';

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return 'Recently uploaded';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const fallbackVideos = [
  {
    id: 'demo-video',
    title: 'Your latest YouTube video will appear here',
    description: 'Default YouTube channel videos will load automatically. Add your own channel id in backend .env to replace them.',
    publishedAt: '',
    thumbnail: '',
    embedUrl: '',
    watchUrl: 'https://www.youtube.com',
  },
];

const YoutubeVideo = () => {
  const [videos, setVideos] = useState([]);
  const [channel, setChannel] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const fetchVideos = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/youtube/videos');
        if (ignore) return;

        const nextVideos = response.data?.videos || [];
        setVideos(nextVideos);
        setChannel(response.data?.channel || null);
        setActiveVideoId(nextVideos[0]?.id || '');
      } catch (requestError) {
        console.error('Failed to fetch YouTube videos:', requestError);
        if (!ignore) {
          setVideos(fallbackVideos);
          setChannel({ title: 'My Channel' });
          setActiveVideoId(fallbackVideos[0].id);
          setError(requestError.response?.data?.message || 'YouTube videos are not configured yet.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      ignore = true;
    };
  }, []);

  const activeVideo = useMemo(
    () => videos.find((video) => video.id === activeVideoId) || videos[0] || fallbackVideos[0],
    [activeVideoId, videos]
  );

  return (
    <div className="min-h-screen bg-[#f8f3ee] px-3 pb-8 pt-20 text-[#1b1714] sm:px-5 md:pt-12">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto max-w-[1160px] overflow-hidden rounded-[22px] border border-[#eaded5] bg-white p-3 shadow-[0_24px_70px_rgba(80,45,24,0.12)] sm:p-4"
      >
        <div className="flex flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-[#fff5ef] px-4 py-3">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-[34px] w-[46px] shrink-0 items-center justify-center rounded-lg bg-[#ff1010] text-white shadow-[0_0_24px_rgba(255,0,0,0.35)]">
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#16110e]">
                  {channel?.title || 'My Channel'}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#8b7d73]">
                  Latest uploads first
                </p>
              </div>
            </div>

            <a
              href={channel?.url || activeVideo.watchUrl || 'https://www.youtube.com'}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#ff1010] px-5 py-2 text-xs font-black text-white shadow-[0_14px_28px_rgba(255,0,0,0.28)] transition-transform hover:scale-105"
            >
              Subscribe
            </a>
          </header>

          {error ? (
            <div className="rounded-2xl border border-[#ffd5c8] bg-[#fff4ef] px-4 py-3 text-sm font-semibold text-[#9b3c29]">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
            <main>
              <motion.div
                key={activeVideo.id}
                initial={{ opacity: 0.6, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28 }}
                className="group relative overflow-hidden rounded-[16px] bg-[#f3ece6]"
              >
                <div className="aspect-[16/8.1]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center text-[#df472b]">
                      <Loader2 size={36} className="animate-spin" />
                    </div>
                  ) : activeVideo.embedUrl ? (
                    <iframe
                      key={activeVideo.id}
                      title={activeVideo.title}
                      src={`${activeVideo.embedUrl}?rel=0&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : (
                    <div className="relative flex h-full items-center justify-center bg-[linear-gradient(135deg,#fff3ed,#efe4dc)]">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff1010] text-white shadow-[0_14px_34px_rgba(120,68,42,0.2)]">
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="flex flex-col gap-4 border-t border-[#f1e6dd] px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-black text-[#1b1714]">{activeVideo.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#85766b]">
                    {channel?.title || 'My Channel'} - {formatUploadDate(activeVideo.publishedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={activeVideo.watchUrl || 'https://www.youtube.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#fff1eb] px-4 py-2 text-xs font-bold text-[#7b5e51] transition-colors hover:bg-[#ffdfd2] hover:text-[#df472b]"
                  >
                    <ExternalLink size={14} className="text-[#df472b]" />
                    Watch
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(activeVideo.watchUrl || window.location.href)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#fff1eb] px-4 py-2 text-xs font-bold text-[#7b5e51] transition-colors hover:bg-[#ffdfd2] hover:text-[#df472b]"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  <a
                    href={activeVideo.watchUrl || 'https://www.youtube.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#fff1eb] px-4 py-2 text-xs font-bold text-[#7b5e51] transition-colors hover:bg-[#ffdfd2] hover:text-[#df472b] sm:hidden"
                  >
                    <Bell size={14} />
                    Notify
                  </a>
                </div>
              </div>
            </main>

            <aside className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-[#5e524c]">All Videos</p>
                <span className="rounded-full bg-[#fff1eb] px-2.5 py-1 text-[10px] font-black text-[#df472b]">
                  {videos.length}
                </span>
              </div>
              <div className="grid max-h-[468px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
                {videos.map((video, index) => {
                  const isActive = activeVideo.id === video.id;

                  return (
                    <motion.button
                      key={video.id}
                      type="button"
                      onClick={() => setActiveVideoId(video.id)}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group overflow-hidden rounded-[12px] border border-[#f0e3dc] bg-[#fffaf6] text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#ffb49f] hover:shadow-md ${
                        isActive ? 'ring-2 ring-[#ff1010]' : ''
                      }`}
                    >
                      <div className="relative aspect-video bg-[#f3ece6]">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#df472b] shadow-sm transition-colors group-hover:bg-[#df472b] group-hover:text-white">
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </span>
                      </div>
                      <div className="px-2 pb-2 pt-1.5">
                        <p className="line-clamp-2 text-xs font-bold text-[#4b4039]">{video.title}</p>
                        <p className="mt-1 text-[10px] font-semibold text-[#9a8b80]">
                          {formatUploadDate(video.publishedAt)}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default YoutubeVideo;
