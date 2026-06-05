import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  Building,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coffee,
  GitCompareArrows,
  GraduationCap,
  Heart,
  Hospital,
  Hotel,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  Phone,
  Play,
  Search as SearchIcon,
  Share2,
  ShieldCheck,
  Utensils,
  Users,
  X,
  Zap,
} from 'lucide-react';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import SearchPage from './Search';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1400';
const API_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

const tabs = [
  { id: 'property-details', label: 'Property Details' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'layout-plan', label: 'Layout Plan' },
  { id: 'emi-calculator', label: 'EMI Calculator' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'location', label: 'Location' },
  { id: 'about-developer', label: 'About Developer' },
];

const getImageUrl = (image) => {
  if (!image) return '';
  const imageUrl = typeof image === 'string'
    ? image
    : image.url || image.src || image.imageUrl || image.image || image.blueprintImage || image.blueprintUrl || image.planImage || image.planUrl || '';
  if (!imageUrl) return '';
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('/')) return `${API_ORIGIN}${imageUrl}`;
  if (imageUrl.startsWith('uploads/')) return `${API_ORIGIN}/${imageUrl}`;
  return imageUrl;
};

const buildGallery = (property) => {
  const images = Array.isArray(property?.images)
    ? property.images.map(getImageUrl).filter(Boolean)
    : [];
  const featuredImage = property?.thumbnailUrl || property?.image || property?.imageUrl;
  return [...new Set([getImageUrl(featuredImage), ...images].filter(Boolean))];
};

const formatArea = (area) => {
  const numericArea = Number(area);
  if (!Number.isFinite(numericArea) || numericArea <= 0) return 'On request';
  return `${numericArea.toLocaleString('en-IN', { maximumFractionDigits: 2 })} sq.ft.`;
};

const formatAcres = (area) => {
  const numericArea = Number(area);
  if (!Number.isFinite(numericArea) || numericArea <= 0) return 'On request';
  return `${numericArea.toLocaleString('en-IN', { maximumFractionDigits: 2 })} acres`;
};

const formatPlanArea = (area, fallbackArea) => {
  const candidate = area || fallbackArea;
  if (!candidate) return '';
  const text = String(candidate).trim();
  const numericArea = Number(text.replace(/,/g, ''));
  if (Number.isFinite(numericArea) && numericArea > 0 && /^\d[\d,]*(\.\d+)?$/.test(text)) {
    return formatArea(numericArea);
  }
  return text;
};

const formatPlanPriceValue = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const text = String(value).trim();
  const numericValue = Number(text.replace(/,/g, ''));
  if (Number.isFinite(numericValue) && numericValue > 0 && /^\d[\d,]*(\.\d+)?$/.test(text)) {
    return formatCurrency(numericValue);
  }
  return text;
};

const formatPlanPrice = (plan, fallbackPrice) => {
  if (!plan || typeof plan === 'string') {
    return fallbackPrice > 0 ? formatCurrency(fallbackPrice) : '';
  }

  const directPrice = plan.priceLabel || plan.priceText || plan.priceRange || plan.displayPrice;
  if (directPrice) return String(directPrice).trim();

  const priceFrom = plan.price ?? plan.minPrice ?? plan.priceFrom;
  const priceTo = plan.priceTo ?? plan.maxPrice ?? plan.priceTill;
  const formattedFrom = formatPlanPriceValue(priceFrom);
  const formattedTo = formatPlanPriceValue(priceTo);

  if (formattedFrom && formattedTo && formattedFrom !== formattedTo) {
    return `${formattedFrom} - ${formattedTo}`;
  }

  return formattedFrom || formattedTo || (fallbackPrice > 0 ? formatCurrency(fallbackPrice) : '');
};

const getPlanLabel = (plan, fallbackLabel) => {
  if (!plan || typeof plan === 'string') return fallbackLabel;
  if (plan.label || plan.title || plan.name || plan.configuration) {
    return plan.label || plan.title || plan.name || plan.configuration;
  }
  return plan.bhk ? `${plan.bhk} BHK` : fallbackLabel;
};

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const formatSavingsShort = (value) => {
  const savings = Number(value);
  if (!Number.isFinite(savings) || savings <= 0) return '0';
  if (savings >= 10000000) return `${(savings / 10000000).toFixed(savings % 10000000 ? 1 : 0)} Cr`;
  if (savings >= 100000) return `${Math.round(savings / 100000)} L`;
  return formatCurrency(savings);
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
};

const calculateMonthlyEmi = (principal, annualRate = 8.5, tenureYears = 20) => {
  const amount = Number(principal);
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  const emi = (amount * monthlyRate * ((1 + monthlyRate) ** months)) / (((1 + monthlyRate) ** months) - 1);
  return Math.round(emi);
};

const formatCalculatorAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Rs 0';
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(2)} Crore`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(2)} Lacs`;
  return `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const getRangePercent = (value, min, max) => {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
};

const DetailStat = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl border border-[#f1d6ca] bg-white px-4 py-2.5 shadow-[0_10px_24px_rgba(62,35,22,0.05)]">
    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff0ea] text-[#df472b]">
      <Icon size={15} />
    </div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b8a7d]">{label}</p>
    <p className="mt-0.5 text-base font-bold text-[#15110f]">{value}</p>
    {sub ? <p className="mt-0.5 text-[11px] font-medium text-[#8b7d72]">{sub}</p> : null}
  </div>
);

const InfoTile = ({ label, value }) => (
  <div className="rounded-2xl border border-[#f0d8ce] bg-[#fffaf6] px-4 py-3">
    <p className="text-[12px] font-semibold tracking-normal text-[#8f7a6f]">
      {label ? `${label.charAt(0).toUpperCase()}${label.slice(1).toLowerCase()}` : ''}
    </p>
    <p className="mt-1 break-words text-sm font-bold text-[#19110d]">{value}</p>
  </div>
);

const getNearbyIcon = (label = '') => {
  const key = label.toLowerCase();
  if (key.includes('school')) return GraduationCap;
  if (key.includes('hospital')) return Hospital;
  if (key.includes('hotel')) return Hotel;
  if (key.includes('cafe')) return Coffee;
  if (key.includes('restaurant')) return Utensils;
  return Building;
};

const FloorPlanIllustration = () => (
  <svg
    viewBox="0 0 640 390"
    preserveAspectRatio="none"
    role="img"
    aria-label="Indicative apartment floor plan"
    className="h-[232px] w-full max-w-[520px] drop-shadow-[0_12px_24px_rgba(223,71,43,0.16)]"
  >
    <defs>
      <radialGradient id="floorPlanGlow" cx="50%" cy="48%" r="68%">
        <stop offset="0%" stopColor="#fff7f2" />
        <stop offset="62%" stopColor="#fff0e9" />
        <stop offset="100%" stopColor="#fffaf6" />
      </radialGradient>
    </defs>
    <path
      d="M92 72H468C520 72 556 108 556 156V248C556 273 543 296 522 310V348H92V276H142C171 276 188 295 188 324V348H260V300H414V348H486V262H556"
      fill="url(#floorPlanGlow)"
      stroke="#df472b"
      strokeWidth="10"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M92 72V224H164V250M92 120H154V72M154 72V124H204V72M204 72V166H252M252 72V166H374M444 72V168H474M444 168H512M92 224H250V278H414M320 224V300M320 240H384M320 260H384M320 280H384M486 262L536 348M536 262L486 348"
      fill="none"
      stroke="#df472b"
      strokeWidth="10"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M142 276C171 276 188 295 188 324M164 224V250M250 224H310M414 300H486"
      fill="none"
      stroke="#df472b"
      strokeWidth="7"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </svg>
);

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, hasActiveSubscription } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('property-details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeLayoutPlanId, setActiveLayoutPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInComparison, setIsInComparison] = useState(false);
  const [liveMembersCount, setLiveMembersCount] = useState(0);
  const [liveGroupStatus, setLiveGroupStatus] = useState('OPEN');
  const [emiLoanAmount, setEmiLoanAmount] = useState(8000000);
  const [emiInterestRate, setEmiInterestRate] = useState(6.75);
  const [emiTenureYears, setEmiTenureYears] = useState(20);
  const [activeNearbyCategory, setActiveNearbyCategory] = useState('school');
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);
  const [comparisonItems, setComparisonItems] = useState([]);
  const [compareProperties, setCompareProperties] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [addingCompareId, setAddingCompareId] = useState('');
  const [compareSearch, setCompareSearch] = useState('');
  const detailContentRef = useRef(null);

  const fetchProperty = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    try {
      const response = await api.get(`/properties/${id}`);
      if (response.data.success) {
        const nextProperty = response.data.property;
        const primaryGroup = nextProperty.groups?.[0];
        const activeMembers = primaryGroup?.members?.filter((member) => member.isActive !== false) || [];

        setProperty(nextProperty);
        setLiveMembersCount(primaryGroup?._count?.members ?? activeMembers.length);
        setLiveGroupStatus(primaryGroup?.status || 'OPEN');

        if (user) {
          const profile = await api.get('/users/profile');
          if (profile.data.success) {
            setIsWishlisted(profile.data.user.wishlist?.some((item) => item.propertyId === id));
            setIsInComparison(profile.data.user.comparisons?.some((item) => item.propertyId === id));
          }
        }
      }
    } catch {
      toast.error('Property not found');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const handleJoinGroup = useCallback(async () => {
    if (!user) {
      toast.error('Please login to join the group');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!hasActiveSubscription) {
      toast.error('Active subscription required');
      navigate('/subscriptions', { state: { from: location, action: 'JOIN_GROUP', propertyId: id } });
      return;
    }

    setJoining(true);
    try {
      const response = await api.post(`/groups/join/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchProperty();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  }, [fetchProperty, hasActiveSubscription, id, location, navigate, user]);

  const handleWishlist = useCallback(async () => {
    if (!user) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/users/wishlist', { propertyId: id });
      if (response.data.success) {
        setIsWishlisted(response.data.action === 'added');
        toast.success(response.data.message);
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  }, [id, navigate, user]);

  const fetchComparisonItems = useCallback(async () => {
    const response = await api.get('/users/comparison');
    const selectedProperties = response.data.success
      ? response.data.comparison.map((item) => item.property).filter(Boolean)
      : [];

    setComparisonItems(selectedProperties);
    setIsInComparison(selectedProperties.some((item) => item.id === id));
    return selectedProperties;
  }, [id]);

  const fetchCompareProperties = useCallback(async () => {
    const response = await api.get('/properties?limit=80');
    const properties = response.data.success ? response.data.properties || [] : [];
    setCompareProperties(properties);
    return properties;
  }, []);

  const ensureCurrentInComparison = useCallback(async (selectedProperties) => {
    if (selectedProperties.some((item) => item.id === id)) return selectedProperties;

    const response = await api.post('/users/comparison', { propertyId: id });
    if (response.data.success && response.data.action === 'added') {
      setIsInComparison(true);
      return fetchComparisonItems();
    }

    return selectedProperties;
  }, [fetchComparisonItems, id]);

  const handleCompare = useCallback(async () => {
    if (!user) {
      toast.error('Please login to compare');
      navigate('/login');
      return;
    }

    setShowCompareDrawer(true);
    setComparisonLoading(true);
    try {
      const [selectedProperties] = await Promise.all([
        fetchComparisonItems(),
        fetchCompareProperties(),
      ]);
      await ensureCurrentInComparison(selectedProperties);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to open comparison');
    } finally {
      setComparisonLoading(false);
    }
  }, [ensureCurrentInComparison, fetchCompareProperties, fetchComparisonItems, navigate, user]);

  const handleComparePropertyToggle = useCallback(async (propertyId) => {
    if (!user) {
      toast.error('Please login to compare');
      navigate('/login');
      return;
    }

    setAddingCompareId(propertyId);
    try {
      const response = await api.post('/users/comparison', { propertyId });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchComparisonItems();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Comparison limit reached');
    } finally {
      setAddingCompareId('');
    }
  }, [fetchComparisonItems, navigate, user]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/properties/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: property?.title || 'Property', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      }
    } catch {
      toast.error('Unable to share right now');
    }
  }, [id, property?.title]);

  const galleryImages = useMemo(() => buildGallery(property), [property]);
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || fallbackImage;
  const selectedCompareIds = useMemo(
    () => new Set(comparisonItems.map((item) => item.id)),
    [comparisonItems]
  );
  const availableCompareProperties = useMemo(() => {
    const searchTerm = compareSearch.trim().toLowerCase();

    return compareProperties
      .filter((item) => item.id && !selectedCompareIds.has(item.id))
      .filter((item) => {
        if (!searchTerm) return true;
        return [item.title, item.city, item.locality, item.developer?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm));
      });
  }, [compareProperties, compareSearch, selectedCompareIds]);

  useEffect(() => {
    fetchProperty(true);
    window.scrollTo(0, 0);
  }, [fetchProperty]);

  useEffect(() => {
    if (activeImageIndex >= galleryImages.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, galleryImages.length]);

  useEffect(() => {
    if (galleryImages.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveImageIndex((previousIndex) => (previousIndex + 1) % galleryImages.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [galleryImages.length]);

  useEffect(() => {
    const groupId = property?.groups?.[0]?.id;
    if (!socket || !groupId) return undefined;

    socket.emit('join-group-room', groupId);
    socket.on('member-joined', () => fetchProperty());
    socket.on('group-full', (data) => {
      toast.success(data.message, { duration: 6000 });
      fetchProperty();
    });

    return () => {
      socket.emit('leave-group-room', groupId);
      socket.off('member-joined');
      socket.off('group-full');
    };
  }, [fetchProperty, property?.groups, socket]);

  useEffect(() => {
    const pendingJoin = location.state?.action === 'JOIN_GROUP' && location.state?.propertyId === id;
    if (user && hasActiveSubscription && pendingJoin) {
      handleJoinGroup();
      window.history.replaceState({}, document.title);
    }
  }, [handleJoinGroup, hasActiveSubscription, id, location.state, user]);

  useEffect(() => {
    const nextTargetPrice = Number(property?.price) || 0;
    if (nextTargetPrice > 0) {
      setEmiLoanAmount(Math.round(nextTargetPrice * 0.8));
    }
  }, [property?.price]);

  useEffect(() => {
    if (!property) return undefined;

    let ticking = false;

    const getScrollContainer = () => (
      window.matchMedia('(min-width: 1024px)').matches ? detailContentRef.current : null
    );

    const updateActiveTabFromScroll = () => {
      const sectionElements = tabs
        .map((tab) => document.getElementById(`section-${tab.id}`))
        .filter(Boolean);

      if (!sectionElements.length) return;

      const scrollContainer = getScrollContainer();
      const containerRect = scrollContainer?.getBoundingClientRect();
      const viewportTop = containerRect?.top || 0;
      const viewportHeight = scrollContainer?.clientHeight || window.innerHeight;
      const markerLine = viewportTop + Math.min(180, viewportHeight * 0.34);

      let nextTabId = sectionElements[0].id.replace('section-', '');

      sectionElements.forEach((sectionElement) => {
        if (sectionElement.getBoundingClientRect().top <= markerLine) {
          nextTabId = sectionElement.id.replace('section-', '');
        }
      });

      setActiveTab((currentTab) => (currentTab === nextTabId ? currentTab : nextTabId));
    };

    const requestSync = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveTabFromScroll();
        ticking = false;
      });
    };

    const scrollContainer = getScrollContainer();
    scrollContainer?.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);
    window.setTimeout(updateActiveTabFromScroll, 80);

    return () => {
      scrollContainer?.removeEventListener('scroll', requestSync);
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
    };
  }, [property?.id]);

  if (loading || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#fffaf6] text-[#df472b]">
        <Loader2 size={46} className="animate-spin" />
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b7e72]">Loading Property</p>
      </div>
    );
  }

  const userGroup = property.groups?.find((group) =>
    group.members?.some((member) => member.userId === user?.id && member.isActive !== false)
  );
  const activeGroup = userGroup || property.groups?.[0];
  const groupMembers = activeGroup?.members?.filter((member) => member.isActive !== false) || [];
  const isMember = Boolean(userGroup);
  const maxMembers = Number(activeGroup?.maxMembers || property.targetGroupSize || 5);
  const currentMembers = Math.min(Math.max(liveMembersCount, groupMembers.length), maxMembers);
  const targetPrice = Number(property.price) || 0;
  const originalPrice = Number(property.originalPrice || property.developerPrice) || targetPrice;
  const savings = Math.max(originalPrice - targetPrice, 0);
  const discountPercent = originalPrice > targetPrice ? Math.round((savings / originalPrice) * 100) : 0;
  const displayLocation = [property.locality, property.city, property.state].filter(Boolean).join(', ') || property.address || 'Prime Location';
  const nearbyArea = property.locality || property.city || 'this project';
  const fallbackNearbyPlaceCategories = [
    {
      id: 'school',
      label: 'School',
      icon: GraduationCap,
      places: [
        { name: `${nearbyArea} Public School`, address: `Near ${displayLocation}`, distance: '0.8 km', time: '4 mins drive' },
        { name: 'Modern Scholars Academy', address: `${property.city || nearbyArea} education zone`, distance: '1.4 km', time: '6 mins drive' },
      ],
    },
    {
      id: 'restaurant',
      label: 'Restaurant',
      icon: Utensils,
      places: [
        { name: 'Urban Tadka Restaurant', address: `Main market, ${nearbyArea}`, distance: '0.5 km', time: '2 mins walk' },
        { name: 'The Hunger Hub', address: `Near ${displayLocation}`, distance: '0.9 km', time: '4 mins drive' },
      ],
    },
    {
      id: 'hospital',
      label: 'Hospital',
      icon: Hospital,
      places: [
        { name: `${nearbyArea} Care Hospital`, address: `Healthcare corridor, ${nearbyArea}`, distance: '1.1 km', time: '5 mins drive' },
        { name: 'City Multispeciality Clinic', address: `Near ${property.city || nearbyArea}`, distance: '1.8 km', time: '7 mins drive' },
      ],
    },
    {
      id: 'hotels',
      label: 'Hotels',
      icon: Hotel,
      places: [
        { name: 'Park View Hotel', address: `Business district, ${nearbyArea}`, distance: '1.2 km', time: '5 mins drive' },
        { name: 'The Avenue Stay', address: `Near ${displayLocation}`, distance: '2.0 km', time: '8 mins drive' },
      ],
    },
    {
      id: 'cafe',
      label: 'Cafe',
      icon: Coffee,
      places: [
        { name: 'JAS Chatori Cafe', address: `Block market, ${nearbyArea}`, distance: '0.2 km', time: '2 mins walk' },
        { name: 'Brew Street Cafe', address: `Near ${displayLocation}`, distance: '0.6 km', time: '3 mins drive' },
      ],
    },
  ];
  const nearbyPlaceGroups = toList(property.nearbyPlaces).reduce((groups, place) => {
    const category = typeof place === 'string' ? 'Nearby' : place.category || 'Nearby';
    const key = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const nextPlace = typeof place === 'string'
      ? { name: place, address: displayLocation, distance: '', time: '' }
      : place;

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        label: category,
        icon: getNearbyIcon(category),
        places: [],
      });
    }

    groups.get(key).places.push({
      name: nextPlace.name || category,
      address: nextPlace.address || displayLocation,
      distance: nextPlace.distance || 'Nearby',
      time: nextPlace.time || 'Convenient access',
    });

    return groups;
  }, new Map());
  const nearbyPlaceCategories = nearbyPlaceGroups.size ? [...nearbyPlaceGroups.values()] : fallbackNearbyPlaceCategories;
  const activeNearbyData = nearbyPlaceCategories.find((category) => category.id === activeNearbyCategory) || nearbyPlaceCategories[0];
  const ActiveNearbyIcon = activeNearbyData.icon;
  const propertyStatusLabel = property.propertyStatus?.name || property.status?.replace(/_/g, ' ') || 'Verified Deal';
  const possessionLabel = property.possessionStatus || property.possession || formatDateLabel(property.possessionDate) || formatDateLabel(property.expiryDate) || propertyStatusLabel;
  const developerName = property.developer?.name || 'Institutional Developer';
  const developerLogo = property.developerLogo || property.developer?.logo || property.developer?.logoUrl;
  const developerDescription = property.developerDescription || property.developer?.description || 'Developer details will be updated soon.';
  const couponDownloads = Number(property.couponDownloads || property.downloadCount || property.trackingCount) || currentMembers;
  const joinedMemberRows = groupMembers;
  const configurationLabel = property.bhk ? `${property.bhk} BHK` : property.category || 'Property';
  const amenities = toList(property.amenities);
  const floorPlanItems = toList(property.floorPlans);
  const rawLayoutPlan = property.layoutPlanUrl || property.floorPlanUrl || property.floorPlan || property.layoutPlan;
  const layoutPlanUrl = getImageUrl(rawLayoutPlan);
  const masterPlanImage = getImageUrl(property.masterPlanImage);
  const useSinglePlanFallbacks = floorPlanItems.length <= 1;
  const normalizedFloorPlans = floorPlanItems.map((plan, index) => {
    const fallbackImageUrl = useSinglePlanFallbacks && index === 0 ? layoutPlanUrl : '';
    return {
      id: `floor-plan-${index}`,
      type: 'floor',
      label: getPlanLabel(plan, configurationLabel),
      priceLabel: formatPlanPrice(plan, useSinglePlanFallbacks ? targetPrice : 0),
      areaLabel: formatPlanArea(
        typeof plan === 'string' ? '' : plan?.area || plan?.superArea || plan?.carpetArea || plan?.size,
        useSinglePlanFallbacks ? property.area : ''
      ),
      imageUrl: getImageUrl(plan) || fallbackImageUrl,
    };
  });

  if (!normalizedFloorPlans.length && layoutPlanUrl) {
    normalizedFloorPlans.push({
      id: 'floor-plan-primary',
      type: 'floor',
      label: configurationLabel,
      priceLabel: targetPrice > 0 ? formatCurrency(targetPrice) : '',
      areaLabel: formatArea(property.area),
      imageUrl: layoutPlanUrl,
    });
  }

  const layoutPlanItems = [
    {
      id: 'master-plan',
      type: 'master',
      label: 'Master Plan',
      priceLabel: '',
      areaLabel: '',
      imageUrl: masterPlanImage,
    },
    ...normalizedFloorPlans,
  ];
  const defaultLayoutPlan = normalizedFloorPlans[0] || layoutPlanItems[0];
  const activeLayoutPlan = layoutPlanItems.find((item) => item.id === activeLayoutPlanId) || defaultLayoutPlan;
  const activeLayoutIndex = Math.max(layoutPlanItems.findIndex((item) => item.id === activeLayoutPlan?.id), 0);
  const areaPlanItems = normalizedFloorPlans.filter((item) => item.areaLabel);
  const locationUrl = property.locationUrl || '';
  const maxEmiLoanAmount = Math.max(130000000, targetPrice, originalPrice, emiLoanAmount);
  const boundedEmiLoanAmount = Math.min(Math.max(emiLoanAmount, 100000), maxEmiLoanAmount);
  const estimatedEmi = calculateMonthlyEmi(boundedEmiLoanAmount, emiInterestRate, emiTenureYears);
  const totalPayable = estimatedEmi * emiTenureYears * 12;
  const interestPayable = Math.max(totalPayable - boundedEmiLoanAmount, 0);
  const emiRangeControls = [
    {
      label: 'Loan Amount',
      value: boundedEmiLoanAmount,
      display: formatCalculatorAmount(boundedEmiLoanAmount),
      min: 100000,
      max: maxEmiLoanAmount,
      step: 100000,
      minLabel: 'Rs 1 Lac',
      maxLabel: formatCalculatorAmount(maxEmiLoanAmount),
      onChange: setEmiLoanAmount,
    },
    {
      label: 'Interest Rate (% P.A.)',
      value: emiInterestRate,
      display: `${emiInterestRate.toFixed(2)}%`,
      min: 1,
      max: 30,
      step: 0.05,
      minLabel: '1%',
      maxLabel: '30%',
      onChange: setEmiInterestRate,
    },
    {
      label: 'Loan Tenure',
      value: emiTenureYears,
      display: `${emiTenureYears} Years`,
      min: 1,
      max: 30,
      step: 1,
      minLabel: '1 Year',
      maxLabel: '30 Years',
      onChange: setEmiTenureYears,
    },
  ];
  const propertyDetailRows = [
    ['Project Type', property.category || 'Residential'],
    ['Total Units', property.unitCount ? `${property.unitCount} units` : 'On request'],
    ['Configuration', configurationLabel],
    ['Carpet Area', formatArea(property.area)],
    ['Property Area', formatAcres(property.propertyAreaAcres)],
    ['RERA ID', property.reraId || 'On request'],
    ['Status', propertyStatusLabel],
    ['Possession', possessionLabel],
    ['Possession Date', formatDateLabel(property.possessionDate) || 'On request'],
    ['Launch Date', formatDateLabel(property.launchDate) || 'On request'],
    ['Developer', developerName],
    ['City', property.city || 'On request'],
    ['Locality', property.locality || 'On request'],
  ];
  const customHighlightItems = toList(property.highlights);
  const highlightItems = customHighlightItems.length ? customHighlightItems.map((item) => {
    if (Array.isArray(item)) return item;
    if (typeof item === 'object') return [item.title || item.label || 'Highlight', item.description || item.value || ''];
    const [title, description] = String(item).split('|').map((part) => part.trim());
    return [title, description || ''];
  }) : [
    [
      discountPercent > 0 ? `${discountPercent}% Developer Discount` : 'Developer Direct Deal',
      savings > 0 ? `Save up to ${formatSavingsShort(savings)} against developer price.` : 'Coordinate directly for best available pricing.',
    ],
    [`${currentMembers}/${maxMembers} Group Progress`, 'Join other buyers and improve negotiation strength.'],
    [propertyStatusLabel, 'Verified opportunity with transparent group buying workflow.'],
    ['No Middlemen', 'Bulk-purchase coordination directly from the developer.'],
  ];
  const customSpecificationRows = toList(property.specifications);
  const specificationRows = customSpecificationRows.length ? customSpecificationRows.map((item, index) => {
    if (Array.isArray(item)) return item;
    if (typeof item === 'object') return [item.label || item.title || `Specification ${index + 1}`, item.value || item.description || 'Available'];
    const [label, value] = String(item).split('|').map((part) => part.trim());
    return value ? [label, value] : [`Specification ${index + 1}`, label];
  }) : [
    ['Target Price', formatCurrency(targetPrice)],
    ['Developer Price', formatCurrency(originalPrice)],
    ['Savings', savings > 0 ? formatCurrency(savings) : 'On request'],
    ['Group Size', `${maxMembers} buyers`],
    ['Current Members', `${currentMembers} joined`],
    ['Coupon Downloads', `${couponDownloads} downloads`],
    ['Property ID', property.id || 'On request'],
    ['Display Section', property.displaySection?.replace(/_/g, ' ') || 'Featured'],
  ];
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'Property Details';

  const moveImage = (direction) => {
    setActiveImageIndex((currentIndex) => {
      const totalImages = galleryImages.length;
      if (totalImages < 2) return 0;
      return (currentIndex + direction + totalImages) % totalImages;
    });
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    window.requestAnimationFrame(() => {
      const targetSection = document.getElementById(`section-${tabId}`);
      const scrollContainer = detailContentRef.current;
      const shouldUseInnerScroll = window.matchMedia('(min-width: 1024px)').matches && scrollContainer && targetSection;

      if (shouldUseInnerScroll) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const targetTop = targetSection.getBoundingClientRect().top;
        scrollContainer.scrollTo({
          top: scrollContainer.scrollTop + targetTop - containerTop - 8,
          behavior: 'smooth',
        });
        return;
      }

      targetSection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#fffdfa] pt-24 text-[#111111]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(210, 198, 188, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(210, 198, 188, 0.22) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div className="mx-auto w-[90%] max-w-[90rem] pb-20">
        <div className="hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#ead7cd] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#4d4038] shadow-[0_12px_26px_rgba(62,35,22,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#df472b]"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <button
            type="button"
            onClick={handleCompare}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] shadow-[0_12px_26px_rgba(62,35,22,0.08)] transition-all hover:-translate-y-0.5 ${
              isInComparison
                ? 'border-[#df472b] bg-[#df472b] text-white'
                : 'border-[#ead7cd] bg-white text-[#4d4038] hover:border-[#df472b]'
            }`}
          >
            <GitCompareArrows size={15} />
            Compare
          </button>
        </div>

        <section className="grid min-h-[calc(100vh-145px)] items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative mx-auto flex h-full w-full max-w-[620px] flex-col justify-center lg:min-h-[510px]"
          >
            <div className="absolute -left-6 top-7 hidden h-24 w-24 rounded-full bg-[#ffebe4] blur-2xl lg:block" />
            <div className="absolute -bottom-6 right-10 hidden h-32 w-32 rounded-full bg-[#e9fff0] blur-2xl lg:block" />

            <div className="relative flex min-h-[494px] flex-col overflow-hidden rounded-[34px] border border-[#efd9cf] bg-white/88 p-4 text-left shadow-[0_28px_70px_rgba(62,35,22,0.10)] backdrop-blur lg:min-h-[540px] lg:p-4 xl:h-auto">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[90px] bg-[#fff0ea]" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe9d3] bg-[#f5fff7] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1a9b34]">
                    <ShieldCheck size={14} />
                    {propertyStatusLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#17110e] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    Active Pick
                  </span>
                  <button
                    type="button"
                    onClick={handleCompare}
                    className="inline-flex items-center gap-2 rounded-full border border-[#ffd0c4] bg-[#fff2ee] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#df472b] transition-all hover:-translate-y-0.5 hover:border-[#df472b] hover:bg-white"
                  >
                    <GitCompareArrows size={13} />
                    Compare
                  </button>
                </div>

                <h1 className="mt-3 text-[2rem] font-semibold leading-[1] tracking-[-0.015em] text-[#111111] md:text-[2.65rem] lg:text-[2.95rem]">
                  {property.title}
                </h1>

                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-2xl border border-[#ead7cd] bg-[#fffaf6] px-4 py-2 text-sm font-semibold text-[#30251f] shadow-[0_12px_26px_rgba(62,35,22,0.05)]">
                  <MapPin size={17} className="shrink-0 text-[#df472b]" />
                  <span className="line-clamp-1">{displayLocation}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#ffb49f] bg-[#fff1ec] px-4 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a84735]">Configuration</p>
                    <p className="mt-1 text-xl font-semibold text-[#df472b]">{configurationLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-[#ead7cd] bg-white px-4 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#867469]">Super Area</p>
                    <p className="mt-1 text-lg font-semibold text-[#111111]">{formatArea(property.area)}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-[24px] border border-[#efd9cf] bg-[linear-gradient(135deg,#fff8f5_0%,#ffffff_55%,#fff0ea_100%)] p-3.5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9c7467]">Target Price</p>
                      <p className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#111111]">{formatCurrency(targetPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-[#df472b]">Developer price</p>
                      <p className="mt-1 text-base font-semibold text-[#9c9691] line-through">{formatCurrency(originalPrice)}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    {savings > 0 ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#e9fff0] px-3 py-2 text-sm font-semibold text-[#239a31]">
                        <Zap size={15} />
                        Up to {formatSavingsShort(savings)} off
                      </span>
                    ) : null}
                    {discountPercent > 0 ? (
                      <span className="inline-flex rounded-full bg-[#df472b] px-3 py-2 text-sm font-semibold text-white">
                        {discountPercent}% off
                      </span>
                    ) : null}
                    <span className="inline-flex rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#6c5d53]">
                      {currentMembers}/{maxMembers} buyers joined
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleJoinGroup}
                  disabled={joining || liveGroupStatus === 'FULL' || isMember}
                  className="mt-3 flex h-[50px] w-full items-center justify-center rounded-2xl bg-[#e7472c] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_34px_rgba(223,71,43,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#cf3d24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joining ? <Loader2 size={24} className="animate-spin" /> : isMember ? 'Coupon Claimed' : 'Download Free Coupon'}
                </button>

                <p className="mt-2.5 text-center text-sm font-semibold text-[#df472b]">
                  {couponDownloads || currentMembers} People Downloaded Coupon
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
            className="relative h-[320px] max-h-[72vh] overflow-hidden rounded-[34px] bg-[#08152b] shadow-[0_24px_70px_rgba(8,21,43,0.2)] sm:h-[430px] lg:h-[536px]"
          >
            <img
              src={activeImage}
              alt={property.title}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,13,30,0.18),rgba(4,13,30,0.02)_45%,rgba(4,13,30,0.16))]" />

            <div className="absolute right-4 top-4 flex flex-col gap-4 sm:right-6 sm:top-6">
              <button
                type="button"
                onClick={handleWishlist}
                aria-label="Wishlist property"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#db1733] shadow-xl transition-all hover:scale-105"
              >
                <Heart size={18} strokeWidth={2.4} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share property"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#df472b] shadow-xl transition-all hover:scale-105"
              >
                <Share2 size={18} strokeWidth={2.2} />
              </button>
            </div>

            {galleryImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => moveImage(-1)}
                  aria-label="Previous image"
                  className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all hover:bg-white/15"
                >
                  <ChevronLeft size={42} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(1)}
                  aria-label="Next image"
                  className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all hover:bg-white/15"
                >
                  <ChevronRight size={42} strokeWidth={3} />
                </button>
              </>
            ) : null}
          </motion.div>
        </section>

        <div className="sticky top-20 z-40 w-full rounded-2xl border border-[#e4ddd8] bg-white/95 px-3 shadow-[0_10px_24px_rgba(62,35,22,0.04)] backdrop-blur md:px-5">
          <div className="flex items-center gap-7 overflow-x-auto no-scrollbar py-3 lg:justify-between">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all md:text-base ${
                  activeTab === tab.id
                    ? 'border border-[#f0cfc4] bg-[#fff0ed] text-[#17110e] shadow-[0_8px_18px_rgba(223,71,43,0.08)]'
                    : 'text-[#17110e] hover:bg-[#fff6f2] hover:text-[#df472b]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-6 grid gap-8 lg:h-[calc(100vh-8rem)] lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div ref={detailContentRef} className="space-y-8 lg:h-full lg:overflow-y-auto lg:pr-3 no-scrollbar">
            <div id="section-property-details" className="scroll-mt-32 overflow-hidden rounded-3xl border border-[#f0d8ce] bg-white shadow-[0_18px_50px_rgba(62,35,22,0.08)]">
                <div className="border-b border-[#f0d8ce] px-5 py-4 md:px-7">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-[0.2em] text-[#df472b]">Property Details</p>
                      <h2 className="mt-1 text-2xl font-semibold md:text-[1.7rem]">{property.title}</h2>
                      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#6c5d53]">
                        <MapPin size={16} className="text-[#df472b]" />
                        {displayLocation}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCompare}
                        className={`inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all ${
                          isInComparison
                            ? 'border-[#df472b] bg-[#df472b] text-white'
                            : 'border-[#ead7cd] bg-white text-[#241812] hover:border-[#df472b]'
                        }`}
                      >
                        <GitCompareArrows size={16} />
                        Compare
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 min-w-[178px] items-center justify-center gap-2 rounded-xl bg-[#df472b] px-4 text-sm font-bold text-white transition-all hover:bg-[#c83e24]"
                      >
                        <Phone size={16} />
                        Contact Developer
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailStat icon={Building} label="Configuration" value={configurationLabel} sub={property.category || 'Residential'} />
                    <DetailStat icon={Maximize2} label="Super Area" value={formatArea(property.area)} sub="Area details" />
                    <DetailStat icon={ShieldCheck} label="Status" value={propertyStatusLabel} sub="Verified opportunity" />
                    <DetailStat icon={Calendar} label="Possession" value={possessionLabel} sub="Timeline" />
                  </div>
                </div>

              <div className="px-5 py-5 md:px-7">
                  <motion.div
                    key="property-sections"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-8"
                  >
                    <div>
                      <div className="space-y-3.5">
                        <p className="whitespace-pre-wrap rounded-2xl border border-[#f0d8ce] bg-white px-5 py-4 text-[15px] font-medium leading-7 text-[#574b43]">
                          {property.description || 'Property description will be updated soon.'}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {propertyDetailRows.map(([label, value]) => (
                            <InfoTile key={label} label={label} value={value} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <section id="section-highlights" className="scroll-mt-32">
                      <div className="space-y-4">
                        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#111111]">Highlights</h2>
                        {highlightItems.map(([title, description]) => (
                          <div key={title} className="flex items-center gap-4 rounded-2xl bg-[linear-gradient(90deg,#ffe0d6_0%,#f9f9f9_18%,#f9f9f9_100%)] px-5 py-4 shadow-[0_12px_28px_rgba(62,35,22,0.04)]">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#df472b] text-white">
                              <CheckCircle2 size={16} strokeWidth={3} />
                            </span>
                            <p className="text-base font-medium leading-6 text-[#16110f]">
                              {description ? `${title} - ${description}` : title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section id="section-layout-plan" className="scroll-mt-32">
                      <div className="overflow-hidden rounded-[28px] border border-[#e8ddd7] bg-white">
                        <div className="flex flex-wrap border-b border-[#eee5df] bg-[#f5f5f5]">
                          {layoutPlanItems.map((item) => {
                            const isActive = activeLayoutPlan?.id === item.id;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveLayoutPlanId(item.id)}
                                className={`min-w-[145px] border-r border-[#e2ddd9] px-5 py-4 text-left transition ${
                                  isActive
                                    ? 'border-b-2 border-b-[#df472b] bg-white text-[#df472b] shadow-[0_8px_18px_rgba(62,35,22,0.12)]'
                                    : 'bg-[#f3f3f3] text-[#737b83] hover:bg-white'
                                }`}
                              >
                                <p className="text-base font-bold leading-tight">{item.label}</p>
                                {item.priceLabel ? (
                                  <p className={`mt-1 text-sm font-semibold ${isActive ? 'text-[#df472b]' : 'text-[#6f7882]'}`}>
                                    {item.priceLabel}
                                  </p>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>

                        {areaPlanItems.length ? (
                          <div className="flex flex-wrap gap-8 border-b border-[#eee5df] px-6 pt-4">
                            {areaPlanItems.map((item) => {
                              const isActive = activeLayoutPlan?.id === item.id;

                              return (
                                <button
                                  key={`${item.id}-area`}
                                  type="button"
                                  onClick={() => setActiveLayoutPlanId(item.id)}
                                  className={`border-b-2 px-2 pb-3 text-base font-semibold transition ${
                                    isActive
                                      ? 'border-[#df472b] text-[#df472b]'
                                      : 'border-transparent text-[#737b83] hover:border-[#f0d8ce] hover:text-[#df472b]'
                                  }`}
                                >
                                  {item.areaLabel}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}

                        <div className="relative flex min-h-[315px] items-center justify-center overflow-hidden bg-white px-12 py-8">
                          {layoutPlanItems.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => setActiveLayoutPlanId(layoutPlanItems[(activeLayoutIndex - 1 + layoutPlanItems.length) % layoutPlanItems.length].id)}
                              className="absolute left-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#17110e] shadow-[0_14px_34px_rgba(62,35,22,0.12)]"
                              aria-label="Previous layout plan"
                            >
                              <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                          ) : null}

                          <FloorPlanIllustration />
                          {activeLayoutPlan?.imageUrl ? (
                            <img
                              src={activeLayoutPlan.imageUrl}
                              alt={`${property.title} ${activeLayoutPlan.label}`}
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                              className="absolute inset-0 z-10 h-full w-full bg-white object-contain p-8"
                            />
                          ) : null}

                          {layoutPlanItems.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => setActiveLayoutPlanId(layoutPlanItems[(activeLayoutIndex + 1) % layoutPlanItems.length].id)}
                              className="absolute right-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#17110e] shadow-[0_14px_34px_rgba(62,35,22,0.12)]"
                              aria-label="Next layout plan"
                            >
                              <ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </section>

                    <section id="section-emi-calculator" className="scroll-mt-32">
                      <div className="rounded-[28px] border border-[#f0d8ce] bg-white p-3 shadow-[0_18px_50px_rgba(62,35,22,0.08)]">
                        <div className="rounded-[28px] border border-[#e7edf3] bg-white p-4 shadow-[0_14px_34px_rgba(62,35,22,0.06)]">
                          <div className="space-y-4">
                            {emiRangeControls.map((control) => {
                              const rangePercent = getRangePercent(control.value, control.min, control.max);

                              return (
                                <div key={control.label} className="rounded-3xl border border-[#e7edf3] bg-white px-4 py-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <p className="text-base font-bold text-[#17110e]">{control.label}</p>
                                    <p className="text-base font-black text-[#17110e]">{control.display}</p>
                                  </div>
                                  <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    step={control.step}
                                    value={control.value}
                                    onChange={(event) => control.onChange(Number(event.target.value))}
                                    className="floating-range mt-3 w-full"
                                    style={{
                                      '--range-percent': `${rangePercent}%`,
                                      '--range-fill-start': '#ef4e32',
                                      '--range-fill-end': '#ff8a68',
                                      '--range-thumb-ring': 'rgba(255,112,85,0.2)',
                                    }}
                                  />
                                  <div className="mt-2 flex items-center justify-between text-sm font-medium text-[#8a96a3]">
                                    <span>{control.minLabel}</span>
                                    <span>{control.maxLabel}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-5 rounded-3xl border border-[#f0d8ce] bg-[#fff8f4] p-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                              {[
                                ['Monthly EMI', `Rs ${estimatedEmi.toLocaleString('en-IN')}`, true],
                                ['Total Payable', formatCalculatorAmount(totalPayable), false],
                                ['Interest Amount', formatCalculatorAmount(interestPayable), true],
                                ['Principal Amount', formatCalculatorAmount(boundedEmiLoanAmount), true],
                              ].map(([label, value, accent]) => (
                                <div key={label} className="rounded-2xl bg-white px-4 py-3 shadow-[0_12px_26px_rgba(62,35,22,0.04)]">
                                  <p className="text-sm font-medium text-[#6f7b87]">{label}</p>
                                  <p className={`mt-1 text-lg font-black ${accent ? 'text-[#ef573c]' : 'text-[#17110e]'}`}>{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section id="section-amenities" className="scroll-mt-32">
                      <div className="rounded-[30px] border border-[#f0d8ce] bg-[radial-gradient(circle_at_top_left,#fff0ea_0%,#fffaf6_35%,#ffffff_100%)] p-4 shadow-[0_18px_45px_rgba(62,35,22,0.05)]">
                        <div className="mb-4 flex items-center justify-between gap-3 px-1">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#df472b]">Amenities</p>
                            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#17110e]">Lifestyle features</h2>
                          </div>
                          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#df472b] shadow-[0_10px_28px_rgba(62,35,22,0.06)]">
                            {amenities.length || 0} Items
                          </span>
                        </div>
                        {amenities.length > 0 ? (
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {amenities.map((amenity, index) => (
                              <div
                                key={amenity}
                                className="group relative min-h-[118px] overflow-hidden rounded-3xl border border-[#f0d8ce] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(62,35,22,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(223,71,43,0.12)]"
                              >
                                <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#fff0ea] transition group-hover:scale-110" />
                                <div className="relative flex items-start justify-between gap-3">
                                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#df472b] text-white shadow-[0_10px_20px_rgba(223,71,43,0.22)]">
                                    <CheckCircle2 size={18} strokeWidth={2.8} />
                                  </span>
                                  <span className="text-xs font-black text-[#f0d8ce]">0{index + 1}</span>
                                </div>
                                <p className="relative mt-4 text-sm font-bold leading-5 text-[#2a1d17]">{amenity}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="py-10 text-center text-sm font-semibold text-[#8b7d72]">Amenities details coming soon</p>
                        )}
                      </div>
                    </section>

                    <section id="section-specifications" className="scroll-mt-32">
                      <div className="rounded-[30px] border border-[#f0d8ce] bg-white p-4 shadow-[0_18px_42px_rgba(62,35,22,0.05)]">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#df472b]">Specifications</p>
                            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#17110e]">Project finishes</h2>
                          </div>
                          <span className="rounded-full bg-[#fff0ea] px-3 py-1.5 text-xs font-bold text-[#df472b]">
                            {specificationRows.length} Specs
                          </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {specificationRows.map(([label, value], index) => (
                            <div
                              key={`${label}-${index}`}
                              className="flex gap-3 rounded-2xl border border-[#f0d8ce] bg-[#fffaf6] p-3 shadow-[0_10px_24px_rgba(62,35,22,0.03)]"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-black text-[#df472b] shadow-[0_8px_18px_rgba(223,71,43,0.1)]">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-[#8f7a6f]">{label}</p>
                                <p className="mt-1 text-[13px] font-semibold leading-5 text-[#241812]">{value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section id="section-location" className="scroll-mt-32">
                      <div className="space-y-5">
                        <div className="overflow-hidden rounded-3xl border border-[#f0d8ce] bg-[#fffaf6]">
                          <div className="relative h-[240px] sm:h-[280px] lg:h-[315px]">
                            {locationUrl ? (
                              <iframe
                                src={locationUrl}
                                title={`${property.title} live location`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="h-full w-full border-0"
                              />
                            ) : (
                              <>
                                <img
                                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600"
                                  alt="Location map"
                                  className="h-full w-full object-cover opacity-60 grayscale"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="inline-flex items-center gap-3 rounded-full border border-[#ead7cd] bg-white px-6 py-4 shadow-2xl">
                                    <MapPin size={20} className="text-[#df472b]" />
                                    <span className="text-sm font-bold text-[#19110d]">{displayLocation}</span>
                                  </div>
                                </div>
                              </>
                            )}
                            {locationUrl ? (
                              <div className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-full border border-[#ead7cd] bg-white px-5 py-3 shadow-xl">
                                <div className="flex items-center gap-2">
                                  <MapPin size={18} className="shrink-0 text-[#df472b]" />
                                  <span className="line-clamp-1 text-sm font-bold text-[#19110d]">{displayLocation}</span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="rounded-3xl border border-[#f0d8ce] bg-white p-4 shadow-[0_14px_34px_rgba(62,35,22,0.05)]">
                          <div className="flex gap-2 overflow-x-auto no-scrollbar rounded-2xl bg-[#f7f3ef] p-1">
                            {nearbyPlaceCategories.map((category) => {
                              const CategoryIcon = category.icon;
                              const isActiveNearby = activeNearbyCategory === category.id;

                              return (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => setActiveNearbyCategory(category.id)}
                                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                    isActiveNearby
                                      ? 'bg-[#ff765e] text-white shadow-[0_10px_24px_rgba(223,71,43,0.22)]'
                                      : 'text-[#756961] hover:bg-white hover:text-[#df472b]'
                                  }`}
                                >
                                  <CategoryIcon size={16} />
                                  {category.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {activeNearbyData.places.map((place) => (
                              <div key={place.name} className="rounded-2xl border border-[#efe0d8] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(62,35,22,0.04)]">
                                <div className="flex items-start gap-3">
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0ea] text-[#df472b]">
                                    <ActiveNearbyIcon size={18} />
                                  </span>
                                  <div className="min-w-0">
                                    <h3 className="text-base font-black text-[#17110e]">{place.name}</h3>
                                    <p className="mt-1 line-clamp-1 text-sm font-medium text-[#6f6259]">{place.address}</p>
                                    <p className="mt-2 text-sm font-semibold text-[#17110e]">
                                      {place.distance} <span className="text-[#9a8b81]">|</span> {place.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <InfoTile label="City" value={property.city || 'On request'} />
                          <InfoTile label="Locality" value={property.locality || 'On request'} />
                        </div>
                      </div>
                    </section>

                    <section id="section-about-developer" className="scroll-mt-32">
                      <div className="overflow-hidden rounded-[30px] border border-[#f0d8ce] bg-[linear-gradient(135deg,#fff7f2_0%,#ffffff_48%,#fffaf6_100%)] shadow-[0_18px_45px_rgba(62,35,22,0.05)]">
                        <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
                          <div className="relative flex flex-col items-center justify-center border-b border-[#f0d8ce] bg-[#fffaf6] p-6 text-center lg:border-b-0 lg:border-r">
                            <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#df472b] shadow-sm">
                              Developer
                            </span>
                            <div className="mt-7 flex h-32 w-32 items-center justify-center rounded-[28px] border border-[#f0d8ce] bg-white p-5 shadow-[0_18px_38px_rgba(62,35,22,0.08)]">
                              {developerLogo ? (
                                <img src={developerLogo} alt={developerName} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <Building size={42} className="text-[#df472b]" />
                              )}
                            </div>
                            <h3 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#111111]">{developerName}</h3>
                            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#cfe9d3] bg-[#f3fff4] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#239a31]">
                              <ShieldCheck size={14} />
                              {property.developer?.isActive === false ? 'Private Developer' : 'Active Developer'}
                            </span>
                          </div>

                          <div className="p-5 sm:p-7">
                            <p className="text-sm font-medium leading-7 text-[#4f443d]">
                              {developerDescription}
                            </p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-3xl border border-[#f0d8ce] bg-white p-5 shadow-[0_12px_28px_rgba(62,35,22,0.04)]">
                                <p className="text-xs font-semibold text-[#8f7a6f]">Total projects</p>
                                <p className="mt-2 text-2xl font-black text-[#17110e]">
                                  {property.developerTotalProjects ? `${property.developerTotalProjects}+` : 'On request'}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-[#df472b]">Delivered / active projects</p>
                              </div>
                              <div className="rounded-3xl border border-[#f0d8ce] bg-white p-5 shadow-[0_12px_28px_rgba(62,35,22,0.04)]">
                                <p className="text-xs font-semibold text-[#8f7a6f]">Total experience</p>
                                <p className="mt-2 text-2xl font-black text-[#17110e]">
                                  {property.developerExperienceYears ? `${property.developerExperienceYears}+` : 'On request'}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-[#df472b]">Years in real estate</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </motion.div>
              </div>
            </div>

            {property.videoUrl ? (
              <div className="scroll-mt-32 overflow-hidden rounded-3xl border border-[#f0d8ce] bg-white shadow-[0_18px_50px_rgba(62,35,22,0.08)]">
                <div className="flex items-center gap-3 border-b border-[#f0d8ce] px-7 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0ea] text-[#df472b]">
                    <Play size={15} />
                  </span>
                  <h2 className="text-sm text-[#241812] font-bold tracking-[0.2em] ">Project Walkthrough</h2>
                </div>
                <div className="aspect-video bg-black">
                  {property.videoUrl.includes('youtube') || property.videoUrl.includes('youtu.be') ? (
                    <iframe
                      title={`${property.title} walkthrough`}
                      src={`https://www.youtube.com/embed/${property.videoUrl.split('v=')[1] || property.videoUrl.split('/').pop()}`}
                      className="h-full w-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <video src={property.videoUrl} controls className="h-full w-full" />
                  )}
                </div>
              </div>
            ) : null}

          </div>

          <aside id="group-buying-panel" className="space-y-3 lg:self-start">
            <div className="rounded-[24px] border border-[#d8d2cf] bg-white px-4 py-3 shadow-[0_18px_48px_rgba(62,35,22,0.06)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fde9e4] text-[#df472b]">
                  <Users size={20} fill="currentColor" />
                </span>
                <div>
                  <p className="text-xl font-semibold text-[#df472b]">
                    {currentMembers} {currentMembers === 1 ? 'Member' : 'Members'}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#101021]">in this group</p>
                </div>
              </div>

              <div className="my-3 h-px bg-[#ded8d4]" />

              <p className="text-sm text-[#777782] leading-5 font-semibold">
                Join more buyers and unlock best savings
              </p>

              <button
                type="button"
                onClick={handleJoinGroup}
                disabled={joining || liveGroupStatus === 'FULL' || isMember}
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#df472b] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#c83e24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joining ? <Loader2 size={18} className="animate-spin" /> : isMember ? 'Joined' : 'Join Group'}
                {!joining && !isMember ? <ArrowUpRight size={18} /> : null}
              </button>

              <div className="mt-3 border-t border-[#ded8d4] pt-3">
                <h3 className="text-sm font-medium text-[#777782]">Joined Members</h3>

                <div className="mt-2 max-h-[130px] space-y-2 overflow-y-auto pr-2 [scrollbar-color:#c7c7c7_transparent] [scrollbar-width:thin]">
                  {joinedMemberRows.length > 0 ? (
                    joinedMemberRows.map((member, memberIndex) => {
                      const memberName = member.user?.name || member.user?.email?.split('@')[0] || `Member ${memberIndex + 1}`;
                      const memberCity = member.user?.city || property.city || property.locality || 'Delhi NCR';
                      const avatarSeed = member.user?.name || member.userId || memberIndex + 1;

                      return (
                        <div
                          key={member.id || member.userId || memberIndex}
                          className="flex items-center gap-3 rounded-xl border-2 border-[#ffad9e] bg-[#f7d8d1] px-3 py-3"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#ff8069] bg-white p-0.5">
                            <img
                              src={member.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                              alt={memberName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-black">{memberName}</p>
                            <p className="truncate text-sm font-medium text-[#6f6965]">{memberCity}</p>
                            <p className="text-sm font-semibold text-[#df472b]">
                              {property.bhk ? `${property.bhk} BHK` : property.category || 'Property'}
                            </p>
                          </div>

                          <CheckCircle2 size={22} className="shrink-0 text-[#df472b]" fill="currentColor" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex min-h-[70px] items-center justify-center rounded-xl border border-dashed border-[#f2beb4] bg-[#fff8f5] px-5 text-center text-xs font-semibold text-[#9b8a7d]">
                      No members joined yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#17110e] p-4 text-white shadow-[0_18px_50px_rgba(23,17,14,0.16)]">
              <div className="flex items-center gap-2.5">
                <Info size={16} className="text-[#ff8061]" />
                <h3 className="text-base font-black">Why Group Buying?</h3>
              </div>
              <p className="mt-1.5 text-[11px] font-medium leading-4 text-white/60">
                Coordinate with other buyers to unlock bulk-purchase discounts directly from the developer. No middlemen. No hidden fees.
              </p>
              <div className="mt-3 grid gap-2">
                {['Zero Middleman Fees', 'Direct Developer Negotiation', 'Group Price Protection', 'Faster Deal Closure'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
                    <CheckCircle2 size={14} className="text-[#ff8061]" />
                    <span className="text-xs font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
        <SearchPage/>
      </div>

      <AnimatePresence>
        {showCompareDrawer ? (
          <motion.div
            className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close comparison drawer"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setShowCompareDrawer(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-[1040px] flex-col overflow-hidden rounded-l-[34px] border-l border-[#efd9cf] bg-[#fffdfa] shadow-[0_30px_90px_rgba(20,12,8,0.28)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#efe2dc] bg-white px-5 py-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ea] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#df472b]">
                    <GitCompareArrows size={13} />
                    Property Compare
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#17110e]">
                    Select properties to compare
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[#7b6d63]">
                    Current selected properties left me hain, right side se aur properties add karo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompareDrawer(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#efd9cf] bg-white text-[#17110e] transition-all hover:bg-[#fff0ea] hover:text-[#df472b]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="flex min-h-0 flex-col border-r border-[#efe2dc] bg-[#fff8f4] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#17110e]">Selected</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#df472b]">
                      {comparisonItems.length}/4
                    </span>
                  </div>

                  <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 pb-3 no-scrollbar">
                    {comparisonLoading ? (
                      <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-[#efd9cf] bg-white">
                        <Loader2 size={26} className="animate-spin text-[#df472b]" />
                      </div>
                    ) : comparisonItems.length > 0 ? (
                      comparisonItems.map((item) => {
                        const itemImage = item.thumbnailUrl || item.image || getImageUrl(item.images?.[0]) || fallbackImage;

                        return (
                          <div key={item.id} className="overflow-hidden rounded-3xl border border-[#efd9cf] bg-white shadow-[0_14px_34px_rgba(62,35,22,0.06)]">
                            <div className="relative h-32">
                              <img src={itemImage} alt={item.title} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <button
                                type="button"
                                onClick={() => handleComparePropertyToggle(item.id)}
                                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#df472b] shadow-lg transition-all hover:scale-105"
                              >
                                {addingCompareId === item.id ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                              </button>
                              <p className="absolute bottom-3 left-3 right-12 line-clamp-2 text-sm font-semibold leading-tight text-white">
                                {item.title}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-3 text-sm">
                              <div className="rounded-2xl bg-[#fff8f4] p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9c7467]">Price</p>
                                <p className="mt-1 font-semibold text-[#17110e]">{formatCurrency(item.price)}</p>
                              </div>
                              <div className="rounded-2xl bg-[#fff8f4] p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9c7467]">Area</p>
                                <p className="mt-1 font-semibold text-[#17110e]">{formatArea(item.area)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-[#efc5ba] bg-white px-5 text-center text-sm font-semibold text-[#8b7d72]">
                        No property selected yet
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 border-t border-[#efe2dc] bg-[#fff8f4] pt-4">
                    <button
                      type="button"
                      disabled={comparisonItems.length < 2}
                      onClick={() => navigate('/comparison')}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#df472b] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(223,71,43,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#c83e24] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      Compare Now
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#17110e]">All Properties</h3>
                      <p className="text-xs font-medium text-[#8b7d72]">Compare icon par click karke add karein.</p>
                    </div>
                    <div className="flex h-11 w-full items-center gap-2 rounded-2xl border border-[#ead7cd] bg-[#fffaf6] px-3 sm:w-[260px]">
                      <SearchIcon size={16} className="text-[#df472b]" />
                      <input
                        value={compareSearch}
                        onChange={(event) => setCompareSearch(event.target.value)}
                        placeholder="Search property"
                        className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#17110e] outline-none placeholder:text-[#a99b91]"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid max-h-[calc(100vh-190px)] gap-3 overflow-y-auto pr-1 no-scrollbar md:grid-cols-2">
                    {comparisonLoading ? (
                      <div className="col-span-full flex min-h-[260px] items-center justify-center rounded-3xl border border-[#efd9cf] bg-[#fffaf6]">
                        <Loader2 size={28} className="animate-spin text-[#df472b]" />
                      </div>
                    ) : availableCompareProperties.length > 0 ? (
                      availableCompareProperties.map((item) => {
                        const itemImage = item.thumbnailUrl || item.image || getImageUrl(item.images?.[0]) || fallbackImage;

                        return (
                          <div key={item.id} className="group overflow-hidden rounded-3xl border border-[#efd9cf] bg-white shadow-[0_12px_30px_rgba(62,35,22,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(62,35,22,0.10)]">
                            <div className="relative h-32">
                              <img src={itemImage} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <button
                                type="button"
                                onClick={() => handleComparePropertyToggle(item.id)}
                                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#df472b] shadow-lg transition-all hover:scale-105 hover:bg-[#df472b] hover:text-white"
                                aria-label={`Add ${item.title} to comparison`}
                              >
                                {addingCompareId === item.id ? <Loader2 size={16} className="animate-spin" /> : <GitCompareArrows size={16} />}
                              </button>
                            </div>
                            <div className="p-3">
                              <h4 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-[#17110e]">{item.title}</h4>
                              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#7b6d63]">
                                <MapPin size={12} className="text-[#df472b]" />
                                <span className="line-clamp-1">{[item.locality, item.city].filter(Boolean).join(', ') || 'Prime Location'}</span>
                              </p>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <p className="text-base font-semibold text-[#17110e]">{formatCurrency(item.price)}</p>
                                <span className="rounded-full bg-[#fff0ea] px-3 py-1 text-xs font-semibold text-[#df472b]">
                                  {item.bhk ? `${item.bhk} BHK` : item.category || 'Property'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-[#efc5ba] bg-[#fffaf6] px-5 text-center text-sm font-semibold text-[#8b7d72]">
                        No more properties found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetails;
