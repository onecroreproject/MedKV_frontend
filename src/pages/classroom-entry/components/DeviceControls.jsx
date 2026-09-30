import React from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

export default function DeviceControls({ 
  isVideoEnabled, 
  isAudioEnabled, 
  onToggleVideo, 
  onToggleAudio 
}) {
  return (
    <div className="flex items-center justify-center space-x-6 mt-6">
      <button 
        onClick={onToggleAudio}
        className={`p-4 rounded-full transition-all ${
          isAudioEnabled 
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 shadow-lg' 
            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
        }`}
        aria-label={isAudioEnabled ? "Turn off microphone" : "Turn on microphone"}
      >
        {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <button 
        onClick={onToggleVideo}
        className={`p-4 rounded-full transition-all ${
          isVideoEnabled 
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 shadow-lg' 
            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
        }`}
        aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
      </button>
    </div>
  );
}
