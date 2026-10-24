import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, 
  MonitorUp, PhoneOff, Users, Hand, 
  MessageSquare, Play, Pause, Square, 
  ExternalLink, X, Volume2 
} from 'lucide-react';
import darkLogo from '../../../assets/dark_logo_transparent.png';

/**
 * Helper to extract clean name from participant or ID
 */
function getParticipantName(userIdOrIdentity, participants = []) {
  if (!userIdOrIdentity) return 'Student';
  const match = participants.find(p => {
    if (p.identity === userIdOrIdentity || p.identity?.includes(userIdOrIdentity)) return true;
    if (p.name && (p.name === userIdOrIdentity || userIdOrIdentity.includes(p.name))) return true;
    try {
      const meta = p.metadata ? JSON.parse(p.metadata) : {};
      if (meta.userId === userIdOrIdentity || meta._id === userIdOrIdentity) return true;
    } catch {}
    return false;
  });

  if (match) {
    return match.name || match.identity.split('|')[0];
  }
  return userIdOrIdentity.split('|')[0] || 'Student';
}

/**
 * TeacherPipContent
 *
 * Floating Google Meet style Document Picture-in-Picture window:
 * - Active speaker grid: If a student/participant speaks, shows their live video or speaking avatar tile
 * - Standby: Clean Academy Logo grid with Dr. Sam Reefath Radiology Academy branding (no infinite mirror)
 * - Who raised hand alert: Shows student name who raised hand with quick lower button
 * - Who sent message: Instant pop-up notification when someone posts a chat message
 * - Google Meet menu: Mic, Cam, Screen Share, Recording, End Class, and Return to Tab
 */
export default function TeacherPipContent({
  user,
  title = 'Live Lecture',
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
  participants = [],
  raisedHands = [],
  onClearHand,
  chatMessages = [],
  onFocusMainTab,
  onClosePip,
  localCameraTrack,
}) {
  const speakerVideoRef = useRef(null);
  const teacherMiniCamRef = useRef(null);

  // ── 1. ACTIVE REMOTE SPEAKER DETECTION ─────────────────────────────────────
  // Find any remote participant who is currently speaking
  const activeSpeaker = useMemo(() => {
    if (!participants || participants.length === 0) return null;
    return participants.find(p => !p.isLocal && p.isSpeaking) || null;
  }, [participants]);

  // Video track for the active speaker (if their camera is enabled)
  const activeSpeakerVideoTrack = useMemo(() => {
    if (!activeSpeaker || !activeSpeaker.isCameraEnabled) return null;
    try {
      const pub = typeof activeSpeaker.getTrackPublication === 'function'
        ? activeSpeaker.getTrackPublication('camera')
        : null;
      return pub?.track?.mediaStreamTrack || pub?.mediaStreamTrack || null;
    } catch {
      return null;
    }
  }, [activeSpeaker]);

  // Attach active speaker video stream
  useEffect(() => {
    if (!speakerVideoRef.current) return;
    if (activeSpeakerVideoTrack) {
      speakerVideoRef.current.srcObject = new MediaStream([activeSpeakerVideoTrack]);
      speakerVideoRef.current.play().catch(() => {});
    } else {
      speakerVideoRef.current.srcObject = null;
    }
  }, [activeSpeakerVideoTrack]);

  // Attach teacher mini-cam video stream (if camera is on)
  useEffect(() => {
    if (!teacherMiniCamRef.current) return;
    const teacherMediaTrack = localCameraTrack?.publication?.track?.mediaStreamTrack
      || localCameraTrack?.track?.mediaStreamTrack;

    if (teacherMediaTrack && !isVideoOff) {
      teacherMiniCamRef.current.srcObject = new MediaStream([teacherMediaTrack]);
      teacherMiniCamRef.current.play().catch(() => {});
    } else {
      teacherMiniCamRef.current.srcObject = null;
    }
  }, [localCameraTrack, isVideoOff]);

  // ── 2. WHO RAISED HAND ─────────────────────────────────────────────────────
  const raisedStudentNames = useMemo(() => {
    if (!raisedHands || raisedHands.length === 0) return [];
    return raisedHands.map(id => getParticipantName(id, participants));
  }, [raisedHands, participants]);

  // ── 3. WHO SENT MESSAGE (Chat Toast Popup) ──────────────────────────────────
  const [latestChatPopup, setLatestChatPopup] = useState(null);
  const prevChatCount = useRef(chatMessages?.length || 0);

  useEffect(() => {
    const currentCount = chatMessages?.length || 0;
    if (currentCount > prevChatCount.current) {
      const latest = chatMessages[currentCount - 1];
      // Only pop up if it's from another participant (not self)
      const currentUserId = user?._id || user?.id;
      if (latest && latest.userId !== currentUserId) {
        setLatestChatPopup({
          id: latest.id || Date.now(),
          name: latest.name || 'Student',
          message: latest.message || latest.text || '',
          timestamp: Date.now()
        });
      }
    }
    prevChatCount.current = currentCount;
  }, [chatMessages, user]);

  // Auto-dismiss chat popup after 8 seconds
  useEffect(() => {
    if (!latestChatPopup) return;
    const timer = setTimeout(() => {
      setLatestChatPopup(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [latestChatPopup]);

  const teacherName = user?.name || 'Faculty';

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0f19] text-slate-100 select-none overflow-hidden font-sans relative">
      
      {/* ── TOP HEADER (Google Meet Style) ────────────────────────────── */}
      <div className="h-10 px-3 bg-[#131b2e]/95 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs z-20">
        
        {/* Left: Faculty Status & Main Tab Switcher */}
        <div 
          onClick={onFocusMainTab} 
          className="flex items-center space-x-2 cursor-pointer hover:text-blue-300 transition-colors truncate max-w-[190px]"
          title="Click to bring full class tab to front"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-semibold text-slate-200 truncate">
            {isScreenSharing ? `${teacherName} (Presenting)` : teacherName}
          </span>
        </div>

        {/* Right: Badges & Window Actions */}
        <div className="flex items-center space-x-1.5 shrink-0">
          
          {/* Raised hands count pill */}
          {raisedHands.length > 0 && (
            <div 
              className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse"
              title={`${raisedStudentNames.join(', ')} raised hand`}
            >
              <Hand size={11} />
              <span>{raisedHands.length}</span>
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
            title="Bring live class to front"
            aria-label="Bring live class to front"
          >
            <ExternalLink size={13} />
          </button>

          {/* Close PiP */}
          <button
            onClick={onClosePip}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Picture-in-Picture"
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── WHO RAISED HAND ALERT BANNER ──────────────────────────────── */}
      {raisedHands.length > 0 && (
        <div className="absolute top-11 left-2 right-2 z-30 bg-amber-500/95 text-slate-950 px-2.5 py-1.5 rounded-lg shadow-lg border border-amber-400/50 flex items-center justify-between animate-bounce-subtle">
          <div className="flex items-center space-x-1.5 min-w-0 pr-1">
            <span className="text-sm shrink-0">✋</span>
            <div className="text-[11px] font-bold truncate">
              {raisedStudentNames.length === 1
                ? `${raisedStudentNames[0]} raised hand`
                : `${raisedStudentNames[0]} +${raisedStudentNames.length - 1} others raised hand`}
            </div>
          </div>
          {onClearHand && (
            <button 
              onClick={() => onClearHand(raisedHands[0])}
              className="text-[10px] bg-slate-950/20 hover:bg-slate-950/30 px-2 py-0.5 rounded font-bold text-slate-950 shrink-0 transition-colors"
              title="Lower hand"
            >
              Lower
            </button>
          )}
        </div>
      )}

      {/* ── INCOMING CHAT MESSAGE POPUP ───────────────────────────────── */}
      {latestChatPopup && (
        <div className="absolute bottom-16 left-2 right-2 z-30 bg-slate-900/95 border border-blue-500/60 text-white p-2.5 rounded-lg shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
            <div className="flex items-center space-x-1.5 min-w-0">
              <MessageSquare size={12} className="text-blue-400 shrink-0" />
              <span className="text-[11px] font-bold text-blue-300 truncate">
                {latestChatPopup.name}
              </span>
              <span className="text-[9px] text-slate-400">new question</span>
            </div>
            <button 
              onClick={() => setLatestChatPopup(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X size={12} />
            </button>
          </div>
          <div className="text-[11px] text-slate-200 line-clamp-2 break-words leading-snug">
            {latestChatPopup.message}
          </div>
        </div>
      )}

      {/* ── MAIN STAGE: ACTIVE SPEAKER OR EMPTY LOGO GRID ─────────────── */}
      <div className="flex-1 relative bg-[#070b14] flex items-center justify-center overflow-hidden min-h-0">
        
        {/* CASE A: Active Remote Speaker is Talking */}
        {activeSpeaker ? (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            {activeSpeakerVideoTrack ? (
              /* Speaker Camera Video */
              <video 
                ref={speakerVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              /* Speaker Avatar + Speaking Ring */
              <div className="flex flex-col items-center justify-center p-4">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-emerald-500 animate-pulse">
                    {(activeSpeaker.name || activeSpeaker.identity || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                    <Mic size={12} />
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-100 max-w-[200px] truncate">
                  {activeSpeaker.name || activeSpeaker.identity.split('|')[0]}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Speaking...</span>
                </div>
              </div>
            )}

            {/* Speaking Name Tag in bottom-left */}
            <div className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-semibold text-white flex items-center space-x-1.5 border border-emerald-500/40">
              <Volume2 size={11} className="text-emerald-400 animate-pulse" />
              <span className="truncate max-w-[140px]">
                {activeSpeaker.name || activeSpeaker.identity.split('|')[0]}
              </span>
            </div>
          </div>
        ) : (
          /* CASE B: Empty Logo Grid (Standby / Faculty Presenting) */
          <div className="flex flex-col items-center justify-center text-center p-4 select-none">
            
            {/* Academy Logo with subtle glowing aura */}
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-700/60 p-2 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <img 
                  src={darkLogo} 
                  alt="Academy Logo" 
                  className="w-full h-full object-contain filter drop-shadow" 
                />
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-blue-500/30 animate-pulse pointer-events-none"></div>
            </div>

            <div className="text-xs font-bold text-slate-100 tracking-wide max-w-[260px] truncate">
              Dr. Sam Reefath Radiology Academy
            </div>
            
            <div className="text-[10px] text-blue-400 font-medium mt-1 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Class Active</span>
            </div>

            {isScreenSharing && (
              <div className="mt-2 text-[10px] text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow-sm">
                <MonitorUp size={11} className="text-blue-400" />
                <span>You are presenting your screen</span>
              </div>
            )}
          </div>
        )}

        {/* Mini Faculty Camera in corner when camera is enabled */}
        {!isVideoOff && (
          <div className="absolute bottom-2 right-2 w-20 aspect-video rounded-lg overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 z-10">
            <video 
              ref={teacherMiniCamRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0.5 left-1 text-[8px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
              You
            </div>
          </div>
        )}

        {/* Recording active badge */}
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <div className={`absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center space-x-1 shadow-md ${
            recordingState === 'recording' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span>{recordingState === 'recording' ? 'REC' : 'PAUSED'}</span>
          </div>
        )}
      </div>

      {/* ── BOTTOM CONTROL MENU (Google Meet Style Buttons) ────────────── */}
      <div className="h-14 px-3 bg-[#0d1322] border-t border-slate-800 flex items-center justify-center space-x-2.5 shrink-0 z-20">
        
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

        {/* Focus Main Tab Button */}
        <button
          onClick={onFocusMainTab}
          className="p-2.5 rounded-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-100 transition-all"
          title="Open Live Class Tab"
          aria-label="Open Live Class Tab"
        >
          <ExternalLink size={15} />
        </button>

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
