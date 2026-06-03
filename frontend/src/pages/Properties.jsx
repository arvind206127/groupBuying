import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  List,
  Loader2,
  Map,
  MapPinned,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Navigation
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Footer from '../components/Footer';

const markerPositions = [
  { top: '18%', left: '58%' },
  { top: '24%', left: '62%' },
  { top: '30%', left: '53%' },
  { top: '34%', left: '47%' },
  { top: '38%', left: '64%' },
  { top: '42%', left: '44%' },
  { top: '45%', left: '57%' },
  { top: '48%', left: '72%' },
  { top: '52%', left: '39%' },
  { top: '54%', left: '60%' },
  { top: '58%', left: '50%' },
  { top: '61%', left: '67%' },
  { top: '65%', left: '43%' },
  { top: '69%', left: '55%' },
  { top: '73%', left: '70%' },
  { top: '78%', left: '59%' },
  { top: '31%', left: '76%' },
  { top: '43%', left: '82%' },
  { top: '57%', left: '78%' },
  { top: '82%', left: '84%' },
];

const buildFiltersFromQuery = (searchString) => {
  const params = new URLSearchParams(searchString);

  return {
    city: params.get('city') || '',
    locality: params.get('locality') || '',
    developerName: params.get('developerName') || '',
    bhk: params.get('bhk') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    search: params.get('search') || '',
    propertyStatusId: params.get('propertyStatusId') || '',
    category: params.get('category') || '',
    sortBy: params.get('sortBy') || 'newest',
    areaBand: params.get('areaBand') || '',
  };
};

const statusOrder = ['Ready to Move', 'Under Construction', 'Pre-Launch', 'Sold Out'];

const sortPropertyStatuses = (statuses = []) => [...statuses].sort((first, second) => {
  const firstIndex = statusOrder.indexOf(first.name);
  const secondIndex = statusOrder.indexOf(second.name);

  if (firstIndex !== -1 || secondIndex !== -1) {
    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;
    return firstIndex - secondIndex;
  }

  return (first.name || '').localeCompare(second.name || '');
});

const getBudgetBand = (minPrice, maxPrice) => {
  const key = `${minPrice || ''}-${maxPrice || ''}`;

  if (key === '0-10000000') return 'upto-1cr';
  if (key === '10000000-20000000') return '1-2cr';
  if (key === '20000000-40000000') return '2-4cr';
  if (key === '40000000-') return '4cr-plus';

  return '';
};

const getBudgetRange = (band) => {
  switch (band) {
    case 'upto-1cr':
      return { minPrice: '0', maxPrice: '10000000' };
    case '1-2cr':
      return { minPrice: '10000000', maxPrice: '20000000' };
    case '2-4cr':
      return { minPrice: '20000000', maxPrice: '40000000' };
    case '4cr-plus':
      return { minPrice: '40000000', maxPrice: '' };
    default:
      return { minPrice: '', maxPrice: '' };
  }
};

const matchesAreaBand = (property, areaBand) => {
  if (!areaBand) return true;

  const area = Number(property.area || 0);
  if (!area) return true;

  switch (areaBand) {
    case 'upto-1500':
      return area <= 1500;
    case '1500-2500':
      return area > 1500 && area <= 2500;
    case '2500-4000':
      return area > 2500 && area <= 4000;
    case '4000-plus':
      return area > 4000;
    default:
      return true;
  }
};

const FilterSelect = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (nextValue) => {
    onChange({ target: { value: nextValue } });
    setIsOpen(false);
  };

  return (
    <motion.div
      ref={dropdownRef}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`group relative z-50 min-w-[160px] ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-left text-sm font-semibold shadow-[0_14px_28px_rgba(27,18,12,0.08)] outline-none backdrop-blur-md transition-all xl:h-9 xl:rounded-xl xl:px-3 xl:text-[13px] ${isOpen
          ? 'border-[#ff744f] text-[#2a211c] ring-4 ring-[#ff744f]/18'
          : 'border-white/14 text-[#2a211c] hover:border-[#ff9d78]/70'
          }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-all group-hover:text-[#df472b] ${isOpen ? 'rotate-180 text-[#df472b]' : ''
            }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 top-[calc(100%+10px)] z-[90] max-h-72 w-full min-w-[210px] overflow-auto rounded-2xl border border-[#f2d6ca] bg-white p-1.5 shadow-[0_24px_55px_rgba(43,25,17,0.22)] xl:top-[calc(100%+6px)]"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all ${isSelected
                    ? 'bg-[#df472b] text-white shadow-[0_10px_22px_rgba(223,71,43,0.22)]'
                    : 'text-[#352821] hover:bg-[#fff1eb] hover:text-[#df472b]'
                    }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Properties = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => buildFiltersFromQuery(location.search));
  const [mapView, setMapView] = useState('map');
  const [mobileView, setMobileView] = useState('list');
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [propertyStatuses, setPropertyStatuses] = useState([]);
  const propertyRefs = useRef({});
  const listSectionRef = useRef(null);
  const mapSectionRef = useRef(null);
  const MotionDiv = motion.div;

  const isLocked = !authLoading && !user;
  const budgetBand = useMemo(
    () => getBudgetBand(filters.minPrice, filters.maxPrice),
    [filters.minPrice, filters.maxPrice]
  );

  useEffect(() => {
    document.documentElement.classList.add('properties-page-scroll-lock');
    document.body.classList.add('properties-page-scroll-lock');

    return () => {
      document.documentElement.classList.remove('properties-page-scroll-lock');
      document.body.classList.remove('properties-page-scroll-lock');
    };
  }, []);

  useEffect(() => {
    const fetchPropertyStatuses = async () => {
      try {
        const response = await api.get('/properties/property-statuses');
        if (response.data.success) {
          setPropertyStatuses(sortPropertyStatuses(response.data.statuses || []));
        }
      } catch (error) {
        console.error('Status fetch failed:', error);
      }
    };

    fetchPropertyStatuses();
  }, []);

  useEffect(() => {
    const nextFilters = buildFiltersFromQuery(location.search);
    setFilters(nextFilters);

    const fetchInitialProperties = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();

        if (nextFilters.city) query.append('city', nextFilters.city);
        if (nextFilters.locality) query.append('locality', nextFilters.locality);
        if (nextFilters.developerName) query.append('developerName', nextFilters.developerName);
        if (nextFilters.bhk) query.append('bhk', nextFilters.bhk);
        if (nextFilters.minPrice) query.append('minPrice', nextFilters.minPrice);
        if (nextFilters.maxPrice) query.append('maxPrice', nextFilters.maxPrice);
        if (nextFilters.search) query.append('search', nextFilters.search);
        if (nextFilters.propertyStatusId) query.append('propertyStatusId', nextFilters.propertyStatusId);
        if (nextFilters.category) query.append('category', nextFilters.category);
        if (nextFilters.sortBy) query.append('sortBy', nextFilters.sortBy);

        const response = await api.get(`/properties?${query.toString()}`);
        if (response.data.success) {
          setProperties(response.data.properties || []);
        }
      } catch (error) {
        console.error('Fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProperties();
  }, [location.search]);

  const fetchProperties = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      if (currentFilters.city) query.append('city', currentFilters.city);
      if (currentFilters.locality) query.append('locality', currentFilters.locality);
      if (currentFilters.developerName) query.append('developerName', currentFilters.developerName);
      if (currentFilters.bhk) query.append('bhk', currentFilters.bhk);
      if (currentFilters.minPrice) query.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) query.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.search) query.append('search', currentFilters.search);
      if (currentFilters.propertyStatusId) query.append('propertyStatusId', currentFilters.propertyStatusId);
      if (currentFilters.category) query.append('category', currentFilters.category);
      if (currentFilters.sortBy) query.append('sortBy', currentFilters.sortBy);

      const response = await api.get(`/properties?${query.toString()}`);
      if (response.data.success) {
        setProperties(response.data.properties || []);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleProperties = useMemo(
    () => properties.filter((property) => matchesAreaBand(property, filters.areaBand)),
    [properties, filters.areaBand]
  );

  useEffect(() => {
    if (!selectedPropertyId && visibleProperties.length > 0) {
      setSelectedPropertyId(visibleProperties[0].id);
    }

    if (
      selectedPropertyId &&
      visibleProperties.length > 0 &&
      !visibleProperties.some((property) => property.id === selectedPropertyId)
    ) {
      setSelectedPropertyId(visibleProperties[0].id);
    }
  }, [selectedPropertyId, visibleProperties]);

  const handleFilterPatch = (patch) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    fetchProperties(nextFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      city: '',
      locality: '',
      developerName: '',
      bhk: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      propertyStatusId: '',
      category: '',
      sortBy: 'newest',
      areaBand: '',
    };
    setFilters(clearedFilters);
    fetchProperties(clearedFilters);
  };

  const handleMarkerClick = (propertyId) => {
    setSelectedPropertyId(propertyId);
    if (window.innerWidth < 1280) {
      setMobileView('list');
    }

    const node = propertyRefs.current[propertyId];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleMobileSectionJump = (section) => {
    setMobileView(section);
    if (window.innerWidth >= 1280) return;

    const targetRef = section === 'map' ? mapSectionRef : listSectionRef;
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedProperty = visibleProperties.find(
    (property) => property.id === selectedPropertyId
  );
  const activeFilterCount = [
    filters.city,
    filters.locality,
    filters.developerName,
    filters.bhk,
    budgetBand,
    filters.areaBand,
    filters.search,
    filters.propertyStatusId,
    filters.category,
  ].filter(Boolean).length;

  const categoryOptions = [
    { value: '', label: 'Category' },
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Plots', label: 'Plots' },
    { value: 'Villa', label: 'Villa' },
  ];

  const possessionOptions = [
    { value: '', label: 'Possession Status' },
    ...propertyStatuses.map((statusItem) => ({ value: statusItem.id, label: statusItem.name })),
  ];

  const configurationOptions = [
    { value: '', label: 'Configuration' },
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4 BHK+' },
  ];

  const budgetOptions = [
    { value: '', label: 'Budget Range' },
    { value: 'upto-1cr', label: 'Up to 1 Cr' },
    { value: '1-2cr', label: '1 Cr - 2 Cr' },
    { value: '2-4cr', label: '2 Cr - 4 Cr' },
    { value: '4cr-plus', label: '4 Cr+' },
  ];

  const areaOptions = [
    { value: '', label: 'Area sq.ft.' },
    { value: 'upto-1500', label: 'Up to 1500 sq.ft.' },
    { value: '1500-2500', label: '1500 - 2500 sq.ft.' },
    { value: '2500-4000', label: '2500 - 4000 sq.ft.' },
    { value: '4000-plus', label: '4000+ sq.ft.' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Sort by Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'area', label: 'Largest Area' },
  ];

  return (
    <>
      <div className="relative min-h-screen overflow-x-hidden bg-[#fbf2ea] pb-16 pt-28 md:pt-32 xl:h-screen xl:overflow-hidden xl:pb-0 xl:pt-[86px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-36 top-10 h-96 w-96 rounded-full bg-[#ff8a5c]/18 blur-3xl" />
          <div className="absolute right-[-8rem] top-24 h-[28rem] w-[28rem] rounded-full bg-[#2a211c]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#ffd0a8]/35 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(128,68,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(128,68,42,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 xl:flex xl:h-full xl:flex-col xl:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`transition-all duration-300 ${isLocked ? 'pointer-events-none select-none blur-[12px]' : ''
              } xl:flex xl:min-h-0 xl:flex-1 xl:flex-col`}
          >
            <div className="relative z-40 mb-5 flex-shrink-0 overflow-hidden rounded-[32px] border border-white/60 bg-white/78 px-5 py-5 shadow-[0_24px_70px_rgba(96,55,32,0.13)] backdrop-blur-2xl sm:px-6 xl:hidden">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#ff6d44]/20 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-72 rounded-full bg-[#2a211c]/8 blur-2xl" />

              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between xl:gap-4">
                <div className="flex flex-col">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ffd9ca] bg-[#fff3ed] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#d5482c] xl:py-1 xl:text-[10px]">
                    <Sparkles size={14} />
                    Group Buying Radar
                  </div>
                  <p className="mt-3 text-[2.15rem] font-black leading-none tracking-[-0.07em] text-[#17110d] sm:text-5xl xl:mt-1.5 xl:text-[2rem]">
                    {visibleProperties.length}
                    <span className="ml-2 bg-gradient-to-r from-[#df472b] to-[#ff8a57] bg-clip-text text-transparent">
                      Properties
                    </span>
                  </p>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#786b61] xl:mt-1 xl:text-xs xl:leading-4">
                    High-intent homes, live buyer momentum, aur map hotspots ek hi jagah.
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-3 lg:max-w-[600px] lg:items-end xl:gap-2">
                  <div className="flex w-full items-center gap-3 rounded-[22px] border border-[#f1d8cb] bg-white/88 px-4 py-3 shadow-[0_18px_35px_rgba(75,41,24,0.09)] backdrop-blur-sm transition-all focus-within:border-[#df472b] focus-within:ring-4 focus-within:ring-[#df472b]/10 xl:py-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e8] text-[#df472b]">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(event) => handleFilterPatch({ search: event.target.value })}
                      placeholder="Search by project name, sector, or locality..."
                      className="h-6 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                    />
                    {filters.search ? (
                      <button type="button" onClick={() => handleFilterPatch({ search: '' })} className="rounded-full bg-[#fff0e8] p-2 text-slate-400 transition-colors hover:text-[#df472b]">
                        <X size={16} />
                      </button>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#736963]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#ffd9ca] bg-[#fff1eb] px-3 py-1.5 text-[#de4c2e] shadow-sm xl:py-1">
                      <Sparkles size={14} />
                      Verified group-buying deals
                    </span>
                    {filters.city ? (
                      <span className="rounded-full bg-[#f5f1ed] px-3 py-1.5">
                        City: {filters.city}
                      </span>
                    ) : null}
                    {filters.category ? (
                      <span className="rounded-full bg-[#f5f1ed] px-3 py-1.5">
                        Category: {filters.category}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.38 }}
              className="relative z-50 mb-6 flex-shrink-0 overflow-visible rounded-[28px] border border-white/12 bg-[#201713] p-3 shadow-[0_24px_70px_rgba(39,20,13,0.22)] xl:mb-2 xl:rounded-[24px] xl:p-3 xl:mt-3"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,128,83,0.35),transparent_34%),radial-gradient(circle_at_92%_20%,rgba(255,224,193,0.18),transparent_28%)]" />
              <div className="relative flex flex-col gap-3 xl:flex-row xl:flex-nowrap xl:items-center xl:gap-1.5">
                <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl bg-white/8 px-4 py-3 text-white backdrop-blur xl:rounded-xl xl:px-3 xl:py-1.5">
                  <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em]">
                    <SlidersHorizontal size={16} className="text-[#ff906d]" />
                    Deal Filters
                  </span>
                  <span className="rounded-full bg-[#ff744f] px-2.5 py-1 text-[10px] font-black text-white">
                    {activeFilterCount} Active
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 xl:flex-nowrap xl:gap-1.5">
                  <FilterSelect
                    value={filters.category}
                    onChange={(event) => handleFilterPatch({ category: event.target.value })}
                    options={categoryOptions}
                    className="min-w-[160px] flex-1 sm:flex-none xl:min-w-[140px]"
                  />
                  <FilterSelect
                    value={filters.propertyStatusId}
                    onChange={(event) => handleFilterPatch({ propertyStatusId: event.target.value })}
                    options={possessionOptions}
                    className="min-w-[190px] flex-1 sm:flex-none xl:min-w-[160px]"
                  />
                  <FilterSelect
                    value={filters.bhk}
                    onChange={(event) => handleFilterPatch({ bhk: event.target.value })}
                    options={configurationOptions}
                    className="min-w-[170px] flex-1 sm:flex-none xl:min-w-[150px]"
                  />
                  <FilterSelect
                    value={budgetBand}
                    onChange={(event) => handleFilterPatch(getBudgetRange(event.target.value))}
                    options={budgetOptions}
                    className="min-w-[170px] flex-1 sm:flex-none xl:min-w-[150px]"
                  />
                  <FilterSelect
                    value={filters.areaBand}
                    onChange={(event) => handleFilterPatch({ areaBand: event.target.value })}
                    options={areaOptions}
                    className="min-w-[180px] flex-1 sm:flex-none xl:min-w-[150px]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap xl:gap-1.5 xl:justify-end">
                  <FilterSelect
                    value={filters.sortBy}
                    onChange={(event) => handleFilterPatch({ sortBy: event.target.value })}
                    options={sortOptions}
                    className="min-w-[190px] xl:min-w-[170px]"
                  />
                  <motion.button
                    type="button"
                    onClick={handleClearFilters}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="h-12 rounded-2xl border border-white/10 bg-white/12 px-5 text-sm font-black text-white backdrop-blur transition-all hover:bg-white hover:text-[#df472b] xl:h-9 xl:rounded-xl xl:px-4 xl:text-xs"
                  >
                    Clear Filters
                  </motion.button>
                  <div className="flex rounded-2xl bg-white/10 p-1 xl:hidden">
                    <button
                      type="button"
                      onClick={() => handleMobileSectionJump('list')}
                      className={`flex h-10 w-11 items-center justify-center rounded-xl transition-all ${mobileView === 'list' ? 'bg-white text-[#df472b]' : 'text-white/70'}`}
                    >
                      <List size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMobileSectionJump('map')}
                      className={`flex h-10 w-11 items-center justify-center rounded-xl transition-all ${mobileView === 'map' ? 'bg-white text-[#df472b]' : 'text-white/70'}`}
                    >
                      <Map size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 size={48} className="mb-4 text-[#df472b]" />
                </motion.div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Curating Premium Opportunities...</p>
              </div>
            ) : visibleProperties.length > 0 ? (
              <div className="grid items-start gap-6 pb-4 xl:h-[calc(100dvh-142px)] xl:min-h-0 xl:flex-none xl:grid-cols-[minmax(0,1.08fr)_minmax(430px,0.82fr)] xl:gap-5 xl:overflow-hidden xl:pb-6">
                {/* List View */}
                <div ref={listSectionRef} className="order-2 block scroll-mt-28 property-list-scrollbar xl:order-none xl:h-full xl:overflow-y-auto xl:overscroll-contain xl:pb-4 xl:pr-3 xl:pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    {visibleProperties.map((property, index) => (
                      <MotionDiv
                        key={property.id}
                        ref={(node) => { propertyRefs.current[property.id] = node; }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -8 }}
                        transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                        className={`group/cardWrap relative rounded-[30px]  transition-all duration-500 ${selectedPropertyId === property.id
                          ? 'bg-[linear-gradient(135deg,#ff7a55,#ffffff_38%,#221714)] shadow-[0_24px_60px_rgba(223,71,43,0.22)]'
                          : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,150,112,0.26),rgba(255,255,255,0.72))] shadow-[0_18px_45px_rgba(73,39,23,0.12)] hover:shadow-[0_28px_70px_rgba(73,39,23,0.18)]'
                          }`}
                        onMouseEnter={() => setSelectedPropertyId(property.id)}
                      >
                        <div className="pointer-events-none absolute -inset-3 rounded-[34px] bg-[#ff744f]/16 opacity-0 blur-2xl transition-opacity duration-500 group-hover/cardWrap:opacity-100" />
                        {selectedPropertyId === property.id ? (
                          <div className="pointer-events-none absolute -right-2 -top-2 z-30 rounded-full border border-white/70 bg-[#df472b] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_rgba(223,71,43,0.32)]">
                            Active Pick
                          </div>
                        ) : null}
                        <div className="relative overflow-hidden rounded-[29px] bg-white border border-[#f0d5c8]">
                          <Card property={property} index={index} compact />
                        </div>
                      </MotionDiv>
                    ))}
                  </div>
                </div>

                {/* Map View */}
                <div ref={mapSectionRef} className="order-1 block scroll-mt-28 xl:order-none xl:h-full">
                  <motion.div
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="group/map relative overflow-hidden rounded-[20px] border border-[#2b201b]/15 bg-[#16100d] shadow-[0_34px_90px_rgba(35,20,13,0.28)] xl:flex xl:h-[550px] xl:flex-col"
                  >
                    <div className="pointer-events-none absolute -right-28 -top-28 z-10 h-72 w-72 rounded-full bg-[#ff744f]/24 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 left-10 z-10 h-80 w-80 rounded-full bg-[#ffd1ab]/10 blur-3xl" />

                    {/* Map Controls */}
                    <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
                      <div className="inline-flex rounded-2xl border border-white/20 bg-white/12 p-1.5 shadow-xl backdrop-blur-md pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => setMapView('map')}
                          className={`rounded-xl px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${mapView === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'
                            }`}
                        >
                          Map
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapView('satellite')}
                          className={`rounded-xl px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${mapView === 'satellite' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'
                            }`}
                        >
                          Satellite
                        </button>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#df472b] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-[#df472b]/40 pointer-events-auto">
                        <Navigation size={14} className="animate-pulse" /> Live Radar
                      </div>
                    </div>

                    <div className="relative h-[520px] w-full bg-slate-900 sm:h-[620px] xl:min-h-0 xl:flex-1">
                      {mapView === 'map' ? (
                        <iframe
                          title="GroupBuying property map"
                          src="https://www.openstreetmap.org/export/embed.html?bbox=76.70%2C27.88%2C77.90%2C29.20&amp;layer=mapnik"
                          className="h-full w-full border-0 opacity-70 mix-blend-luminosity filter saturate-0 contrast-125"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80"
                          alt="Satellite view"
                          className="h-full w-full object-cover opacity-80"
                        />
                      )}

                      {/* Map Overlays for Premium Vibe */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/92" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_56%_46%,rgba(255,116,79,0.05),transparent_26%),radial-gradient(circle_at_56%_46%,transparent_0,transparent_20%,rgba(255,255,255,0.11)_20.5%,transparent_21%),radial-gradient(circle_at_56%_46%,transparent_0,transparent_33%,rgba(255,255,255,0.09)_33.5%,transparent_34%)]" />
                      <motion.div
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ff744f]/16"
                        animate={{ rotate: 360, scale: [1, 1.04, 1] }}
                        transition={{
                          rotate: { duration: 26, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                        }}
                      />
                      <motion.div
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/14"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
                      />

                      {visibleProperties.slice(0, markerPositions.length).map((property, index) => {
                        const position = markerPositions[index % markerPositions.length];
                        const isActive = selectedPropertyId === property.id;

                        return (
                          <motion.div
                            key={property.id}
                            initial={{ opacity: 0, scale: 0.6, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.035, type: 'spring', stiffness: 280, damping: 20 }}
                            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 hover:scale-110"
                            style={position}
                          >
                            <motion.button
                              type="button"
                              onClick={() => handleMarkerClick(property.id)}
                              whileHover={{ y: -4 }}
                              whileTap={{ scale: 0.92 }}
                              className="group relative flex cursor-pointer flex-col items-center"
                            >
                              {/* Pulsing effect behind pin */}
                              {isActive && (
                                <span className="absolute top-2.5 flex h-12 w-12 -translate-y-1/2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff744f] opacity-55"></span>
                                  <span className="relative inline-flex h-12 w-12 rounded-full bg-[#ff744f]/28"></span>
                                </span>
                              )}

                              <span
                                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-[18px] border shadow-[0_14px_34px_rgba(0,0,0,0.45)] transition-all duration-300 ${isActive
                                  ? 'scale-110 border-white bg-[#ff744f] text-white'
                                  : 'border-white/20 bg-[#1b120e]/84 text-white backdrop-blur-md group-hover:border-[#ff9b78] group-hover:bg-[#df472b]'
                                  }`}
                              >
                                <MapPinned size={21} className={isActive ? 'animate-bounce' : ''} />
                              </span>

                              <AnimatePresence>
                                {isActive && (
                                  <motion.span
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute top-16 block whitespace-nowrap rounded-2xl border border-[#ffd8c9] bg-white px-4 py-2 text-[11px] font-bold text-slate-900 shadow-2xl"
                                  >
                                    <span className="mb-0.5 block text-[9px] uppercase tracking-widest text-[#df472b]">₹{property.price?.toLocaleString() || 'Price on Request'}</span>
                                    {property.title.length > 22 ? `${property.title.slice(0, 22)}...` : property.title}
                                    <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-slate-100 bg-white"></div>
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </motion.div>
                        );
                      })}

                      {/* Bottom Info Bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 pointer-events-none">
                        <motion.div
                          key={selectedProperty?.id || 'default'}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="max-w-lg rounded-[26px] border border-white/12 bg-[#1b120e]/82 p-6 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-400">
                              Active Hotspot
                            </p>
                          </div>
                          <p className="mb-2 text-2xl font-black leading-tight tracking-tight text-white">
                            {selectedProperty?.title || 'Luxury Micro-Market'}
                          </p>
                          <p className="text-xs font-medium leading-relaxed text-slate-300">
                            {selectedProperty
                              ? `${selectedProperty.locality || selectedProperty.city || 'Premium Location'} is seeing high group-buying volume. Demand is up 24% this week.`
                              : 'Explore high-interest clusters and see where group buying is already active in your city.'}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-[32px] border border-slate-200 bg-white/50 backdrop-blur-sm px-6 py-20 text-center shadow-sm sm:px-10 max-w-3xl mx-auto">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400 shadow-inner">
                  <Search size={40} />
                </div>
                <h2 className="mt-8 text-3xl font-black tracking-tight text-slate-900">
                  No Exclusive Deals Found
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-slate-500">
                  We couldn't find any properties matching your exact criteria right now. Try adjusting your filters to discover more premium opportunities.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-8 rounded-xl bg-[#df472b] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#c63d23] hover:shadow-lg hover:shadow-[#df472b]/30 hover:-translate-y-1"
                >
                  View All Properties
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <LoginModal
        isOpen={isLocked}
        onClose={() => navigate('/')}
        onSuccess={() => {
          setMobileView('list');
        }}
      />
    </>
  );
};

export default Properties;
