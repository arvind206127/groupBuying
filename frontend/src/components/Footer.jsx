import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon, Mail, Phone, MapPin,
  ArrowRight, Shield
} from 'lucide-react';
import api from '../api/axios';
import { FacebookIcon, InstagramIcon, LinkedinIcon } from './SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [siteName, setSiteName] = React.useState("Group Buying");

  React.useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data.success && res.data.settings.siteTitle) setSiteName(res.data.settings.siteTitle);
    });

    const handleSync = (e) => {
      if (e.key === 'site_settings_sync' && e.newValue) {
        setSiteName(JSON.parse(e.newValue).siteTitle);
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  return (
    <footer className="bg-slate-900 pt-16 md:pt-20 pb-10 border-t border-slate-800">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-prime-600 rounded-lg flex items-center justify-center text-white">
                <HomeIcon size={16} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{siteName}</span>
            </Link>
            <p className="text-slate-500 text-[13px] leading-relaxed max-w-xs font-medium">
              India's first collective real estate procurement platform. 
              Helping families buy their dream homes at bulk prices through the power of community.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: FacebookIcon, url: window.__SITE_SETTINGS__?.facebookUrl },
                { Icon: InstagramIcon, url: window.__SITE_SETTINGS__?.instagramUrl },
                { Icon: LinkedinIcon, url: window.__SITE_SETTINGS__?.linkedinUrl }
              ].map(({ Icon, url }, idx) => (
                <a key={idx} href={url || "#"} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-8">Ecosystem</h4>
            <ul className="space-y-4">
              {['Explore Properties', 'Group Buying FAQ', 'Case Studies', 'Developer Partners'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-slate-500 hover:text-white text-[13px] font-medium transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-8">Compliance</h4>
            <ul className="space-y-4">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'RERA Disclaimer'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-slate-500 hover:text-white text-[13px] font-medium transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-8">Corporate Comms</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail size={14} className="text-prime-500 mt-1" />
                <p className="text-slate-400 text-[13px]">{window.__SITE_SETTINGS__?.contactEmail || 'contact@groupbuying.in'}</p>
              </div>
              <div className="flex items-start gap-4">
                <Phone size={14} className="text-prime-500 mt-1" />
                <p className="text-slate-400 text-[13px]">{window.__SITE_SETTINGS__?.contactPhone || '+91 90000 00000'}</p>
              </div>
              <div className="flex items-start gap-4">
                <MapPin size={14} className="text-prime-500 mt-1" />
                <p className="text-slate-400 text-[13px]">Strategic Hub, Mumbai, India</p>
              </div>
            </div>
            <div className="pt-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                 <Shield size={12} className="text-prime-400" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RERA Secured Portal</span>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
          <p>© {currentYear} {siteName}. All rights reserved.</p>
          <p>Group Buying - Modern Real Estate</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
