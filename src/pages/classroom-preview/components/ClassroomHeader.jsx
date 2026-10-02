import React, { useState, useEffect } from 'react';
import { Users, Clock } from 'lucide-react';
import darkLogo from '../../../assets/dark_logo_transparent.png';

export default function ClassroomHeader({ title, duration, participantCount, recordingState, recordingStartedAt, recordingAccumulatedDuration }) {
  const [recDuration, setRecDuration] = useState('');

  useEffect(() => {
    let interval;
    if (recordingState === 'recording' || recordingState === 'paused' || recordingState === 'stopping') {
      const updateDuration = () => {
        let totalSeconds = recordingAccumulatedDuration || 0;
        if (recordingState === 'recording' && recordingStartedAt) {
          totalSeconds += Math.floor((Date.now() - new Date(recordingStartedAt).getTime()) / 1000);
        }
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        setRecDuration(h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`);
      };
      updateDuration();
      interval = setInterval(updateDuration, 1000);
    } else {
      setRecDuration('');
    }
    return () => { if (interval) clearInterval(interval); };
  }, [recordingState, recordingStartedAt, recordingAccumulatedDuration]);

  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 text-white shadow-sm z-10 shrink-0 min-h-[56px]">

      {/* LEFT — Logo + Academy name */}
      <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
        <img src={darkLogo} alt="Academy Logo" className="h-7 sm:h-8 object-contain flex-shrink-0" />
        <div className="font-semibold text-sm tracking-wide text-blue-400 hidden md:block truncate max-w-[160px]">
          Dr. Sam Reefath Radiology Academy
        </div>
      </div>

      {/* CENTER — Class title */}
      <div className="flex-1 flex justify-center px-2 min-w-0">
        <span className="font-medium text-slate-200 text-sm sm:text-base truncate max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md text-center">
          {title}
        </span>
      </div>

      {/* RIGHT — Badges + timer + options */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">

        {/* LIVE badge — always visible */}
        <div className="flex items-center space-x-1 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold text-[10px] sm:text-xs tracking-wider">LIVE</span>
        </div>

        {/* Recording badge */}
        {(recordingState === 'recording' || recordingState === 'stopping' || recordingState === 'paused') && (
          <div className="flex items-center space-x-1 bg-red-600 px-2 py-1 rounded-full shadow-lg shadow-red-500/30 text-white animate-in fade-in">
            <div className={`w-1.5 h-1.5 rounded-full bg-white ${recordingState === 'recording' ? 'animate-pulse' : ''}`} />
            <span className="font-bold text-[10px] sm:text-xs tracking-wider">
              {recordingState === 'stopping' ? 'STOP' : 'REC'} {recDuration}
            </span>
          </div>
        )}

        {/* Timer — visible on sm+ */}
        <div className="hidden sm:flex items-center space-x-1 text-slate-300 font-mono text-xs sm:text-sm">
          <Clock size={13} className="text-slate-500" />
          <span>{duration}</span>
        </div>

        {/* People count — ALWAYS visible, prominent pill */}
        <div className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 py-1 rounded-full border border-slate-700 transition-colors cursor-default">
          <Users size={13} className="text-blue-400 flex-shrink-0" />
          <span className="text-slate-200 text-xs sm:text-sm font-semibold tabular-nums">
            {participantCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
