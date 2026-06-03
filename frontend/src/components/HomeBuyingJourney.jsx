import React from 'react';
import { motion } from 'framer-motion';

const steps = [
    {
        number: 'G',
        title: 'Gather your shortlist',
        desc: 'Explore top projects via search, map view & virtual site visits — all from one place.',
        align: 'left',
    },
    {
        number: 'R',
        title: 'Reach out & visit',
        desc: 'Your dedicated RM plans a site visit. See the property, ask questions, lock your preference.',
        align: 'right',
    },
    {
        number: 'O',
        title: 'Own your group spot',
        desc: 'Get matched with others eyeing the same project. The more buyers, the stronger your collective position.',
        align: 'left',
    },
    {
        number: 'U',
        title: 'Unlock the discount',
        desc: 'We negotiate on your behalf as a collective — securing reductions no individual buyer could get alone.',
        align: 'right',
    },
    {
        number: 'P',
        title: 'Pocket the best deal',
        desc: 'Complete your purchase at guaranteed lowest market rates. Full support through paperwork & registration.',
        align: 'left',
    },
];

const DesktopJourneyCard = ({ step }) => {
    const isLeft = step.align === 'left';

    return (
        <div
            className={`relative flex min-h-[96px] w-full max-w-[400px] items-center rounded-full bg-[#eb552d] py-4 text-white shadow-[0_24px_50px_rgba(235,85,45,0.18)] ${isLeft ? 'ml-auto pl-6 pr-24' : 'mr-auto pl-24 pr-6'
                }`}
        >
            <div className="ml-2 max-w-[350px]">
                <h4 className="text-xl font-bold">{step.title}</h4>
                <p className="mt-1.5 text-sm font-medium leading-snug text-white/80">{step.desc}</p>
            </div>

            <div
                className={`absolute top-1/2 flex h-[74px] w-[74px] -translate-y-1/2 flex-col items-center justify-center rounded-full border-[5px] border-[#ffe6dc] bg-white text-[#eb552d] ${isLeft ? 'right-3' : 'left-3'
                    }`}
            >
                <span className="text-3xl font-semibold leading-none">{step.number}</span>
            </div>

            <div
                className={`absolute top-1/2 h-0 w-0 -translate-y-1/2 border-y-[12px] border-y-transparent ${isLeft
                    ? '-right-5 border-l-[22px] border-l-[#eb552d]'
                    : '-left-5 border-r-[22px] border-r-[#eb552d]'
                    }`}
            />
        </div>
    );
};

const MobileJourneyCard = ({ step, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ delay: index * 0.08 }}
        className="relative pl-10"
    >
        <div className="absolute left-0 top-8 z-10 h-5 w-5 rounded-full bg-[#eb552d] ring-4 ring-white shadow-md" />
        <div className="relative rounded-[2rem] bg-[#eb552d] px-5 py-5 pr-24 text-white shadow-[0_20px_44px_rgba(235,85,45,0.18)]">
            <div className="max-w-[220px]">
                <h4 className="text-base font-black leading-tight">{step.title}</h4>
                <p className="mt-2 text-xs font-medium leading-relaxed text-white/90">{step.desc}</p>
            </div>

            <div className="absolute right-4 top-1/2 flex h-[68px] w-[68px] -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-[#ffe6dc] bg-white text-[#eb552d]">
                <span className="text-[9px] font-medium uppercase tracking-[0.18em]">Step</span>
                <span className="text-[18px] font-black leading-none">{step.number}</span>
            </div>
        </div>
    </motion.div>
);

const HomeBuyingJourney = () => {
    return (
        <section className="relative overflow-hidden border-t border-slate-100 bg-[#f8f5f2] py-16 md:py-20">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(235,85,45,0.08),transparent_70%)]" />

            <div className="relative mx-auto max-w-6xl home-page-gutter">
                <div className="mb-12 text-center md:mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-lg font-semibold text-slate-900 md:text-2xl"
                    >
                        How Does Group
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.06 }}
                        className="mt-1 text-3xl font-black leading-tight text-slate-900 sm:text-4xl md:text-6xl"
                    >
                        <span className="text-[#eb552d]">GroupBuying
                        </span> Work?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 }}
                        className="mt-3 text-sm font-medium text-slate-500 md:text-base"
                    >
                        Follow the Simple <span className="font-bold text-[#eb552d]">5 Steps</span> to Your Dream Home
                    </motion.p>
                </div>

                <div className="relative mx-auto max-w-md lg:hidden">
                    <div className="absolute left-2 top-10 bottom-10 border-l-2 border-dashed border-slate-400/70" />
                    <div className="space-y-6">
                        {steps.map((step, index) => (
                            <MobileJourneyCard key={step.number} step={step} index={index} />
                        ))}
                    </div>
                </div>

                <div className="relative hidden lg:block">
                    <svg
                        className="pointer-events-none absolute left-1/2 top-[18px] z-0 h-[740px] w-[200px] -translate-x-1/2"
                        viewBox="0 0 200 740"
                        fill="none"
                        aria-hidden="true"
                    >
                        <motion.path
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 2.2, ease: 'easeInOut' }}
                            d="M100 24C142 68 142 112 100 156C58 200 58 244 100 288C142 332 142 376 100 420C58 464 58 508 100 552C142 596 142 640 100 684"
                            stroke="#1f2937"
                            strokeWidth="1.6"
                            strokeDasharray="8 10"
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ delay: index * 0.08 }}
                                className="grid h-[132px] grid-cols-[1fr_92px_1fr] items-center"
                            >
                                <div className="flex justify-end pr-6">
                                    {step.align === 'left' ? <DesktopJourneyCard step={step} /> : null}
                                </div>

                                <div className="relative flex justify-center">
                                    <span className="h-7 w-7 rounded-full bg-[#eb552d] ring-4 ring-white shadow-[0_10px_20px_rgba(235,85,45,0.24)]" />
                                </div>

                                <div className="flex justify-start pl-6">
                                    {step.align === 'right' ? <DesktopJourneyCard step={step} /> : null}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeBuyingJourney;
