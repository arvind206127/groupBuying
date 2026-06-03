import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Instagram, Linkedin, Users } from 'lucide-react';
import api from '../api/axios';
import GetInTouch from './GetInTouch';
import Reviews from './Reviews';
import SearchPage from './Search';

const ContactHeroIllustration = () => (
  <svg viewBox="0 0 760 560" className="h-auto w-full max-w-[640px]" aria-hidden="true">
    <path
      d="M620 160C650 110 674 96 686 86C685 126 680 170 650 208C631 232 611 254 596 270C597 244 601 205 620 160Z"
      fill="#fff3ef"
    />
    <path
      d="M626 356C651 319 676 305 694 296C686 334 674 378 638 411C619 429 600 447 584 461C591 432 602 390 626 356Z"
      fill="#fff3ef"
    />
    <path
      d="M0 494H700"
      stroke="rgba(255,255,255,0.88)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <circle cx="260" cy="435" r="42" fill="#fff" />
    <rect x="233" y="418" width="54" height="34" rx="6" stroke="#e45a34" strokeWidth="4" fill="none" />
    <path d="M237 422L260 440L283 422" stroke="#e45a34" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

    <path
      d="M346 323L387 307L421 320L445 354L396 372L356 357L346 323Z"
      fill="#fff"
    />
    <path
      d="M376 258C388 244 412 241 428 251C442 260 450 277 448 300L425 300L403 302L388 292L376 278V258Z"
      fill="#2f2b47"
    />
    <path d="M412 269H441C437 283 429 294 417 302L412 269Z" fill="#f8b0a1" />
    <path
      d="M333 337L347 323L356 357L347 442C346 450 339 456 330 456C318 456 310 445 313 434L333 337Z"
      fill="#ffb0a4"
    />
    <path
      d="M429 322L490 309C498 307 505 312 507 320C509 328 504 335 497 338L437 357L429 322Z"
      fill="#ffb0a4"
    />
    <path
      d="M380 356L431 345L472 375L500 489H464L436 402L421 493H389L394 392L380 356Z"
      fill="#2f2b47"
    />
    <path
      d="M421 320L441 355L430 392L390 396L372 350L368 315L391 308L421 320Z"
      fill="#fff"
    />
    <path
      d="M387 308L406 318L401 336L381 332L376 315L387 308Z"
      fill="#fff"
    />
    <path
      d="M353 458H390V494H343C343 481 348 468 353 458Z"
      fill="#2f2b47"
    />
    <path
      d="M467 455H504V494H454C456 479 461 467 467 455Z"
      fill="#2f2b47"
    />

    <rect x="514" y="42" width="256" height="476" rx="38" fill="#433f62" />
    <rect x="531" y="57" width="222" height="447" rx="32" fill="#fcfcfd" />
    <rect x="579" y="60" width="126" height="22" rx="11" fill="#433f62" />
    <rect x="623" y="165" width="84" height="98" rx="4" fill="#e45a34" />
    <circle cx="665" cy="204" r="15" fill="#fff" />
    <path d="M645 233H686" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    <path d="M645 250H686" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    <path d="M607 327H733" stroke="#dedee5" strokeWidth="8" strokeLinecap="round" />
    <path d="M611 356H673" stroke="#dedee5" strokeWidth="8" strokeLinecap="round" />
    <path d="M611 384H719" stroke="#dedee5" strokeWidth="8" strokeLinecap="round" />
    <path d="M611 412H670" stroke="#dedee5" strokeWidth="8" strokeLinecap="round" />
    <path d="M611 440H733" stroke="#dedee5" strokeWidth="8" strokeLinecap="round" />
    <circle cx="644" cy="476" r="16" fill="#e5e5ea" />
    <rect x="769" y="155" width="10" height="78" rx="5" fill="#433f62" />
  </svg>
);

const Contact = () => {
  const [settings, setSettings] = useState({});
  const MotionDiv = motion.div;
  const MotionAnchor = motion.a;

  useEffect(() => {
    api
      .get('/settings')
      .then((response) => {
        if (response.data.success) {
          setSettings(response.data.settings || {});
        }
      })
      .catch(() => {
        setSettings(window.__SITE_SETTINGS__ || {});
      });
  }, []);

  const socialCards = useMemo(
    () => [
      {
        title: '@togetherbuying.in',
        sub: 'Instagram community',
        href: settings.instagramUrl || 'https://instagram.com',
        Icon: Instagram,
      },
      {
        title: '@togetherbuying.india',
        sub: 'Facebook updates',
        href: settings.facebookUrl || 'https://facebook.com',
        Icon: Facebook,
      },
      {
        title: '@togetherbuying',
        sub: 'LinkedIn network',
        href: settings.linkedinUrl || 'https://linkedin.com',
        Icon: Linkedin,
      },
    ],
    [settings.facebookUrl, settings.instagramUrl, settings.linkedinUrl]
  );

  return (
    <div className="min-h-screen bg-white pb-16 pt-24 md:pb-24 md:pt-32">
      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6">
        <div className="relative min-h-[440px] overflow-hidden rounded-[26px] bg-[#f66f52] sm:rounded-[30px] md:min-h-[460px] md:rounded-[34px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.18]"
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

          <div className="relative z-10 grid min-h-[360px] items-center gap-8 px-6 pb-10 pt-10 sm:px-8 md:px-10 md:pb-12 md:pt-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-0 lg:px-[56px] xl:px-[68px]">
            <div className="max-w-[560px] text-white/95">
              <p className="mb-6 text-[18px] font-semibold  sm:text-2xl md:mb-14 md:text-[23px]">
                Your Home Buying Partner, Every Step of the Way
              </p>

              <h1 className="mb-6 text-[48px] font-semibold leading-[0.9] tracking-[-0.055em] text-white sm:text-[62px] md:mb-8 md:text-[78px] lg:text-[86px] xl:whitespace-nowrap">
                Buying Journey
              </h1>

              <p className="mb-8 max-w-[470px] text-[18px] font-normal leading-[1.32] tracking-[-0.02em] text-white/92 sm:text-[20px] md:mb-10 md:text-[22px]">
                Discover the easiest ways to get in touch with us and make your
                buying journey smarter.
              </p>

              <Link
                to="/login"
                className="inline-flex min-h-[68px] w-full max-w-[360px] items-center justify-between gap-3 rounded-[30px] bg-white px-4 py-4 text-[#df472b] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(90,27,12,0.18)] sm:min-h-[78px] sm:w-auto sm:max-w-none sm:justify-start sm:gap-4 sm:rounded-full sm:py-0 sm:pr-7"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1ed] text-[#df472b]">
                  <Users size={26} strokeWidth={3} />
                </span>
                <span className="text-left">
                  <span className="block text-lg font-semibold leading-none tracking-[-0.04em] sm:text-[20px]">
                    Become Member
                  </span>
                  <span className="mt-1.5 block max-w-[220px] text-[12px] font-medium leading-snug text-[#252525] sm:text-[13px]">
                    Lifetime Membership Join once, save for life
                  </span>
                </span>
                <ArrowUpRight className="ml-auto sm:ml-2" size={23} strokeWidth={2.4} />
              </Link>
            </div>

            <div className="pointer-events-none relative hidden min-h-[360px] items-end justify-end lg:flex">
              <div className="absolute bottom-4 right-10 h-[285px] w-[315px] rounded-full bg-white/12 blur-3xl" />
              <div className="relative z-10 w-full max-w-[560px] translate-x-1 xl:translate-x-0">
                <img src="	https://cdn.togetherbuying.in/cms/uploads/avatar_76357f1431.jpg?w=640&q=75" alt="Contact Hero" className="w-full object-contain" />
              </div>
            </div>
          </div>
        </div>

        <section className="pb-2 pt-16 sm:pt-20">
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-[40px] font-semibold leading-none tracking-[-0.05em] text-[#111111] sm:text-[52px] md:text-[60px]">
              Connect With Us On
            </h2>
          </MotionDiv>

          <div className="mt-10 mb-8 grid gap-4 lg:grid-cols-4">
            {socialCards.map(({ title, sub, href, Icon }, index) => (
              <MotionAnchor
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${title} on ${sub}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.08 }}
                className="group relative overflow-hidden rounded-[26px] border border-[#f16645] bg-[#fff1ea] px-5 py-3 shadow-[0_16px_40px_rgba(241,102,69,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(241,102,69,0.16)] sm:px-6"
              >
                <div className="absolute right-3 top-2 h-5 w-5 rounded-full bg-[#f7b39d]/50" />
                <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white/40 to-transparent" />
                <div className="pointer-events-none absolute -bottom-6 right-3 text-[#f16645]/10 transition-transform duration-300 group-hover:-translate-y-1">
                  {React.createElement(Icon, { size: 96, strokeWidth: 1.7 })}
                </div>

                <div className="relative flex min-h-[62px] items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e45a34] text-white shadow-[0_14px_34px_rgba(228,90,52,0.22)]">
                    {React.createElement(Icon, { size: 28 })}
                  </span>

                  <p className="truncate pr-12 text-lg font-semibold tracking-[-0.05em] text-[#e2552d] sm:text-[20px]">
                    {title}
                  </p>
                </div>
              </MotionAnchor>
            ))}
          </div>
        </section>
      </div>

      <GetInTouch />
      <Reviews />
      <SearchPage/>
    </div>
  );
};

export default Contact;
