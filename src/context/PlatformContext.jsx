import React, { createContext, useContext, useState, useEffect } from 'react';
import { setSecuritySettings } from '../utils/securitySettings';

const PlatformContext = createContext();

export const PlatformProvider = ({ children }) => {
  const [platformSettings, setPlatformSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
        const data = await response.json();
        if (data.success) {
          setPlatformSettings(data.data);
          // Sync security settings globally
          if (data.data.security) {
            setSecuritySettings(data.data.security);
          }
        }
      } catch (error) {
        console.error('Failed to load platform settings', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (platformSettings?.general) {
      if (platformSettings.general.websiteName) {
        document.title = platformSettings.general.websiteName;
      }
      if (platformSettings.general.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = platformSettings.general.faviconUrl;
      }
    }
  }, [platformSettings]);

  return (
    <PlatformContext.Provider value={{ platformSettings, isLoading }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => useContext(PlatformContext);
