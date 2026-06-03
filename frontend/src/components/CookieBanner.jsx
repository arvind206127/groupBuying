import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const CookieBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 inset-x-6 md:inset-x-auto md:right-8 md:w-[600px] z-[200]"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl p-6 md:p-8 rounded-[2rem] md:rounded-full flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <span className="text-xl">🍪</span>
              </div>
              <p className="text-[11px] md:text-xs font-bold text-slate-600 leading-relaxed">
                We use cookies to offer you a better experience. Check <span className="text-orange-600 underline cursor-pointer font-black">privacy policy</span> for more info.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShow(false)}
                className="flex-1 md:flex-none h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                Reject All
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none h-11 px-10 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
