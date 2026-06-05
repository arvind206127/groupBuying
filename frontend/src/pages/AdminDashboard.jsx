import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
    Users, Building2, Handshake, MessageSquare, 
    BarChart3, LogOut, Search, Plus, Edit, Trash2, 
    X, Loader2, ChevronRight, Download, Mail, Phone, Sparkles, Play, Settings, ShieldCheck
} from 'lucide-react';

const sortByName = (records = []) => [...records].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
const FALLBACK_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400';
const API_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

const getAdminImageUrl = (value) => {
    if (!value) return '';
    if (/^(https?:\/\/|data:image\/|blob:)/i.test(value)) return value;
    if (value.startsWith('/')) return `${API_ORIGIN}${value}`;
    if (value.startsWith('uploads/')) return `${API_ORIGIN}/${value}`;
    return value;
};

const getPropertyPreviewImage = (property) => getAdminImageUrl(
    property?.thumbnailUrl
    || property?.image
    || property?.imageUrl
    || property?.images?.[0]?.url
    || property?.images?.[0]
);

const getSavedGalleryImages = (value) => {
    const normalize = (item) => {
        if (!item) return '';
        if (typeof item === 'string') return getAdminImageUrl(item.trim());
        return getAdminImageUrl(item.url || item.imageUrl || item.src || item.path || '');
    };

    if (Array.isArray(value)) {
        return value.map(normalize).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split('\n')
            .map(normalize)
            .filter(Boolean);
    }

    return [];
};

const HERO_DEFAULTS = {
  heroBgColor: '#f66f52',
  heroTagline: 'Looking to buy your Dream Home?',
  heroHeadingLine1: 'Pay Less',
  heroHeadingLine2: 'Together',
  heroSubtext: 'Get Group Buying Discounts +\n100% Broker Commission Cashback',
  heroBtnText: 'Become Member',
  heroBtnSubtext: 'Lifetime Membership Join once, save for life',
  heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=90&w=1200',
  heroImageAlt: 'Premium apartment building',
  heroSavingsText: "We've saved Rs.25Cr+ for 150+ Families",
  heroSavingsSubtext: "Buyer's on TogetherBuying save 10-15% more than market prices",
  heroGroupBuyTitle: 'Buy as a Group',
  heroGroupBuyBadge: 'Get 5-10% Extra Discount',
  heroGroupBuyDesc1: 'Each member purchases their own apartment',
  heroGroupBuyDesc2: 'Join 3-7 buyers in the same project and negotiate directly.',
  heroCashbackTitle: 'Get 3-5% Cashback',
  heroCashbackBadge: 'Limited Time Offer',
  heroCashbackDesc: 'We pass back the entire broker commission 100% as extra savings on your home purchase.',
  heroCashbackHighlight: 'On a Rs.2Cr home, you save Rs.6L - Rs.10L instantly!',
  showFloatingReel: 'true',
  floatingReelTitle: 'Exclusive Group Buying Offer!',
  floatingReelDesc: 'See how to save 25L+ today.',
  floatingReelVideo: 'https://v.ftcdn.net/08/42/97/34/700_F_842973413_jI8aW7D06v9aYx0h9W0vW5qY9v9q9v9q_ST.mp4',
  floatingReelThumbnail: '',
};

const PROPERTY_DISPLAY_SECTIONS = [
  { v: '', l: 'None' },
  { v: 'FAST_SELLING', l: 'Fast Selling Properties' },
  { v: 'TRENDING', l: 'Trending Properties' },
  { v: 'PRE_LAUNCH', l: 'Pre-Launch Properties' },
  { v: 'FEATURED_COMMERCIAL', l: 'Featured Commercial Properties' },
  { v: 'PROMINSHES_AND_PLOTS', l: 'Promising Plots & Villas' },
];

const PROPERTY_CATEGORIES = [
  { v: 'Residential', l: 'Residential' },
  { v: 'Commercial', l: 'Commercial' },
  { v: 'Plots', l: 'Plots' },
  { v: 'Villa', l: 'Villa' },
];

const BHK_CONFIG_OPTIONS = [1, 2, 3, 4, 5, 6].map((value) => ({ value, label: `${value} BHK` }));
const PRICE_UNIT_OPTIONS = [
    { value: 10000000, label: 'Cr' },
    { value: 100000, label: 'Lakh' },
];

const POSSESSION_STATUSES = [
  { v: 'Under Construction', l: 'Under Construction' },
  { v: 'Ready to Sale', l: 'Ready to Sale' },
  { v: 'Ready to Move', l: 'Ready to Move' },
  { v: 'Pre-Launch', l: 'Pre-Launch' },
  { v: 'Sold Out', l: 'Sold Out' },
];

const arrayToTextarea = (value) => Array.isArray(value) ? value.join('\n') : (value || '');

const floorPlansToTextarea = (value) => Array.isArray(value)
  ? value.map((plan) => [plan.label, plan.price, plan.area, plan.imageUrl, plan.priceTo].filter(Boolean).join(' | ')).join('\n')
  : (value || '');

const nearbyPlacesToTextarea = (value) => Array.isArray(value)
  ? value.map((place) => [place.category, place.name, place.address, place.distance, place.time].filter(Boolean).join(' | ')).join('\n')
  : (value || '');

const toDateInputValue = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toISOString().slice(0, 10);
};

const getBhkFromLabel = (label = '') => {
    const match = String(label).match(/\d+/);
    return match ? Number(match[0]) : null;
};

const looksLikeImageUrl = (value = '') => /^(https?:\/\/|\/|uploads\/|data:image\/|blob:)/i.test(String(value).trim())
    || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(String(value).trim());

const looksLikeArea = (value = '') => /(sq\.?\s*ft|sqft|square\s*feet|acre|acres|sq\.?\s*m|sqm|yard|yd)/i.test(String(value).trim());

const parsePlanPrice = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const text = String(value).replace(/,/g, '').trim();
    const match = text.match(/[\d.]+/);
    if (!match) return null;
    let number = Number(match[0]);
    if (!Number.isFinite(number)) return null;
    if (/cr|crore/i.test(text)) number *= 10000000;
    if (/lac|lakh/i.test(text)) number *= 100000;
    return number;
};

const parsePlanAreaNumber = (value) => {
    const match = String(value || '').replace(/,/g, '').match(/[\d.]+/);
    const number = match ? Number(match[0]) : null;
    return Number.isFinite(number) ? number : null;
};

const getPlanPriceUnit = (row, field) => {
    const storedUnit = Number(row?.[`${field}Unit`]);
    if (storedUnit) return storedUnit;

    const text = String(row?.[field] || '');
    if (/lac|lakh/i.test(text)) return 100000;
    if (/cr|crore/i.test(text)) return 10000000;

    const price = parsePlanPrice(row?.[field]);
    return price && price < 10000000 ? 100000 : 10000000;
};

const getPlanPriceRaw = (row, field) => {
    const price = parsePlanPrice(row?.[field]);
    if (!Number.isFinite(price) || price <= 0) return '';

    const unit = getPlanPriceUnit(row, field);
    return Number((price / unit).toFixed(3));
};

const formatPlanPriceInput = (raw, unit) => {
    if (raw === undefined || raw === null || raw === '') return '';
    return `${raw} ${unit === 10000000 ? 'Cr' : 'Lakh'}`;
};

const buildPriceFormParts = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return {};
    if (number >= 10000000) return { price_raw: number / 10000000, price_unit: 10000000 };
    if (number >= 100000) return { price_raw: number / 100000, price_unit: 100000 };
    return { price_raw: number, price_unit: 1 };
};

const parseBhkPlanRows = (value) => {
    const source = Array.isArray(value)
        ? value
        : String(value || '').split('\n').map((line) => line.trim()).filter(Boolean);

    return source.map((item) => {
        if (typeof item === 'object' && item !== null) {
            const label = item.label || item.title || item.name || item.configuration || (item.bhk ? `${item.bhk} BHK` : '');
            const bhk = Number(item.bhk) || getBhkFromLabel(label);
            return {
                bhk,
                label: label || (bhk ? `${bhk} BHK` : 'BHK Plan'),
                price: item.price || item.minPrice || item.priceFrom || '',
                priceTo: item.priceTo || item.maxPrice || item.priceTill || '',
                area: item.area || item.superArea || item.carpetArea || item.size || '',
                imageUrl: item.imageUrl || item.url || item.src || item.image || item.blueprintImage || item.blueprintUrl || item.planImage || item.planUrl || '',
            };
        }

        const [labelPart = '', ...parts] = String(item).split('|').map((part) => part.trim());
        const [first = '', second = '', third = '', fourth = ''] = parts;
        let price = first;
        let area = second;
        let imageUrl = third;
        let priceTo = fourth;

        if (looksLikeImageUrl(first)) {
            imageUrl = first;
            area = second;
            price = third;
            priceTo = fourth;
        } else if (looksLikeArea(first)) {
            area = first;
            price = second;
            imageUrl = third;
            priceTo = fourth;
        }

        if (!looksLikeImageUrl(imageUrl)) {
            const detectedImageUrl = parts.find(looksLikeImageUrl);
            if (detectedImageUrl) imageUrl = detectedImageUrl;
        }

        const bhk = getBhkFromLabel(labelPart);
        return {
            bhk,
            label: labelPart || (bhk ? `${bhk} BHK` : 'BHK Plan'),
            price,
            priceTo,
            area,
            imageUrl,
        };
    }).filter((row) => row.bhk || row.label || row.price || row.area || row.imageUrl);
};

const serializeBhkPlanRows = (rows) => rows
    .filter((row) => row.bhk || row.label || row.price || row.area || row.imageUrl)
    .sort((a, b) => (Number(a.bhk) || 99) - (Number(b.bhk) || 99))
    .map((row) => [
        row.label || (row.bhk ? `${row.bhk} BHK` : 'BHK Plan'),
        row.price || '',
        row.area || '',
        row.imageUrl || '',
        row.priceTo || '',
    ].filter(Boolean).join(' | '))
    .join('\n');

const getBhkPlanMeta = (rows) => {
    const activeRows = rows.filter((row) => row.bhk || row.price || row.area || row.imageUrl);
    const bhks = activeRows.map((row) => Number(row.bhk)).filter((value) => Number.isFinite(value));
    const prices = activeRows.flatMap((row) => [parsePlanPrice(row.price), parsePlanPrice(row.priceTo)]).filter((value) => Number.isFinite(value));
    const primaryRow = activeRows.sort((a, b) => (Number(a.bhk) || 99) - (Number(b.bhk) || 99))[0];

    return {
        text: serializeBhkPlanRows(activeRows),
        primaryBhk: bhks.length ? Math.min(...bhks) : '',
        minPrice: prices.length ? Math.min(...prices) : '',
        primaryArea: parsePlanAreaNumber(primaryRow?.area) || '',
    };
};

const PlanPriceInput = ({ label, row, field, onChange, placeholder = '0.00' }) => {
    const unit = getPlanPriceUnit(row, field);
    const rawValue = getPlanPriceRaw(row, field);

    const updatePrice = (raw, nextUnit = unit) => {
        onChange({
            [field]: formatPlanPriceInput(raw, nextUnit),
            [`${field}Unit`]: nextUnit,
        });
    };

    return (
        <div>
            <label className="text-[11px] font-semibold text-slate-500">{label}</label>
            <div className="mt-1 flex overflow-hidden rounded-md border border-slate-200 bg-white focus-within:border-[#db4a2b]">
                <input
                    type="number"
                    step="any"
                    value={rawValue}
                    onChange={(event) => updatePrice(event.target.value)}
                    className="h-10 min-w-0 flex-1 px-3 text-sm font-semibold outline-none"
                    placeholder={placeholder}
                />
                <select
                    value={unit}
                    onChange={(event) => updatePrice(rawValue, Number(event.target.value))}
                    className="h-10 w-20 border-l border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none"
                >
                    {PRICE_UNIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const BhkPlansBuilder = ({ value, files = {}, onChange, onFileChange }) => {
    const rows = parseBhkPlanRows(value);
    const selectedBhks = new Set(rows.map((row) => row.bhk).filter(Boolean));

    const updateRows = (nextRows) => onChange(getBhkPlanMeta(nextRows));

    const toggleBhk = (bhk) => {
        if (selectedBhks.has(bhk)) {
            updateRows(rows.filter((row) => row.bhk !== bhk));
            return;
        }
        updateRows([...rows, { bhk, label: `${bhk} BHK`, price: '', priceTo: '', area: '', imageUrl: '' }]);
    };

    const updateRow = (bhk, patch) => {
        updateRows(rows.map((row) => row.bhk === bhk ? { ...row, ...patch } : row));
    };

    const selectedRows = BHK_CONFIG_OPTIONS
        .filter((option) => selectedBhks.has(option.value))
        .map((option) => rows.find((row) => row.bhk === option.value) || { bhk: option.value, label: option.label });

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
                {BHK_CONFIG_OPTIONS.map((option) => {
                    const selected = selectedBhks.has(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleBhk(option.value)}
                            className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                                selected
                                    ? 'border-[#db4a2b] bg-[#db4a2b] text-white shadow-sm'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#db4a2b]/40 hover:bg-[#db4a2b]/5'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            {selectedRows.length ? (
                <div className="mt-4 space-y-3">
                    {selectedRows.map((row) => (
                        <div key={row.bhk} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-5">
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500">Config</label>
                                <input
                                    value={row.label || `${row.bhk} BHK`}
                                    onChange={(event) => updateRow(row.bhk, { label: event.target.value })}
                                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#db4a2b]"
                                />
                            </div>
                            <PlanPriceInput
                                label="Price From"
                                row={row}
                                field="price"
                                onChange={(patch) => updateRow(row.bhk, patch)}
                                placeholder="1.23"
                            />
                            <PlanPriceInput
                                label="Price To"
                                row={row}
                                field="priceTo"
                                onChange={(patch) => updateRow(row.bhk, patch)}
                                placeholder="Optional"
                            />
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500">Area</label>
                                <input
                                    value={row.area || ''}
                                    onChange={(event) => updateRow(row.bhk, { area: event.target.value })}
                                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#db4a2b]"
                                    placeholder="1250 sq.ft."
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500">Blueprint Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => onFileChange?.(row.bhk, event.target.files?.[0] || null)}
                                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-[#db4a2b]"
                                />
                                <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">
                                    {files[row.bhk]?.name || (row.imageUrl ? 'Current image saved' : 'No image selected')}
                                </p>
                                {row.imageUrl ? (
                                    <img
                                        src={getAdminImageUrl(row.imageUrl)}
                                        alt={`${row.label || row.bhk} blueprint preview`}
                                        className="mt-2 h-14 w-full rounded-md border border-slate-200 object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-500">
                    Select one or more BHK options, then add each BHK price, area, and blueprint URL.
                </p>
            )}
        </div>
    );
};

const GalleryFilePicker = ({ field, formData, setFormData }) => {
    const selectedFiles = Array.isArray(formData[field.name]) ? formData[field.name] : [];
    const savedImages = field.name === 'imagesFileList' ? getSavedGalleryImages(formData.images) : [];
    const removeSavedImage = (removeIndex) => {
        setFormData((previous) => {
            const currentImages = getSavedGalleryImages(previous.images);
            return {
                ...previous,
                images: currentImages.filter((_, imageIndex) => imageIndex !== removeIndex).join('\n'),
            };
        });
    };
    const removeSelectedFile = (removeIndex) => {
        setFormData((previous) => {
            const currentFiles = Array.isArray(previous[field.name]) ? previous[field.name] : [];
            return {
                ...previous,
                [field.name]: currentFiles.filter((_, fileIndex) => fileIndex !== removeIndex),
            };
        });
    };

    return (
        <div className="rounded-xl border-2 border-dashed border-[#db4a2b]/30 bg-[#fff7f4] p-4">
            <input
                id={`field-${field.name}`}
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                    const pickedFiles = Array.from(event.target.files || []);
                    setFormData((previous) => {
                        const currentFiles = Array.isArray(previous[field.name]) ? previous[field.name] : [];
                        return {
                            ...previous,
                            [field.name]: [...currentFiles, ...pickedFiles],
                        };
                    });
                    event.target.value = '';
                }}
                className="hidden"
            />
            <label
                htmlFor={`field-${field.name}`}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-white px-4 py-6 text-center shadow-sm transition hover:bg-[#fff0ea]"
            >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#db4a2b] text-white">
                    <Plus size={20} />
                </span>
                <span className="mt-3 text-sm font-bold text-slate-900">Choose Multiple Gallery Images</span>
                <span className="mt-1 text-xs font-semibold text-slate-500">You can select many images together. URL not needed.</span>
            </label>

            {savedImages.length > 0 ? (
                <div className="mt-3 rounded-lg bg-white p-3 text-xs font-semibold text-slate-600">
                    <p>Already saved images ({savedImages.length})</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                        {savedImages.map((imageUrl, imageIndex) => (
                            <div key={`${imageUrl}-${imageIndex}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => removeSavedImage(imageIndex)}
                                    aria-label={`Remove saved gallery image ${imageIndex + 1}`}
                                    className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#db4a2b] shadow-md transition hover:bg-[#db4a2b] hover:text-white"
                                >
                                    <X size={13} strokeWidth={3} />
                                </button>
                                <img
                                    src={imageUrl}
                                    alt={`Saved gallery ${imageIndex + 1}`}
                                    className="h-20 w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                    }}
                                />
                                <p className="truncate px-2 py-1 text-[10px] text-slate-500">Saved image {imageIndex + 1}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {selectedFiles.length > 0 ? (
                <div className="mt-3 rounded-lg bg-white p-3 text-xs font-semibold text-slate-600">
                    <p>New selected images ({selectedFiles.length})</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                        {selectedFiles.map((file, fileIndex) => (
                            <div key={`${file.name}-${fileIndex}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => removeSelectedFile(fileIndex)}
                                    aria-label={`Remove selected gallery image ${fileIndex + 1}`}
                                    className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#db4a2b] shadow-md transition hover:bg-[#db4a2b] hover:text-white"
                                >
                                    <X size={13} strokeWidth={3} />
                                </button>
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-20 w-full object-cover"
                                />
                                <p className="truncate px-2 py-1 text-[10px] text-slate-500">{file.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const AdminDashboard = () => {
    const { user, handleLogout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [items, setItems] = useState([]);
    const [rms, setRms] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [propertyStatuses, setPropertyStatuses] = useState([]);
    const [properties, setProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [expandedGroupId, setExpandedGroupId] = useState(null);

    const socket = useSocket();

    useEffect(() => {
        fetchStats();
        fetchSupportData();
    }, []);

    // Effect to redirect to a permitted tab if the user doesn't have access to the current one
    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            let perms = user.permissions;
            if (typeof perms === 'string') {
                try { perms = JSON.parse(perms); } catch(e) { perms = []; }
            }
            if (!Array.isArray(perms)) perms = [];

            if (perms.length > 0 && !perms.includes(activeTab)) {
                setActiveTab(perms[0]);
            } else if (perms.length === 0 && activeTab !== 'overview') {
                setActiveTab('overview');
            }
        }
    }, [user, activeTab]);

    useEffect(() => {
        if (socket) {
            socket.emit('join-admin-room');
            socket.on('group-full', (data) => {
                toast((t) => (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#df472b]/10 flex items-center justify-center text-[#df472b] shrink-0">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Group Full Alert!</p>
                            <p className="text-xs text-slate-500">{data.message}</p>
                        </div>
                    </div>
                ), { duration: 8000 });
                
                fetchStats();
                if (['groups', 'properties', 'overview'].includes(activeTab)) {
                    fetchTabData();
                }
            });

            socket.on('member-joined', () => {
                if (['groups', 'properties', 'overview'].includes(activeTab)) {
                    fetchTabData();
                }
            });

            return () => {
                socket.off('group-full');
                socket.off('member-joined');
            };
        }
    }, [socket, activeTab]);

    useEffect(() => {
        if (activeTab !== 'overview') {
            setEditingItem(null);
            setFormData({});
            fetchTabData();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            if (res.data.success) {
                setStats(res.data.analytics);
            }
        } catch (error) {
            console.error('Stats fetch failed');
        }
    };

    const fetchSupportData = async () => {
        try {
            const [rmsRes, devsRes, statusesRes, propsRes] = await Promise.allSettled([
                api.get('/admin/rms'),
                api.get('/admin/developers'),
                api.get('/admin/property-statuses'),
                api.get('/properties')
            ]);

            const rmsData = rmsRes.status === 'fulfilled' ? rmsRes.value.data : null;
            const devsData = devsRes.status === 'fulfilled' ? devsRes.value.data : null;
            const statusesData = statusesRes.status === 'fulfilled' ? statusesRes.value.data : null;
            const propsData = propsRes.status === 'fulfilled' ? propsRes.value.data : null;

            if (rmsData?.success) setRms(rmsData.rms);
            if (devsData?.success) setDevelopers(sortByName(devsData.developers));
            if (statusesData?.success) setPropertyStatuses(sortByName(statusesData.statuses));
            if (propsData?.success) setProperties(propsData.properties);
        } catch (error) { console.error('Support data fetch failed'); }
    }

    const fetchTabData = async () => {
        setLoading(true);
        setItems([]);
        try {
            if (activeTab === 'settings' || activeTab === 'floating-reel') {
                const res = await api.get('/admin/settings');
                if (res.data.success) {
                    // Merge fetched settings with defaults
                    setFormData({ ...HERO_DEFAULTS, ...res.data.settings });
                }
            } else {
                let endpoint = `/admin/${activeTab}`;
                if (['properties', 'leads'].includes(activeTab)) {
                    endpoint = `/${activeTab}`;
                }

                const res = await api.get(endpoint);
                if (res.data.success) {
                    const keyMap = {
                        'properties': 'properties',
                        'users': 'users',
                        'admins': 'admins',
                        'developers': 'developers',
                        'leads': 'leads',
                        'groups': 'groups',
                        'subscriptions': 'subscriptions',
                        'project-videos': 'projectVideos',
                    };
                    const itemsList = res.data[keyMap[activeTab]] || res.data.items || res.data[activeTab] || [];
                    setItems(Array.isArray(itemsList) ? itemsList : []);
                }
            }
        } catch (error) {
            toast.error(`Failed to fetch ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        let processedFormData = { ...item };
        if (!processedFormData.propertyStatusId && processedFormData.propertyStatus?.id) {
            processedFormData.propertyStatusId = processedFormData.propertyStatus.id;
        }
        
        ['price', 'originalPrice'].forEach(field => {
            if (processedFormData[field]) {
                const val = Number(processedFormData[field]);
                if (val >= 10000000 && val % 100000 === 0) {
                    processedFormData[field + '_raw'] = val / 10000000;
                    processedFormData[field + '_unit'] = 10000000;
                } else if (val >= 100000 && val % 1000 === 0) {
                    processedFormData[field + '_raw'] = val / 100000;
                    processedFormData[field + '_unit'] = 100000;
                } else {
                    processedFormData[field + '_raw'] = val;
                    processedFormData[field + '_unit'] = 1;
                }
            }
        });

        ['amenities', 'highlights', 'specifications', 'images'].forEach(field => {
            processedFormData[field] = arrayToTextarea(processedFormData[field]);
        });
        processedFormData.floorPlans = floorPlansToTextarea(processedFormData.floorPlans);
        processedFormData.nearbyPlaces = nearbyPlacesToTextarea(processedFormData.nearbyPlaces);

        setEditingItem(item);
        setFormData(processedFormData);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            let endpoint = `/admin/${activeTab}/${id}`;
            if (['properties'].includes(activeTab)) {
                endpoint = `/${activeTab}/${id}`;
            }
            await api.delete(endpoint);
            toast.success('Deleted successfully');
            fetchTabData();
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    
    const handleFileUpload = async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post(`/admin/upload?folder=${folder}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.success ? res.data.url : null;
        } catch (error) {
            console.error('File upload failed', error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            if (activeTab === 'settings' || activeTab === 'floating-reel') {
                let submitData = { ...formData };
                
                // If floating reel tab, handle file uploads
                if (activeTab === 'floating-reel') {
                    if (submitData.floatingReelVideo instanceof File) {
                        const url = await handleFileUpload(submitData.floatingReelVideo, 'properties');
                        if (url) submitData.floatingReelVideo = url;
                    }
                    if (submitData.floatingReelThumbnail instanceof File) {
                        const url = await handleFileUpload(submitData.floatingReelThumbnail, 'properties');
                        if (url) submitData.floatingReelThumbnail = url;
                    }
                }
                
                // For settings, just send the form data directly
                await api.put('/admin/settings', submitData);
                toast.success(activeTab === 'floating-reel' ? 'Floating Reel updated successfully' : 'Settings updated successfully');
                setShowModal(false);
                fetchTabData();
            } else if (activeTab === 'project-videos') {
                // For project-videos, use multipart form data for file upload
                const submitFormData = new FormData();
                for (const key in formData) {
                    if (formData[key] instanceof File) {
                        submitFormData.append(key, formData[key]);
                    } else if (key.includes('Unit') || key.includes('_raw')) {
                        // Skip temporary multiplier fields
                        continue;
                    } else if (formData[key] instanceof Date) {
                        // Convert Date objects to ISO string
                        submitFormData.append(key, formData[key].toISOString());
                    } else {
                        submitFormData.append(key, formData[key] ?? '');
                    }
                }

                let endpoint = editingItem ? `/admin/project-videos/${editingItem.id}` : `/admin/project-videos`;

                if (editingItem) {
                    await api.put(endpoint, submitFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    await api.post(endpoint, submitFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
                toast.success(editingItem ? 'Video updated successfully' : 'Video created successfully');
                setShowModal(false);
                fetchTabData();
            } else {
                let submitData = { ...formData };
                
                // Remove temp fields
                delete submitData.price_raw;
                delete submitData.price_unit;
                delete submitData.originalPrice_raw;
                delete submitData.originalPrice_unit;
                
                // Handle file uploads
                if (submitData.thumbnailUrl instanceof File) {
                    const url = await handleFileUpload(submitData.thumbnailUrl, 'properties');
                    if (url) submitData.thumbnailUrl = url;
                }
                if (submitData.videoUrl instanceof File) {
                    const url = await handleFileUpload(submitData.videoUrl, 'properties');
                    if (url) submitData.videoUrl = url;
                }
                for (const imageField of ['masterPlanImage', 'layoutPlanUrl', 'developerLogo']) {
                    if (submitData[imageField] instanceof File) {
                        const url = await handleFileUpload(submitData[imageField], 'properties');
                        if (url) submitData[imageField] = url;
                    }
                }
                if (Array.isArray(submitData.imagesFileList) && submitData.imagesFileList.length > 0) {
                    const urls = [];
                    // keep old string urls
                    if (submitData.images && typeof submitData.images === 'string') {
                        urls.push(...submitData.images.split('\n').map(s=>s.trim()).filter(Boolean));
                    }
                    for (const file of submitData.imagesFileList) {
                        if (file instanceof File) {
                            const url = await handleFileUpload(file, 'properties');
                            if (url) urls.push(url);
                        }
                    }
                    submitData.images = urls.join('\n');
                    delete submitData.imagesFileList;
                }
                if (submitData.floorPlanFiles && submitData.floorPlans) {
                    const floorPlanRows = parseBhkPlanRows(submitData.floorPlans);
                    for (const row of floorPlanRows) {
                        const file = submitData.floorPlanFiles[row.bhk];
                        if (file instanceof File) {
                            const url = await handleFileUpload(file, 'properties');
                            if (url) row.imageUrl = url;
                        }
                    }
                    submitData.floorPlans = serializeBhkPlanRows(floorPlanRows);
                }
                delete submitData.floorPlanFiles;

                let endpoint = editingItem ? `/admin/${activeTab}/${editingItem.id}` : `/admin/${activeTab}`;
                if (['properties'].includes(activeTab)) {
                    endpoint = editingItem ? `/${activeTab}/${editingItem.id}` : `/${activeTab}`;
                }

                if (editingItem) {
                    await api.put(endpoint, submitData);
                } else {
                    await api.post(endpoint, submitData);
                }
                toast.success(editingItem ? 'Updated successfully' : 'Created successfully');
                setShowModal(false);
                fetchTabData();
            }
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCreateSelectOption = async (field) => {
        const name = window.prompt(`Enter new ${field.label} name:`);
        const trimmedName = name?.trim();
        if (!trimmedName) return;

        try {
            const isPropertyStatus = field.name === 'propertyStatusId';
            const endpoint = isPropertyStatus ? '/admin/property-statuses' : '/admin/developers';
            const responseKey = isPropertyStatus ? 'status' : 'developer';
            const res = await api.post(endpoint, { name: trimmedName, isActive: true });

            if (res.data.success) {
                const createdItem = res.data[responseKey] || res.data.item || res.data.data;
                if (createdItem?.id) {
                    if (isPropertyStatus) {
                        setPropertyStatuses(prev => sortByName([...prev.filter(item => item.id !== createdItem.id), createdItem]));
                    } else {
                        setDevelopers(prev => sortByName([...prev.filter(item => item.id !== createdItem.id), createdItem]));
                    }
                    setFormData(prev => ({ ...prev, [field.name]: createdItem.id }));
                } else {
                    await fetchSupportData();
                }

                toast.success('Added successfully');
            }
        } catch (e) {
            toast.error('Failed to add');
        }
    };


    const handleToggleActive = async (id, current) => {
        try {
            await api.put(`/admin/users/${id}/toggle-active`, { isActive: !current });
            toast.success('Status updated');
            fetchTabData();
        } catch (error) { toast.error('Failed to update status'); }
    }

    const handleAssignRM = async (userId, rmId) => {
        try {
            await api.put(`/admin/users/${userId}/assign-rm`, { rmId });
            toast.success('RM Assigned');
            fetchTabData();
        } catch (error) { toast.error('Assignment failed'); }
    }

    const filteredItems = items.filter(item => {
        if (!searchTerm) return true;
        const searchStr = searchTerm.toLowerCase();
        
        if (activeTab === 'groups') {
            return (
                (item.property?.title && item.property.title.toLowerCase().includes(searchStr)) ||
                (item.property?.city && item.property.city.toLowerCase().includes(searchStr)) ||
                (item.status && item.status.toLowerCase().includes(searchStr)) ||
                (item.dealStatus && item.dealStatus.toLowerCase().includes(searchStr))
            );
        }
        
        return (
            (item.name && item.name.toLowerCase().includes(searchStr)) ||
            (item.title && item.title.toLowerCase().includes(searchStr)) ||
            (item.email && item.email.toLowerCase().includes(searchStr))
        );
    });

    const getFormFields = () => {
        switch (activeTab) {
            case 'subscriptions':
                return [
                    { name: 'name', label: 'Subscription Name', type: 'text' },
                    { name: 'type', label: 'Subscription Type', type: 'select', options: [{ v: 'MINIMAL', l: 'Minimal' }, { v: 'NORMAL', l: 'Normal' }, { v: 'PREMIUM', l: 'Premium' }] },
                    { name: 'price', label: 'Monthly Price (₹)', type: 'number' },
                    { name: 'annualPrice', label: 'Annual Price (₹)', type: 'number' },
                    { name: 'maxProperties', label: 'Max Properties', type: 'number' },
                    { name: 'maxGroups', label: 'Max Groups', type: 'number' },
                    { name: 'features', label: 'Features (One per line)', type: 'textarea', col: 'col-span-2' },
                    { name: 'description', label: 'Description', type: 'textarea', col: 'col-span-2' },
                    { name: 'isActive', label: 'Active Status', type: 'select', options: [{ v: true, l: 'Active' }, { v: false, l: 'Inactive' }] },
                ];
            case 'admins':
                return [
                    { name: 'name', label: 'Admin Name', type: 'text' },
                    { name: 'email', label: 'Email Address', type: 'text' },
                    { name: 'phone', label: 'Phone Number', type: 'text' },
                    { name: 'permissions', label: 'Tab Access Permissions', type: 'checkbox_group', col: 'col-span-2', options: [
                        { v: 'overview', l: 'Overview' },
                        { v: 'properties', l: 'Properties' },
                        { v: 'project-videos', l: 'Project Videos' },
                        { v: 'groups', l: 'Groups' },
                        { v: 'subscriptions', l: 'Subscriptions' },
                        { v: 'leads', l: 'Leads' },
                        { v: 'users', l: 'Users' },
                        { v: 'admins', l: 'Admins' },
                        { v: 'developers', l: 'Developers' },
                        { v: 'floating-reel', l: 'Floating Reel' },
                        { v: 'settings', l: 'Site Settings' }
                    ]},
                    { name: 'isActive', label: 'Active Status', type: 'select', options: [{ v: true, l: 'Active' }, { v: false, l: 'Inactive' }] },
                ];
            case 'developers':
                return [
                    { name: 'name', label: 'Developer Name', type: 'text' },
                    { name: 'email', label: 'Email Address', type: 'text' },
                    { name: 'phone', label: 'Phone Number', type: 'text' },
                    { name: 'city', label: 'Headquarters City', type: 'text' },
                    { name: 'website', label: 'Website URL', type: 'text' },
                    { name: 'description', label: 'Developer Description', type: 'textarea', col: 'col-span-2' },
                    { name: 'isActive', label: 'Active Status', type: 'select', options: [{ v: true, l: 'Active' }, { v: false, l: 'Inactive' }] },
                ];
            case 'properties':
                return [
                    { name: 'title', label: 'Property Title', type: 'text' },
                    { name: 'city', label: 'City', type: 'text' },
                    { name: 'locality', label: 'Locality', type: 'text' },
                    { name: 'category', label: 'Property Type / Sub Category', type: 'select', options: PROPERTY_CATEGORIES },
                    { name: 'displaySection', label: 'Display Section', type: 'select', options: PROPERTY_DISPLAY_SECTIONS, required: false },
                    { name: 'originalPrice', label: 'Original Price / Developer Price (Fallback)', type: 'price_multiplier', required: false },
                    { name: 'price', label: 'Starting Price (Auto from BHK plans / Fallback)', type: 'price_multiplier', required: false },
                    { name: 'unitCount', label: 'Total Units', type: 'number' },
                    {
                        name: 'floorPlans',
                        label: 'Config (BHK) + Price + Area',
                        type: 'bhk_plans',
                        col: 'col-span-2',
                        required: false,
                    },
                    { name: 'possessionStatus', label: 'Possession Status', type: 'select', options: POSSESSION_STATUSES },
                    { name: 'area', label: 'Carpet Area (Sq.ft)', type: 'number' },
                    { name: 'reraId', label: 'RERA ID', type: 'text' },
                    { name: 'propertyAreaAcres', label: 'Property Area (Acres)', type: 'number' },
                    { name: 'possessionDate', label: 'Possession Date', type: 'date' },
                    { name: 'launchDate', label: 'Launch Date', type: 'date' },
                    { name: 'thumbnailUrl', label: 'Main Thumbnail Image', type: 'file', col: 'col-span-2' },
                    { name: 'imagesFileList', label: 'Property Gallery Images (Select Multiple)', type: 'file_multiple', col: 'col-span-2', required: false },
                    { name: 'videoUrl', label: 'Project Video File', type: 'file', col: 'col-span-2' },
                    { name: 'trackingCount', label: 'Users Tracking Count (Display)', type: 'number' },
                    { name: 'description', label: 'Overview Description', type: 'textarea', col: 'col-span-2' },
                    { name: 'highlights', label: 'Highlights (6-10 points, one per line)', type: 'textarea', col: 'col-span-2' },
                    { name: 'masterPlanImage', label: 'Master Plan Image', type: 'file', col: 'col-span-2' },
                    { name: 'layoutPlanUrl', label: 'Primary BHK Blueprint Image', type: 'file', col: 'col-span-2' },
                    { name: 'amenities', label: 'Amenities (One per line)', type: 'textarea', col: 'col-span-2' },
                    { name: 'specifications', label: 'Specifications (One per line)', type: 'textarea', col: 'col-span-2' },
                    { name: 'locationUrl', label: 'Live Location / Google Map URL', type: 'text', col: 'col-span-2' },
                    { name: 'nearbyPlaces', label: 'Nearby Places (One per line: Hospital | Name | Address | Distance | Time)', type: 'textarea', col: 'col-span-2', required: false },
                    { name: 'targetGroupSize', label: 'Target Group Size', type: 'number' },
                    { name: 'expiryDate', label: 'Offer Expiry Date', type: 'date' },
                    { name: 'developerId', label: 'Developer', type: 'creatable_select', options: developers.filter(d => d.isActive !== false).map(d => ({ v: d.id, l: d.name })) },
                    { name: 'developerLogo', label: 'Developer Logo', type: 'file', col: 'col-span-2' },
                    { name: 'developerDescription', label: 'About Developer Description', type: 'textarea', col: 'col-span-2' },
                    { name: 'developerTotalProjects', label: 'Developer Total Projects', type: 'number' },
                    { name: 'developerExperienceYears', label: 'Developer Total Experience (Years)', type: 'number' },
                    { name: 'propertyStatusId', label: 'Property Status', type: 'creatable_select', options: propertyStatuses.filter(s => s.isActive !== false).map(s => ({ v: s.id, l: s.name })) },
                    { name: 'isFeatured', label: 'Featured Property', type: 'select', options: [{ v: true, l: 'YES' }, { v: false, l: 'NO' }] },
                ];
            
            case 'project-videos':
                return [
                    { name: 'title', label: 'Video Title', type: 'text' },
                    { name: 'videoUrl', label: 'Project Video File (Auto Compressed -20% Size)', type: 'file', col: 'col-span-2' },
                    { name: 'propertyId', label: 'Related Property', type: 'select', options: properties.map(p => ({ v: p.id, l: p.title })) },
                    { name: 'showAfter', label: 'Schedule Show After (Optional)', type: 'datetime-local' },
                    { name: 'isActive', label: 'Active Status', type: 'select', options: [{ v: true, l: 'Active' }, { v: false, l: 'Inactive' }] },
                    { name: 'isFeatured', label: 'Featured Video', type: 'select', options: [{ v: true, l: 'YES' }, { v: false, l: 'NO' }] },
                    { name: 'duration', label: 'Duration (Seconds)', type: 'number', disabled: true },
                    { name: 'fileSizeMB', label: 'File Size (MB)', type: 'number', disabled: true },
                ];
            case 'groups':
                return [
                    { name: 'status', label: 'Group Status', type: 'select', options: [{ v: 'OPEN', l: 'Open' }, { v: 'FULL', l: 'Full' }, { v: 'NEGOTIATING', l: 'Negotiating' }, { v: 'CLOSED', l: 'Closed' }] },
                    { name: 'maxMembers', label: 'Max Members', type: 'number' },
                    { name: 'dealStatus', label: 'Deal Status', type: 'select', options: [{ v: 'PENDING', l: 'Pending' }, { v: 'IN_PROGRESS', l: 'In Progress' }, { v: 'COMPLETED', l: 'Completed' }] },
                    { name: 'whatsappGroupLink', label: 'WhatsApp Group Link', type: 'text', col: 'col-span-2' },
                    { name: 'notes', label: 'Admin Notes', type: 'textarea', col: 'col-span-2' }
                ];
            case 'floating-reel':
                return [
                    { name: 'showFloatingReel', label: 'Show Floating Reel', type: 'select', options: [{ v: 'true', l: 'Yes' }, { v: 'false', l: 'No' }] },
                    { name: 'floatingReelTitle', label: 'Floating Reel Title', type: 'text' },
                    { name: 'floatingReelDesc', label: 'Floating Reel Description', type: 'text', col: 'col-span-2' },
                    { name: 'floatingReelVideo', label: 'Floating Reel Video File', type: 'file', col: 'col-span-2' },
                    { name: 'floatingReelThumbnail', label: 'Floating Reel Thumbnail File', type: 'file', col: 'col-span-2' },
                ];
            case 'settings':
                return [
                    // Hero Section Fields
                    { name: 'heroBgColor', label: 'Hero Background Color', type: 'color' },
                    { name: 'heroTagline', label: 'Hero Tagline', type: 'text' },
                    { name: 'heroHeadingLine1', label: 'Hero Heading Line 1', type: 'text' },
                    { name: 'heroHeadingLine2', label: 'Hero Heading Line 2', type: 'text' },
                    { name: 'heroSubtext', label: 'Hero Subtext (Use \\n for line breaks)', type: 'textarea', col: 'col-span-2' },
                    { name: 'heroBtnText', label: 'Hero Button Text', type: 'text' },
                    { name: 'heroBtnSubtext', label: 'Hero Button Subtext', type: 'text', col: 'col-span-2' },
                    { name: 'heroImage', label: 'Hero Image URL', type: 'text', col: 'col-span-2' },
                    { name: 'heroImageAlt', label: 'Hero Image Alt Text', type: 'text', col: 'col-span-2' },
                    { name: 'heroSavingsText', label: 'Hero Savings Text', type: 'text', col: 'col-span-2' },
                    { name: 'heroSavingsSubtext', label: 'Hero Savings Subtext', type: 'text', col: 'col-span-2' },
                    { name: 'heroGroupBuyTitle', label: 'Hero Group Buy Title', type: 'text' },
                    { name: 'heroGroupBuyBadge', label: 'Hero Group Buy Badge', type: 'text' },
                    { name: 'heroGroupBuyDesc1', label: 'Hero Group Buy Description 1', type: 'text', col: 'col-span-2' },
                    { name: 'heroGroupBuyDesc2', label: 'Hero Group Buy Description 2', type: 'text', col: 'col-span-2' },
                    { name: 'heroCashbackTitle', label: 'Hero Cashback Title', type: 'text' },
                    { name: 'heroCashbackBadge', label: 'Hero Cashback Badge', type: 'text' },
                    { name: 'heroCashbackDesc', label: 'Hero Cashback Description', type: 'text', col: 'col-span-2' },
                    { name: 'heroCashbackHighlight', label: 'Hero Cashback Highlight', type: 'text', col: 'col-span-2' },
                ];
            default: return [];
        }
    };

    const allMenuItems = [
        { id: 'overview', name: 'Dashboard', icon: BarChart3, section: 'main' },
        { id: 'project-videos', name: 'Project Videos', icon: Play, section: 'main' },
        { id: 'properties', name: 'Properties', icon: Building2, section: 'main' },
        { id: 'groups', name: 'Groups', icon: Handshake, section: 'main' },
        { id: 'subscriptions', name: 'Subscriptions', icon: Sparkles, section: 'management' },
        { id: 'leads', name: 'Leads', icon: MessageSquare, section: 'management' },
        { id: 'users', name: 'Users', icon: Users, section: 'management' },
        { id: 'admins', name: 'Admins', icon: ShieldCheck, section: 'management' },
        { id: 'developers', name: 'Developers', icon: Building2, section: 'management' },
        { id: 'floating-reel', name: 'Floating Reel', icon: Play, section: 'management' },
        { id: 'settings', name: 'Site Settings', icon: Settings, section: 'management' },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (user?.role === 'SUPERADMIN') return true;
        if (user?.role === 'ADMIN') {
            const perms = user?.permissions || [];
            return perms.includes(item.id);
        }
        return true; // Fallback just in case
    });

    return (
        <div className="min-h-screen bg-[#f6f7f9] text-slate-950 flex flex-col md:flex-row md:overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-full md:w-[264px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:h-screen z-[100] shrink-0 shadow-[0_18px_48px_rgba(15,23,42,0.06)] overflow-x-auto md:overflow-hidden no-scrollbar">
                <div className="hidden md:flex px-6 py-6 mb-2 flex-col border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-md">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h2 className="text-slate-950 font-bold text-lg tracking-tight leading-none">GroupBuying</h2>
                            <p className="text-slate-500 font-semibold text-[10px] uppercase tracking-widest mt-1">Admin Center</p>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-row md:flex-col md:flex-1 md:min-h-0 p-3 md:px-4 md:space-y-1 md:overflow-y-auto custom-scrollbar md:pb-10 whitespace-nowrap">
                    {/* Main Section */}
                    <div className="flex md:flex-col w-full gap-1">
                        <p className="hidden md:block text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mt-4 mb-2">Main</p>
                        {menuItems.filter(m => m.section === 'main').map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors shrink-0 ${isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                                >
                                    <item.icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Management Section */}
                    <div className="flex md:flex-col w-full gap-1 md:border-t md:border-slate-100 md:mt-4 md:pt-2">
                        <p className="hidden md:block text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mt-4 mb-2">Management</p>
                        {menuItems.filter(m => m.section === 'management').map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors shrink-0 ${isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                                >
                                    <item.icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="md:pt-6 md:border-t md:border-slate-100 md:mt-auto ml-4 md:ml-0 flex items-center md:block w-full">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold transition-colors bg-[#fff2ed] text-[#db4a2b] hover:bg-[#db4a2b] hover:text-white shrink-0 w-full text-sm"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-grow min-h-screen md:min-h-0 md:h-screen overflow-y-auto relative w-full">
                <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between mb-6 bg-white p-6 rounded-lg shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-md border border-[#f2c6b8] bg-white px-3 py-1 text-sm font-medium text-[#db4a2b] mb-3">
                                <ShieldCheck size={16} />
                                Admin Workspace
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-950 capitalize">{activeTab.replace('-', ' ')}</h1>
                            <p className="text-sm leading-6 text-slate-600 mt-2 max-w-2xl">Manage your platform's {activeTab.replace('-', ' ')} efficiently.</p>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            {activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'floating-reel' && (
                                <div className="relative group flex-grow md:flex-grow-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search records..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 h-10 rounded-md border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#db4a2b] focus:outline-none focus:ring-1 focus:ring-[#db4a2b] w-full md:w-64 transition-colors"
                                    />
                                </div>
                            )}
                            {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'groups' && activeTab !== 'leads' && activeTab !== 'settings' && activeTab !== 'floating-reel' && (
                                <button onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#db4a2b]">
                                    <Plus size={16} />
                                    <span>Add New</span>
                                </button>
                            )}
                        </div>
                    </header>

                    {activeTab === 'overview' ? (
                        <OverviewSection stats={stats} />
                    ) : (activeTab === 'settings' || activeTab === 'floating-reel') ? (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    {activeTab === 'floating-reel' ? <Play size={28} className="text-[#df472b]" /> : <Settings size={28} className="text-[#df472b]" />}
                                    {activeTab === 'floating-reel' ? 'Floating Reel Configuration' : 'Hero Section Configuration'}
                                </h2>
                                <p className="text-slate-500 mb-8">
                                    {activeTab === 'floating-reel' ? 'Customize the floating reel that appears across the site' : 'Customize the hero section that appears on the homepage'}
                                </p>
                                
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 size={32} className="animate-spin text-[#df472b] mb-4" />
                                        <p className="text-slate-500 font-medium">Loading saved settings...</p>
                                    </div>
                                ) : (
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {getFormFields().map(field => (
                                        <div key={field.name} className={`space-y-2 ${field.col || ''}`}>
                                            <label className="text-xs font-bold text-slate-700">{field.label}</label>
                                            
                                            {field.type === 'color' ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                        className="h-11 md:h-12 w-16 rounded-xl border border-slate-200 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                        placeholder="#f66f52"
                                                        className="flex-grow h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all"
                                                    />
                                                </div>
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full min-h-[100px] p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all resize-none"
                                                    placeholder={field.placeholder || `Enter ${field.label}...`}
                                                    disabled={field.disabled}
                                                />
                                            ) : field.type === 'datetime-local' ? (
                                                <input
                                                    type="datetime-local"
                                                    value={formData[field.name] ? new Date(formData[field.name]).toISOString().slice(0, 16) : ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value ? new Date(e.target.value) : null })}
                                                    className="w-full h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all"
                                                />
                                            ) : field.type === 'file' ? (
                                                <div>
                                                    {formData[field.name] && typeof formData[field.name] === 'string' && (
                                                        <div className="mb-2 text-xs font-semibold text-slate-500 truncate">Current File: {formData[field.name]}</div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.files[0] })}
                                                        className="w-full h-11 md:h-12 px-3 md:px-4 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                        disabled={field.disabled}
                                                    />
                                                </div>
                                            ) : field.type === 'select' ? (
                                                <select
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                    disabled={field.disabled}
                                                >
                                                    <option value="" disabled>Select {field.label}</option>
                                                    {field.options?.map(opt => (
                                                        <option key={opt.v} value={opt.v}>{opt.l}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'checkbox_group' ? (
                                                <div className="flex flex-wrap gap-3">
                                                    {field.options?.map(opt => {
                                                        const currentValues = formData[field.name] || [];
                                                        const isChecked = currentValues.includes(opt.v);
                                                        return (
                                                            <label key={opt.v} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-[#df472b]/10 border-[#df472b]/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        const nextValues = e.target.checked 
                                                                            ? [...currentValues, opt.v] 
                                                                            : currentValues.filter(v => v !== opt.v);
                                                                        setFormData({ ...formData, [field.name]: nextValues });
                                                                    }}
                                                                />
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-[#df472b] border-[#df472b]' : 'border-slate-300 bg-white'}`}>
                                                                    {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <span className={`text-xs font-semibold ${isChecked ? 'text-[#df472b]' : 'text-slate-600'}`}>{opt.l}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                    placeholder={field.placeholder || `Enter ${field.label}...`}
                                                    disabled={field.disabled}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    
                                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                        <button type="button" onClick={() => fetchTabData()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-[#db4a2b] hover:text-[#db4a2b]">Reset</button>
                                        <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-[#db4a2b]" disabled={submitLoading}>
                                            {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <span>Save All Changes</span>}
                                        </button>
                                    </div>
                                </form>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#f0ded5] bg-white shadow-[0_18px_55px_rgba(30,20,14,0.08)] overflow-hidden">
                            <div className="overflow-x-auto relative z-10">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-slate-50/80 border-b border-slate-100">
                                        <tr>
                                            {activeTab === 'subscriptions' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price (Monthly)</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Price</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Features</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            </>}
                                            
                                            {activeTab === 'project-videos' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Video Title</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration / Size</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            </>}



                                                {activeTab === 'users' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Account</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned RM</th>
                                            </>}
                                            {activeTab === 'admins' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email/Phone</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            </>}
                                            {activeTab === 'developers' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Developer Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            </>}
                                            {activeTab === 'properties' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            </>}
                                            {activeTab === 'groups' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Group Property</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Members Joined</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phase / Status</th>
                                            </>}
                                            {activeTab === 'leads' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            </>}
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#df472b]" />
                                                    <p className="text-sm">Loading records...</p>
                                                </td>
                                            </tr>
                                        ) : filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                                    <p className="text-sm">No records found.</p>
                                                </td>
                                            </tr>
                                        ) : filteredItems.map((item, idx) => (
                                            <React.Fragment key={item.id || idx}>
                                            <tr className={`hover:bg-slate-50 transition-colors group/row ${activeTab === 'groups' ? 'cursor-pointer' : ''} ${expandedGroupId === item.id ? 'bg-orange-50/50' : ''}`} onClick={() => { if (activeTab === 'groups') setExpandedGroupId(expandedGroupId === item.id ? null : item.id); }}>
                                                {activeTab === 'subscriptions' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm ${item.type === 'PREMIUM' ? 'bg-purple-500' : item.type === 'NORMAL' ? 'bg-[#df472b]' : 'bg-slate-500'}`}>
                                                                {item.type === 'PREMIUM' ? '⭐' : item.type === 'NORMAL' ? '◆' : '◇'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm tracking-tight">{item.name}</p>
                                                                <p className="text-xs text-slate-500">{item.description?.substring(0, 30)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                                            item.type === 'PREMIUM' ? 'bg-purple-100 text-purple-700' :
                                                            item.type === 'NORMAL' ? 'bg-[#df472b]/10 text-[#df472b]' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">₹{item.price?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">₹{item.annualPrice?.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {item.features?.split('\n').slice(0, 3).map((feature, i) => (
                                                                <span key={i} className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded truncate">
                                                                    {feature.trim()}
                                                                </span>
                                                            ))}
                                                            {item.features?.split('\n').length > 3 && (
                                                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                                                                    +{item.features?.split('\n').length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>}
                                                {activeTab === 'project-videos' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                                                                <Play className="text-slate-400" size={20} />
                                                            </div>
                                                            <p className="font-bold text-slate-900 text-sm tracking-tight">{item.title || 'Untitled Video'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-slate-600 text-sm">{item.property?.title || 'Unlinked'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {item.duration && <p className="text-xs font-semibold text-slate-700">{Math.floor(item.duration / 60)}m {item.duration % 60}s</p>}
                                                            {item.fileSizeMB && <p className="text-xs text-slate-500">{item.fileSizeMB} MB</p>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.showAfter ? (
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-xs font-semibold text-amber-700">📅 Scheduled</p>
                                                                <p className="text-[10px] text-slate-500">{new Date(item.showAfter).toLocaleDateString()}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-slate-400">Live</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {item.isActive ? 'Active' : 'Hidden'}
                                                        </span>
                                                        {item.isFeatured && (
                                                            <span className="ml-2 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider bg-[#df472b]/10 text-[#df472b]">Featured</span>
                                                        )}
                                                    </td>
                                                </>}
                                                {activeTab === 'users' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                                                                {item.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm tracking-tight">{item.name || 'Anonymous'}</p>
                                                                <p className="text-xs text-slate-500">{item.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.role === 'ADMIN' ? 'bg-slate-900 text-white' : item.role === 'RM' ? 'bg-[#df472b]/10 text-[#df472b]' : 'bg-slate-100 text-slate-600'}`}>
                                                            {item.role === 'ADMIN' ? 'Administrator' : item.role === 'RM' ? 'RM' : 'Buyer'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => handleToggleActive(item.id, item.isActive)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                                                            {item.isActive ? 'Active' : 'Offline'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.role === 'USER' ? (
                                                            <select
                                                                value={item.rm?.id || ''}
                                                                onChange={(e) => handleAssignRM(item.id, e.target.value)}
                                                                className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#df472b]/20 focus:border-[#df472b] outline-none"
                                                            >
                                                                <option value="">No RM Assigned</option>
                                                                {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
                                                            </select>
                                                        ) : <p className="text-xs font-medium text-slate-400 italic">System Account</p>}
                                                    </td>
                                                </>}
                                                {activeTab === 'admins' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                                                {item.name?.charAt(0) || 'A'}
                                                            </div>
                                                            <p className="font-bold text-slate-900 text-sm tracking-tight">{item.name || 'Anonymous'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-slate-600 font-semibold">{item.email}</p>
                                                        {item.phone && <p className="text-xs text-slate-500 mt-0.5">{item.phone}</p>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-900 text-white'}`}>
                                                            {item.role === 'SUPERADMIN' ? 'Superadmin' : 'Administrator'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                                            {item.isActive ? 'Active' : 'Offline'}
                                                        </span>
                                                    </td>
                                                </>}
                                                {activeTab === 'developers' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                                                                <Building2 size={18} />
                                                            </div>
                                                            <p className="font-bold text-slate-900 text-sm tracking-tight">{item.name || 'Anonymous'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-slate-600 font-semibold">{item.email || 'No email'}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{item.phone || 'No phone'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-slate-600 font-semibold">{item.city || 'Any'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                                            {item.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </>}

                                                {activeTab === 'properties' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                                {getPropertyPreviewImage(item) ? (
                                                                    <img
                                                                        src={getPropertyPreviewImage(item)}
                                                                        className="w-full h-full object-cover"
                                                                        alt="prop"
                                                                        onError={(event) => {
                                                                            event.currentTarget.onerror = null;
                                                                            event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Building2 className="m-auto mt-2 text-slate-300" />
                                                                )}
                                                            </div>
                                                            <p className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-[200px]">{item.title}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-slate-600 text-sm">{item.city}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900 text-sm tracking-tight">₹{item.price?.toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                                            item.status === 'READY_TO_MOVE' ? 'bg-green-100 text-green-700' : 
                                                            item.status === 'PRE_LAUNCH' ? 'bg-[#df472b]/10 text-[#df472b]' : 
                                                            item.status === 'UNDER_CONSTRUCTION' ? 'bg-blue-100 text-blue-700' : 
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {item.propertyStatus?.name || item.status?.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                </>}

                                                {activeTab === 'leads' && <>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900 text-sm tracking-tight">{item.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{item.city || 'Any'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 space-y-1">
                                                        <p className="text-xs font-semibold text-slate-700">{item.email}</p>
                                                        <p className="text-xs text-slate-500">{item.phone}</p>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">₹{item.budget}</td>
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.isContacted ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                            {item.isContacted ? 'Contacted' : 'New'}
                                                        </div>
                                                    </td>
                                                </>}

                                                {activeTab === 'groups' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-transform duration-300 ${expandedGroupId === item.id ? 'rotate-90 bg-[#df472b]/10 text-[#df472b]' : 'bg-slate-100 text-slate-400'}`}>
                                                                <ChevronRight size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm tracking-tight">{item.property?.title}</p>
                                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{item.property?.city || 'NCR Network'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            <p className="text-xs font-bold text-[#df472b]">{item._count?.members} / {item.maxMembers} Members</p>
                                                            <div className="flex -space-x-2 overflow-hidden">
                                                                {item.members?.map((m, i) => (
                                                                    <div key={i} title={m.user?.name || m.user?.email} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                                        {(m.user?.name || m.user?.email || '?').charAt(0).toUpperCase()}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.status === 'OPEN' ? 'bg-green-100 text-green-700' : item.status === 'NEGOTIATING' ? 'bg-amber-100 text-amber-700' : item.status === 'FULL' ? 'bg-red-100 text-red-700' : 'bg-[#df472b]/10 text-[#df472b]'}`}>
                                                                {item.status} Phase
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.dealStatus}</span>
                                                        </div>
                                                    </td>
                                                </>}

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {activeTab !== 'users' && activeTab !== 'leads' && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="w-8 h-8 rounded-full bg-slate-800 border-none text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center">
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                        {activeTab !== 'users' && activeTab !== 'groups' && activeTab !== 'leads' && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="w-8 h-8 rounded-full bg-slate-800 border-none text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-all flex items-center justify-center">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {activeTab === 'groups' && expandedGroupId === item.id && (
                                                <tr>
                                                    <td colSpan="4" className="p-0 border-b border-slate-100">
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-slate-50/50"
                                                        >
                                                            <div className="p-6 md:p-8">
                                                                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                                    <Users size={16} className="text-[#df472b]" /> Member Directory
                                                                </h4>
                                                                {item.members?.length > 0 ? (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                        {item.members.map((member, mIdx) => (
                                                                            <div key={mIdx} className="bg-white rounded-xl p-4 border border-slate-200 flex items-start gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                                                    {(member.user?.name || member.user?.email || '?').charAt(0).toUpperCase()}
                                                                                </div>
                                                                                <div className="min-w-0">
                                                                                    <p className="font-bold text-slate-900 text-sm truncate">{member.user?.name || 'Anonymous'}</p>
                                                                                    <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
                                                                                    {member.user?.phone && <p className="text-xs font-semibold text-[#df472b] mt-1">{member.user.phone}</p>}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-slate-500 italic">No members have joined yet.</p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col border border-slate-200"
                        >
                            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                <h3 className="text-xl font-bold text-slate-950 tracking-tight">{editingItem ? 'Edit Record' : 'Add New Record'}</h3>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors hover:bg-slate-50"><X size={16} /></button>
                            </div>
                            <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/50">
                                <form id="modal-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {getFormFields().map(field => (
                                        <div key={field.name} className={`space-y-1.5 ${field.col || ''}`}>
                                            <label className="text-xs font-semibold text-slate-700">{field.label}</label>
                                            
                                            {field.type === 'file' ? (
                                                <input
                                                    type="file"
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.files[0] })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none"
                                                />
                                            ) : field.type === 'file_multiple' ? (
                                                <GalleryFilePicker
                                                    field={field}
                                                    formData={formData}
                                                    setFormData={setFormData}
                                                />
                                            ) : field.type === 'bhk_plans' ? (
                                                <BhkPlansBuilder
                                                    value={formData[field.name] || ''}
                                                    files={formData.floorPlanFiles || {}}
                                                    onFileChange={(bhk, file) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            floorPlanFiles: {
                                                                ...(prev.floorPlanFiles || {}),
                                                                [bhk]: file,
                                                            },
                                                        }));
                                                    }}
                                                    onChange={(meta) => {
                                                        const priceParts = buildPriceFormParts(meta.minPrice);
                                                        setFormData({
                                                            ...formData,
                                                            [field.name]: meta.text,
                                                            bhk: meta.primaryBhk || '',
                                                            area: meta.primaryArea || formData.area || '',
                                                            price: meta.minPrice || formData.price || '',
                                                            ...priceParts,
                                                        });
                                                    }}
                                                />
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full min-h-[100px] p-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none resize-none"
                                                    placeholder={field.placeholder || `Enter ${field.label}...`}
                                                    required={field.required !== false}
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: field.options[0].v === true || field.options[0].v === false ? e.target.value === 'true' : e.target.value })}
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none cursor-pointer"
                                                    required={field.required !== false}
                                                >
                                                    <option value="">Select Option</option>
                                                    {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                                                </select>
                                            ) : field.type === 'creatable_select' ? (
                                                <div className="flex gap-2">
                                                    <select
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                        className="flex-grow h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none cursor-pointer"
                                                        required={field.required !== false}
                                                    >
                                                        <option value="">Select Option</option>
                                                        {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCreateSelectOption(field)}
                                                        className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors whitespace-nowrap"
                                                    >
                                                        Add New
                                                    </button>
                                                </div>
                                            ) : field.type === 'price_multiplier' ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={formData[field.name + '_raw'] !== undefined ? formData[field.name + '_raw'] : (formData[field.name] || '')}
                                                        onChange={(e) => {
                                                            const raw = e.target.value;
                                                            const multiplier = formData[field.name + '_unit'] || 1;
                                                            setFormData({ 
                                                                ...formData, 
                                                                [field.name + '_raw']: raw,
                                                                [field.name]: raw ? Number(raw) * multiplier : ''
                                                            });
                                                        }}
                                                        className="flex-grow h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none"
                                                        placeholder={`Enter ${field.label}...`}
                                                        required={field.required !== false}
                                                    />
                                                    <select
                                                        value={formData[field.name + '_unit'] || 1}
                                                        onChange={(e) => {
                                                            const multiplier = Number(e.target.value);
                                                            const raw = formData[field.name + '_raw'] !== undefined ? formData[field.name + '_raw'] : (formData[field.name] || 0);
                                                            setFormData({ 
                                                                ...formData, 
                                                                [field.name + '_unit']: multiplier,
                                                                [field.name]: raw ? Number(raw) * multiplier : ''
                                                            });
                                                        }}
                                                        className="w-24 h-10 px-2 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none cursor-pointer"
                                                    >
                                                        <option value={1}>₹</option>
                                                        <option value={100000}>Lakhs</option>
                                                        <option value={10000000}>Cr</option>
                                                    </select>
                                                </div>
                                            ) : field.type === 'checkbox_group' ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {field.options.map((opt) => {
                                                        const isChecked = (formData[field.name] || []).includes(opt.v);
                                                        return (
                                                            <label key={opt.v} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${isChecked ? 'border-[#db4a2b] bg-[#db4a2b]/5' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 text-[#db4a2b] bg-white border-slate-300 rounded focus:ring-[#db4a2b] focus:ring-2 cursor-pointer"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        const current = formData[field.name] || [];
                                                                        if (e.target.checked) {
                                                                            setFormData({ ...formData, [field.name]: [...current, opt.v] });
                                                                        } else {
                                                                            setFormData({ ...formData, [field.name]: current.filter(c => c !== opt.v) });
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="text-sm font-semibold text-slate-700">{opt.l}</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            ) : field.type === 'select' ? (
                                                <select
                                                    value={formData[field.name] !== undefined ? formData[field.name] : ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData({ ...formData, [field.name]: val === 'true' ? true : val === 'false' ? false : val });
                                                    }}
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none cursor-pointer"
                                                >
                                                    <option value="" disabled>Select {field.label}</option>
                                                    {field.options.map(opt => (
                                                        <option key={opt.v} value={opt.v}>{opt.l}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full min-h-[100px] p-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none transition-all resize-none"
                                                    placeholder={`Enter ${field.label}...`}
                                                    disabled={field.disabled}
                                                />
                                            ) : (
                                                field.type === 'datetime-local' ? (
                                                    <input
                                                        type="datetime-local"
                                                        value={formData[field.name] ? new Date(formData[field.name]).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value ? new Date(e.target.value) : null })}
                                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none"
                                                    />
                                                ) : field.type === 'date' ? (
                                                    <input
                                                        type="date"
                                                        value={toDateInputValue(formData[field.name])}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none"
                                                        required={field.required !== false}
                                                    />
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-[#db4a2b] focus:ring-1 focus:ring-[#db4a2b] outline-none disabled:bg-slate-50 disabled:text-slate-400"
                                                        placeholder={`Enter ${field.label}...`}
                                                        disabled={field.disabled}
                                                        required={field.required !== false && field.type !== 'checkbox'}
                                                    />
                                                )
                                            )}
                                        </div>
                                    ))}
                                </form>
                            </div>
                            <div className="p-5 md:p-6 bg-white flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 hover:text-slate-900">Cancel</button>
                                <button type="submit" form="modal-form" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-[#db4a2b]" disabled={submitLoading}>
                                    {submitLoading ? <Loader2 className="animate-spin" size={16} /> : <span>{editingItem ? 'Save Changes' : 'Create Record'}</span>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const OverviewSection = ({ stats }) => {
    if (!stats) return null;
    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-slate-900', bg: 'bg-slate-100' },
                    { label: 'Active Groups', value: stats.activeGroups || 0, icon: Handshake, color: 'text-slate-900', bg: 'bg-slate-100' },
                    { label: 'Total Properties', value: stats.totalProperties || 0, icon: Building2, color: 'text-[#db4a2b]', bg: 'bg-[#fff2ed]' },
                    { label: 'Total Leads', value: stats.totalLeads || 0, icon: MessageSquare, color: 'text-slate-900', bg: 'bg-slate-100' }
                ].map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] flex flex-col"
                    >
                        <div className={`w-10 h-10 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon size={20} />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-950 tracking-tight">{stat.value}</h3>
                        <p className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider mt-2">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-950 tracking-tight">Recent Platform Activity</h3>
                        <p className="text-sm text-slate-500 mt-1">Latest leads and events in the system.</p>
                    </div>
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 text-slate-400 border border-slate-200">
                        <BarChart3 size={18} />
                    </div>
                </div>
                <div className="space-y-4">
                    {(!stats.recentLeads || stats.recentLeads.length === 0) ? (
                        <p className="text-slate-500 text-sm italic">No recent activity found.</p>
                    ) : (
                        stats.recentLeads.map((lead, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-md border border-slate-200 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200">
                                        {(lead.name || 'L').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-950 text-sm">{lead.name}</p>
                                        <p className="text-xs text-slate-500">{lead.email} • {lead.city || 'Any Location'}</p>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-md">New Lead</span>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1.5">{format(new Date(lead.createdAt || new Date()), 'dd MMM yyyy, hh:mm a')}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
