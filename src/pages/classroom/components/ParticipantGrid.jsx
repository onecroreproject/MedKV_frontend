import React from 'react';
import ParticipantVideo from './ParticipantVideo';
import { MicOff } from 'lucide-react';

const ParticipantGrid = React.memo(({ isTeacher, remoteStreams, participants, stream, isMuted }) => {
  return (
    <div className={!isTeacher ? "absolute bottom-4 right-4 md:bottom-8 md:right-8 w-24 md:w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl z-20 group" : "flex gap-2 mt-4 overflow-x-auto pb-2 h-36"}>
      {!isTeacher && stream && (
        <ParticipantVideo stream={stream} isLocal={true} isMuted={isMuted} />
      )}

      {isTeacher && Object.keys(remoteStreams).map(socketId => {
        const participant = participants.find(p => p.id === socketId);
        return (
          <ParticipantVideo 
            key={socketId}
            stream={remoteStreams[socketId]}
            participant={participant}
            isLocal={false}
          />
        );
      })}
    </div>
  );
});

export default ParticipantGrid;
