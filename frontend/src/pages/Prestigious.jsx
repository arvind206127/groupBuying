import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgePercent,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Crown,
  Handshake,
  SearchCheck,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your profile and share your preferred budget, city, and home type.',
    icon: UserPlus,
  },
  {
    number: '02',
    title: 'Browse Verified Projects',
    description: 'Review curated projects with verified signals and location confidence.',
    icon: SearchCheck,
  },
  {
    number: '03',
    title: 'Join Group Deal',
    description: 'Enter a buyer circle and build stronger purchase momentum.',
    icon: Handshake,
  },
  {
    number: '04',
    title: 'Unlock Insider Discounts',
    description: 'Access member-only launch offers and priority savings alerts.',
    icon: BadgePercent,
  },
  {
    number: '05',
    title: 'Schedule Property Tours',
    description: 'Book guided site visits or virtual walkthroughs with support.',
    icon: CalendarCheck,
  },
];

const highlights = [
  { label: 'Verified entry', value: 'Safe', icon: ShieldCheck },
  { label: 'Buyer momentum', value: 'Live', icon: Compass },
  { label: 'Member savings', value: 'Priority', icon: Crown },
];

const Prestigious = () => {
  const [activeStep, setActiveStep] = useState(2);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const featuredStep = steps[activeStep];
  const FeaturedIcon = featuredStep.icon;
  const sideSteps = steps.filter((_, index) => index !== activeStep);

  return (
    <div className="relative overflow-hidden bg-orange-10 pt-24 text-[#261208] md:pt-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[#ff9b64]/28 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#f6c7a7]/42 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(123,78,48,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(123,78,48,0.055)_1px,transparent_1px)] [background-size:54px_54px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1480px] px-4 pb-10 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[34px] border border-[#ecd3bf] bg-[#fff8f0]/90 p-5 shadow-[0_30px_80px_rgba(86,48,25,0.13)] backdrop-blur-xl sm:p-7 lg:p-8"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff6a13]/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-white/70 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.48, ease: 'easeOut' }}
              className="rounded-[28px] border border-[#efd8c6] bg-white/70 p-5 shadow-[0_20px_54px_rgba(80,42,20,0.08)] sm:p-6"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ffd4bd] bg-[#fff2ea] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#df472b]">
                <Crown size={15} />
                Prestigious journey
              </div>

              <h1 className="max-w-xl text-[2.45rem] font-black leading-[0.92] tracking-[-0.06em] text-[#241109] sm:text-[3.7rem]">
                A faster path from signup to site visit.
              </h1>

              <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-[#7a604f] sm:text-base">
                Prestigious membership keeps the buying journey short, guided, and easy to act on.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {highlights.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.08 }}
                      className="rounded-[18px] border border-[#f1d8c7] bg-white/78 p-3"
                    >
                      <Icon className="text-[#ff5a1f]" size={19} />
                      <p className="mt-3 text-lg font-black tracking-[-0.04em]">{item.value}</p>
                      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#8b6b58]">
                        {item.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/member"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#ff5a1f] px-6 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-[0_18px_36px_rgba(255,90,31,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#e64a18]"
                >
                  View perks
                  <ArrowRight className="ml-2" size={16} />
                </Link>
                <Link
                  to="/properties"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#e6ccb9] bg-white/68 px-6 text-[11px] font-black uppercase tracking-[0.15em] text-[#2b160c] transition-all hover:-translate-y-0.5 hover:border-[#ffad86]"
                >
                  Browse projects
                </Link>
              </div>
            </motion.div>

            <div className="relative overflow-hidden rounded-[28px] border border-[#efd8c6] bg-[#2b1710] p-4 text-white shadow-[0_24px_70px_rgba(80,42,20,0.16)] sm:p-5">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#ff6a13]/24 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-[#ffd2b5]/12 blur-3xl" />

              <div className="relative mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ffb58f]">
                    Guided flow
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.045em]">
                    Your buying track
                  </h2>
                </div>
                <span className="hidden rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 sm:inline-flex">
                  5 steps
                </span>
              </div>

              <div className="relative mb-5 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
                <div className="absolute left-8 right-8 top-1/2 hidden h-px -translate-y-1/2 overflow-hidden rounded-full bg-white/12 md:block">
                  <motion.span
                    className="block h-full rounded-full bg-gradient-to-r from-[#ffb58f] via-[#ff5a1f] to-[#ffd4bd]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.2, ease: 'easeInOut' }}
                  />
                </div>

                <div className="relative grid grid-cols-5 gap-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === activeStep;

                    return (
                      <motion.div
                        key={`dot-${step.number}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex flex-col items-center gap-2 text-center"
                      >
                        <motion.span
                          animate={{ scale: isActive ? [1, 1.15, 1] : [1, 1.04, 1] }}
                          transition={{ duration: 2.4 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border text-white shadow-[0_14px_30px_rgba(255,90,31,0.24)] ${
                            isActive
                              ? 'border-[#ffb58f] bg-[#ff5a1f]'
                              : 'border-white/12 bg-[#4a281c]'
                          }`}
                        >
                          <Icon size={18} />
                        </motion.span>
                        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/55">
                          {step.number}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="relative grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <motion.article
                  key={featuredStep.number}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16, duration: 0.42 }}
                  className="relative overflow-hidden rounded-[26px] border border-[#ffd0b6] bg-[#fff8f0] p-5 text-[#261208] shadow-[0_20px_48px_rgba(0,0,0,0.18)]"
                >
                  <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ff6a13]/14 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#df472b]">
                        Featured step {featuredStep.number}
                      </p>
                      <h3 className="mt-2 text-3xl font-black leading-none tracking-[-0.055em]">
                        {featuredStep.title}
                      </h3>
                    </div>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ff5a1f] text-white shadow-[0_16px_34px_rgba(255,90,31,0.25)]">
                      <FeaturedIcon size={23} />
                    </span>
                  </div>
                  <p className="relative mt-5 text-sm font-medium leading-7 text-[#765d4d]">
                    {featuredStep.description}
                  </p>
                  <div className="relative mt-5 flex flex-wrap gap-2">
                    {['Guided action', 'Priority flow', 'Buyer ready'].map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-[#fff0e8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#df472b]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.article>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {sideSteps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <motion.article
                        key={step.number}
                        layout
                        initial={{ opacity: 0, x: 18, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 18, scale: 0.98 }}
                        transition={{ delay: 0.2 + index * 0.07, duration: 0.38 }}
                        whileHover={{ x: 5 }}
                        className="group flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.075] p-3 transition-colors hover:bg-white/[0.12]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ff5a1f] shadow-sm">
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-[#ffb58f]">
                            Step {step.number}
                          </span>
                          <span className="mt-1 block truncate text-sm font-black text-white">
                            {step.title}
                          </span>
                        </span>
                        <CheckCircle2 className="ml-auto shrink-0 text-[#ffb58f] opacity-70 transition-opacity group-hover:opacity-100" size={16} />
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Prestigious;
