import React, { useEffect, useState, useRef } from 'react';
import api from '../../../services/api';

const ZoomClassroom = ({ liveClassId, user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const zoomClientRef = useRef(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const initZoom = async () => {
      try {
        const { default: ZoomMtgEmbedded } = await import('@zoom/meetingsdk/embedded');
        const client = ZoomMtgEmbedded.createClient();
        zoomClientRef.current = client;
        
        // Fetch credentials and signature dynamically from the backend
        const res = await api.get(`/zoom/sdk-credentials/${liveClassId}`);
        const { signature, meetingNumber, passcode, userName, userEmail, zak, sdkKey } = res.data;

        if (!isMounted) return;

        const meetingRoot = document.getElementById('zoom-meeting-root');

        client.init({
          zoomAppRoot: meetingRoot,
          language: 'en-US',
          customize: {
            video: {
              isResizable: true,
              viewSizes: {
                default: { width: 1000, height: 600 },
                ribbon: { width: 300, height: 700 }
              }
            }
          }
        });

        // Join using the secure signature.
        // For hosts, 'zak' will be populated. For students, 'zak' will be undefined.
        client.join({
          signature: signature,
          sdkKey: sdkKey,
          meetingNumber: meetingNumber,
          password: passcode,
          userName: userName,
          userEmail: userEmail,
          zak: zak
        }).then(() => {
          if (isMounted) setLoading(false);
        }).catch((e) => {
          console.error("Zoom join error:", e);
          if (isMounted) {
            setError("Failed to join the meeting.");
            setLoading(false);
          }
        });

      } catch (err) {
        console.error("Zoom SDK Init Error:", err);
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to initialize Zoom meeting.");
          setLoading(false);
        }
      }
    };

    initZoom();

    return () => {
      isMounted = false;
      // Cleanup Zoom SDK when unmounting component
      if (zoomClientRef.current) {
         try {
           ZoomMtgEmbedded.destroyClient();
         } catch(e) {
           console.error("Zoom cleanup error", e);
         }
      }
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
    <div className="w-full h-full min-h-[600px] relative bg-slate-950 flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 text-white">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Connecting to Zoom Meeting...</p>
        </div>
      )}
      {/* Zoom will inject its UI into this element */}
      <div id="zoom-meeting-root" className="w-full flex-grow relative"></div>
    </div>
  );
};

export default ZoomClassroom;
