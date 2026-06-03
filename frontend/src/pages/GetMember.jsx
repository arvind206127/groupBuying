import React, { useEffect } from 'react';
import {
  BadgeCheck,
  Bell,
  FileText,
  PieChart,
  Sparkles,
  TicketPercent,
  Upload,
  UserRoundCheck,
  Video,
} from 'lucide-react';

const MEMBER_PERKS = [
  {
    title: 'Verified Property Access',
    icon: BadgeCheck,
  },
  {
    title: '30-sec Live Walkthroughs',
    icon: Video,
  },
  {
    title: 'Group Buy Discounts (2-10%)',
    icon: TicketPercent,
  },
  {
    title: 'Dedicated Relationship Manager',
    icon: UserRoundCheck,
  },
  {
    title: 'Legal & Documentation Help',
    icon: FileText,
  },
  {
    title: 'Early Launch Notifications',
    icon: Bell,
  },
  {
    title: 'Exclusive Members Only Webinars',
    icon: Sparkles,
  },
  {
    title: 'Virtual Site Visit Priority',
    icon: Upload,
  },
  {
    title: 'Access to Case Studies & Market Insights',
    icon: PieChart,
  },
];

const GetMember = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#f8f7f4] pt-20 text-[#111111] md:pt-24">
      <section className="px-4 pb-10 sm:px-6 md:pb-14">
        <div className="mx-auto max-w-[1320px] rounded-[34px] border border-[#eee3d8] bg-white px-4 py-8 shadow-[0_24px_70px_rgba(43,33,24,0.06)] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e1532e]">
              Member Benefits
            </p>
            <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-[-0.055em] text-[#111111] sm:text-[46px] lg:text-[52px]">
              What You Get as a Member
            </h1>
          </div>

          <div className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {MEMBER_PERKS.map((perk, index) => {
              const Icon = perk.icon;
              const number = String(index + 1).padStart(2, '0');

              return (
                <article
                  key={perk.title}
                  className="group relative min-h-[104px] overflow-hidden rounded-[24px] border border-[#efe5dc] bg-[#fffdf9] p-4 shadow-[0_12px_28px_rgba(43,33,24,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f0a890] hover:shadow-[0_18px_38px_rgba(43,33,24,0.075)]"
                >
                  <div className="absolute right-0 top-0 flex h-14 w-16 items-center justify-center rounded-bl-[28px] bg-[#fff0e8] text-[13px] font-semibold tracking-[0.12em] text-[#e1532e] transition-colors group-hover:bg-[#e1532e] group-hover:text-white">
                    {number}
                  </div>
                  <div className="relative flex h-full flex-col justify-between">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1532e] text-white shadow-[0_12px_24px_rgba(225,83,46,0.22)] transition-colors group-hover:bg-[#24140d]">
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <h2 className="mt-5 max-w-[220px] text-[16px] font-semibold leading-snug tracking-[-0.03em] text-[#111111]">
                      {perk.title}
                    </h2>
                  </div>
                </article>
              );
            })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetMember;
