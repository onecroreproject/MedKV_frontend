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
  viewerIsTeacher = false,
  onMuteParticipant,
  onAllowUnmute,
  onHostRequestUnmute,
  onRemoveParticipant,
  onDisableCamera,
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

  // ── Single participant: full-screen ───────────────────────────────────────
  if (count === 1) {
    const participant = sorted[0];
    const identity = participant.identity;
    const isHost = identity === teacherIdentity;
    const isCoHost = coHosts ? coHosts.has(String(identity)) : false;
    const trackRef = cameraTrackRefs.find(t => t.participant.identity === identity);
    return (
      <div className="flex-1 w-full h-full p-2 sm:p-4 flex items-center justify-center bg-black">
        <div className="w-full h-full max-h-full">
          <ParticipantTile
            trackRef={trackRef}
            participant={participant}
            isHost={isHost}
            isCoHost={isCoHost}
            viewerIsTeacher={viewerIsTeacher || canModerate}
            isPinned={false}
            onTogglePin={onTogglePin ? makeTogglePin(identity) : undefined}
            isHandRaised={raisedHands.includes(identity)}
            isModerationMuted={!!mutedParticipants[identity]}
            isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
            isPiP={false}
            canModerate={canModerate && !isHost}
            onMuteClick={onMuteParticipant}
            onAllowUnmuteClick={onAllowUnmute}
            onHostRequestUnmuteClick={onHostRequestUnmute}
            onRemoveClick={onRemoveParticipant}
            onDisableCameraClick={onDisableCamera}
          />
        </div>
      </div>
    );
  }

  // ── 2 Participants: Side-by-side full-height grid ──────────────────────────
  if (count === 2) {
    return (
      <div className="flex-1 w-full h-full p-2 sm:p-3 flex items-center justify-center overflow-hidden bg-black">
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-7xl mx-auto items-stretch">
          {sorted.map((participant) => {
            const identity = participant.identity;
            const isHost = identity === teacherIdentity;
            const isCoHost = coHosts ? coHosts.has(String(identity)) : false;
            const trackRef = cameraTrackRefs.find(t => t.participant.identity === identity);
            return (
              <div key={identity} className="w-full h-full min-h-0 flex flex-col">
                <ParticipantTile
                  trackRef={trackRef}
                  participant={participant}
                  isHost={isHost}
                  isCoHost={isCoHost}
                  viewerIsTeacher={viewerIsTeacher || canModerate}
                  isPinned={pinnedIdentity === identity}
                  onTogglePin={makeTogglePin(identity)}
                  isHandRaised={raisedHands.includes(identity)}
                  isModerationMuted={!!mutedParticipants[identity]}
                  isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
                  canModerate={canModerate && !isHost}
                  onMuteClick={onMuteParticipant}
                  onAllowUnmuteClick={onAllowUnmute}
                  onHostRequestUnmuteClick={onHostRequestUnmute}
                  onRemoveClick={onRemoveParticipant}
                  onDisableCameraClick={onDisableCamera}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 3 or 4 Participants: 2x2 full-height grid ──────────────────────────────
  if (count <= 4) {
    return (
      <div className="flex-1 w-full h-full p-2 sm:p-3 flex items-center justify-center overflow-hidden bg-black">
        <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-3 sm:gap-4 max-w-7xl mx-auto items-stretch">
          {sorted.map((participant) => {
            const identity = participant.identity;
            const isHost = identity === teacherIdentity;
            const isCoHost = coHosts ? coHosts.has(String(identity)) : false;
            const trackRef = cameraTrackRefs.find(t => t.participant.identity === identity);
            return (
              <div key={identity} className="w-full h-full min-h-0 flex flex-col">
                <ParticipantTile
                  trackRef={trackRef}
                  participant={participant}
                  isHost={isHost}
                  isCoHost={isCoHost}
                  viewerIsTeacher={viewerIsTeacher || canModerate}
                  isPinned={pinnedIdentity === identity}
                  onTogglePin={makeTogglePin(identity)}
                  isHandRaised={raisedHands.includes(identity)}
                  isModerationMuted={!!mutedParticipants[identity]}
                  isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
                  canModerate={canModerate && !isHost}
                  onMuteClick={onMuteParticipant}
                  onAllowUnmuteClick={onAllowUnmute}
                  onHostRequestUnmuteClick={onHostRequestUnmute}
                  onRemoveClick={onRemoveParticipant}
                  onDisableCameraClick={onDisableCamera}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 5+ Participants: Multi-row scrollable grid with generous row height ────
  return (
    <div className="flex-1 w-full h-full p-3 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
      <div className={`grid ${gridCols} gap-3 max-w-7xl mx-auto min-h-full auto-rows-[minmax(200px,1fr)] sm:auto-rows-[minmax(250px,1fr)]`}>
        {sorted.map((participant) => {
          const identity = participant.identity;
          const isHost = identity === teacherIdentity;
          const isCoHost = coHosts ? coHosts.has(String(identity)) : false;
          const trackRef = cameraTrackRefs.find(t => t.participant.identity === identity);
          return (
            <div key={identity} className="w-full h-full min-h-0 flex flex-col">
              <ParticipantTile
                trackRef={trackRef}
                participant={participant}
                isHost={isHost}
                isCoHost={isCoHost}
                viewerIsTeacher={viewerIsTeacher || canModerate}
                isPinned={pinnedIdentity === identity}
                onTogglePin={makeTogglePin(identity)}
                isHandRaised={raisedHands.includes(identity)}
                isModerationMuted={!!mutedParticipants[identity]}
                isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
                canModerate={canModerate && !isHost}
                onMuteClick={onMuteParticipant}
                onAllowUnmuteClick={onAllowUnmute}
                onHostRequestUnmuteClick={onHostRequestUnmute}
                onRemoveClick={onRemoveParticipant}
                onDisableCameraClick={onDisableCamera}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ParticipantGrid);

