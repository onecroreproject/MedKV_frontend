import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getMe } from '../../services/userService';
import { LiveKitRoom, RoomAudioRenderer, useRoomContext, useLocalParticipant, useTracks, useParticipants } from '@livekit/components-react';
import { Track, VideoPresets, AudioPresets } from 'livekit-client';

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

  // Initialize Realtime Hook
  const { 
    raisedHands, 
    recentReactions, 
    toggleHand, 
    clearHand, 
    sendReaction 
  } = useClassroomRealtime(roomId, user);

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

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isHandRaised = raisedHands.includes(user?._id || user?.id);

  const handleToggleHand = () => {
    toggleHand(!isHandRaised);
  };

  return (
    <>
      <HeaderManager duration={duration} />

      <div className="flex-1 flex overflow-hidden relative">
        <StageManager 
          isHandRaised={isHandRaised} 
          raisedHands={raisedHands}
          recentReactions={recentReactions}
        />
        
        {isChatOpen && (
          <ChatPanel 
            onClose={() => setIsChatOpen(false)} 
            onSendMessage={(msg) => triggerToast(msg)}
          />
        )}
        
        {isPeopleOpen && (
          <PeoplePanelManager 
            onClose={() => setIsPeopleOpen(false)} 
            userRole={userRole}
            admissionService={admissionService}
            roomId={roomId}
            user={user}
            raisedHands={raisedHands}
            onClearHand={clearHand}
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

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 fade-in">
            <span className="font-semibold text-sm text-blue-400">{toastMessage.sender}</span>
            <span className="text-sm text-slate-200 mt-1">{toastMessage.text}</span>
          </div>
        )}
      </div>

      <ControlsManager 
        userRole={userRole}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        isPeopleOpen={isPeopleOpen}
        setIsPeopleOpen={setIsPeopleOpen}
        isHandRaised={isHandRaised}
        setIsHandRaised={handleToggleHand}
        onLeave={handleLeave}
        onReaction={sendReaction}
      />
      <RoomAudioRenderer />
    </>
  );
}

function HeaderManager({ duration }) {
  const participants = useParticipants();
  return (
    <ClassroomHeader 
      title="Dr. Sam Reefath Radiology Class" 
      duration={duration} 
      participantCount={participants.length}
    />
  );
}

function StageManager({ isHandRaised, raisedHands = [] }) {
  const participants = useParticipants();
  const [pinnedParticipantId, setPinnedParticipantId] = useState(null);
  
  // Find screen share track
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const isScreenSharing = screenShareTracks.length > 0;
  
  // Separate teacher and students
  const teacher = participants.find(p => p.identity.includes('teacher') || p.identity.includes('admin') || p.identity.includes('faculty') || (p.metadata && JSON.parse(p.metadata).role === 'teacher'));
  const students = participants.filter(p => p.identity !== teacher?.identity);

  // Normalize participants — hand state driven by authoritative raisedHands array
  const normalize = (p) => {
    if (!p) return null;
    return {
      id: p.identity,
      name: p.name || p.identity,
      isMuted: !p.isMicrophoneEnabled,
      isSpeaking: p.isSpeaking,
      participantIdentity: p.identity,
      lkParticipant: p, 
      isHandRaised: raisedHands.includes(p.identity)
    };
  };

  const normalizedTeacher = normalize(teacher);
  const normalizedStudents = students.map(normalize);

  return (
    <VideoStage 
      isScreenSharing={isScreenSharing} 
      screenShareTrack={screenShareTracks[0]}
      participants={normalizedStudents} 
      teacher={normalizedTeacher} 
      pinnedParticipantId={pinnedParticipantId}
      setPinnedParticipantId={setPinnedParticipantId}
    />
  );
}

function PeoplePanelManager({ onClose, userRole, admissionService, roomId, user, raisedHands = [], onClearHand }) {
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
      admissionService.getWaitingStudents(roomId, user?._id || user?.id, user?.role);
    }
  }, [userRole, admissionService, roomId, user]);

  const handleAdmit = (targetUserId) => {
    admissionService.admitStudent(roomId, user?._id || user?.id, user?.role, targetUserId);
  };
  
  const handleReject = (targetUserId) => {
    admissionService.rejectStudent(roomId, user?._id || user?.id, user?.role, targetUserId);
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
    />
  );
}

function ControlsManager({ userRole, isChatOpen, setIsChatOpen, isPeopleOpen, setIsPeopleOpen, isHandRaised, setIsHandRaised, onLeave, onReaction }) {
  const { localParticipant } = useLocalParticipant();
  
  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isVideoOff = !localParticipant?.isCameraEnabled;
  const isScreenSharing = localParticipant?.isScreenShareEnabled;

  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    }
  };

  const toggleCamera = async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      if (isScreenSharing) {
        await localParticipant.setScreenShareEnabled(false);
      } else {
        await localParticipant.setScreenShareEnabled(true, {
           resolution: VideoPresets.h1080.resolution,
        });
      }
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
    />
  );
}
