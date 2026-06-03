import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const toDigits = (value = '') => value.replace(/\D/g, '').slice(0, 10);

const getLoginEmail = (phone) => `mobile.${toDigits(phone)}@groupbuying.local`;

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { handleLogin, refreshUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  const loginEmail = useMemo(() => getLoginEmail(phone), [phone]);

  useEffect(() => {
    let intervalId;

    if (timer > 0) {
      intervalId = setInterval(() => {
        setTimer((value) => {
          if (value <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return value - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timer]);

  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setOtp('');
      setStep('phone');
      setLoading(false);
      setTimer(0);
      setDevOtp('');
    }
  }, [isOpen]);

  const handleSendOtp = async (event) => {
    event.preventDefault();

    const normalizedPhone = toDigits(phone);
    if (normalizedPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', {
        email: loginEmail,
        name: `GroupBuying Member ${normalizedPhone.slice(-4)}`,
      });

      if (response.data?.success) {
        setStep('otp');
        setTimer(60);
        setDevOtp(response.data?.otp || '');
        toast.success('OTP sent successfully.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: loginEmail,
        otp,
      });

      if (response.data?.success) {
        handleLogin(response.data.user, response.data.token);

        try {
          await api.put('/users/profile', {
            name:
              response.data.user?.name ||
              `GroupBuying Member ${toDigits(phone).slice(-4)}`,
            phone: toDigits(phone),
          });
          await refreshUser();
        } catch (profileError) {
          console.error('Phone sync failed:', profileError);
        }

        toast.success('Welcome to GroupBuying.');
        onSuccess?.();
        onClose?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-md sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          className="relative w-full max-w-5xl overflow-hidden rounded-[2.3rem] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]"
        >
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative hidden min-h-[660px] overflow-hidden p-4 lg:block">
              <div className="absolute inset-4 overflow-hidden rounded-[1.8rem]">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                  alt="Property preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,24,0.08),rgba(12,16,24,0.72))]" />
              </div>

              <div className="absolute bottom-12 left-12 right-10 z-10 text-white">
                <h2 className="text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.06em]">
                  Simplified Property Buying
                </h2>
                <p className="mt-4 max-w-sm text-lg leading-8 text-white/90">
                  From dreaming to owning, we make the process easy and
                  achievable.
                </p>
              </div>
            </div>

            <div className="relative flex min-h-[620px] flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#242424] transition-colors hover:text-[#ef5a22]"
                >
                  <ArrowLeft size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#dedad5] px-4 py-3 text-sm font-medium text-[#2c2c2c] transition-colors hover:bg-[#faf8f6]"
                >
                  <MessageCircle size={18} className="text-[#20c05c]" />
                  Chat
                </button>
              </div>

              <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col justify-center">
                <h3 className="text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.06em] text-[#121212]">
                  {step === 'phone'
                    ? 'Login with mobile number to explore GroupBuying'
                    : 'Enter the OTP to explore GroupBuying'}
                </h3>

                <AnimatePresence mode="wait">
                  {step === 'phone' ? (
                    <motion.form
                      key="phone-step"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      onSubmit={handleSendOtp}
                      className="mt-10 space-y-5"
                    >
                      <div>
                        <label className="mb-3 block text-sm font-medium text-[#4b4b4b]">
                          Phone
                        </label>
                        <div className="flex overflow-hidden rounded-2xl border border-[#ece9e4] bg-[#f7f7f6]">
                          <div className="flex min-w-[86px] items-center gap-2 border-r border-[#e3dfda] px-4">
                            <span className="text-lg font-semibold text-[#242424]">
                              +91
                            </span>
                          </div>
                          <div className="flex flex-1 items-center gap-3 px-4">
                            <Phone size={18} className="text-[#a6a6a6]" />
                            <input
                              type="tel"
                              inputMode="numeric"
                              value={phone}
                              onChange={(event) =>
                                setPhone(toDigits(event.target.value))
                              }
                              placeholder="enter phone number"
                              className="h-16 w-full bg-transparent text-lg text-[#191919] outline-none placeholder:text-[#9b9b9b]"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#121212] text-lg font-semibold text-white transition-colors hover:bg-[#ef5a22] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <Loader2 size={22} className="animate-spin" />
                        ) : (
                          'Sign in'
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="otp-step"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      onSubmit={handleVerifyOtp}
                      className="mt-10 space-y-5"
                    >
                      <div>
                        <label className="mb-3 block text-sm font-medium text-[#4b4b4b]">
                          OTP
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="enter 6-digit otp"
                          className="h-16 w-full rounded-2xl border border-[#ece9e4] bg-[#f7f7f6] px-5 text-center text-2xl font-semibold tracking-[0.35em] text-[#191919] outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-[#9b9b9b]"
                        />
                      </div>

                      {devOtp ? (
                        <div className="rounded-2xl border border-[#ffe1d7] bg-[#fff5f0] px-4 py-3 text-sm text-[#df4a25]">
                          Dev OTP: <span className="font-semibold">{devOtp}</span>
                        </div>
                      ) : null}

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#121212] text-lg font-semibold text-white transition-colors hover:bg-[#ef5a22] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <Loader2 size={22} className="animate-spin" />
                        ) : (
                          'Verify OTP'
                        )}
                      </button>

                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setStep('phone');
                            setOtp('');
                          }}
                          className="font-medium text-[#646464] transition-colors hover:text-[#ef5a22]"
                        >
                          Change number
                        </button>
                        <button
                          type="button"
                          disabled={timer > 0 || loading}
                          onClick={() => {
                            handleSendOtp({ preventDefault: () => {} });
                          }}
                          className="font-medium text-[#ef5a22] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="mt-8 border-t border-[#ece8e2] pt-8 text-xs leading-6 text-[#8a8a8a]">
                  By joining, you agree to the GroupBuying Terms and Conditions
                  and to occasionally receive alerts from us. Please read our
                  Privacy Policy to learn how we use your personal data.
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-[#7a7a7a] shadow-sm transition-colors hover:text-[#ef5a22] lg:hidden"
          >
            <X size={18} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
