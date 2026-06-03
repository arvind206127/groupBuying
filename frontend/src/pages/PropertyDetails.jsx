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
  if (typeof image === 'string') return image;
  return image.url || image.src || '';
};

const buildGallery = (property) => {
  const images = Array.isArray(property?.images)
    ? property.images.map(getImageUrl).filter(Boolean)
    : [];
  const featuredImage = property?.thumbnailUrl || property?.image || property?.imageUrl;
  return [...new Set([featuredImage, ...images].filter(Boolean))];
};

const formatArea = (area) => {
  const numericArea = Number(area);
  if (!Number.isFinite(numericArea) || numericArea <= 0) return 'On request';
  return `${numericArea.toLocaleString('en-IN', { maximumFractionDigits: 2 })} sq.ft.`;
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
  <div className="rounded-2xl border border-[#f1d6ca] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(62,35,22,0.06)]">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0ea] text-[#df472b]">
      <Icon size={18} />
    </div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b8a7d]">{label}</p>
    <p className="mt-1 text-lg font-bold text-[#15110f]">{value}</p>
    {sub ? <p className="mt-1 text-xs font-medium text-[#8b7d72]">{sub}</p> : null}
  </div>
);

const InfoTile = ({ label, value }) => (
  <div className="rounded-2xl border border-[#f0d8ce] bg-[#fffaf6] p-4">
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b8a7d]">{label}</p>
    <p className="mt-2 break-words text-sm font-bold text-[#19110d]">{value}</p>
  </div>
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
  const nearbyPlaceCategories = [
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
  const activeNearbyData = nearbyPlaceCategories.find((category) => category.id === activeNearbyCategory) || nearbyPlaceCategories[0];
  const ActiveNearbyIcon = activeNearbyData.icon;
  const propertyStatusLabel = property.propertyStatus?.name || property.status?.replace(/_/g, ' ') || 'Verified Deal';
  const possessionLabel = property.possession || formatDateLabel(property.expiryDate) || propertyStatusLabel;
  const developerName = property.developer?.name || 'Institutional Developer';
  const developerLogo = property.developer?.logo || property.developer?.logoUrl;
  const couponDownloads = Number(property.couponDownloads || property.downloadCount || property.trackingCount) || currentMembers;
  const joinedMemberRows = groupMembers;
  const configurationLabel = property.bhk ? `${property.bhk} BHK` : property.category || 'Property';
  const amenities = (Array.isArray(property.amenities) ? property.amenities : []).filter(Boolean);
  const rawLayoutPlan = property.layoutPlanUrl || property.floorPlanUrl || property.floorPlan || property.layoutPlan;
  const layoutPlanUrl = getImageUrl(rawLayoutPlan);
  const layoutPlanImage = layoutPlanUrl || galleryImages[1] || activeImage;
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
    ['Configuration', configurationLabel],
    ['Super Area', formatArea(property.area)],
    ['Status', propertyStatusLabel],
    ['Possession', possessionLabel],
    ['Developer', developerName],
    ['City', property.city || 'On request'],
    ['Locality', property.locality || 'On request'],
  ];
  const highlightItems = [
    [
      discountPercent > 0 ? `${discountPercent}% Developer Discount` : 'Developer Direct Deal',
      savings > 0 ? `Save up to ${formatSavingsShort(savings)} against developer price.` : 'Coordinate directly for best available pricing.',
    ],
    [`${currentMembers}/${maxMembers} Group Progress`, 'Join other buyers and improve negotiation strength.'],
    [propertyStatusLabel, 'Verified opportunity with transparent group buying workflow.'],
    ['No Middlemen', 'Bulk-purchase coordination directly from the developer.'],
  ];
  const specificationRows = [
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
            className="relative min-h-[288px] overflow-hidden rounded-[34px] bg-[#08152b] shadow-[0_24px_70px_rgba(8,21,43,0.2)] lg:min-h-[536px]"
          >
            <img
              src={activeImage}
              alt={property.title}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
              className="h-full min-h-[288px] w-full object-cover lg:min-h-[536px]"
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
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3">
                  {galleryImages.map((imageUrl, imageIndex) => (
                    <button
                      key={`${imageUrl}-${imageIndex}`}
                      type="button"
                      aria-label={`Go to image ${imageIndex + 1}`}
                      onClick={() => setActiveImageIndex(imageIndex)}
                      className={`h-2.5 rounded-full bg-white transition-all ${
                        activeImageIndex === imageIndex ? 'w-9 opacity-100' : 'w-2.5 opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </motion.div>
        </section>

        <div className="relative left-1/2 w-screen -translate-x-1/2 border-b border-[#e4ddd8] bg-white/95 px-4 shadow-[0_10px_24px_rgba(62,35,22,0.04)] md:px-10">
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

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="space-y-8">
            <div ref={detailContentRef} className="overflow-hidden rounded-3xl border border-[#f0d8ce] bg-white shadow-[0_18px_50px_rgba(62,35,22,0.08)]">
              {activeTab === 'property-details' ? (
                <div className="border-b border-[#f0d8ce] px-7 py-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-[0.2em] text-[#df472b]">{activeTabLabel}</p>
                      <h2 className="mt-2 text-3xl font-semibold">{property.title}</h2>
                      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[#6c5d53]">
                        <MapPin size={16} className="text-[#df472b]" />
                        {displayLocation}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCompare}
                        className={`inline-flex h-14 min-w-[156px] items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-bold transition-all ${
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
                        className="inline-flex h-14 min-w-[210px] items-center justify-center gap-2 rounded-2xl bg-[#df472b] px-5 text-sm font-bold text-white transition-all hover:bg-[#c83e24]"
                      >
                        <Phone size={16} />
                        Contact Developer
                      </button>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailStat icon={Building} label="Configuration" value={configurationLabel} sub={property.category || 'Residential'} />
                    <DetailStat icon={Maximize2} label="Super Area" value={formatArea(property.area)} sub="Area details" />
                    <DetailStat icon={ShieldCheck} label="Status" value={propertyStatusLabel} sub="Verified opportunity" />
                    <DetailStat icon={Calendar} label="Possession" value={possessionLabel} sub="Timeline" />
                  </div>
                </div>
              ) : null}

              <div className="px-5 py-8 md:px-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    {activeTab === 'property-details' ? (
                      <div className="space-y-6">
                        <p className="whitespace-pre-wrap text-base font-medium leading-8 text-[#574b43]">
                          {property.description || 'Property description will be updated soon.'}
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {propertyDetailRows.map(([label, value]) => (
                            <InfoTile key={label} label={label} value={value} />
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {activeTab === 'highlights' ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {highlightItems.map(([title, description]) => (
                          <div key={title} className="rounded-3xl border border-[#f0d8ce] bg-white p-5 shadow-[0_14px_34px_rgba(62,35,22,0.05)]">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0ea] text-[#df472b]">
                              <CheckCircle2 size={18} />
                            </span>
                            <h3 className="mt-4 text-lg font-black text-[#17110e]">{title}</h3>
                            <p className="mt-2 text-sm font-medium leading-6 text-[#6c5d53]">{description}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {activeTab === 'layout-plan' ? (
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)]">
                        <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-[#f0d8ce] bg-[#fffaf6]">
                          <img
                            src={layoutPlanImage}
                            alt={`${property.title} layout plan`}
                            onError={(event) => {
                              event.currentTarget.src = fallbackImage;
                            }}
                            className="h-full min-h-[280px] w-full object-cover"
                          />
                          {!layoutPlanUrl ? (
                            <div className="absolute bottom-4 left-4 rounded-full border border-[#ead7cd] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6c5d53] shadow-xl">
                              Layout plan coming soon
                            </div>
                          ) : null}
                        </div>
                        <div className="grid content-start gap-4">
                          <InfoTile label="Configuration" value={configurationLabel} />
                          <InfoTile label="Super Area" value={formatArea(property.area)} />
                          <InfoTile label="Possession" value={possessionLabel} />
                          <p className="rounded-2xl border border-[#f0d8ce] bg-white p-4 text-sm font-medium leading-7 text-[#574b43]">
                            Final unit layout and tower-wise plans can be confirmed directly with the developer.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {activeTab === 'emi-calculator' ? (
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
                    ) : null}

                    {activeTab === 'amenities' ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {amenities.length > 0 ? (
                          amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center gap-3 rounded-2xl border border-[#f0d8ce] bg-white p-4">
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0ea] text-[#df472b]">
                                <CheckCircle2 size={17} />
                              </span>
                              <span className="text-sm font-bold text-[#46372f]">{amenity}</span>
                            </div>
                          ))
                        ) : (
                          <p className="col-span-full py-10 text-center text-sm font-semibold text-[#8b7d72]">Amenities details coming soon</p>
                        )}
                      </div>
                    ) : null}

                    {activeTab === 'specifications' ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {specificationRows.map(([label, value]) => (
                          <InfoTile key={label} label={label} value={value} />
                        ))}
                      </div>
                    ) : null}

                    {activeTab === 'location' ? (
                      <div className="space-y-5">
                        <div className="overflow-hidden rounded-3xl border border-[#f0d8ce] bg-[#fffaf6]">
                          <div className="relative aspect-[21/9] min-h-[260px]">
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
                    ) : null}

                    {activeTab === 'about-developer' ? (
                      <div className="flex flex-col gap-7 md:flex-row">
                        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-[#f0d8ce] bg-white p-5 shadow-[0_14px_34px_rgba(62,35,22,0.06)]">
                          {developerLogo ? (
                            <img src={developerLogo} alt={developerName} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Building size={38} className="text-[#df472b]" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-[#111111]">{developerName}</h3>
                          <p className="mt-4 text-base font-medium leading-8 text-[#574b43]">
                            {property.developer?.description || 'Developer details will be updated soon.'}
                          </p>
                          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#cfe9d3] bg-[#f3fff4] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#239a31]">
                            <ShieldCheck size={14} />
                            {property.developer?.isActive === false ? 'Private Developer' : 'Active Developer'}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {activeTab === 'property-details' && property.videoUrl ? (
              <div className="overflow-hidden rounded-3xl border border-[#f0d8ce] bg-white shadow-[0_18px_50px_rgba(62,35,22,0.08)]">
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

          <aside id="group-buying-panel" className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[24px] border border-[#d8d2cf] bg-white px-4 py-4 shadow-[0_18px_48px_rgba(62,35,22,0.06)]">
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

              <div className="my-4 h-px bg-[#ded8d4]" />

              <p className="text-base font-semibold leading-6 text-[#101021]">
                Join more buyers and unlock best savings
              </p>

              <button
                type="button"
                onClick={handleJoinGroup}
                disabled={joining || liveGroupStatus === 'FULL' || isMember}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#df472b] px-5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#c83e24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joining ? <Loader2 size={18} className="animate-spin" /> : isMember ? 'Joined' : 'Join Group'}
                {!joining && !isMember ? <ArrowUpRight size={18} /> : null}
              </button>

              <div className="mt-4 border-t border-[#ded8d4] pt-4">
                <h3 className="text-xl font-medium text-[#777782]">Joined Members</h3>

                <div className="mt-3 max-h-[190px] space-y-2 overflow-y-auto pr-2 [scrollbar-color:#c7c7c7_transparent] [scrollbar-width:thin]">
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
                    <div className="flex min-h-[92px] items-center justify-center rounded-xl border border-dashed border-[#f2beb4] bg-[#fff8f5] px-5 text-center text-xs font-semibold text-[#9b8a7d]">
                      No members joined yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#17110e] p-5 text-white shadow-[0_18px_50px_rgba(23,17,14,0.16)]">
              <div className="flex items-center gap-2.5">
                <Info size={16} className="text-[#ff8061]" />
                <h3 className="text-lg font-black">Why Group Buying?</h3>
              </div>
              <p className="mt-2 text-xs font-medium leading-5 text-white/60">
                Coordinate with other buyers to unlock bulk-purchase discounts directly from the developer. No middlemen. No hidden fees.
              </p>
              <div className="mt-4 grid gap-2.5">
                {['Zero Middleman Fees', 'Direct Developer Negotiation', 'Group Price Protection', 'Faster Deal Closure'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
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
                <div className="min-h-0 border-r border-[#efe2dc] bg-[#fff8f4] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#17110e]">Selected</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#df472b]">
                      {comparisonItems.length}/4
                    </span>
                  </div>

                  <div className="mt-4 max-h-[calc(100vh-235px)] space-y-3 overflow-y-auto pr-1 no-scrollbar">
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

                  <button
                    type="button"
                    disabled={comparisonItems.length < 2}
                    onClick={() => navigate('/comparison')}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#df472b] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#c83e24] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    Compare Now
                    <ArrowUpRight size={16} />
                  </button>
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
