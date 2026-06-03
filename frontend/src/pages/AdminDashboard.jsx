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
    X, Loader2, ChevronRight, Download, Mail, Phone, Sparkles, Play, Settings
} from 'lucide-react';

const sortByName = (records = []) => [...records].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

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

const AdminDashboard = () => {
    const { handleLogout } = useAuth();
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
            case 'properties':
                return [
                    { name: 'title', label: 'Property Title', type: 'text' },
                    { name: 'city', label: 'City', type: 'text' },
                    { name: 'locality', label: 'Locality', type: 'text' },
                    { name: 'category', label: 'Category', type: 'select', options: [{ v: 'Residential', l: 'Residential' }, { v: 'Commercial', l: 'Commercial' }, { v: 'Plots', l: 'Plots' }, { v: 'Villa', l: 'Villa' }] },
                    { name: 'displaySection', label: 'Display Section', type: 'select', options: [{ v: '', l: 'None' }, { v: 'FEATURED_COMMERCIAL', l: 'Featured Commercial Properties' }, { v: 'PRE_LAUNCH', l: 'Pre-Launch Properties' }, { v: 'TRENDING', l: 'Trending Properties' }, { v: 'FAST_SELLING', l: 'Fast Selling Properties' }, { v: 'PROMINSHES_AND_PLOTS', l: 'Prominshes & Plots' }] },
                    { name: 'originalPrice', label: 'Original Price / Developer Price (₹)', type: 'price_multiplier' },
                    { name: 'price', label: 'Group Buying Price / Final Price (₹)', type: 'price_multiplier' },
                    { name: 'bhk', label: 'Config (BHK)', type: 'number' },
                    { name: 'area', label: 'Carpet Area (Sq.ft)', type: 'number' },
                    { name: 'thumbnailUrl', label: 'Main Thumbnail Image', type: 'file', col: 'col-span-2' },
                    { name: 'videoUrl', label: 'Project Video File', type: 'file', col: 'col-span-2' },
                    { name: 'trackingCount', label: 'Users Tracking Count (Display)', type: 'number' },
                    { name: 'imagesFileList', label: 'Additional Images (Select Multiple)', type: 'file_multiple', col: 'col-span-2' },
                    { name: 'amenities', label: 'Amenities (One per line)', type: 'textarea', col: 'col-span-2' },
                    { name: 'description', label: 'Detailed Description', type: 'textarea', col: 'col-span-2' },
                    { name: 'targetGroupSize', label: 'Target Group Size', type: 'number' },
                    { name: 'expiryDate', label: 'Offer Expiry Date', type: 'date' },
                    { name: 'developerId', label: 'Developer', type: 'creatable_select', options: developers.filter(d => d.isActive !== false).map(d => ({ v: d.id, l: d.name })) },
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

    const menuItems = [
        { id: 'overview', name: 'Dashboard', icon: BarChart3, section: 'main' },
        { id: 'project-videos', name: 'Project Videos', icon: Play, section: 'main' },
        { id: 'properties', name: 'Properties', icon: Building2, section: 'main' },
        { id: 'groups', name: 'Groups', icon: Handshake, section: 'main' },
        { id: 'subscriptions', name: 'Subscriptions', icon: Sparkles, section: 'management' },
        { id: 'leads', name: 'Leads', icon: MessageSquare, section: 'management' },
        { id: 'users', name: 'Users', icon: Users, section: 'management' },
        { id: 'floating-reel', name: 'Floating Reel', icon: Play, section: 'management' },
        { id: 'settings', name: 'Site Settings', icon: Settings, section: 'management' },
    ];

    return (
        <div className="min-h-screen bg-[#fff7f1] flex flex-col md:h-screen md:flex-row md:overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-full md:w-72 bg-[#121212] border-b md:border-b-0 md:border-r border-black flex flex-col md:h-screen z-[100] shrink-0 shadow-2xl shadow-black/20 overflow-x-auto md:overflow-hidden no-scrollbar">
                <div className="hidden md:flex px-7 py-7 mb-3 flex-col border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#df472b] flex items-center justify-center shadow-lg shadow-[#df472b]/30">
                            <Building2 className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-xl tracking-tight leading-none">Group buying.in</h2>
                            <p className="text-[#ffb199] font-bold text-[10px] uppercase tracking-widest mt-1">Admin Control Center</p>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-row md:flex-col md:flex-1 md:min-h-0 p-3 md:px-4 md:space-y-1 md:overflow-y-auto custom-scrollbar md:pb-10 whitespace-nowrap">
                    {/* Main Section */}
                    <div className="flex md:flex-col w-full gap-1">
                        <p className="hidden md:block text-xs font-bold text-white/40 uppercase tracking-widest px-5 mt-4 mb-2">Main</p>
                        {menuItems.filter(m => m.section === 'main').map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl font-bold transition-all duration-300 shrink-0 ${activeTab === item.id ? 'bg-[#df472b] text-white shadow-lg shadow-[#df472b]/30' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            >
                                <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-white/45'} />
                                <span className="text-xs md:text-sm tracking-wide capitalize">{item.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Management Section */}
                    <div className="flex md:flex-col w-full gap-1 md:border-t md:border-white/10 md:mt-4 md:pt-2">
                        <p className="hidden md:block text-xs font-bold text-white/40 uppercase tracking-widest px-5 mt-4 mb-2">Management</p>
                        {menuItems.filter(m => m.section === 'management').map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl font-bold transition-all duration-300 shrink-0 ${activeTab === item.id ? 'bg-[#df472b] text-white shadow-lg shadow-[#df472b]/30' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            >
                                <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-white/45'} />
                                <span className="text-xs md:text-sm tracking-wide capitalize">{item.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="md:pt-6 md:border-t md:border-white/10 md:mt-4 ml-4 md:ml-0 flex items-center md:block w-full">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl font-bold transition-all duration-300 text-[#ffb199] hover:bg-white/10 hover:text-white shrink-0 w-full"
                        >
                            <LogOut size={18} />
                            <span className="text-xs md:text-sm tracking-wide capitalize">Logout</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-grow min-h-screen md:min-h-0 md:h-screen overflow-y-auto relative w-full">
                <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    <header className="relative overflow-hidden rounded-2xl bg-[#151515] border border-black shadow-xl shadow-[#df472b]/10 p-5 md:p-7 lg:p-8 flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-6 md:mb-8">
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#df472b]" />
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-[#df472b]/10 pointer-events-none" />
                        <div>
                            <p className="text-[#ffb199] text-[10px] md:text-xs font-black uppercase tracking-[0.24em] mb-2">Admin Workspace</p>
                            <h1 className="text-2xl md:text-4xl font-black text-white capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
                            <p className="text-white/60 text-sm mt-2 font-medium">Manage your platform's {activeTab.replace('-', ' ')} efficiently.</p>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            {activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'floating-reel' && (
                                <div className="relative group flex-grow md:flex-grow-0">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-[#ffb199] transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search records..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-12 pr-6 h-11 md:h-12 rounded-xl bg-white/10 shadow-sm border border-white/15 focus:border-[#ffb199] focus:ring-4 focus:ring-[#df472b]/20 w-full md:w-72 transition-all font-semibold text-white placeholder-white/45 text-sm outline-none"
                                    />
                                </div>
                            )}
                            {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'groups' && activeTab !== 'leads' && activeTab !== 'settings' && activeTab !== 'floating-reel' && (
                                <button onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }} className="h-11 md:h-12 px-6 bg-[#df472b] hover:bg-[#c63d23] text-white flex items-center gap-2 shadow-lg shadow-[#df472b]/30 rounded-xl flex-grow md:flex-grow-0 justify-center transition-all">
                                    <Plus size={18} />
                                    <span className="text-xs md:text-sm font-bold whitespace-nowrap">Add New</span>
                                </button>
                            )}
                        </div>
                    </header>

                    {activeTab === 'overview' ? (
                        <OverviewSection stats={stats} />
                    ) : (activeTab === 'settings' || activeTab === 'floating-reel') ? (
                        <div className="bg-white rounded-2xl shadow-[0_18px_55px_rgba(30,20,14,0.08)] border border-[#f0ded5] overflow-hidden p-6 md:p-8">
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
                                                    placeholder={`Enter ${field.label}...`}
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
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                    placeholder={`Enter ${field.label}...`}
                                                    disabled={field.disabled}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    
                                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                        <button type="button" onClick={() => fetchTabData()} className="h-11 md:h-12 px-6 md:px-8 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200/50 transition-colors">Reset</button>
                                        <button type="submit" className="h-11 md:h-12 px-8 md:px-10 bg-[#df472b] hover:bg-[#c63d23] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#df472b]/30 flex items-center gap-2 transition-all" disabled={submitLoading}>
                                            {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <span>Save All Changes</span>}
                                        </button>
                                    </div>
                                </form>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-[0_18px_55px_rgba(30,20,14,0.08)] border border-[#f0ded5] overflow-hidden">
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

                                                {activeTab === 'properties' && <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                                {item.thumbnailUrl ? <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="prop" /> : <Building2 className="m-auto mt-2 text-slate-300" />}
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
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                        {activeTab !== 'users' && activeTab !== 'leads' && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#df472b] hover:border-[#df472b]/30 hover:bg-[#df472b]/5 transition-all flex items-center justify-center">
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                        {activeTab !== 'users' && activeTab !== 'groups' && activeTab !== 'leads' && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 transition-all flex items-center justify-center">
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
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Record' : 'Add New Record'}</h3>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"><X size={18} /></button>
                            </div>
                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
                                <form id="modal-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {getFormFields().map(field => (
                                        <div key={field.name} className={`space-y-2 ${field.col || ''}`}>
                                            <label className="text-xs font-bold text-slate-700">{field.label}</label>
                                            
                                            {field.type === 'file' ? (
                                                <input
                                                    type="file"
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.files[0] })}
                                                    className="w-full px-3 md:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] outline-none"
                                                />
                                            ) : field.type === 'file_multiple' ? (
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: Array.from(e.target.files) })}
                                                    className="w-full px-3 md:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] outline-none"
                                                />
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full min-h-[100px] p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all resize-none"
                                                    placeholder={`Enter ${field.label}...`}
                                                    required
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: field.options[0].v === true || field.options[0].v === false ? e.target.value === 'true' : e.target.value })}
                                                    className="w-full h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all cursor-pointer"
                                                    required
                                                >
                                                    <option value="">Select Option</option>
                                                    {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                                                </select>
                                            ) : field.type === 'creatable_select' ? (
                                                <div className="flex gap-2">
                                                    <select
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                        className="flex-grow h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#df472b] outline-none cursor-pointer"
                                                        required
                                                    >
                                                        <option value="">Select Option</option>
                                                        {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCreateSelectOption(field)}
                                                        className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors whitespace-nowrap"
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
                                                        className="flex-grow h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all"
                                                        placeholder={`Enter ${field.label}...`}
                                                        required
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
                                                        className="w-24 h-11 md:h-12 px-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none cursor-pointer"
                                                    >
                                                        <option value={1}>₹</option>
                                                        <option value={100000}>Lakhs</option>
                                                        <option value={10000000}>Cr</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                field.type === 'datetime-local' ? (
                                                    <input
                                                        type="datetime-local"
                                                        value={formData[field.name] ? new Date(formData[field.name]).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value ? new Date(e.target.value) : null })}
                                                        className="w-full h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all"
                                                    />
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                        className="w-full h-11 md:h-12 px-3 md:px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#df472b] focus:ring-4 focus:ring-[#df472b]/10 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                        placeholder={`Enter ${field.label}...`}
                                                        disabled={field.disabled}
                                                        required
                                                    />
                                                )
                                            )}
                                        </div>
                                    ))}
                                </form>
                            </div>
                            <div className="p-6 md:p-8 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="h-11 md:h-12 px-6 md:px-8 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200/50 transition-colors">Cancel</button>
                                <button type="submit" form="modal-form" className="h-11 md:h-12 px-8 md:px-10 bg-[#df472b] hover:bg-[#c63d23] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#df472b]/30 flex items-center gap-2 transition-all" disabled={submitLoading}>
                                    {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <span>{editingItem ? 'Save Changes' : 'Create Record'}</span>}
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
                    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-[#2563eb]', bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]' },
                    { label: 'Active Groups', value: stats.activeGroups || 0, icon: Handshake, color: 'text-[#16a34a]', bg: 'bg-[#ecfdf3]', border: 'border-[#bbf7d0]' },
                    { label: 'Total Properties', value: stats.totalProperties || 0, icon: Building2, color: 'text-[#df472b]', bg: 'bg-[#fff4ef]', border: 'border-[#ffd3c2]' },
                    { label: 'Total Leads', value: stats.totalLeads || 0, icon: MessageSquare, color: 'text-[#7c3aed]', bg: 'bg-[#f5f3ff]', border: 'border-[#ddd6fe]' }
                ].map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className={`p-5 md:p-6 rounded-2xl border ${stat.border} bg-white shadow-[0_18px_45px_rgba(30,20,14,0.06)] flex flex-col`}
                    >
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-5`}>
                            <stat.icon size={24} />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider mt-2">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-7 shadow-[0_18px_55px_rgba(30,20,14,0.07)] border border-[#f0ded5]">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[#df472b] text-[10px] font-black uppercase tracking-[0.22em] mb-1">Live Activity</p>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Recent Platform Activity</h3>
                    </div>
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white">
                        <BarChart3 size={18} />
                    </div>
                </div>
                <div className="space-y-4">
                    {(!stats.recentLeads || stats.recentLeads.length === 0) ? (
                        <p className="text-slate-500 text-sm italic">No recent activity found.</p>
                    ) : (
                        stats.recentLeads.map((lead, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-[#fff8f3] rounded-xl border border-[#f1ded4] gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm text-[#df472b] flex items-center justify-center font-bold text-sm border border-[#ffd3c2]">
                                        {(lead.name || 'L').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                                        <p className="text-xs text-slate-500">{lead.email} • {lead.city || 'Any Location'}</p>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold text-[10px] uppercase tracking-wider rounded-full">New Lead</span>
                                    <p className="text-[10px] font-semibold text-slate-400 mt-1">{format(new Date(lead.createdAt || new Date()), 'dd MMM yyyy, hh:mm a')}</p>
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
