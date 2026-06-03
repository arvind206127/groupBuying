import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import ExploreProjectsVideo from '../components/ExploreProjectsVideo';
import DeveloperPartners from '../components/DeveloperPartners';
import HomeBuyingJourney from '../components/HomeBuyingJourney';
import Testimonials from '../components/Testimonials';
import FAQSection from '../components/FAQSection';
import FloatingCalculator from '../components/FloatingCalculator';
import { ShieldCheck, Users, Banknote, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CitySelectionModal from '../components/CitySelectionModal';
import FloatingReel from '../components/FloatingReel';
import FastSellingProparties from './FastSellingProparties';
import TrendingProperties from './TrendingProperties';
import FeaturedCommercialProperties from './FeaturedCommercialProperties';
import ProminshesAndPlots from './ProminshesAndPlots';
import PreLaunchProperties from './PreLounchProperties';
import Blogs from './Blogs';
import Articles from './Articles';
import Reviews from './Reviews';
import Stay from './Stay';
import SearchPage from './Search';
import YoutubeVideo from './YoutubeVideo';

const TrustSection = () => (
  <section className="py-16 bg-slate-900 overflow-hidden relative border-y border-slate-800">
    <div className="mx-auto grid max-w-7xl home-page-gutter items-center gap-10 md:gap-12 lg:grid-cols-2">
      <div className="relative z-10">
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-3 px-1">Verified Compliance</p>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight capitalize">
          Secure Property <br /><span className="text-orange-500">Protocols?</span>
        </h2>
        <p className="text-slate-400 text-xs max-w-lg mb-10 leading-relaxed font-bold">
          We implement rigorous due diligence and RERA-compliance verification.
          Our platform operates with institutional transparency to ensure risk mitigation and alpha generation.
        </p>

        <div className="flex flex-wrap gap-4">
          <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <ShieldCheck size={16} className="text-orange-500" />
            <span className="text-white text-[9px] font-black uppercase tracking-widest">RERA Verified</span>
          </div>
          <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Building2 size={16} className="text-orange-500" />
            <span className="text-white text-[9px] font-black uppercase tracking-widest">Top Tier Developers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Users, title: "Verified Groups", desc: "KYC Protocols" },
          { icon: Banknote, title: "Alpha Discovery", desc: "Wholesale Access" },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center group hover:bg-white/10 transition-all"
          >
            <item.icon size={24} className="text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-[11px] font-black text-white mb-2 uppercase tracking-wider">{item.title}</h4>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const SuccessStories = () => {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestDeal = async () => {
      try {
        const res = await api.get('/case-studies?publishedOnly=true');
        if (res.data.success && res.data.caseStudies?.length > 0) {
          const latest = res.data.caseStudies.find(cs => cs.isPublished) || res.data.caseStudies[0];
          setDeal(latest);
        }
      } catch (error) {
        console.error('Failed to fetch latest deal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestDeal();
  }, []);

  const settings = window.__SITE_SETTINGS__ || {};
  const displayDeal = deal || {
    label: settings.successStoryLabel || "Verified Deal",
    title: settings.successStoryTitle || "Metropolitan Deal Group Acquisition.",
    description: settings.successStoryDesc || "A community of verified investors successfully secured ₹68 Lakhs in savings from a premium Mumbai project.",
    stat1Label: settings.successStoryStat1Label || "Total Market Value",
    stat1Value: settings.successStoryStat1Value || "₹12.5 Cr",
    stat2Label: settings.successStoryStat2Label || "Secured Savings",
    stat2Value: settings.successStoryStat2Value || "₹68 Lakhs",
    videoUrl: settings.successStoryVideo,
    thumbnail: settings.successStoryImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
  };

  if (loading) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 grid lg:grid-cols-2">
          <div className="p-6 sm:p-8 lg:p-14">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3">
              {displayDeal.label || "Verified Deal"}
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight capitalize">
              {displayDeal.title}
            </h2>
            <p className="text-slate-500 text-[11px] font-bold mb-8 leading-relaxed max-w-md">
              {displayDeal.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-10 border-t border-slate-200 pt-8 md:pt-10">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                  {displayDeal.stat1Label || "Total Value"}
                </p>
                <p className="text-lg font-black text-slate-900">
                  {displayDeal.stat1Value}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                  {displayDeal.stat2Label || "Savings"}
                </p>
                <p className="text-lg font-black text-orange-600">
                  {displayDeal.stat2Value}
                </p>
              </div>
            </div>
            <Link to="/case-studies" className="flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-600 transition-all sm:w-fit">
              Review Analytics
            </Link>
          </div>
          <div className="relative h-full min-h-[280px] bg-slate-100 md:min-h-[400px]">
            {displayDeal.videoUrl ? (
              <video
                key={displayDeal.videoUrl}
                src={displayDeal.videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={displayDeal.thumbnail}
                alt="Deal Visual"
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
              />
            )}
            <div className="absolute inset-0 bg-slate-900/10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xl">
                <ArrowRight size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      <Hero />
      <SearchBar />

      {/* 1st: Trading / Trending Inventory */}
      <FastSellingProparties />
      <TrendingProperties />
      <PreLaunchProperties />
      <FeaturedCommercialProperties />
      <ProminshesAndPlots />


      <ExploreProjectsVideo />

      <DeveloperPartners />
      <YoutubeVideo/>

      <HomeBuyingJourney />
      <Blogs />
      <Articles />
      <Reviews />
    
      <FAQSection />
      <Stay />
      <SearchPage/>

      <FloatingCalculator />
      <FloatingReel />
    </div>
  );
};

export default Home;
