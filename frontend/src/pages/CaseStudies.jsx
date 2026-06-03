import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Building2, MapPin, Loader2 } from 'lucide-react';
import api from '../api/axios';

const CaseStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      const res = await api.get('/case-studies');
      if (res.data.success) {
        setStudies(res.data.caseStudies);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="px-4 py-1.5 rounded-full bg-prime-100 text-prime-600 font-black text-xs uppercase tracking-widest mb-6 inline-block"
           >
             Success Stories
           </motion.div>
           <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 mb-6">Real Results, Real Savings</h1>
           <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
             How our buyers came together to secure incredible deals on premium real estate projects across India.
           </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-prime-600" size={48} /></div>
        ) : (
          <div className="space-y-16">
            {studies.map((study, idx) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[56px] overflow-hidden shadow-premium border border-slate-100 flex flex-col lg:flex-row shadow-prime-200/10 group"
              >
                 <div className="lg:w-1/2 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <img 
                      src={study.thumbnail || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000"} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                    <div className="absolute top-10 left-10 p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
                       <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Savings Achieved</p>
                       <p className="text-3xl font-black text-prime-600">{study.savingsPercent || '7.5'}%</p>
                    </div>
                 </div>
                 
                 <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
                    <div className="flex gap-4 mb-8">
                       <span className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                          <MapPin size={16} className="text-prime-600" /> {study.location}
                       </span>
                       <span className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                          <Users size={16} className="text-prime-600" /> {study.buyersCount} Buyers
                       </span>
                    </div>
                    
                    <h2 className="text-4xl font-display font-black text-slate-900 mb-8 leading-tight">
                       {study.title}
                    </h2>
                    
                    <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">
                       {study.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-10 py-10 border-y border-slate-50 mb-12">
                       <div>
                          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Total Group Savings</p>
                          <p className="text-3xl font-black text-slate-900">₹{(study.savings/100000).toFixed(1) || '45'} Lakhs</p>
                       </div>
                       <div>
                          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Deal Closure</p>
                          <p className="text-3xl font-black text-slate-900">Success</p>
                       </div>
                    </div>
                    
                    <Link 
                      to={`/case-studies/${study.slug}`} 
                      className="btn-primary !px-12 !h-16 group self-start"
                    >
                      Read Full Story
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                 </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseStudies;
