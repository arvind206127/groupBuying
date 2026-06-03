import { useEffect } from 'react';
import api from '../api/axios';

const SiteSettingsSync = () => {
  useEffect(() => {
    const updateSettings = (settings = {}) => {
      window.__SITE_SETTINGS__ = settings;
    };

    const loadSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success) updateSettings(res.data.settings);
      } catch (error) {
        console.error('Site settings fetch failed');
      }
    };

    const handleSync = (event) => {
      if (event.key === 'site_settings_sync' && event.newValue) {
        updateSettings(JSON.parse(event.newValue));
      }
    };

    loadSettings();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  return null;
};

export default SiteSettingsSync;
