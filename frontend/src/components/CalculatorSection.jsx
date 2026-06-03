import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalcIcon, IndianRupee, PieChart, Info, ArrowRight, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatPriceShort } from '../utils/format';

const ROICalculator = () => {
  const [investment, setInvestment] = useState(15000000);
  const [appreciation, setAppreciation] = useState(8);
  const [tenure, setTenure] = useState(5);
  const [groupDiscount, setGroupDiscount] = useState(6);

  const futureValue = investment * Math.pow(1 + (appreciation / 100), tenure);
  const groupSaving = investment * (groupDiscount / 100);
  const netInvestment = investment - groupSaving;
  const totalReturn = futureValue - netInvestment;
  const roi = (totalReturn / netInvestment) * 100;

  return (
    <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px] -z-0" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-10 md:mb-14">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-900/50">
                <TrendingUp size={28} md:size={32} />
            </div>
            <div>
                <h3 className="text-xl md:text-2xl font-black leading-none uppercase tracking-tighter">ROI Synergy Predictor</h3>
                <p className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-2">Capital Appreciation Engine</p>
            </div>
        </div>

        <div className="space-y-12">
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Investment</span>
                    <span className="text-2xl font-black text-white tracking-tighter">₹{(investment/10000000).toFixed(2)} Cr</span>
                </div>
                <input 
                    type="range" min="5000000" max="100000000" step="500000" value={investment} 
                    onChange={(e) => setInvestment(Number(e.target.value))} 
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-orange-600 cursor-pointer" 
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Appreciation (PA)</span>
                        <span className="text-lg font-black text-orange-500">{appreciation}%</span>
                    </div>
                    <input 
                        type="range" min="1" max="25" step="0.5" value={appreciation} 
                        onChange={(e) => setAppreciation(Number(e.target.value))} 
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-orange-600 cursor-pointer" 
                    />
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hold Tenure</span>
                        <span className="text-lg font-black text-orange-500">{tenure} Yrs</span>
                    </div>
                    <input 
                        type="range" min="1" max="15" step="1" value={tenure} 
                        onChange={(e) => setTenure(Number(e.target.value))} 
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-orange-600 cursor-pointer" 
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="mt-12 md:mt-16 pt-10 border-t border-white/5 relative z-10">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:flex-row sm:items-end sm:justify-between md:p-8">
            <div>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">Projected Net ROI</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{roi.toFixed(0)}%</span>
                    <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                        <ArrowRight size={14} className="-rotate-45" /> 
                        Elite
                    </span>
                </div>
            </div>
            <div className="text-left sm:text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Wealth Gain</p>
                <p className="text-2xl md:text-3xl font-black text-white tracking-tighter">₹{(totalReturn/10000000).toFixed(2)} Cr</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const EMICalculator = () => {
  const [amount, setAmount] = useState(8000000);
  const [interest, setInterest] = useState(10.5);
  const [tenure, setTenure] = useState(20);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    const r = interest / (12 * 100);
    const n = tenure * 12;
    const emiCalc = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(Math.round(emiCalc));
    setTotalInterest(Math.round(emiCalc * n - amount));
  }, [amount, interest, tenure]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatLacs = (val) => {
    if (val >= 10000000) return `${(val/10000000).toFixed(2)} Cr`;
    return `${(val/100000).toFixed(2)} Lacs`;
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 h-full relative overflow-hidden group">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center md:mb-14">
          <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <PieChart size={28} />
              </div>
              <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Smart EMI Engine</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Debt Architecture Tool</p>
              </div>
          </div>
          <div className="text-left sm:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Monthly Commitment</p>
              <p className="text-4xl font-black text-orange-600 tracking-tighter italic">₹{formatCurrency(emi)}</p>
          </div>
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-12">
            <div className="space-y-5">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Principal</span>
                    <span className="text-xl font-black text-slate-900">₹{formatLacs(amount)}</span>
                </div>
                <input 
                    type="range" min="100000" max="130000000" step="100000" value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-slate-900 cursor-pointer" 
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate (% PA)</span>
                        <span className="text-lg font-black text-slate-900">{interest}%</span>
                    </div>
                    <input 
                        type="range" min="1" max="30" step="0.1" value={interest} 
                        onChange={(e) => setInterest(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-slate-900 cursor-pointer" 
                    />
                </div>
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Term (Yrs)</span>
                        <span className="text-lg font-black text-slate-900">{tenure}</span>
                    </div>
                    <input 
                        type="range" min="1" max="30" step="1" value={tenure} 
                        onChange={(e) => setTenure(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-slate-900 cursor-pointer" 
                    />
                </div>
            </div>
        </div>

        <div className="p-8 md:p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-6">
                {[
                    { label: 'Total Principal', val: formatCurrency(amount), color: 'text-slate-900' },
                    { label: 'Total Interest', val: formatCurrency(totalInterest), color: 'text-orange-600' },
                    { label: 'Total Payable', val: formatCurrency(amount + totalInterest), color: 'text-slate-900' }
                ].map((row, i) => (
                    <div key={i} className={`flex justify-between items-center ${i === 2 ? 'pt-6 border-t border-slate-200 mt-2' : ''}`}>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                        <span className={`text-lg font-black ${row.color}`}>₹{row.val}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-10 h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(amount / (amount + totalInterest)) * 100}%` }} className="h-full bg-slate-900" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(totalInterest / (amount + totalInterest)) * 100}%` }} className="h-full bg-orange-600" />
            </div>
            <div className="flex justify-between mt-3 text-[8px] font-black uppercase tracking-widest text-slate-400">
                <span>Principal {( (amount / (amount + totalInterest)) * 100 ).toFixed(0)}%</span>
                <span>Interest {( (totalInterest / (amount + totalInterest)) * 100 ).toFixed(0)}%</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const CalculatorSection = () => {
  return (
    <section className="py-24 bg-slate-50/50 overflow-hidden relative">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
            <ROICalculator />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}>
            <EMICalculator />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl group md:flex-row md:items-center md:gap-12 md:rounded-[3rem] md:p-16"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,94,31,0.1),transparent)]" />
          
          <div className="relative z-10 max-w-xl">
            <p className="text-orange-500 text-[11px] font-black uppercase tracking-[0.4em] mb-6">Group Buy Synergy</p>
            <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter leading-none uppercase">Start Saving <br /><span className="text-orange-600">Thousands</span> Today</h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400 md:mb-10 md:text-lg">Join hundreds of buyers leveraging collective power to get exclusive zero-brokerage deals and wholesale pricing on premium projects.</p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/properties" className="h-14 px-10 bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/40">
                Explore Groups
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="h-14 px-10 border border-slate-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center hover:bg-white/5 transition-all">
                Get Free Call
              </Link>
            </div>
          </div>
          
          <div className="relative z-10 grid w-full grid-cols-1 gap-4 md:w-80 md:gap-6">
              {[
                  { label: "Verified Savings", value: "₹45Cr+", sub: "Delivered to date" },
                  { label: "Active Buyers", value: "12,500+", sub: "Growing community" },
              ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
                      <p className="text-orange-500 text-[9px] font-black uppercase tracking-widest mb-3">{stat.label}</p>
                      <p className="text-3xl font-black italic mb-1">{stat.value}</p>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{stat.sub}</p>
                  </div>
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CalculatorSection;
