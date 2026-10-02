import React, { useState, useRef, useCallback, useEffect } from 'react';
import ParticipantGrid from './ParticipantGrid';
import ParticipantTile from './ParticipantTile';
import { MonitorUp, Maximize2, Minimize2 } from 'lucide-react';
import { VideoTrack, TrackRefContext } from '@livekit/components-react';

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
  currentUserId,
  isScreenSharing,
  screenShareTrack,
  cameraTrackRefs = [],
  participants = [],
  teacherIdentity,
  coHosts,
  pinnedIdentity,
  setPinnedIdentity,
  raisedHands = [],
  mutedParticipants = {},
  cameraDisabledParticipants = {},
  canModerate = false,
  onMuteParticipant,
  onAllowUnmute,
  onHostRequestUnmute,
  onRemoveParticipant,
  onDisableCamera,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef(null);

  // Sync fullscreen state with browser Fullscreen API events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await stageRef.current?.requestFullscreen();
      } catch (err) {
        console.warn('[Fullscreen] Error enabling fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('[Fullscreen] Error exiting fullscreen:', err);
      }
    }
  }, []);

  const handleTogglePin = (identity) => {
    setPinnedIdentity(prev => prev === identity ? null : identity);
  };

  const pinnedTrackRef = pinnedIdentity
    ? cameraTrackRefs.find(t => t.participant.identity === pinnedIdentity)
    : null;

  // Maximize button: always visible on mobile, hover-only on desktop
  const MaximizeButton = () => (
    <button
      onClick={toggleFullscreen}
      className="absolute bottom-3 right-3 z-30 p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white transition-all duration-200 backdrop-blur-sm border border-white/10 shadow-lg"
      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
  );

  // ── No screen share, no pinned → responsive grid ──────────────────────────
  if (!isScreenSharing && !pinnedTrackRef) {
    return (
      <div ref={stageRef} className="flex-1 w-full h-full relative group">
        <ParticipantGrid
          participants={participants}
          cameraTrackRefs={cameraTrackRefs}
          teacherIdentity={teacherIdentity}
          coHosts={coHosts}
          raisedHands={raisedHands}
          mutedParticipants={mutedParticipants}
          cameraDisabledParticipants={cameraDisabledParticipants}
          pinnedIdentity={pinnedIdentity}
          onTogglePin={handleTogglePin}
          canModerate={canModerate}
          onMuteParticipant={onMuteParticipant}
          onAllowUnmute={onAllowUnmute}
          onHostRequestUnmute={onHostRequestUnmute}
          onRemoveParticipant={onRemoveParticipant}
          onDisableCamera={onDisableCamera}
        />
        {/* Maximize: always visible on mobile and desktop */}
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-3 right-3 z-30 p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white transition-all duration-200 backdrop-blur-sm border border-white/10 shadow-lg"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    );
  }

  // ── Build main stage + strip ───────────────────────────────────────────────
  let mainStageNode = null;
  let stripParticipants = [];

  if (isScreenSharing) {
    const screenShareIdentity = screenShareTrack?.participant?.identity;
    stripParticipants = participants.filter(p => p.identity !== screenShareIdentity);
    mainStageNode = (
      <div className="absolute inset-0 bg-black flex items-center justify-center transition-all duration-300 ease-in-out">
        {screenShareTrack ? (
          <TrackRefContext.Provider value={screenShareTrack}>
            <VideoTrack
              className="w-full h-full object-contain"
            />
          </TrackRefContext.Provider>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <MonitorUp size={64} className="text-slate-500 mb-4 opacity-50 animate-pulse" />
            <p className="text-slate-400 font-medium text-lg">Presentation is active</p>
          </div>
        )}
      </div>
    );
  } else if (pinnedTrackRef) {
    stripParticipants = participants.filter(p => p.identity !== pinnedIdentity);
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
          canModerate={canModerate && pinnedIdentityStr !== teacherIdentity}
          onMuteClick={onMuteParticipant}
          onAllowUnmuteClick={onAllowUnmute}
          onHostRequestUnmuteClick={onHostRequestUnmute}
          onRemoveClick={onRemoveParticipant}
          onDisableCameraClick={onDisableCamera}
        />
      </div>
    );
  }

  // If fullscreen, hide the local user's own video tile from the strip
  if (isFullscreen && currentUserId) {
    stripParticipants = stripParticipants.filter(p => !p.identity.startsWith(currentUserId));
  }

  return (
    <div
      ref={stageRef}
      className={`flex-1 w-full h-full flex ${isScreenSharing && stripParticipants.length > 0 ? 'flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4' : 'flex-col space-y-4'} p-4 overflow-hidden transition-all duration-300 ease-in-out`}
    >
      {/* Main Stage — group for hover-show maximize button */}
      <div className={`relative group bg-black rounded-xl overflow-hidden shadow-lg min-h-0 flex items-center justify-center ring-1 ring-slate-800 transition-all duration-300 ${isScreenSharing && stripParticipants.length > 0 ? 'flex-1 h-2/3 md:h-full' : 'flex-1 h-full'}`}>
        {mainStageNode}
        <MaximizeButton />
      </div>

      {/* Participant Strip */}
      {stripParticipants.length > 0 && (
        <div className={`shrink-0 flex custom-scrollbar transition-all duration-300 ease-in-out ${isScreenSharing ? 'h-1/3 md:h-full md:w-64 lg:w-72 flex-row md:flex-col space-x-3 md:space-x-0 md:space-y-3 overflow-x-auto md:overflow-y-auto' : 'h-28 sm:h-36 w-full overflow-x-auto flex-row space-x-3 pb-2'}`}>
          {stripParticipants.map((participant) => {
            const identity = participant.identity;
            const trackRef = cameraTrackRefs.find(t => t.participant.identity === identity);
            return (
              <div
                key={identity}
                className={`shrink-0 transition-transform duration-300 ${isScreenSharing ? 'h-full md:h-auto md:w-full md:aspect-video aspect-video' : 'h-full aspect-video'}`}
              >
                <ParticipantTile
                  trackRef={trackRef}
                  participant={participant}
                  isHost={identity === teacherIdentity}
                  isPinned={false}
                  onTogglePin={() => handleTogglePin(identity)}
                  isHandRaised={raisedHands.includes(identity)}
                  isModerationMuted={!!mutedParticipants[identity]}
                  isModerationCameraDisabled={!!cameraDisabledParticipants[identity]}
                  canModerate={canModerate && identity !== teacherIdentity}
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
      )}
    </div>
  );
}
