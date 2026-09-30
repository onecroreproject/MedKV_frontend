import React from 'react';
import darkLogo from '../../../assets/dark_logo_transparent.png';
import { CheckCircle2, Loader2, LogOut } from 'lucide-react';

export default function WaitingRoom({ onLeave, onSimulateAdmit }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans items-center justify-center p-6 relative">
      
      {/* Dev Only Admit */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={onSimulateAdmit}
          className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-lg text-sm font-bold z-50 transition-colors"
        >
          [DEV] Simulate Faculty Admit
        </button>
      )}

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        <img src={darkLogo} alt="Academy Logo" className="h-10 object-contain mb-8" />
        
        <h1 className="text-2xl font-bold text-slate-100 mb-6">
          You're ready to join
        </h1>

        <div className="flex items-center space-x-6 mb-10 text-slate-300 font-medium">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={20} className="text-green-500" />
            <span>Camera</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={20} className="text-green-500" />
            <span>Microphone</span>
          </div>
        </div>

        <div className="w-full h-px bg-slate-800 mb-10"></div>

        <div className="flex flex-col items-center space-y-4 mb-10">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <h2 className="text-xl font-semibold text-slate-200">
            Waiting for the faculty
          </h2>
          <p className="text-slate-400 text-sm max-w-xs">
            The faculty will admit you into the class shortly. Please do not close this window.
          </p>
        </div>

        <button 
          onClick={onLeave}
          className="flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
        >
          <LogOut size={18} />
          <span className="font-medium">Leave Waiting Room</span>
        </button>
      </div>
    </div>
  );
}
