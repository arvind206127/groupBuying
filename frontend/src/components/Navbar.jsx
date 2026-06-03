import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, User, LogOut, LayoutDashboard,
  Home as HomeIcon, Building2, BookOpen, Settings,
  Bell, Phone, ChevronDown, Search
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../api/axios';
import NotificationDropdown from './NotificationDropdown';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user, handleLogout, isAdmin, isRM, subscriptionTier } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [siteName, setSiteName] = useState("Group buying.in");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    api.get('/settings').then(res => {
      if (res.data.success && res.data.settings.siteTitle) setSiteName(res.data.settings.siteTitle);
    });

    const handleSync = (e) => {
      if (e.key === 'site_settings_sync' && e.newValue) {
        setSiteName(JSON.parse(e.newValue).siteTitle);
      }
    };
    window.addEventListener('storage', handleSync);

    const fetchNotifications = async () => {
      if (user) {
        try {
          const res = await api.get('/notifications');
          if (res.data.success) {
            setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
          }
        } catch (e) { }
      }
    };
    fetchNotifications();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  const navigate = useNavigate();
  const isLinkActive = (path) =>
    path === '/'
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'About us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const openLoginModal = () => {
    setIsOpen(false);
    setShowLoginModal(true);
  };

  return (
    <>
    <nav className={clsx(
        'fixed top-0 inset-x-0 z-[100] bg-white border-b border-slate-100 transition-all duration-300',
        scrolled ? 'shadow-sm' : 'shadow-none'
      )}>
      <div className="mx-auto flex h-[74px] max-w-[1680px] items-center justify-between home-page-gutter md:h-[86px] lg:grid lg:grid-cols-[220px_1fr_280px] xl:grid-cols-[260px_1fr_340px]">
        {/* Logo */}
        <Link to="/" className="relative flex w-[118px] shrink-0 flex-col justify-center gap-0.5 leading-[0.78] sm:w-[152px]">
          <span className="text-[22px] font-bold tracking-[-0.025em] text-[#db4a2b] sm:text-[28px]">
            Group
          </span>
          <span className="text-[22px] font-bold tracking-[-0.035em] text-[#050505] sm:text-[28px]">
            Buying
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center justify-center gap-7 xl:gap-11">
          {navLinks.map((link) => {
            if (link.name === 'Properties') {
              return (
                <div key={link.name} className="relative group cursor-pointer flex items-center h-[86px]">
                  <Link
                    to={link.path}
                    className={clsx(
                      "relative flex items-center gap-1 text-lg font-medium leading-none transition-colors xl:text-xl h-full",
                      isLinkActive(link.path) ? "text-[#111111]" : "text-[#5f5f5f] hover:text-[#111111]"
                    )}
                  >
                    {link.name} <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all absolute -right-4" />
                    {isLinkActive(link.path) && (
                      <motion.div layoutId="nav-underline" className="absolute bottom-[15px] left-0 right-0 h-0.5 bg-[#db4a2b]" />
                    )}
                  </Link>

                  <div className="absolute left-1/2 top-[72px] z-[110] w-[200px] -translate-x-1/2 rounded-[10px] border border-slate-100 bg-white py-[14px] opacity-0 invisible shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.02] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {[
                      { name: 'Residential', path: '/properties?category=Residential' },
                      { name: 'Commercial', path: '/properties?category=Commercial' },
                      { name: 'Plots', path: '/properties?category=Plots' },
                      { name: 'Villa', path: '/properties?category=Villa' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="block px-[24px] py-[10px] text-[16px] font-normal leading-none text-[#555555] transition-all hover:bg-[#fff4ef] hover:text-[#db4a2b] xl:text-[18px]"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "relative flex h-[86px] items-center text-lg font-medium leading-none transition-colors xl:text-xl",
                  isLinkActive(link.path) ? "text-[#111111]" : "text-[#5f5f5f] hover:text-[#111111]"
                )}
              >
                {link.name}
                {isLinkActive(link.path) && (
                  <motion.div layoutId="nav-underline" className="absolute bottom-[15px] left-0 right-0 h-0.5 bg-[#db4a2b]" />
                )}
              </Link>
            );
          })}

          {/* Resources Dropdown */}
          <div className="relative group cursor-pointer">
            <div className="flex h-[86px] items-center gap-1 text-lg font-medium leading-none text-[#5f5f5f] group-hover:text-[#111111] xl:text-xl">
              Resources <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all" />
            </div>

            <div className="absolute left-1/2 top-[72px] z-[110] w-[225px] -translate-x-1/2 rounded-[10px] border border-slate-100 bg-white py-[18px] opacity-0 invisible shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.02] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {[
                { name: 'Articles', path: '/articles' },
                { name: 'Blogs', path: '/blogs' },
                { name: 'News', path: '/news' },
                { name: 'Subscription', path: '/subscriptions' },
                { name: 'FAQs', path: '/faqs' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-[30px] py-[13px] text-[18px] font-normal leading-none text-[#555555] transition-all hover:bg-[#fff4ef] hover:text-[#db4a2b] xl:text-[20px]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center justify-end gap-3 xl:gap-5">
          <Link
            to="/corporate"
            className="flex h-11 items-center justify-center rounded-full border border-[#d9d9d9] bg-[#f5f5f5] px-5 text-base font-medium text-[#202020] transition-all hover:bg-[#eeeeee] xl:h-[56px] xl:px-7 xl:text-xl"
          >
            Corporate
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Link to="/dashboard" className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl hover:bg-orange-600 transition-all border-2 border-white">
                  {user.name?.charAt(0) || 'U'}
                </Link>
                {(subscriptionTier === 'PREMIUM' || subscriptionTier === 'ANNUAL') && (
                  <div className={clsx(
                    "absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest shadow-lg border border-white",
                    subscriptionTier === 'PREMIUM' ? "bg-orange-600 text-white" : "bg-slate-900 text-white"
                  )}>
                    {subscriptionTier === 'PREMIUM' ? 'PRO' : 'ELITE'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="flex h-11 items-center justify-center rounded-full bg-[#db4a2b] px-5 text-base font-semibold text-white transition-all hover:bg-[#c94125] xl:h-[56px] xl:px-7 xl:text-xl"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-slate-900">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full inset-x-0 bg-white border-b border-slate-100 lg:hidden overflow-hidden"
          >
            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-black text-slate-900 uppercase tracking-tighter sm:text-2xl"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/prominshes-and-plots"
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-black text-slate-900 uppercase tracking-tighter sm:text-2xl"
                >
                  Prominshes & Plots
                </Link>
              </div>
              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                <Link to="/stay" onClick={() => setIsOpen(false)} className="w-full rounded-2xl bg-[#fff4ef] py-4 text-center text-base uppercase tracking-widest text-[#db4a2b] sm:text-lg">Stay</Link>
                <Link to="/corporate" onClick={() => setIsOpen(false)} className="w-full rounded-2xl bg-slate-100 py-4 text-center text-base uppercase tracking-widest text-slate-900 sm:text-xl">Corporate</Link>
                {!user ? (
                  <button type="button" onClick={openLoginModal} className="w-full rounded-2xl bg-orange-600 py-4 text-center text-base uppercase tracking-widest text-white sm:text-lg">Sign In</button>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default Navbar;
