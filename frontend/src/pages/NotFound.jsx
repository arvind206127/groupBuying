import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 pt-24">
      <div className="max-w-xl w-full text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative inline-block mb-12"
        >
           <h1 className="text-[180px] font-display font-black text-slate-200 leading-none select-none">404</h1>
           <div className="absolute inset-0 flex items-center justify-center pt-8">
              <div className="w-40 h-40 bg-prime-600 rounded-[48px] rotate-45 flex items-center justify-center text-white shadow-3xl shadow-prime-200 animate-float">
                 <Search className="-rotate-45" size={64} />
              </div>
           </div>
        </motion.div>
        
        <h2 className="text-4xl font-display font-black text-slate-900 mb-6">Oops! Lost in the City?</h2>
        <p className="text-slate-500 text-xl font-medium mb-12 leading-relaxed">
          The property page you're looking for was moved or doesn't exist. Let's get you back home or finding new deals.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link to="/" className="btn-primary !px-10 h-16 group">
              <Home className="mr-2" size={20} />
              Back to Home
           </Link>
           <Link to="/properties" className="btn-secondary !px-10 h-16 group">
              Explore Properties
              <ArrowLeft className="ml-2 rotate-180" size={20} />
           </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
