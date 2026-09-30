import React from 'react';
import { MoreVertical } from 'lucide-react';
import darkLogo from '../../../assets/dark_logo_transparent.png';

export default function ClassroomHeader({ title, duration }) {
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

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-red-400 font-semibold text-sm tracking-widest">LIVE</span>
        </div>
        <div className="text-slate-300 font-mono tracking-wider">{duration}</div>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300" aria-label="More options">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}
