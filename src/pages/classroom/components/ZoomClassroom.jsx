import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import { AlertCircle } from 'lucide-react';
import { getLiveClass } from '../../../services/liveClassService';

const ZoomClassroom = ({ liveClassId, user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [warningCount, setWarningCount] = useState(0);
  const zoomClientRef = useRef(null);
  const containerRef = useRef(null);

  // Format masked mobile number (e.g., 9876543210 -> 98******10)
  const maskMobile = (mobile) => {
    if (!mobile || mobile.length < 4) return 'N/A';
    const str = String(mobile);
    return `${str.substring(0, 2)}${'*'.repeat(Math.max(str.length - 4, 2))}${str.substring(str.length - 2)}`;
  };

  // Update timestamp for dynamic watermark
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Strict Anti-Recording Event Listeners
  useEffect(() => {
    if (user?.role === 'Admin') return; // Disable for Admin

    // 1. Block Context Menu (Right Click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Block Keyboard Shortcuts (PrintScreen, DevTools, Copy)
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault();
        setWarningCount(prev => prev + 1);
        console.warn("Screen capture shortcuts are strictly prohibited.");
      }
    };

    // 3. Monitor visibility change (often indicates switching to a recording tool)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => prev + 1);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Poll for Authoritative Meeting Ended Status
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await getLiveClass(liveClassId);
        if (isMounted && res?.data?.status === 'Completed') {
          // The authoritative webhook has confirmed the meeting is over
          if (user?.role === 'Admin' || user?.role === 'Faculty') {
            const adminBase = import.meta.env.VITE_ADMIN_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5174' : 'https://admin.drsamreefathradiologyacademy.com');
            window.location.href = `${adminBase}/live-classes`;
          } else {
            // Send student back to their dashboard
            window.location.href = '/dashboard';
          }
        }
      } catch (err) {
        console.error('Failed to poll class status:', err);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [liveClassId, user]);

  useEffect(() => {
    let isMounted = true;

    const initZoom = async () => {
      try {
        // Fetch credentials and signature dynamically from the backend
        const res = await axiosInstance.get(`/zoom/sdk-credentials/${liveClassId}`);
        const payload = res.data;

        if (!isMounted) return;

        const iframe = document.getElementById('zoom-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'INIT_ZOOM',
            payload: payload
          }, '*');
        } else {
          // Iframe not ready yet, we will retry in onLoad of the iframe
          window.zoomInitPayload = payload;
        }

      } catch (err) {
        console.error("Zoom SDK Credential Error:", err);
        if (isMounted) {
          let errorMsg = "Zoom is temporarily unavailable. Please try again.";
          if (err.response) {
            const status = err.response.status;
            if (status === 404) errorMsg = "This class is no longer available.";
            else if (status === 403 || status === 401) errorMsg = "You are not authorized to join this class.";
            else if (status === 400 && err.response.data?.message?.includes('OAuth')) errorMsg = "Your Zoom host account is not connected.";
          }
          setError(errorMsg);
          setLoading(false);
        }
      }
    };

    const handleIframeMessage = (event) => {
      if (event.data?.type === 'ZOOM_JOINED') {
        if (isMounted) setLoading(false);
      } else if (event.data?.type === 'ZOOM_ERROR') {
        console.error('[Zoom SDK Iframe Error]', event.data.error);
        if (isMounted) {
          setError("Zoom is temporarily unavailable. Please try again.");
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleIframeMessage);
    initZoom();

    return () => {
      isMounted = false;
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [liveClassId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] w-full h-full bg-slate-950 text-white">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Connection Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="academy-classroom-wrapper relative w-full h-full min-h-[600px] overflow-hidden bg-slate-950 flex flex-col select-none" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', isolation: 'isolate' }}>

      {/* Zoom Meeting Container - Stacking Context Barrier */}
      <div className="zoom-meeting-container relative w-full h-full flex-grow z-0 overflow-hidden" style={{ position: 'relative', zIndex: 0 }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 text-white">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Connecting to Zoom Meeting...</p>
          </div>
        )}
        {/* Isolated Zoom Meeting SDK Iframe */}
        <iframe
          id="zoom-iframe"
          src="/zoom-frame.html"
          allow="camera; microphone; display-capture; fullscreen"
          className="w-full h-full border-none flex-grow"
          style={{ width: '100%', height: '100%', display: 'block' }}
          title="Zoom Classroom"
          onLoad={() => {
            if (window.zoomInitPayload && zoomClientRef.current !== 'initialized') {
              zoomClientRef.current = 'initialized';
              document.getElementById('zoom-iframe').contentWindow.postMessage({
                type: 'INIT_ZOOM',
                payload: window.zoomInitPayload
              }, '*');
            }
          }}
        ></iframe>
      </div>

      {/* Academy Security Overlay - Positioned securely ABOVE the Zoom Container */}
      {user?.role !== 'Admin' && (
        <div className="academy-security-overlay absolute inset-0 flex flex-col pointer-events-none" style={{ zIndex: 999999 }}>
          {/* Strict Prohibition Notice */}
        <div className="w-full bg-red-600/90 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 pointer-events-auto">
          <AlertCircle className="w-4 h-4" />
          <span>
            <strong>STRICT WARNING:</strong> Unauthorized recording, downloading, or screen capture is strictly prohibited and actively monitored.
          </span>
        </div>

        {warningCount > 0 && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-xl animate-pulse border border-red-400 pointer-events-none">
            Suspicious activity detected ({warningCount}). Screen capture tools are prohibited.
          </div>
        )}

        {/* Dynamic Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-difference flex flex-col justify-around">
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="w-full flex justify-around opacity-[0.20] text-white font-mono text-sm lg:text-base font-bold select-none rotate-[-15deg] whitespace-nowrap">
              {[...Array(3)].map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col items-center drop-shadow-md">
                  <span>{user?.name || 'Student'}</span>
                  <span>{maskMobile(user?.mobile || user?.email || 'Unknown')}</span>
                  <span>ID: {liveClassId?.slice(-6)}</span>
                  <span>{currentTime.toISOString().replace('T', ' ').slice(0, 19)} UTC</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>
      )}

    </div>
  );
};

export default ZoomClassroom;
