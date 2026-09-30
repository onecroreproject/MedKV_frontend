import React, { useState, useEffect } from 'react';
import { MoreVertical, Users } from 'lucide-react';
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
        
        if (h === '00') {
          setRecDuration(`${m}:${s}`);
        } else {
          setRecDuration(`${h}:${m}:${s}`);
        }
      };
      
      updateDuration(); // initial call
      interval = setInterval(updateDuration, 1000);
    } else {
      setRecDuration('');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState, recordingStartedAt, recordingAccumulatedDuration]);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white shadow-sm z-10 shrink-0 h-16">
      <div className="flex items-center space-x-3 max-w-xs md:max-w-md w-1/3">
        <img src={darkLogo} alt="Academy Logo" className="h-8 object-contain" />
        <div className="font-semibold text-base tracking-wide text-blue-400 hidden sm:block truncate">
          Dr. Sam Reefath Radiology Academy
        </div>
      </div>
      
      <div className="flex-1 flex justify-center w-1/3 truncate px-4">
        <span className="font-medium text-slate-200 text-base md:text-lg truncate">{title}</span>
      </div>

      <div className="flex items-center justify-end w-1/3 space-x-4 md:space-x-6">
        <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-red-400 font-bold text-xs md:text-sm tracking-wider">LIVE</span>
        </div>

        {(recordingState === 'recording' || recordingState === 'stopping' || recordingState === 'paused') && (
          <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full shadow-lg shadow-red-500/30 text-white animate-in fade-in">
            <div className={`w-2 h-2 rounded-full bg-white ${recordingState === 'recording' ? 'animate-pulse' : ''}`}></div>
            <span className="font-bold text-xs md:text-sm tracking-wider">
              {recordingState === 'stopping' ? 'STOPPING' : 'REC'} {recDuration}
            </span>
          </div>
        )}
        
        <div className="text-slate-300 font-mono tracking-wider text-sm hidden md:block">{duration}</div>
        
        {participantCount !== undefined && (
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-300 font-medium bg-slate-800 px-3 py-1 rounded-full">
            <Users size={16} className="text-slate-400" />
            <span className="text-sm">{participantCount}</span>
          </div>
        )}

        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 shrink-0" aria-label="More options">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}
