import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getFallbackFaqs, normalizeFaq } from '../data/faqs';

const FAQ = () => {
  const [faqs, setFaqs] = useState(getFallbackFaqs());
  const [activeQuestionId, setActiveQuestionId] = useState(
    getFallbackFaqs()[1]?.id || getFallbackFaqs()[0]?.id || null
  );

  useEffect(() => {
    let isMounted = true;

    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs');
        if (!isMounted) return;

        if (response.data?.success && Array.isArray(response.data.faqs)) {
          const liveFaqs = response.data.faqs.map(normalizeFaq);
          setFaqs(liveFaqs.length > 0 ? liveFaqs : getFallbackFaqs());
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      }
    };

    fetchFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleFaqs = useMemo(() => faqs.slice(0, 8), [faqs]);

  useEffect(() => {
    if (visibleFaqs.length > 0 && !visibleFaqs.some((faq) => faq.id === activeQuestionId)) {
      setActiveQuestionId(visibleFaqs[0].id);
    }

    if (visibleFaqs.length === 0) {
      setActiveQuestionId(null);
    }
  }, [activeQuestionId, visibleFaqs]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,219,201,0.38),_transparent_30%),linear-gradient(180deg,_#fffdfa_0%,_#f8f6f2_100%)] pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-12">
          <section className="lg:sticky lg:top-28">
            <p className="text-[11px] font-black uppercase tracking-[-0.06em] text-[#ef5a22]">
              Support
            </p>

            <h1 className="mt-4 text-[2.35rem] font-black uppercase leading-[0.9] tracking-[-0.06em] text-[#0f2042] sm:text-[3.15rem]">
              Frequently Asked
              <span className="mt-2 block italic text-[#f05a22]">Questions?</span>
            </h1>

            <p className="mt-8 max-w-md text-base font-semibold leading-7 text-[#8e9cb5]">
              Everything you need to know about the group buying process and how we
              protect your interests.
            </p>

            <div className="relative mt-10 overflow-hidden rounded-[32px] border border-[#e9edf5] bg-[#f5f8fd] p-7 shadow-[0_24px_70px_rgba(15,32,66,0.06)] sm:p-8">
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#ffe0d4] blur-3xl" />
              <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-white/80 blur-2xl" />

              <div className="relative z-10">
                <h2 className="text-[1.55rem] font-black uppercase leading-none tracking-[-0.05em] text-[#0f2042]">
                  Still Have Questions?
                </h2>
                <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-[#61708d]">
                  Our advisors are here to help you understand every step of the
                  journey and guide you toward the right group buying decision.
                </p>

                <Link
                  to="/contact"
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#151f38] px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[#ef5a22]"
                >
                  Talk to an Advisor
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {visibleFaqs.length > 0 ? (
              visibleFaqs.map((faq, index) => {
                const isOpen = activeQuestionId === faq.id;

                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`overflow-hidden rounded-[26px] border bg-white shadow-[0_14px_32px_rgba(15,32,66,0.04)] transition-all duration-300 ${
                      isOpen
                        ? 'border-[#f4be9f] shadow-[0_18px_40px_rgba(240,90,34,0.10)]'
                        : 'border-[#edf0f4] hover:border-[#f2c5ad]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveQuestionId(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-black uppercase tracking-[0.14em] sm:flex ${
                            isOpen
                              ? 'bg-[#fff0e8] text-[#ef5a22]'
                              : 'bg-[#f5f7fb] text-[#90a0ba]'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        <div className="min-w-0">
                          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#f05a22]">
                            {faq.category}
                          </p>
                          <h3 className="text-[1rem] font-black uppercase leading-[1.15] tracking-[-0.03em] text-[#0f2042] sm:text-[1.18rem]">
                            {faq.question}
                          </h3>
                        </div>
                      </div>

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                          isOpen
                            ? 'bg-[#fff2eb] text-[#ef5a22]'
                            : 'bg-[#f7f9fc] text-[#ef5a22]'
                        }`}
                      >
                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                      </div>
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
                          <div className="border-t border-[#f4ede8] px-5 pb-6 pt-1 sm:px-6">
                            <div className="rounded-[22px] bg-[#fffaf6] px-4 py-4 sm:px-5">
                              <p className="text-sm leading-7 text-[#63718d] sm:text-[0.98rem]">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="rounded-[28px] border border-[#edf0f4] bg-white px-6 py-8 text-center text-[#63718d] shadow-[0_14px_32px_rgba(15,32,66,0.04)]">
                No FAQs available right now.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
