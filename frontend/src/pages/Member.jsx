import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Crown,
  Handshake,
  Home,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  UserRoundCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const memberBenefits = [
  {
    number: '01',
    title: 'Verified property access',
    description: 'Shortlisted homes with trust checks, clean details, and transparent project information.',
    icon: ShieldCheck,
  },
  {
    number: '02',
    title: 'Private deal window',
    description: 'Get member-first visibility on selected launches, price drops, and limited inventory.',
    icon: TicketPercent,
  },
  {
    number: '03',
    title: 'Early launch alerts',
    description: 'Stay ahead with curated project alerts before demand peaks across priority locations.',
    icon: CalendarClock,
  },
  {
    number: '04',
    title: 'Dedicated buying support',
    description: 'Receive guided assistance for site visits, documentation, and negotiation checkpoints.',
    icon: UserRoundCheck,
  },
  {
    number: '05',
    title: 'Group buying advantage',
    description: 'Join active buyer groups and unlock better momentum while comparing smarter options.',
    icon: Handshake,
  },
];

const stats = [
  { value: '50+', label: 'cities covered' },
  { value: '3.2K+', label: 'verified listings' },
  { value: '15%', label: 'possible savings' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

const Member = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white pt-20 text-[#24140d] md:pt-16">
      <main className="relative z-10 mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-14 ">
        <section className="">
          <div className="mb-7 flex flex-wrap justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#df472b]">
                Why become a member
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24140d] sm:text-5xl">
                Five clear advantages
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-6 text-[#7b604d] sm:text-base">
              Designed for buyers who want confidence, priority, and a better process from discovery to decision.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {memberBenefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.article
                  key={benefit.title}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  whileHover={{ y: -8 }}
                  className="group relative min-h-[230px] overflow-hidden rounded-[28px] border border-[#ecd6c3] bg-white/84 p-6 shadow-[0_22px_52px_rgba(73,41,20,0.08)] transition-colors hover:border-[#ffad87]"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#ff6a13]/0 blur-2xl transition-colors group-hover:bg-[#ff6a13]/12" />
                  <div className="relative flex items-start justify-between gap-4">
                    <span className="text-5xl font-black leading-none tracking-[-0.08em] text-[#ff5a1f]">
                      {benefit.number}
                    </span>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e8] text-[#df472b] transition-colors group-hover:bg-[#ff5a1f] group-hover:text-white">
                      <Icon size={23} />
                    </span>
                  </div>
                  <h3 className="relative mt-7 max-w-sm text-2xl font-black leading-tight tracking-[-0.035em] text-[#1c100a]">
                    {benefit.title}
                  </h3>
                  <p className="relative mt-3 max-w-md text-sm font-medium leading-7 text-[#776052]">
                    {benefit.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Member;
