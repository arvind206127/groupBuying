import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  LayoutDashboard, Building2, Users, TrendingDown, 
  Settings, LogOut, Bell, ChevronRight, MapPin, 
  IndianRupee, Calendar, CheckCircle2, Clock, Loader2,
  Phone, Mail, User, ShieldCheck, Heart, PieChart,
  ArrowRight, ExternalLink, CreditCard, Edit, Save, X, UserPlus, Repeat, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const UserDashboard = () => {
  const { user, handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeGroups, setActiveGroups] = useState([]);
  const [rm, setRm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', budget: '' });
  const [wishlist, setWishlist] = useState([]);
  const [comparisons, setComparisons] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('member-joined', fetchUserData);
      socket.on('group-full', (data) => {
          toast.success(data.message, { duration: 8000 });
          fetchUserData();
      });
      
      return () => {
        socket.off('member-joined');
        socket.off('group-full');
      };
    }
  }, [socket]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [profileRes, rmRes, compRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/my-rm'),
        api.get('/users/comparison')
      ]);
      
      if (profileRes.data.success) {
        setActiveGroups(profileRes.data.user.groupMembers || []);
        setWishlist(profileRes.data.user.wishlist || []);
        setFormData({
            name: profileRes.data.user.name || '',
            phone: profileRes.data.user.phone || '',
            city: profileRes.data.user.city || '',
            budget: profileRes.data.user.budget || ''
        });
      }
      if (rmRes.data.success) {
        setRm(rmRes.data.rm);
      }
      if (compRes.data.success) {
          setComparisons(compRes.data.comparison || []);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
      e.preventDefault();
      try {
          const res = await api.put('/users/profile', formData);
          if (res.data.success) {
              toast.success('Profile updated');
              setShowEditProfile(false);
              fetchUserData();
          }
      } catch (error) {
          toast.error('Update failed');
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <Loader2 className="animate-spin text-prime-600" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pt-24">
      {/* Sidebar / Navigation */}
      <div className="w-full md:w-72 bg-white border-r border-slate-100 p-4 md:p-8 flex flex-col gap-6 md:gap-10 md:sticky md:top-24 md:h-[calc(100vh-6rem)] overflow-y-auto shadow-sm">
        <div className="flex items-center gap-4 p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-prime-600 text-white flex items-center justify-center text-base md:text-lg font-bold shrink-0">
            {(user.name || user.email || '?')?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 truncate tracking-tight text-xs md:text-sm leading-tight">{user.name || 'Investor'}</p>
            <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Member ID: {user.id?.slice(0, 6)}</p>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar pb-2 md:pb-0">
          {[
            { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
            { id: 'groups', name: 'Investments', icon: Users },
            { id: 'wishlist', name: 'Shortlist', icon: Heart },
            { id: 'comparison', name: 'Comparison', icon: Repeat },
            { id: 'profile', name: 'Profile', icon: User },
            { id: 'billing', name: 'Membership', icon: CreditCard },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-lg font-bold text-[9px] md:text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === item.id 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <item.icon size={14} md:size={16} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="hidden md:block mt-auto pt-6 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all w-full">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-5 md:p-10 overflow-y-auto">
        <header className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-8 md:mb-12">
            <div className="max-w-xl">
               <div className="flex items-center gap-2 mb-2">
                 <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white text-[7px] md:text-[8px] font-bold uppercase tracking-widest">Verified Investor</span>
               </div>
               <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight capitalize leading-none">{activeTab.replace('-', ' ')}</h2>
               <p className="text-slate-500 text-[10px] md:text-xs mt-2 font-medium">Manage your collective real estate investments and portfolio growth.</p>
            </div>
           {activeTab === 'profile' && (
               <button onClick={() => setShowEditProfile(true)} className="h-9 md:h-10 px-6 bg-prime-600 text-white rounded-lg flex items-center gap-2 font-bold text-[9px] md:text-[10px] uppercase tracking-widest shadow-md w-fit">
                   <Edit size={14} md:size={16} /> 
                   Edit Profile
               </button>
           )}
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-prime-50 flex items-center justify-center text-prime-600 mb-3 md:mb-4">
                  <Building2 size={18} md:size={20} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[7px] md:text-[8px] mb-1">Active Groups</p>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{activeGroups.length}</h3>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 md:mb-4">
                  <ShieldCheck size={18} md:size={20} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[7px] md:text-[8px] mb-1">Status</p>
                <h3 className="text-sm md:text-lg font-bold text-slate-900 tracking-wider">VERIFIED</h3>
              </div>
              <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-md flex flex-col items-center text-center text-white col-span-2 md:col-span-1">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3 md:mb-4">
                    <TrendingDown size={18} md:size={20} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[7px] md:text-[8px] mb-1">Potential Savings</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">₹12.5L+</h3>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Current Portfolio</h3>
                    <Link to="/properties" className="text-prime-600 font-bold text-[9px] uppercase tracking-widest">Browse More</Link>
                 </div>
                 {activeGroups.length > 0 ? (
                    <div className="grid gap-6">
                      {activeGroups.map((member) => (
                        <div key={member.id} className="group bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:shadow-xl hover:border-prime-100 transition-all duration-500">
                           <div className="flex items-center gap-5">
                              <div className="w-20 h-16 md:w-24 md:h-20 rounded-2xl overflow-hidden shadow-lg bg-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                                {member.group?.property?.thumbnailUrl && <img src={member.group.property.thumbnailUrl} className="w-full h-full object-cover" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                   <span className="px-2 py-0.5 bg-prime-50 text-prime-600 text-[8px] font-black uppercase tracking-widest rounded-md">
                                      {member.group?.property?.city}
                                   </span>
                                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                      {member.group?.status} Phase
                                   </span>
                                </div>
                                <h4 className="text-sm md:text-base font-black text-slate-900 truncate tracking-tight uppercase group-hover:text-prime-600 transition-colors">{member.group?.property?.title}</h4>
                                <div className="flex items-center gap-4 mt-3">
                                   <div className="flex-grow max-w-[120px] md:max-w-[180px]">
                                      <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-1.5">
                                         <span>Group Progress</span>
                                         <span className="text-prime-600">{Math.round(((member.group?._count?.members || 0)/(member.group?.maxMembers || 1))*100)}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${((member.group?._count?.members || 0)/(member.group?.maxMembers || 1))*100}%` }}
                                           className="h-full bg-prime-600 shadow-[0_0_10px_rgba(255,94,31,0.3)]" 
                                         />
                                      </div>
                                   </div>
                                </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 sm:self-center">
                             {member.group?.whatsappGroupLink && (
                               <a 
                                 href={member.group.whatsappGroupLink} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                                 onClick={(e) => e.stopPropagation()}
                                 title="Join Community"
                               >
                                 <MessageSquare size={18} />
                               </a>
                             )}
                             <Link 
                               to={`/properties/${member.group?.property?.id}`} 
                               className="h-11 px-6 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-prime-600 transition-all shadow-lg shadow-slate-100 group/btn"
                             >
                                <span className="text-[10px] font-black uppercase tracking-widest">Details</span>
                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                             </Link>
                           </div>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <div className="bg-white p-16 rounded-2xl text-center border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-4">No Groups Joined</p>
                      <Link to="/properties" className="h-10 px-8 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest inline-flex items-center">Explore Properties</Link>
                    </div>
                 )}
              </div>

              <div className="space-y-6">
                 <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Relationship Manager</h3>
                 {rm ? (
                   <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-prime-100 text-prime-600 flex items-center justify-center text-lg font-bold">
                          {rm.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold tracking-tight uppercase">{rm.name}</h4>
                          <p className="text-prime-400 font-bold text-[8px] uppercase tracking-widest">Assigned Manager</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                           {rm.phone || 'Contact Request'}
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 truncate">
                           {rm.email}
                        </div>
                      </div>
                   </div>
                 ) : (
                   <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                      <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-tight">Waitlisting Support</h4>
                      <p className="text-slate-400 text-[10px] leading-relaxed">A support officer will be assigned shortly.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Saved Properties</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{wishlist.length} Items</p>
            </div>
            {wishlist.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={item.property.thumbnailUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                      <div className="absolute top-4 right-4">
                        <button className="w-8 h-8 rounded-full bg-prime-600 text-white flex items-center justify-center shadow-lg cursor-default">
                          <Heart size={14} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[8px] font-bold text-prime-600 uppercase tracking-widest mb-1">{item.property.city}</p>
                      <h4 className="text-sm font-bold text-slate-900 truncate tracking-tight uppercase mb-4">{item.property.title}</h4>
                      <div className="flex gap-2">
                        <Link to={`/properties/${item.property.id}`} className="flex-[2] flex items-center justify-center h-10 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-prime-600 transition-all">
                          View Details
                        </Link>
                        <button 
                          onClick={async () => {
                            try {
                              await api.post('/users/wishlist', { propertyId: item.propertyId });
                              fetchUserData();
                              toast.success('Removed from wishlist');
                            } catch (e) { toast.error('Failed to remove'); }
                          }}
                          className="flex-[1] h-10 border border-slate-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-3xl text-center border border-dashed border-slate-200">
                <Heart size={48} className="text-slate-100 mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6">Your wishlist is empty</p>
                <Link to="/properties" className="btn-primary !h-10 text-xs tracking-wider uppercase inline-flex items-center px-10">Start Exploring</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Market Comparison</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comparisons.length}/4 Assets</p>
            </div>
            
            {comparisons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-3xl border-collapse overflow-hidden shadow-sm border border-slate-100">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="p-6 text-left text-[9px] font-bold uppercase tracking-widest">Attribute</th>
                      {comparisons.map((item) => (
                        <th key={item.id} className="p-6 text-left min-w-[200px]">
                            <div className="flex items-center gap-3">
                                <img src={item.property.thumbnailUrl} className="w-10 h-10 rounded-lg object-cover" />
                                <span className="text-[10px] uppercase font-bold tracking-tight line-clamp-1">{item.property.title}</span>
                            </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="p-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Price Node</td>
                      {comparisons.map((item) => (
                        <td key={item.id} className="p-6 text-sm font-bold text-slate-900 italic">
                            ₹{(item.property.price / 10000000).toFixed(2)} Cr
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Space Metrics</td>
                      {comparisons.map((item) => (
                        <td key={item.id} className="p-6 text-sm font-bold text-slate-900">
                            {item.property.bhk} BHK | {item.property.area || 'N/A'} Sq.Ft
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Developer</td>
                      {comparisons.map((item) => (
                        <td key={item.id} className="p-6 text-xs font-bold text-slate-500 uppercase">
                            {item.property.developer?.name || 'Institutional'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Location</td>
                      {comparisons.map((item) => (
                        <td key={item.id} className="p-6 text-xs font-bold text-slate-900">
                            {item.property.locality}, {item.property.city}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Action</td>
                      {comparisons.map((item) => (
                        <td key={item.id} className="p-6">
                            <div className="flex flex-col gap-2">
                                <Link to={`/properties/${item.property.id}`} className="h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest">Inspect</Link>
                                <button 
                                    onClick={async () => {
                                        try {
                                            await api.post('/users/comparison', { propertyId: item.propertyId });
                                            fetchUserData();
                                            toast.success('Removed from comparison');
                                        } catch (e) { toast.error('Failed to remove'); }
                                    }}
                                    className="h-8 flex items-center justify-center border border-slate-100 text-red-500 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-50"
                                >
                                    Purge
                                </button>
                            </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
                <div className="bg-white p-20 rounded-3xl text-center border border-dashed border-slate-200">
                    <Repeat size={48} className="text-slate-100 mx-auto mb-6" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6">Comparison Matrix Empty</p>
                    <Link to="/properties" className="btn-primary !h-10 text-xs tracking-wider uppercase inline-flex items-center px-10">Select Assets</Link>
                </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
            <div className="grid md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Personal Information</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Full Name', value: user.name || 'Not Set', icon: User },
                            { label: 'Mail Server', value: user.email, icon: Mail },
                            { label: 'Terminal', value: user.phone || 'Not Set', icon: Phone },
                            { label: 'Location', value: user.city || 'Not Set', icon: MapPin },
                        ].map((info, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-50">
                                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-300">
                                    <info.icon size={16} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{info.label}</p>
                                    <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">{info.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-prime-600 p-10 rounded-2xl text-white shadow-lg overflow-hidden relative">
                        <h4 className="text-xl font-bold mb-4 tracking-tight uppercase">Profile Settings</h4>
                        <p className="text-prime-100 text-xs leading-relaxed mb-8">Access logs and identity encryption enabled.</p>
                        <button className="h-10 px-6 bg-white text-prime-600 rounded-lg font-bold text-[10px] uppercase tracking-widest">Settings</button>
                    </div>

                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
                        <h4 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-tight">Referral Program</h4>
                        <div className="p-6 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                            <code className="text-prime-400 font-bold tracking-widest text-sm">TB-{user.id?.slice(0, 6)}</code>
                            <ExternalLink size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Profile Modal */}
        <AnimatePresence>
            {showEditProfile && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Config Identity</h3>
                            <button onClick={() => setShowEditProfile(false)} className="text-slate-400"><X size={20} /></button>
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleUpdateProfile} className="grid gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-4 bg-slate-50 border-slate-100 rounded-lg text-xs font-bold" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Phone</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-10 px-4 bg-slate-50 border-slate-100 rounded-lg text-xs font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">City</label>
                                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full h-10 px-4 bg-slate-50 border-slate-100 rounded-lg text-xs font-bold" />
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setShowEditProfile(false)} className="flex-grow h-10 rounded-lg border border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-400">Cancel</button>
                                    <button type="submit" className="flex-grow h-10 bg-prime-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest">Save Settings</button>
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

export default UserDashboard;
