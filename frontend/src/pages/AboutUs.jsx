import React, { useEffect } from 'react';
import { ArrowUpRight, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Action from './Action';
import NextHome from './NextHome';
import Strees from './Strees';
import TrustUs from './TrustUs';
import Stay from './Stay';
import SearchPage from './Search';

const HOUSE_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=85&w=1400';

const GRID_BOXES = [
  { top: '10%', left: '6%', size: 18 },
  { top: '17%', left: '14%', size: 14 },
  { top: '25%', right: '20%', size: 18 },
  { top: '44%', left: '12%', size: 14 },
  { top: '58%', left: '36%', size: 12 },
  { top: '69%', right: '18%', size: 18 },
  { top: '80%', left: '31%', size: 14 },
  { top: '33%', right: '7%', size: 16 },
];

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fbf8f3] pt-24 md:pt-28">
      <section className="px-4 pb-8 sm:px-6 md:pb-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative overflow-hidden rounded-[34px] border border-[#eee3d8] bg-[radial-gradient(circle_at_center,#ffffff_0%,#fffaf6_58%,#fdf8f3_100%)] shadow-[0_32px_90px_rgba(97,68,40,0.08)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(229, 221, 212, 0.65) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(229, 221, 212, 0.65) 1px, transparent 1px)
                `,
                backgroundSize: '64px 64px',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_32%,rgba(255,255,255,0.78)_100%)]"
            />

            {GRID_BOXES.map((box, index) => (
              <span
                key={`${box.top}-${box.left || box.right}-${index}`}
                aria-hidden="true"
                className="absolute rounded-[8px] border border-[#e6ddd3] bg-white/35"
                style={{
                  top: box.top,
                  left: box.left,
                  right: box.right,
                  width: `${box.size}px`,
                  height: `${box.size}px`,
                }}
              />
            ))}

            <div className="relative z-10 flex flex-col gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:min-h-[544px] lg:flex-row lg:items-center lg:px-20 lg:py-12">
              <div className="lg:min-w-0 lg:flex-1 lg:pl-3">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute left-[112px] top-[6px] hidden h-[92px] w-[262px] -rotate-[7deg] rounded-full border border-[#dbd5cd] lg:block"
                  />

                  <h1 className="relative text-3xl font-black leading-[0.92] tracking-[-0.02em] text-orange-600 sm:text-6xl lg:text-7xl xl:text-6xl">
                    Looking to Buy
                    <br />
                    your Dream Property
                  </h1>
                </div>

                <p className="mt-6 max-w-xl text-lg leading-[1.5] text-[#171311] sm:text-2xl sm:leading-[1.45]">
                  Join our Property Community and unlock savings of up to
                  Rs.50 lakhs on Properties!
                </p>

                <Link
                  to="/properties"
                  className="group mt-8 inline-flex min-h-[64px] w-full max-w-md items-center gap-4 rounded-full bg-white px-5 py-3 text-orange-600 shadow-[0_16px_42px_rgba(80,55,33,0.10)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(80,55,33,0.14)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1ea] text-orange-600">
                    <Users size={22} strokeWidth={2.6} />
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-base font-semibold tracking-[-0.04em] text-orange-600">
                      Explore Properties
                    </span>
                    <span className="mt-1 block text-[12px] font-medium text-slate-500">
                      Browse verified group-buying deals
                    </span>
                  </span>
                  <ArrowUpRight
                    size={22}
                    strokeWidth={2.2}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <div className="relative flex min-h-[336px] items-end justify-center lg:min-h-[512px] lg:w-[680px] lg:flex-none lg:justify-end xl:w-[760px]">
                <div className="relative h-[336px] w-full max-w-[820px] sm:h-[408px] lg:h-[512px] lg:w-[680px] xl:w-[760px]">
                  <img
                    src={HOUSE_IMAGE}
                    alt="Modern luxury home"
                    className="absolute bottom-[7%] right-[4%] z-10 h-[86%] w-[88%] rounded-[34px] object-cover object-center shadow-[0_38px_75px_rgba(80,55,33,0.18)] ring-1 ring-white/70 sm:bottom-[6%] sm:right-[3%] sm:h-[88%] lg:bottom-[5%] lg:right-[2%]"
                  />
                  <div
                    className="absolute z-20 rounded-full bg-white/95 px-4 py-3 shadow-[0_16px_38px_rgba(80,55,33,0.12)] lg:hidden"
                    style={{
                      right: '-1%',
                      top: '45%',
                      width: '258px',
                      maxWidth: 'calc(100vw - 72px)',
                      border: '1px solid rgba(255,255,255,0.84)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ece7de] bg-white">
                        <img
                          src={HOUSE_IMAGE}
                          alt=""
                          className="h-full w-full object-cover object-[76%_38%]"
                        />
                      </span>
                      <p className="text-[13px] font-medium leading-[1.45] text-slate-900 sm:text-[14px]">
                        Unique Group
                        <br />
                        buying plans.
                      </p>
                    </div>
                  </div>

                  <div
                    className="absolute z-20 rounded-[22px] p-4 sm:p-5 lg:hidden"
                    style={{
                      bottom: '1%',
                      left: '-8%',
                      width: 'min(390px, calc(100vw - 56px))',
                      backgroundColor: 'rgba(255,255,255,0.97)',
                      border: '1px solid rgba(255,255,255,0.88)',
                      boxShadow: '0 18px 45px rgba(80,55,33,0.14)',
                    }}
                  >
                    <div className="absolute left-[-12px] top-[-18px] hidden text-slate-900 lg:block">
                      <span className="block h-4 w-[2px] rotate-[34deg] rounded-full bg-slate-900/80" />
                      <span className="mt-1 block h-4 w-[2px] rotate-[58deg] rounded-full bg-slate-900/80" />
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    className="absolute left-[1%] top-[58%] z-20 hidden h-4 w-4 rounded-full border border-slate-900/15 bg-transparent lg:block"
                  />
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </section>
      <Action/>
      <NextHome/>
      <Strees/>
      <TrustUs/>
      <Stay/>
      <SearchPage/>
    </div>
  );
};

export default AboutUs;
