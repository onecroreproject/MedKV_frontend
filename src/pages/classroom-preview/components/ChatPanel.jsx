import React from 'react';
import { X, Send } from 'lucide-react';

export default function ChatPanel({ onClose }) {
  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-20 transition-all duration-300 animate-in slide-in-from-right-8 fade-in">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">In-call messages</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="bg-slate-800/50 p-3 rounded-lg text-sm text-slate-400 text-center mb-4">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>

        {/* Mock Messages */}
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-sm text-blue-400">Dr. Sam Reefath</span>
            <span className="text-xs text-slate-500">10:02 AM</span>
          </div>
          <div className="text-sm text-slate-200 bg-slate-800 p-2.5 rounded-r-lg rounded-bl-lg w-fit">
            Good morning everyone. We will start in 2 minutes.
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-sm text-slate-300">Suriya</span>
            <span className="text-xs text-slate-500">10:03 AM</span>
          </div>
          <div className="text-sm text-slate-200 bg-slate-800 p-2.5 rounded-r-lg rounded-bl-lg w-fit">
            Good morning sir!
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-sm text-slate-300">Student 02</span>
            <span className="text-xs text-slate-500">10:15 AM</span>
          </div>
          <div className="text-sm text-slate-200 bg-slate-800 p-2.5 rounded-r-lg rounded-bl-lg w-fit">
            Can you explain the hyperintensity on T2 again?
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Send a message..." 
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <button className="absolute right-2 p-1.5 text-blue-400 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50">
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
