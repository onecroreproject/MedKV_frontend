import React from 'react';
import ParticipantGrid from './ParticipantGrid';
import ParticipantTile from './ParticipantTile';
import { MonitorUp } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';

export default function VideoStage({ 
  isScreenSharing, 
  screenShareTrack, 
  participants, 
  teacher, 
  pinnedParticipantId, 
  setPinnedParticipantId 
}) {
  const allParticipants = teacher ? [teacher, ...participants] : participants;
  const pinnedParticipant = allParticipants.find(p => p.id === pinnedParticipantId);

  // Helper to toggle pin
  const handleTogglePin = (id) => {
    setPinnedParticipantId(prev => prev === id ? null : id);
  };

  // If no screen share and no pinned participant, show the responsive grid
  if (!isScreenSharing && !pinnedParticipant) {
    return (
      <ParticipantGrid 
        participants={participants} 
        teacher={teacher} 
        onTogglePin={handleTogglePin}
      />
    );
  }

  // If screen sharing, all participants including teacher go to the right column.
  let stripParticipants = [];
  let mainStageNode = null;
  
  if (isScreenSharing) {
    stripParticipants = allParticipants;
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
  } else if (pinnedParticipant) {
    stripParticipants = allParticipants.filter(p => p.id !== pinnedParticipant.id);
    mainStageNode = (
      <div className="absolute inset-0 flex transition-all duration-300 ease-in-out bg-slate-900 rounded-xl overflow-hidden">
         <ParticipantTile 
           participant={pinnedParticipant} 
           isHost={pinnedParticipant.id === teacher?.id} 
           isPinned={true}
           onTogglePin={() => handleTogglePin(pinnedParticipant.id)}
           isPiP={true} // reuse PiP style for full size (w-full h-full)
         />
      </div>
    );
  }

  return (
    <div className={`flex-1 w-full h-full flex ${isScreenSharing ? 'flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4' : 'flex-col space-y-4'} p-4 overflow-hidden transition-all duration-300 ease-in-out`}>
      {/* Main Stage Area */}
      <div className={`relative bg-black rounded-xl overflow-hidden shadow-lg min-h-0 flex items-center justify-center ring-1 ring-slate-800 transition-all duration-300 ${isScreenSharing ? 'flex-1 h-2/3 md:h-full' : 'flex-1'}`}>
        
        {mainStageNode}
        
      </div>

      {/* Participant Strip/Column */}
      {stripParticipants.length > 0 && (
        <div className={`shrink-0 flex custom-scrollbar transition-all duration-300 ease-in-out ${isScreenSharing ? 'h-1/3 md:h-full md:w-64 lg:w-72 flex-row md:flex-col space-x-3 md:space-x-0 md:space-y-3 overflow-x-auto md:overflow-y-auto' : 'h-28 sm:h-36 w-full overflow-x-auto flex-row space-x-3 pb-2'}`}>
          {stripParticipants.map((p) => (
            <div key={p.id} className={`shrink-0 transition-transform duration-300 ${isScreenSharing ? 'h-full md:h-auto md:w-full md:aspect-video aspect-video' : 'h-full aspect-video'}`}>
               <ParticipantTile 
                 participant={p} 
                 isHost={p.id === teacher?.id} 
                 isPinned={false}
                 onTogglePin={() => handleTogglePin(p.id)}
               />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
