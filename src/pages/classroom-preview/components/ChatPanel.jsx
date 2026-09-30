import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, ChevronDown } from 'lucide-react';

const MAX_MSG_LENGTH = 1000;

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function RoleBadge({ role }) {
  if (!role) return null;
  const isTeacher = role === 'Faculty' || role === 'Admin' || role === 'teacher' || role === 'admin';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-1.5 ${
      isTeacher ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700 text-slate-400'
    }`}>
      {isTeacher ? 'Faculty' : 'Student'}
    </span>
  );
}

export default function ChatPanel({ onClose, messages = [], onSendMessage, currentUserId }) {
  const [input, setInput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const userScrolledUp = useRef(false);
  const prevMsgCount = useRef(messages.length);

  // Auto-scroll logic: scroll to bottom when new message arrives if user hasn't scrolled up
  useEffect(() => {
    const newMessage = messages.length > prevMsgCount.current;
    prevMsgCount.current = messages.length;

    if (!newMessage) return;

    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowJumpBtn(true);
    }
  }, [messages]);

  // Detect manual scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    userScrolledUp.current = !atBottom;
    if (atBottom) setShowJumpBtn(false);
  }, []);

  const jumpToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowJumpBtn(false);
    userScrolledUp.current = false;
  };

  // Initial scroll to bottom when panel opens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > MAX_MSG_LENGTH) return;
    onSendMessage(trimmed);
    setInput('');
    setCharCount(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-20 transition-all duration-300 animate-in slide-in-from-right-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 shrink-0">
        <h2 className="text-lg font-semibold text-slate-100">In-call messages</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative"
      >
        {/* Disclaimer */}
        <div className="bg-slate-800/50 p-3 rounded-lg text-xs text-slate-400 text-center mb-2">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>

        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-8">
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.userId === currentUserId;
          const isTeacher = msg.role === 'Faculty' || msg.role === 'Admin' || msg.role === 'teacher' || msg.role === 'admin';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Sender row */}
              <div className={`flex items-baseline space-x-1.5 mb-0.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <span className={`font-semibold text-xs ${
                  isMe ? 'text-blue-400' : isTeacher ? 'text-teal-400' : 'text-slate-300'
                }`}>
                  {isMe ? 'You' : msg.name}
                </span>
                {!isMe && <RoleBadge role={msg.role} />}
                <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                isMe
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : isTeacher
                  ? 'bg-teal-900/60 border border-teal-700/40 text-slate-100 rounded-bl-sm'
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm'
              }`}>
                {/* Render as plain text — no dangerouslySetInnerHTML */}
                {msg.message}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Jump to new messages button */}
      {showJumpBtn && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={jumpToBottom}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg transition-colors"
          >
            <ChevronDown size={14} />
            <span>New messages</span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
        {charCount > MAX_MSG_LENGTH - 100 && (
          <div className={`text-xs mb-1.5 text-right ${charCount >= MAX_MSG_LENGTH ? 'text-red-400' : 'text-slate-500'}`}>
            {charCount}/{MAX_MSG_LENGTH}
          </div>
        )}
        <form 
          className="relative flex items-end"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            maxLength={MAX_MSG_LENGTH}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl pl-4 pr-12 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm resize-none custom-scrollbar max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button 
            type="submit"
            disabled={!input.trim() || charCount > MAX_MSG_LENGTH}
            className="absolute right-2 bottom-2 p-1.5 text-blue-400 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
