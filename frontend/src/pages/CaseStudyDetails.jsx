import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Users, TrendingDown, 
  Building2, CheckCircle2, Star, Quote, Loader2
} from 'lucide-react';
import api from '../api/axios';

const CaseStudyDetails = () => {
  const { slug } = useParams();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudy();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchStudy = async () => {
    try {
      const res = await api.get(`/case-studies/${slug}`);
      if (res.data.success) {
        setStudy(res.data.caseStudy);
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-prime-600" size={64} />
     </div>
  );

  if (!study) return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
       <h1 className="text-4xl font-black mb-6">Case Study Not Found</h1>
       <Link to="/case-studies" className="btn-primary">Back to Case Studies</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <Link to="/case-studies" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-prime-600 mb-12 group transition-colors">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           Back to Success Stories
        </Link>

        <header className="mb-20">
           <div className="flex items-center gap-4 mb-8">
              <span className="px-6 py-2 rounded-full bg-prime-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-prime-200">
                 Saved {study.savingsPercent || '8.5'}%
              </span>
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                 <MapPin size={16} className="text-prime-500" /> {study.location}
              </span>
           </div>
           
           <h1 className="text-4xl md:text-7xl font-display font-black text-slate-900 mb-10 leading-tight">
              {study.title}
           </h1>
           <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-3xl">
              {study.description}
           </p>
        </header>

        <div className="grid md:grid-cols-4 gap-8 mb-20">
           {[
             { label: 'Original Price', val: `₹${study.originalPrice} Cr`, icon: Building2 },
             { label: 'Final Price', val: `₹${study.finalPrice} Cr`, icon: TrendingDown, color: 'text-green-500' },
             { label: 'Buyers Joined', val: study.buyersCount, icon: Users },
             { label: 'Status', val: 'Completed', icon: CheckCircle2, color: 'text-prime-600' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[40px] shadow-premium border border-slate-50 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
                   <stat.icon size={24} />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color || 'text-slate-900'}`}>{stat.val}</p>
             </div>
           ))}
        </div>

        <div className="aspect-[21/9] rounded-[60px] overflow-hidden shadow-premium mb-20">
           <img src={study.thumbnail} className="w-full h-full object-cover" />
        </div>

        <div className="grid lg:grid-cols-3 gap-16 mb-20">
           <div className="lg:col-span-2 prose prose-xl prose-slate max-w-none prose-headings:font-display prose-headings:font-black">
              <div dangerouslySetInnerHTML={{ __html: study.content }} />
           </div>
           
           <div className="space-y-10">
              <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-prime-600/20 blur-[60px] rounded-full" />
                 <Quote className="text-prime-500 mb-8" size={60} fill="currentColor" />
                 <p className="text-xl font-medium leading-relaxed mb-8 italic">
                    "Real Togather turned my home buying dream into reality with significant savings. The process was seamless and incredibly professional."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black">R</div>
                    <div>
                       <p className="font-black">Rahul Mehta</p>
                       <p className="text-slate-400 text-xs font-bold">Group Lead Member</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-premium border border-slate-50 text-center">
                 <h4 className="text-xl font-black text-slate-900 mb-6">Ready for similar savings?</h4>
                 <Link to="/properties" className="btn-primary w-full !h-14">View Current Deals</Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyDetails;
