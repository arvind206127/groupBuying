import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Building2, Handshake, MessageSquare, 
  Search, ArrowRight, Loader2, Phone, Mail, 
  MapPin, CheckCircle, Clock, Filter, SlidersHorizontal,
  ChevronRight, Calendar, UserPlus, FileText, TrendingUp,
  X, Save, Edit3, Briefcase, Star, Target, UserCheck, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const RMDashboard = () => {
  const { handleLogout } = useAuth();
  const [activeTab, setActiveTab ] = useState('leads');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assignedLeads: 0, assignedUsers: 0, confirmedDeals: 0 });
  const [leads, setLeads] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/rm/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Stats fetch failed');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'leads' ? '/rm/leads' : '/rm/buyers';
      const res = await api.get(endpoint);
      if (res.data.success) {
        if (activeTab === 'leads') setLeads(res.data.leads || []);
        else setBuyers(res.data.buyers || []);
      }
    } catch (error) {
      toast.error(`Sync failed for ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
      e.preventDefault();
      try {
          const endpoint = activeTab === 'leads' ? `/rm/leads/${selectedItem.id}` : `/rm/buyers/${selectedItem.id}`;
          await api.put(endpoint, formData);
          toast.success('Updated successfully');
          setShowModal(false);
          fetchData();
          fetchStats();
      } catch (error) {
          toast.error('Update failed');
      }
  }

  const openManageModal = (item) => {
      setSelectedItem(item);
      setFormData({...item});
      setShowModal(true);
  }

  const filteredItems = (activeTab === 'leads' ? leads : buyers).filter(item => {
    if (!searchTerm) return true;
    const searchStr = searchTerm.toLowerCase();
    return (
        (item.name && item.name.toLowerCase().includes(searchStr)) ||
        (item.email && item.email.toLowerCase().includes(searchStr)) ||
        (item.phone && item.phone.toLowerCase().includes(searchStr))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
           <div>
              <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-md bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest">RM Panel</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Live</span>
                  </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lead Management</h1>
              <p className="text-slate-500 text-xs mt-1">Status: {stats.assignedLeads} leads • {stats.assignedUsers} buyers</p>
           </div>
           
           <div className="flex gap-3">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-[140px]">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mb-1">New Leads</p>
                 <p className="text-2xl font-bold text-slate-900">{stats.assignedLeads}</p>
              </div>
              <div className="bg-prime-600 p-6 rounded-2xl shadow-md border border-prime-500 min-w-[140px]">
                 <p className="text-prime-100 font-bold uppercase tracking-widest text-[8px] mb-1">Closed Deals</p>
                 <p className="text-2xl font-bold text-white">{stats.confirmedDeals || 0}</p>
              </div>
           </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
               {['leads', 'buyers'].map(id => (
                 <button 
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {id === 'leads' ? 'Inbound' : 'Portfolio'}
                 </button>
               ))}
            </div>
            
            <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                    type="text" 
                    placeholder="Search records..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-6 h-10 rounded-xl bg-white shadow-sm border-slate-100 focus:ring-4 focus:ring-prime-100 transition-all font-bold text-xs"
                />
            </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-10 items-start">
            <div className="lg:col-span-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="animate-spin text-prime-600" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Data...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid gap-6">
                        <AnimatePresence mode='popLayout'>
                        {filteredItems.map((item, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={item.id} 
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-prime-200 transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                                            {(item.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 tracking-tight">{item.name || 'Anonymous'}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <span className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">{item.email}</span>
                                                <span className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">{item.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 sm:ml-auto">
                                        <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-right">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[7px] mb-0.5">Budget</p>
                                            <p className="font-bold text-slate-900 text-sm italic">₹{item.budget || '?'}</p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => openManageModal(item)}
                                            className="h-10 px-6 rounded-xl bg-prime-600 text-white font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-prime-700 transition-all"
                                        >
                                            Process
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="bg-white p-24 rounded-[40px] text-center border-2 border-dashed border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">No Records Found</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">No leads or buyers matching your search were found in the system.</p>
                        <button onClick={fetchData} className="btn-secondary">Refresh List</button>
                    </div>
                )}
            </div>
            
            <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <Briefcase size={20} className="text-prime-400" />
                        <h4 className="text-sm font-bold uppercase tracking-wider">Resources</h4>
                    </div>
                    <div className="space-y-3">
                        {[
                            { name: 'Pitch Script', icon: FileText },
                            { name: 'Market Analysis', icon: TrendingUp },
                            { name: 'Buyer Guide', icon: MessageSquare },
                        ].map((doc, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                <span className="flex items-center gap-3"><doc.icon size={16} className="text-prime-400" /> {doc.name}</span>
                                <ArrowRight size={14} />
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                    <div className="w-12 h-12 rounded-full bg-prime-50 flex items-center justify-center text-prime-600 mx-auto mb-4">
                        <Calendar size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Reminders</h4>
                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-left">
                            <p className="text-red-600 font-bold text-[8px] uppercase tracking-widest mb-1">Overdue</p>
                            <p className="font-bold text-slate-900 text-xs tracking-tight">Follow up with Rohit</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900 text-white text-left">
                            <p className="text-prime-400 font-bold text-[8px] uppercase tracking-widest mb-1">Today 2:00 PM</p>
                            <p className="font-bold text-xs tracking-tight">Meeting with Prestige</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Manage User</h2>
                        <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-8">
                        <form onSubmit={handleUpdate} className="grid gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name || ''} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full h-12 px-4 bg-slate-50 border-slate-100 rounded-xl font-semibold" 
                                    disabled={activeTab === 'buyers'}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Phone</label>
                                <input 
                                    type="text" 
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full h-12 px-4 bg-slate-50 border-slate-100 rounded-xl font-semibold" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Budget (₹)</label>
                                <input 
                                    type="text" 
                                    value={formData.budget || ''}
                                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                                    className="w-full h-12 px-4 bg-slate-50 border-slate-100 rounded-xl font-semibold" 
                                />
                            </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Internal RM Notes</label>
                                 <textarea 
                                     value={formData.internalNotes || ''}
                                     onChange={(e) => setFormData({...formData, internalNotes: e.target.value})}
                                     className="w-full h-32 px-4 py-3 bg-slate-50 border-slate-100 rounded-xl font-semibold resize-none" 
                                     placeholder="Add follow-up details, preferences, etc."
                                 />
                             </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Status</label>
                                {activeTab === 'leads' ? (
                                    <select 
                                        value={formData.isContacted}
                                        onChange={(e) => setFormData({...formData, isContacted: e.target.value === 'true'})}
                                        className="w-full h-12 px-4 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider"
                                    >
                                        <option value="false">New Lead</option>
                                        <option value="true">Contacted</option>
                                    </select>
                                ) : (
                                    <div className="h-12 px-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                                        <UserCheck size={16} className="text-green-500" />
                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Active Buyer</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-4 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-grow btn-secondary">Cancel</button>
                                <button type="submit" className="flex-grow btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default RMDashboard;
