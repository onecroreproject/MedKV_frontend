import React, { createContext, useContext, useState, useEffect } from 'react';

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
          // Apply security settings globally if needed
          if (data.data.security) {
            applySecuritySettings(data.data.security);
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

  const applySecuritySettings = (security) => {
    if (security.enableRightClickProtection) {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    if (security.enableCopyPasteProtection) {
      document.addEventListener('copy', (e) => e.preventDefault());
      document.addEventListener('paste', (e) => e.preventDefault());
      document.addEventListener('cut', (e) => e.preventDefault());
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'p' || e.key === 'u' || e.key === 'I')) {
          e.preventDefault();
        }
      });
    }
    // other features like watermarking can be injected here or within specific components
  };

  return (
    <PlatformContext.Provider value={{ platformSettings, isLoading }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => useContext(PlatformContext);
