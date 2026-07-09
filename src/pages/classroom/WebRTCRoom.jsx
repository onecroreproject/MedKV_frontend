import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { webrtcService } from '../../services/webrtcService';
import { Mic, MicOff, Video, VideoOff, MonitorUp, SquareSquare, PhoneOff, MessageSquare, Hand, Users, Circle, Square, Maximize, Minimize } from 'lucide-react';
import axios from 'axios';
import { getMe } from '../../services/userService';
import dark_logo from '../../assets/dark_logo_transparent.png';
import company_name from '../../assets/company_name_transparent.png';

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
  const [chatInput, setChatInput] = useState('');

  const mainVideoWrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const recordedChunks = useRef([]);

  const myVideoRef = useRef();
  const mainVideoRef = useRef(); // Usually the teacher's video for students

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mainVideoWrapperRef.current?.requestFullscreen) {
        mainVideoWrapperRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        setStream(userStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error("Failed to get local media", err);
        if (err.name === 'NotReadableError') {
          setMediaError("Your camera or microphone is currently being used by another application (like Zoom or OBS). Please close it and refresh.");
        } else if (err.name === 'NotFoundError') {
          setMediaError("No camera or microphone found on your device.");
        } else if (err.name === 'NotAllowedError') {
          setMediaError("Camera/Microphone access denied. Please allow permissions in your browser to join.");
        } else {
          setMediaError(`Media error: ${err.message || err.name}`);
        }
      }
    };

    initMedia();

    return () => {
      webrtcService.disconnect();
    };
  }, [roomId]);

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
        setParticipants(prev => [...prev, { id: socketId, ...participant }]);
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
        setParticipants(prev => [...prev, { id: teacherData.socketId, name: teacherData.name, role: 'teacher' }]);
      });
    };

    if (isTeacher) {
      webrtcService.initTeacher(stream, (studentData) => {
        setParticipants(prev => [...prev, { id: studentData.socketId, name: studentData.name, role: 'student' }]);
      });
    }
    // Student initialization happens when admitted
  };

  const toggleMute = () => {
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
  };

  const toggleVideo = () => {
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
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
        webrtcService.setLocalStream(screenStream);
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          if (myVideoRef.current) myVideoRef.current.srcObject = stream;
          webrtcService.setLocalStream(stream);
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      webrtcService.setLocalStream(stream);
      setIsScreenSharing(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      recordedChunks.current = [];
      // Combine screen and audio if sharing, else standard stream
      const streamToRecord = myVideoRef.current.srcObject || stream;
      mediaRecorderRef.current = new MediaRecorder(streamToRecord, { mimeType: 'video/webm' });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('recording', blob, `recording-${roomId}.webm`);
        formData.append('roomId', roomId);
        formData.append('teacherId', user._id);

        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/webrtc/upload-recording`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          alert('Recording uploaded successfully!');
        } catch (err) {
          console.error("Failed to upload recording", err);
          alert('Failed to upload recording to server.');
          // Fallback: download locally
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup-recording-${roomId}.webm`;
          a.click();
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const leaveRoom = () => {
    webrtcService.disconnect();
    if (stream) stream.getTracks().forEach(t => t.stop());
    navigate(-1);
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    webrtcService.sendChat(chatInput);
    setChatInput('');
  };

  const raiseHand = () => {
    webrtcService.raiseHand();
  };

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
                    autoPlay playsInline muted className="w-full h-full object-cover"
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
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} transition`}>
                      {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
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

          {/* Main Video View (Teacher for Students, or Active Speaker) */}
          <div ref={mainVideoWrapperRef} className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-2xl group">
            {isTeacher ? (
              // Teacher sees their own main video
              <video
                ref={el => {
                  myVideoRef.current = el;
                  if (el && stream) el.srcObject = stream;
                }}
                autoPlay playsInline muted className="w-full h-full object-contain"
              />
            ) : (
              // Student sees the teacher's video
              <video
                ref={el => {
                  mainVideoRef.current = el;
                  if (el && Object.keys(remoteStreams).length > 0) {
                    el.srcObject = Object.values(remoteStreams)[0];
                  }
                }}
                autoPlay playsInline className="w-full h-full object-contain"
              />
            )}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/10 shadow-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              {isTeacher ? 'You (Broadcasting)' : 'Teacher'}
            </div>
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/80 rounded-lg transition-all text-slate-300 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            {/* Dynamic Forensic Watermark for Students */}
            {!isTeacher && user && (
              <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
                 <div className="absolute text-white/30 text-2xl font-black uppercase tracking-widest whitespace-nowrap animate-watermark mix-blend-overlay drop-shadow-md">
                    {user?.email} • {user?._id?.substring(0, 8)}
                 </div>
              </div>
            )}
          </div>

          {/* Picture in Picture / Grid of other students (Only for Teacher mainly, or self view for student) */}
          <div className={!isTeacher ? "absolute bottom-4 right-4 md:bottom-8 md:right-8 w-24 md:w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl z-20 group" : "flex gap-2 mt-4 overflow-x-auto pb-2 h-36"}>
            {!isTeacher && (
                <div className="w-full h-full bg-black relative">
                  <video
                    ref={el => {
                      myVideoRef.current = el;
                      if (el && stream) el.srcObject = stream;
                    }}
                    autoPlay playsInline muted className="w-full h-full absolute inset-0 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-sm">
                    You
                    {isMuted && <MicOff size={10} className="text-red-400" />}
                  </div>
                </div>
            )}

            {isTeacher && Object.keys(remoteStreams).map(socketId => {
              const participant = participants.find(p => p.id === socketId);
              return (
                <div key={socketId} className="w-48 flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg shrink-0">
                  <div className="flex-1 bg-black relative">
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full absolute inset-0 object-cover"
                      ref={el => { if (el) el.srcObject = remoteStreams[socketId] }}
                    />
                  </div>
                  <div className="px-2 py-1.5 text-center text-xs text-slate-300 font-medium truncate bg-slate-800 border-t border-slate-700">
                    {participant ? participant.name : 'Student'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar (Chat / Participants) */}
        {chatOpen && (
          <div className="w-full md:w-80 flex-1 md:flex-none bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.2)] z-10 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
                <MessageSquare size={16} className="text-accent" /> Class Chat
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.senderId === 'system' ? 'items-center' : (m.senderId === user._id || m.senderId === webrtcService.socket?.id) ? 'items-end' : 'items-start'}`}>
                  {m.senderId === 'system' ? (
                    <span className="bg-accent/10 text-accent border border-accent/20 text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider my-2">
                      {m.message || m.text}
                    </span>
                  ) : (
                    <div className={`max-w-[85%] ${(m.senderId === user._id || m.senderId === webrtcService.socket?.id) ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-300">{m.name}</span>
                        <span className="text-[9px] text-slate-500">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                        (m.senderId === user._id || m.senderId === webrtcService.socket?.id)
                          ? 'bg-accent text-[#030919] rounded-tr-sm font-medium' 
                          : m.role === 'teacher'
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tl-sm'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                      }`}>
                        {m.message || m.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={sendChat} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-slate-500"
              />
              <button type="submit" className="bg-accent hover:bg-[#A8802E] text-[#030919] p-2.5 rounded-xl transition-colors shrink-0 font-bold flex items-center justify-center">
                <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <footer className="h-16 md:h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-2 md:px-8 z-20 shrink-0">
        
        {/* Left Side Info */}
        <div className="hidden sm:flex items-center gap-3 w-1/4">
        </div>

        {/* Center Controls */}
        <div className="flex flex-1 sm:flex-none justify-center items-center gap-2 md:gap-4">
          <button onClick={toggleMute} className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'}`} title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <button onClick={toggleVideo} className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'}`} title={isVideoOff ? "Start Video" : "Stop Video"}>
            {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>

          <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>

          {isTeacher && (
            <button onClick={toggleScreenShare} className={`p-4 rounded-full transition-all duration-300 shadow-lg border ${isScreenSharing ? 'bg-green-500 text-white border-green-400 shadow-green-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'}`} title="Share Screen">
              <MonitorUp size={22} />
            </button>
          )}

          {isTeacher && (
            <button onClick={toggleRecording} className={`p-4 rounded-full transition-all duration-300 shadow-lg border ${isRecording ? 'bg-red-500 animate-pulse text-white border-red-400 shadow-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'}`} title={isRecording ? 'Stop Recording' : 'Start Recording'}>
              {isRecording ? <Square size={22} fill="white" /> : <Circle size={22} fill="white" />}
            </button>
          )}

          {!isTeacher && (
            <button onClick={raiseHand} className={`p-4 rounded-full transition-all duration-300 shadow-lg border bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700`} title="Raise Hand">
              <Hand size={22} />
            </button>
          )}

          <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>

          <button onClick={leaveRoom} className="px-4 md:px-6 py-2.5 md:py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/20 font-bold flex items-center gap-2 text-sm tracking-wide sm:ml-4">
            <PhoneOff size={18} /> <span className="hidden sm:inline">{isTeacher ? 'End Class' : 'Leave'}</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex justify-end gap-3 sm:w-1/4">
          <button onClick={() => setChatOpen(!chatOpen)} className={`p-2.5 md:p-3.5 rounded-xl transition-all border ${chatOpen ? 'bg-accent/10 text-accent border-accent/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-slate-700'}`} title="Toggle Chat">
            <MessageSquare size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
