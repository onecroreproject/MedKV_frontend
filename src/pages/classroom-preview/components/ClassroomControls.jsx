import React from 'react';
import { 
  Mic, MicOff, Video, VideoOff, 
  MonitorUp, Hand, MessageSquare, 
  Users, MoreVertical, PhoneOff, Smile 
} from 'lucide-react';

const ALLOWED_REACTIONS = ['❤️', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔', '👎'];

export default function ClassroomControls({
  isMuted, setIsMuted,
  isVideoOff, setIsVideoOff,
  isScreenSharing, setIsScreenSharing,
  isChatOpen, setIsChatOpen,
  isPeopleOpen, setIsPeopleOpen,
  isHandRaised, setIsHandRaised,
  userRole,
  onLeave,
  onReaction
}) {
  
  const IconButton = ({ active, icon: Icon, label, danger, onClick, disabled, pulse }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group p-3 rounded-full flex items-center justify-center transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : 
          danger ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' :
          active ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 
          'bg-slate-700 hover:bg-slate-600 text-slate-200'
        }
        ${pulse ? 'animate-pulse' : ''}
      `}
      aria-label={label}
      title={label}
    >
      <Icon size={20} />
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded shadow-lg border border-slate-700 pointer-events-none">
        {label}
      </div>
    </button>
  );

  return (
    <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center px-6 z-20">
      <div className="flex items-center space-x-3 md:space-x-4">
        
        <IconButton 
          active={!isMuted} 
          icon={isMuted ? MicOff : Mic} 
          label={isMuted ? "Unmute" : "Mute"} 
          onClick={() => setIsMuted(!isMuted)} 
        />
        
        <IconButton 
          active={!isVideoOff} 
          icon={isVideoOff ? VideoOff : Video} 
          label={isVideoOff ? "Turn on camera" : "Turn off camera"} 
          onClick={() => setIsVideoOff(!isVideoOff)} 
        />
        
        <IconButton 
          active={isScreenSharing} 
          icon={MonitorUp} 
          label={isScreenSharing ? "Stop presenting" : "Present now"} 
          onClick={() => setIsScreenSharing(!isScreenSharing)} 
          disabled={userRole !== 'teacher'} 
        />
        
        <div className="w-px h-8 bg-slate-700 mx-1 md:mx-2"></div>
        
        {/* Real-time Reactions */}
        <div className="relative group/reaction flex items-center justify-center">
          <button
            className="p-3 rounded-full flex items-center justify-center transition-all bg-slate-700 hover:bg-slate-600 text-slate-200"
            aria-label="Reactions"
            title="Reactions"
          >
            <Smile size={20} />
          </button>
          
          <div className="absolute bottom-full mb-2 hidden group-hover/reaction:flex bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-700 space-x-1 z-50">
            {ALLOWED_REACTIONS.map(emoji => (
              <button 
                key={emoji}
                className="text-xl hover:scale-125 hover:bg-slate-700 p-2 rounded transition-transform"
                onClick={() => onReaction && onReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        
        {/* Raise Hand — pulses orange when raised */}
        <IconButton 
          active={isHandRaised} 
          icon={Hand} 
          label={isHandRaised ? "Lower hand" : "Raise hand"} 
          onClick={() => setIsHandRaised(!isHandRaised)}
          pulse={isHandRaised}
        />
        
        <IconButton 
          active={isChatOpen} 
          icon={MessageSquare} 
          label="Chat" 
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            if (!isChatOpen) setIsPeopleOpen(false);
          }} 
        />
        
        <IconButton 
          active={isPeopleOpen} 
          icon={Users} 
          label="People" 
          onClick={() => {
            setIsPeopleOpen(!isPeopleOpen);
            if (!isPeopleOpen) setIsChatOpen(false);
          }} 
        />
        
        <IconButton 
          active={false} 
          icon={MoreVertical} 
          label="More options" 
          onClick={() => {}} 
        />
        
        <div className="w-px h-8 bg-slate-700 mx-1 md:mx-2"></div>
        
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-red-500/20"
          onClick={onLeave}
        >
          <PhoneOff size={20} />
          <span className="hidden sm:inline">Leave</span>
        </button>

      </div>
    </div>
  );
}
