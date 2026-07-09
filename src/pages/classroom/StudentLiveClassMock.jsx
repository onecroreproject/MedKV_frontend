import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Hand, Maximize, Circle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dark_logo from '../../assets/dark_logo_transparent.png';
import company_name from '../../assets/company_name_transparent.png';

export default function StudentLiveClassMock() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Anti-recording & Piracy prevention for Students
  React.useEffect(() => {
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
  }, []);
  
  const [messages, setMessages] = useState([
    { senderId: 'system', text: 'Dr. Sam Reefath has started the class.', time: '10:00 AM' },
    { senderId: 'teacher', name: 'Dr. Sam Reefath', text: 'Welcome everyone! Today we will discuss Brain MRI Interpretation.', time: '10:01 AM' },
    { senderId: 'student2', name: 'Sarah Jenkins', text: 'Good morning Dr. Sam!', time: '10:02 AM' },
    { senderId: 'local', name: 'You', text: 'Hello! Excited for this class.', time: '10:03 AM' },
  ]);

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([...messages, { senderId: 'local', name: 'You', text: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatInput('');
  };

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

  const simulateAccept = () => {
    playSound('accept');
    setMessages(prev => [...prev, { senderId: 'system', text: 'You have been admitted to the class.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
  };

  const simulateMessage = () => {
    playSound('message');
    setMessages(prev => [...prev, { senderId: 'teacher', name: 'Dr. Sam Reefath', text: 'Please pay attention to the scan on the screen.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
  };

  const simulateKickout = () => {
    playSound('end');
    alert('You have been removed from the class by the host.');
    navigate('/student/dashboard');
  };

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
            <div className="bg-red-500 animate-pulse h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-wide">Brain MRI Interpretation Masterclass</h1>
              <p className="text-[10px] text-slate-400 font-medium">Instructor: Dr. Sam Reefath</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-2 font-semibold">
            <Users size={14} className="text-accent" /> 124 Participants
          </span>
          <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-md border border-slate-700 font-mono tracking-wider">
            01:24:05
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        
        {/* Video Area */}
        <div className={`flex flex-col p-2 md:p-4 relative bg-[#01040A] transition-all duration-300 ${chatOpen ? 'h-[35%] md:h-auto md:flex-1' : 'flex-1'}`}>
          
          {/* Mock Sound Controls */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-black/60 backdrop-blur-md border border-slate-700 p-3 rounded-xl z-30 flex flex-col gap-2">
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest text-center border-b border-slate-700 pb-1 mb-1">Simulate Events (With Sound)</span>
            <button onClick={simulateAccept} className="text-xs bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 py-1.5 px-3 rounded transition-colors text-left">
              🔊 Host Admits You
            </button>
            <button onClick={simulateMessage} className="text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 py-1.5 px-3 rounded transition-colors text-left">
              🔊 New Message from Host
            </button>
            <button onClick={simulateKickout} className="text-xs bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 py-1.5 px-3 rounded transition-colors text-left">
              🔊 Host Ends Class / Kicks You
            </button>
          </div>

          {/* Main Video (Teacher) */}
          <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-2xl group">
            {/* Mock Teacher Video Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center">
               <div className="h-28 w-28 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center mb-4 shadow-xl">
                 <span className="text-4xl">👨‍⚕️</span>
               </div>
               <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">Waiting for Teacher's Camera...</p>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/10 shadow-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              Dr. Sam Reefath
            </div>

            <button className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/80 rounded-lg transition-all text-slate-300 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100">
              <Maximize size={18} />
            </button>

            {/* Dynamic Forensic Watermark for Students */}
            <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
               <div className="absolute text-white/30 text-2xl font-black uppercase tracking-widest whitespace-nowrap animate-watermark mix-blend-overlay drop-shadow-md">
                  student@example.com • mock-id-123
               </div>
            </div>
          </div>

          {/* Picture in Picture (Student/You) */}
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-24 md:w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl z-20 group">
             {isVideoOff ? (
               <div className="w-full h-full flex items-center justify-center bg-slate-800">
                 <span className="text-2xl">👤</span>
               </div>
             ) : (
               <div className="w-full h-full bg-slate-700 animate-pulse flex items-center justify-center">
                 <span className="text-[10px] text-slate-400 font-semibold tracking-wider">Your Camera Feed</span>
               </div>
             )}
             <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-sm">
                You
                {isMuted && <MicOff size={10} className="text-red-400" />}
             </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="w-full md:w-80 flex-1 md:flex-none bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.2)] z-10 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
                <MessageSquare size={16} className="text-accent" /> Class Chat
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.senderId === 'system' ? 'items-center' : m.senderId === 'local' ? 'items-end' : 'items-start'}`}>
                  {m.senderId === 'system' ? (
                    <span className="bg-accent/10 text-accent border border-accent/20 text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider my-2">
                      {m.text}
                    </span>
                  ) : (
                    <div className={`max-w-[85%] ${m.senderId === 'local' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-300">{m.name}</span>
                        <span className="text-[9px] text-slate-500">{m.time}</span>
                      </div>
                      <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                        m.senderId === 'local' 
                          ? 'bg-accent text-[#030919] rounded-tr-sm font-medium' 
                          : m.senderId === 'teacher'
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tl-sm'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                      }`}>
                        {m.text}
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
      <div className="h-16 md:h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-2 md:px-8 z-20 shrink-0">
        
        {/* Left Side Info */}
        <div className="hidden sm:flex items-center gap-3 w-1/4">
          {handRaised && (
            <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse flex items-center gap-2">
              <Hand size={14} /> Hand Raised
            </span>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex flex-1 sm:flex-none justify-center items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)} 
            className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'}`}
            title={isVideoOff ? "Start Video" : "Stop Video"}
          >
            {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
          
          <div className="w-px h-8 bg-slate-700 mx-2"></div>

          <button 
            onClick={() => setHandRaised(!handRaised)} 
            className={`p-4 rounded-full transition-all duration-300 shadow-lg border ${handRaised ? 'bg-yellow-500 text-[#030919] border-yellow-400 shadow-yellow-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'}`}
            title="Raise Hand"
          >
            <Hand size={22} />
          </button>
          
          <div className="w-px h-8 bg-slate-700 mx-2"></div>

          <button 
            onClick={() => navigate('/student/dashboard')} 
            className="px-4 md:px-6 py-2.5 md:py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/20 font-bold flex items-center gap-2 text-sm tracking-wide sm:ml-4"
          >
            <PhoneOff size={18} /> <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex justify-end gap-3 sm:w-1/4">
          <button 
            onClick={() => setChatOpen(!chatOpen)} 
            className={`p-2.5 md:p-3.5 rounded-xl transition-all border ${chatOpen ? 'bg-accent/10 text-accent border-accent/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-slate-700'}`}
            title="Toggle Chat"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
