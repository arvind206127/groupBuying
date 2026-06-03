import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, MapPin, IndianRupee, MessageSquare, 
  ShieldCheck, ArrowLeft, Loader2, CheckCircle2, 
  Clock, TrendingDown, Info
} from 'lucide-react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const GroupDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroup();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.emit('join-group-room', id);
      
      socket.on('member-joined', (data) => {
        if (data.groupId === id) {
          fetchGroup();
        }
      });

      socket.on('group-full', (data) => {
        if (data.groupId === id) {
          fetchGroup();
        }
      });

      return () => {
        socket.emit('leave-group-room', id);
        socket.off('member-joined');
        socket.off('group-full');
      };
    }
  }, [socket, id]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/groups/${id}`);
      if (res.data.success) {
        setGroup(res.data.group);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <Loader2 className="animate-spin text-prime-600" size={64} />
    </div>
  );

  if (!group) return null;

  const activeMembers = group.members.filter(m => m.isActive);
  const progressPercent = (activeMembers.length / group.maxMembers) * 100;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-prime-600 mb-12 transition-colors group">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           Back to Dashboard
        </Link>
        
        <div className="grid lg:grid-cols-3 gap-12 items-start">
           <div className="lg:col-span-2 space-y-10">
              {/* Main Info */}
              <div className="bg-white p-12 rounded-[48px] shadow-premium border border-slate-100">
                 <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                    <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${group.status === 'FULL' ? 'bg-green-500 text-white shadow-xl shadow-green-200' : 'bg-prime-600 text-white shadow-xl shadow-prime-200'}`}>
                       {group.status} DEAL
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                       <ShieldCheck size={18} className="text-prime-500" /> Deal Managed by Real Togather
                    </div>
                 </div>

                 <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-6">
                    {group.property.title}
                 </h1>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-lg mb-10">
                    <MapPin className="text-prime-500" /> {group.property.city}
                 </div>

                 <div className="grid md:grid-cols-3 gap-8 py-10 border-y border-slate-50">
                    <div>
                       <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Target Group Size</p>
                       <p className="text-3xl font-black text-slate-900">{group.maxMembers} Buyers</p>
                    </div>
                    <div>
                       <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Negotiation Status</p>
                       <p className="text-3xl font-black text-prime-600">{group.dealStatus}</p>
                    </div>
                    <div>
                       <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Deal Closure</p>
                       <p className="text-3xl font-black text-slate-900">Dec 2024</p>
                    </div>
                 </div>
              </div>

              {/* Member List */}
              <div className="bg-white p-12 rounded-[48px] shadow-premium border border-slate-100">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-slate-900">Group Members</h3>
                    <div className="px-4 py-1.5 bg-slate-50 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest">
                       {activeMembers.length} / {group.maxMembers} Spots Filled
                    </div>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-6">
                    {activeMembers.map((member, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={member.id} 
                        className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-prime-200 transition-all"
                      >
                         <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black uppercase text-prime-600 shadow-sm overflow-hidden">
                            {member.user.avatar ? <img src={member.user.avatar} className="w-full h-full object-cover" /> : member.user.name?.charAt(0)}
                         </div>
                         <div>
                            <p className="text-slate-900 font-black">{member.user.name || 'Incognito Buyer'}</p>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                               <MapPin size={12} /> {member.user.city || 'Private'}
                            </p>
                         </div>
                         {member.user.id === user?.id && (
                           <div className="ml-auto w-8 h-8 rounded-full bg-prime-600 flex items-center justify-center text-white">
                              <CheckCircle2 size={16} />
                           </div>
                         )}
                      </motion.div>
                    ))}
                    {[...Array(group.maxMembers - activeMembers.length)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 opacity-60">
                         <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-300">
                            <Users size={24} />
                         </div>
                         <div>
                            <p className="text-slate-400 font-black italic">Waiting for buyer...</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-prime-500">Spot Available</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Sidebar - Timeline & Actions */}
           <div className="sticky top-32 space-y-8">
              <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-3xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-prime-600/20 blur-[60px] rounded-full" />
                 <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
                    <Clock className="text-prime-400" /> Deal Progress
                 </h3>
                 
                 <div className="space-y-10 relative z-10">
                    {[
                      { step: 'Group Formation', date: format(new Date(group.createdAt), 'MMM dd'), status: 'COMPLETED' },
                      { step: 'Bulk Negotiation', date: 'In Progress', status: 'ACTIVE' },
                      { step: 'Document Setup', date: 'Queue', status: 'PENDING' },
                      { step: 'Final Purchase', date: 'Queue', status: 'PENDING' }
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-6 relative">
                         {idx !== 3 && <div className="absolute left-4 top-8 w-0.5 h-12 bg-white/5" />}
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${step.status === 'COMPLETED' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : step.status === 'ACTIVE' ? 'bg-prime-500 shadow-[0_0_15px_rgba(68,87,255,0.4)] animate-pulse' : 'bg-white/5 border border-white/20'}`}>
                            {step.status === 'COMPLETED' && <CheckCircle2 size={16} />}
                            {step.status === 'ACTIVE' && <div className="w-2 h-2 rounded-full bg-white" />}
                         </div>
                         <div className="flex-grow">
                            <p className={`font-black uppercase tracking-[0.1em] text-[10px] mb-1 ${step.status === 'PENDING' ? 'text-slate-600' : 'text-slate-400'}`}>{step.date}</p>
                            <p className={`text-lg font-black ${step.status === 'PENDING' ? 'text-slate-600' : 'text-white'}`}>{step.step}</p>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-12 bg-white/5 rounded-3xl p-8 border border-white/10 text-center">
                    <div className="flex flex-col items-center gap-3 mb-6">
                       <TrendingDown className="text-green-400" size={32} />
                       <h4 className="text-xl font-black">Estimated Savings</h4>
                       <p className="text-4xl font-black text-green-400">8.5%</p>
                    </div>
                    {group.whatsappGroupLink && (
                       <a 
                         href={group.whatsappGroupLink} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-black h-14 rounded-2xl transition-all shadow-lg shadow-green-500/20 mb-4"
                       >
                          <MessageSquare size={20} /> Join WhatsApp Group
                       </a>
                    )}
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Our Relationship Manager is currently finalizing terms with the developer team.</p>
                    <button className="btn w-full bg-white text-slate-900 font-black h-14">Contact Advisor</button>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 flex items-center justify-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                 <Info className="text-prime-600" /> 
                 <span>Non-Binding Intention</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
