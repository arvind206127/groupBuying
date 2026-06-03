import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, CheckCircle2,
  FileText, ClipboardList, Send, Award, ArrowRight, Zap
} from 'lucide-react';

/* ─── Design Tokens ─── */
const T = {
  bg: '#ffffff',
  pageBg: '#f9f9f9',
  ink: '#070707',
  inkMid: '#1e1e1e',
  inkSoft: '#64748b',
  accent: '#df472b',
  accentL: '#fff1ed',
  border: 'rgba(244, 57, 24, 0.30)',
  white: '#FFFFFF',
  cardBg: '#ffffff',
  sectionBg: '#fafafa',
};

const House = ({ size }) => <Building2 size={size} />;

/* ── Section label — very small pill ── */
const SectionLabel = ({ children }) => (
  <p style={{ color: T.accent, letterSpacing: '0.16em' }}
    className="text-[12px] font-bold capitalize mb-3">
    {children}
  </p>
);

/* ── Step badge ── */
const StepBadge = ({ n }) => (
  <div style={{ background: T.accentL, color: T.accent }}
    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
    {n}
  </div>
);

/* ── Input Field ── */
const Field = ({ label, name, type = 'text', placeholder, value, onChange, children }) => (
  <div>
    <label style={{ color: T.inkSoft }}
      className="text-[14px] font-semibold tracking-[-0.02em] mb-2 block">
      {label}
    </label>
    {children || (
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder}
        style={{
          background: '#f8f8f8',
          borderColor: T.border,
          borderWidth: '1.5px', borderStyle: 'solid', color: T.ink,
        }}
        className="w-full py-3.5 px-5 rounded-2xl font-medium text-[16px] tracking-[-0.025em] transition-all placeholder:text-slate-300 focus:outline-none"
      />
    )}
  </div>
);

/* ── Select Field ── */
const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label style={{ color: T.inkSoft }}
      className="text-[14px] font-semibold tracking-[-0.02em] mb-2 block">
      {label}
    </label>
    <div className="relative">
      <select
        name={name} value={value} onChange={onChange}
        style={{
          background: '#f8f8f8',
          borderColor: T.border,
          borderWidth: '1.5px', borderStyle: 'solid',
          color: value ? T.ink : T.inkSoft,
          appearance: 'none',
        }}
        className="w-full py-3.5 px-5 rounded-2xl font-medium text-[16px] tracking-[-0.025em] focus:outline-none cursor-pointer">
        <option value="">Select</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 5L7 9L11 5" stroke={T.inkSoft} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const Corporate = () => {
  const [form, setForm] = useState({
    name: '', org: '', phone: '', email: '',
    units: '', location: '', config: '', budget: '',
    purpose: '', timeline: '', projectType: [],
    notes: ''
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggleType = (val) => setForm(f => ({
    ...f,
    projectType: f.projectType.includes(val)
      ? f.projectType.filter(v => v !== val)
      : [...f.projectType, val]
  }));

  return (
    <div style={{ background: T.pageBg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: T.ink }}
      className="min-h-screen pt-24 pb-24">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        * { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: ${T.accent} !important; box-shadow: 0 0 0 3px rgba(223,71,43,0.08); }
        .hover-lift { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(223,71,43,0.10); }
      `}</style>

      {/* ══════════ HERO ══════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <SectionLabel>Corporate &amp; Community Buying</SectionLabel>

            <h1 style={{ color: T.ink, letterSpacing: '-0.03em', lineHeight: '0.95' }}
              className="text-[46px] md:text-[64px] font-semibold mb-6">
              Empowering Corporates &amp;{' '}
              <span style={{ color: T.accent }}>Communities</span>{' '}
              to Buy Smarter — Together.
            </h1>

            <p style={{ color: T.inkSoft, lineHeight: '1.45', letterSpacing: '-0.02em' }}
              className="text-[18px] md:text-[20px] font-normal mb-9 max-w-[490px]">
              Planning to acquire 20 or more apartments? We convert your requirement into a transparent competitive tender — so you unlock the best price, terms and timelines.
            </p>

            <div className="flex flex-wrap gap-3 mb-7">
              <button
                style={{ background: T.accent, boxShadow: '0 8px 24px rgba(223,71,43,0.30)', letterSpacing: '-0.02em' }}
                className="h-[54px] px-7 text-white rounded-full font-semibold text-[16px] hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
                Start Your Bulk Requirement
                <ArrowRight size={17} />
              </button>
              <button
                style={{ borderColor: T.border, color: T.inkMid, background: T.white, borderWidth: '1.5px', borderStyle: 'solid', letterSpacing: '-0.02em' }}
                className="h-[54px] px-7 rounded-full font-semibold text-[16px] hover:bg-orange-50 transition-all flex items-center gap-2">
                See NTPC Case Study
              </button>
            </div>

            <div style={{ background: T.accentL, borderColor: T.border, borderWidth: '1px', borderStyle: 'solid' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full">
              <Zap size={13} style={{ color: T.accent }} />
              <span style={{ color: T.accent, letterSpacing: '-0.01em' }} className="text-[13px] font-semibold">
                Zero brokerage — facilitation fee is developer-paid
              </span>
            </div>
          </motion.div>

          {/* Right cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: House, title: 'Corporate Buyer', desc: 'Employee housing & allocations' },
                { icon: Users, title: 'Buyer Communities', desc: 'Associations & groups' },
                { icon: Award, title: 'Institutional Investors', desc: 'Large-scale acquisitions', span: true },
              ].map((card, i) => (
                <div key={i}
                  style={{ background: T.white, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
                  className={`rounded-3xl p-6 flex flex-col items-center text-center hover-lift cursor-default ${card.span ? 'col-span-2' : ''}`}>
                  <div style={{ background: T.accentL, color: T.accent }}
                    className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 w-12 h-12">
                    <card.icon size={24} />
                  </div>
                  <h4 style={{ color: T.ink, letterSpacing: '-0.03em' }} className="text-[17px] font-semibold mb-1.5">{card.title}</h4>
                  <p style={{ color: T.inkSoft, letterSpacing: '-0.02em' }} className="text-[14px] font-normal">{card.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ background: T.accentL, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
              className="mt-4 rounded-2xl px-5 py-3 text-center">
              <p style={{ color: T.accent, letterSpacing: '-0.01em' }} className="text-[14px] font-semibold">
                Designed for deals of 20+ apartments
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{ borderColor: T.border, borderTopWidth: '1.5px', borderBottomWidth: '1.5px', borderStyle: 'solid', background: T.white }}
        className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <SectionLabel>Why Choose Us</SectionLabel>
            <h2 style={{ color: T.ink, letterSpacing: '-0.035em', lineHeight: '1.0' }}
              className="text-[36px] md:text-[50px] font-semibold">
              Secure High-Value Real Estate{' '}
              <span style={{ color: T.accent }}>Investments</span>{' '}
              <br className="hidden md:block" />
              with Collective Buying Power.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: 'Bulk Buying Advantage', desc: 'Typical savings of 5–10% vs individual bookings, varying by market and deal size.' },
              { icon: FileText, title: 'Transparent Tender Process', desc: 'Developers compete transparently with best pricing, specifications and timelines.' },
              { icon: CheckCircle2, title: 'Zero Brokerage, Full Support', desc: 'Facilitation fee is developer-paid — you only pay for your home, nothing more.' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
                style={{ background: T.pageBg, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
                className="rounded-3xl p-9 flex flex-col items-center text-center hover-lift">
                <div style={{ background: T.accentL, color: T.accent }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <f.icon size={28} />
                </div>
                <h4 style={{ color: T.ink, letterSpacing: '-0.03em' }} className="text-[19px] font-semibold mb-3">{f.title}</h4>
                <p style={{ color: T.inkSoft, letterSpacing: '-0.02em', lineHeight: '1.5' }} className="text-[15px] font-normal">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PROCESS ══════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <SectionLabel>How It Works</SectionLabel>
          <h2 style={{ color: T.ink, letterSpacing: '-0.035em', lineHeight: '1.0' }}
            className="text-[36px] md:text-[50px] font-semibold">
            Our process for{' '}
            <span style={{ color: T.accent }}>group &amp; corporate</span>{' '}
            booking
          </h2>
        </div>

        <div style={{ background: T.white, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
          className="rounded-[2.5rem] p-8 md:p-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
            {[
              { icon: ClipboardList, label: 'Registration' },
              { icon: FileText, label: 'Requirement\nCollection' },
              { icon: Send, label: 'Tender\nInvitation' },
              { icon: Users, label: 'Evaluation\nEvent' },
              { icon: CheckCircle2, label: 'Final\nBooking' },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                className="flex flex-col items-center text-center group relative">
                {i < 4 && (
                  <div style={{ background: T.border, top: '28px', left: '60%', right: '-40%' }}
                    className="hidden md:block absolute h-px" />
                )}
                <div style={{ background: T.accentL, color: T.accent, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform">
                  <step.icon size={23} />
                </div>
                <div style={{ background: T.accent, color: T.white }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mb-3 relative z-10">
                  {i + 1}
                </div>
                <p style={{ color: T.inkMid, letterSpacing: '-0.02em' }}
                  className="text-[13px] font-semibold whitespace-pre-line leading-snug">
                  {step.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CASE STUDY ══════════ */}
      <section style={{ borderColor: T.border, borderTopWidth: '1.5px', borderBottomWidth: '1.5px', borderStyle: 'solid', background: T.white }}
        className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-14 items-start">

          <div>
            <SectionLabel>Case Study</SectionLabel>
            <h2 style={{ color: T.ink, letterSpacing: '-0.035em', lineHeight: '1.05' }}
              className="text-[36px] md:text-[48px] font-semibold mb-6">
              NTPC Group, Noida —{' '}
              <span style={{ color: T.accent }}>100 Apartments</span>
            </h2>
            <p style={{ color: T.inkSoft, lineHeight: '1.5', letterSpacing: '-0.02em' }}
              className="text-[17px] font-normal mb-8">
              A buyer group from NTPC sought 100 apartments in Noida via normal channels. We advised a tender-based collective buying approach.
            </p>

            <ul className="space-y-4 mb-9">
              {[
                'Formed 5-member signatory committee and joint account.',
                'Drafted & released tender to all major Noida developers.',
                'Managed participation, Q&A, proposal analysis & shortlisting.',
                'Ran online bidding; closed with best value offer.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <StepBadge n={i + 1} />
                  <span style={{ color: T.inkMid, letterSpacing: '-0.02em', lineHeight: '1.5' }} className="text-[16px] font-normal pt-1">{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ background: T.pageBg, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
              className="rounded-3xl p-7">
              <p style={{ color: T.accent, letterSpacing: '0.08em' }} className="text-[10px] font-bold uppercase mb-3 flex items-center gap-2">
                <Award size={12} /> Outcome
              </p>
              <p style={{ color: T.inkMid, letterSpacing: '-0.02em', lineHeight: '1.55' }} className="text-[15px] font-normal mb-2">
                Multiple competitive bids, transparent pricing and stronger negotiation power — completed within 45 days.*
              </p>
              <p style={{ color: T.inkSoft }} className="text-[13px] font-normal italic">
                *Timelines and savings vary by market conditions.
              </p>
            </div>
          </div>

          <div style={{ background: T.pageBg, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
            className="rounded-[2.5rem] p-10">
            <p style={{ color: T.ink, letterSpacing: '-0.03em' }} className="text-[18px] font-semibold mb-7">
              What We Verify
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: '🏗️', text: 'Developer background & delivery track record' },
                { icon: '📈', text: 'Future projections & maintenance standards' },
                { icon: '💰', text: 'Financial strength & stability' },
                { icon: '⚖️', text: 'Legal & RERA compliance' },
                { icon: '🔬', text: 'Construction quality & specifications' },
                { icon: '📄', text: 'Title clarity & documentation' },
              ].map((item, i) => (
                <div key={i}
                  style={{ background: T.white, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid' }}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl hover-lift">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span style={{ color: T.inkMid, letterSpacing: '-0.025em' }} className="text-[15px] font-normal">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FORM ══════════ */}
      <section className="py-20 max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <SectionLabel>Get Started</SectionLabel>
          <h2 style={{ color: T.ink, letterSpacing: '-0.035em', lineHeight: '1.0' }}
            className="text-[36px] md:text-[52px] font-semibold mb-5">
            Submit Your{' '}
            <span style={{ color: T.accent }}>Bulk / Community</span>{' '}
            Requirement
          </h2>
          <p style={{ color: T.inkSoft, letterSpacing: '-0.02em' }} className="text-[16px] font-normal">
            For corporate groups, employee communities or investor consortiums planning to purchase 20+ apartments
          </p>
        </div>

        <div style={{
          background: T.white, borderColor: T.border, borderWidth: '1.5px', borderStyle: 'solid',
          boxShadow: '0 8px 48px rgba(223,71,43,0.07)'
        }}
          className="rounded-[2.5rem] p-8 md:p-12">
          <div className="space-y-6">

            <Field label="Full Name" name="name" value={form.name} onChange={handleChange}
              placeholder="Enter your full name" />

            <Field label="Organization / Community Name" name="org" value={form.org} onChange={handleChange}
              placeholder="Enter organisation or community name" />

            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Contact Number" name="phone" type="tel" value={form.phone} onChange={handleChange}
                placeholder="Enter contact number" />
              <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Enter email address" />
            </div>

            <Field label="Number of Apartments Planned" name="units" type="number" value={form.units} onChange={handleChange}
              placeholder="e.g. 20" />

            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Preferred Location / City" name="location" value={form.location} onChange={handleChange}
                placeholder="e.g. Bangalore, Pune" />
              <SelectField label="Preferred Configuration" name="config" value={form.config} onChange={handleChange}
                options={['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Mix of configurations']} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Budget Range (per unit)" name="budget" value={form.budget} onChange={handleChange}
                placeholder="e.g. 50L - 1Cr" />
              <SelectField label="Investment Purpose" name="purpose" value={form.purpose} onChange={handleChange}
                options={['Employee Housing', 'Resale / Investment', 'Self Use', 'Mix']} />
            </div>

            <SelectField label="Expected Timeline" name="timeline" value={form.timeline} onChange={handleChange}
              options={['Within 3 months', '3–6 months', '6–12 months', 'More than 1 year']} />

            {/* Checkboxes */}
            <div>
              <label style={{ color: T.inkSoft }}
                className="text-[14px] font-semibold tracking-[-0.02em] mb-3 block">
                Project Type Interest
              </label>
              <div className="flex flex-col gap-3">
                {['Pre-launch Projects', 'Under Construction', 'Ready-to-Move'].map(opt => (
                  <label key={opt} onClick={() => toggleType(opt)}
                    className="flex items-center gap-3 cursor-pointer select-none">
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      borderWidth: '1.5px', borderStyle: 'solid',
                      borderColor: form.projectType.includes(opt) ? T.accent : 'rgba(223,71,43,0.25)',
                      background: form.projectType.includes(opt) ? T.accentL : '#f8f8f8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}>
                      {form.projectType.includes(opt) && (
                        <svg width="11" height="9" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ color: T.inkMid, letterSpacing: '-0.02em' }} className="text-[15px] font-normal">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label style={{ color: T.inkSoft }}
                className="text-[14px] font-semibold tracking-[-0.02em] mb-2 block">
                Additional Notes
              </label>
              <textarea
                name="notes" value={form.notes} onChange={handleChange}
                placeholder="Any specific requirements or queries..."
                rows={4}
                style={{
                  background: '#f8f8f8', borderColor: T.border,
                  borderWidth: '1.5px', borderStyle: 'solid', color: T.ink,
                  resize: 'vertical', letterSpacing: '-0.02em'
                }}
                className="w-full py-3.5 px-5 rounded-2xl font-normal text-[16px] transition-all placeholder:text-slate-300 focus:outline-none"
              />
            </div>

            <button
              style={{ background: T.accent, boxShadow: '0 8px 28px rgba(223,71,43,0.30)', letterSpacing: '-0.02em' }}
              className="w-full py-4 text-white rounded-full font-semibold text-[17px] hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              Submit Requirement
              <ArrowRight size={18} />
            </button>

            <p style={{ color: T.inkSoft, letterSpacing: '-0.02em' }} className="text-center text-[14px] font-normal">
              Our team will contact you within 24 hours
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Corporate;