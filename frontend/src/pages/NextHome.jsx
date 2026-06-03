import React, { useEffect } from 'react';
import { Briefcase, HandCoins, Users } from 'lucide-react';

const FEATURES = [
  {
    title: 'Group Buying Power',
    description:
      'Big discounts born from strength in numbers available only through developer partnerships.',
    icon: Users,
  },
  {
    title: 'Expert Negotiation Support',
    description:
      'Seasoned negotiators secure the best quotes and most attractive inventory.',
    icon: Briefcase,
    align: 'right',
  },
  {
    title: 'Regret-free Buying',
    description:
      'No more discovering later that someone else in your project paid less everyone in the group gets the same deal',
    icon: HandCoins,
  },
];

const CARD_STYLES = [
  {
    icon: 'bg-[#fff0e8] text-[#e1532e]',
    glow: 'bg-[#ffe2d4]',
  },
  {
    icon: 'bg-[#eef4ff] text-[#5475df]',
    glow: 'bg-[#dfe8ff]',
  },
  {
    icon: 'bg-[#effbea] text-[#64ad51]',
    glow: 'bg-[#dff6d6]',
  },
];

const FeatureCard = ({ title, description, icon: Icon, index }) => {
  const style = CARD_STYLES[index % CARD_STYLES.length];

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-[#eee4da] bg-white p-6 shadow-[0_18px_44px_rgba(43,33,24,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f1b29d] hover:shadow-[0_24px_54px_rgba(43,33,24,0.09)]">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[44px] ${style.glow}`} />
      <div className="relative flex items-start justify-between gap-4">
        <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl ${style.icon} ring-1 ring-black/5`}>
          <Icon size={28} strokeWidth={1.9} />
        </span>
        <span className="rounded-full bg-[#fff7f1] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#e1532e]">
          0{index + 1}
        </span>
      </div>
      <h3 className="relative mt-7 text-[20px] font-semibold leading-tight tracking-[-0.035em] text-[#111111]">
        {title}
      </h3>
      <p className="relative mt-3 text-[14px] font-semibold leading-[1.65] tracking-[-0.015em] text-[#4a4039]">
        {description}
      </p>
      <div className="relative mt-6 h-px bg-gradient-to-r from-[#e1532e]/40 via-[#eadfd4] to-transparent" />
    </article>
  );
};

const NextHome = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#f8f7f4]">
      <section className="px-4  sm:px-6 ">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-[860px] text-center">
            <h1 className="text-[36px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#101010] sm:text-[48px] lg:text-[58px]">
              Why Choose us for your next
              <br />
              <span className="text-[#e1532e]">Home Purchase?</span>
            </h1>
          </div>

          <div className="mx-auto mt-10 grid max-w-[1080px] gap-5 md:grid-cols-3 lg:mt-12">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NextHome;
