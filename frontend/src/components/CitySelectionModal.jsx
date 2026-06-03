import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CitySelectionModal = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const settings = window.__SITE_SETTINGS__ || {};

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/properties');
        if (res.data.success) {
          const props = res.data.properties;
          const uniqueCities = [...new Set(props.map(p => p.city))].map(name => ({
            name,
            icon: '🏙️',
            count: `${props.filter(p => p.city === name).length}+ Projects`
          }));
          setCities(uniqueCities);
        }
      } catch (error) {
        console.error("Cities fetch failed");
      }
    };

    fetchCities();

    // Show after 3 seconds if not disabled in settings
    if (settings.showCityModal === false) return;

    const timer = setTimeout(() => {
      const savedCity = localStorage.getItem('selectedCity');
      if (!savedCity) {
        setIsOpen(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [settings.showCityModal]);

  const selectCity = (city) => {
    localStorage.setItem('selectedCity', city);
    setIsOpen(false);
    navigate(`/properties?city=${city}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header decoration */}
            <div className="h-2 bg-gradient-to-r from-orange-500 to-prime-600" />
            
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
                <X size={20} className="text-slate-400" />
            </button>

            <div className="p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <MapPin size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{settings.cityModalTitle || 'Choose Your City'}</h2>
                    <p className="text-slate-500 font-medium text-sm">{settings.cityModalSubtitle || 'Find prime opportunities in your preferred region'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-8">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => selectCity(city.name)}
                    className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-orange-600 rounded-2xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-4">
                        <span className="text-2xl">{city.icon}</span>
                        <div>
                            <p className="font-black text-slate-900 group-hover:text-white transition-colors">{city.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-orange-100 transition-colors">{city.count}</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>

              <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                We use your location to show relevant group-buying deals.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CitySelectionModal;
