import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin, ChevronDown, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEFAULT_BUDGET = {
  minPrice: 0,
  maxPrice: 150000000,
  step: 500000,
};

const FALLBACK_FILTER_OPTIONS = {
  cities: ['Gurugram', 'New Delhi', 'Noida', 'Greater Noida'],
  locations: [
    { value: 'Noida Extension', label: 'Noida Extension' },
    { value: 'Yamuna Expressway', label: 'Yamuna Expressway' },
    { value: 'Greater Noida', label: 'Greater Noida' },
  ],
  propertyTypes: [
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' },
  ],
  configurations: [
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4 BHK+' },
    { value: '5', label: '5 BHK+' },
  ],
  budget: DEFAULT_BUDGET,
  records: [],
};

const cleanValue = (value) => String(value || '').trim();

const uniqueValues = (items) => [...new Set(items.map(cleanValue).filter(Boolean))];

const normalizeOptionList = (items, fallback) => {
  const source = Array.isArray(items) && items.length > 0 ? items : fallback;
  const options = source
    .map((item) => {
      if (item && typeof item === 'object') {
        const value = cleanValue(item.value ?? item.label);
        const label = cleanValue(item.label ?? item.value);
        const city = cleanValue(item.city);
        return value ? { value, label: label || value, ...(city ? { city } : {}) } : null;
      }

      const value = cleanValue(item);
      return value ? { value, label: value } : null;
    })
    .filter(Boolean);

  return options.length > 0 ? options : fallback;
};

const normalizeCities = (cities) => {
  const normalized = uniqueValues(Array.isArray(cities) ? cities : []);
  return normalized.length > 0 ? normalized : FALLBACK_FILTER_OPTIONS.cities;
};

const normalizeBudget = (budget = {}) => {
  const minPrice = Number.isFinite(Number(budget.minPrice)) ? Number(budget.minPrice) : DEFAULT_BUDGET.minPrice;
  const maxPrice = Number.isFinite(Number(budget.maxPrice)) ? Number(budget.maxPrice) : DEFAULT_BUDGET.maxPrice;
  const step = Number.isFinite(Number(budget.step)) ? Number(budget.step) : DEFAULT_BUDGET.step;

  return {
    minPrice: Math.max(0, minPrice),
    maxPrice: Math.max(maxPrice, minPrice + step),
    step: Math.max(1, step),
  };
};

const normalizeFilterOptions = (options = {}) => ({
  cities: normalizeCities(options.cities),
  locations: normalizeOptionList(options.locations, FALLBACK_FILTER_OPTIONS.locations),
  propertyTypes: normalizeOptionList(options.propertyTypes, FALLBACK_FILTER_OPTIONS.propertyTypes),
  configurations: normalizeOptionList(options.configurations, FALLBACK_FILTER_OPTIONS.configurations),
  budget: normalizeBudget(options.budget),
  records: Array.isArray(options.records)
    ? options.records.map((item) => ({
      city: cleanValue(item.city),
      locality: cleanValue(item.locality),
      category: cleanValue(item.category),
      bhk: cleanValue(item.bhk),
    })).filter((item) => item.city || item.locality || item.category || item.bhk)
    : [],
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const clampBudgetRange = (range, bounds) => ({
  min: clamp(Number(range.min) || bounds.minPrice, bounds.minPrice, bounds.maxPrice - bounds.step),
  max: clamp(Number(range.max) || bounds.maxPrice, bounds.minPrice + bounds.step, bounds.maxPrice),
});

const formatCr = (price) => `${(Number(price || 0) / 10000000).toFixed(1)} CR`;

const SearchBar = () => {
  const [city, setCity] = useState('Greater Noida');
  const [search, setSearch] = useState('');
  const [bhk, setBhk] = useState('');
  const [budgetRange, setBudgetRange] = useState({
    min: DEFAULT_BUDGET.minPrice,
    max: DEFAULT_BUDGET.maxPrice,
  });
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [propertyType, setPropertyType] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [filterOptions, setFilterOptions] = useState(FALLBACK_FILTER_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const budgetTouchedRef = useRef(false);
  const MotionDiv = motion.div;

  const navigate = useNavigate();

  const budgetBounds = useMemo(
    () => normalizeBudget(filterOptions.budget),
    [filterOptions.budget]
  );

  const selectedConfigurationLabel = useMemo(
    () => filterOptions.configurations.find((item) => item.value === bhk)?.label || '',
    [bhk, filterOptions.configurations]
  );

  const locationScopedRecords = useMemo(() => filterOptions.records.filter((record) => {
    if (selectedLocality && record.locality !== selectedLocality) return false;
    if (selectedLocality && city && record.city !== city) return false;
    return true;
  }), [city, filterOptions.records, selectedLocality]);

  const scopedRecords = useMemo(() => locationScopedRecords.filter((record) => {
    if (propertyType && record.category !== propertyType) return false;
    return true;
  }), [locationScopedRecords, propertyType]);

  const visiblePropertyTypes = useMemo(() => {
    if (!selectedLocality || filterOptions.records.length === 0) return filterOptions.propertyTypes;

    const availableTypes = new Set(locationScopedRecords.map((record) => record.category).filter(Boolean));
    const nextOptions = filterOptions.propertyTypes.filter((item) => availableTypes.has(item.value));
    return nextOptions.length > 0 ? nextOptions : filterOptions.propertyTypes;
  }, [filterOptions.propertyTypes, filterOptions.records.length, locationScopedRecords, selectedLocality]);

  const visibleConfigurations = useMemo(() => {
    if ((!selectedLocality && !propertyType) || filterOptions.records.length === 0) {
      return filterOptions.configurations;
    }

    const availableBhks = new Set(scopedRecords.map((record) => record.bhk).filter(Boolean));
    const nextOptions = filterOptions.configurations.filter((item) => availableBhks.has(item.value));
    return nextOptions.length > 0 ? nextOptions : filterOptions.configurations;
  }, [filterOptions.configurations, filterOptions.records.length, propertyType, scopedRecords, selectedLocality]);

  const budgetLabel = `${formatCr(budgetRange.min)} - ${formatCr(budgetRange.max)}${budgetRange.max >= budgetBounds.maxPrice ? '+' : ''}`;
  const minPercent = ((budgetRange.min - budgetBounds.minPrice) / (budgetBounds.maxPrice - budgetBounds.minPrice)) * 100;
  const maxPercent = ((budgetRange.max - budgetBounds.minPrice) / (budgetBounds.maxPrice - budgetBounds.minPrice)) * 100;

  useEffect(() => {
    let ignore = false;

    const fetchFilterOptions = async () => {
      setOptionsLoading(true);
      try {
        const response = await api.get('/properties/filter-options');
        if (ignore) return;

        const nextOptions = normalizeFilterOptions(response.data?.options);
        const nextBudget = normalizeBudget(nextOptions.budget);

        setFilterOptions(nextOptions);
        setBudgetRange((currentRange) => {
          if (budgetTouchedRef.current) {
            const clampedRange = clampBudgetRange(currentRange, nextBudget);
            return clampedRange.min >= clampedRange.max
              ? { min: nextBudget.minPrice, max: nextBudget.maxPrice }
              : clampedRange;
          }

          return { min: nextBudget.minPrice, max: nextBudget.maxPrice };
        });
        setSelectedLocality((current) => (
          current && !nextOptions.locations.some((item) => item.value === current) ? '' : current
        ));
        setPropertyType((current) => (
          current && !nextOptions.propertyTypes.some((item) => item.value === current) ? '' : current
        ));
        setBhk((current) => (
          current && !nextOptions.configurations.some((item) => item.value === current) ? '' : current
        ));
      } catch (error) {
        console.error('Failed to fetch property filters:', error);
        if (!ignore) {
          setFilterOptions(FALLBACK_FILTER_OPTIONS);
        }
      } finally {
        if (!ignore) {
          setOptionsLoading(false);
        }
      }
    };

    fetchFilterOptions();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (propertyType && !visiblePropertyTypes.some((item) => item.value === propertyType)) {
      setPropertyType('');
    }
  }, [propertyType, visiblePropertyTypes]);

  useEffect(() => {
    if (bhk && !visibleConfigurations.some((item) => item.value === bhk)) {
      setBhk('');
    }
  }, [bhk, visibleConfigurations]);

  const markBudgetTouched = () => {
    budgetTouchedRef.current = true;
    setBudgetTouched(true);
  };

  const handleBudgetChange = (key, rawValue) => {
    const nextValue = Number(rawValue);
    markBudgetTouched();

    setBudgetRange((currentRange) => {
      if (key === 'min') {
        const min = clamp(nextValue, budgetBounds.minPrice, currentRange.max - budgetBounds.step);
        return { ...currentRange, min };
      }

      const max = clamp(nextValue, currentRange.min + budgetBounds.step, budgetBounds.maxPrice);
      return { ...currentRange, max };
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (city) params.append('city', city);
    if (selectedLocality) params.append('locality', selectedLocality);
    if (bhk) params.append('bhk', bhk);
    if (propertyType) params.append('category', propertyType);
    if (budgetTouched) {
      if (budgetRange.min > budgetBounds.minPrice) params.append('minPrice', String(budgetRange.min));
      if (budgetRange.max < budgetBounds.maxPrice) params.append('maxPrice', String(budgetRange.max));
    }
    navigate(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setBhk('');
    setPropertyType('');
    setSelectedLocality('');
    setBudgetRange({ min: budgetBounds.minPrice, max: budgetBounds.maxPrice });
    budgetTouchedRef.current = false;
    setBudgetTouched(false);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => setSearch(event.results[0][0].transcript);
    recognition.start();
  };

  const filterLabel = [
    selectedLocality,
    propertyType,
    selectedConfigurationLabel,
    budgetTouched ? 'Budget' : '',
  ].filter(Boolean).join(' | ') || 'Select Filter';

  return (
    <div className="relative z-40 mx-auto mb-14 mt-4 w-full max-w-[1180px] px-4 sm:px-6 md:mb-20 md:mt-6 lg:px-4">
      <div className="relative">
        <div className="grid overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.09)] md:min-h-[86px] md:grid-cols-[190px_minmax(0,1fr)_205px_184px] md:rounded-full lg:grid-cols-[260px_minmax(320px,1fr)_275px_238px]">
          <button
            type="button"
            onClick={() => {
              setShowCityMenu((prev) => !prev);
              setShowFilters(false);
            }}
            className="flex min-w-0 items-center justify-between border-b border-slate-200 px-5 py-4 text-left transition-colors hover:bg-[#fff8f4] md:h-full md:border-b-0 md:border-r md:px-6"
          >
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold leading-none text-[#202020]">City</span>
              <span className="mt-3 flex min-w-0 items-center gap-2 text-[16px] font-medium leading-none tracking-[-0.035em] text-[#df472b] md:text-[18px]">
                <MapPin size={19} fill="#df472b" strokeWidth={0} />
                <span className="truncate">{city}</span>
              </span>
            </span>
            <ChevronDown
              size={21}
              className={`shrink-0 text-[#1f1f1f] transition-transform ${showCityMenu ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="flex min-w-0 flex-col justify-center border-b border-slate-200 px-5 py-4 md:h-full md:border-b-0 md:border-r md:px-6">
            <label className="truncate text-[13px] font-semibold leading-none text-[#202020]">Find Your Dream Home</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowCityMenu(false)}
              placeholder="Search for Developers, Location, Projects"
              className="mt-3 h-6 w-full min-w-0 bg-transparent text-[16px] font-normal leading-none tracking-[-0.035em] text-slate-900 outline-none placeholder:truncate placeholder:text-[#6d747d] md:text-[18px]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setShowFilters((prev) => !prev);
              setShowCityMenu(false);
            }}
            className="flex min-w-0 flex-col justify-center border-b border-slate-200 px-5 py-4 text-left transition-colors hover:bg-[#fff8f4] md:h-full md:border-b-0 md:border-r md:px-6"
          >
            <span className="truncate text-[13px] font-semibold leading-none text-[#202020]">Inventory | Budget</span>
            <span className="mt-3 truncate text-[16px] font-normal leading-none tracking-[-0.035em] text-[#6d747d] md:text-[18px]">{filterLabel}</span>
          </button>

          <div className="flex min-w-0 bg-[#df472b] text-white md:h-full">
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-14 flex-1 items-center justify-center gap-2.5 px-5 text-base font-semibold tracking-[-0.035em] transition-colors hover:bg-[#ca4228] md:h-full md:text-[19px]"
            >
              Search <Search size={22} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`my-auto mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors md:mr-5 ${isListening ? 'animate-pulse bg-white/25' : 'hover:bg-white/20'}`}
              aria-label="Voice search"
            >
              <Mic size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCityMenu && (
            <MotionDiv
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 top-full z-[90] mt-2 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-[0_20px_55px_rgba(15,23,42,0.14)] sm:left-2 sm:right-auto sm:w-[175px]"
            >
              {filterOptions.cities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCity(item);
                    setSelectedLocality('');
                    setShowCityMenu(false);
                  }}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left text-[17px] font-normal tracking-[-0.04em] transition-colors ${city === item ? 'bg-slate-100 text-[#202020]' : 'text-[#202020] hover:bg-slate-50'}`}
                >
                  {item}
                </button>
              ))}
            </MotionDiv>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFilters && (
            <MotionDiv
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full z-[80] mt-3 overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_24px_65px_rgba(15,23,42,0.15)] md:rounded-[30px]"
            >
              <div className="grid lg:grid-cols-[320px_1fr]">
                <div className="border-b border-slate-100 px-5 py-5 md:px-6 md:py-6 lg:border-b-0 lg:border-r">
                  <h3 className="mb-4 flex items-center gap-2 text-[20px] font-semibold tracking-[-0.04em] text-[#111111]">
                    <MapPin size={20} /> Locations
                  </h3>
                  <div className="flex flex-wrap gap-2.5 lg:block lg:space-y-2.5">
                    {optionsLoading ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[14px] text-slate-500">
                        <Loader2 size={14} className="animate-spin" /> Loading
                      </span>
                    ) : filterOptions.locations.map((item) => (
                      <button
                        key={`${item.value}-${item.city || ''}-${item.label}`}
                        type="button"
                        onClick={() => {
                          const isSelected = selectedLocality === item.value && (!item.city || city === item.city);
                          setSelectedLocality(isSelected ? '' : item.value);
                          if (!isSelected && item.city) setCity(item.city);
                        }}
                        className={`rounded-full px-4 py-2 text-[15px] font-normal tracking-[-0.035em] transition-colors ${selectedLocality === item.value && (!item.city || city === item.city) ? 'bg-[#df472b] text-white' : 'bg-slate-100 text-[#202020] hover:bg-orange-50 hover:text-[#df472b]'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="px-5 py-5 md:px-6 md:py-6">
                    <h3 className="mb-3 text-[20px] font-semibold tracking-[-0.04em] text-[#111111]">Property Types</h3>
                    <div className="mb-6 flex flex-wrap gap-2">
                      {visiblePropertyTypes.map((item) => (
                        <button
                          key={`${item.value}-${item.label}`}
                          type="button"
                          onClick={() => setPropertyType((current) => (current === item.value ? '' : item.value))}
                          className={`rounded-full px-4 py-2 text-[14px] tracking-[-0.035em] transition-colors ${propertyType === item.value ? 'bg-[#df472b] text-white' : 'bg-slate-100 text-[#202020] hover:bg-orange-50 hover:text-[#df472b]'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <h3 className="mb-3 text-[20px] font-semibold tracking-[-0.04em] text-[#111111]">Configuration</h3>
                    <div className="flex flex-wrap gap-2">
                      {visibleConfigurations.map((item) => (
                        <button
                          key={`${item.value}-${item.label}`}
                          type="button"
                          onClick={() => setBhk((current) => (current === item.value ? '' : item.value))}
                          className={`rounded-full px-4 py-2 text-[14px] tracking-[-0.035em] transition-colors ${bhk === item.value ? 'bg-[#df472b] text-white' : 'bg-slate-100 text-[#202020] hover:bg-orange-50 hover:text-[#df472b]'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 px-5 py-4 md:px-6">
                    <h3 className="mb-3 text-[20px] font-semibold tracking-[-0.04em] text-[#111111]">Budget</h3>
                    <div className="relative mb-4 h-9 w-full pt-3" aria-label="Budget range">
                      <span className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-100" />
                      <span
                        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#df472b]"
                        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                      />
                      <input
                        type="range"
                        min={budgetBounds.minPrice}
                        max={budgetBounds.maxPrice}
                        step={budgetBounds.step}
                        value={budgetRange.min}
                        onChange={(event) => handleBudgetChange('min', event.target.value)}
                        className="search-budget-range"
                        aria-label="Minimum budget"
                      />
                      <input
                        type="range"
                        min={budgetBounds.minPrice}
                        max={budgetBounds.maxPrice}
                        step={budgetBounds.step}
                        value={budgetRange.max}
                        onChange={(event) => handleBudgetChange('max', event.target.value)}
                        className="search-budget-range"
                        aria-label="Maximum budget"
                      />
                    </div>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <button
                        type="button"
                        onClick={markBudgetTouched}
                        className={`w-fit rounded-2xl border px-6 py-2 text-[16px] font-medium tracking-[0.02em] ${budgetTouched ? 'border-orange-200 bg-orange-50 text-[#df472b]' : 'border-orange-100 bg-orange-50/70 text-[#df472b]'}`}
                      >
                        {budgetLabel}
                      </button>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-6 text-[16px] font-medium tracking-[-0.035em] text-[#202020] hover:bg-white"
                        >
                          clear all
                        </button>
                        <button
                          type="button"
                          onClick={handleSearch}
                          className="flex h-12 items-center gap-2 rounded-xl bg-[#df472b] px-6 text-[16px] font-semibold tracking-[-0.035em] text-white hover:bg-[#ca4228]"
                        >
                          Search <Search size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
