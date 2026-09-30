import React, { useState } from 'react';
import { Mic, MicOff, Pin, PinOff, Hand } from 'lucide-react';
import { VideoTrack, AudioTrack } from '@livekit/components-react';

export default function ParticipantTile({ participant, isHost, isPiP = false, isPinned = false, onTogglePin }) {
  if (!participant) return null;
  
  const [isHovered, setIsHovered] = useState(false);
  const { name, isMuted, isSpeaking, lkParticipant, isHandRaised } = participant;
  
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
      {lkParticipant && lkParticipant.isCameraEnabled ? (
        <VideoTrack
          participant={lkParticipant}
          source="camera"
          className={`w-full h-full object-cover transition-transform duration-300 ${!isPiP && isHovered ? 'scale-105' : ''} ${lkParticipant.isLocal ? '-scale-x-100' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-slate-300 shadow-inner">
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="mt-4 text-slate-400 font-medium tracking-wide">{name}</div>
        </div>
      )}

      {/* Pin Button overlay */}
      {!isPiP && onTogglePin && (
        <button 
          onClick={onTogglePin}
          className={`absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white transition-opacity duration-200 z-10 hover:bg-blue-500 ${isPinned || isHovered ? 'opacity-100' : 'opacity-0'}`}
          title={isPinned ? "Unpin" : "Pin"}
        >
          {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
        </button>
      )}
      
      {/* Hand Raised overlay */}
      {isHandRaised && (
        <div className="absolute top-3 left-3 p-1.5 rounded-full bg-yellow-500 text-white shadow-lg z-10 animate-pulse">
           <Hand size={16} />
        </div>
      )}

      {/* Overlay Details */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center space-x-2 max-w-[85%] border border-white/10">
          {isMuted ? (
            <MicOff size={14} className="text-red-400 shrink-0" />
          ) : (
            <Mic size={14} className="text-slate-300 shrink-0" />
          )}
          <span className="text-white text-sm font-medium truncate drop-shadow-md">
            {name} {isHost && <span className="ml-1 text-xs text-blue-300 uppercase tracking-wider font-bold">HOST</span>}
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
