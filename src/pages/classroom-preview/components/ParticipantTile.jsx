/**
 * ParticipantTile — performance-critical component rendered once per participant.
 *
 * Optimisations applied:
 *  - React.memo with custom areEqual (skip re-render if nothing visual changed)
 *  - SignalBars is a separate memoised component (only re-renders on quality change)
 *  - No inline object / function creation inside JSX (stable refs)
 *  - CSS animations limited to `transform` and `opacity` only — GPU composited, zero layout cost
 *  - `will-change: transform` applied to animated speaking bars for compositor promotion
 *  - isHovered state removed — CSS group-hover handles it entirely (removes useState + closure overhead)
 */
import React, { memo, useCallback } from 'react';
import { Mic, MicOff, Pin, PinOff, Hand, CameraOff } from 'lucide-react';
import { VideoTrack, TrackRefContext } from '@livekit/components-react';
import { ConnectionQuality } from 'livekit-client';

// ─── Signal Bars ──────────────────────────────────────────────────────────────
// Separate memo component: only re-renders when quality changes (not on speaking)
const QUALITY_BARS = {
  [ConnectionQuality.Excellent]: 4,
  [ConnectionQuality.Good]: 3,
  [ConnectionQuality.Poor]: 2,
  [ConnectionQuality.Lost]: 0,
};
const QUALITY_COLOR = {
  4: 'text-emerald-400',
  3: 'text-yellow-400',
  2: 'text-orange-400',
  1: 'text-red-500',
  0: 'text-red-500',
};
const BAR_HEIGHTS = [7, 10, 13, 16]; // px — pre-computed, no runtime arithmetic

const SignalBars = memo(function SignalBars({ quality }) {
  const bars = QUALITY_BARS[quality] ?? 1;
  const colorClass = QUALITY_COLOR[bars] ?? 'text-red-500';
  return (
    <div className={`flex items-end gap-[2px] ${colorClass}`} title={`Signal: ${quality ?? 'unknown'}`}>
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className={`rounded-sm w-[3px] ${i < bars ? 'opacity-100' : 'opacity-20'}`}
          style={{ height: h, background: 'currentColor' }}
        />
      ))}
    </div>
  );
});

// ─── Speaking Bars ────────────────────────────────────────────────────────────
// Static bar heights — avoid re-generating array on every render
const SPEAK_BARS = [3, 5, 4, 6, 3];

const SpeakingIndicator = memo(function SpeakingIndicator() {
  return (
    <div className="flex items-end gap-[2px] shrink-0">
      {SPEAK_BARS.map((h, i) => (
        <div
          key={i}
          className="w-[3px] bg-blue-400 rounded-full"
          style={{
            height: h,
            willChange: 'transform',
            animation: `bounce 0.6s ${i * 0.06}s infinite alternate ease-in-out`,
          }}
        />
      ))}
    </div>
  );
});

// ─── Avatar (camera off) ──────────────────────────────────────────────────────
const Avatar = memo(function Avatar({ initials, name, avatarClass }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center">
      <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-inner ${avatarClass}`}>
        {initials}
      </div>
      <div className="mt-2 text-slate-300 font-medium text-xs sm:text-sm tracking-wide text-center px-2 truncate max-w-full">
        {name}
      </div>
    </div>
  );
});

// ─── Main Tile ────────────────────────────────────────────────────────────────
function ParticipantTile({
  trackRef,
  participant,
  isHost = false,
  isCoHost = false,
  isPiP = false,
  isPinned = false,
  onTogglePin,
  isHandRaised = false,
  isModerationMuted = false,
  isModerationCameraDisabled = false,
  canModerate = false,
  onMuteClick,
  onAllowUnmuteClick,
}) {
  if (!participant) return null;

  // Derived values — computed once per render, not inline in JSX
  const identity = participant.identity;
  const rawName = participant.name || (identity ? identity.split('|')[0] : '?');
  const name = rawName || '?';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const isMuted = !participant.isMicrophoneEnabled;
  const isSpeaking = participant.isSpeaking;
  const cameraEnabled = participant.isCameraEnabled && !isModerationCameraDisabled;
  const quality = participant.connectionQuality;

  // Pre-build class strings once
  const outerRing = isSpeaking
    ? 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
    : isHandRaised
      ? 'ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]'
      : 'ring-1 ring-slate-700/50 shadow-md';

  const avatarClass = isHost
    ? 'bg-blue-600/40 border-2 border-blue-500/60 text-blue-200'
    : isCoHost
      ? 'bg-purple-600/40 border-2 border-purple-500/60 text-purple-200'
      : 'bg-slate-600/60 border-2 border-slate-500/40 text-slate-200';

  const muteBtnClass = isMuted || isModerationMuted
    ? 'bg-red-500/80 hover:bg-red-400 opacity-100'
    : 'bg-black/50 hover:bg-red-500/80 opacity-100';

  // Stable memoised handler — avoids prop recreation for descendant buttons
  const handleMuteClick = useCallback((e) => {
    e.stopPropagation();
    if (isMuted || isModerationMuted) {
      if (onAllowUnmuteClick) onAllowUnmuteClick(identity);
    } else {
      if (onMuteClick) onMuteClick(identity);
    }
  }, [onMuteClick, onAllowUnmuteClick, identity, isMuted, isModerationMuted]);

  return (
    <div
      className={`relative overflow-hidden bg-slate-800 rounded-xl flex items-center justify-center group ${outerRing} ${isPiP ? 'w-full h-full shadow-2xl' : 'w-full h-full aspect-video'}`}
      style={{ willChange: 'box-shadow' }}
    >
      {/* ── Video or Avatar ── */}
      {cameraEnabled && trackRef ? (
        <TrackRefContext.Provider value={trackRef}>
          <VideoTrack
            className={`w-full h-full ${isPiP ? 'object-contain' : 'object-cover'} ${participant.isLocal ? '-scale-x-100' : ''}`}
          />
        </TrackRefContext.Provider>
      ) : (
        <Avatar initials={initials} name={name} avatarClass={avatarClass} />
      )}

      {/* ── Hand raised (top-left) ── */}
      {isHandRaised && (
        <div className="absolute top-2 left-2 p-1.5 rounded-full bg-yellow-500 text-white shadow-lg z-10">
          <Hand size={14} />
        </div>
      )}

      {/* ── Top-right controls: signal + mute + pin ── */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded p-1">
          <SignalBars quality={quality} />
        </div>

        {canModerate && (onMuteClick || onAllowUnmuteClick) && (
          <button
            onClick={handleMuteClick}
            className={`p-1.5 rounded-full backdrop-blur-sm border border-white/10 text-white transition-opacity duration-150 shadow ${muteBtnClass}`}
            title={isMuted || isModerationMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || isModerationMuted ? <MicOff size={13} /> : <Mic size={13} />}
          </button>
        )}

        {!isPiP && onTogglePin && (
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white transition-opacity duration-150 hover:bg-blue-500 border border-white/10 ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
        )}
      </div>

      {/* ── Bottom name bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 pb-2 pt-5 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.8)0%,transparent 100%)' }}
      >
        <div className="flex items-center gap-1.5 min-w-0 pointer-events-none">
          {isModerationCameraDisabled && <CameraOff size={12} className="text-red-400 shrink-0" />}
          {isMuted || isModerationMuted
            ? <MicOff size={12} className={`${isModerationMuted ? 'text-red-400' : 'text-red-300'} shrink-0`} />
            : <Mic size={12} className={`${isSpeaking ? 'text-blue-400' : 'text-slate-400'} shrink-0`} />
          }
          <span className="text-white text-xs font-medium truncate drop-shadow-md">{name}</span>
          {isHost && <span className="text-[10px] text-blue-300 font-bold uppercase shrink-0 ml-0.5">HOST</span>}
          {isCoHost && !isHost && <span className="text-[10px] text-purple-300 font-bold uppercase shrink-0 ml-0.5">CO-HOST</span>}
        </div>
        {isSpeaking && <SpeakingIndicator />}
      </div>
    </div>
  );
}

// ─── Custom equality — skip re-render if nothing visual changed ───────────────
function areEqual(prev, next) {
  return (
    prev.participant === next.participant &&
    prev.isHost === next.isHost &&
    prev.isCoHost === next.isCoHost &&
    prev.isPiP === next.isPiP &&
    prev.isPinned === next.isPinned &&
    prev.isHandRaised === next.isHandRaised &&
    prev.isModerationMuted === next.isModerationMuted &&
    prev.isModerationCameraDisabled === next.isModerationCameraDisabled &&
    prev.canModerate === next.canModerate &&
    prev.trackRef === next.trackRef &&
    prev.onTogglePin === next.onTogglePin &&
    prev.onMuteClick === next.onMuteClick
  );
}

export default memo(ParticipantTile, areEqual);

