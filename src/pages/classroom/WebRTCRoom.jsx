import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { webrtcService } from '../../services/webrtcService';
import { VideoOff, Users, Mic, MicOff, Video } from 'lucide-react';
import axios from 'axios';
import { getMe } from '../../services/userService';
import dark_logo from '../../assets/dark_logo_transparent.png';
import company_name from '../../assets/company_name_transparent.png';

// Components
import ChatPanel from './components/ChatPanel';
import ClassroomControls from './components/ClassroomControls';
import MainVideo from './components/MainVideo';
import ParticipantGrid from './components/ParticipantGrid';

import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants
} from '@livekit/components-react';
import { Track } from 'livekit-client';

const playSound = (type) => {
  // same implementation
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  if (type === 'accept') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'message') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'end') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }
};

export default function WebRTCRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(location.state?.user || null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loadingUser, setLoadingUser] = useState(!location.state?.user);

  useEffect(() => {
    if (!user) {
      getMe().then(res => {
        if (res?.data) {
          setUser(res.data);
          setIsTeacher(res.data.role === 'Faculty' || res.data.role === 'admin' || res.data.role === 'teacher');
        }
      }).catch(err => {
        console.error('Failed to fetch user', err);
      }).finally(() => {
        setLoadingUser(false);
      });
    } else {
      setIsTeacher(user.role === 'Faculty' || user.role === 'admin' || user.role === 'teacher');
    }
  }, [user]);

  const [lobbyStream, setLobbyStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const [hasJoined, setHasJoined] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [token, setToken] = useState('');

  const myVideoRef = useRef();

  useEffect(() => {
    if (isTeacher) return;

    const preventContext = (e) => e.preventDefault();
    const preventKeys = (e) => {
      if (
        e.key === 'PrintScreen' || 
        e.keyCode === 44 || 
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        alert("Screenshots and recording are disabled for security purposes.");
      }
    };

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
    };
  }, [isTeacher]);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const videoConstraints = isTeacher 
          ? { width: { ideal: 640, max: 640 }, height: { ideal: 480, max: 480 }, frameRate: { ideal: 15, max: 15 } }
          : { width: { ideal: 320, max: 320 }, height: { ideal: 240, max: 240 }, frameRate: { ideal: 10, max: 10 } };

        const userStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true
        });

        setLobbyStream(userStream);
      } catch (err) {
        console.error("Failed to get local media", err);
        setMediaError(`Media error: ${err.message || err.name}`);
      }
    };

    if (isTeacher !== undefined && !lobbyStream && !mediaError && !hasJoined) {
      initMedia();
    }

    return () => {
      webrtcService.disconnect();
    };
  }, [roomId, isTeacher]);

  const toggleLobbyMute = () => {
    if (lobbyStream) {
      const audioTrack = lobbyStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleLobbyVideo = () => {
    if (lobbyStream) {
      const videoTrack = lobbyStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleJoin = () => {
    if (!lobbyStream && !mediaError) return;
    setHasJoined(true);

    webrtcService.connect(roomId, user._id, user.role, user.name);

    webrtcService.onClassEnded = () => {
      playSound('end');
      alert("The host has ended this class.");
      webrtcService.disconnect();
      navigate(-1);
    };

    webrtcService.onForceKick = () => {
      playSound('end');
      alert("You have been removed from the class by the host.");
      webrtcService.disconnect();
      navigate(-1);
    };

    webrtcService.onJoinedWaitingRoom = () => {
      setIsWaiting(true);
    };

    webrtcService.onAdmitted = async () => {
      playSound('accept');
      setIsWaiting(false);
      
      // Stop lobby stream
      if (lobbyStream) lobbyStream.getTracks().forEach(t => t.stop());

      // Fetch Token
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
        alert("Failed to connect to class.");
      }
    };
  };

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
        <div className="w-12 h-12 border-4 border-slate-600 border-t-primary rounded-full animate-spin my-6"></div>
        <p className="text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  if (!hasJoined || isWaiting || !token) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full flex flex-col items-center">
          {isWaiting ? (
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4 text-center">Please wait, the meeting host will let you in soon.</h1>
              <div className="w-12 h-12 border-4 border-slate-600 border-t-primary rounded-full animate-spin my-6"></div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6">Ready to join?</h1>
              <div className="w-full max-w-md bg-black rounded-xl overflow-hidden aspect-video relative mb-6 border border-slate-700">
                {lobbyStream ? (
                  <video
                    ref={el => {
                      myVideoRef.current = el;
                      if (el && lobbyStream && el.srcObject !== lobbyStream) el.srcObject = lobbyStream;
                    }}
                    autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100"
                  />
                ) : mediaError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-red-400 bg-red-950/30">
                    <VideoOff size={48} className="mb-4 opacity-50" />
                    <p>{mediaError}</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-slate-400 animate-pulse">Requesting permissions...</span>
                  </div>
                )}

                {lobbyStream && (
                  <div className="absolute bottom-4 flex w-full justify-center gap-4">
                    <button onClick={toggleLobbyMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} transition`}>
                      <MicOff size={20} className={!isMuted ? 'hidden' : ''} />
                      <Mic size={20} className={isMuted ? 'hidden' : ''} />
                    </button>
                    <button onClick={toggleLobbyVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} transition`}>
                      <VideoOff size={20} className={!isVideoOff ? 'hidden' : ''} />
                      <Video size={20} className={isVideoOff ? 'hidden' : ''} />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleJoin}
                disabled={!lobbyStream && !mediaError}
                className={`px-8 py-3 rounded-full font-bold text-lg transition ${!lobbyStream && !mediaError ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white'
                  }`}
              >
                {mediaError ? 'Join Without Media' : 'Join Class'}
              </button>

              <button onClick={() => navigate(-1)} className="mt-4 text-slate-400 hover:text-white transition">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={!isVideoOff}
      audio={!isMuted}
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      connect={true}
      options={{ adaptiveStream: true, dynacast: true }}
      className="flex flex-col h-screen bg-slate-900 text-white relative"
    >
      <ActiveStudentClassroom 
         user={user} 
         roomId={roomId} 
         isTeacher={isTeacher} 
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function ActiveStudentClassroom({ user, roomId, isTeacher }) {
  const navigate = useNavigate();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });

  const [isTabFocused, setIsTabFocused] = useState(true);

  // Tab Focus Anti-Recording mechanism
  useEffect(() => {
    if (isTeacher) return;

    const handleFocusChange = () => {
      // document.hidden covers switching tabs/minimizing
      // !document.hasFocus() covers clicking on another window/monitor
      if (document.hidden || !document.hasFocus()) {
        setIsTabFocused(false);
      } else {
        setIsTabFocused(true);
      }
    };

    window.addEventListener('visibilitychange', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);
    window.addEventListener('focus', handleFocusChange);

    // Initial check
    handleFocusChange();

    return () => {
      window.removeEventListener('visibilitychange', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);
      window.removeEventListener('focus', handleFocusChange);
    };
  }, [isTeacher]);

  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingSessionIdRef = useRef(null);
  const chunkIndexRef = useRef(0);

  const chatOpenRef = useRef(chatOpen);
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

  useEffect(() => {
    if (chatOpen) setUnreadChatCount(0);
  }, [chatOpen]);

  useEffect(() => {
    webrtcService.onChat = (data) => {
      setMessages(prev => [...prev, data]);
      if (data.senderId !== user._id) {
        playSound('message');
        if (!chatOpenRef.current) {
          setUnreadChatCount(prev => prev + 1);
        }
      }
    };

    webrtcService.onHandRaise = (data) => {
      console.log('Hand raised by', data.name);
      setMessages(prev => [...prev, { senderId: 'system', name: 'System', role: 'system', message: `${data.name} raised hand!`, timestamp: new Date() }]);
    };

    webrtcService.onForceMute = () => {
       localParticipant.setMicrophoneEnabled(false);
    };

  }, [user._id, localParticipant]);

  const toggleMute = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
  }, [localParticipant]);

  const toggleVideo = useCallback(() => {
    localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
  }, [localParticipant]);

  const toggleScreenShare = useCallback(async () => {
    localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
  }, [localParticipant]);

  const toggleRecording = useCallback(async () => {
    if (!isRecording) {
      recordingSessionIdRef.current = `sess-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      chunkIndexRef.current = 0;
      
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/webrtc/recording/start`, {
          recordingSessionId: recordingSessionIdRef.current,
          roomId,
          teacherId: user._id
        });
      } catch (err) {
        console.error("Failed to start recording session", err);
        alert("Failed to start recording on server.");
        return;
      }

      try {
         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
         mediaRecorderRef.current = new MediaRecorder(screenStream, { mimeType: 'video/webm' });

         mediaRecorderRef.current.ondataavailable = async (e) => {
           if (e.data.size > 0) {
              const chunkBlob = e.data;
              const formData = new FormData();
              formData.append('chunk', chunkBlob, `chunk.webm`);
              formData.append('recordingSessionId', recordingSessionIdRef.current);
              formData.append('chunkIndex', chunkIndexRef.current);
              
              const currentIndex = chunkIndexRef.current;
              chunkIndexRef.current++;

              try {
                await axios.post(`${import.meta.env.VITE_API_URL}/webrtc/recording/chunk`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
              } catch (err) {
                console.error("Failed to upload chunk", currentIndex, err);
              }
           }
         };

         mediaRecorderRef.current.onstop = async () => {
           try {
             setTimeout(async () => {
                await axios.post(`${import.meta.env.VITE_API_URL}/webrtc/recording/finalize`, {
                  recordingSessionId: recordingSessionIdRef.current
                });
                alert('Recording finalized and saved successfully!');
             }, 1000);
           } catch (err) {
             console.error("Failed to finalize recording", err);
             alert('Failed to finalize recording on server.');
           }
           screenStream.getTracks().forEach(t => t.stop());
         };

         mediaRecorderRef.current.start(10000); 
         setIsRecording(true);
      } catch (err) {
         console.error(err);
      }
    } else {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, roomId, user]);

  const leaveRoom = useCallback(() => {
    webrtcService.disconnect();
    navigate(-1);
  }, [navigate]);

  const sendChat = useCallback((text) => {
    webrtcService.sendChat(text);
  }, []);

  const [isHandRaised, setIsHandRaised] = useState(false);

  const raiseHand = useCallback(() => {
    webrtcService.raiseHand();
    setIsHandRaised(true);
    // Auto-lower hand after 5 seconds to allow raising again
    setTimeout(() => {
      setIsHandRaised(false);
    }, 5000);
  }, []);
  
  const toggleChat = useCallback(() => {
    setChatOpen(prev => !prev);
  }, []);

  // Main track is teacher's screen share OR teacher's camera
  const teacherScreen = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.ScreenShare);
  const teacherCam = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
  const mainTrack = teacherScreen || teacherCam;

  return (
    <div className="h-screen w-full bg-[#030919] text-white flex flex-col font-sans overflow-hidden relative">
      
      {/* Anti-Recording Blackout Overlay */}
      {!isTeacher && !isTabFocused && (
        <div className="absolute inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-950/40 p-8 rounded-2xl border border-red-500/50 max-w-lg">
            <h2 className="text-3xl font-black text-red-500 mb-4 tracking-wider">ATTENTION</h2>
            <p className="text-xl text-slate-200 mb-2 font-medium">
              You have clicked away from the classroom.
            </p>
            <p className="text-slate-400 text-sm">
              For security and piracy prevention, the video feed has been hidden. Please click back into this window to resume the live class.
            </p>
            <button 
              onClick={() => setIsTabFocused(true)}
              className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition shadow-lg shadow-red-600/30"
            >
              Resume Class
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-[#030919] border-b border-slate-800 flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center h-full pt-1">
             <img src={dark_logo} alt="Logo" className="h-10 w-auto drop-shadow-md" />
             <img src={company_name} alt="Company Name" className="h-8 w-auto ml-2 drop-shadow-md hidden sm:block" />
          </div>
          
          <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block"></div>

          <div className="hidden md:flex items-center gap-4">
            <div className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-wide">Live Classroom</h1>
              <p className="text-[10px] text-slate-400 font-medium">Role: {isTeacher ? 'Host' : 'Student'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-2 font-semibold">
            <Users size={14} className="text-accent" /> {participants.length} Participants
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">

        {/* Video Area */}
        <div className={`flex flex-col p-2 md:p-4 relative bg-[#01040A] transition-all duration-300 ${chatOpen && !isTeacher ? 'h-[35%] md:h-auto md:flex-1' : 'flex-1'}`}>

          {/* Main Video View */}
          <MainVideo 
            screenTrack={teacherScreen} 
            cameraTrack={teacherCam} 
            isTeacher={isTeacher} 
            user={user} 
          />

          {/* Picture in Picture / Grid of other students */}
          <ParticipantGrid 
            isTeacher={isTeacher} 
            tracks={tracks}
            localParticipant={localParticipant}
          />
        </div>

        {/* Sidebar (Chat / Participants) */}
        {chatOpen && (
          <ChatPanel 
            messages={messages} 
            user={user} 
            onSendChat={sendChat} 
          />
        )}
      </div>

      {/* Control Bar */}
      <ClassroomControls 
        isTeacher={isTeacher}
        isMuted={!localParticipant.isMicrophoneEnabled}
        isVideoOff={!localParticipant.isCameraEnabled}
        isScreenSharing={localParticipant.isScreenShareEnabled}
        isRecording={isRecording}
        isHandRaised={isHandRaised}
        chatOpen={chatOpen}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onRaiseHand={raiseHand}
        onLeaveRoom={leaveRoom}
        onToggleChat={toggleChat}
        unreadChatCount={unreadChatCount}
      />
    </div>
  );
}
