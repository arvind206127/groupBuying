import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Headphones,
  TicketPercent,
  Video,
} from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=85&w=1400';

const BENEFITS = [
  {
    title: 'Verified Properties',
    description: 'Curated homes with clean details and trusted project checks.',
    icon: BadgeCheck,
  },
  {
    title: 'Early Launch Access',
    description: 'See selected new launches before public demand rises.',
    icon: CalendarClock,
  },
  {
    title: 'Live & Virtual Tours',
    description: 'Compare projects through guided visits and virtual previews.',
    icon: Video,
  },
  {
    title: 'Member Discounts',
    description: 'Unlock better pricing through negotiated group opportunities.',
    icon: TicketPercent,
  },
  {
    title: 'Personalized Assistance',
    description: 'Get buying support from discovery to final decision.',
    icon: Headphones,
  },
];

const WhyBecomes = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#fffaf6] pt-20 text-[#15100d] md:pt-24">
      <section className="px-4 pb-8 sm:px-6 md:pb-10">
        <div className="mx-auto grid max-w-[1400px] overflow-hidden rounded-[34px] border border-[#f0dfd3] bg-white shadow-[0_24px_70px_rgba(73,41,20,0.07)] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative overflow-hidden bg-[#24140d] px-6 py-7 text-white sm:px-9 lg:px-10 lg:py-10">
            <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[#e1532e]/30 blur-3xl" />
            <div className="absolute bottom-10 right-8 h-28 w-28 rounded-full border border-white/10" />

            <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb79f]">
              Prestigious Member
            </p>
            <h1 className="relative mt-3 max-w-xl text-[30px] font-semibold leading-[1.03] tracking-[-0.0095em] sm:text-[40px] lg:text-[46px]">
              Why become a premium buyer member?
            </h1>
            <p className="relative mt-3 max-w-lg text-[13px] font-semibold leading-5 text-white/72 sm:text-[16px]">
              Get priority access, expert guidance, and member-first deal opportunities built for a smoother property buying journey.
            </p>

            <div className="relative mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
                <p className="text-xl font-semibold text-white">5+</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">Core benefits</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
                <p className="text-xl font-semibold text-white">₹50L</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">Possible savings</p>
              </div>
            </div>

            <Link
              to="/subscriptions"
              className="relative mt-5 inline-flex items-center gap-3 rounded-full bg-[#e1532e] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(225,83,46,0.24)] transition-all hover:-translate-y-1 hover:bg-[#cf4322]"
            >
              Join Now
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="relative bg-[#fff7f1] p-4 sm:p-5 lg:p-6">
            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                {BENEFITS.map((benefit, index) => {
                  const Icon = benefit.icon;

                  return (
                    <article
                      key={benefit.title}
                      className="group rounded-[18px] border border-[#f0ded1] bg-white p-3 shadow-[0_12px_28px_rgba(73,41,20,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f1a88f]"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0e8] text-[#e1532e] transition-colors group-hover:bg-[#e1532e] group-hover:text-white">
                          <Icon size={19} strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e1532e]">
                            0{index + 1}
                          </p>
                          <h3 className="mt-1 whitespace-nowrap text-[16px] font-semibold leading-tight tracking-[-0.03em] text-[#16110f]">
                            {benefit.title}
                          </h3>
                        </div>
                        </div>
                        <p className="mt-3 text-[13px] font-semibold leading-[1.6] text-[#6f5a4b]">
                          {benefit.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="relative min-h-[326px] overflow-hidden rounded-[22px] border border-white bg-[#20130f] shadow-[0_18px_44px_rgba(73,41,20,0.14)]">
                <img
                  src={HERO_IMAGE}
                  alt="Premium residential towers"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#20130f]/72 via-[#20130f]/12 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-[20px] border border-white/16 bg-white/14 p-4 text-white backdrop-blur-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/64">
                    Member Advantage
                  </p>
                  <p className="mt-2 text-[18px] font-semibold leading-tight tracking-[-0.035em]">
                    Priority deals, guided support, and smarter property access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyBecomes;
