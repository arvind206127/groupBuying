import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ExternalLink, Loader2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const GetInTouch = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
  });
  const MotionDiv = motion.div;
  const MotionSection = motion.section;

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

  const officeAddress =
    settings.contactAddress ||
    '1405, Supertech Astralis, Sector 94, Noida, Uttar Pradesh 201313';

  const mapQuery = useMemo(() => encodeURIComponent(officeAddress), [officeAddress]);
  const mapsHref = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
    [mapQuery]
  );
  const embedSrc = useMemo(
    () => `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`,
    [mapQuery]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    try {
      const response = await api.post('/leads/contact', {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim(),
        phone: `+91 ${formData.phone.trim()}`.trim(),
        interest: 'Get In Touch',
        message:
          formData.message.trim() ||
          'Customer requested a callback from the Get In Touch page.',
      });

      if (response.data?.success) {
        toast.success('Details submitted. We will reach out within 24 hours.');
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          message: '',
        });
      }
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[linear-gradient(180deg,#f9f7f4_0%,#f4efe8_100%)] pb-10 pt-10 md:pb-14 md:pt-14">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <MotionSection
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="grid gap-6 lg:grid-cols-[1.03fr_0.97fr]"
        >
          <div className="rounded-[34px] border border-red-500 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,245,239,0.96))] p-5 shadow-[0_22px_70px_rgba(58,40,16,0.08)] sm:p-6 md:p-7">
            <div className="max-w-[520px]">
              <h1 className="text-[26px] font-medium leading-[1.16] tracking-[-0.04em] text-[#171717] sm:text-[32px] md:text-[36px]">
                Let&apos;s get your questions answered! Fill out the form, and we&apos;ll
                reach out within 24 hours.
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1e1e1e]">
                    First name
                  </span>
                  <input
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Arvind"
                    className="h-12 w-full rounded-[16px] border border-[#ece7df] bg-[#f7f8fc] px-4 text-[16px] text-[#111111] outline-none transition-all placeholder:text-[#212121] focus:border-[#e55b30] focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1e1e1e]">
                    Last name
                  </span>
                  <input
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Sharma"
                    className="h-12 w-full rounded-[16px] border border-[#ece7df] bg-[#f7f8fc] px-4 text-[16px] text-[#111111] outline-none transition-all placeholder:text-[#212121] focus:border-[#e55b30] focus:bg-white"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1e1e1e]">
                    Phone
                  </span>
                  <div className="flex h-12 overflow-hidden rounded-[16px] border border-[#ece7df] bg-[#f7f8fc] transition-all focus-within:border-[#e55b30] focus-within:bg-white">
                    <div className="flex w-[84px] items-center justify-center gap-2 border-r border-[#e7e1d9] bg-white text-[13px] font-medium text-[#272727]">
                      <span className="flex h-4 w-6 overflow-hidden rounded-[3px] border border-[#d8d8d8]">
                        <span className="h-full flex-1 bg-[#ff9933]" />
                        <span className="h-full flex-1 bg-white" />
                        <span className="h-full flex-1 bg-[#138808]" />
                      </span>
                      <ChevronDown size={14} />
                    </div>
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="7599847194"
                      className="w-full bg-transparent px-4 text-[16px] text-[#111111] outline-none placeholder:text-[#212121]"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1e1e1e]">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="arvindsharma2184@gmail.com"
                    className="h-12 w-full rounded-[16px] border border-[#ece7df] bg-[#f7f8fc] px-4 text-[16px] text-[#111111] outline-none transition-all placeholder:text-[#212121] focus:border-[#e55b30] focus:bg-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-[#1e1e1e]">
                  Message
                </span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="enter message"
                  rows="5"
                  className="min-h-[108px] w-full rounded-[16px] border border-[#ece7df] bg-[#f7f8fc] px-4 py-3 text-[16px] text-[#111111] outline-none transition-all placeholder:text-[#9b9b9b] focus:border-[#e55b30] focus:bg-white"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[52px] min-w-[150px] items-center justify-center rounded-full bg-[#e65129] px-7 text-[16px] font-semibold text-white transition-all hover:bg-[#d94822] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  'Submit Details'
                )}
              </button>
            </form>
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            className="relative min-h-[460px] overflow-hidden rounded-[28px] border border-[#d5cec4] bg-[#f6f2ea] shadow-[0_24px_70px_rgba(58,40,16,0.08)]"
          >
            <iframe
              title="TogetherBuying office map"
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[460px] w-full"
            />

            <div className="absolute left-4 top-4 max-w-[260px] rounded-[20px] bg-white/96 p-3.5 shadow-[0_16px_40px_rgba(16,24,40,0.16)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-semibold leading-none tracking-[-0.04em] text-[#181818]">
                    TogetherBuying
                  </h2>
                  <p className="mt-2 text-[13px] leading-5 text-[#5b5b5b]">
                    {officeAddress}
                  </p>
                </div>

                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open map directions"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8ecf4] bg-[#f6f9ff] text-[#2f6fed] transition-colors hover:bg-[#edf3ff]"
                >
                  <ExternalLink size={16} />
                </a>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[#f5a623]">
                <span className="text-[16px] leading-none">5.0</span>
                <span className="text-[14px] leading-none">&#9733;</span>
                <span className="text-[13px] text-[#2f6fed]">(14)</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#fff3ec] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9572d]">
                <MapPin size={12} />
                Visit Office
              </div>
            </div>
          </MotionDiv>
        </MotionSection>
      </div>
    </div>
  );
};

export default GetInTouch;
