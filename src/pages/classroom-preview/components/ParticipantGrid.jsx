import React from 'react';
import ParticipantTile from './ParticipantTile';

export default function ParticipantGrid({ participants, teacher, onTogglePin }) {
  // Merge teacher and participants for the grid
  const allParticipants = teacher ? [teacher, ...participants] : participants;
  
  const count = allParticipants.length;
  let gridCols = "grid-cols-1";
  
  if (count === 2) gridCols = "grid-cols-2";
  else if (count >= 3 && count <= 4) gridCols = "grid-cols-2 lg:grid-cols-2";
  else if (count >= 5 && count <= 6) gridCols = "grid-cols-2 lg:grid-cols-3";
  else if (count >= 7 && count <= 9) gridCols = "grid-cols-3 lg:grid-cols-3";
  else if (count > 9) gridCols = "grid-cols-3 lg:grid-cols-4";
  
  return (
    <div className="flex-1 w-full h-full p-4 overflow-y-auto custom-scrollbar transition-all duration-300">
      <div className={`grid ${gridCols} gap-4 auto-rows-max items-center justify-center max-w-7xl mx-auto h-full transition-all duration-300`}>
        {allParticipants.map((p) => (
          <div key={p.id} className="w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-[1.02]">
            <ParticipantTile 
              participant={p} 
              isHost={p.id === teacher?.id} 
              onTogglePin={() => onTogglePin && onTogglePin(p.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
