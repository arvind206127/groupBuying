const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../frontend/src/pages/AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Play icon to lucide-react import
content = content.replace(
    /Sparkles(\n| )*\} from 'lucide-react';/,
    'Sparkles, Play$1} from \'lucide-react\';'
);

// 2. Add project-videos to keyMap in fetchTabData
content = content.replace(
    /'subscriptions': 'subscriptions',/,
    '\'subscriptions\': \'subscriptions\',\n                    \'project-videos\': \'projectVideos\','
);

// 3. Add handleFileUpload and update handleSubmit
const handleUploadCode = `
    const handleFileUpload = async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post(\`/admin/upload?folder=\${folder}\`, formData, {
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
            let submitData = { ...formData };
            
            // Handle file uploads
            if (submitData.thumbnailUrl instanceof File) {
                const url = await handleFileUpload(submitData.thumbnailUrl, 'properties');
                if (url) submitData.thumbnailUrl = url;
            }
            if (submitData.videoUrl instanceof File) {
                const url = await handleFileUpload(submitData.videoUrl, activeTab === 'project-videos' ? 'project-videos' : 'properties');
                if (url) submitData.videoUrl = url;
            }
            if (Array.isArray(submitData.imagesFileList) && submitData.imagesFileList.length > 0) {
                const urls = [];
                // keep old string urls
                if (submitData.images && typeof submitData.images === 'string') {
                    urls.push(...submitData.images.split('\\n').map(s=>s.trim()).filter(Boolean));
                }
                for (const file of submitData.imagesFileList) {
                    if (file instanceof File) {
                        const url = await handleFileUpload(file, 'properties');
                        if (url) urls.push(url);
                    }
                }
                submitData.images = urls.join('\\n');
                delete submitData.imagesFileList;
            }

            let endpoint = editingItem ? \`/admin/\${activeTab}/\${editingItem.id}\` : \`/admin/\${activeTab}\`;
            if (['properties'].includes(activeTab)) {
                endpoint = editingItem ? \`/\${activeTab}/\${editingItem.id}\` : \`/\${activeTab}\`;
            }

            if (editingItem) {
                await api.put(endpoint, submitData);
            } else {
                await api.post(endpoint, submitData);
            }
            toast.success(editingItem ? 'Updated successfully' : 'Created successfully');
            setShowModal(false);
            fetchTabData();
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setSubmitLoading(false);
        }
    };
`;

content = content.replace(
    /const handleSubmit = async \(e\) => \{[\s\S]*?setSubmitLoading\(false\);\s*\}\s*\};/,
    handleUploadCode
);

// 4. Update getFormFields to change input types and add project-videos
const projectVideosFields = `
            case 'project-videos':
                return [
                    { name: 'title', label: 'Video Title', type: 'text' },
                    { name: 'videoUrl', label: 'Project Video File', type: 'file', col: 'col-span-2' },
                    { name: 'propertyId', label: 'Related Property', type: 'select', options: properties.map(p => ({ v: p.id, l: p.title })) },
                    { name: 'isActive', label: 'Active Status', type: 'select', options: [{ v: true, l: 'Active' }, { v: false, l: 'Inactive' }] },
                    { name: 'isFeatured', label: 'Featured Video', type: 'select', options: [{ v: true, l: 'YES' }, { v: false, l: 'NO' }] }
                ];`;

content = content.replace(
    /\{ name: 'thumbnailUrl', label: 'Main Thumbnail URL', type: 'text', col: 'col-span-2' \},/,
    '{ name: \'thumbnailUrl\', label: \'Main Thumbnail Image\', type: \'file\', col: \'col-span-2\' },'
);
content = content.replace(
    /\{ name: 'videoUrl', label: 'Project Video URL', type: 'text', col: 'col-span-2' \},/,
    '{ name: \'videoUrl\', label: \'Project Video File\', type: \'file\', col: \'col-span-2\' },'
);
content = content.replace(
    /\{ name: 'images', label: 'Additional Images \(One URL per line\)', type: 'textarea', col: 'col-span-2' \},/,
    '{ name: \'imagesFileList\', label: \'Additional Images (Select Multiple)\', type: \'file_multiple\', col: \'col-span-2\' },'
);

content = content.replace(
    /case 'groups':/,
    projectVideosFields + '\n            case \'groups\':'
);

// We need 'properties' in state for the project-videos select
if (!content.includes('const [properties, setProperties]')) {
    content = content.replace(
        /const \[developers, setDevelopers\] = useState\(\[\]\);/,
        'const [developers, setDevelopers] = useState([]);\n    const [properties, setProperties] = useState([]);'
    );
    content = content.replace(
        /api\.get\('\/admin\/developers'\)/,
        'api.get(\'/admin/developers\'),\n                api.get(\'/properties\')'
    );
    content = content.replace(
        /if \(devsRes\.data\.success\) setDevelopers\(devsRes\.data\.developers\);/,
        'if (devsRes.data.success) setDevelopers(devsRes.data.developers);\n            const propsRes = arguments[0][2];\n            if (propsRes?.data?.success) setProperties(propsRes.data.properties);'
    );
    // actually Promise.all array destructing is better
    content = content.replace(
        /const \[rmsRes, devsRes\] = await Promise\.all\(\[/,
        'const [rmsRes, devsRes, propsRes] = await Promise.all(['
    );
}

// 5. Add Project Videos to menuItems
content = content.replace(
    /\{ id: 'overview', name: 'Dashboard', icon: BarChart3, section: 'main' \},/,
    '{ id: \'overview\', name: \'Dashboard\', icon: BarChart3, section: \'main\' },\n        { id: \'project-videos\', name: \'Project Videos\', icon: Play, section: \'main\' },'
);

// 6. Form rendering for file inputs
const fileInputRender = `
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
`;

content = content.replace(
    /\{field\.type === 'textarea' \? \(/,
    fileInputRender
);

// Add project-videos table headers
const projectVideosHeaders = `
                                            {activeTab === 'project-videos' && <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Video Title</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            </>}
`;
content = content.replace(
    /\{activeTab === 'users' && <>/,
    projectVideosHeaders + '\n                                            {activeTab === \'users\' && <>'
);

// Add project-videos table rows
const projectVideosRows = `
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
                                                        <span className={\`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider \${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}\`}>
                                                            {item.isActive ? 'Active' : 'Hidden'}
                                                        </span>
                                                        {item.isFeatured && (
                                                            <span className="ml-2 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider bg-[#df472b]/10 text-[#df472b]">Featured</span>
                                                        )}
                                                    </td>
                                                </>}
`;
content = content.replace(
    /\{activeTab === 'users' && <>/,
    projectVideosRows + '\n                                                {activeTab === \'users\' && <>'
);


fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched AdminDashboard.jsx");
