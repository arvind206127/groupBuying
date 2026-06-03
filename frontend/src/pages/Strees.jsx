import React, { useEffect } from 'react';
import {
  BadgePercent,
  CalendarCheck,
  CheckCircle2,
  HandCoins,
  Search,
  Users,
} from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Shortlist Your Dream Project',
    description:
      'Explore new and under-construction residential projects via our map search, quick videos, and live virtual tours.',
    icon: Search,
    accent: 'from-[#fff0e8] to-[#fff8f3] text-[#e45530]',
  },
  {
    number: '02',
    title: 'Express Interest',
    description:
      'Plan a physical site visit with support from your dedicated Relationship Manager, armed with data and guidance.',
    icon: CalendarCheck,
    accent: 'from-[#eef4ff] to-[#f8fbff] text-[#5475df]',
  },
  {
    number: '03',
    title: 'Join a Buyer Group',
    description:
      'Select your preferred home and begin the group to strengthen buying power.',
    icon: Users,
    accent: 'from-[#effbea] to-[#fbfff8] text-[#64ad51]',
  },
  {
    number: '04',
    title: 'Unlock Developer Discounts',
    description:
      'Gain access to exclusive pre-launch and bulk-buy offers directly negotiated with developers.',
    icon: BadgePercent,
    accent: 'from-[#fff6dd] to-[#fffdf4] text-[#d89b0c]',
  },
  {
    number: '05',
    title: 'Finalize Purchase',
    description:
      'Complete your deal confidently with zero brokerage and maximum savings.',
    icon: CheckCircle2,
    accent: 'from-[#f4ecff] to-[#fcf9ff] text-[#8b5cf6]',
  },
  {
    number: '06',
    title: 'Maximize Savings',
    description:
      'Pay no broker fees and walk away with a great deal and save up to Rs.50 lakhs.',
    icon: HandCoins,
    accent: 'from-[#eafafa] to-[#f7ffff] text-[#0f9f9a]',
  },
];

const StepCard = ({ number, title, description, icon: Icon, accent }) => (
  <article className="group relative overflow-hidden rounded-[28px] border border-[#eee4da] bg-white p-5 shadow-[0_18px_42px_rgba(38,26,17,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f1b29d] hover:shadow-[0_24px_58px_rgba(38,26,17,0.09)]">
    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
    <div className="flex items-start justify-between gap-4">
      <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br ${accent} ring-1 ring-black/5`}>
        <Icon size={26} strokeWidth={1.9} />
      </span>
      <span className="rounded-full bg-[#fff7f1] px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#e45530]">
        STEP {number}
      </span>
    </div>
    <h3 className="mt-7 text-left text-[18px] font-semibold leading-tight tracking-[-0.035em] text-[#16110f]">
      {title}
    </h3>
    <p className="mt-3 text-left text-[13px] font-semibold leading-[1.65] tracking-[-0.015em] text-[#4a4039] sm:text-[14px]">
      {description}
    </p>
  </article>
);

const Strees = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fbf8f3] pt-24 md:pt-28">
      <section className="px-4 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_center,#ffffff_0%,#fffaf6_62%,#fbf8f3_100%)] px-4 py-10 shadow-[0_24px_90px_rgba(97,68,40,0.06)] sm:px-8 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(229, 221, 212, 0.52) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(229, 221, 212, 0.52) 1px, transparent 1px)
                `,
                backgroundSize: '66px 66px',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_32%,rgba(255,255,255,0.82)_100%)]"
            />

            <div className="relative z-10">
              <div className="mx-auto max-w-[620px] text-center">
                <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#111111] sm:text-[40px] lg:text-[48px]">
                  Stress free Steps for Your
                  <br />
                  <span className="text-[#e45530]">Dream Home</span>
                </h1>
              </div>

              <div className="mx-auto mt-10 grid max-w-[1120px] gap-5 md:grid-cols-2 xl:grid-cols-3">
                {STEPS.map((step) => (
                  <StepCard key={step.number} {...step} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Strees;
