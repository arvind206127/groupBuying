import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Users, BadgeIndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
];

// Default fallback values — used when admin hasn't set anything yet
const DEFAULTS = {
  heroBgColor: '#f66f52',
  heroTagline: 'Looking to buy your Dream Home?',
  heroHeadingLine1: 'Pay Less',
  heroHeadingLine2: 'Together',
  heroSubtext: 'Get Group Buying Discounts +\n100% Broker Commission Cashback',
  heroBtnText: 'Become Member',
  heroBtnSubtext: 'Lifetime Membership Join once, save for life',
  heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=90&w=1200',
  heroImageAlt: 'Premium apartment building',
  heroSavingsText: "We've saved Rs.25Cr+ for 150+ Families",
  heroSavingsSubtext: "Buyer's on TogetherBuying save 10-15% more than market prices",
  heroGroupBuyTitle: 'Buy as a Group',
  heroGroupBuyBadge: 'Get 5-10% Extra Discount',
  heroGroupBuyDesc1: 'Each member purchases their own apartment',
  heroGroupBuyDesc2: 'Join 3-7 buyers in the same project and negotiate directly.',
  heroCashbackTitle: 'Get 3-5% Cashback',
  heroCashbackBadge: 'Limited Time Offer',
  heroCashbackDesc: 'We pass back the entire broker commission 100% as extra savings on your home purchase.',
  heroCashbackHighlight: 'On a Rs.2Cr home, you save Rs.6L - Rs.10L instantly!',
};

const Hero = () => {
  const [s, setS] = useState(DEFAULTS); // s = settings

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          // Merge API values over defaults (only override keys that exist in API)
          setS(prev => ({ ...prev, ...res.data.settings }));
        }
      } catch {
        // Silently fall back to defaults
      }
    };
    fetchSettings();
  }, []);

  const subtextLines = (s.heroSubtext || '').split('\n');

  return (
    <section
      className="relative overflow-hidden bg-white home-page-gutter pb-12 pt-[94px] sm:pb-14 md:pb-20 md:pt-[114px]"
    >
      <div className="relative mx-auto max-w-[1332px]">
        <div
          className="relative min-h-[520px] overflow-hidden rounded-[26px] sm:rounded-[30px] md:min-h-[580px] md:rounded-[32px]"
          style={{ backgroundColor: s.heroBgColor || DEFAULTS.heroBgColor }}
        >
          {/* Grid pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.2]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.95) 3px, transparent 3px),
                linear-gradient(90deg, rgba(255,255,255,0.95) 3px, transparent 3px),
                linear-gradient(rgba(255,255,255,0.75) 3px, transparent 3px),
                linear-gradient(90deg, rgba(255,255,255,0.75) 3px, transparent 3px)
              `,
              backgroundSize: '150px 150px, 150px 150px, 82px 82px, 82px 82px',
              backgroundPosition: '0 0, 0 0, 26px 26px, 26px 26px',
            }}
          />

          <div className="relative z-10 grid min-h-[520px] items-center gap-10 px-5 pb-16 pt-10 sm:px-8 md:px-10 md:pb-20 md:pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-[68px]">
            {/* ── Left: Text ── */}
            <div className="max-w-[500px] text-white/90">
              <p className="mb-5 text-lg font-medium tracking-[0.005em] sm:text-xl md:mb-7 md:text-[23px]">
                {s.heroTagline || DEFAULTS.heroTagline}
              </p>

              <h1 className="mb-6 text-[44px] font-semibold leading-[0.92] tracking-[-0.03em] text-white/95 sm:text-[56px] md:mb-7 md:text-[72px] lg:text-[80px]">
                {s.heroHeadingLine1 || DEFAULTS.heroHeadingLine1}
                <br />
                {s.heroHeadingLine2 || DEFAULTS.heroHeadingLine2}
              </h1>

              <p className="mb-6 max-w-[460px] text-base font-normal leading-[1.35] tracking-[0.002em] text-white/90 sm:text-lg md:mb-5 md:text-[22px]">
                {subtextLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < subtextLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>

              <Link
                to="/login"
                className="inline-flex min-h-[64px] w-full max-w-[320px] items-center justify-between gap-3 rounded-[28px] bg-white px-4 py-4 text-[#df472b] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(90,27,12,0.18)] sm:min-h-[72px] sm:w-auto sm:max-w-none sm:justify-start sm:gap-4 sm:rounded-full sm:py-0 sm:pr-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1ed] text-[#df472b]">
                  <Users size={26} strokeWidth={3} />
                </span>
                <span className="text-left">
                  <span className="block text-lg font-semibold leading-none tracking-[-0.04em] sm:text-[20px]">
                    {s.heroBtnText || DEFAULTS.heroBtnText}
                  </span>
                  <span className="mt-1.5 block max-w-[210px] text-[11px] font-medium leading-snug text-[#252525] sm:text-[12px]">
                    {s.heroBtnSubtext || DEFAULTS.heroBtnSubtext}
                  </span>
                </span>
                <ArrowUpRight className="ml-auto sm:ml-2" size={23} strokeWidth={2.4} />
              </Link>
            </div>

            {/* ── Right: Image ── */}
            <div className="pointer-events-none relative hidden min-h-[430px] items-end justify-end lg:flex">
              <div
                className="absolute bottom-[-18px] right-[-8px] h-[460px] w-[560px] rounded-t-[28px] blur-2xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              />
              <img
                src={s.heroImage || DEFAULTS.heroImage}
                alt={s.heroImageAlt || DEFAULTS.heroImageAlt}
                className="relative z-10 h-[455px] w-[535px] rounded-t-[20px] object-cover object-center shadow-[0_30px_80px_rgba(113,40,22,0.2)] [clip-path:polygon(19%_22%,100%_0,100%_100%,0_100%,0_42%)]"
              />
              <div
                className="absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r to-transparent"
                style={{ '--tw-gradient-from': s.heroBgColor || DEFAULTS.heroBgColor } }
              />
              <div
                className="absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t to-transparent"
                style={{ '--tw-gradient-from': s.heroBgColor || DEFAULTS.heroBgColor }}
              />
            </div>
          </div>
        </div>

        {/* ── Info Cards ── */}
        <div className="relative z-20 mx-auto -mt-10 grid w-[94%] max-w-[980px] overflow-hidden rounded-[26px] bg-white shadow-[0_28px_70px_rgba(28,20,15,0.18)] sm:-mt-14 sm:w-[92%] md:-mt-[90px] md:w-[80%] md:grid-cols-2 md:rounded-[30px]">
          {/* Group Buy Card */}
          <div className="flex min-h-[120px] items-start gap-4 px-4 py-5 sm:gap-5 sm:px-7 sm:py-6">
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#fff1ed] text-[#df472b]">
              <Users size={29} strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                <h3 className="text-lg font-semibold leading-none tracking-[-0.05em] text-[#070707] sm:text-[21px]">
                  {s.heroGroupBuyTitle || DEFAULTS.heroGroupBuyTitle}
                </h3>
                <span className="w-fit rounded-full bg-[#df472b] px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-[0_0_0_6px_#fff1ed] sm:px-4 sm:py-1.5 sm:text-[12px] sm:shadow-[0_0_0_7px_#fff1ed]">
                  {s.heroGroupBuyBadge || DEFAULTS.heroGroupBuyBadge}
                </span>
              </div>
              <p className="text-[15px] font-normal leading-snug tracking-[-0.035em] text-[#df472b] sm:text-[16px]">
                {s.heroGroupBuyDesc1 || DEFAULTS.heroGroupBuyDesc1}
              </p>
              <p className="mt-1.5 text-[14px] leading-snug tracking-[-0.025em] text-slate-500 sm:text-[16px]">
                {s.heroGroupBuyDesc2 || DEFAULTS.heroGroupBuyDesc2}
              </p>
            </div>
          </div>

          {/* Cashback Card */}
          <div className="flex min-h-[120px] items-start gap-4 border-t border-slate-200 px-4 py-5 sm:gap-5 sm:px-7 sm:py-6 md:border-l md:border-t-0">
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#fff1ed] text-[#df472b]">
              <BadgeIndianRupee size={27} strokeWidth={2.8} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                <h3 className="text-lg font-semibold leading-none tracking-[-0.05em] text-[#df472b] sm:text-[21px]">
                  {s.heroCashbackTitle || DEFAULTS.heroCashbackTitle}
                </h3>
                <span className="w-fit rounded-full bg-[#df472b] px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-[0_0_0_6px_#fff1ed] sm:px-4 sm:py-1.5 sm:text-[12px] sm:shadow-[0_0_0_7px_#fff1ed]">
                  {s.heroCashbackBadge || DEFAULTS.heroCashbackBadge}
                </span>
              </div>
              <p className="text-[14px] leading-snug tracking-[-0.025em] text-slate-600 sm:text-[16px]">
                {s.heroCashbackDesc || DEFAULTS.heroCashbackDesc}
              </p>
              <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-[11px] font-semibold tracking-[-0.025em] text-[#1e1e1e] sm:text-[12px]">
                {s.heroCashbackHighlight || DEFAULTS.heroCashbackHighlight}
              </div>
            </div>
          </div>
        </div>

        {/* ── Social Proof ── */}
        <div className="relative z-30 mx-auto mt-4 flex w-[94%] max-w-[690px] flex-col items-center justify-center gap-3 rounded-[28px] bg-white px-4 py-4 text-center shadow-[0_18px_55px_rgba(28,20,15,0.14)] sm:w-[92%] sm:px-6 md:flex-row md:gap-4 md:text-left xl:-mt-5 xl:w-[58%] xl:min-w-[520px] xl:rounded-full">
          <div className="flex shrink-0 -space-x-3">
            {AVATARS.map((src) => (
              <img key={src} src={src} alt="" className="h-10 w-10 rounded-full border-[3px] border-white object-cover" />
            ))}
          </div>
          <p className="text-[13px] font-medium leading-snug tracking-[-0.025em] text-[#343434] sm:text-[14px]">
            {s.heroSavingsText || DEFAULTS.heroSavingsText}
            <br />
            {s.heroSavingsSubtext || DEFAULTS.heroSavingsSubtext}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
