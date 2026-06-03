import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, X, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <Check className="text-green-500" size={14} />;
      case 'WARNING': return <AlertTriangle className="text-orange-500" size={14} />;
      case 'INFO': return <Info className="text-blue-500" size={14} />;
      default: return <Bell className="text-slate-400" size={14} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[110]">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Notifications</h3>
        <div className="flex gap-4">
          <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest text-prime-600 hover:text-prime-700">Mark all as read</button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-3">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Bell className="text-slate-200" size={24} />
             </motion.div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checking Signals...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer ${!n.isRead ? 'bg-prime-50/30' : ''}`}
                onClick={() => !n.isRead && markAsRead(n.id)}
              >
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className={`text-[11px] leading-tight mb-1 ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>
                    {n.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed mb-2">
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                       <Clock size={10} /> {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                    {n.link && (
                      <Link to={n.link} onClick={onClose} className="flex items-center gap-1 text-[8px] font-black uppercase text-prime-600 hover:underline">
                         Action <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>
                {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-prime-600 shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Bell className="text-slate-100 mx-auto mb-4" size={40} />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No New Notifications</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
         <button className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900">View All History</button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
