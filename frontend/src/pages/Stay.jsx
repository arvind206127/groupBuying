import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const Stay = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/leads/contact', {
        name: 'Stay Page Subscriber',
        email: email.trim(),
        phone: '0000000000',
        interest: 'Stay Updates',
        message: 'Please subscribe me for GroupBuying updates and savings alerts.',
      });

      if (response.data?.success) {
        setSubscribed(true);
        setEmail('');
        toast.success('You are subscribed for GroupBuying updates.');
      }
    } catch (error) {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[520px] bg-white pb-12 sm:pb-16">
      <div className="w-full">
        <section className="relative overflow-hidden">
          <div
            className="relative min-h-[520px] w-full bg-cover bg-center bg-fixed md:min-h-[480px]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(29,25,16,0.16) 0%, rgba(20,16,10,0.08) 28%, rgba(0,0,0,0.04) 100%), url('https://cdn.prod.website-files.com/6758c5fdcb72a01dfea7a348/677205e6881e6dd7c342d1aa_office.webp')",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,225,164,0.24),_transparent_44%)]" />

            <div className="relative z-10 flex min-h-[520px] items-center justify-center px-4 py-10 sm:px-8 md:min-h-[560px]">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="w-full max-w-[470px] rounded-[26px] border border-white/45 bg-white/12 p-5 text-white shadow-[0_24px_64px_rgba(35,25,14,0.18)] backdrop-blur-[6px] sm:p-6 md:p-7"
              >
                {!subscribed ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/90">
                      <Mail size={13} />
                      Stay Updates
                    </div>

                    <h1 className="mt-4 max-w-md text-[2rem] font-semibold leading-[0.96] tracking-[-0.06em] sm:text-[2.45rem] md:text-[2.75rem]">
                      Stay Informed, Save More!
                    </h1>

                    <p className="mt-3 max-w-[390px] text-sm leading-6 text-white/92 sm:text-base">
                      Get updates on group-buying deals and exclusive savings
                      opportunities.
                    </p>

                    <form
                      onSubmit={handleSubmit}
                      className="mt-6 flex flex-col gap-2.5 rounded-[24px] bg-white p-2 shadow-[0_16px_42px_rgba(255,255,255,0.15)] sm:flex-row sm:items-center sm:rounded-full"
                    >
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="enter your email"
                        className="h-12 w-full rounded-[18px] px-4 text-sm text-[#1b1b1b] outline-none placeholder:text-[#939393] sm:rounded-full"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#ef5a22] px-6 text-base font-semibold text-white transition-all hover:bg-[#db4d19] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[150px] sm:rounded-full"
                      >
                        {loading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            Subscribe
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="mt-4 text-xs leading-6 text-white/80">
                      Early access to premium opportunities, new project alerts,
                      and exclusive GroupBuying savings signals.
                    </p>
                  </>
                ) : (
                  <div className="py-6 text-center sm:py-8">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/18 text-white">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">
                      Subscription Confirmed
                    </h2>
                    <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/88">
                      You will now receive GroupBuying savings updates, fresh
                      launches, and exclusive deal notifications.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubscribed(false)}
                      className="mt-7 inline-flex rounded-full border border-white/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10 sm:text-sm"
                    >
                      Subscribe Another Email
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Stay;
