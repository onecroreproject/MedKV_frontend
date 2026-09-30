import React from 'react';
import { X, Mic, MicOff, MoreVertical } from 'lucide-react';

export default function PeoplePanel({ 
  onClose, participants, teacher, userRole, 
  waitingStudents = [], onAdmit, onReject,
  raisedHands = [], onClearHand 
}) {
  const allParticipants = [teacher, ...participants].filter(Boolean);

  // Build a map from userId → participant name for display
  const allById = {};
  allParticipants.forEach(p => { if (p) allById[p.id] = p; });

  // Participants who have raised hands (in chronological order from raisedHands array)
  const raisedHandParticipants = raisedHands
    .map(userId => allById[userId])
    .filter(Boolean);

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

        {/* Waiting to join */}
        {userRole === 'teacher' && waitingStudents.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mt-2 border-b border-slate-800 pb-2">
              Waiting to join ({waitingStudents.length})
            </div>
            {waitingStudents.map(student => (
              <div key={student.userId} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                    {student.name.charAt(0)}
                  </div>
                  <div className="text-sm text-slate-200 font-medium">{student.name}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => onAdmit && onAdmit(student.userId)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors"
                  >
                    Admit
                  </button>
                  <button 
                    onClick={() => onReject && onReject(student.userId)}
                    className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Raised Hands — chronological order */}
        {raisedHandParticipants.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-yellow-400 uppercase tracking-wider mt-4 border-b border-slate-800 pb-2 flex items-center space-x-1">
              <span>✋</span>
              <span>Raised Hands ({raisedHandParticipants.length})</span>
            </div>
            {raisedHandParticipants.map((p, idx) => (
              <div key={`hand-${p.id}`} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-sm font-bold text-yellow-300">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm text-slate-200 font-medium">{p.name}</div>
                    <div className="text-xs text-yellow-400">✋ Hand raised</div>
                  </div>
                </div>
                {userRole === 'teacher' && (
                  <button
                    onClick={() => onClearHand && onClearHand(p.id)}
                    className="text-xs text-slate-400 hover:text-yellow-300 border border-slate-700 hover:border-yellow-500/50 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Lower hand"
                  >
                    Lower
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* Host */}
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
          Host
        </div>
        {teacher && (
          <ParticipantListItem 
            participant={teacher} 
            isHost={true} 
            userRole={userRole}
            hasRaisedHand={raisedHands.includes(teacher.id)}
          />
        )}

        {/* Students */}
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
          Students ({participants.length})
        </div>
        {participants.map(p => (
          <ParticipantListItem 
            key={p.id} 
            participant={p} 
            isHost={false} 
            userRole={userRole}
            hasRaisedHand={raisedHands.includes(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ParticipantListItem({ participant, isHost, userRole, hasRaisedHand }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${hasRaisedHand ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}>
          {hasRaisedHand ? '✋' : participant.name.charAt(0)}
        </div>
        <div>
          <div className="text-sm text-slate-200 font-medium">
            {participant.name} {isHost && <span className="text-xs text-blue-400 font-normal ml-1">(Host)</span>}
          </div>
          {hasRaisedHand && <div className="text-xs text-yellow-400">Hand raised</div>}
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
