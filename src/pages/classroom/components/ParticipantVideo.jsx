import React, { useEffect, useRef } from 'react';
import { MicOff } from 'lucide-react';

const ParticipantVideo = React.memo(({ stream, participant, isMuted, isLocal }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  return (
    <div className={`${isLocal ? "w-full h-full bg-black relative" : "w-48 flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg shrink-0"}`}>
      <div className={`flex-1 bg-black relative ${!isLocal && "absolute inset-0"}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full absolute inset-0 object-cover ${isLocal ? '-scale-x-100' : ''}`}
        />
      </div>
      {isLocal ? (
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-sm z-10">
          You
          {isMuted && <MicOff size={10} className="text-red-400" />}
        </div>
      ) : (
        <div className="px-2 py-1.5 text-center text-xs text-slate-300 font-medium truncate bg-slate-800 border-t border-slate-700 z-10 relative">
          {participant ? participant.name : 'Student'}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.stream === nextProps.stream &&
    prevProps.isMuted === nextProps.isMuted &&
    prevProps.isLocal === nextProps.isLocal &&
    prevProps.participant?.id === nextProps.participant?.id &&
    prevProps.participant?.name === nextProps.participant?.name
  );
});

export default ParticipantVideo;
