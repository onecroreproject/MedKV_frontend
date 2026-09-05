import React from 'react';
import { Mic, MicOff, Video, VideoOff, MonitorUp, Square, Circle, Hand, PhoneOff, MessageSquare } from 'lucide-react';

const ClassroomControls = React.memo(({ 
  isTeacher, 
  isMuted, 
  isVideoOff, 
  isScreenSharing, 
  isRecording, 
  isHandRaised,
  chatOpen,
  onToggleMute, 
  onToggleVideo, 
  onToggleScreenShare, 
  onToggleRecording, 
  onRaiseHand, 
  onLeaveRoom, 
  onToggleChat,
  unreadChatCount
}) => {
  return (
    <footer className="h-16 md:h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-2 md:px-8 z-20 shrink-0">
      
      {/* Left Side Info */}
      <div className="hidden sm:flex items-center gap-3 w-1/4"></div>

      {/* Center Controls */}
      <div className="flex flex-1 sm:flex-none justify-center items-center gap-2 md:gap-4">
        <button onClick={onToggleMute} className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'}`} title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <button onClick={onToggleVideo} className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'}`} title={isVideoOff ? "Start Video" : "Stop Video"}>
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>

        {isTeacher && (
          <button onClick={onToggleScreenShare} className={`p-4 rounded-full transition-all duration-300 shadow-lg border ${isScreenSharing ? 'bg-green-500 text-white border-green-400 shadow-green-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'}`} title="Share Screen">
            <MonitorUp size={22} />
          </button>
        )}

        {isTeacher && (
          <button onClick={onToggleRecording} className={`p-4 rounded-full transition-all duration-300 shadow-lg border ${isRecording ? 'bg-red-500 animate-pulse text-white border-red-400 shadow-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'}`} title={isRecording ? 'Stop Recording' : 'Start Recording'}>
            {isRecording ? <Square size={22} fill="white" /> : <Circle size={22} fill="white" />}
          </button>
        )}

        {!isTeacher && (
          <button onClick={onRaiseHand} className={`p-4 rounded-full transition-all duration-300 shadow-lg border ${isHandRaised ? 'bg-yellow-500 text-white border-yellow-400 shadow-yellow-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'}`} title={isHandRaised ? "Hand Raised!" : "Raise Hand"}>
            <Hand size={22} className={isHandRaised ? "animate-bounce" : ""} />
          </button>
        )}

        <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>

        <button onClick={onLeaveRoom} className="px-4 md:px-6 py-2.5 md:py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/20 font-bold flex items-center gap-2 text-sm tracking-wide sm:ml-4">
          <PhoneOff size={18} /> <span className="hidden sm:inline">{isTeacher ? 'End Class' : 'Leave'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex justify-end gap-3 sm:w-1/4">
        <button onClick={onToggleChat} className={`relative p-2.5 md:p-3.5 rounded-xl transition-all border ${chatOpen ? 'bg-accent/10 text-accent border-accent/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-slate-700'}`} title="Toggle Chat">
          <MessageSquare size={20} />
          {unreadChatCount > 0 && !chatOpen && (
             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                {unreadChatCount}
             </span>
          )}
        </button>
      </div>
    </footer>
  );
});

export default ClassroomControls;
