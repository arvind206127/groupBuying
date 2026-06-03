import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Share2, Phone, TrendingUp, Info, ShieldCheck, MapPin, Loader2,
  GitCompareArrows,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import LoginModal from './LoginModal';
import EnquiryModal from './EnquiryModal';

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000';

const getInitials = (name) =>
  String(name || 'Member').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const getPrimaryGroup = (property) => property?.groups?.[0] || null;

const getActiveGroupMembers = (group) =>
  group?.members?.filter((member) => member.isActive !== false) || [];

const getGroupMemberCount = (group) =>
  group?._count?.members ?? getActiveGroupMembers(group).length;

const getMemberDisplayName = (member, index) =>
  member?.user?.name || member?.user?.email?.split('@')[0] || `Member ${index + 1}`;

const ActionButton = ({ children, onClick, className = '', whileHover = { scale: 1.06, y: -1 }, whileTap = { scale: 0.94 }, ariaLabel }) => (
  <motion.button
    type="button" onClick={onClick}
    whileHover={whileHover} whileTap={whileTap}
    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    aria-label={ariaLabel}
    className={`flex items-center justify-center rounded-full transition-all active:scale-95 ${className}`}
  >
    {children}
  </motion.button>
);

const Card = ({ property, index = 0, compact = false }) => {
  const { user, hasActiveSubscription } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const initialGroup = getPrimaryGroup(property);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  const [liveMembers, setLiveMembers] = useState(() => getActiveGroupMembers(initialGroup));
  const [liveMembersCount, setLiveMembersCount] = useState(() => getGroupMemberCount(initialGroup));
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const nextGroup = getPrimaryGroup(property);
    setActiveGroup(nextGroup);
    setLiveMembers(getActiveGroupMembers(nextGroup));
    setLiveMembersCount(getGroupMemberCount(nextGroup));
  }, [property]);

  const applyGroupSnapshot = useCallback((group) => {
    setActiveGroup(group || null);
    setLiveMembers(getActiveGroupMembers(group));
    setLiveMembersCount(getGroupMemberCount(group));
  }, []);

  const refreshGroupMembers = useCallback(async () => {
    if (!property?.id) return;
    const res = await api.get(`/groups?propertyId=${property.id}`);
    applyGroupSnapshot(res.data?.groups?.[0] || null);
  }, [applyGroupSnapshot, property?.id]);

  useEffect(() => {
    const groupId = activeGroup?.id;
    if (!socket || !groupId) return;

    const handleMemberJoined = (data) => {
      if (data.groupId !== groupId) return;
      if (typeof data.memberCount === 'number') setLiveMembersCount(data.memberCount);
      refreshGroupMembers();
    };

    socket.emit('join-group-room', groupId);
    socket.on('member-joined', handleMemberJoined);
    return () => {
      socket.emit('leave-group-room', groupId);
      socket.off('member-joined', handleMemberJoined);
    };
  }, [activeGroup?.id, refreshGroupMembers, socket]);

  if (!property) return null;

  const targetPrice = Number(property.price) || 0;
  const originalPrice = Number(property.originalPrice || property.developerPrice) || targetPrice * 1.22;
  const savings = Math.max(originalPrice - targetPrice, 0);
  const discountPercent = Number(property.discountPercent) || (originalPrice ? Math.max(Math.round((savings / originalPrice) * 100), 12) : 18);
  const activeMembers = liveMembersCount;
  const maxMembers = activeGroup?.maxMembers || property.targetGroupSize || 6;
  const nextMember = Math.min(activeMembers + 1, maxMembers);
  const viewedCount = Number(property.views || property.viewCount) || 1289 + index * 583;
  const joinedLabel = activeMembers === 1 ? '1 member joined' : `${activeMembers} members joined`;
  const familyWord = activeMembers === 1 ? 'family' : 'families';
  const apartmentWord = activeMembers === 1 ? 'apartment' : 'apartments';
  const visibleMembers = liveMembers.slice(0, 4);
  const isMember = Boolean(user && liveMembers.some((member) => member.userId === user.id));
  const hiddenMembersCount = Math.max(activeMembers - visibleMembers.length, 0);
  const imageUrl = property.thumbnailUrl || property.image || property.images?.[0]?.url || property.images?.[0] || fallbackImage;
  const displayLocation = [property.locality || property.location || property.sector, property.city].filter(Boolean).join(', ') || property.address || 'Greater Noida';
  const imageLabel = property.locality || property.location || property.city || 'Greater Noida';
  const configLabel = property.bhk ? `${property.bhk} BHK` : property.category || 'Luxury Apartment';
  const subtitle = [displayLocation, configLabel].filter(Boolean).join(' | ');
  const watermarkLabel = property.title?.split(' ')[0]?.slice(0, 10).toUpperCase() || 'HOME';
  const propertyStatusLabel = property.propertyStatus?.name || property.status?.replace(/_/g, ' ') || 'Verified Deal';
  const visibleMemberNames = visibleMembers.map((member, memberIndex) => getMemberDisplayName(member, memberIndex));
  const memberSummary = visibleMemberNames.length
    ? visibleMemberNames.slice(0, 2).join(', ').concat(activeMembers > 2 ? ` +${activeMembers - 2}` : '')
    : 'No members yet';

  const imageHeightClass = compact ? 'h-[132px] sm:h-[144px]' : 'h-[168px]';
  const contentPadding = compact ? 'px-3.5 py-1.5' : 'px-4 py-2';
  const titleClass = compact
    ? 'line-clamp-2 text-[1.16rem] font-semibold leading-[1.02] text-[#171717]'
    : 'line-clamp-2 text-[1.4rem] font-semibold leading-[0.92] text-[#171717]';
  const priceBoxClass = compact
    ? 'mt-1 rounded-[16px] border border-[#ff9782] bg-[#fff0eb] px-3 py-1'
    : 'mt-1.5 rounded-[18px] border border-[#ff9782] bg-[#fff0eb] px-3.5 py-1.5';
  const targetPriceClass = compact
    ? 'mt-0.5 text-[1.35rem] font-semibold leading-none text-[#8f2114]'
    : 'mt-1 text-[1.6rem] font-semibold leading-none text-[#8f2114]';
  const groupBoxClass = compact
    ? 'mt-1 rounded-[16px] border border-[#ddd5cf] bg-white px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
    : 'mt-1.5 rounded-[18px] border border-[#ddd5cf] bg-white px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]';
  const actionBtnClass = compact ? 'h-10 rounded-[12px] text-[14px]' : 'h-12 rounded-[12px] text-[16px]';

  const requireLogin = () => { if (!user) { setShowLoginModal(true); return true; } return false; };
  const openPropertyDetails = () => navigate(`/properties/${property.id}`);
  const handleCardKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPropertyDetails();
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireLogin()) return;

    if (isMember) {
      toast.success('You already joined this group');
      return;
    }

    if (!hasActiveSubscription) {
      toast.error('Active subscription required');
      navigate('/subscriptions', { state: { action: 'JOIN_GROUP', propertyId: property.id } });
      return;
    }

    setJoining(true);
    try {
      const res = await api.post(`/groups/join/${property.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Successfully joined the group!');
        if (res.data.group) {
          applyGroupSnapshot(res.data.group);
        } else {
          await refreshGroupMembers();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
      if (error.response?.data?.needsSubscription) {
        navigate('/subscriptions', { state: { action: 'JOIN_GROUP', propertyId: property.id } });
      }
    } finally {
      setJoining(false);
    }
  };
  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (requireLogin()) return;
    try { const res = await api.post('/users/wishlist', { propertyId: property.id }); toast.success(res.data.message); }
    catch { toast.error('Failed to update wishlist'); }
  };
  const handleShare = (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/properties/${property.id}`;
    if (navigator.share) navigator.share({ title: property.title, url });
    else { navigator.clipboard.writeText(url); toast.success('Link copied to clipboard!'); }
  };
  const handleCompare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (requireLogin()) return;
    try {
      const res = await api.post('/users/comparison', { propertyId: property.id });
      if (!res.data.success) return;

      if (res.data.action === 'removed') {
        toast.success('Removed from comparison');
        return;
      }

      const comparisonRes = await api.get('/users/comparison');
      const comparisonCount = comparisonRes.data?.comparison?.length || 0;
      if (comparisonCount >= 2) {
        toast.success('Ready to compare');
        navigate('/comparison');
      } else {
        toast.success('Added to comparison. Add one more property.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Comparison limit reached');
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 }}
        role="link"
        tabIndex={0}
        onClick={openPropertyDetails}
        onKeyDown={handleCardKeyDown}
        className="group mx-auto flex h-full w-full cursor-pointer flex-col rounded-[24px] border border-[rgb(254,167,150)] bg-white shadow-[0_10px_30px_rgba(67,31,17,0.14)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(67,31,17,0.18)] focus:outline-none focus:ring-2 focus:ring-[#ff6647]/60"
      // ↑ NO overflow-hidden here — border shows on all 4 corners
      >

        {/* IMAGE — has its own overflow-hidden + border-radius */}
        <div className={`relative mx-3 mt-3 mb-0 ${imageHeightClass} overflow-hidden rounded-[18px] border-white bg-[#891f13] shadow-[0_10px_24px_rgba(30,20,12,0.12)]`}>
          <img
            src={imageUrl}
            alt={property.title}
            onError={(e) => { e.target.src = fallbackImage; }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(70,15,10,0.22),rgba(70,15,10,0.08)_40%,rgba(70,15,10,0.28))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,183,124,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,107,71,0.22),transparent_34%)]" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#f6b89f]/55  px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fff1e7] shadow-[0_16px_28px_rgba(79,25,18,0.34)] backdrop-blur-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/16 text-[#ffd3b2]"><ShieldCheck size={12} /></span>
            <span className="text-white">{propertyStatusLabel}</span>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <ActionButton onClick={handleWishlist} ariaLabel="Add to wishlist" whileHover={{ scale: 1.08, rotate: 4 }}
              className="relative h-8 w-8 overflow-hidden rounded-full border border-[#ffd5ca] bg-[linear-gradient(135deg,rgba(255,145,110,0.98),rgba(235,84,58,0.95))] text-white shadow-[0_14px_26px_rgba(235,84,58,0.3)]">
              <motion.span aria-hidden="true" className="absolute inset-1 rounded-full bg-white/24 blur-[7px]"
                animate={{ opacity: [0.18, 0.42, 0.18], scale: [0.9, 1.18, 0.9] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.span className="relative z-10 flex items-center justify-center"
                animate={{ scale: [1, 1.16, 1], y: [0, -1, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                <Heart size={12} strokeWidth={2.2} fill="rgba(255,255,255,0.18)" />
              </motion.span>
            </ActionButton>
            <ActionButton onClick={handleCompare} ariaLabel="Compare property"
              className="h-8 w-8 rounded-full border border-white/60 bg-[linear-gradient(135deg,rgba(35,31,28,0.88),rgba(100,66,50,0.86))] text-white shadow-[0_14px_24px_rgba(58,24,13,0.22)]">
              <GitCompareArrows size={12} strokeWidth={2.2} />
            </ActionButton>
            <ActionButton onClick={handleShare} ariaLabel="Share property"
              className="h-8 w-8 rounded-full border border-white/60 bg-white/92 text-white shadow-[0_14px_24px_rgba(58,24,13,0.18)] bg-[linear-gradient(135deg,rgba(255,183,124,0.94),rgba(255,107,71,0.92))]">
              <Share2 size={12} strokeWidth={2.2} />
            </ActionButton>
          </div>

          <div className="absolute left-4 top-[58px] text-[2.8rem] font-semibold uppercase leading-none text-white/10" style={{ fontFamily: '"Playfair Display", serif' }}>
            {watermarkLabel}
          </div>
          <button type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEnquiryModal(true); }}
            className="absolute bottom-2.5 right-4 flex h-8 w-8 items-center justify-center rounded-[12px] border border-[#ffd59a]/50 bg-[linear-gradient(135deg,rgba(255,198,107,0.94),rgba(228,117,57,0.94))] text-white shadow-[0_14px_26px_rgba(176,92,35,0.3)] transition-all hover:scale-105 hover:brightness-105">
            <Phone size={12} />
          </button>
        </div>

        {/* CONTENT */}
        <div className={`flex flex-1 flex-col ${contentPadding}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className={titleClass}>{property.title}</h4>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#4d4d4d]">
                <MapPin size={11} className="shrink-0 text-[#69615b]" />
                <span className="line-clamp-1">{subtitle}</span>
              </p>
            </div>
          </div>

          <div className={priceBoxClass}>
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#913224]">Target Price</p>
                <p className={targetPriceClass}>{formatCurrency(targetPrice)}</p>
                <p className="mt-0.5 text-[12px] font-medium text-[#c53d27]">Rs {Math.max(Math.round(savings / 100000), 0)} Lakh off</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium text-[#ff5b3b]">Developer price</p>
                <p className="mt-0.5 text-[12px] font-medium text-[#ff5b3b] line-through">{formatCurrency(originalPrice)}</p>
                <span className="mt-1.5 inline-flex rounded-full bg-[#ec5538] px-2.5 py-1 text-[10px] font-black text-white">{discountPercent}% off</span>
              </div>
            </div>
          </div>

          <div className={groupBoxClass}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[12px] font-black tracking-[0.16em] text-[#c93f26]">
                <span className="h-3 w-3 rounded-full bg-[#ec5538]" />
                Group buying in progress
              </div>
              <button type="button" className="flex items-center gap-1 text-[12px] font-medium text-[#736963]">
                Why group? <Info size={11} className="text-[#8d847e]" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[#dc4d33]">
              <TrendingUp size={11} />
              {joinedLabel}
            </div>
            <p className={`${compact ? 'mt-1 text-[13px]' : 'mt-1.5 text-[14px]'} font-medium leading-tight tracking-[-0.04em] text-[#171717]`}>
              {activeMembers} {familyWord} -&gt; {activeMembers} {apartmentWord}
            </p>
            <p className="mt-1 text-[12px] leading-tight text-[#ef4f35]">
              Join the group and be the {nextMember}{getOrdinal(nextMember)} member to join
            </p>
            <div className="mt-2.5 flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center pl-1">
                  {visibleMembers.map((member, mi) => {
                    const memberName = getMemberDisplayName(member, mi);
                    const avatarUrl = member.user?.avatar;

                    return (
                    <div key={member.id || member.userId || memberName}
                      className={`relative -ml-1.5 flex ${compact ? 'h-[26px] w-[26px] text-[0.66rem]' : 'h-[30px] w-[30px] text-[0.72rem]'} items-center justify-center rounded-full border-2 border-white bg-[#f9dcd6] font-black text-[#8f2114] shadow-[0_6px_14px_rgba(143,33,20,0.12)] first:ml-0`}
                      style={{ zIndex: visibleMembers.length - mi + 1 }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={memberName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        getInitials(memberName)
                      )}
                    </div>
                    );
                  })}
                  {hiddenMembersCount > 0 ? (
                    <div className="relative -ml-1.5 flex h-[30px] min-w-[2rem] items-center justify-center rounded-full border-2 border-white bg-[#f9dcd6] px-2 text-[0.62rem] font-black text-[#8f2114]" style={{ zIndex: 1 }}>
                      +{hiddenMembersCount}
                    </div>
                  ) : null}
                  {!isMember ? (
                    <div className="relative ml-2 flex h-[30px] min-w-[2.2rem] items-center justify-center rounded-full border-2 border-dashed border-[#ef4f35] bg-white px-2 text-[0.6rem] font-black text-[#ef4f35]" style={{ zIndex: 1 }}>
                      You
                    </div>
                  ) : null}
                </div>
                <p className="text-[10px] text-[#4d4d4d]">{memberSummary}</p>
              </div>
              <div className="mb-0.5 shrink-0 rounded-full border border-[#f08b76] px-2.5 py-1 text-center text-[10px] font-semibold leading-tight text-[#8f2114]">
                {activeMembers} / {maxMembers}
              </div>
            </div>
          </div>

          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button type="button" onClick={handleJoinGroup} disabled={joining || isMember}
              className={`${actionBtnClass} border border-[#2a241f]/20 bg-[#ff6647] font-semibold px-3 text-white tracking-[-0.03em] transition-all hover:-translate-y-0.5 hover:border-[#c93f26] hover:text-white disabled:cursor-not-allowed disabled:opacity-70`}>
              {joining ? <Loader2 size={18} className="mx-auto animate-spin" /> : isMember ? 'Joined' : 'Join Group'}
            </button>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPropertyDetails(); }}
              className={`${actionBtnClass} border border-[#2a241f]/20 bg-white px-3 font-medium tracking-[-0.03em] text-[#171717] transition-all hover:-translate-y-0.5 hover:border-[#171717] hover:bg-[#faf7f3]`}>
              Details
            </button>
          </div>

          <p className={`${compact ? 'mt-1 text-[11px]' : 'mt-1.5 text-[12px]'} text-center text-[#80746c]`}>
            {viewedCount.toLocaleString('en-IN')} buyers ne yeh project dekha
          </p>
        </div>

      </motion.article>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <EnquiryModal isOpen={showEnquiryModal} onClose={() => setShowEnquiryModal(false)} property={property} />
    </>
  );
};

export default Card;
