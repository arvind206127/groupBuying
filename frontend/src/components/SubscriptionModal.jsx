import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Diamond, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-4xl rounded-[48px] shadow-3xl overflow-hidden relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-100 transition-colors z-10"
          >
            <X size={24} className="text-slate-400" />
          </button>

          <div className="grid lg:grid-cols-5 h-full">
            {/* Left Decor / Info */}
            <div className="lg:col-span-2 bg-slate-900 p-12 text-white flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-prime-600/30 blur-[80px] rounded-full" />
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-prime-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-prime-600/20">
                    <Star size={32} className="text-white" />
                 </div>
                 <h2 className="text-3xl font-black mb-6 leading-tight">Unlock Premium Investment Groups</h2>
                 <p className="text-slate-400 font-medium mb-10">Get exclusive access to wholesale real estate deals and coordinated buyer networks.</p>
                 
                 <div className="space-y-6">
                    {[
                      'Early Access to New Groups',
                      'Exclusive High-Discount Deals',
                      'Personal Relationship Manager',
                      'Legal & Documentation Support'
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="w-5 h-5 rounded-full bg-prime-600/20 flex items-center justify-center text-prime-400 backdrop-blur-sm">
                            <Check size={12} strokeWidth={4} />
                         </div>
                         <span className="text-sm font-bold text-slate-300">{feat}</span>
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            {/* Right: Action Area */}
            <div className="lg:col-span-3 p-12 flex flex-col justify-center">
               <div className="mb-10 text-center">
                  <h3 className="text-3xl font-black text-slate-900 mb-2">Upgrade to Premium</h3>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Join the Elite 1% of Buyers</p>
               </div>

               <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 mb-10 relative group hover:border-prime-200 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-prime-600 shadow-sm">
                           <Diamond size={24} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Premium Plan</p>
                           <p className="text-xl font-black text-slate-900">Life-time Value</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                        <p className="text-3xl font-black text-slate-900">₹2,999</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-8 p-3 rounded-xl bg-green-50 text-green-600 border border-green-100">
                     <ShieldCheck size={16} />
                     <p className="text-[10px] font-black uppercase tracking-wider">Secure Access Protocol Enabled</p>
                  </div>

                  <button 
                    onClick={() => navigate('/subscriptions')}
                    className="w-full h-16 bg-prime-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-prime-200 hover:bg-prime-700 transition-all flex items-center justify-center group"
                  >
                    View All Plans
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>

               <p className="text-center text-slate-400 text-[10px] font-medium px-10">
                  By upgrading, you agree to our terms of service and investment protocol. 
                  Subscriptions are non-refundable once group access is utilized.
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
