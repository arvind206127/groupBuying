import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgePercent,
  Building2,
  Check,
  ClipboardCheck,
  Diamond,
  Handshake,
  KeyRound,
  Loader2,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Reviews from './Reviews';
import Search from './Search';
import Member from './Member';
import Prestigious from './Prestigious';
import WhyBecomes from './WhyBecomes';
import GetMember from './GetMember';

const plans = [
  {
    id: 'basic',
    name: 'Explorer',
    price: '0',
    tagline: 'Basic access to public deals',
    features: [
      'Access to public groups',
      'Verified property listings',
      'Basic savings calculator',
      'Market price insights',
      'Email alerts',
    ],
    icon: Zap,
  },
  {
    id: 'premium',
    name: 'Family Pro',
    price: '2,999',
    popular: true,
    tagline: 'Recommended for home buyers',
    features: [
      'Early access to new groups',
      'Exclusive high-discount deals',
      'Dedicated relationship manager',
      'Priority site visits',
      'Detailed investment reports',
      'WhatsApp group access',
    ],
    icon: Star,
  },
  {
    id: 'annual',
    name: 'Wealth Elite',
    price: '9,999',
    tagline: 'For portfolio investors',
    features: [
      'All Premium features',
      'One-on-one legal consultation',
      'Home loan assistance',
      'Property resale support',
      'VVIP site visits',
      'Developer direct meetings',
    ],
    icon: Diamond,
  },
];

const unlockBenefits = [
  'Access to 3,200+ pan-India premium properties',
  'Early EOI slots before public launch',
  'Save up to 15% through group buying',
  'Dedicated relationship manager on demand',
  'Instant activation - start exploring today',
];

const innerOrbitItems = [
  { label: 'Verified Projects', icon: Building2, angle: 225 },
  { label: 'EOI Offers', icon: ClipboardCheck, angle: 305 },
];

const outerOrbitItems = [
  { label: 'Developer Access', icon: Handshake, angle: 0 },
  { label: 'Group Discounts', icon: BadgePercent, angle: 118 },
  { label: 'Buyer Groups', icon: Users, angle: 185 },
];

const Subscriptions = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/login', { state: { from: location } });

    const from = location.state?.from?.pathname || '/dashboard';
    const originalState = location.state || {};

    if (planId === 'basic') return navigate(from, { state: originalState, replace: true });

    setLoading(true);
    try {
      const res = await api.post('/subscriptions/subscribe', { plan: planId });
      if (res.data.success) {
        toast.success(`Successfully upgraded to ${planId.toUpperCase()}!`);
        await refreshUser();
        navigate(from, { state: originalState, replace: true });
      }
    } catch (error) {
      toast.error('Subscription failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#ffffff] pb-16 pt-28 text-[#2a1409] md:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-9rem] h-[30rem] w-[30rem] rounded-full bg-[#ffb27c]/30 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-[34rem] w-[34rem] rounded-full bg-[#f66f52]/16 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(137,84,47,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(137,84,47,0.055)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1430px] px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[34px] border border-[#d3cac1] bg-[#fff8ef]/92 px-5 py-6 shadow-[0_34px_100px_rgba(94,47,18,0.12)] backdrop-blur-xl sm:px-8 md:rounded-[46px] md:py-7 lg:min-h-[420px] lg:px-12"
        >
          <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#ffe4cf]/70 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 right-12 h-44 w-44 rounded-full bg-[#f66f52]/12 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-[690px] text-left">
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[#df472b] sm:text-sm"
              >
                What you unlock instantly
              </motion.p>

              <h1
                className="max-w-[660px] text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.013em] text-[#2a1409] sm:text-[3.35rem] lg:text-[4.05rem]"
              >
                Everything you need to buy smarter
              </h1>

              <p className="mt-4 max-w-[620px] text-base font-medium leading-7 text-[#80634e] sm:text-lg sm:leading-8">
                One membership, lifetime value. Our network spans 50+ cities with 3,200+ verified listings and growing daily.
              </p>

              <div className="mt-5 space-y-3">
                {unlockBenefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + index * 0.06 }}
                    className="flex items-start gap-4"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-[#ff6a13] text-white shadow-[0_14px_28px_rgba(255,106,19,0.24)]">
                      <Check size={15} strokeWidth={3} />
                    </span>
                    <span className="text-base font-medium leading-6 text-[#351d10] sm:text-lg">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleSubscribe('premium')}
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff6a13] px-7 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_45px_rgba(255,106,19,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#e75805] disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Unlock Premium'}
                  {!loading && <ArrowRight className="ml-3" size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/properties')}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#ecd4bf] bg-white/70 px-7 text-xs font-black uppercase tracking-[0.16em] text-[#3b2113] transition-all hover:-translate-y-0.5 hover:border-[#ffb38c]"
                >
                  Explore Deals
                </button>
              </div>
            </div>

            <div className="relative mx-auto flex h-[290px] w-full max-w-[680px] items-center justify-center overflow-visible sm:h-[340px] lg:h-[380px]">
              <div className="absolute h-[160px] w-[160px] rounded-full border border-dashed border-[#f7c7a9] sm:h-[210px] sm:w-[210px] lg:h-[230px] lg:w-[230px]" />
              <div className="absolute h-[250px] w-[250px] rounded-full border border-dashed border-[#f5c5a9] sm:h-[310px] sm:w-[310px] lg:h-[350px] lg:w-[350px]" />

              <div className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 sm:h-[210px] sm:w-[210px] lg:h-[230px] lg:w-[230px]">
                <motion.div
                  className="subscription-orbit-layer subscription-orbit-layer-reverse absolute inset-0"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                >
                  {innerOrbitItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="subscription-orbit-point subscription-orbit-inner h-0 w-0"
                        style={{
                          '--orbit-angle': `${item.angle}deg`,
                          '--orbit-upright-angle': `${-item.angle}deg`,
                        }}
                      >
                        <div className="subscription-orbit-card relative h-[82px] w-[116px] -translate-x-1/2 -translate-y-1/2 text-center sm:h-[96px] sm:w-[130px]">
                          <motion.div
                            className="subscription-orbit-face subscription-orbit-face-reverse"
                            initial={{ rotate: -item.angle }}
                            animate={{ rotate: 360 - item.angle }}
                            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                          >
                            <span className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#ead3bc] bg-white text-[#ff6a13] shadow-[0_16px_34px_rgba(91,52,24,0.12)] sm:h-[60px] sm:w-[60px]">
                              <Icon size={21} strokeWidth={2.1} />
                            </span>
                            <span className="mt-2 block text-[8px] font-black uppercase leading-3 tracking-[0.13em] text-[#8a674f] sm:text-[9px]">
                              {item.label}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 sm:h-[310px] sm:w-[310px] lg:h-[350px] lg:w-[350px]">
                <motion.div
                  className="subscription-orbit-layer absolute inset-0"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                >
                  {outerOrbitItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="subscription-orbit-point subscription-orbit-outer h-0 w-0"
                        style={{
                          '--orbit-angle': `${item.angle}deg`,
                          '--orbit-upright-angle': `${-item.angle}deg`,
                        }}
                      >
                        <div className="subscription-orbit-card relative h-[92px] w-[128px] -translate-x-1/2 -translate-y-1/2 text-center sm:h-[108px] sm:w-[144px]">
                          <motion.div
                            className="subscription-orbit-face"
                            initial={{ rotate: -item.angle }}
                            animate={{ rotate: -360 - item.angle }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                          >
                            <span className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#ead3bc] bg-white text-[#ff6a13] shadow-[0_18px_40px_rgba(91,52,24,0.13)] sm:h-[72px] sm:w-[72px]">
                              <Icon size={24} strokeWidth={2.1} />
                            </span>
                            <span className="mt-2 block text-[8px] font-black uppercase leading-3 tracking-[0.13em] text-[#8a674f] sm:text-[9px]">
                              {item.label}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              <motion.span
                className="absolute left-[18%] top-[28%] h-4 w-4 rounded-full bg-[#ff914d] shadow-[0_0_0_9px_rgba(255,145,77,0.12)]"
                animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                className="absolute bottom-[23%] right-[22%] h-3.5 w-3.5 rounded-full bg-[#ff914d]"
                animate={{ y: [0, -12, 0], opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-[#ff6a13] text-white shadow-[0_28px_70px_rgba(255,106,19,0.34)] sm:h-[132px] sm:w-[132px]"
              >
                <KeyRound size={34} fill="rgba(255,255,255,0.2)" />
                <p className="mt-3 text-xs font-black uppercase tracking-[0.28em]">Premium</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <div className="mt-14 flex flex-col items-center rounded-[28px] border border-[#ead3bc] bg-white/72 px-6 py-7 text-center shadow-[0_22px_50px_rgba(91,52,24,0.08)]">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="text-[#ff6a13]" size={24} />
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a674f]">Secure Payment Gateway</p>
          </div>
          <p className="max-w-xl text-sm font-medium leading-6 text-[#80634e]">
            Payments are protected and subscription activation happens instantly after successful upgrade.
          </p>
        </div>
      </div>
      <Member/>
      <Prestigious/>
      <WhyBecomes/>
      <GetMember/>
      <Reviews/>
      <Search/>
    </div>
  );
};

export default Subscriptions;
