import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, MailCheck, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const getDashboardPath = (user) => {
  if (user?.role === 'ADMIN') return '/admin';
  if (user?.role === 'RM') return '/rm';
  return '/user/dashboard';
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const { handleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      const target = user.role === 'BUYER' && from ? from : getDashboardPath(user);
      navigate(target, { replace: true });
    }
  }, [user, location.state, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { email });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep('otp');
        setTimer(60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter 6-digit OTP');
    
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        toast.success('Welcome back!');
        handleLogin(res.data.user, res.data.token);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-display overflow-hidden">
      {/* Left Visual Pane */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[60%] bg-slate-900 relative">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.3]"
          alt="Luxury Architecture"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 p-20 flex flex-col justify-between h-full">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-prime-400 rounded-xl flex items-center justify-center text-slate-900">
                <ShieldCheck size={24} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Real Togather</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 md:mb-8">
              The Protocol for <br />
              <span className="text-prime-400 italic">Institutional</span> Assets.
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed">
              Step into the inner circle of Indian real estate. Access exclusive bulk-deals, secondary market intelligence, and collective exit strategies.
            </p>
          </motion.div>

          <div className="flex items-center gap-12">
             {[
               { label: 'Verified Deals', val: '500+' },
               { label: 'Community Alpha', val: '₹50Cr+' },
               { label: 'Secure Access', val: '256-bit' }
             ].map((stat, i) => (
               <div key={i} className="space-y-1">
                 <p className="text-prime-400 font-black text-2xl tracking-tighter">{stat.val}</p>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Interaction Pane */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-24 bg-slate-50 relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm mx-auto w-full relative z-10"
        >
          <div className="mb-8 md:mb-12">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center text-prime-600 mb-6 md:mb-8 border border-slate-100 italic font-black text-xl md:text-2xl">
              RT
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight">
              {step === 'email' ? 'Welcome' : 'One-Time Pass'}
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              {step === 'email' 
                ? 'Identity verification via secure protocol' 
                : `Enter the code sent to your mail.`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOTP}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <label className="form-label">Email Access Point</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      type="email" 
                      className="form-input !pl-14 !h-16 text-lg" 
                      placeholder="name@company.com" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="btn-primary w-full !h-16 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-prime-900/20 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      Request Access
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-10"
              >
                <div className="flex flex-col items-center">
                  <input 
                    type="text" 
                    maxLength="6"
                    className="w-full text-center text-5xl font-black tracking-[12px] h-24 bg-white border-2 border-slate-100 rounded-[32px] focus:border-prime-400 focus:shadow-[0_0_0_12px_rgba(201,168,76,0.05)] transition-all outline-none text-slate-900 placeholder:text-slate-100"
                    placeholder="000000"
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className="mt-6 flex items-center justify-between w-full px-2">
                    <p className="text-slate-400 text-xs font-bold">{email}</p>
                    <button 
                      type="button"
                      onClick={() => setStep('email')} 
                      className="text-prime-600 text-xs font-black uppercase tracking-widest hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    disabled={loading}
                    className="btn-primary w-full !h-16 text-sm font-black uppercase tracking-widest shadow-2xl shadow-prime-900/20"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Authorize Entry'}
                  </button>
                  <button 
                    type="button"
                    disabled={timer > 0 || loading}
                    onClick={handleSendOTP}
                    className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 disabled:opacity-50"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : 'Request New Code'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-center gap-4 grayscale opacity-40">
             <MailCheck size={18} className="text-slate-900" />
             <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900">End-to-End Secure Identity Protocol</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
