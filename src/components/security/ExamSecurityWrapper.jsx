import React, { useEffect, useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';

export default function ExamSecurityWrapper({ children, onViolationsExceeded }) {
  const { settings, triggerWarning } = useSecurity();
  const [violations, setViolations] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const requestFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    }
  };

  useEffect(() => {
    if (!settings.enableExamSecurity) return;

    // Track tab switching or window blur
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordViolation();
      }
    };

    const handleBlur = () => {
      recordViolation();
    };

    // Track full screen exit
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        triggerWarning("You must remain in full screen during the exam.");
      } else {
        setIsFullScreen(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [settings.enableExamSecurity, violations]);

  const recordViolation = () => {
    const newCount = violations + 1;
    setViolations(newCount);
    
    if (newCount === 1) {
      triggerWarning("First Warning: Please remain on the exam screen.");
    } else if (newCount === 2) {
      triggerWarning("Second Warning: Further violations will terminate your exam.");
    } else if (newCount >= 3) {
      triggerWarning("Maximum violations reached. Auto-submitting exam.");
      if (onViolationsExceeded) {
        onViolationsExceeded();
      }
    }
  };

  if (!settings.enableExamSecurity) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full">
      {!isFullScreen && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
            <h3 className="text-xl font-bold text-red-600 mb-4">Exam Security Enabled</h3>
            <p className="text-slate-600 mb-6 text-sm">
              This exam requires full-screen mode. Tab switching or leaving the window will be recorded as a violation. 
              Three violations will result in automatic submission.
            </p>
            <button 
              onClick={requestFullScreen}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Enter Full Screen to Start
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
