import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  GitCompareArrows,
  Heart,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  Phone,
  Play,
  Share2,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1400';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'location', label: 'Location' },
  { id: 'developer', label: 'Developer' },
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

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, hasActiveSubscription } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInComparison, setIsInComparison] = useState(false);
  const [liveMembersCount, setLiveMembersCount] = useState(0);
  const [liveGroupStatus, setLiveGroupStatus] = useState('OPEN');

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

  const handleCompare = useCallback(async () => {
    if (!user) {
      toast.error('Please login to compare');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/users/comparison', { propertyId: id });
      if (response.data.success) {
        setIsInComparison(response.data.action === 'added');
        toast.success(response.data.action === 'added' ? 'Added to comparison' : 'Removed from comparison');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Comparison limit reached');
    }
  }, [id, navigate, user]);

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
  const propertyStatusLabel = property.propertyStatus?.name || property.status?.replace(/_/g, ' ') || 'Verified Deal';
  const possessionLabel = property.possession || formatDateLabel(property.expiryDate) || propertyStatusLabel;
  const developerName = property.developer?.name || 'Institutional Developer';
  const developerLogo = property.developer?.logo || property.developer?.logoUrl;
  const couponDownloads = Number(property.couponDownloads || property.downloadCount || property.trackingCount) || currentMembers;
  const joinedMemberRows = groupMembers;

  const moveImage = (direction) => {
    setActiveImageIndex((currentIndex) => {
      const totalImages = galleryImages.length;
      if (totalImages < 2) return 0;
      return (currentIndex + direction + totalImages) % totalImages;
    });
  };

  return (
    <div
      className="min-h-screen bg-[#fffdfa] pt-24 text-[#111111]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(210, 198, 188, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(210, 198, 188, 0.22) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div className="mx-auto max-w-7xl home-page-gutter pb-20">
        <div className="mb-8 flex items-center justify-between gap-4">
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
            className="mx-auto flex w-full max-w-[560px] flex-col justify-center text-center lg:h-[536px] lg:max-h-[536px] lg:overflow-hidden"
          >
            <div className="mb-4 inline-flex items-center gap-2 self-center rounded-full border border-[#cfe9d3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#239a31] shadow-[0_10px_24px_rgba(35,154,49,0.08)] lg:mb-3 lg:py-1.5">
              <ShieldCheck size={15} />
              {propertyStatusLabel}
            </div>

            <h1 className="text-5xl font-semibold leading-[1.04] tracking-normal text-black md:text-6xl lg:text-[3.35rem] lg:leading-[0.98]">
              {property.title}
            </h1>

            <p className="mt-5 text-xl font-semibold leading-8 text-black md:text-2xl lg:mt-3 lg:text-lg lg:leading-7">
              {displayLocation}
            </p>

            <div className="mt-8 flex justify-center lg:mt-5">
              <span className="rounded-xl bg-[#df472b] px-6 py-3 text-xl font-semibold text-white shadow-[0_16px_30px_rgba(223,71,43,0.22)] lg:px-5 lg:py-2.5 lg:text-lg">
                {property.bhk ? `${property.bhk} BHK` : property.category || 'Property'}
              </span>
            </div>

            <p className="mt-8 text-2xl font-semibold text-black lg:mt-5 lg:text-lg">
              Super area: {formatArea(property.area)}
            </p>

            <div className="mx-auto my-9 h-px w-full max-w-[520px] bg-[#cfc7c1] lg:my-4" />

            <div className="grid gap-8 text-left sm:grid-cols-2 lg:gap-4">
              <div>
                <p className="text-base font-semibold text-[#141414] lg:text-sm">Target Price</p>
                <p className="mt-1 text-5xl font-semibold leading-none text-black lg:text-3xl">{formatCurrency(targetPrice)}</p>
                {savings > 0 ? (
                  <p className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-[#279c18] lg:mt-3 lg:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#35b51f] text-white">
                      <Zap size={13} />
                    </span>
                    Up to {formatSavingsShort(savings)} off
                  </p>
                ) : null}
              </div>

              <div className="sm:text-right">
                <p className="text-base font-semibold text-[#141414] lg:text-sm">Developer price</p>
                <p className="mt-2 text-3xl font-semibold leading-none text-[#8a8783] line-through lg:text-xl">{formatCurrency(originalPrice)}</p>
                {discountPercent > 0 ? (
                  <p className="mt-5 text-lg font-semibold text-[#df472b] lg:mt-3 lg:text-sm">
                    Get upto {discountPercent}% discount on this property
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={handleJoinGroup}
              disabled={joining || liveGroupStatus === 'FULL' || isMember}
              className="mx-auto mt-10 flex h-16 w-full max-w-[520px] items-center justify-center rounded-xl bg-[#e7472c] px-6 text-xl font-semibold text-white shadow-[0_18px_34px_rgba(223,71,43,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#cf3d24] disabled:cursor-not-allowed disabled:opacity-60 lg:mt-5 lg:h-12 lg:max-w-[500px] lg:text-lg"
            >
              {joining ? <Loader2 size={26} className="animate-spin" /> : isMember ? 'Coupon Claimed' : 'Download Free Coupon'}
            </button>

            <p className="mt-4 text-lg font-semibold text-[#df472b] lg:mt-2 lg:text-sm">
              {couponDownloads || currentMembers} People Downloaded Coupon
            </p>
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

        <section className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-8">
            {property.videoUrl ? (
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

            <div className="overflow-hidden rounded-3xl border border-[#f0d8ce] bg-white shadow-[0_18px_50px_rgba(62,35,22,0.08)]">
              <div className="border-b border-[#f0d8ce] px-7 py-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.2em] text-[#df472b]">Property Details</p>
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
                  <DetailStat icon={Building} label="Configuration" value={property.bhk ? `${property.bhk} BHK` : property.category || 'Property'} sub={property.category || 'Residential'} />
                  <DetailStat icon={Maximize2} label="Super Area" value={formatArea(property.area)} sub="Area details" />
                  <DetailStat icon={ShieldCheck} label="Status" value={propertyStatusLabel} sub="Verified opportunity" />
                  <DetailStat icon={Calendar} label="Possession" value={possessionLabel} sub="Timeline" />
                </div>
              </div>

              <div className="border-b border-[#f0d8ce] px-7">
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`border-b-2 px-5 py-5 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                        activeTab === tab.id
                          ? 'border-[#df472b] text-[#df472b]'
                          : 'border-transparent text-[#9b8a7d] hover:text-[#df472b]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-7 py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    {activeTab === 'overview' ? (
                      <div className="space-y-6">
                        <p className="whitespace-pre-wrap text-base font-medium leading-8 text-[#574b43]">
                          {property.description || 'Property description will be updated soon.'}
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {[
                            ['Project Type', property.category || 'Residential'],
                            ['BHK', property.bhk ? `${property.bhk} BHK` : 'On request'],
                            ['Total Area', formatArea(property.area)],
                            ['City', property.city || 'On request'],
                            ['Locality', property.locality || 'On request'],
                            ['Developer', developerName],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-[#f0d8ce] bg-[#fffaf6] p-4">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b8a7d]">{label}</p>
                              <p className="mt-2 text-sm font-bold text-[#19110d]">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {activeTab === 'amenities' ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(Array.isArray(property.amenities) ? property.amenities : []).length > 0 ? (
                          property.amenities.map((amenity) => (
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

                    {activeTab === 'location' ? (
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
                    ) : null}

                    {activeTab === 'developer' ? (
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

          </div>

          <aside id="group-buying-panel" className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[28px] border border-[#d8d2cf] bg-white px-5 py-5 shadow-[0_18px_48px_rgba(62,35,22,0.06)]">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fde9e4] text-[#df472b]">
                  <Users size={25} fill="currentColor" />
                </span>
                <div>
                  <p className="text-2xl font-semibold text-[#df472b]">
                    {currentMembers} {currentMembers === 1 ? 'Member' : 'Members'}
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#101021]">in this group</p>
                </div>
              </div>

              <div className="my-5 h-px bg-[#ded8d4]" />

              <p className="text-xl font-medium leading-7 text-[#101021]">
                Join more buyers and unlock best savings
              </p>

              <button
                type="button"
                onClick={handleJoinGroup}
                disabled={joining || liveGroupStatus === 'FULL' || isMember}
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#df472b] px-5 text-xl font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#c83e24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joining ? <Loader2 size={22} className="animate-spin" /> : isMember ? 'Joined' : 'Join Group'}
                {!joining && !isMember ? <ArrowUpRight size={22} /> : null}
              </button>

              <div className="mt-6 border-t border-[#ded8d4] pt-5">
                <h3 className="text-2xl font-medium text-[#777782]">Joined Members</h3>

                <div className="mt-4 max-h-[260px] space-y-3 overflow-y-auto pr-2 [scrollbar-color:#c7c7c7_transparent] [scrollbar-width:thin]">
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
                            <p className="truncate text-base font-semibold text-black">{memberName}</p>
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
                    <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-[#f2beb4] bg-[#fff8f5] px-5 text-center text-sm font-semibold text-[#9b8a7d]">
                      No members joined yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#17110e] p-7 text-white shadow-[0_18px_50px_rgba(23,17,14,0.16)]">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-[#ff8061]" />
                <h3 className="text-xl font-black">Why Group Buying?</h3>
              </div>
              <p className="mt-3 text-sm font-medium leading-7 text-white/60">
                Coordinate with other buyers to unlock bulk-purchase discounts directly from the developer. No middlemen. No hidden fees.
              </p>
              <div className="mt-6 grid gap-3">
                {['Zero Middleman Fees', 'Direct Developer Negotiation', 'Group Price Protection', 'Faster Deal Closure'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <CheckCircle2 size={16} className="text-[#ff8061]" />
                    <span className="text-sm font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default PropertyDetails;
