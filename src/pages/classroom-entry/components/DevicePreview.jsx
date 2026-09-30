import React, { useEffect, useRef } from 'react';
import { MicOff } from 'lucide-react';

export default function DevicePreview({ 
  stream, 
  isVideoEnabled, 
  isAudioEnabled,
  userName 
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = userName 
    ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 flex items-center justify-center">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isVideoEnabled && stream ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: 'scaleX(-1)' }} // Mirror local video
      />

      {/* Avatar Fallback */}
      {(!isVideoEnabled || !stream) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600/50 shadow-xl">
            <span className="text-3xl sm:text-4xl font-bold text-slate-300 tracking-wider">
              {initials}
            </span>
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-slate-200 font-medium text-sm flex items-center shadow-lg">
          {userName || 'Guest'}
        </div>
        
        {!isAudioEnabled && (
          <div className="bg-red-500 text-white p-1.5 rounded-lg shadow-lg">
            <MicOff size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
