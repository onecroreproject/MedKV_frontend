import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, 
  MonitorUp, PhoneOff, Users, Hand, 
  MessageSquare, Play, Pause, Square, 
  ExternalLink, X, Volume2 
} from 'lucide-react';
import darkLogo from '../../../assets/dark_logo_transparent.png';

/**
 * Checks if a string is a 24-character hexadecimal MongoDB ObjectId
 */
function isMongoObjectId(str) {
  return typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str.trim());
}

/**
 * Resolves a human-readable participant name from LiveKit participants,
 * chat messages, or waiting room students.
 * NEVER displays raw hex database IDs like '6adce58e5f3cc5f583382afb'.
 */
function resolveParticipantName(userIdOrIdentity, participants = [], chatMessages = [], waitingStudents = []) {
  if (!userIdOrIdentity) return 'Student';
  const rawId = String(userIdOrIdentity).trim();

  // 1. Search in LiveKit participants
  if (Array.isArray(participants)) {
    const pMatch = participants.find(p => {
      if (!p) return false;
      if (p.identity === rawId || p.identity?.startsWith(rawId + '|') || p.identity?.endsWith('|' + rawId)) return true;
      if (p.name && p.name === rawId) return true;
      try {
        const meta = p.metadata ? JSON.parse(p.metadata) : {};
        if (meta.userId === rawId || meta._id === rawId || meta.id === rawId) return true;
      } catch {}
      return false;
    });

    if (pMatch && pMatch.name && !isMongoObjectId(pMatch.name)) {
      return pMatch.name;
    }
  }

  // 2. Search in chat messages history
  if (Array.isArray(chatMessages)) {
    const chatMatch = [...chatMessages].reverse().find(m => m && (m.userId === rawId || m.id === rawId));
    if (chatMatch && chatMatch.name && !isMongoObjectId(chatMatch.name)) {
      return chatMatch.name;
    }
  }

  // 3. Search in waitingStudents list
  if (Array.isArray(waitingStudents)) {
    const waitMatch = waitingStudents.find(s => s && (s.userId === rawId || s._id === rawId || s.id === rawId));
    if (waitMatch && waitMatch.name && !isMongoObjectId(waitMatch.name)) {
      return waitMatch.name;
    }
  }

  // 4. If formatted as "userId|Name" or "Name|userId"
  if (rawId.includes('|')) {
    const parts = rawId.split('|');
    const humanName = parts.find(part => part && !isMongoObjectId(part));
    if (humanName) return humanName;
  }

  // 5. If rawId itself is NOT an ObjectId, it's already a clean name
  if (!isMongoObjectId(rawId)) {
    return rawId;
  }

  // 6. Safe human fallback — never show raw database hex to faculty
  return 'Student';
}

/**
 * TeacherPipContent
 *
 * Floating Google Meet style Document Picture-in-Picture window:
 * - Active speaker grid: If a student/participant speaks, shows their live video or speaking avatar tile
 * - Standby: Clean Academy Logo grid with Dr. Sam Reefath Radiology Academy branding (no infinite mirror)
 * - Who raised hand alert: Clean banner in normal flow below header showing student's real name
 * - Who sent message: Instant pop-up notification when someone posts a chat message
 * - Google Meet bottom menu: Fixed at the very bottom with comfortable round buttons and gaps
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
  waitingStudents = [],
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

  // ── 2. WHO RAISED HAND (RESOLVED NAMES) ────────────────────────────────────
  const raisedStudentNames = useMemo(() => {
    if (!raisedHands || raisedHands.length === 0) return [];
    return raisedHands.map(id => resolveParticipantName(id, participants, chatMessages, waitingStudents));
  }, [raisedHands, participants, chatMessages, waitingStudents]);

  // ── 3. WHO SENT MESSAGE (Chat Toast Popup) ──────────────────────────────────
  const [latestChatPopup, setLatestChatPopup] = useState(null);
  const prevChatCount = useRef(chatMessages?.length || 0);

  useEffect(() => {
    const currentCount = chatMessages?.length || 0;
    if (currentCount > prevChatCount.current) {
      const latest = chatMessages[currentCount - 1];
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

  // Standard round control button style
  const getBtnStyle = (bg, hoverBg) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bg,
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s ease',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  });

  return (
    <div 
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      
      {/* ── 1. TOP HEADER (Google Meet Style) ────────────────────────── */}
      <div 
        style={{
          height: '40px',
          padding: '0 12px',
          backgroundColor: '#111827',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          fontSize: '12px',
          zIndex: 20
        }}
      >
        {/* Left: Status & Main Tab Switcher */}
        <div 
          onClick={onFocusMainTab} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title="Click to bring full class tab to front"
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }}></span>
          <span style={{ fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isScreenSharing ? `${teacherName} (Presenting)` : teacherName}
          </span>
        </div>

        {/* Right: Badges & Window Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          
          {/* Raised hands count badge */}
          {raisedHands.length > 0 && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '2px 6px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 700
              }}
              title={`${raisedStudentNames.join(', ')} raised hand`}
            >
              <Hand size={11} />
              <span>{raisedHands.length}</span>
            </div>
          )}

          {/* Participant count */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#1f2937',
              color: '#cbd5e1',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 500,
              border: '1px solid #374151'
            }}
          >
            <Users size={11} style={{ color: '#60a5fa' }} />
            <span>{participantCount}</span>
          </div>

          {/* Focus Tab Button */}
          <button
            onClick={onFocusMainTab}
            style={{
              padding: '4px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Bring live class to front"
            aria-label="Bring live class to front"
          >
            <ExternalLink size={13} />
          </button>

          {/* Close PiP */}
          <button
            onClick={onClosePip}
            style={{
              padding: '4px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close Picture-in-Picture"
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── 2. WHO RAISED HAND ALERT BANNER (IN-FLOW: NEVER COVERS LOGO) ── */}
      {raisedHands.length > 0 && (
        <div 
          style={{
            flexShrink: 0,
            margin: '6px 8px 0 8px',
            padding: '6px 10px',
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'bounce-subtle 1.8s ease-in-out infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>✋</span>
            <div style={{ fontSize: '11px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {raisedStudentNames.length === 1
                ? `${raisedStudentNames[0]} raised hand`
                : `${raisedStudentNames[0]} +${raisedStudentNames.length - 1} others raised hand`}
            </div>
          </div>
          {onClearHand && (
            <button 
              onClick={() => onClearHand(raisedHands[0])}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: 'rgba(15, 23, 42, 0.25)',
                color: '#0f172a',
                padding: '2px 8px',
                borderRadius: '4px',
                flexShrink: 0,
                marginLeft: '6px'
              }}
              title="Lower hand"
            >
              Lower
            </button>
          )}
        </div>
      )}

      {/* ── 3. INCOMING CHAT MESSAGE POPUP ───────────────────────────── */}
      {latestChatPopup && (
        <div 
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '8px',
            right: '8px',
            zIndex: 30,
            backgroundColor: 'rgba(17, 24, 39, 0.97)',
            border: '1px solid #3b82f6',
            color: '#ffffff',
            padding: '8px 10px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <MessageSquare size={12} style={{ color: '#60a5fa', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#93c5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {latestChatPopup.name}
              </span>
              <span style={{ fontSize: '9px', color: '#9ca3af' }}>question</span>
            </div>
            <button 
              onClick={() => setLatestChatPopup(null)}
              style={{ color: '#9ca3af', backgroundColor: 'transparent', padding: '2px' }}
            >
              <X size={12} />
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: '1.3', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {latestChatPopup.message}
          </div>
        </div>
      )}

      {/* ── 4. MAIN STAGE: ACTIVE SPEAKER OR EMPTY LOGO GRID (FLEX: 1) ─ */}
      <div 
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#070b14'
        }}
      >
        
        {/* CASE A: Active Remote Speaker is Talking */}
        {activeSpeaker ? (
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
            {activeSpeakerVideoTrack ? (
              /* Speaker Camera Video */
              <video 
                ref={speakerVideoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              /* Speaker Avatar + Speaking Ring */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <div 
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '20px',
                      boxShadow: '0 0 0 4px #10b981',
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    {(activeSpeaker.name || activeSpeaker.identity || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      padding: '4px',
                      borderRadius: '50%',
                      display: 'flex'
                    }}
                  >
                    <Mic size={11} />
                  </div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {resolveParticipantName(activeSpeaker.identity, participants, chatMessages, waitingStudents)}
                </div>
                <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }}></span>
                  <span>Speaking...</span>
                </div>
              </div>
            )}

            {/* Speaking Name Tag in bottom-left */}
            <div 
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.75)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}
            >
              <Volume2 size={11} style={{ color: '#34d399' }} />
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {resolveParticipantName(activeSpeaker.identity, participants, chatMessages, waitingStudents)}
              </span>
            </div>
          </div>
        ) : (
          /* CASE B: Empty Logo Grid (Standby / Faculty Presenting) */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px' }}>
            
            {/* Academy Logo */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  border: '1px solid rgba(55, 65, 81, 0.8)',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                }}
              >
                <img 
                  src={darkLogo} 
                  alt="Academy Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.01em', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Dr. Sam Reefath Radiology Academy
            </div>
            
            <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>Live Class Active</span>
            </div>

            {isScreenSharing && (
              <div 
                style={{
                  marginTop: '10px',
                  fontSize: '10px',
                  color: '#cbd5e1',
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: '1px solid #374151',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MonitorUp size={11} style={{ color: '#60a5fa' }} />
                <span>You are presenting your screen</span>
              </div>
            )}
          </div>
        )}

        {/* Mini Faculty Camera in corner when camera is enabled */}
        {!isVideoOff && (
          <div 
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '80px',
              aspectRatio: '16/9',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #374151',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              backgroundColor: '#0f172a',
              zIndex: 10
            }}
          >
            <video 
              ref={teacherMiniCamRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '8px', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,1)' }}>
              You
            </div>
          </div>
        )}

        {/* Recording active badge */}
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <div 
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              zIndex: 20,
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '9px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              backgroundColor: recordingState === 'recording' ? '#dc2626' : '#d97706',
              color: '#ffffff'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }}></span>
            <span>{recordingState === 'recording' ? 'REC' : 'PAUSED'}</span>
          </div>
        )}
      </div>

      {/* ── 5. BOTTOM CONTROL MENU (PINNED AT VERY BOTTOM WITH 10px GAP) ── */}
      <div 
        style={{
          height: '58px',
          padding: '0 12px',
          backgroundColor: '#0b0f19',
          borderTop: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flexShrink: 0,
          zIndex: 20
        }}
      >
        
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          style={getBtnStyle(isMuted ? '#ef4444' : '#334155')}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          style={getBtnStyle(isVideoOff ? '#ef4444' : '#334155')}
          title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
          aria-label={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
        >
          {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          style={getBtnStyle(isScreenSharing ? '#2563eb' : '#334155')}
          title={isScreenSharing ? "Stop Presenting Screen" : "Present Screen"}
          aria-label={isScreenSharing ? "Stop Presenting" : "Present Screen"}
        >
          <MonitorUp size={16} />
        </button>

        {/* Recording Pause / Resume Button (when recording) */}
        {recordingState === 'recording' && (
          <button
            onClick={onPauseRecording}
            style={getBtnStyle('#f59e0b')}
            title="Pause Recording"
            aria-label="Pause Recording"
          >
            <Pause size={16} />
          </button>
        )}

        {recordingState === 'paused' && (
          <button
            onClick={onResumeRecording}
            style={getBtnStyle('#10b981')}
            title="Resume Recording"
            aria-label="Resume Recording"
          >
            <Play size={16} />
          </button>
        )}

        {/* Focus Main Tab Button */}
        <button
          onClick={onFocusMainTab}
          style={getBtnStyle('#334155')}
          title="Open Full Class Tab"
          aria-label="Open Full Class Tab"
        >
          <ExternalLink size={16} />
        </button>

        {/* End / Leave Class Button */}
        <button
          onClick={onEndClass || onLeave}
          style={getBtnStyle('#dc2626')}
          title="End Call / Leave"
          aria-label="End Call"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
}
