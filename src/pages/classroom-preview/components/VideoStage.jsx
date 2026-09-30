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

  // Determine what goes in the main stage vs the strip
  const showPiP = isScreenSharing && teacher && teacher.lkParticipant?.isCameraEnabled;
  
  // People in the strip are everyone EXCEPT PiP teacher (if active)
  // Wait, if screen sharing, all participants (except PiP teacher) go to strip.
  // If pinning (and no screen share), all participants except pinned go to strip.
  let stripParticipants = [];
  let mainStageNode = null;
  
  if (isScreenSharing) {
    stripParticipants = allParticipants.filter(p => !showPiP || p.id !== teacher?.id);
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
    <div className="flex-1 w-full h-full flex flex-col p-4 space-y-4 overflow-hidden transition-opacity duration-300 ease-in-out opacity-100">
      {/* Main Stage Area */}
      <div className="flex-1 relative bg-black rounded-xl overflow-hidden shadow-lg min-h-0 flex items-center justify-center ring-1 ring-slate-800">
        
        {mainStageNode}
        
        {/* Floating Teacher PiP (only when screen sharing and camera is ON) */}
        {showPiP && (
          <div className="absolute bottom-4 right-4 w-48 sm:w-56 aspect-video shadow-2xl rounded-xl overflow-hidden border border-slate-600/50 z-20 transition-all duration-300 hover:scale-105">
             <ParticipantTile 
               participant={teacher} 
               isHost={true} 
               isPiP={true} 
             />
          </div>
        )}
      </div>

      {/* Participant Strip (if there are people to show) */}
      {stripParticipants.length > 0 && (
        <div className="h-28 sm:h-36 shrink-0 w-full overflow-x-auto flex space-x-3 pb-2 custom-scrollbar transition-all duration-300 ease-in-out">
          {stripParticipants.map((p) => (
            <div key={p.id} className="h-full aspect-video shrink-0 transition-transform duration-300">
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
