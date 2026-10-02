import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, MoreVertical, CameraOff, LogOut, Shield, ShieldOff } from 'lucide-react';

export default function PeoplePanel({ 
  onClose, participants, teacher, userRole, 
  effectiveRole, isHost = false, canModerate = false, onAssignCoHost,
  waitingStudents = [], onAdmit, onReject,
  raisedHands = [], onClearHand,
  mutedParticipants = {},
  cameraDisabledParticipants = {},
  onMuteParticipant,
  onDisableCamera,
  onRemoveParticipant,
  unmuteRequests = [],
  onAllowUnmute
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
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 shrink-0">
        <h2 className="text-lg font-semibold text-slate-100">People ({allParticipants.length})</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {/* Host-level controls */}
        {canModerate && (
          <div className="px-2 py-3 flex space-x-2">
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm py-2 rounded-lg transition-colors border border-slate-700">
              Mute All
            </button>
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm py-2 rounded-lg transition-colors border border-slate-700">
              Admit All
            </button>
          </div>
        )}

        {/* Unmute Requests */}
        {canModerate && unmuteRequests.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mt-2 border-b border-slate-800 pb-2">
              Unmute Requests ({unmuteRequests.length})
            </div>
            {unmuteRequests.map(req => (
              <div key={`req-${req.userId}`} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg transition-colors mt-1">
                <div className="text-sm text-slate-200">
                  <span className="font-semibold">{req.name}</span> wants to unmute
                </div>
                <button
                  onClick={() => onAllowUnmute && onAllowUnmute(req.userId)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
                >
                  Allow
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Waiting to join */}
        {canModerate && waitingStudents.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mt-2 border-b border-slate-800 pb-2">
              Waiting to join ({waitingStudents.length})
            </div>
            {waitingStudents.map(student => (
              <div key={student.userId} className="flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                    {student.name ? student.name.charAt(0) : '?'}
                  </div>
                  <div className="text-sm text-slate-200 font-medium">{student.name || 'Unknown Student'}</div>
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
          </div>
        )}

        {/* Raised Hands — chronological order */}
        {raisedHandParticipants.length > 0 && (
          <div className="mb-4">
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
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!!mutedParticipants[p.id] && (
                      <button
                        onClick={() => onAllowUnmute && onAllowUnmute(p.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 border border-slate-700 hover:border-blue-500/50 px-2 py-1 rounded transition-colors"
                        title="Allow Unmute"
                      >
                        Allow Unmute
                      </button>
                    )}
                    <button
                      onClick={() => onClearHand && onClearHand(p.id)}
                      className="text-xs text-slate-400 hover:text-yellow-300 border border-slate-700 hover:border-yellow-500/50 px-2 py-1 rounded transition-colors"
                      title="Lower hand"
                    >
                      Lower
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
            canModerate={canModerate}
            isCurrentUserHost={isHost}
            onAssignCoHost={onAssignCoHost}
            userRole={userRole}
            hasRaisedHand={raisedHands.includes(p.id)}
            isModerationMuted={!!mutedParticipants[p.id]}
            isModerationCameraDisabled={!!cameraDisabledParticipants[p.id]}
            onMute={() => onMuteParticipant && onMuteParticipant(p.id)}
            onDisableCamera={() => onDisableCamera && onDisableCamera(p.id)}
            onRemove={() => onRemoveParticipant && onRemoveParticipant(p.id)}
            onClearHand={() => onClearHand && onClearHand(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ParticipantListItem({ 
  participant, 
  isHost, 
  canModerate,
  isCurrentUserHost,
  onAssignCoHost,
  userRole, 
  hasRaisedHand,
  isModerationMuted,
  isModerationCameraDisabled,
  onMute,
  onDisableCamera,
  onRemove,
  onClearHand
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setConfirmRemove(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Show three-dot menu only if current user can moderate AND the target is not the host
  const showModeration = canModerate && !isHost;
  const displayName = participant.name || (participant.identity ? participant.identity.split('|')[0] : 'Unknown');
  const isCoHost = participant.isCoHost;

  return (
    <div className="relative flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 rounded-lg group transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${hasRaisedHand ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300' : isCoHost ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-slate-700 text-slate-300'}`}>
          {hasRaisedHand ? '✋' : displayName.charAt(0)}
        </div>
        <div>
          <div className="text-sm text-slate-200 font-medium flex items-center gap-1">
            {displayName}
            {isHost && <span className="text-xs text-blue-400 font-normal ml-1">(Host)</span>}
            {isCoHost && !isHost && <span className="text-xs text-purple-400 font-normal ml-1">(Co-Host)</span>}
          </div>
          {hasRaisedHand && <div className="text-xs text-yellow-400">Hand raised</div>}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-slate-400">
        {participant.isMuted || isModerationMuted ? (
          <MicOff size={16} className={isModerationMuted ? "text-red-500" : "text-red-400"} title={isModerationMuted ? "Muted by Faculty" : "Muted"} />
        ) : (
          <Mic size={16} className={participant.isSpeaking ? "text-blue-400" : "text-slate-400"} />
        )}
        
        {isModerationCameraDisabled && (
           <CameraOff size={16} className="text-red-500" title="Camera Disabled by Faculty" />
        )}

        {showModeration && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity outline-none"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                {confirmRemove ? (
                  <div className="p-2">
                    <p className="text-xs text-slate-300 mb-2 text-center">Remove this student?</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setConfirmRemove(false)}
                        className="flex-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => { onRemove(); setMenuOpen(false); setConfirmRemove(false); }}
                        className="flex-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Co-Host assign — only the host (admin) can do this */}
                    {isCurrentUserHost && onAssignCoHost && (
                      <>
                        <button 
                          onClick={() => { onAssignCoHost(participant.id); setMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-purple-300 hover:bg-slate-700 flex items-center space-x-2"
                        >
                          {isCoHost ? <ShieldOff size={14} /> : <Shield size={14} />}
                          <span>{isCoHost ? 'Remove Co-Host' : 'Make Co-Host'}</span>
                        </button>
                        <div className="h-px bg-slate-700 my-1"></div>
                      </>
                    )}

                    {!isModerationMuted && (
                      <button 
                        onClick={() => { onMute(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <MicOff size={14} /> <span>Mute</span>
                      </button>
                    )}
                    
                    {!isModerationCameraDisabled && (
                      <button 
                        onClick={() => { onDisableCamera(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <CameraOff size={14} /> <span>Disable Camera</span>
                      </button>
                    )}

                    {hasRaisedHand && (
                       <button 
                        onClick={() => { onClearHand(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <span>Lower Hand</span>
                      </button>
                    )}

                    <div className="h-px bg-slate-700 my-1"></div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfirmRemove(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center space-x-2"
                    >
                      <LogOut size={14} /> <span>Remove</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
