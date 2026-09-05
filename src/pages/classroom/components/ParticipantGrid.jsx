import React from 'react';
import ParticipantVideo from './ParticipantVideo';
import { Track } from 'livekit-client';

const ParticipantGrid = React.memo(({ isTeacher, tracks, localParticipant }) => {
  // Students only see themselves in the PIP corner
  // Teachers see all students in a horizontal scroll
  
  const cameraTracks = tracks.filter(t => t.source === Track.Source.Camera);
  const otherTracks = cameraTracks.filter(t => !t.participant.isLocal);

  return (
    <div className={!isTeacher ? "absolute bottom-4 right-4 md:bottom-8 md:right-8 w-24 md:w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl z-20 group" : "flex gap-2 mt-4 overflow-x-auto pb-2 h-36"}>
      
      {/* Self View PIP (For student) */}
      {!isTeacher && localParticipant && (
         <ParticipantVideo 
           participant={localParticipant} 
           isLocal={true} 
           trackRef={cameraTracks.find(t => t.participant.isLocal)} 
         />
      )}

      {/* Grid View (For Teacher) */}
      {isTeacher && otherTracks.map(track => (
        <ParticipantVideo 
          key={track.participant.identity}
          participant={track.participant}
          isLocal={false}
          trackRef={track}
        />
      ))}
    </div>
  );
});

export default ParticipantGrid;
