import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { VideoTrack, AudioTrack } from '@livekit/components-react';

export default function ParticipantTile({ participant, isTeacher, isPiP = false }) {
  if (!participant) return null;
  
  const { name, isMuted, isSpeaking, lkParticipant } = participant;
  
  // Try to find the camera track if lkParticipant is provided
  const cameraTrack = lkParticipant?.getTrackPublication?.(
    "camera" // Track.Source.Camera is 1, but LiveKit stringifies it sometimes. @livekit/components-react handles this internally mostly, but we can do it manually or via hook.
  );
  
  // Using useTracks is better done at the parent level, but since lkParticipant is passed:
  // @livekit/components-react <VideoTrack> expects a track reference.
  
  // However, it's easier to just use standard LiveKit hooks if possible, but since we passed lkParticipant:
  // Let's use the standard component if we can. 
  // We can just render <VideoTrack participant={lkParticipant} source={Track.Source.Camera} /> 
  // Actually, @livekit/components-react VideoTrack takes `trackRef` in v2, or `participant` in v1. 
  // I will check the version or use standard HTML video if needed, but let's try standard way.
  
  return (
    <div 
      className={`
        relative overflow-hidden bg-slate-800 rounded-xl flex items-center justify-center
        border-2 transition-colors
        ${isSpeaking ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent shadow-md'}
        ${isPiP ? 'w-full h-full' : 'w-full h-full aspect-video'}
      `}
    >
      {/* Video or Placeholder */}
      {lkParticipant && lkParticipant.isCameraEnabled ? (
        <VideoTrack
          participant={lkParticipant}
          source="camera"
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-2xl font-bold text-slate-300 shadow-inner">
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      )}

      {/* Overlay Details */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center space-x-2 max-w-[85%]">
          {isMuted ? (
            <MicOff size={14} className="text-red-400 shrink-0" />
          ) : (
            <Mic size={14} className="text-slate-300 shrink-0" />
          )}
          <span className="text-white text-sm font-medium truncate drop-shadow-md">
            {name} {isTeacher && '(Host)'}
          </span>
        </div>
        
        {isSpeaking && (
          <div className="flex space-x-1 items-center bg-black/50 px-2 py-1.5 rounded-lg">
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
      </div>
    </div>
  );
}
