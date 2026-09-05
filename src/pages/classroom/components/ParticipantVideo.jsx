import React from 'react';
import { MicOff } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';

const ParticipantVideo = React.memo(({ participant, isLocal, trackRef }) => {
  const isMuted = !participant?.isMicrophoneEnabled;

  return (
    <div className={`${isLocal ? "w-full h-full bg-black relative" : "w-48 flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg shrink-0"}`}>
      <div className={`flex-1 bg-black relative ${!isLocal && "absolute inset-0"}`}>
        {trackRef ? (
           <VideoTrack
             trackRef={trackRef}
             className={`w-full h-full absolute inset-0 object-cover ${isLocal ? '-scale-x-100' : ''}`}
           />
        ) : (
           <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500">
             No Camera
           </div>
        )}
      </div>
      
      {isLocal ? (
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-sm z-10">
          You
          {isMuted && <MicOff size={10} className="text-red-400" />}
        </div>
      ) : (
        <div className="px-2 py-1.5 text-center text-xs text-slate-300 font-medium truncate bg-slate-800 border-t border-slate-700 z-10 relative">
          {participant ? (participant.name || participant.identity) : 'Student'}
        </div>
      )}
    </div>
  );
});

export default ParticipantVideo;
