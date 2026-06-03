import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgePercent,
  ChevronDown,
  CreditCard,
  Home as HomeIcon,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getFallbackFaqs } from '../data/faqs';

const categoryMeta = {
  General: {
    label: 'About GroupBuying',
    icon: HomeIcon,
  },
  Process: {
    label: 'Joining a Group & Key Benefits',
    icon: Users,
  },
  Subscription: {
    label: 'Membership & Subscription Fees',
    icon: CreditCard,
  },
  Savings: {
    label: 'Pricing & Discount Benefits',
    icon: BadgePercent,
  },
  Safety: {
    label: 'Buyer Safety & Trust',
    icon: ShieldCheck,
  },
};

const brandify = (value = '') =>
  value.replace(/Together\s*Buying|TogetherBuying/gi, 'GroupBuying');

const FAQSection = () => {
  const groupedFaqs = useMemo(() => {
    const sourceFaqs = getFallbackFaqs().slice(0, 6).map((faq) => ({
      ...faq,
      question: brandify(faq.question),
      answer: brandify(faq.answer),
    }));

    const grouped = new Map();

    sourceFaqs.forEach((faq) => {
      const category = faq.category || 'General';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category).push(faq);
    });

    return Array.from(grouped.entries()).map(([category, items]) => ({
      category,
      label: categoryMeta[category]?.label || brandify(category),
      icon: categoryMeta[category]?.icon || HomeIcon,
      items,
    }));
  }, []);

  const [activeCategory, setActiveCategory] = useState(
    groupedFaqs[0]?.category || 'General'
  );
  const [openQuestionId, setOpenQuestionId] = useState(
    groupedFaqs[0]?.items[0]?.id || null
  );

  const activeSection =
    groupedFaqs.find((section) => section.category === activeCategory) ||
    groupedFaqs[0] ||
    null;

  useEffect(() => {
    if (
      activeSection &&
      !activeSection.items.some((faq) => faq.id === openQuestionId)
    ) {
      setOpenQuestionId(activeSection.items[0]?.id || null);
    }
  }, [activeSection, openQuestionId]);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#101010] sm:text-5xl lg:text-[4.3rem]">
            You have Questions.
            <span className="block text-6xl tracking-[-0.06em]">We have Answers.</span>
          </h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-[34px] bg-[#f6d6cd] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-3xl font-semibold tracking-[-0.05em] text-[#ef5a22] sm:text-[2.4rem]">
                FAQs
              </p>
              <p className="mt-4 max-w-md text-base leading-8 text-[#201a17] sm:text-[1.08rem]">
                Get answers to some commonly asked questions about the
                GroupBuying platform and our business.
              </p>
            </div>

            <div className="self-start md:self-auto">
              <div className="rounded-[26px] bg-white/50 px-6 py-5 text-right shadow-[0_16px_35px_rgba(255,255,255,0.28)]">
                <p className="text-[1.75rem] font-black leading-none tracking-[-0.06em] text-[#ef5a22]">
                  Group
                </p>
                <p className="-mt-1 text-[1.75rem] font-black leading-none tracking-[-0.06em] text-[#121212]">
                  buying.in
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
          <aside className="rounded-[24px] border border-[#ece8e2] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <p className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[#131313]">
              Category
            </p>

            <div className="mt-5 space-y-2.5">
              {groupedFaqs.map((section) => {
                const Icon = section.icon;
                const isActive = activeCategory === section.category;

                return (
                  <button
                    key={section.category}
                    type="button"
                    onClick={() => setActiveCategory(section.category)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#ffe4dc] text-[#ef5a22] ring-1 ring-[#f3b9a8]'
                        : 'text-[#1d1d1d] hover:bg-[#faf7f4]'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-white text-[#ef5a22]'
                          : 'bg-[#f6f4f1] text-[#86807a]'
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[#121212] sm:text-[2.3rem]">
              {activeSection?.label || 'About GroupBuying'}
            </h3>

            <div className="mt-6">
              {activeSection?.items.map((faq) => {
                const isOpen = openQuestionId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="border-b border-[#e8e4df] first:border-t"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenQuestionId(isOpen ? null : faq.id)
                      }
                      className="flex w-full items-start justify-between gap-4 py-5 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-[3px] bg-[#d8d4d0]" />
                        <span className="text-lg font-medium leading-7 tracking-[-0.03em] text-[#141414]">
                          {faq.question}
                        </span>
                      </div>

                      <ChevronDown
                        size={20}
                        className={`mt-1 shrink-0 text-[#222] transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#ef5a22]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pb-5 pl-6 pr-4 text-sm leading-7 text-[#66615d] sm:pl-6 sm:text-[0.98rem]">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
