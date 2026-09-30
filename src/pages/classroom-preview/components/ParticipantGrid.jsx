import React from 'react';
import ParticipantTile from './ParticipantTile';

/**
 * ParticipantGrid
 *
 * Props:
 *   cameraTrackRefs  — TrackReference[] from useTracks([Track.Source.Camera])
 *   teacherIdentity  — string (identity of the teacher participant)
 *   raisedHands      — string[] of participant identities
 *   mutedParticipants           — { [identity]: true }
 *   cameraDisabledParticipants  — { [identity]: true }
 *   pinnedIdentity   — string | null
 *   onTogglePin      — fn(identity)
 */
export default function ParticipantGrid({
  cameraTrackRefs = [],
  teacherIdentity,
  raisedHands = [],
  mutedParticipants = {},
  cameraDisabledParticipants = {},
  pinnedIdentity,
  onTogglePin,
}) {
  const count = cameraTrackRefs.length;

  if (count === 1) {
    const trackRef = cameraTrackRefs[0];
    const identity = trackRef.participant.identity;
    const isHost = identity === teacherIdentity;
    return (
      <div className="flex-1 w-full h-full p-4 overflow-hidden flex items-center justify-center bg-black rounded-xl">
        <div className="w-full h-full max-h-full">
          <ParticipantTile
            trackRef={trackRef}
            participant={trackRef.participant}
            isHost={isHost}
            isPinned={false}
            onTogglePin={onTogglePin ? () => onTogglePin(identity) : undefined}
            isHandRaised={raisedHands.includes(identity)}
            isModerationMuted={!!mutedParticipants[identity]}
            isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
            isPiP={true}
          />
        </div>
      </div>
    );
  }

  let gridCols = 'grid-cols-2';
  if (count >= 3 && count <= 4) gridCols = 'grid-cols-2 lg:grid-cols-2';
  else if (count >= 5 && count <= 6) gridCols = 'grid-cols-2 lg:grid-cols-3';
  else if (count >= 7 && count <= 9) gridCols = 'grid-cols-3 lg:grid-cols-3';
  else if (count > 9) gridCols = 'grid-cols-3 lg:grid-cols-4';

  return (
    <div className="flex-1 w-full h-full p-4 overflow-y-auto custom-scrollbar transition-all duration-300">
      <div className={`grid ${gridCols} gap-4 auto-rows-max items-center justify-center max-w-7xl mx-auto h-full transition-all duration-300`}>
        {cameraTrackRefs.map((trackRef) => {
          const identity = trackRef.participant.identity;
          const isHost = identity === teacherIdentity;
          return (
            <div key={`${identity}-${trackRef.source}`} className="w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-[1.02]">
              <ParticipantTile
                trackRef={trackRef}
                participant={trackRef.participant}
                isHost={isHost}
                isPinned={pinnedIdentity === identity}
                onTogglePin={() => onTogglePin && onTogglePin(identity)}
                isHandRaised={raisedHands.includes(identity)}
                isModerationMuted={!!mutedParticipants[identity]}
                isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
