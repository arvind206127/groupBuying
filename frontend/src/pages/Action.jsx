import React, { useEffect } from 'react';
import {
  BadgeIndianRupee,
  BadgePercent,
  HandCoins,
  Handshake,
} from 'lucide-react';

const METRIC_CARDS = [
  {
    value: '25+',
    label: 'Crore Saved',
    icon: BadgeIndianRupee,
    bg: 'bg-[#f6edd1]',
    bubble: 'bg-[#ffe082]',
    iconColor: 'text-[#d5a90f]',
    sparkColor: 'text-[#e0c04b]',
  },
  {
    value: '150+',
    label: 'Buyers Empowered',
    icon: HandCoins,
    bg: 'bg-[#dfe5f7]',
    bubble: 'bg-[#b7c8fa]',
    iconColor: 'text-[#6d8ff5]',
    sparkColor: 'text-[#86a3ff]',
  },
  {
    value: '10+',
    label: 'Project Negotiated',
    icon: Handshake,
    bg: 'bg-[#dceade]',
    bubble: 'bg-[#acea99]',
    iconColor: 'text-[#78cb63]',
    sparkColor: 'text-[#97d98a]',
  },
  {
    value: '20%',
    label: 'Average Discount Unlocked',
    icon: BadgePercent,
    bg: 'bg-[#f4dcf3]',
    bubble: 'bg-[#f0afe9]',
    iconColor: 'text-[#d978cc]',
    sparkColor: 'text-[#e194d8]',
  },
];

const Action = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f4] ">
      <section className="px-4 pb-14 sm:px-6 md:pb-20">
        <div className="mx-auto max-w-[1240px] rounded-[26px] bg-[#f8f7f4] px-4 py-10 sm:px-8 lg:px-14 lg:py-16">
          <div className="mx-auto max-w-[820px] text-center">
            <h1 className="text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#101010] sm:text-[50px] lg:text-[62px]">
              See the Power of
              <br />
              <span className="text-[#e0522b]">Group Buying</span> in Action
            </h1>
          </div>

          <div className="mx-auto mt-10 grid max-w-[1100px] gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {METRIC_CARDS.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className="group relative min-h-[160px] overflow-hidden rounded-[26px] border border-[#eee7dc] bg-white p-5 shadow-[0_16px_38px_rgba(43,33,24,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(43,33,24,0.08)]"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1.5 ${card.bubble}`}
                  />
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ring-1 ring-black/5`}
                  >
                    <Icon className={card.iconColor} size={27} strokeWidth={1.9} />
                  </div>

                  <div className="mt-7">
                    <p className="text-[34px] font-semibold leading-none tracking-[-0.055em] text-[#111111]">
                      {card.value}
                    </p>
                    <p className="mt-2 text-[13px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#332f2b] sm:text-[14px]">
                      {card.label}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-[1160px] px-4 text-center sm:px-6 lg:px-8">
            <p className="w-full text-justify text-[16px] leading-[1.75] tracking-[-0.02em] text-[#101010] sm:text-[18px]">
              In India, one of the biggest regrets for homebuyers has always
              been finding out later that a neighbour or colleague bought the
              same house for less. For years, individuals paid inflated prices
              while bulk buyers and institutions enjoyed exclusive discounts.
              At TogetherBuying, we&apos;re rewriting the story. By teaming up,
              buyers negotiate directly with developers, unlocking exclusive
              deals and pre-launch prices that were never available to
              individuals before.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Action;
