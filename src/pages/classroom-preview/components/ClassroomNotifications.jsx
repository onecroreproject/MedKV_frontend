import React, { useEffect, useRef } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

const TYPE_STYLES = {
  message:  { bg: 'bg-blue-600/90',   border: 'border-blue-400/40',  icon: '💬' },
  hand:     { bg: 'bg-yellow-500/90', border: 'border-yellow-400/40', icon: '✋' },
  join:     { bg: 'bg-green-600/90',  border: 'border-green-400/40',  icon: '👤' },
  waiting:  { bg: 'bg-purple-600/90', border: 'border-purple-400/40', icon: '⏳' },
  ended:    { bg: 'bg-red-600/90',    border: 'border-red-400/40',    icon: '🔴' },
  default:  { bg: 'bg-slate-700/90',  border: 'border-slate-600/40',  icon: 'ℹ️' },
};

function NotificationCard({ notification, onDismiss }) {
  const { id, type, title, message } = notification;
  const style = TYPE_STYLES[type] || TYPE_STYLES.default;

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl
        ${style.bg} ${style.border}
        text-white w-80 max-w-[calc(100vw-2rem)]
        animate-in slide-in-from-right-4 fade-in duration-200
      `}
    >
      <span className="text-xl mt-0.5 shrink-0">{style.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        {message && <p className="text-xs text-white/80 mt-0.5 leading-snug line-clamp-2">{message}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ClassroomNotifications({
  notifications = [],
  onDismiss,
  soundEnabled,
  onToggleSound,
}) {
  const visible = notifications.slice(-3); // show at most 3

  return (
    <div
      className="fixed top-20 right-4 z-[200] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
      aria-label="Classroom notifications"
    >
      {/* Sound Toggle — always visible for host */}
      <div className="pointer-events-auto mb-1">
        <button
          onClick={onToggleSound}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all shadow-lg ${
            soundEnabled
              ? 'bg-slate-800/80 border-slate-600 text-slate-300 hover:text-white'
              : 'bg-red-900/60 border-red-500/40 text-red-300 hover:text-white'
          } backdrop-blur-sm`}
          title={soundEnabled ? 'Sound ON — click to mute' : 'Sound OFF — click to enable'}
        >
          {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          <span>{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
        </button>
      </div>

      {/* Notification cards */}
      {visible.map(n => (
        <div key={n.id} className="pointer-events-auto">
          <NotificationCard notification={n} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
