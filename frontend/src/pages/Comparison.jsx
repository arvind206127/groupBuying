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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f9] pt-20">
        <Loader2 className="animate-spin text-[#db4a2b] mb-4" size={36} />
        <p className="text-sm font-medium text-slate-500">Analyzing Market Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#db4a2b] animate-pulse" />
              <span className="text-sm font-semibold text-[#db4a2b]">Market Comparison</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-950 tracking-tight leading-none">Side-by-Side Analysis</h1>
          </div>
          <div className="bg-white px-6 py-4 rounded-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-200 flex items-center gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Selected</p>
              <p className="text-lg font-semibold text-slate-950 leading-none">{items.length} / 4</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <Link to="/properties" className="text-sm font-semibold text-[#db4a2b] hover:text-[#c43c21] transition-colors">Add More Assets</Link>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto pb-10">
            <div className="inline-flex gap-6 min-w-full">
              {items.map((property) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={property.id}
                  className="w-[320px] md:w-[380px] shrink-0 bg-white rounded-2xl shadow-[0_18px_48px_rgba(62,35,22,0.06)] border border-[#f1d6ca] overflow-hidden relative group transition-all hover:shadow-[0_22px_60px_rgba(223,71,43,0.12)] hover:border-[#df472b]"
                >
                  <button 
                    onClick={() => removeItem(property.id)}
                    className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition-colors hover:bg-[#fff2ed] hover:text-[#db4a2b]"
                  >
                    <X size={16} />
                  </button>

                  <div className="relative h-[220px] overflow-hidden">
                    <img src={property.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={property.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                       <p className="text-white font-semibold text-lg leading-tight mb-1">{property.title}</p>
                       <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                          <MapPin size={14} className="text-[#db4a2b]" />
                          {property.city}
                       </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Primary Specs */}
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-[#fff2ed] rounded-xl border border-[#ffdbce] transition-colors group-hover:bg-[#ffdbce]">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#db4a2b]/80 mb-1">Configuration</p>
                          <p className="text-sm font-bold text-[#db4a2b] truncate" title={property.bhk ? `${property.bhk} BHK` : property.category || 'N/A'}>{property.bhk ? `${property.bhk} BHK` : property.category || 'N/A'}</p>
                       </div>
                       <div className="p-3 bg-[#f0f7ff] rounded-xl border border-[#d6eaff] transition-colors group-hover:bg-[#d6eaff]">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#0284c7]/80 mb-1">Total Area</p>
                          <p className="text-sm font-bold text-[#0284c7] truncate" title={property.area ? `${property.area} Sq.ft` : 'N/A'}>{property.area ? `${property.area} Sq.ft` : 'N/A'}</p>
                       </div>
                       <div className="p-3 bg-[#fdf4ff] rounded-xl border border-[#fae8ff] transition-colors group-hover:bg-[#fae8ff]">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#c026d3]/80 mb-1">Status</p>
                          <p className="text-sm font-bold text-[#c026d3] truncate" title={property.propertyStatus?.name || property.status?.replace(/_/g, ' ') || 'N/A'}>{property.propertyStatus?.name || property.status?.replace(/_/g, ' ') || 'N/A'}</p>
                       </div>
                       <div className="p-3 bg-[#f0fdf4] rounded-xl border border-[#dcfce7] transition-colors group-hover:bg-[#dcfce7]">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#16a34a]/80 mb-1">Possession</p>
                          <p className="text-sm font-bold text-[#16a34a] truncate" title={property.possession || 'N/A'}>{property.possession || 'N/A'}</p>
                       </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Target Price</p>
                            <p className="text-xl font-semibold text-slate-950 leading-none">{formatCurrency(property.price)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-medium text-slate-400 line-through mb-1.5">{formatCurrency(property.originalPrice || property.price / 0.9)}</p>
                             <span className="px-2 py-1 bg-[#16a34a]/10 text-[#16a34a] text-xs font-semibold rounded-md border border-[#16a34a]/20">Save 10%</span>
                          </div>
                       </div>
                    </div>

                    {/* Developer */}
                    <div className="flex items-center gap-4 p-3 bg-[#fffaf6] rounded-xl border border-[#f1d6ca]">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-[#f1d6ca]">
                           <Building size={18} className="text-[#db4a2b]" />
                        </div>
                        <div>
                           <p className="text-[11px] font-bold uppercase tracking-wider text-[#9b8a7d] mb-0.5">Developer</p>
                           <p className="text-sm font-bold text-[#4d4038] truncate max-w-[200px]">{property.developer?.name || "Institutional Developer"}</p>
                        </div>
                    </div>

                    <div className="pt-2">
                       <Link to={`/properties/${property.id}`} className="w-full h-11 bg-slate-950 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white hover:bg-[#db4a2b] transition-colors shadow-sm">
                          View Details <ArrowRight size={16} />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-16 rounded-2xl text-center border border-slate-200 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
             <div className="w-16 h-16 bg-[#fff2ed] rounded-full flex items-center justify-center text-[#db4a2b] mx-auto mb-6">
                <TrendingUp size={32} />
             </div>
             <h3 className="text-xl font-semibold text-slate-950 mb-3">No Assets Selected</h3>
             <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">Select up to 4 properties from our inventory to compare pricing, layouts, and investment potential side-by-side.</p>
             <Link to="/properties" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-[#db4a2b]">Browse Inventory</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparison;
