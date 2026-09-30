import React, { useState } from 'react';
import { Mic, MicOff, Pin, PinOff, Hand, CameraOff } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';

/**
 * ParticipantTile — renders a single participant's video tile.
 *
 * Props:
 *   trackRef          — a LiveKit TrackReference from useTracks() [required for video]
 *   participant       — LiveKit Participant object (for metadata/state)
 *   isHost            — boolean
 *   isPiP             — boolean (use full-width style)
 *   isPinned          — boolean
 *   onTogglePin       — fn
 *   isHandRaised      — boolean
 *   isModerationMuted — boolean
 *   isModerationCameraDisabled — boolean
 */
export default function ParticipantTile({
  trackRef,
  participant,
  isHost = false,
  isPiP = false,
  isPinned = false,
  onTogglePin,
  isHandRaised = false,
  isModerationMuted = false,
  isModerationCameraDisabled = false,
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (!participant) return null;

  const name = participant.name || participant.identity || '?';
  const isMuted = !participant.isMicrophoneEnabled;
  const isSpeaking = participant.isSpeaking;
  const cameraEnabled = participant.isCameraEnabled;

  return (
    <div
      className={`
        relative overflow-hidden bg-slate-800 rounded-xl flex items-center justify-center
        transition-all duration-300 group
        ${isSpeaking ? 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'ring-1 ring-slate-700/50 shadow-md'}
        ${isPiP ? 'w-full h-full shadow-2xl ring-slate-600/50' : 'w-full h-full aspect-video'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video or Placeholder */}
      {cameraEnabled && trackRef ? (
        <VideoTrack
          trackRef={trackRef}
          className={`w-full h-full ${isPiP ? 'object-contain' : 'object-cover'} transition-transform duration-300 ${!isPiP && isHovered ? 'scale-105' : ''} ${participant.isLocal ? '-scale-x-100' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-slate-300 shadow-inner">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="mt-4 text-slate-400 font-medium tracking-wide">{name}</div>
        </div>
      )}

      {/* Pin Button */}
      {!isPiP && onTogglePin && (
        <button
          onClick={onTogglePin}
          className={`absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white transition-opacity duration-200 z-10 hover:bg-blue-500 ${isPinned || isHovered ? 'opacity-100' : 'opacity-0'}`}
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
        </button>
      )}

      {/* Hand Raised */}
      {isHandRaised && (
        <div className="absolute top-3 left-3 p-1.5 rounded-full bg-yellow-500 text-white shadow-lg z-10 animate-pulse">
          <Hand size={16} />
        </div>
      )}

      {/* Name / Mute Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center space-x-2 max-w-[85%] border border-white/10">
          {isModerationCameraDisabled && (
            <CameraOff size={14} className="text-red-500 shrink-0" title="Camera Disabled by Faculty" />
          )}
          {isMuted || isModerationMuted ? (
            <MicOff size={14} className={`${isModerationMuted ? 'text-red-500' : 'text-red-400'} shrink-0`} title={isModerationMuted ? 'Muted by Faculty' : 'Muted'} />
          ) : (
            <Mic size={14} className="text-slate-300 shrink-0" />
          )}
          <span className="text-white text-sm font-medium truncate drop-shadow-md">
            {name}{isHost && <span className="ml-1 text-xs text-blue-300 uppercase tracking-wider font-bold"> HOST</span>}
          </span>
        </div>

        {isSpeaking && (
          <div className="flex space-x-1 items-center bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
      </div>
    </div>
  );
}
