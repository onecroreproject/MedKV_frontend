/**
 * ClassroomControls — performance-critical control bar.
 * Optimizations:
 * - IconButton moved outside and memoized to prevent recreation on every render.
 * - Removed expensive console.log in the hot render path.
 * - Handlers are passed directly or memoized.
 */
import React, { memo } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, 
  MonitorUp, Hand, MessageSquare, 
  Users, MoreVertical, PhoneOff, Smile, Play, Square, Pause, Loader2
} from 'lucide-react';

const ALLOWED_REACTIONS = ['❤️', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔', '👎'];

// Memoized Icon Button to prevent re-rendering on every parent render
const IconButton = memo(function IconButton({ active, icon: Icon, label, danger, onClick, disabled, pulse }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group p-2.5 sm:p-3 rounded-full flex items-center justify-center transition-all
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
      <Icon size={18} />
      {/* Tooltip — hidden on mobile to save space */}
      <div className="absolute bottom-full mb-2 hidden sm:group-hover:block whitespace-nowrap bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded shadow-lg border border-slate-700 pointer-events-none z-50">
        {label}
      </div>
    </button>
  );
});

function ClassroomControls({
  isMuted, setIsMuted,
  isVideoOff, setIsVideoOff,
  isScreenSharing, setIsScreenSharing,
  isChatOpen, setIsChatOpen,
  isPeopleOpen, setIsPeopleOpen,
  isHandRaised, setIsHandRaised,
  userRole,
  effectiveRole,
  onLeave,
  onReaction,
  unreadCount = 0,
  recordingState,
  onToggleRecording,
  onEndClass,
  waitingStudentsCount = 0,
  raisedHandsCount = 0
}) {
  const isTeacherOrCoHost = effectiveRole === 'teacher' || effectiveRole === 'cohost' || userRole === 'teacher';

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-2 sm:p-4 pb-4 sm:pb-4 safe-area-bottom w-full flex-shrink-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center relative gap-1 sm:gap-4 h-full">
        
        <IconButton 
          active={isMuted} 
          danger={isMuted}
          icon={isMuted ? MicOff : Mic} 
          label={isMuted ? "Unmute" : "Mute"} 
          onClick={() => setIsMuted(!isMuted)} 
        />
        
        <IconButton 
          active={isVideoOff} 
          danger={isVideoOff}
          icon={isVideoOff ? VideoOff : Video} 
          label={isVideoOff ? "Turn on camera" : "Turn off camera"} 
          onClick={() => setIsVideoOff(!isVideoOff)} 
        />
        
        {isTeacherOrCoHost && (
          <IconButton 
            active={isScreenSharing} 
            icon={MonitorUp} 
            label={isScreenSharing ? "Stop presenting" : "Present now"} 
            onClick={() => setIsScreenSharing(!isScreenSharing)} 
          />
        )}

        {isTeacherOrCoHost && (
          <>
            <div className="w-px h-8 bg-slate-700 mx-1 md:mx-2 hidden sm:block"></div>
            <IconButton 
              active={recordingState === 'recording'} 
              danger={recordingState === 'recording' || recordingState === 'paused' || recordingState === 'stopping'}
              icon={
                recordingState === 'stopping' ? Loader2 :
                recordingState === 'recording' ? Square : 
                recordingState === 'paused' ? Play : Play
              } 
              label={
                recordingState === 'stopping' ? "Stopping recording..." :
                recordingState === 'recording' ? "Stop recording" : 
                recordingState === 'paused' ? "Resume recording" : "Start recording"
              } 
              onClick={onToggleRecording}
              disabled={recordingState === 'stopping'}
              pulse={recordingState === 'stopping'}
            />
          </>
        )}
        
        <div className="w-px h-8 bg-slate-700 mx-1 md:mx-2 hidden sm:block"></div>
        
        {/* Reactions */}
        <div className="relative group/reaction flex items-center justify-center">
          <button
            className="p-2.5 sm:p-3 rounded-full flex items-center justify-center transition-all bg-slate-700 hover:bg-slate-600 text-slate-200"
            aria-label="Reactions"
            title="Reactions"
          >
            <Smile size={18} />
          </button>
          
          <div className="absolute bottom-full mb-2 hidden group-hover/reaction:flex bg-slate-800 p-2 rounded-xl shadow-xl border border-slate-700 gap-1 sm:gap-2 z-50">
            {ALLOWED_REACTIONS.map(reaction => (
              <button
                key={reaction}
                onClick={() => onReaction(reaction)}
                className="w-8 h-8 sm:w-10 sm:h-10 text-lg sm:text-xl flex items-center justify-center hover:bg-slate-700 rounded-lg transition-transform hover:scale-110"
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>

        <IconButton 
          active={isHandRaised} 
          icon={Hand} 
          label={isHandRaised ? "Lower hand" : "Raise hand"} 
          onClick={() => setIsHandRaised(!isHandRaised)} 
        />

        <div className="relative">
          <IconButton 
            active={isPeopleOpen} 
            icon={Users} 
            label="People" 
            onClick={() => setIsPeopleOpen(!isPeopleOpen)} 
          />
          {(waitingStudentsCount > 0 || raisedHandsCount > 0) && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center gap-0.5">
              {waitingStudentsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                  {waitingStudentsCount} NEW
                </span>
              )}
              {raisedHandsCount > 0 && (
                <span className="bg-yellow-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                  {raisedHandsCount}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="relative">
          <IconButton 
            active={isChatOpen} 
            icon={MessageSquare} 
            label="Chat" 
            onClick={() => setIsChatOpen(!isChatOpen)} 
          />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <div className="w-px h-8 bg-slate-700 mx-1 md:mx-2 hidden sm:block"></div>
        
        <IconButton 
          danger 
          icon={PhoneOff} 
          label="Leave call" 
          onClick={onLeave} 
        />

        {userRole === 'teacher' && (
          <div className="absolute right-0 hidden sm:block">
            <button
              onClick={onEndClass}
              className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-xs sm:text-sm shadow-lg shadow-red-600/20 whitespace-nowrap"
            >
              End Class
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ClassroomControls);

