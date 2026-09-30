import React from 'react';

export default function JoinClassButton({ onJoin, onCancel, isReady }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8">
      <button 
        onClick={onJoin}
        disabled={!isReady}
        className="w-full sm:w-48 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
      >
        Join Class
      </button>
      <button 
        onClick={onCancel}
        className="w-full sm:w-48 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-full transition-all border border-slate-700 hover:border-slate-600"
      >
        Cancel
      </button>
    </div>
  );
}
