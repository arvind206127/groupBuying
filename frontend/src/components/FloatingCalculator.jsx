import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Calculator, Sparkles, X } from 'lucide-react';

const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatCompactInr = (value) => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Crore`;
  }

  return `${(value / 100000).toFixed(2)} Lacs`;
};

const formatCurrencyLabel = (value, compact = false) =>
  compact ? `Rs ${formatCompactInr(value)}` : `Rs ${formatNumber(value)}`;

const getRequestedCalculatorMode = () => {
  if (typeof window === 'undefined') return null;

  const requestedMode =
    new URLSearchParams(window.location.search).get('calculator') ||
    new URLSearchParams(window.location.search).get('calc');

  return requestedMode === 'normal' || requestedMode === 'emi' ? requestedMode : null;
};

const getSliderStyle = (value, min, max) => ({
  '--range-percent': `${((value - min) / (max - min)) * 100}%`,
  '--range-fill-start': '#e6522c',
  '--range-fill-end': '#ff7a5c',
  '--range-thumb-ring': 'rgba(230, 82, 44, 0.18)',
});

const EMIMode = () => {
  const [amount, setAmount] = useState(8000000);
  const [interest, setInterest] = useState(6.75);
  const [tenure, setTenure] = useState(20);

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const monthlyRate = interest / (12 * 100);
    const months = tenure * 12;
    const emiValue =
      monthlyRate === 0
        ? amount / months
        : (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
    const safeEmi = Number.isFinite(emiValue) ? emiValue : 0;
    const payableValue = safeEmi * months;
    const interestValue = payableValue - amount;
    const roundedPayable = Math.round(payableValue);
    const roundedInterest = Math.round(interestValue);

    return {
      emi: Math.round(safeEmi),
      totalInterest: roundedInterest,
      totalPayable: roundedPayable,
    };
  }, [amount, interest, tenure]);

  const controls = [
    {
      key: 'amount',
      label: 'Loan Amount',
      value: `Rs${formatCompactInr(amount)}`,
      min: 100000,
      max: 130000000,
      step: 100000,
      currentValue: amount,
      onChange: (event) => setAmount(Number(event.target.value)),
      minLabel: 'Rs1 Lac',
      maxLabel: 'Rs13 Cr',
      rangeStyle: getSliderStyle(amount, 100000, 130000000),
    },
    {
      key: 'interest',
      label: 'Interest Rate (% P.A.)',
      value: `${interest.toFixed(2)}%`,
      min: 1,
      max: 30,
      step: 0.05,
      currentValue: interest,
      onChange: (event) => setInterest(Number(event.target.value)),
      minLabel: '1%',
      maxLabel: '30%',
      rangeStyle: getSliderStyle(interest, 1, 30),
    },
    {
      key: 'tenure',
      label: 'Loan Tenure',
      value: `${tenure} Years`,
      min: 1,
      max: 30,
      step: 1,
      currentValue: tenure,
      onChange: (event) => setTenure(Number(event.target.value)),
      minLabel: '1 Year',
      maxLabel: '30 Years',
      rangeStyle: getSliderStyle(tenure, 1, 30),
    },
  ];

  const summaryCards = [
    {
      label: 'Monthly EMI',
      value: formatCurrencyLabel(emi),
      accent: 'text-[#df472b]',
    },
    {
      label: 'Total Payable',
      value: formatCurrencyLabel(totalPayable, true),
      accent: 'text-[#111111]',
    },
    {
      label: 'Interest Amount',
      value: formatCurrencyLabel(totalInterest, true),
      accent: 'text-[#ff764d]',
    },
    {
      label: 'Principal Amount',
      value: formatCurrencyLabel(amount, true),
      accent: 'text-[#ff8a68]',
    },
  ];

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden rounded-[30px] border border-[#e6e6e8] bg-white px-3 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-3.5 sm:py-3.5">
      <div className="rounded-[22px] border border-[#eef1f4] bg-[#fffdfb] p-3 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-3.5">
        <div className="space-y-2.5">
          {controls.map((control) => (
            <div
              key={control.key}
              className="rounded-[18px] border border-[#eef1f4] bg-white p-2.5 sm:p-3"
            >
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-[0.92rem] font-medium text-[#141414] sm:text-[0.95rem]">{control.label}</p>
                <p className="text-[0.94rem] font-bold text-[#111111] sm:text-[0.98rem]">{control.value}</p>
              </div>

              <div className="mt-1">
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.currentValue}
                  onChange={control.onChange}
                  className="floating-range h-6 w-full cursor-pointer bg-transparent"
                  style={control.rangeStyle}
                />
                <div className="mt-0.5 flex items-center justify-between text-[0.74rem] text-[#8d96a1] sm:text-[0.78rem]">
                  <span>{control.minLabel}</span>
                  <span>{control.maxLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[22px] border border-[#f1e6e0] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f1_100%)] p-3 sm:p-3.5">
        <div className="grid grid-cols-2 gap-2">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[18px] border border-white/90 bg-white px-3 py-2.5 text-left shadow-[0_14px_32px_rgba(15,23,42,0.05)] ${
                card.spanClass || ''
              }`}
            >
              <p className="text-[0.72rem] leading-tight text-[#5d6470] sm:text-[0.76rem]">{card.label}</p>
              <p className={`mt-1 text-[0.95rem] font-bold leading-tight sm:text-[1.02rem] ${card.accent}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const NormalMode = ({ apartmentCost, buyers, setApartmentCost, setBuyers }) => {
  const discountCap = 14.5;
  const discountPercent = Math.min(discountCap, 2.8 + buyers * 1.0);
  const estimatedSaving = Math.round((apartmentCost * discountPercent) / 100);
  const effectiveApartmentCost = apartmentCost - estimatedSaving;
  const savingPerBuyer = buyers > 0 ? estimatedSaving / buyers : 0;
  const summaryCards = [
    {
      label: 'Save Upto',
      value: formatCurrencyLabel(estimatedSaving, true),
      accent: 'text-[#df472b]',
    },
    {
      label: 'Unlocked Discount',
      value: `${discountPercent.toFixed(1)}%`,
      accent: 'text-[#ff8a68]',
    },
  ];

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden rounded-[30px] border border-[#e6e6e8] bg-white px-3 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-3.5 sm:py-3.5">
      <div className="rounded-[22px] border border-[#eef1f4] bg-[#fffdfb] p-3 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-3.5">
        <div className="space-y-2.5">
          <div className="rounded-[18px] border border-[#eef1f4] bg-white p-2.5 sm:p-3">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[0.92rem] font-medium text-[#141414] sm:text-[0.95rem]">Cost of Single Apartment</p>
              <p className="text-[0.94rem] font-bold text-[#111111] sm:text-[0.98rem]">
                {formatCurrencyLabel(apartmentCost, true)}
              </p>
            </div>

            <div className="mt-1">
              <input
                type="range"
                min="5000000"
                max="150000000"
                step="100000"
                value={apartmentCost}
                onChange={(event) => setApartmentCost(Number(event.target.value))}
                className="floating-range h-6 w-full cursor-pointer bg-transparent"
                style={getSliderStyle(apartmentCost, 5000000, 150000000)}
              />
              <div className="mt-0.5 flex items-center justify-between text-[0.74rem] text-[#8d96a1] sm:text-[0.78rem]">
                <span>Rs50 Lacs</span>
                <span>Rs15 Cr</span>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#eef1f4] bg-white p-2.5 sm:p-3">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[0.92rem] font-medium text-[#141414] sm:text-[0.95rem]">No of Buyers / Apartments</p>
              <p className="text-[0.94rem] font-bold text-[#111111] sm:text-[0.98rem]">{buyers}</p>
            </div>

            <div className="mt-1">
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={buyers}
                onChange={(event) => setBuyers(Number(event.target.value))}
                className="floating-range h-6 w-full cursor-pointer bg-transparent"
                style={getSliderStyle(buyers, 2, 20)}
              />
              <div className="mt-0.5 flex items-center justify-between text-[0.74rem] text-[#8d96a1] sm:text-[0.78rem]">
                <span>2 Buyers</span>
                <span>20 Buyers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-[#f1e6e0] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f1_100%)] p-3 sm:p-3.5">
        <div className="grid grid-cols-2 gap-2">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[18px] border border-white/90 bg-white px-3 py-2.5 text-left shadow-[0_14px_32px_rgba(15,23,42,0.05)] ${
                card.spanClass || ''
              }`}
            >
              <p className="text-[0.72rem] leading-tight text-[#5d6470] sm:text-[0.76rem]">{card.label}</p>
              <p className={`mt-1 text-[0.95rem] font-bold leading-tight sm:text-[1.02rem] ${card.accent}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex h-[106px] shrink-0 overflow-hidden rounded-[24px] bg-[#f66f52] px-5 py-4 text-white/95 shadow-[0_18px_42px_rgba(246,111,82,0.22)] sm:h-[194px] sm:px-7 sm:py-5">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.95) 3px, transparent 3px),
              linear-gradient(90deg, rgba(255,255,255,0.95) 3px, transparent 3px),
              linear-gradient(rgba(255,255,255,0.7) 3px, transparent 3px),
              linear-gradient(90deg, rgba(255,255,255,0.7) 3px, transparent 3px)
            `,
            backgroundSize: '118px 118px, 118px 118px, 60px 60px, 60px 60px',
            backgroundPosition: '0 0, 0 0, 16px 16px, 16px 16px',
          }}
        />
        <div className="relative z-10 flex max-w-[580px] flex-col justify-center">
          <h3 className="text-[clamp(1.45rem,4vw,2.15rem)] font-semibold leading-[1.02] tracking-[-0.015em]">
            Buyers saved Rs 25Cr+ through
            <br className="hidden sm:block" />
            {' '}Together Buying groups.
          </h3>
          <p className="mt-2 max-w-[470px] text-[clamp(0.78rem,2.1vw,1.2rem)] font-normal leading-snug tracking-[-0.015em] text-white/92">
            Join verified buyers, unlock better builder pricing, and estimate your possible group savings instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

const FloatingCalculator = () => {
  const [isOpen, setIsOpen] = useState(() => Boolean(getRequestedCalculatorMode()));
  const [activeMode, setActiveMode] = useState(() => getRequestedCalculatorMode() || 'normal');
  const [apartmentCost, setApartmentCost] = useState(112700000);
  const [buyers, setBuyers] = useState(6);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const modes = [
    { id: 'normal', label: 'Saving', icon: Building2 },
    { id: 'emi', label: 'EMI', icon: Calculator },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -18, y: 18 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.7, duration: 0.35 }}
        className="fixed bottom-4 left-4 z-[9985] sm:bottom-8 sm:left-8"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open savings calculator"
          className="group relative flex items-center"
        >
          <span className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e6c06f] via-[#f66f52] to-[#f66f52] text-white shadow-[0_18px_40px_-16px_rgba(170,125,28,0.6)] transition-transform duration-300 group-hover:scale-105">
            <span className="absolute inset-0 rounded-full border border-[#f66f52]" />
            <Calculator size={30} strokeWidth={2.2} className="relative" />
          </span>

          <span className="pointer-events-none absolute left-[88px] hidden min-w-[240px] rounded-[2rem] bg-[#241f1b] px-6 py-3.5 text-left opacity-0 shadow-[0_18px_42px_-22px_rgba(24,16,10,0.55)] transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 md:block md:translate-x-[-8px]">
            <span className="block whitespace-nowrap text-[11px] font-black uppercase leading-none tracking-[0.2em] text-[#ff7a55]">
              Collective Savings
            </span>
            <span className="mt-2 block whitespace-nowrap text-[15px] font-black leading-none text-white">Open calculator</span>
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9992] bg-[#1f120d]/14 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, x: 28, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute bottom-3 left-3 right-3 flex h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[2rem] border border-[#efd4ca] bg-[#fffaf6] text-[#221814] shadow-[0_36px_100px_-40px_rgba(82,35,18,0.6)] sm:bottom-4 sm:left-auto sm:right-4 sm:top-4 sm:h-[calc(100dvh-2rem)] sm:w-[clamp(460px,40vw,620px)]"
            >
              <div className={`${activeMode === 'normal' ? 'bg-[#f66f52] text-white' : 'bg-white text-[#111111]'} relative shrink-0 border-b border-[#f0d6cb] px-5 py-4 sm:px-6`}>
                <div
                  aria-hidden="true"
                  className={`${activeMode === 'normal' ? 'opacity-[0.2]' : 'hidden'} absolute inset-0`}
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.95) 3px, transparent 3px),
                      linear-gradient(90deg, rgba(255,255,255,0.95) 3px, transparent 3px),
                      linear-gradient(rgba(255,255,255,0.75) 3px, transparent 3px),
                      linear-gradient(90deg, rgba(255,255,255,0.75) 3px, transparent 3px)
                    `,
                    backgroundSize: '118px 118px, 118px 118px, 60px 60px, 60px 60px',
                    backgroundPosition: '0 0, 0 0, 16px 16px, 16px 16px',
                  }}
                />

                <div className="relative flex items-center justify-between gap-3">
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] ${
                    activeMode === 'normal'
                      ? 'border border-white/30 bg-white/10 text-white'
                      : 'border border-[#f0ddd6] bg-[#fff4ef] text-[#df472b]'
                  }`}>
                    <Sparkles size={12} />
                    Colulator
                  </div>

                  <div className="inline-flex w-[clamp(300px,56%,360px)] rounded-full bg-[#fff2ed] p-1.5">
                    {modes.map((mode) => {
                      const Icon = mode.icon;
                      const isActive = activeMode === mode.id;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setActiveMode(mode.id)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-black transition-all ${
                            isActive ? 'bg-[#df472b] text-white shadow-[0_12px_24px_rgba(223,71,43,0.25)]' : 'text-[#7d655d]'
                          }`}
                        >
                          <Icon size={16} />
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                      activeMode === 'normal'
                        ? 'border-white/25 bg-white/10 text-white'
                        : 'border-[#edd8cf] bg-white text-[#111111]'
                    }`}
                    aria-label="Close calculator"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div
                className="min-h-0 flex-1 overflow-hidden p-3.5 sm:p-4"
              >
                <AnimatePresence mode="wait">
                  {activeMode === 'normal' ? (
                    <motion.div
                      key="normal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-full"
                    >
                      <NormalMode
                        apartmentCost={apartmentCost}
                        buyers={buyers}
                        setApartmentCost={setApartmentCost}
                        setBuyers={setBuyers}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="emi"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-full"
                    >
                      <EMIMode />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCalculator;
