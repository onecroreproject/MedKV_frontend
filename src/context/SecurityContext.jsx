import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSecuritySettings } from '../utils/securitySettings';

const SecurityContext = createContext();

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }) => {
  const [settings, setSettings] = useState(getSecuritySettings());
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Listen for changes from localStorage across tabs/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'srra_security_settings') {
        setSettings(getSecuritySettings());
      }
    };
    
    const handleLocalEvent = () => {
      setSettings(getSecuritySettings());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('securitySettingsChanged', handleLocalEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('securitySettingsChanged', handleLocalEvent);
    };
  }, []);

  useEffect(() => {
    // 1. Right Click Protection
    const handleContextMenu = (e) => {
      if (settings.enableRightClickProtection) {
        e.preventDefault();
        triggerWarning("Right-click is disabled to protect educational content.");
      }
    };

    // 2. Copy/Cut/Paste Protection
    const handleCopyPaste = (e) => {
      if (settings.enableCopyPasteProtection) {
        // Exclude input fields from copy/paste protection so users can still type
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          triggerWarning("Copying text is disabled on this platform.");
        }
      }
    };

    // 3. Keyboard Shortcut Protection
    const handleKeyDown = (e) => {
      // If F12, we ALLOW it per user request
      if (e.key === 'F12') {
        return; // Allow
      }

      if (settings.enableCopyPasteProtection) {
        // Block Ctrl+C, Ctrl+X, Ctrl+P, Ctrl+U, Ctrl+S
        if (e.ctrlKey || e.metaKey) {
          const key = e.key.toLowerCase();
          if (['c', 'x', 'p', 'u', 's'].includes(key)) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
              triggerWarning("This keyboard shortcut is disabled.");
            }
          }
        }
      }

      if (settings.enableRightClickProtection) {
        // Block DevTools shortcuts: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
          const key = e.key.toLowerCase();
          if (['i', 'j', 'c'].includes(key)) {
            e.preventDefault();
            triggerWarning("Developer tools shortcuts are disabled.");
          }
        }
      }
    };

    // Apply document-level text selection disabled style if enabled
    if (settings.enableCopyPasteProtection) {
      document.body.style.userSelect = 'none';
      document.body.style.WebkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = 'auto';
      document.body.style.WebkitUserSelect = 'auto';
    }

    // Attach all listeners globally
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = 'auto';
      document.body.style.WebkitUserSelect = 'auto';
    };
  }, [settings]);

  const triggerWarning = (msg) => {
    setWarningMessage(msg);
    setShowWarning(true);
    setTimeout(() => {
      setShowWarning(false);
    }, 3000);
  };

  return (
    <SecurityContext.Provider value={{ settings, triggerWarning }}>
      {children}
      
      {/* Global Warning Toast */}
      {showWarning && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl font-bold flex items-center space-x-3 z-[9999] animate-in slide-in-from-bottom-5">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span>{warningMessage}</span>
        </div>
      )}
    </SecurityContext.Provider>
  );
};
