// Default security settings
const DEFAULT_SECURITY_SETTINGS = {
  enableRightClickProtection: true,
  enableCopyPasteProtection: true,
  enableExamSecurity: true,
  enableWatermarking: true,
  enableDownloadRestrictions: true,
};

// Key used in localStorage to sync settings across apps
const SETTINGS_KEY = 'srra_security_settings';

export const getSecuritySettings = () => {
  try {
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    if (settingsStr) {
      return { ...DEFAULT_SECURITY_SETTINGS, ...JSON.parse(settingsStr) };
    }
  } catch (error) {
    console.error('Failed to parse security settings from localStorage', error);
  }
  return DEFAULT_SECURITY_SETTINGS;
};

export const setSecuritySettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Dispatch a custom event so the same window can react if needed
    window.dispatchEvent(new Event('securitySettingsChanged'));
  } catch (error) {
    console.error('Failed to save security settings to localStorage', error);
  }
};
