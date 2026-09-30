import React from 'react';
import { X, Mic, MicOff, MoreVertical } from 'lucide-react';

export default function PeoplePanel({ onClose, participants, teacher, userRole }) {
  const allParticipants = [teacher, ...participants];

  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-20 transition-all duration-300 animate-in slide-in-from-right-8 fade-in">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">People ({allParticipants.length})</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {userRole === 'teacher' && (
          <div className="px-2 py-3 flex space-x-2">
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm py-2 rounded-lg transition-colors border border-slate-700">
              Mute All
            </button>
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm py-2 rounded-lg transition-colors border border-slate-700">
              Admit All
            </button>
          </div>
        )}
        {userRole === 'teacher' && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mt-2 border-b border-slate-800 pb-2">
              Waiting to join (2)
            </div>
            <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                  A
                </div>
                <div className="text-sm text-slate-200 font-medium">Student A</div>
              </div>
              <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">Admit</button>
            </div>
            <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                  B
                </div>
                <div className="text-sm text-slate-200 font-medium">Student B</div>
              </div>
              <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">Admit</button>
            </div>
          </>
        )}

        {participants.some(p => p.isHandRaised) && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-yellow-400 uppercase tracking-wider mt-2">
              Raised Hands
            </div>
            {participants.filter(p => p.isHandRaised).map(p => (
              <ParticipantListItem key={`hand-${p.id}`} participant={p} isHost={false} userRole={userRole} />
            ))}
          </>
        )}

        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
          Host
        </div>
        <ParticipantListItem participant={teacher} isHost={true} userRole={userRole} />

        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
          Students
        </div>
        {participants.map(p => (
          <ParticipantListItem key={p.id} participant={p} isHost={false} userRole={userRole} />
        ))}
      </div>
    </div>
  );
}

function ParticipantListItem({ participant, isHost, userRole }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
          {participant.name.charAt(0)}
        </div>
        <div>
          <div className="text-sm text-slate-200 font-medium">
            {participant.name} {isHost && <span className="text-xs text-blue-400 font-normal ml-1">(Host)</span>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-slate-400">
        {participant.isMuted ? (
          <MicOff size={16} className="text-red-400" />
        ) : (
          <Mic size={16} className={participant.isSpeaking ? "text-blue-400" : "text-slate-400"} />
        )}
        
        {userRole === 'teacher' && !isHost && (
          <button className="p-1 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
