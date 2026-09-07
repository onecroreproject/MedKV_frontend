import React from 'react';
import { MicOff } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';

const ParticipantVideo = React.memo(({ participant, isLocal, trackRef }) => {
  const isMuted = !participant?.isMicrophoneEnabled;
  const displayName = participant ? (participant.name || participant.identity) : 'Student';

  // ── Local (student self-view PIP) ──────────────────────────────────
  if (isLocal) {
    return (
      <div className="w-full h-full bg-black relative">
        {trackRef ? (
          <VideoTrack
            trackRef={trackRef}
            className="w-full h-full absolute inset-0 object-cover -scale-x-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
            No Camera
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-sm z-10">
          You
          {isMuted && <MicOff size={10} className="text-red-400" />}
        </div>
      </div>
    );
  }

  // ── Remote participant tile ────────────────────────────────────────
  return (
    <div className="w-full h-full relative bg-slate-900 flex flex-col">
      {/* Video fills top portion */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {trackRef ? (
          <VideoTrack
            trackRef={trackRef}
            className="w-full h-full absolute inset-0 object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-[11px]">
            No Camera
          </div>
        )}
        {/* Mic status badge */}
        {isMuted && (
          <div className="absolute top-1.5 right-1.5 bg-red-600/80 rounded-full p-1 z-10">
            <MicOff size={10} className="text-white" />
          </div>
        )}
      </div>
      {/* Name label pinned at bottom */}
      <div className="shrink-0 px-2 py-1 text-center text-[11px] text-slate-300 font-medium truncate bg-slate-800 border-t border-slate-700">
        {displayName}
      </div>
    </div>
  );
});

export default ParticipantVideo;

