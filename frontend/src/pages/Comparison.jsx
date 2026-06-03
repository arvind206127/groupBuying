import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, X, MapPin, Building, 
  Maximize, IndianRupee, Users, ArrowRight,
  ShieldCheck, Loader2, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-hot-toast';

const Comparison = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      const res = await api.get('/users/comparison');
      if (res.data.success) {
        setItems(res.data.comparison.map(c => c.property));
      }
    } catch (error) {
      toast.error('Failed to load comparison list');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id) => {
    try {
      const res = await api.post('/users/comparison', { propertyId: id });
      if (res.data.success) {
        setItems(prev => prev.filter(p => p.id !== id));
        toast.success('Removed from comparison');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 pt-20">
        <Loader2 className="animate-spin text-prime-600 mb-6" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analyzing Market Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-prime-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tactical Comparison</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Side-by-Side <span className="text-prime-600 italic">Analysis</span></h1>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Selected</p>
              <p className="text-xl font-black text-slate-900 leading-none">{items.length} / 4</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <Link to="/properties" className="text-[10px] font-black uppercase tracking-widest text-prime-600 hover:text-prime-700 transition-colors">Add More Assets</Link>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar pb-10">
            <div className="inline-flex gap-8 min-w-full">
              {items.map((property) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={property.id}
                  className="w-[320px] md:w-[400px] shrink-0 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative group"
                >
                  <button 
                    onClick={() => removeItem(property.id)}
                    className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-red-500 hover:border-red-500 transition-all active:scale-90"
                  >
                    <X size={18} />
                  </button>

                  <div className="relative h-60 overflow-hidden">
                    <img src={property.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={property.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                       <p className="text-white font-black text-xl leading-tight uppercase mb-1">{property.title}</p>
                       <div className="flex items-center gap-1.5 text-white/60 text-[9px] font-bold uppercase tracking-widest">
                          <MapPin size={12} className="text-prime-400" />
                          {property.city}
                       </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Primary Specs */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Configuration</p>
                          <p className="text-base font-black text-slate-900">{property.bhk} BHK</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Area</p>
                          <p className="text-base font-black text-slate-900">{property.area} Sq.ft</p>
                       </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                          <div>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Target Price</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{formatCurrency(property.price)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-bold text-slate-300 line-through mb-1">{formatCurrency(property.originalPrice || property.price / 0.9)}</p>
                             <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black uppercase rounded-md border border-green-100">Save 10%</span>
                          </div>
                       </div>
                    </div>

                    {/* Developer */}
                    <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl text-white">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2">
                           <Building size={20} className="text-prime-400" />
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Developer</p>
                           <p className="text-xs font-bold truncate max-w-[200px]">{property.developer?.name || "Institutional Developer"}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                       <Link to={`/properties/${property.id}`} className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                          View Details <ArrowRight size={16} />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-24 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-8">
                <TrendingUp size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">No Assets Selected</h3>
             <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">Select up to 4 properties from our inventory to compare pricing, layouts, and investment potential side-by-side.</p>
             <Link to="/properties" className="btn-primary !h-14 !px-10 !rounded-2xl">Browse Inventory</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparison;
