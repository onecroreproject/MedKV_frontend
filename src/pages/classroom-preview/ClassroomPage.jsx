import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getMe } from '../../services/userService';
import { LiveKitRoom, RoomAudioRenderer, useRoomContext, useLocalParticipant, useTracks, useParticipants, useConnectionState } from '@livekit/components-react';
import { Track, VideoPresets, AudioPresets, ConnectionState } from 'livekit-client';

import ClassroomHeader from './components/ClassroomHeader';
import VideoStage from './components/VideoStage';
import ClassroomControls from './components/ClassroomControls';
import ChatPanel from './components/ChatPanel';
import PeoplePanel from './components/PeoplePanel';
import { webrtcService } from '../../services/webrtcService';

const LOW_LATENCY_OPTIONS = {
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: true,
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
  audioCaptureDefaults: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  audioOutput: {
    deviceId: 'default',
  },
  publishDefaults: {
    audioPreset: AudioPresets.speech,
    videoCodec: 'vp8',
    simulcast: true,
    videoEncoding: {
      maxBitrate: 1_500_000,
      maxFramerate: 30,
    },
    screenShareEncoding: {
      maxBitrate: 2_500_000,
      maxFramerate: 15,
    },
    dtx: false,
    red: false,
  },
};

export default function ClassroomPage({ user: passedUser, admissionService }) {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(passedUser || location.state?.user || null);
  const [loadingUser, setLoadingUser] = useState(!passedUser && !location.state?.user);
  const [isTeacher, setIsTeacher] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  
  // 1. Fetch User Data
  useEffect(() => {
    if (!user) {
      getMe().then(res => {
        if (res?.data) {
          setUser(res.data);
          setIsTeacher(res.data.role === 'Faculty' || res.data.role === 'admin' || res.data.role === 'teacher');
        }
      }).catch(err => {
        console.error('Failed to fetch user', err);
        setError('Failed to authenticate. Please login.');
      }).finally(() => {
        setLoadingUser(false);
      });
    } else {
      setIsTeacher(user.role === 'Faculty' || user.role === 'admin' || user.role === 'teacher');
    }
  }, [user]);

  // 2. Fetch LiveKit Token
  useEffect(() => {
    if (loadingUser || !user || !roomId || token) return;

    const fetchToken = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/live-classes/token/livekit`, {
          roomId,
          participantName: user.name,
          role: user.role
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setToken(response.data.token);
      } catch (err) {
        console.error("Failed to fetch LiveKit token", err);
        setError("Failed to connect to class.");
      }
    };

    fetchToken();
  }, [user, loadingUser, roomId, token]);

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin my-4"></div>
        <p>Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-red-400">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-slate-800 rounded">Go Back</button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin my-4"></div>
        <p>Connecting to classroom...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      token={token}
      connect={true}
      options={LOW_LATENCY_OPTIONS}
      className="h-screen w-full bg-[#0a0a0a] flex flex-col font-sans text-slate-200"
    >
      <ClassroomInner user={user} userRole={isTeacher ? 'teacher' : 'student'} roomId={roomId} admissionService={admissionService} />
    </LiveKitRoom>
  );
}

import { useClassroomRealtime } from './hooks/useClassroomRealtime';

function ClassroomInner({ user, userRole, roomId, admissionService }) {
  const room = useRoomContext();
  const navigate = useNavigate();
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPeopleOpen, setIsPeopleOpen] = useState(false);
  const [duration, setDuration] = useState('00:00:00');
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize Realtime Hook — single socket for all classroom events
  const { 
    raisedHands, 
    recentReactions, 
    chatMessages,
    unreadCount,
    setChatPanelOpen,
    toggleHand, 
    clearHand, 
    sendReaction,
    sendChatMessage,
    mutedParticipants,
    cameraDisabledParticipants,
    isMutedByFaculty,
    isCameraDisabledByFaculty,
    removedFromClass,
    removedReason,
    unmuteRequests,
    muteParticipant,
    requestUnmute,
    allowUnmute,
    disableCamera,
    removeParticipant,
    clearParticipantHand,
    recordingState,
    recordingStartedAt,
    recordingAccumulatedDuration,
    isSocketConnected,
    socketAuthError,
  } = useClassroomRealtime(roomId, user);

  const lkConnectionState = useConnectionState();

  // Sync chat panel open state with the realtime hook (for unread counter)
  const handleSetChatOpen = (open) => {
    setIsChatOpen(open);
    setChatPanelOpen(open);
    if (open) setIsPeopleOpen(false); // only one panel at a time
  };

  const handleSetPeopleOpen = (open) => {
    setIsPeopleOpen(open);
    if (open) {
      setIsChatOpen(false);
      setChatPanelOpen(false);
    }
  };

  // Simple duration timer
  useEffect(() => {
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setDuration(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync disconnect with backend on unmount
  useEffect(() => {
    return () => {
      webrtcService.disconnect();
    };
  }, []);

  const handleLeave = () => {
    room?.disconnect();
    webrtcService.disconnect();
    navigate(-1);
  };

  const handleEndClass = async () => {
    if (window.confirm("End this class?")) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/live-classes/${roomId}`, { status: 'Completed' }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        room?.disconnect();
        webrtcService.disconnect();
        navigate(-1);
      } catch (err) {
        console.error('Failed to end class:', err);
        alert('Failed to end class');
      }
    }
  };

  // If removed from class by faculty
  if (removedFromClass) {
    room?.disconnect();
    webrtcService.disconnect();
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-red-400">
        <h2 className="text-xl font-semibold mb-2">Removed</h2>
        <p>{removedReason}</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // If socket auth error (e.g. JWT expired, LiveClass ended, etc)
  if (socketAuthError) {
    room?.disconnect();
    webrtcService.disconnect();
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-red-400 p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p>Your access to this class is no longer available.</p>
        {/* <p className="text-sm opacity-60 mt-2">{socketAuthError}</p> */}
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isHandRaised = raisedHands.includes(user?._id || user?.id);
  const handleToggleHand = () => toggleHand(!isHandRaised);

  const currentUserId = user?._id || user?.id;

  return (
    <>
      <HeaderManager 
        duration={duration} 
        recordingState={recordingState}
        recordingStartedAt={recordingStartedAt}
        recordingAccumulatedDuration={recordingAccumulatedDuration}
      />

      {/* Connection State Overlay */}
      {(!isSocketConnected || lkConnectionState !== ConnectionState.Connected) && !removedFromClass && (
        <div className="absolute top-16 left-0 right-0 z-[100] flex justify-center mt-2 pointer-events-none">
          <div className={`px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center space-x-2 animate-in slide-in-from-top-4 fade-in ${
            (lkConnectionState === ConnectionState.Reconnecting || !isSocketConnected) ? 'bg-amber-500 text-amber-950' :
            (lkConnectionState === ConnectionState.Disconnected) ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'
          }`}>
            {(lkConnectionState === ConnectionState.Reconnecting || (!isSocketConnected && lkConnectionState === ConnectionState.Connected)) && (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Reconnecting...</span>
              </>
            )}
            {(lkConnectionState === ConnectionState.Disconnected && isSocketConnected) && (
              <span>Connection lost</span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <StageManager
          raisedHands={raisedHands}
          mutedParticipants={mutedParticipants}
          cameraDisabledParticipants={cameraDisabledParticipants}
        />
        
        {isChatOpen && (
          <ChatPanel 
            onClose={() => handleSetChatOpen(false)} 
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            currentUserId={currentUserId}
          />
        )}
        
        {isPeopleOpen && (
          <PeoplePanelManager 
            onClose={() => handleSetPeopleOpen(false)} 
            userRole={userRole}
            admissionService={admissionService}
            roomId={roomId}
            user={user}
            raisedHands={raisedHands}
            onClearHand={clearHand}
            mutedParticipants={mutedParticipants}
            cameraDisabledParticipants={cameraDisabledParticipants}
            onMuteParticipant={muteParticipant}
            onDisableCamera={disableCamera}
            onRemoveParticipant={removeParticipant}
            unmuteRequests={unmuteRequests}
            onAllowUnmute={allowUnmute}
          />
        )}

        {/* Reaction Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
          {recentReactions.map(reaction => (
            <div 
              key={reaction.id}
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-float-up opacity-0 flex flex-col items-center justify-center"
            >
              <div className="text-4xl">{reaction.reaction}</div>
              <div className="text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded-full mt-1">
                {reaction.name}
              </div>
            </div>
          ))}
        </div>

        {/* Banners for Moderation */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col space-y-2 z-50">
          {isMutedByFaculty && (
            <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]">
              <span className="text-sm font-medium">🔇 Muted by faculty</span>
              <button 
                onClick={() => { requestUnmute(); triggerToast('Unmute request sent'); }}
                className="text-xs bg-black/20 hover:bg-black/30 px-3 py-1 rounded transition-colors"
              >
                Request Unmute
              </button>
            </div>
          )}
          {isCameraDisabledByFaculty && (
            <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]">
              <span className="text-sm font-medium">📷 Camera disabled by faculty</span>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 fade-in">
            <span className="text-sm text-slate-200">{toastMessage}</span>
          </div>
        )}
      </div>

      <ControlsManager 
        userRole={userRole}
        isChatOpen={isChatOpen}
        setIsChatOpen={handleSetChatOpen}
        isPeopleOpen={isPeopleOpen}
        setIsPeopleOpen={handleSetPeopleOpen}
        isHandRaised={isHandRaised}
        setIsHandRaised={handleToggleHand}
        onLeave={handleLeave}
        onEndClass={handleEndClass}
        onReaction={sendReaction}
        unreadCount={unreadCount}
        isMutedByFaculty={isMutedByFaculty}
        isCameraDisabledByFaculty={isCameraDisabledByFaculty}
        roomId={roomId}
        recordingState={recordingState}
      />
      <RoomAudioRenderer />
    </>
  );
}


function HeaderManager({ duration, recordingState, recordingStartedAt, recordingAccumulatedDuration }) {
  const participants = useParticipants();
  return (
    <ClassroomHeader 
      title="Dr. Sam Reefath Radiology Class" 
      duration={duration} 
      participantCount={participants.length}
      recordingState={recordingState}
      recordingStartedAt={recordingStartedAt}
      recordingAccumulatedDuration={recordingAccumulatedDuration}
    />
  );
}

function StageManager({ raisedHands = [], mutedParticipants = {}, cameraDisabledParticipants = {} }) {
  const [pinnedIdentity, setPinnedIdentity] = useState(null);

  // Get all camera tracks (includes local + remote) — these are proper TrackReferences
  const cameraTrackRefs = useTracks(
    [Track.Source.Camera],
    { onlySubscribed: false }
  );

  // Get screen share tracks
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const isScreenSharing = screenShareTracks.length > 0;

  // Determine teacher identity from participant metadata
  const participants = useParticipants();
  const teacher = participants.find(p => {
    try {
      const meta = p.metadata ? JSON.parse(p.metadata) : {};
      return meta.role === 'teacher' || meta.isTeacher;
    } catch {
      return false;
    }
  });
  const teacherIdentity = teacher?.identity;

  return (
    <VideoStage
      isScreenSharing={isScreenSharing}
      screenShareTrack={screenShareTracks[0]}
      cameraTrackRefs={cameraTrackRefs}
      teacherIdentity={teacherIdentity}
      pinnedIdentity={pinnedIdentity}
      setPinnedIdentity={setPinnedIdentity}
      raisedHands={raisedHands}
      mutedParticipants={mutedParticipants}
      cameraDisabledParticipants={cameraDisabledParticipants}
    />
  );
}


function PeoplePanelManager({ 
  onClose, userRole, admissionService, roomId, user, 
  raisedHands = [], onClearHand,
  mutedParticipants, cameraDisabledParticipants,
  onMuteParticipant, onDisableCamera, onRemoveParticipant,
  unmuteRequests, onAllowUnmute
}) {
  const participants = useParticipants();
  const teacher = participants.find(p => p.identity.includes('teacher') || p.identity.includes('admin') || p.identity.includes('faculty') || (p.metadata && JSON.parse(p.metadata).role === 'teacher')) || participants[0];
  const students = participants.filter(p => p.identity !== teacher?.identity);
  
  const [waitingStudents, setWaitingStudents] = useState([]);

  useEffect(() => {
    if (userRole === 'teacher' && admissionService) {
      admissionService.onWaitingStudent = (student) => {
        setWaitingStudents(prev => {
          if (prev.find(s => s.userId === student.userId)) return prev;
          return [...prev, student];
        });
      };
      
      admissionService.onWaitingStudentsList = (studentsList) => {
        setWaitingStudents(studentsList);
      };
      
      admissionService.onStudentLeftWaiting = (data) => {
        setWaitingStudents(prev => prev.filter(s => s.userId !== data.userId));
      };

      // Fetch initial list
      admissionService.getWaitingStudents(roomId);
    }
  }, [userRole, admissionService, roomId, user]);

  const handleAdmit = (targetUserId) => {
    admissionService.admitStudent(roomId, targetUserId);
  };
  
  const handleReject = (targetUserId) => {
    admissionService.rejectStudent(roomId, targetUserId);
  };

  const normalize = (p) => ({
    id: p.identity,
    name: p.name || p.identity,
    isMuted: !p.isMicrophoneEnabled,
    isSpeaking: p.isSpeaking,
  });

  return (
    <PeoplePanel 
      onClose={onClose} 
      participants={students.map(normalize)} 
      teacher={teacher ? normalize(teacher) : null}
      userRole={userRole}
      waitingStudents={waitingStudents}
      onAdmit={handleAdmit}
      onReject={handleReject}
      raisedHands={raisedHands}
      onClearHand={onClearHand}
      mutedParticipants={mutedParticipants}
      cameraDisabledParticipants={cameraDisabledParticipants}
      onMuteParticipant={onMuteParticipant}
      onDisableCamera={onDisableCamera}
      onRemoveParticipant={onRemoveParticipant}
      unmuteRequests={unmuteRequests}
      onAllowUnmute={onAllowUnmute}
    />
  );
}

function ControlsManager({ 
  userRole, isChatOpen, setIsChatOpen, isPeopleOpen, setIsPeopleOpen, 
  isHandRaised, setIsHandRaised, onLeave, onReaction, unreadCount = 0,
  isMutedByFaculty, isCameraDisabledByFaculty, roomId, recordingState
}) {
  const { localParticipant } = useLocalParticipant();
  
  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isVideoOff = !localParticipant?.isCameraEnabled;
  const isScreenSharing = localParticipant?.isScreenShareEnabled;

  const toggleMic = async () => {
    if (localParticipant) {
      if (isMutedByFaculty && !localParticipant.isMicrophoneEnabled) return; // Prevent turning on
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    }
  };

  const toggleCamera = async () => {
    if (localParticipant) {
      if (isCameraDisabledByFaculty && !localParticipant.isCameraEnabled) return; // Prevent turning on
      await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      if (isScreenSharing) {
        await localParticipant.setScreenShareEnabled(false);
      } else {
        await localParticipant.setScreenShareEnabled(true);
      }
    }
  };

  const handleToggleRecording = async () => {
    if (userRole !== 'teacher' && userRole !== 'admin' && userRole !== 'Faculty') return;
    
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    
    try {
      if (recordingState === 'recording' || recordingState === 'paused') {
        // Stop recording
        await fetch(`${apiUrl}/class-recordings/stop`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ roomName: roomId })
        });
      } else if (recordingState === 'idle' || recordingState === 'completed' || recordingState === 'failed') {
        // Start recording
        await fetch(`${apiUrl}/class-recordings/start`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ roomName: roomId })
        });
      }
    } catch (err) {
      console.error('Error toggling recording', err);
    }
  };

  return (
    <ClassroomControls 
      isMuted={isMuted}
      setIsMuted={toggleMic}
      isVideoOff={isVideoOff}
      setIsVideoOff={toggleCamera}
      isScreenSharing={isScreenSharing}
      setIsScreenSharing={toggleScreenShare}
      isChatOpen={isChatOpen}
      setIsChatOpen={setIsChatOpen}
      isPeopleOpen={isPeopleOpen}
      setIsPeopleOpen={setIsPeopleOpen}
      isHandRaised={isHandRaised}
      setIsHandRaised={setIsHandRaised}
      userRole={userRole}
      onLeave={onLeave}
      onReaction={onReaction}
      unreadCount={unreadCount}
      recordingState={recordingState}
      onToggleRecording={handleToggleRecording}
    />
  );
}
