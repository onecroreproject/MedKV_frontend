import React, { useEffect } from 'react';
import darkLogo from '../../../assets/dark_logo_transparent.png';
import DevicePreview from './DevicePreview';
import DeviceControls from './DeviceControls';
import JoinClassButton from './JoinClassButton';
import { usePreJoinMedia } from '../hooks/usePreJoinMedia';

export default function PreJoinScreen({ user, roomTitle, onJoin, onCancel }) {
  const { 
    stream, 
    isVideoEnabled, 
    isAudioEnabled, 
    toggleVideo, 
    toggleAudio,
    error,
    cleanupMedia
  } = usePreJoinMedia();

  // Cleanup media on unmount if we cancel or join
  useEffect(() => {
    return () => cleanupMedia();
  }, [cleanupMedia]);

  const handleJoin = () => {
    onJoin();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <div className="flex items-center px-6 py-4">
        <img src={darkLogo} alt="Academy Logo" className="h-8 object-contain" />
        <div className="ml-4 font-semibold text-lg text-blue-400 hidden sm:block">
          Dr. Sam Reefath Radiology Academy
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 max-w-7xl mx-auto w-full gap-12">
        
        {/* Left Side: Preview & Controls */}
        <div className="flex-1 w-full max-w-3xl flex flex-col">
          <DevicePreview 
            stream={stream}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            userName={user?.name || 'Guest'}
          />
          <DeviceControls 
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
          />
          {error && (
            <div className="mt-4 text-center text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              Camera/Microphone access denied or unavailable. You can continue without them.
            </div>
          )}
        </div>

        {/* Right Side: Join Info */}
        <div className="lg:w-96 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-100">Ready to join?</h1>
            <p className="text-slate-400 text-lg">{roomTitle || 'Live Classroom'}</p>
          </div>
          
          <div className="w-full">
            <JoinClassButton 
              onJoin={handleJoin} 
              onCancel={onCancel}
              isReady={true} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
