import React from 'react';
import { ShieldAlert, EyeOff } from 'lucide-react';

/**
 * ClassroomFocusOverlay
 *
 * Appears instantly when a student switches tabs, minimizes the window,
 * opens another app (such as OBS, Loom, screen capture tools), or opens browser extensions.
 * Completely blocks video stream capture and prompts the student to stay focused.
 */
export default function ClassroomFocusOverlay({ isBlurred, onResume, user }) {
  if (!isBlurred) return null;

  const studentName = user?.name || 'Student';
  const studentMobile = user?.phoneNumber || user?.phone || user?.mobileNumber || user?.mobile || '';

  return (
    <div 
      onClick={onResume}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-white p-6 select-none animate-in fade-in duration-200 cursor-pointer text-center"
      style={{ userSelect: 'none' }}
    >
      <div className="max-w-md w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 flex flex-col items-center gap-4">
        
        {/* Pulsing Shield Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 relative">
          <ShieldAlert size={34} className="animate-pulse" />
          <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-700 text-slate-300">
            <EyeOff size={14} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Live Class Paused
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-amber-400 uppercase tracking-wider">
            Security & Focus Protection Active
          </p>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
          Video playback is hidden while this window is in the background. External recording software and window switching are restricted.
        </p>

        {/* Student identification badge */}
        <div className="w-full bg-slate-800/80 rounded-lg px-3 py-2 border border-slate-700/60 text-xs text-slate-400 font-mono flex items-center justify-between">
          <span className="truncate">{studentName}</span>
          {studentMobile && (
            <span className="text-amber-300/80 font-semibold">{studentMobile}</span>
          )}
        </div>

        {/* Resume button */}
        <button
          onClick={onResume}
          className="mt-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Click to Resume Live Class</span>
        </button>
      </div>
    </div>
  );
}
