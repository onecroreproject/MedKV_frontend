import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { webrtcService } from '../../services/webrtcService';
import { Mic, MicOff, Video, VideoOff, MonitorUp, SquareSquare, PhoneOff, MessageSquare, Hand, Users, Circle, Square } from 'lucide-react';
import axios from 'axios';

export default function WebRTCRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // We should pass user context via state or fetch from auth provider
  const user = location.state?.user || JSON.parse(localStorage.getItem('user')) || {};
  const isTeacher = user.role === 'Faculty' || user.role === 'admin';

  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const [hasJoined, setHasJoined] = useState(false);
  const [mediaError, setMediaError] = useState('');
  
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const [participants, setParticipants] = useState([
    { id: user._id || 'local', name: user.name + (isTeacher ? ' (Teacher)' : ' (You)'), role: user.role }
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  const myVideoRef = useRef();
  const mainVideoRef = useRef(); // Usually the teacher's video for students

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

    if (isTeacher) {
      webrtcService.initTeacher(stream, (studentData) => {
        setParticipants(prev => [...prev, { id: studentData.socketId, name: studentData.name, role: 'student' }]);
      });
    } else {
      webrtcService.initStudent(stream, (teacherData) => {
        setParticipants(prev => [...prev, { id: teacherData.socketId, name: teacherData.name, role: 'teacher' }]);
      });
    }
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
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

  if (!hasJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full flex flex-col items-center">
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
            className={`px-8 py-3 rounded-full font-bold text-lg transition ${
              !stream && !mediaError ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            {mediaError ? 'Join Without Media' : 'Join Class'}
          </button>
          
          <button onClick={() => navigate(-1)} className="mt-4 text-slate-400 hover:text-white transition">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 bg-slate-800 border-b border-slate-700">
        <h1 className="font-bold text-lg">Classroom {isRecording && <span className="text-red-500 ml-2 animate-pulse">● Recording</span>}</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm bg-slate-700 px-3 py-1 rounded-full">{participants.length} Participants</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Video Area */}
        <div className="flex-1 flex flex-col p-4 relative">
          
          {/* Main Video View (Teacher for Students, or Active Speaker) */}
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative border border-slate-700">
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
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-sm">
              {isTeacher ? 'You (Broadcasting)' : 'Teacher'}
            </div>
          </div>

          {/* Picture in Picture / Grid of other students (Only for Teacher mainly, or self view for student) */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 h-32">
             {!isTeacher && (
                <div className="w-48 bg-black rounded-lg overflow-hidden relative border border-slate-600">
                  <video 
                    ref={el => {
                      myVideoRef.current = el;
                      if (el && stream) el.srcObject = stream;
                    }} 
                    autoPlay playsInline muted className="w-full h-full object-cover" 
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-xs px-1 rounded">You</span>
                </div>
             )}
             
             {isTeacher && Object.keys(remoteStreams).map(socketId => (
                <div key={socketId} className="w-48 bg-black rounded-lg overflow-hidden relative border border-slate-600">
                  <video 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover" 
                    ref={el => { if (el) el.srcObject = remoteStreams[socketId] }} 
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-xs px-1 rounded">Student</span>
                </div>
             ))}
          </div>
        </div>

        {/* Sidebar (Chat / Participants) */}
        {chatOpen && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700 font-bold">Class Chat</div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.senderId === 'system' ? 'text-center text-accent text-xs' : 'text-left'}`}>
                  {m.senderId !== 'system' && <span className="text-xs text-slate-400 mb-1">{m.name}</span>}
                  <div className={`${m.senderId === 'system' ? 'bg-transparent' : (m.senderId === webrtcService.socket?.id ? 'bg-primary self-end' : 'bg-slate-700 self-start')} px-3 py-2 rounded-lg text-sm inline-block max-w-[85%]`}>
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendChat} className="p-4 border-t border-slate-700 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover px-3 py-2 rounded transition">Send</button>
            </form>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <footer className="bg-slate-800 p-4 flex justify-between items-center">
        <div className="flex gap-2">
          {/* Empty space for alignment */}
        </div>

        <div className="flex gap-4">
          <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} transition`}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} transition`}>
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          {isTeacher && (
            <button onClick={toggleScreenShare} className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-600 hover:bg-slate-500'} transition`} title="Share Screen">
              <MonitorUp size={20} />
            </button>
          )}

          {isTeacher && (
            <button onClick={toggleRecording} className={`p-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600 hover:bg-slate-500'} transition`} title={isRecording ? 'Stop Recording' : 'Start Recording'}>
              {isRecording ? <Square size={20} fill="white" /> : <Circle size={20} fill="white" />}
            </button>
          )}

          {!isTeacher && (
            <button onClick={raiseHand} className="p-3 rounded-full bg-slate-600 hover:bg-slate-500 transition" title="Raise Hand">
              <Hand size={20} />
            </button>
          )}
          
          <button onClick={leaveRoom} className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition px-6 font-bold flex items-center gap-2">
            <PhoneOff size={20} /> {isTeacher ? 'End Class' : 'Leave'}
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setChatOpen(!chatOpen)} className={`p-3 rounded-full ${chatOpen ? 'bg-primary text-white' : 'bg-slate-600 hover:bg-slate-500'} transition relative`} title="Chat">
            <MessageSquare size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
