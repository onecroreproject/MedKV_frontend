import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export function useClassroomRealtime(roomId, user) {
  const [socket, setSocket] = useState(null);
  const [raisedHands, setRaisedHands] = useState([]);
  const [recentReactions, setRecentReactions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use ref so callbacks always see latest value without re-creating listeners
  const isChatOpenRef = useRef(false);

  useEffect(() => {
    if (!roomId || !user) return;

    const token = localStorage.getItem('token');

    const newSocket = io(SOCKET_URL, { 
      transports: ['websocket'],
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('class:room-join', { roomId });
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[ClassroomRealtime] socket auth error:', err.message);
    });

    // ── Raise Hand ─────────────────────────────────────────────────────────
    newSocket.on('class:hand-updated', ({ userId, action }) => {
      setRaisedHands(prev => {
        if (action === 'raised') {
          if (!prev.includes(userId)) return [...prev, userId];
        } else if (action === 'lowered') {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    });

    newSocket.on('class:raised-hands-list', (hands) => {
      setRaisedHands(hands);
    });

    // ── Reactions ───────────────────────────────────────────────────────────
    newSocket.on('class:reaction', (payload) => {
      const newReaction = {
        ...payload,
        id: `${payload.userId}-${payload.timestamp}-${Math.random()}`
      };
      setRecentReactions(prev => [...prev, newReaction]);
      setTimeout(() => {
        setRecentReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 3000);
    });

    // ── Chat ────────────────────────────────────────────────────────────────
    newSocket.on('class:chat-message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
      // Only increment unread when panel is closed
      if (!isChatOpenRef.current) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('class:chat-error', ({ code }) => {
      console.warn('[Chat] error:', code);
      // Expose via a toast if needed — for now just log
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user]);

  // Called by ClassroomPage when chat panel opens/closes
  const setChatPanelOpen = useCallback((open) => {
    isChatOpenRef.current = open;
    if (open) setUnreadCount(0);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────
  const toggleHand = useCallback((isRaised) => {
    if (!socket) return;
    socket.emit(isRaised ? 'class:raise-hand' : 'class:lower-hand', { roomId });
  }, [socket, roomId]);

  const clearHand = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:clear-hand', { roomId, targetUserId });
  }, [socket, roomId]);

  const sendReaction = useCallback((reaction) => {
    if (!socket) return;
    socket.emit('class:reaction', { roomId, reaction });
  }, [socket, roomId]);

  // Only message content — identity resolved server-side from JWT
  const sendChatMessage = useCallback((message) => {
    if (!socket || !message?.trim()) return;
    socket.emit('class:chat-message', { roomId, message: message.trim() });
  }, [socket, roomId]);

  return {
    raisedHands,
    recentReactions,
    chatMessages,
    unreadCount,
    setChatPanelOpen,
    toggleHand,
    clearHand,
    sendReaction,
    sendChatMessage,
  };
}
