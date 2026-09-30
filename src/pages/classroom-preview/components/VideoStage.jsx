import React from 'react';
import ParticipantGrid from './ParticipantGrid';
import ParticipantTile from './ParticipantTile';
import { MonitorUp } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';

/**
 * VideoStage
 *
 * Props:
 *   isScreenSharing           — boolean
 *   screenShareTrack          — TrackReference | undefined
 *   cameraTrackRefs           — TrackReference[] (all camera tracks from useTracks)
 *   teacherIdentity           — string
 *   pinnedIdentity            — string | null
 *   setPinnedIdentity         — fn
 *   raisedHands               — string[]
 *   mutedParticipants         — { [identity]: true }
 *   cameraDisabledParticipants — { [identity]: true }
 */
export default function VideoStage({
  isScreenSharing,
  screenShareTrack,
  cameraTrackRefs = [],
  teacherIdentity,
  pinnedIdentity,
  setPinnedIdentity,
  raisedHands = [],
  mutedParticipants = {},
  cameraDisabledParticipants = {},
}) {
  const handleTogglePin = (identity) => {
    setPinnedIdentity(prev => prev === identity ? null : identity);
  };

  const pinnedTrackRef = pinnedIdentity
    ? cameraTrackRefs.find(t => t.participant.identity === pinnedIdentity)
    : null;

  // ── No screen share, no pinned → responsive grid ──────────────────────────
  if (!isScreenSharing && !pinnedTrackRef) {
    return (
      <ParticipantGrid
        cameraTrackRefs={cameraTrackRefs}
        teacherIdentity={teacherIdentity}
        raisedHands={raisedHands}
        mutedParticipants={mutedParticipants}
        cameraDisabledParticipants={cameraDisabledParticipants}
        pinnedIdentity={pinnedIdentity}
        onTogglePin={handleTogglePin}
      />
    );
  }

  // ── Build main stage + strip ───────────────────────────────────────────────
  let mainStageNode = null;
  let stripTrackRefs = [];

  if (isScreenSharing) {
    stripTrackRefs = cameraTrackRefs;
    mainStageNode = (
      <div className="absolute inset-0 bg-black flex items-center justify-center transition-all duration-300 ease-in-out">
        {screenShareTrack ? (
          <VideoTrack
            trackRef={screenShareTrack}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <MonitorUp size={64} className="text-slate-500 mb-4 opacity-50 animate-pulse" />
            <p className="text-slate-400 font-medium text-lg">Presentation is active</p>
          </div>
        )}
      </div>
    );
  } else if (pinnedTrackRef) {
    stripTrackRefs = cameraTrackRefs.filter(t => t.participant.identity !== pinnedIdentity);
    const pinnedIdentityStr = pinnedTrackRef.participant.identity;
    mainStageNode = (
      <div className="absolute inset-0 flex transition-all duration-300 ease-in-out bg-slate-900 rounded-xl overflow-hidden">
        <ParticipantTile
          trackRef={pinnedTrackRef}
          participant={pinnedTrackRef.participant}
          isHost={pinnedIdentityStr === teacherIdentity}
          isPinned={true}
          onTogglePin={() => handleTogglePin(pinnedIdentityStr)}
          isPiP={true}
          isHandRaised={raisedHands.includes(pinnedIdentityStr)}
          isModerationMuted={!!mutedParticipants[pinnedIdentityStr]}
          isModerationCameraDisabled={!!cameraDisabledParticipants[pinnedIdentityStr]}
        />
      </div>
    );
  }

  return (
    <div className={`flex-1 w-full h-full flex ${isScreenSharing ? 'flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4' : 'flex-col space-y-4'} p-4 overflow-hidden transition-all duration-300 ease-in-out`}>
      {/* Main Stage */}
      <div className={`relative bg-black rounded-xl overflow-hidden shadow-lg min-h-0 flex items-center justify-center ring-1 ring-slate-800 transition-all duration-300 ${isScreenSharing ? 'flex-1 h-2/3 md:h-full' : 'flex-1'}`}>
        {mainStageNode}
      </div>

      {/* Participant Strip */}
      {stripTrackRefs.length > 0 && (
        <div className={`shrink-0 flex custom-scrollbar transition-all duration-300 ease-in-out ${isScreenSharing ? 'h-1/3 md:h-full md:w-64 lg:w-72 flex-row md:flex-col space-x-3 md:space-x-0 md:space-y-3 overflow-x-auto md:overflow-y-auto' : 'h-28 sm:h-36 w-full overflow-x-auto flex-row space-x-3 pb-2'}`}>
          {stripTrackRefs.map((trackRef) => {
            const identity = trackRef.participant.identity;
            return (
              <div
                key={`${identity}-${trackRef.source}`}
                className={`shrink-0 transition-transform duration-300 ${isScreenSharing ? 'h-full md:h-auto md:w-full md:aspect-video aspect-video' : 'h-full aspect-video'}`}
              >
                <ParticipantTile
                  trackRef={trackRef}
                  participant={trackRef.participant}
                  isHost={identity === teacherIdentity}
                  isPinned={false}
                  onTogglePin={() => handleTogglePin(identity)}
                  isHandRaised={raisedHands.includes(identity)}
                  isModerationMuted={!!mutedParticipants[identity]}
                  isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
