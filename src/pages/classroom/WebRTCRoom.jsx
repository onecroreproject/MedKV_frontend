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
import MainVideo from './components/MainVideo';
import ParticipantGrid from './components/ParticipantGrid';
import ClassroomControls from './components/ClassroomControls';

const playSound = (type) => {
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

  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [hasJoined, setHasJoined] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);

  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (user && participants.length === 0) {
      setParticipants([
        { id: user._id || 'local', name: (user.name || 'Unknown') + (isTeacher ? ' (Teacher)' : ' (You)'), role: user.role }
      ]);
    }
  }, [user, isTeacher]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingSessionIdRef = useRef(null);
  const chunkIndexRef = useRef(0);

  const myVideoRef = useRef();

  // Anti-recording & Piracy prevention for Students
  useEffect(() => {
    if (isTeacher) return;

    const preventContext = (e) => e.preventDefault();
    const preventKeys = (e) => {
      // PrintScreen (44), F12, Ctrl+Shift+I, Cmd+Shift+I, Ctrl+C, Ctrl+U
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
    // 1. Get local media for lobby preview
    const initMedia = async () => {
      try {
        // Apply Phase 2 explicit constraints
        const videoConstraints = isTeacher 
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 24 } }
          : { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15, max: 15 } };

        const userStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true
        });

        setStream(userStream);
      } catch (err) {
        console.error("Failed to get local media", err);
        if (err.name === 'NotReadableError') {
          setMediaError("Your camera or microphone is currently being used by another application (like Zoom or OBS). Please close it and refresh.");
        } else if (err.name === 'NotFoundError') {
          setMediaError("No camera or microphone found on your device.");
        } else if (err.name === 'NotAllowedError') {
          setMediaError("Camera/Microphone access denied. Please allow permissions in your browser to join.");
        } else {
          // Fallback to basic constraints if advanced constraints fail (OverconstrainedError)
          try {
             const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
             setStream(fallbackStream);
             return;
          } catch(fallbackErr) {
             setMediaError(`Media error: ${err.message || err.name}`);
          }
        }
      }
    };

    if (isTeacher !== undefined && !stream && !mediaError) {
      initMedia();
    }

    return () => {
      webrtcService.disconnect();
    };
  }, [roomId, isTeacher]); // Only re-run if isTeacher is loaded

  const handleJoin = () => {
    if (!stream && !mediaError) return;
    setHasJoined(true);

    // 2. Connect to Socket
    webrtcService.connect(roomId, user._id, user.role, user.name);

    webrtcService.onChat = (data) => {
      setMessages(prev => [...prev, data]);
      if (data.senderId !== user._id) {
        playSound('message');
      }
    };

    webrtcService.onTrack = (socketId, remoteStream) => {
      setRemoteStreams(prev => ({ ...prev, [socketId]: remoteStream }));
    };

    webrtcService.onParticipantsUpdate = (socketId, isJoining, participant) => {
      if (isJoining) {
        setParticipants(prev => {
          if (!prev.find(p => p.id === socketId)) {
            return [...prev, { id: socketId, ...participant }];
          }
          return prev;
        });
      } else {
        setParticipants(prev => prev.filter(p => p.id !== socketId));
        setRemoteStreams(prev => {
          const updated = { ...prev };
          delete updated[socketId];
          return updated;
        });
      }
    };

    webrtcService.onHandRaise = (data) => {
      console.log('Hand raised by', data.name);
      setMessages(prev => [...prev, { senderId: 'system', name: 'System', role: 'system', message: `${data.name} raised hand!`, timestamp: new Date() }]);
    };

    webrtcService.onClassEnded = () => {
      playSound('end');
      alert("The host has ended this class.");
      webrtcService.disconnect();
      if (stream) stream.getTracks().forEach(t => t.stop());
      navigate(-1);
    };

    webrtcService.onForceKick = () => {
      playSound('end');
      alert("You have been removed from the class by the host.");
      webrtcService.disconnect();
      if (stream) stream.getTracks().forEach(t => t.stop());
      navigate(-1);
    };

    webrtcService.onForceMute = () => {
      setIsMuted(true);
      if (stream) {
        stream.getAudioTracks().forEach(t => t.enabled = false);
        webrtcService.emitMediaState(true, isVideoOff);
      }
    };

    webrtcService.onJoinedWaitingRoom = () => {
      setIsWaiting(true);
    };

    webrtcService.onAdmitted = () => {
      playSound('accept');
      setIsWaiting(false);
      // Initialize WebRTC now that we are admitted
      webrtcService.initStudent(stream, (teacherData) => {
        setParticipants(prev => {
           if (!prev.find(p => p.id === teacherData.socketId)) {
               return [...prev, { id: teacherData.socketId, name: teacherData.name, role: 'teacher' }];
           }
           return prev;
        });
      });
    };

    if (isTeacher) {
      webrtcService.initTeacher(stream, (studentData) => {
        setParticipants(prev => {
           if (!prev.find(p => p.id === studentData.socketId)) {
               return [...prev, { id: studentData.socketId, name: studentData.name, role: 'student' }];
           }
           return prev;
        });
      });
    }
    // Student initialization happens when admitted
  };

  const toggleMute = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);

        const videoTrack = stream.getVideoTracks()[0];
        const vOff = videoTrack ? !videoTrack.enabled : true;
        webrtcService.updateMediaState(!audioTrack.enabled, vOff);
      }
    }
  }, [stream, isVideoOff]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);

        const audioTrack = stream.getAudioTracks()[0];
        const mOff = audioTrack ? !audioTrack.enabled : true;
        webrtcService.updateMediaState(mOff, !videoTrack.enabled);
      }
    }
  }, [stream, isMuted]);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        webrtcService.setLocalStream(screenStream);
        setIsScreenSharing(true);
        setStream(screenStream);

        screenStream.getVideoTracks()[0].onended = () => {
          webrtcService.setLocalStream(stream);
          setIsScreenSharing(false);
          setStream(stream); // revert
        };
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      webrtcService.setLocalStream(stream);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing, stream]);

  // Phase 3 chunked uploading implementation
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

      const streamToRecord = stream;
      mediaRecorderRef.current = new MediaRecorder(streamToRecord, { mimeType: 'video/webm' });

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
          // Wait briefly for the last ondataavailable to fire and upload
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
      };

      // Generate a chunk every 10 seconds (10000ms)
      mediaRecorderRef.current.start(10000); 
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, stream, roomId, user]);

  const leaveRoom = useCallback(() => {
    webrtcService.disconnect();
    if (stream) stream.getTracks().forEach(t => t.stop());
    navigate(-1);
  }, [stream, navigate]);

  const sendChat = useCallback((text) => {
    webrtcService.sendChat(text);
  }, []);

  const raiseHand = useCallback(() => {
    webrtcService.raiseHand();
  }, []);
  
  const toggleChat = useCallback(() => {
    setChatOpen(prev => !prev);
  }, []);

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
        <div className="w-12 h-12 border-4 border-slate-600 border-t-primary rounded-full animate-spin my-6"></div>
        <p className="text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  if (!hasJoined || isWaiting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full flex flex-col items-center">
          {isWaiting ? (
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4 text-center">Please wait, the meeting host will let you in soon.</h1>
              <div className="w-12 h-12 border-4 border-slate-600 border-t-primary rounded-full animate-spin my-6"></div>
              <p className="text-slate-400">Classroom: {roomId}</p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6">Ready to join?</h1>
              <div className="w-full max-w-md bg-black rounded-xl overflow-hidden aspect-video relative mb-6 border border-slate-700">
                {stream ? (
                  <video
                    ref={el => {
                      myVideoRef.current = el;
                      if (el && stream) el.srcObject = stream;
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

                {stream && (
                  <div className="absolute bottom-4 flex w-full justify-center gap-4">
                    <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} transition`}>
                      <MicOff size={20} className={!isMuted ? 'hidden' : ''} />
                      <Mic size={20} className={isMuted ? 'hidden' : ''} />
                    </button>
                    <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} transition`}>
                      <VideoOff size={20} className={!isVideoOff ? 'hidden' : ''} />
                      <Video size={20} className={isVideoOff ? 'hidden' : ''} />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleJoin}
                disabled={!stream && !mediaError}
                className={`px-8 py-3 rounded-full font-bold text-lg transition ${!stream && !mediaError ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white'
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

  // Calculate Main Video Stream (Teacher for students, Self for teacher)
  const mainStream = isTeacher ? stream : (Object.keys(remoteStreams).length > 0 ? Object.values(remoteStreams)[0] : null);

  return (
    <div className="h-screen w-full bg-[#030919] text-white flex flex-col font-sans overflow-hidden">
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
              <h1 className="text-sm font-bold text-slate-100 tracking-wide">Classroom {roomId}</h1>
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
          <MainVideo stream={mainStream} isTeacher={isTeacher} user={user} />

          {/* Picture in Picture / Grid of other students */}
          <ParticipantGrid 
            isTeacher={isTeacher} 
            remoteStreams={remoteStreams} 
            participants={participants} 
            stream={stream} 
            isMuted={isMuted} 
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
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        chatOpen={chatOpen}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onRaiseHand={raiseHand}
        onLeaveRoom={leaveRoom}
        onToggleChat={toggleChat}
      />
    </div>
  );
}
