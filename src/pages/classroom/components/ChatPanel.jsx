import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { webrtcService } from '../../../../services/webrtcService';

const ChatPanel = React.memo(({ messages, user, onSendChat }) => {
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput);
    setChatInput('');
  };

  return (
    <div className="w-full md:w-80 flex-1 md:flex-none bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.2)] z-10 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h2 className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
          <MessageSquare size={16} className="text-accent" /> Class Chat
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.senderId === 'system' ? 'items-center' : (m.senderId === user?._id || m.senderId === webrtcService.socket?.id) ? 'items-end' : 'items-start'}`}>
            {m.senderId === 'system' ? (
              <span className="bg-accent/10 text-accent border border-accent/20 text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider my-2">
                {m.message || m.text}
              </span>
            ) : (
              <div className={`max-w-[85%] ${(m.senderId === user?._id || m.senderId === webrtcService.socket?.id) ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-300">{m.name}</span>
                  <span className="text-[9px] text-slate-500">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                  (m.senderId === user?._id || m.senderId === webrtcService.socket?.id)
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

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
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
  );
});

export default ChatPanel;
