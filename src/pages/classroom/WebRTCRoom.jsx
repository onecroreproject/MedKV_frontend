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

import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  useIsSpeaking,
  useChat,
  GridLayout,
  ParticipantTile
} from '@livekit/components-react';
import {
  Track,
  VideoPresets,
  AudioPresets,
} from 'livekit-client';

// ─── Low-latency LiveKit room options ────────────────────────────────────────
// These are shared between host and participant instances.
const LOW_LATENCY_OPTIONS = {
  // Enable adaptive bitrate (adjusts to network conditions per subscriber)
  adaptiveStream: true,
  // Dynacast: only encode/send layers that subscribers actually need
  dynacast: true,
  // Stop local tracks when unpublished so the OS releases camera/mic immediately
  stopLocalTrackOnUnpublish: true,
  // Reconnect quickly without full renegotiation
  reconnectPolicy: {
    nextRetryDelayInMs: (context) => {
      if (context.retryCount === 0) return 300;
      if (context.retryCount < 4)  return 1000 * context.retryCount;
      return null; // give up after 4 retries
    },
  },
  // Audio publish defaults: Opus with all processing enabled for lowest latency
  audioCaptureDefaults: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  audioOutput: {
    deviceId: 'default',
  },
  publishDefaults: {
    // Use Opus for audio — lowest latency codec
    audioPreset: AudioPresets.music,
    // Prefer AV1 for high-fidelity imaging (PACS) with simulcast for adaptive quality
    videoCodec: 'av1',
    simulcast: true,
    // Host broadcasts at up to 720p; participants at 360p
    videoEncoding: {
      maxBitrate: 1_500_000,
      maxFramerate: 30,
    },
    // Screen share: high quality, no simulcast needed
    screenShareEncoding: {
      maxBitrate: 3_000_000,
      maxFramerate: 30,
    },
    dtx: true,   // Discontinuous Transmission — saves bandwidth during silence
    red: true,   // Redundant audio packets — recovers from packet loss
  },
};

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
  const [isMuted, setIsMuted] = useState(true);     // mic OFF by default
  const [isVideoOff, setIsVideoOff] = useState(true); // camera OFF by default
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
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
          : { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } };

        const userStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
          }
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
      
      // Fetch Token FIRST — then stop lobby (avoids camera/mic gap)
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/live-classes/token/livekit`, {
          roomId,
          participantName: user.name,
          role: user.role
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Stop lobby AFTER token is ready so LiveKit picks up immediately
        if (lobbyStream) lobbyStream.getTracks().forEach(t => t.stop());
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
              <button 
                onClick={() => navigate(-1)} 
                className="mt-4 px-6 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
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
      options={LOW_LATENCY_OPTIONS}
      className="flex flex-col h-screen bg-slate-900 text-white relative"
      data-lk-theme="default"
    >
      <ActiveStudentClassroom 
         user={user} 
         roomId={roomId} 
         isTeacher={isTeacher} 
      />
      {/* RoomAudioRenderer: renders all remote audio tracks with zero-delay */}
      <RoomAudioRenderer volume={1.0} />
    </LiveKitRoom>
  );
}

const VoiceIndicator = ({ participant }) => {
  if (!participant) return null;
  const isSpeaking = useIsSpeaking(participant);
  if (!isSpeaking) return null;
  return (
    <>
      <style>{`
        @keyframes danceBar {
          0% { transform: scaleY(0.3); opacity: 0.8; }
          100% { transform: scaleY(1.2); opacity: 1; }
        }
        .dancing-bar {
          animation: danceBar 0.4s ease-in-out infinite alternate;
          transform-origin: bottom;
        }
      `}</style>
      <div className="absolute top-2 right-2 flex gap-1 items-end bg-black/60 px-2 py-1.5 rounded-md z-20 shadow border border-white/10 h-8">
        <div className="w-1.5 h-3.5 bg-green-400 rounded-full dancing-bar" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-5 bg-green-400 rounded-full dancing-bar" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-4 bg-green-400 rounded-full dancing-bar" style={{ animationDelay: '300ms' }} />
      </div>
    </>
  );
};

const DraggableLocalVideo = ({ participant, allTracks }) => {
  const [pos, setPos] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Keep it within bounds on resize
    const handleResize = () => {
      setPos(prev => ({
        x: Math.min(prev.x, window.innerWidth - 220),
        y: Math.min(prev.y, window.innerHeight - 150)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cameraTrack = allTracks?.find(t => t.participant.identity === participant?.identity && t.source === Track.Source.Camera);

  if (!participant?.isCameraEnabled && !cameraTrack) return null;

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className="fixed z-50 rounded-lg overflow-hidden border-2 border-slate-600 shadow-2xl bg-black cursor-move group"
      style={{ 
        width: 200, 
        height: 112, 
        left: pos.x, 
        top: pos.y,
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <VoiceIndicator participant={participant} />
      {cameraTrack ? (
        <ParticipantTile trackRef={cameraTrack} style={{ height: '100%', width: '100%', pointerEvents: 'none' }} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-800">
           <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-lg font-bold text-slate-300">
              {participant?.name ? participant.name.substring(0, 2).toUpperCase() : 'ME'}
           </div>
        </div>
      )}
    </div>
  );
};

function ActiveStudentClassroom({ user, roomId, isTeacher }) {
  const navigate = useNavigate();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const participants = useParticipants();
  // Find the teacher participant
  const teacherParticipant = participants.find(p => {
    try {
      const meta = JSON.parse(p.metadata || '{}');
      return meta.isTeacher === true;
    } catch (e) {
      return false;
    }
  });

  const allTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });
  const teacherTracks = allTracks.filter(t => t.participant.identity === teacherParticipant?.identity);
  
  const studentParticipants = participants.filter(p => p.identity !== teacherParticipant?.identity);

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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const mainVideoWrapperRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mainVideoWrapperRef.current?.requestFullscreen) {
        mainVideoWrapperRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingSessionIdRef = useRef(null);
  const chunkIndexRef = useRef(0);

  const chatOpenRef = useRef(chatOpen);
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

  const { send: sendChatMessage, chatMessages } = useChat();

  useEffect(() => {
    if (chatOpen) setUnreadChatCount(0);
  }, [chatOpen]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg.from?.identity !== user.name) {
        playSound('message');
        if (!chatOpenRef.current) {
          setUnreadChatCount(prev => prev + 1);
        }
      }
    }
  }, [chatMessages.length, user.name]);

  useEffect(() => {
    webrtcService.onHandRaise = (data) => {
      console.log('Hand raised by', data.name);
      setMessages(prev => [...prev, { senderId: 'system', name: 'System', role: 'system', message: `${data.name} raised hand!`, timestamp: new Date() }]);
    };

    webrtcService.onForceMute = () => {
       localParticipant.setMicrophoneEnabled(false);
       setMessages(prev => [...prev, { senderId: 'system', name: 'System', role: 'system', message: 'The Host has muted your microphone.', timestamp: new Date() }]);
    };

    webrtcService.onForceUnmute = () => {
       localParticipant.setMicrophoneEnabled(true);
       setMessages(prev => [...prev, { senderId: 'system', name: 'System', role: 'system', message: 'The Host has unmuted your microphone.', timestamp: new Date() }]);
    };

    webrtcService.onForceCameraOff = () => {
       localParticipant.setCameraEnabled(false);
       setMessages(prev => [...prev, { senderId: 'system', name: 'System', role: 'system', message: 'The Host has turned off your camera.', timestamp: new Date() }]);
    };

    webrtcService.onForceCameraOn = () => {
       localParticipant.setCameraEnabled(true);
       setMessages(prev => [...prev, { senderId: 'system', name: 'System', role: 'system', message: 'The Host has requested to turn on your camera.', timestamp: new Date() }]);
    };

    webrtcService.onForceKick = () => {
       navigate('/courses');
    };

  }, [user._id, localParticipant, navigate]);



  const toggleMute = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const toggleVideo = useCallback(async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [localParticipant, isCameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  }, [localParticipant, isScreenShareEnabled]);

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
    sendChatMessage(text);
  }, [sendChatMessage]);

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

  // Using GridLayout instead of mainTrack

  return (
    <div className="h-[100dvh] w-full bg-[#030919] text-white flex flex-col font-sans overflow-hidden relative">
      
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
          <span className="bg-red-950/40 text-red-500 text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-red-500/30 flex items-center gap-2 font-bold tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
            LIVE {participants.length}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">

        {/* Video Area */}
        <div className={`flex flex-col p-2 md:p-4 relative bg-[#01040A] transition-all duration-300 ${chatOpen && !isTeacher ? 'h-[35%] md:h-auto md:flex-1' : 'flex-1'}`}>

          {/* Main Video Wrapper */}
          <div ref={mainVideoWrapperRef} className="flex-1 flex flex-col gap-2 rounded-xl overflow-hidden relative border border-slate-700 bg-black p-1">
            
            {/* Main Screen: Admin (Host) ALWAYS */}
            <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-slate-800 group teacher-video-wrapper">
              <style>{`
                .teacher-video-wrapper video {
                  transform: scaleX(1) !important;
                }
              `}</style>
              {teacherParticipant && <VoiceIndicator participant={teacherParticipant} />}
              {teacherTracks.length > 0 ? (
                <GridLayout tracks={teacherTracks} style={{ height: '100%', width: '100%' }}>
                  <ParticipantTile />
                </GridLayout>
              ) : teacherParticipant ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4 relative">
                  <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-bold text-slate-300 shadow-xl border-4 border-slate-800">
                    {teacherParticipant.name ? teacherParticipant.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm flex items-center gap-2">
                    <MicOff size={14} className="text-red-400" />
                    {teacherParticipant.name || 'Teacher'}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-full animate-pulse"></div>
                  <p className="font-medium animate-pulse">Waiting for Teacher to join...</p>
                </div>
              )}
            </div>

            {/* No Horizontal Scroll Row for Students - Replaced by Draggable Local Video */}
          </div>
        </div>

        {/* Sidebar (Chat / Participants) */}
        {chatOpen && (
          <ChatPanel 
            messages={chatMessages} 
            user={user} 
            onSendChat={sendChat} 
          />
        )}
      </div>

      {/* Floating Local Draggable Video */}
      <DraggableLocalVideo participant={localParticipant} allTracks={allTracks} />

      {/* Control Bar */}
      <ClassroomControls 
        isTeacher={isTeacher}
        isMuted={!isMicrophoneEnabled}
        isVideoOff={!isCameraEnabled}
        isScreenSharing={isScreenShareEnabled}
        isRecording={isRecording}
        isHandRaised={isHandRaised}
        chatOpen={chatOpen}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onRaiseHand={raiseHand}
        onLeaveRoom={leaveRoom}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}
