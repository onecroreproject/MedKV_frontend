import React from 'react';
import ParticipantGrid from './ParticipantGrid';
import ParticipantTile from './ParticipantTile';
import { MonitorUp } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';

export default function VideoStage({ isScreenSharing, screenShareTrack, participants, teacher }) {
  if (!isScreenSharing) {
    return <ParticipantGrid participants={participants} teacher={teacher} />;
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col p-4 space-y-4 overflow-hidden">
      {/* Screen Share Main Stage */}
      <div className="flex-1 relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg min-h-0 flex items-center justify-center">
        {screenShareTrack ? (
          <VideoTrack 
            trackRef={screenShareTrack} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50">
             <MonitorUp size={64} className="text-slate-500 mb-4 opacity-50" />
             <p className="text-slate-400 font-medium text-lg">Presentation is active</p>
          </div>
        )}
        
        {/* Floating Teacher PiP */}
        <div className="absolute top-4 right-4 w-48 aspect-video shadow-2xl rounded-xl overflow-hidden border border-slate-600/50 z-10">
           <ParticipantTile participant={teacher} isTeacher={true} isPiP={true} />
        </div>
      </div>

      {/* Student Strip */}
      <div className="h-32 shrink-0 w-full overflow-x-auto flex space-x-3 pb-2 custom-scrollbar">
        {participants.map((p) => (
          <div key={p.id} className="h-full aspect-video shrink-0">
             <ParticipantTile participant={p} isTeacher={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
