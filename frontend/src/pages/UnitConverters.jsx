import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, Calculator, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const NORMAL_BACKGROUND =
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=85';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatCompactCr = (value) => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Crore`;
  }

  return `${(value / 100000).toFixed(2)} Lacs`;
};

const getSliderStyle = (value, min, max) => ({
  '--range-percent': `${((value - min) / (max - min)) * 100}%`,
  '--range-fill-start': '#e6522c',
  '--range-fill-end': '#ff7a5c',
  '--range-thumb-ring': 'rgba(230, 82, 44, 0.18)',
});

const Gauge = ({ percent }) => {
  const radius = 108;
  const circumference = Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <svg viewBox="0 0 280 170" className="h-[230px] w-[280px]">
      <path
        d="M 35 135 A 105 105 0 0 1 245 135"
        fill="none"
        stroke="#dddddf"
        strokeWidth="20"
        strokeLinecap="round"
        pathLength="100"
      />
      <path
        d="M 35 135 A 105 105 0 0 1 245 135"
        fill="none"
        stroke="#e6522c"
        strokeWidth="20"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 - clamped}
      />
    </svg>
  );
};

const EMICalculatorView = () => {
  const [amount, setAmount] = useState(8000000);
  const [interest, setInterest] = useState(6.75);
  const [tenure, setTenure] = useState(20);

  const results = useMemo(() => {
    const r = interest / (12 * 100);
    const n = tenure * 12;
    const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const roundedEmi = Number.isFinite(emi) ? Math.round(emi) : 0;
    const totalInterest = roundedEmi * n - amount;
    const totalPayable = amount + totalInterest;
    const principalShare = totalPayable > 0 ? (amount / totalPayable) * 100 : 0;

    return {
      emi: roundedEmi,
      totalInterest,
      totalPayable,
      principalShare,
    };
  }, [amount, interest, tenure]);

  return (
    <div className="rounded-[34px] border border-[#dfdfdf] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-7 lg:p-10">
      <h2 className="text-center text-[2.8rem] font-semibold tracking-[-0.05em] text-[#101010] sm:text-[3.6rem] lg:text-[4.25rem]">
        EMI Calculator
      </h2>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="space-y-8">
          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[1.05rem] font-medium text-[#111111]">Loan Amount</p>
              </div>
              <p className="text-[1.1rem] font-bold text-[#111111]">Rs.{formatCompactCr(amount)}</p>
            </div>
            <div className="mt-4">
              <input
                type="range"
                min="100000"
                max="130000000"
                step="100000"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="floating-range h-6 w-full cursor-pointer bg-transparent"
                style={getSliderStyle(amount, 100000, 130000000)}
              />
              <div className="mt-2 flex items-center justify-between text-[0.95rem] text-[#7f8791]">
                <span>Rs1 Lac</span>
                <span>Rs13 Cr</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <p className="text-[1.05rem] font-medium text-[#111111]">Interest Rate (% P.A.)</p>
              <p className="text-[1.1rem] font-bold text-[#111111]">{interest.toFixed(2)}%</p>
            </div>
            <div className="mt-4">
              <input
                type="range"
                min="1"
                max="30"
                step="0.05"
                value={interest}
                onChange={(event) => setInterest(Number(event.target.value))}
                className="floating-range h-6 w-full cursor-pointer bg-transparent"
                style={getSliderStyle(interest, 1, 30)}
              />
              <div className="mt-2 flex items-center justify-between text-[0.95rem] text-[#7f8791]">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <p className="text-[1.05rem] font-medium text-[#111111]">Loan Tenure</p>
              <p className="text-[1.1rem] font-bold text-[#111111]">{tenure} Years</p>
            </div>
            <div className="mt-4">
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenure}
                onChange={(event) => setTenure(Number(event.target.value))}
                className="floating-range h-6 w-full cursor-pointer bg-transparent"
                style={getSliderStyle(tenure, 1, 30)}
              />
              <div className="mt-2 flex items-center justify-between text-[0.95rem] text-[#7f8791]">
                <span>1 Year</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Gauge percent={results.principalShare} />
            <div className="absolute top-[78px] text-center">
              <p className="text-[1rem] text-[#6b7280]">Your Monthly Home EMI</p>
              <p className="mt-2 text-[2.8rem] font-bold leading-none tracking-[-0.04em] text-[#111111]">
                Rs{formatCurrency(results.emi)}
              </p>
            </div>
          </div>

          <div className="mt-2 grid w-full gap-5 text-center sm:grid-cols-3 sm:text-left">
            <div>
              <p className="text-[1rem] text-[#5d6470]">Interest Amount</p>
              <p className="mt-2 text-[2rem] font-bold leading-none text-[#ff764d]">
                Rs{formatCurrency(results.totalInterest)}
              </p>
            </div>
            <div>
              <p className="text-[1rem] text-[#5d6470]">Principal Amount</p>
              <p className="mt-2 text-[2rem] font-bold leading-none text-[#ff8a68]">
                Rs{formatCurrency(amount)}
              </p>
            </div>
            <div>
              <p className="text-[1rem] text-[#5d6470]">Total Payable Amount</p>
              <p className="mt-2 text-[2rem] font-bold leading-none text-[#111111]">
                Rs{formatCurrency(results.totalPayable)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NormalSavingsView = () => {
  const [apartmentCost, setApartmentCost] = useState(112700000);
  const [buyers, setBuyers] = useState(6);

  const discountPercent = Math.min(14, 3 + buyers * 1.05);
  const saveAmount = Math.round((apartmentCost * discountPercent) / 100);

  return (
    <div className="relative overflow-hidden rounded-[34px] shadow-[0_28px_90px_rgba(16,24,40,0.15)]">
      <img
        src={NORMAL_BACKGROUND}
        alt="Residential skyline"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#11253c]/40" />

      <div className="relative grid min-h-[640px] gap-6 p-6 lg:grid-cols-[0.58fr_0.42fr] lg:p-7">
        <div className="overflow-hidden rounded-[34px] bg-[#ff7658] p-6 text-white shadow-[0_24px_70px_rgba(120,42,23,0.22)] sm:p-8">
          <div
            aria-hidden="true"
            className="absolute inset-y-6 left-6 right-[42%] rounded-[34px] opacity-[0.14]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.8) 3px, transparent 3px),
                linear-gradient(90deg, rgba(255,255,255,0.8) 3px, transparent 3px)
              `,
              backgroundSize: '120px 120px, 120px 120px',
            }}
          />

          <div className="relative z-10 max-w-[520px]">
            <h2 className="text-[3.6rem] font-medium leading-[0.96] tracking-[-0.06em] sm:text-[5rem]">
              We Saved
              <br />
              25cr+ for
              <br />
              125+ families.
            </h2>
            <p className="mt-7 text-[1.25rem] leading-tight text-white/95 sm:text-[1.4rem]">
              Save more and more with Together Buying.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center pt-2 lg:pl-2">
          <div className="mb-5 text-center text-white lg:text-left">
            <h3 className="text-[2.6rem] font-semibold leading-[0.94] tracking-[-0.05em] sm:text-[3.4rem]">
              Calculate how Much
              <br />
              Can You Save?
            </h3>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_60px_rgba(16,24,40,0.16)] sm:p-7">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[1rem] font-medium text-[#3f3f46]">Cost of Single Apartment</p>
                <span className="rounded-[16px] border border-[#f2b5a4] bg-[#fff4ef] px-4 py-2 text-[1rem] font-semibold text-[#df472b]">
                  Rs {formatCompactCr(apartmentCost)}
                </span>
              </div>

              <div className="mt-6">
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
              </div>
            </div>

            <div className="mt-9">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[1rem] font-medium text-[#3f3f46]">No of Buyers / Apartments</p>
                <span className="rounded-[16px] border border-[#f2b5a4] bg-[#fff4ef] px-4 py-2 text-[1rem] font-semibold text-[#df472b]">
                  {buyers}
                </span>
              </div>

              <div className="mt-6">
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
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-[1.05rem] font-semibold text-[#111111]">Save Upto</p>
              <div className="mx-auto mt-4 inline-flex min-w-[260px] items-center justify-center rounded-[18px] bg-[#e6522c] px-8 py-4 text-[2rem] font-semibold text-white shadow-[0_20px_45px_rgba(230,82,44,0.28)]">
                Rs {formatCompactCr(saveAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnitConverters = () => {
  const [activeMode, setActiveMode] = useState('emi');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const modes = [
    {
      id: 'emi',
      label: 'EMI Calculator',
      icon: Calculator,
      description: 'Monthly payment planning',
    },
    {
      id: 'normal',
      label: 'Normal Savings',
      icon: Building2,
      description: 'Group buying discount estimator',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf7f2] pt-[86px] text-black md:pt-[102px]">
      <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-[1600px] flex-col px-4 pb-8 sm:px-6">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-[1520px]">
            <div className="mb-6 flex flex-col items-center justify-between gap-5 lg:flex-row">
              <div className="text-center lg:text-left">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#df472b]">
                  Smart Calculators
                </p>
                <h1 className="mt-3 text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.06em] text-[#101010] sm:text-[3.3rem] lg:text-[4.1rem]">
                  Choose Your
                  <br className="sm:hidden" /> Calculator View
                </h1>
              </div>

              <div className="inline-flex rounded-full border border-[#ecd8ce] bg-white p-2 shadow-[0_14px_38px_rgba(17,24,39,0.06)]">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setActiveMode(mode.id)}
                      className={`flex items-center gap-3 rounded-full px-4 py-3 text-left transition-all sm:px-5 ${
                        isActive ? 'bg-[#df472b] text-white shadow-[0_14px_28px_rgba(223,71,43,0.25)]' : 'text-[#4b4b4b]'
                      }`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive ? 'bg-white/18' : 'bg-[#fff1ed] text-[#df472b]'}`}>
                        <Icon size={18} />
                      </span>
                      <span className="hidden sm:block">
                        <span className="block text-sm font-semibold">{mode.label}</span>
                        <span className={`mt-0.5 block text-xs ${isActive ? 'text-white/80' : 'text-[#8a7b74]'}`}>
                          {mode.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeMode === 'emi' ? (
                <motion.div
                  key="emi"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.24 }}
                >
                  <EMICalculatorView />
                </motion.div>
              ) : (
                <motion.div
                  key="normal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.24 }}
                >
                  <NormalSavingsView />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[28px] bg-white px-5 py-4 text-center shadow-[0_14px_30px_rgba(17,24,39,0.05)] sm:flex-row sm:text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1ed] text-[#df472b]">
                  <Users size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#171717]">One page, two calculator modes</p>
                  <p className="text-sm text-[#7c6e67]">Scroll ke bina same page par EMI aur Normal toggle karo.</p>
                </div>
              </div>

              <Link
                to="/properties"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111111] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#df472b]"
              >
                Explore Properties
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnitConverters;
