import React from 'react';
import ParticipantTile from './ParticipantTile';

export default function ParticipantGrid({ participants, teacher }) {
  // Merge teacher and participants for the grid
  const allParticipants = [teacher, ...participants];
  
  // Calculate grid columns based on count for responsive feel
  let gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  if (allParticipants.length > 6) {
    gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }
  
  return (
    <div className="flex-1 w-full h-full p-4 overflow-y-auto custom-scrollbar">
      <div className={`grid ${gridCols} gap-4 auto-rows-max items-center justify-center max-w-7xl mx-auto h-full`}>
        {allParticipants.map((p) => (
          <ParticipantTile 
            key={p.id} 
            participant={p} 
            isTeacher={p.id === teacher.id} 
          />
        ))}
      </div>
    </div>
  );
}
