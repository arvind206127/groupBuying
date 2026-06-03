import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Phone, User, Mail, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const EnquiryModal = ({ isOpen, onClose, property }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/leads', {
        ...formData,
        propertyId: property.id,
        source: 'Property Card Enquiry'
      });
      if (res.data.success) {
        setSubmitted(true);
        toast.success('Enquiry sent successfully');
        setTimeout(() => {
          onClose();
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      toast.error('Failed to send enquiry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-10">
          <X size={24} />
        </button>

        <div className="p-10">
          {submitted ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Message Received</h3>
              <p className="text-slate-500 font-medium italic">An expert Relationship Manager will contact you shortly.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-prime-50 flex items-center justify-center text-prime-600 shadow-sm">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">Quick Enquiry</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{property.title}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                   <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <User size={12} className="text-prime-600" /> Full Name
                   </label>
                   <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-prime-100 outline-none transition-all"
                      placeholder="Enter your name"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <Mail size={12} className="text-prime-600" /> Email
                    </label>
                    <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-prime-100 outline-none transition-all"
                        placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <Phone size={12} className="text-prime-600" /> Phone
                    </label>
                    <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-prime-100 outline-none transition-all"
                        placeholder="+91"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                   <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <MessageSquare size={12} className="text-prime-600" /> Message (Optional)
                   </label>
                   <textarea 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-prime-100 outline-none transition-all resize-none"
                      placeholder="I'm interested in this project..."
                   />
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-prime-600 hover:shadow-prime-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Send Signal</>}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EnquiryModal;
