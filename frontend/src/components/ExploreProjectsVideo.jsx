import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleHoverStart = () => {
    setIsHovered(true);
    playVideo();
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    resetVideo();
  };

  const developerLogo = video.property?.developer?.logo || "https://upload.wikimedia.org/wikipedia/commons/a/a9/M3M_India_Logo.png";
  const projectTitle = video.property?.title || video.title;

  return (
    <motion.div
      className="relative w-[72vw] min-w-[200px] max-w-[230px] h-[320px] rounded-[1rem] overflow-hidden group cursor-pointer shadow-lg bg-slate-900 border border-white/10 flex-shrink-0 sm:w-auto sm:min-w-[240px] sm:max-w-none sm:h-[380px] sm:rounded-[1rem] md:min-w-[260px] md:h-[420px] md:rounded-[1rem]"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onFocus={handleHoverStart}
      onBlur={handleHoverEnd}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnail || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"}
        className="absolute inset-0 h-full w-full bg-slate-950 object-cover transition-transform duration-700"
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => {
          if (isHovered) {
            playVideo();
          }
        }}
      />

      {/* Dynamic Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-70'}`} />

      {/* Top Logo */}
      <div className="absolute top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-10">
        <img
          src={developerLogo}
          alt="Dev Logo"
          className="h-6 w-auto object-contain brightness-0 invert sm:h-7 md:h-8"
          onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/a9/M3M_India_Logo.png"; }}
        />
      </div>

      {/* Central Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: isHovered ? 1.2 : 1 }}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:bg-prime-600 group-hover:border-prime-600 sm:w-14 sm:h-14 md:w-16 md:h-16"
        >
          <Play fill="currentColor" className="ml-1 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </motion.div>
      </div>

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 z-10">
        <h4 className="text-white font-black text-base sm:text-lg md:text-xl leading-tight uppercase tracking-tighter transition-all duration-300 group-hover:translate-x-2">
          {projectTitle}
        </h4>
      </div>

      {/* Hover Status */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 flex items-center gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Live Experience</span>
      </div>
    </motion.div>
  );
};

const ExploreProjectsVideo = () => {
  const [videos, setVideos] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get('/properties/project-videos?isActive=true');
        if (res.data.success && res.data.projectVideos.length > 0) {
          setVideos(res.data.projectVideos);
        } else {
          // Updated reliable fallback data with working public URLs
          setVideos([
            {
              id: 1,
              title: "Signature Global City 93",
              videoUrl: "https://v.ftcdn.net/05/73/42/15/700_F_573421523_xN3x6K0pX8YfXz7hRyW7Uu6vN6V5u3Ym_ST.mp4",
              thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
              property: { developer: { logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/M3M_India_Logo.png" } }
            },
            {
              id: 2,
              title: "M3M Antalya Hills",
              videoUrl: "https://v.ftcdn.net/08/42/97/34/700_F_842973413_jI8aW7D06v9aYx0h9W0vW5qY9v9q9v9q_ST.mp4",
              thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
              property: { developer: { logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/M3M_India_Logo.png" } }
            },
            {
              id: 3,
              title: "Tulip Monsella",
              videoUrl: "https://v.ftcdn.net/05/73/42/15/700_F_573421523_xN3x6K0pX8YfXz7hRyW7Uu6vN6V5u3Ym_ST.mp4",
              thumbnail: "https://images.unsplash.com/photo-1448630360428-65ff2c0257e1?auto=format&fit=crop&q=80&w=800",
              property: { developer: { logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Logo_of_the_DLF.png" } }
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };
    fetchVideos();
  }, []);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-14 md:py-16 bg-white overflow-hidden font-display">
      <div className="mx-auto max-w-[1440px] home-page-gutter">
        <div className="text-center mb-8 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-6xl font-bold text-slate-900 mb-3 sm:mb-4 md:mb-6 leading-tight capitalize"
          >
            Explore Projects Through <span className="text-orange-600">Video</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-sm sm:text-base md:text-2xl font-medium max-w-4xl mx-auto leading-relaxed"
          >
            Experience our handpicked real estate projects through immersive video tours.
          </motion.p>
        </div>

        <div className="relative group/carousel">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-1 pb-6 pt-3 sm:gap-6 sm:px-2 sm:pb-8 sm:pt-4 md:gap-8 md:pb-10 md:pt-5 no-scrollbar cursor-grab scroll-smooth active:cursor-grabbing"
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}

            {/* View All Card */}
            <motion.div
              className="w-[72vw] min-w-[200px] max-w-[230px] h-[320px] flex flex-col items-center justify-center border border-slate-200/80  hover:bg-slate-50 transition-all group cursor-pointer shrink-0 sm:w-auto sm:min-w-[240px] sm:max-w-none sm:h-[380px] sm:rounded-[1rem] md:min-w-[260px] md:h-[420px] md:rounded-[1rem]"
              whileHover={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-prime-50 group-hover:text-prime-600 transition-all duration-300 sm:w-14 sm:h-14 md:w-16 md:h-16">
                <ChevronRight size={24} />
              </div>
              <span className="mt-4 px-4 text-center text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] group-hover:text-prime-600 transition-colors">Explore All Portfolio</span>
            </motion.div>
          </div>

          {/* Right Navigation Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-4 md:flex md:translate-x-8 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-2xl border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-prime-600 hover:text-white transition-all z-20 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExploreProjectsVideo;
