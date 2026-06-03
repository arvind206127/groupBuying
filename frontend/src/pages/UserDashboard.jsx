import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit,
  ExternalLink,
  Heart,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Repeat,
  Save,
  ShieldCheck,
  TrendingDown,
  User,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const tabs = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  { id: 'groups', name: 'Investments', icon: Users },
  { id: 'wishlist', name: 'Shortlist', icon: Heart },
  { id: 'comparison', name: 'Comparison', icon: Repeat },
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'billing', name: 'Membership', icon: CreditCard },
];

const mutedText = 'text-sm leading-6 text-slate-600';
const cardClass = 'rounded-lg border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]';
const primaryButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#db4a2b]';
const secondaryButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-[#db4a2b] hover:text-[#db4a2b]';

const formatPrice = (price) => {
  const value = Number(price || 0);
  if (!value) return 'Price on request';
  return `Rs. ${(value / 10000000).toFixed(2)} Cr`;
};

const formatLocation = (property = {}) => {
  const parts = [property.locality, property.city].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Premium location';
};

const getGroupProgress = (group = {}) => {
  const joined = group?._count?.members ?? group?.members?.length ?? 0;
  const maxMembers = Number(group?.maxMembers || 1);
  return Math.min(100, Math.round((joined / maxMembers) * 100));
};

const EmptyState = ({ icon: Icon, title, description, actionLabel, to }) => (
  <div className={`${cardClass} px-5 py-10 text-center`}>
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#fff2ed] text-[#db4a2b]">
      {React.createElement(Icon, { size: 22 })}
    </div>
    <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
    <Link to={to} className={`${primaryButton} mt-5`}>
      {actionLabel}
      <ArrowRight size={16} />
    </Link>
  </div>
);

const SectionHeader = ({ title, caption, action }) => (
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      {caption ? <p className="mt-1 text-sm text-slate-500">{caption}</p> : null}
    </div>
    {action}
  </div>
);

const PropertyThumb = ({ property, className = 'h-20 w-24' }) => (
  <div className={`${className} flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100`}>
    {property?.thumbnailUrl ? (
      <img
        src={property.thumbnailUrl}
        alt={property.title || 'Property'}
        className="h-full w-full object-cover"
      />
    ) : (
      <Building2 size={22} className="text-slate-400" />
    )}
  </div>
);

const ProgressBar = ({ value }) => (
  <div
    className="h-2 overflow-hidden rounded-full bg-slate-100"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={value}
  >
    <div className="h-full rounded-full bg-[#db4a2b] transition-all duration-500" style={{ width: `${value}%` }} />
  </div>
);

const StatCard = ({ icon: Icon, label, value, tone = 'light', onClick }) => {
  const dark = tone === 'dark';
  return (
    <div
      onClick={onClick}
      className={`${cardClass} p-4 ${dark ? 'border-slate-950 bg-slate-950 text-white' : ''} ${onClick ? 'cursor-pointer hover:border-[#db4a2b] transition-colors hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={dark ? 'text-sm text-white/65' : 'text-sm text-slate-500'}>{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${dark ? 'bg-white/10 text-white' : 'bg-[#fff2ed] text-[#db4a2b]'}`}>
          {React.createElement(Icon, { size: 20 })}
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user, handleLogout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeGroups, setActiveGroups] = useState([]);
  const [rm, setRm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', budget: '' });
  const [wishlist, setWishlist] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const socket = useSocket();

  const displayName = user?.name || 'GroupBuying Member';
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.name || 'Overview';
  const memberCode = useMemo(() => user?.id?.slice(0, 6)?.toUpperCase() || 'MEMBER', [user?.id]);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, rmRes, compRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/my-rm'),
        api.get('/users/comparison'),
      ]);

      if (profileRes.data.success) {
        const profile = profileRes.data.user;
        setActiveGroups(profile.groupMembers || []);
        setWishlist(profile.wishlist || []);
        setFormData({
          name: profile.name || '',
          phone: profile.phone || '',
          city: profile.city || '',
          budget: profile.budget || '',
        });
      }

      if (rmRes.data.success) setRm(rmRes.data.rm);
      if (compRes.data.success) setComparisons(compRes.data.comparison || []);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (!socket) return undefined;

    socket.on('member-joined', fetchUserData);
    socket.on('group-full', (data) => {
      toast.success(data.message, { duration: 8000 });
      fetchUserData();
    });

    return () => {
      socket.off('member-joined');
      socket.off('group-full');
    };
  }, [fetchUserData, socket]);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    try {
      const res = await api.put('/users/profile', formData);
      if (res.data.success) {
        toast.success('Profile updated');
        setShowEditProfile(false);
        fetchUserData();
        if (refreshUser) refreshUser();
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const handleRemoveWishlist = async (propertyId) => {
    try {
      await api.post('/users/wishlist', { propertyId });
      fetchUserData();
      toast.success('Removed from shortlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleRemoveComparison = async (propertyId) => {
    try {
      await api.post('/users/comparison', { propertyId });
      fetchUserData();
      toast.success('Removed from comparison');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f7f9] text-slate-700">
        <Loader2 className="animate-spin text-[#db4a2b]" size={36} />
        <p className="text-sm font-medium">Loading dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-5 sm:px-5 lg:grid-cols-[264px_minmax(0,1fr)] lg:px-6">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
          <div className={`${cardClass} flex h-full flex-col p-3`}>
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-base font-semibold text-white">
                {(displayName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                <p className="mt-1 text-xs text-slate-500">Member ID: {memberCode}</p>
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {tabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${isActive
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                  >
                    <Icon size={17} />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 lg:mt-auto">
              <Link to="/" className={secondaryButton}>
                <Home size={16} />
                Visit website
              </Link>
              <button type="button" onClick={handleLogout} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#fff2ed] px-4 text-sm font-semibold text-[#db4a2b] transition-colors hover:bg-[#db4a2b] hover:text-white">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-[#f2c6b8] bg-white px-3 py-1 text-sm font-medium text-[#db4a2b]">
                <CheckCircle2 size={16} />
                Verified member
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-950">{activeLabel}</h1>
              <p className={`${mutedText} mt-2 max-w-2xl`}>
                Manage investments, shortlisted homes, comparisons, and profile details from one focused workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/properties" className={primaryButton}>
                Browse properties
                <ArrowRight size={16} />
              </Link>
              {activeTab === 'profile' ? (
                <button type="button" onClick={() => setShowEditProfile(true)} className={secondaryButton}>
                  <Edit size={16} />
                  Edit profile
                </button>
              ) : null}
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.section
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={Building2} label="Active investments" value={activeGroups.length} onClick={() => setActiveTab('groups')} />
                    <StatCard icon={Heart} label="Shortlisted homes" value={wishlist.length} onClick={() => setActiveTab('wishlist')} />
                    <StatCard icon={Repeat} label="Compared assets" value={`${comparisons.length}/4`} onClick={() => setActiveTab('comparison')} />
                    <StatCard icon={TrendingDown} label="Estimated savings" value="Rs. 12.5L+" />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
                    <section>
                      <SectionHeader
                        title="Current portfolio"
                        caption="Track joined groups and their member progress."
                        action={
                          <Link to="/properties" className="text-sm font-semibold text-[#db4a2b] hover:text-slate-950">
                            Browse more
                          </Link>
                        }
                      />

                      {activeGroups.length > 0 ? (
                        <div className="grid gap-3">
                          {activeGroups.map((member) => {
                            const group = member.group || {};
                            const property = group.property || {};
                            const progress = getGroupProgress(group);

                            return (
                              <article key={member.id} className={`${cardClass} p-4 transition-shadow hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]`}>
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div className="flex min-w-0 gap-4">
                                    <PropertyThumb property={property} />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-[#db4a2b]">{property.city || 'Premium location'}</p>
                                      <h3 className="mt-1 truncate text-base font-semibold text-slate-950">
                                        {property.title || 'Property group'}
                                      </h3>
                                      <p className="mt-1 truncate text-sm text-slate-500">{formatLocation(property)}</p>
                                      <div className="mt-3 max-w-sm">
                                        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                                          <span>Group progress</span>
                                          <span>{progress}%</span>
                                        </div>
                                        <ProgressBar value={progress} />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 gap-2 md:justify-end">
                                    {group.whatsappGroupLink ? (
                                      <a
                                        href={group.whatsappGroupLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#16a34a] text-white transition-colors hover:bg-[#15803d]"
                                        title="Open group chat"
                                      >
                                        <MessageSquare size={17} />
                                      </a>
                                    ) : null}
                                    <Link to={`/properties/${property.id}`} className={secondaryButton}>
                                      Details
                                      <ArrowRight size={16} />
                                    </Link>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <EmptyState
                          icon={Building2}
                          title="No groups joined yet"
                          description="Explore live property groups and join the ones that match your budget and location."
                          actionLabel="Explore properties"
                          to="/properties"
                        />
                      )}
                    </section>

                    <section className="grid content-start gap-4">
                      <div className={`${cardClass} p-4`}>
                        <SectionHeader title="Relationship manager" caption="Your assigned support contact." />
                        {rm ? (
                          <div className="rounded-md bg-slate-950 p-4 text-white">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-950">
                                {rm.name?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold">{rm.name}</h3>
                                <p className="mt-1 text-xs text-white/60">Assigned manager</p>
                              </div>
                            </div>
                            <div className="mt-4 grid gap-2 text-sm text-white/80">
                              <div className="flex items-center gap-2 rounded-md bg-white/8 px-3 py-2">
                                <Phone size={15} />
                                {rm.phone || 'Contact request pending'}
                              </div>
                              <div className="flex min-w-0 items-center gap-2 rounded-md bg-white/8 px-3 py-2">
                                <Mail size={15} />
                                <span className="truncate">{rm.email || 'Email not available'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
                            A relationship manager will be assigned shortly.
                          </p>
                        )}
                      </div>

                      <div className={`${cardClass} p-4`}>
                        <h2 className="text-lg font-semibold text-slate-950">Next best action</h2>
                        <p className={`${mutedText} mt-2`}>
                          Compare up to four properties before shortlisting. It keeps price, location, and developer details easy to scan.
                        </p>
                        <Link to="/properties" className={`${secondaryButton} mt-4 w-full`}>
                          Find properties
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'groups' && (
                <section>
                  <SectionHeader
                    title="Investments"
                    caption={`${activeGroups.length} active investment${activeGroups.length === 1 ? '' : 's'}`}
                  />
                  {activeGroups.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeGroups.map((member) => {
                        const property = member.group?.property || {};

                        return (
                          <Link
                            key={member.id}
                            to={`/properties/${property.id}`}
                            className={`${cardClass} group overflow-hidden transition-shadow hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]`}
                          >
                            <PropertyThumb property={property} className="aspect-[16/9] h-auto w-full rounded-none" />
                            <div className="p-4">
                              <p className="text-sm font-medium text-[#db4a2b]">{property.city || 'Location'}</p>
                              <h3 className="mt-1 truncate text-base font-semibold text-slate-950">
                                {property.title || 'Property group'}
                              </h3>
                              <p className="mt-2 text-sm text-slate-500">{formatLocation(property)}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="No investments yet"
                      description="Join a group to start tracking your property investment activity here."
                      actionLabel="Browse properties"
                      to="/properties"
                    />
                  )}
                </section>
              )}

              {activeTab === 'wishlist' && (
                <section>
                  <SectionHeader title="Saved properties" caption={`${wishlist.length} saved item${wishlist.length === 1 ? '' : 's'}`} />
                  {wishlist.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {wishlist.map((item) => {
                        const property = item.property || {};
                        const propertyId = item.propertyId || property.id;

                        return (
                          <article key={item.id} className={`${cardClass} overflow-hidden transition-shadow hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]`}>
                            <div className="relative">
                              <PropertyThumb property={property} className="aspect-[16/10] h-auto w-full rounded-none" />
                              <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#db4a2b] shadow-sm">
                                <Heart size={16} fill="currentColor" />
                              </span>
                            </div>
                            <div className="p-4">
                              <p className="text-sm font-medium text-[#db4a2b]">{property.city || 'Location'}</p>
                              <h3 className="mt-1 truncate text-base font-semibold text-slate-950">
                                {property.title || 'Saved property'}
                              </h3>
                              <p className="mt-2 text-sm text-slate-500">{formatLocation(property)}</p>
                              <div className="mt-4 flex gap-2">
                                <Link to={`/properties/${property.id}`} className={`${primaryButton} flex-1`}>
                                  View details
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWishlist(propertyId)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-[#db4a2b] transition-colors hover:bg-[#fff2ed]"
                                  title="Remove from shortlist"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Heart}
                      title="Your shortlist is empty"
                      description="Save properties you like and come back to compare them later."
                      actionLabel="Start exploring"
                      to="/properties"
                    />
                  )}
                </section>
              )}

              {activeTab === 'comparison' && (
                <section>
                  <SectionHeader title="Market comparison" caption={`${comparisons.length}/4 properties selected`} />
                  {comparisons.length > 0 ? (
                    <div className={`${cardClass} overflow-hidden`}>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse">
                          <thead className="bg-slate-950 text-white">
                            <tr>
                              <th className="w-44 px-4 py-3 text-left text-sm font-semibold">Attribute</th>
                              {comparisons.map((item) => {
                                const property = item.property || {};

                                return (
                                  <th key={item.id} className="min-w-[210px] px-4 py-3 text-left">
                                    <div className="flex items-center gap-3">
                                      <PropertyThumb property={property} className="h-10 w-10" />
                                      <span className="truncate text-sm font-semibold">{property.title || 'Property'}</span>
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {[
                              ['Price', (property) => formatPrice(property.price)],
                              ['Space', (property) => `${property.bhk || 'N/A'} BHK | ${property.area || 'N/A'} sq.ft.`],
                              ['Developer', (property) => property.developer?.name || 'Developer'],
                              ['Location', (property) => formatLocation(property)],
                            ].map(([label, getValue]) => (
                              <tr key={label}>
                                <td className="bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">{label}</td>
                                {comparisons.map((item) => (
                                  <td key={item.id} className="px-4 py-4 text-sm font-semibold text-slate-950">
                                    {getValue(item.property || {})}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            <tr>
                              <td className="bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">Action</td>
                              {comparisons.map((item) => {
                                const property = item.property || {};
                                const propertyId = item.propertyId || property.id;

                                return (
                                  <td key={item.id} className="px-4 py-4">
                                    <div className="flex gap-2">
                                      <Link to={`/properties/${property.id}`} className={`${primaryButton} flex-1`}>
                                        Inspect
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComparison(propertyId)}
                                        className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-[#db4a2b] transition-colors hover:bg-[#fff2ed]"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Repeat}
                      title="Comparison is empty"
                      description="Add properties to comparison to review price, location, and developer side by side."
                      actionLabel="Select properties"
                      to="/properties"
                    />
                  )}
                </section>
              )}

              {activeTab === 'profile' && (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                  <section>
                    <SectionHeader title="Personal information" caption="Keep contact details accurate for property updates." />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: 'Full name', value: user?.name || 'Not set', icon: User },
                        { label: 'Email', value: user?.email || 'Not set', icon: Mail },
                        { label: 'Phone', value: user?.phone || 'Not set', icon: Phone },
                        { label: 'City', value: user?.city || 'Not set', icon: MapPin },
                      ].map((info) => {
                        const Icon = info.icon;

                        return (
                          <div key={info.label} className={`${cardClass} flex items-center gap-3 p-4`}>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#fff2ed] text-[#db4a2b]">
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-slate-500">{info.label}</p>
                              <p className="mt-1 truncate text-sm font-semibold text-slate-950">{info.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="grid content-start gap-4">
                    <div className={`${cardClass} bg-slate-950 p-5 text-black`}>
                      <ShieldCheck size={26} className="text-[#ffb199]" />
                      <h3 className="mt-4 text-lg font-semibold">Account settings</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Update contact details so alerts and relationship manager follow-ups reach the right place.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowEditProfile(true)}
                        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#fff2ed] hover:text-[#db4a2b]"
                      >
                        <Edit size={16} />
                        Edit profile
                      </button>
                    </div>

                    <div className={`${cardClass} p-5`}>
                      <h3 className="text-lg font-semibold text-slate-950">Quick actions</h3>
                      <div className="mt-4 grid gap-2">
                        <Link to="/" className={`${secondaryButton} justify-between`}>
                          Visit website
                          <ExternalLink size={16} />
                        </Link>
                        <button type="button" onClick={handleLogout} className="inline-flex h-10 items-center justify-between rounded-md bg-[#fff2ed] px-4 text-sm font-semibold text-[#db4a2b] transition-colors hover:bg-[#db4a2b] hover:text-white">
                          Logout
                          <LogOut size={16} />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'billing' && (
                <section className={`${cardClass} overflow-hidden`}>
                  <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#fff2ed] text-[#db4a2b]">
                        <CreditCard size={24} />
                      </div>
                      <h2 className="mt-4 text-xl font-semibold text-slate-950">Membership</h2>
                      <p className={`${mutedText} mt-2 max-w-2xl`}>
                        Membership details and subscription options are available here when you need to review or upgrade your plan.
                      </p>
                    </div>
                    <Link to="/subscriptions" className={primaryButton}>
                      View plans
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </section>
              )}
            </motion.section>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-[0_35px_90px_rgba(15,23,42,0.28)]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h3 className="text-lg font-semibold text-slate-950">Edit profile</h3>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="rounded-md p-2 text-slate-500 transition-colors hover:bg-white hover:text-[#db4a2b]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid gap-4 p-5">
                {[
                  { label: 'Name', key: 'name', type: 'text', required: true },
                  { label: 'Phone', key: 'phone', type: 'text' },
                  { label: 'City', key: 'city', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block text-sm font-medium text-slate-700">{field.label}</label>
                    <input
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(event) => setFormData({ ...formData, [field.key]: event.target.value })}
                      className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition-colors focus:border-[#db4a2b] focus:ring-4 focus:ring-[#db4a2b]/10"
                      required={field.required}
                    />
                  </div>
                ))}
                <div className="mt-2 flex gap-3">
                  <button type="button" onClick={() => setShowEditProfile(false)} className={`${secondaryButton} flex-1`}>
                    Cancel
                  </button>
                  <button type="submit" className={`${primaryButton} flex-1`}>
                    <Save size={16} />
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
