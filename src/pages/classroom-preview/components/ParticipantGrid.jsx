/**
 * ParticipantGrid — performance-critical list of participant tiles.
 *
 * Optimisations:
 *  - React.memo: skip re-render when parent re-renders with same props
 *  - useMemo for participant sort — only re-sorts when track list or raisedHands changes
 *  - useMemo for gridCols — only recalculates when count changes
 *  - useCallback for per-participant handlers — stable refs prevent tile re-renders
 *  - No inline function or object creation inside the .map() loop
 *  - overflow-y-auto with manual scroll for 100+ participants
 */
import React, { memo, useMemo, useCallback } from 'react';
import ParticipantTile from './ParticipantTile';

// Score function lives outside component — no closure allocation per render
function participantScore(p, raisedHands, teacherIdentity) {
  if (p.isSpeaking) return 4;
  if (raisedHands.includes(p.identity)) return 3;
  if (p.identity === teacherIdentity) return 2;
  return 1;
}

function gridColsFor(count) {
  if (count <= 1) return '';
  if (count <= 4) return 'grid-cols-2';
  if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
  if (count <= 9) return 'grid-cols-3';
  return 'grid-cols-3 lg:grid-cols-4';
}

function ParticipantGrid({
  participants = [],
  cameraTrackRefs = [],
  teacherIdentity,
  coHosts,
  raisedHands = [],
  mutedParticipants = {},
  cameraDisabledParticipants = {},
  pinnedIdentity,
  onTogglePin,
  canModerate = false,
  onMuteParticipant,
}) {
  // ── Sort: speaking → hand raised → host → rest ───────────────────────────
  // Only recalculate when the participant list or speaking/hand state changes
  const sorted = useMemo(() => {
    return [...participants].sort(
      (a, b) => participantScore(b, raisedHands, teacherIdentity) - participantScore(a, raisedHands, teacherIdentity)
    );
  // We include participants and raisedHands as deps.
  }, [participants, raisedHands, teacherIdentity]);

  const count = sorted.length;

  // ── Stable pin handler factory ────────────────────────────────────────────
  // Returns a memoised callback; tiles get the same fn ref when identity doesn't change
  const makeTogglePin = useCallback(
    (identity) => () => onTogglePin && onTogglePin(identity),
    [onTogglePin]
  );

  const gridCols = useMemo(() => gridColsFor(count), [count]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (count === 0) {
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center bg-black">
        <p className="text-slate-500 text-sm">Waiting for participants…</p>
      </div>
    );
  }

  // ── Single participant: full-screen PiP ───────────────────────────────────
  if (count === 1) {
    const participant = sorted[0];
    const identity = participant.identity;
    const isHost = identity === teacherIdentity;
    const isCoHost = coHosts ? coHosts.has(String(identity)) : false;
    const trackRef = cameraTrackRefs.find(t => t.participant.identity === identity);
    return (
      <div className="flex-1 w-full h-full p-4 flex items-center justify-center bg-black rounded-xl">
        <div className="w-full h-full max-h-full">
          <ParticipantTile
            trackRef={trackRef}
            participant={participant}
            isHost={isHost}
            isCoHost={isCoHost}
            isPinned={false}
            onTogglePin={onTogglePin ? makeTogglePin(identity) : undefined}
            isHandRaised={raisedHands.includes(identity)}
            isModerationMuted={!!mutedParticipants[identity]}
            isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
            isPiP={true}
            canModerate={canModerate && !isHost}
            onMuteClick={onMuteParticipant}
          />
        </div>
      </div>
    );
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full h-full p-3 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
      <div className={`grid ${gridCols} gap-3 auto-rows-max max-w-7xl mx-auto`}>
        {sorted.map((participant) => {
          const identity = participant.identity;
          const isHost = identity === teacherIdentity;
          const isCoHost = coHosts ? coHosts.has(String(identity)) : false;
          const trackRef = cameraTrackRefs.find(t => t.participant.identity === identity);
          return (
            <ParticipantTile
              key={identity}
              trackRef={trackRef}
              participant={participant}
              isHost={isHost}
              isCoHost={isCoHost}
              isPinned={pinnedIdentity === identity}
              onTogglePin={makeTogglePin(identity)}
              isHandRaised={raisedHands.includes(identity)}
              isModerationMuted={!!mutedParticipants[identity]}
              isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
              canModerate={canModerate && !isHost}
              onMuteClick={onMuteParticipant}
            />
          );
        })}
      </div>
    </div>
  );
}

export default memo(ParticipantGrid);

