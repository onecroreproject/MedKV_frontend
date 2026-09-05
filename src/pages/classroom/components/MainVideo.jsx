import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const MainVideo = React.memo(({ stream, isTeacher, user }) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

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
      <video
        ref={videoRef}
        autoPlay 
        playsInline 
        muted={isTeacher}
        className={`w-full h-full object-contain ${isTeacher ? '-scale-x-100' : ''}`}
      />
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/10 shadow-lg flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
        {isTeacher ? 'You (Broadcasting)' : 'Teacher'}
      </div>
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/80 rounded-lg transition-all text-slate-300 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100"
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
  return prevProps.stream === nextProps.stream && 
         prevProps.isTeacher === nextProps.isTeacher && 
         prevProps.user?._id === nextProps.user?._id;
});

export default MainVideo;
