import { useState, useCallback, useRef, useEffect } from 'react';

// ── Sound synthesis via Web Audio API ────────────────────────────────────────
let _audioCtx = null;
const getAudioCtx = () => {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume();
  }
  return _audioCtx;
};

export const playNotificationSound = (type) => {
  try {
    const ctx = getAudioCtx();
    const profiles = {
      message: [
        { freq: 880, dur: 0.08, delay: 0, gain: 0.25 },
        { freq: 1100, dur: 0.12, delay: 0.09, gain: 0.20 },
      ],
      hand: [
        { freq: 660, dur: 0.07, delay: 0, gain: 0.22 },
        { freq: 880, dur: 0.07, delay: 0.09, gain: 0.22 },
        { freq: 1100, dur: 0.12, delay: 0.18, gain: 0.18 },
      ],
      join: [
        { freq: 523, dur: 0.07, delay: 0, gain: 0.20 },
        { freq: 659, dur: 0.07, delay: 0.08, gain: 0.20 },
        { freq: 784, dur: 0.14, delay: 0.16, gain: 0.18 },
      ],
      waiting: [
        { freq: 440, dur: 0.10, delay: 0, gain: 0.22 },
        { freq: 550, dur: 0.10, delay: 0.13, gain: 0.18 },
      ],
      ended: [
        { freq: 392, dur: 0.12, delay: 0, gain: 0.25 },
        { freq: 330, dur: 0.12, delay: 0.14, gain: 0.22 },
        { freq: 262, dur: 0.22, delay: 0.28, gain: 0.20 },
      ],
    };
    const tones = profiles[type] || profiles.message;
    const now = ctx.currentTime;
    tones.forEach(({ freq, dur, delay, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(gain, now + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.02);
    });
  } catch (e) {
    console.warn('[Notifications] audio error:', e.message);
  }
};

const COOLDOWN_MS = 1500;

export function useClassroomNotifications({ userRole, chatMessages, raisedHands, waitingStudents, isChatOpen, participants }) {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem('classroom_sound') !== 'false'; } catch { return true; }
  });
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  const cooldowns = useRef({});
  const prevRaisedHands = useRef([]);
  const prevWaiting = useRef([]);
  const isInitialWaitingSync = useRef(true);
  const prevChatLen = useRef(0);
  const isHost = userRole === 'teacher';

  const canPlaySound = useCallback((type) => {
    if (!soundEnabledRef.current) return false;
    const now = Date.now();
    if (now - (cooldowns.current[type] || 0) < COOLDOWN_MS) return false;
    cooldowns.current[type] = now;
    return true;
  }, []);

  const addNotification = useCallback((type, title, message, extra) => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    // Use an empty function for manual dismissals that don't auto-timeout, or a long timeout
    // For hand raises, we use a 10s timeout, but other notifications can stay 5s
    const timeout = type === 'hand' ? 10000 : 5000;
    setNotifications(prev => [...prev, { id, type, title, message, ts: Date.now(), ...(extra || {}) }].slice(-5));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), timeout);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('classroom_sound', String(next)); } catch {}
      return next;
    });
  }, []);

  // React to Chat Messages
  useEffect(() => {
    if (!isHost) { prevChatLen.current = chatMessages.length; return; }
    if (chatMessages.length <= prevChatLen.current) { prevChatLen.current = chatMessages.length; return; }
    const newMsgs = chatMessages.slice(prevChatLen.current);
    prevChatLen.current = chatMessages.length;
    if (isChatOpen) return;
    if (newMsgs.length === 1) {
      const m = newMsgs[0];
      addNotification('message', '💬 New Message', `${m.senderName || 'Student'}: "${(m.message || '').slice(0, 60)}"`);
    } else {
      addNotification('message', '💬 New Messages', `${newMsgs.length} new messages`);
    }
    if (canPlaySound('message')) playNotificationSound('message');
  }, [chatMessages, isHost, isChatOpen, addNotification, canPlaySound]);

  // React to Raised Hands (only LOWERED → RAISED transitions)
  useEffect(() => {
    if (!isHost) { prevRaisedHands.current = raisedHands; return; }
    const prev = prevRaisedHands.current;
    const newlyRaised = raisedHands.filter(id => !prev.includes(id));
    prevRaisedHands.current = raisedHands;
    if (newlyRaised.length === 0) return;
    
    // Find names
    const names = newlyRaised.map(id => {
      const p = participants?.find(p => p.identity === id || p.identity.startsWith(id + '|'));
      return p ? (p.name || p.identity.split('|')[0]) : 'A student';
    });
    
    const message = names.length === 1 
      ? `${names[0]} raised their hand` 
      : `${names.join(', ')} raised their hands`;
      
    addNotification('hand', '✋ Hand Raised', message);
    if (canPlaySound('hand')) playNotificationSound('hand');
  }, [raisedHands, isHost, addNotification, canPlaySound, participants]);

  // React to Waiting Students (suppress initial sync)
  useEffect(() => {
    if (!isHost) return;
    if (isInitialWaitingSync.current) {
      prevWaiting.current = waitingStudents.map(s => s.userId);
      isInitialWaitingSync.current = false;
      return;
    }
    const prevIds = prevWaiting.current;
    const newStudents = waitingStudents.filter(s => !prevIds.includes(s.userId));
    prevWaiting.current = waitingStudents.map(s => s.userId);
    newStudents.forEach(student => {
      addNotification('waiting', '⏳ Waiting to Join', `${student.name || 'A student'} is waiting to join`);
      if (canPlaySound('waiting')) playNotificationSound('waiting');
    });
  }, [waitingStudents, isHost, addNotification, canPlaySound]);

  return { notifications, addNotification, dismissNotification, soundEnabled, toggleSound, canPlaySound };
}
