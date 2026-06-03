import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Play, Pause } from 'lucide-react';

const FloatingReel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const settings = window.__SITE_SETTINGS__ || {};

  useEffect(() => {
    // Show after 2 seconds if enabled
    if (settings.showFloatingReel === false || settings.showFloatingReel === 'false') return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [settings.showFloatingReel]);

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 100, y: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, x: 100, y: 100 }}
          className="fixed bottom-4 right-4 z-[9990] w-[130px] sm:w-[150px] md:bottom-8 md:right-8 md:w-[210px] aspect-[9/16] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white group"
        >
          {/* Subtle notification ping */}
          <div className="absolute top-3 right-3 z-10 md:top-4 md:right-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-prime-500"></span>
            </span>
          </div>

          <video
            ref={videoRef}
            src={settings.floatingReelVideo || "https://v.ftcdn.net/08/42/97/34/700_F_842973413_jI8aW7D06v9aYx0h9W0vW5qY9v9q9v9q_ST.mp4"}
            poster={settings.floatingReelThumbnail}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-3 md:p-4">
            <div className="rounded-md bg-prime-600 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-white md:text-[8px]">
              Live Tour
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 md:h-8 md:w-8"
            >
              <X size={14} />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3">
            <p className="mb-1 text-xs font-black leading-tight text-white md:text-sm">{settings.floatingReelTitle || 'Exclusive Group Buying Offer!'}</p>
            <p className="mb-3 text-[9px] font-bold text-white/70 md:mb-4 md:text-[10px]">{settings.floatingReelDesc || 'See how to save 25L+ today.'}</p>


          </div>

          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
              onClick={togglePlay}
            >
              <Play size={48} className="text-white fill-white/20" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingReel;
