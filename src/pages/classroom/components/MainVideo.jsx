import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';

const MainVideo = React.memo(({ screenTrack, cameraTrack, isTeacher, user }) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (wrapperRef.current?.requestFullscreen) {
        wrapperRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={wrapperRef} className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-2xl group">
      {/* Screen Share Track */}
      {screenTrack && (
        <VideoTrack
          trackRef={screenTrack}
          className={`w-full h-full object-contain absolute inset-0 z-20`}
        />
      )}
      
      {/* Camera Track (Hidden if Screen Share is active) */}
      {cameraTrack && (
        <VideoTrack
          trackRef={cameraTrack}
          className={`w-full h-full object-contain absolute inset-0 ${screenTrack ? 'invisible -z-10 opacity-0 pointer-events-none' : 'z-10'} ${isTeacher ? '-scale-x-100' : ''}`}
        />
      )}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/10 shadow-lg flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
        {isTeacher ? 'You (Broadcasting)' : 'Teacher'}
      </div>
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/80 rounded-lg transition-all text-slate-300 hover:text-white backdrop-blur-sm z-[110]"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {/* Dynamic Forensic Watermark for Students */}
      {!isTeacher && user && (
        <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
            <div className="absolute text-white/30 text-2xl font-black uppercase tracking-widest whitespace-nowrap animate-watermark mix-blend-overlay drop-shadow-md">
              {user?.email} • {user?._id?.substring(0, 8)}
            </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.screenTrack?.publication?.trackSid === nextProps.screenTrack?.publication?.trackSid && 
         prevProps.cameraTrack?.publication?.trackSid === nextProps.cameraTrack?.publication?.trackSid && 
         prevProps.isTeacher === nextProps.isTeacher && 
         prevProps.user?._id === nextProps.user?._id;
});

export default MainVideo;
