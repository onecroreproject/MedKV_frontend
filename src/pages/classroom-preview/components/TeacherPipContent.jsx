import React, { useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, 
  MonitorUp, PhoneOff, Users, Hand, 
  Play, Pause, Square, ExternalLink, X 
} from 'lucide-react';

/**
 * TeacherPipContent
 *
 * Renders an interactive, floating Google Meet-style Picture-in-Picture window.
 * Shows active presentation / slides, mini camera overlay, participant count,
 * raised hand alerts, and complete real-time meeting controls (Mic, Camera, ScreenShare, End Call).
 */
export default function TeacherPipContent({
  user,
  title = 'Live Class',
  isMuted,
  onToggleMic,
  isVideoOff,
  onToggleCamera,
  isScreenSharing,
  onToggleScreenShare,
  recordingState,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onEndClass,
  onLeave,
  participantCount = 0,
  raisedHandsCount = 0,
  onFocusMainTab,
  onClosePip,
  screenShareTrack,
  localCameraTrack,
}) {
  const screenVideoRef = useRef(null);
  const miniCamVideoRef = useRef(null);
  const singleCamVideoRef = useRef(null);

  // Play Screen Share stream
  useEffect(() => {
    if (!screenVideoRef.current) return;
    const mediaStreamTrack = screenShareTrack?.publication?.track?.mediaStreamTrack 
      || screenShareTrack?.track?.mediaStreamTrack;

    if (mediaStreamTrack) {
      screenVideoRef.current.srcObject = new MediaStream([mediaStreamTrack]);
      screenVideoRef.current.play().catch(() => {});
    } else {
      screenVideoRef.current.srcObject = null;
    }
  }, [screenShareTrack]);

  // Play Mini Camera stream (PiP in bottom-right corner when presenting)
  useEffect(() => {
    if (!miniCamVideoRef.current) return;
    const mediaStreamTrack = localCameraTrack?.publication?.track?.mediaStreamTrack
      || localCameraTrack?.track?.mediaStreamTrack;

    if (mediaStreamTrack && !isVideoOff && isScreenSharing) {
      miniCamVideoRef.current.srcObject = new MediaStream([mediaStreamTrack]);
      miniCamVideoRef.current.play().catch(() => {});
    } else {
      miniCamVideoRef.current.srcObject = null;
    }
  }, [localCameraTrack, isVideoOff, isScreenSharing]);

  // Play Full Camera stream when not screen sharing
  useEffect(() => {
    if (!singleCamVideoRef.current) return;
    const mediaStreamTrack = localCameraTrack?.publication?.track?.mediaStreamTrack
      || localCameraTrack?.track?.mediaStreamTrack;

    if (mediaStreamTrack && !isVideoOff && !isScreenSharing) {
      singleCamVideoRef.current.srcObject = new MediaStream([mediaStreamTrack]);
      singleCamVideoRef.current.play().catch(() => {});
    } else {
      singleCamVideoRef.current.srcObject = null;
    }
  }, [localCameraTrack, isVideoOff, isScreenSharing]);

  const teacherName = user?.name || 'Faculty';

  return (
    <div className="w-full h-full flex flex-col bg-[#111827] text-slate-100 select-none overflow-hidden font-sans">
      
      {/* ── TOP BAR (Google Meet Style Header) ────────────────────────── */}
      <div className="h-10 px-3 bg-[#1e293b]/90 border-b border-slate-700/60 flex items-center justify-between shrink-0 text-xs">
        
        {/* Left: Status & Identity */}
        <div 
          onClick={onFocusMainTab} 
          className="flex items-center space-x-2 cursor-pointer hover:text-blue-300 transition-colors truncate max-w-[190px]"
          title="Click to bring live class tab to front"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-semibold text-slate-200 truncate">
            {isScreenSharing ? `${teacherName} (You, presenting)` : teacherName}
          </span>
        </div>

        {/* Right: Badges & Actions */}
        <div className="flex items-center space-x-1.5 shrink-0">
          
          {/* Raised hands alert badge */}
          {raisedHandsCount > 0 && (
            <div className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
              <Hand size={11} />
              <span>{raisedHandsCount}</span>
            </div>
          )}

          {/* Participant count */}
          <div className="flex items-center space-x-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-700">
            <Users size={11} className="text-blue-400" />
            <span>{participantCount}</span>
          </div>

          {/* Focus Tab Button */}
          <button
            onClick={onFocusMainTab}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Focus Main Tab"
            aria-label="Focus Main Tab"
          >
            <ExternalLink size={13} />
          </button>

          {/* Close PiP */}
          <button
            onClick={onClosePip}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Picture-in-Picture"
            aria-label="Close Picture-in-Picture"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── VIDEO DISPLAY AREA ───────────────────────────────────────── */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden min-h-0">
        
        {isScreenSharing ? (
          /* Screen share presentation view */
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video 
              ref={screenVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-contain"
            />

            {/* Mini PiP camera tile in bottom right corner (Google Meet style) */}
            {!isVideoOff && (
              <div className="absolute bottom-2 right-2 w-24 aspect-video rounded-lg overflow-hidden border border-blue-500/80 shadow-2xl bg-slate-900 z-10">
                <video 
                  ref={miniCamVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0.5 left-1 text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                  You
                </div>
              </div>
            )}
          </div>
        ) : !isVideoOff ? (
          /* Full camera view */
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video 
              ref={singleCamVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          /* Camera Off Standby View */
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-base mb-2">
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-medium text-slate-300">{teacherName}</p>
            <p className="text-[10px] text-slate-500">Camera is turned off</p>
          </div>
        )}

        {/* Recording active badge in video area */}
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <div className={`absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1.5 shadow-md ${
            recordingState === 'recording' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span>{recordingState === 'recording' ? 'REC' : 'PAUSED'}</span>
          </div>
        )}
      </div>

      {/* ── BOTTOM CONTROL BAR (Google Meet Style Buttons) ────────────── */}
      <div className="h-14 px-3 bg-[#0f172a] border-t border-slate-800 flex items-center justify-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20' 
              : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
          }`}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
            isVideoOff 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20' 
              : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
          }`}
          title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
          aria-label={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
        >
          {isVideoOff ? <VideoOff size={15} /> : <Video size={15} />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30' 
              : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
          }`}
          title={isScreenSharing ? "Stop Presenting Screen" : "Present Screen"}
          aria-label={isScreenSharing ? "Stop Presenting" : "Present Screen"}
        >
          <MonitorUp size={15} />
        </button>

        {/* Recording Pause / Resume Button (when recording) */}
        {recordingState === 'recording' && (
          <button
            onClick={onPauseRecording}
            className="p-2.5 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md shadow-amber-500/20"
            title="Pause Recording"
            aria-label="Pause Recording"
          >
            <Pause size={15} />
          </button>
        )}

        {recordingState === 'paused' && (
          <button
            onClick={onResumeRecording}
            className="p-2.5 rounded-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20 animate-pulse"
            title="Resume Recording"
            aria-label="Resume Recording"
          >
            <Play size={15} />
          </button>
        )}

        {/* End / Leave Class Button */}
        <button
          onClick={onEndClass || onLeave}
          className="p-2.5 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-600/30"
          title="End Call / Leave"
          aria-label="End Call"
        >
          <PhoneOff size={15} />
        </button>
      </div>
    </div>
  );
}
