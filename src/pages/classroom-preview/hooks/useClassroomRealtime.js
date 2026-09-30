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

  // ── Moderation state ────────────────────────────────────────────────────────
  // { userId: true } — tracks who is faculty-muted / camera-disabled / removed
  const [mutedParticipants, setMutedParticipants] = useState({});
  const [cameraDisabledParticipants, setCameraDisabledParticipants] = useState({});
  // State for the current user
  const [isMutedByFaculty, setIsMutedByFaculty] = useState(false);
  const [isCameraDisabledByFaculty, setIsCameraDisabledByFaculty] = useState(false);
  const [removedFromClass, setRemovedFromClass] = useState(false);
  const [removedReason, setRemovedReason] = useState('');
  // Unmute requests received by faculty
  const [unmuteRequests, setUnmuteRequests] = useState([]);

  const isChatOpenRef = useRef(false);
  const currentUserId = user?._id || user?.id;

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

    // ── Raise Hand ───────────────────────────────────────────────────────────
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

    // ── Reactions ─────────────────────────────────────────────────────────────
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

    // ── Chat ──────────────────────────────────────────────────────────────────
    newSocket.on('class:chat-message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
      if (!isChatOpenRef.current) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('class:chat-error', ({ code }) => {
      console.warn('[Chat] error:', code);
    });

    // ── Moderation ────────────────────────────────────────────────────────────
    newSocket.on('class:participant-muted', ({ targetUserId }) => {
      setMutedParticipants(prev => ({ ...prev, [targetUserId]: true }));
      if (targetUserId === currentUserId) {
        setIsMutedByFaculty(true);
      }
    });

    newSocket.on('class:unmute-approved', ({ targetUserId }) => {
      setMutedParticipants(prev => { const n = { ...prev }; delete n[targetUserId]; return n; });
      if (targetUserId === currentUserId) {
        setIsMutedByFaculty(false);
      }
    });

    newSocket.on('class:camera-disabled', ({ targetUserId }) => {
      setCameraDisabledParticipants(prev => ({ ...prev, [targetUserId]: true }));
      if (targetUserId === currentUserId) {
        setIsCameraDisabledByFaculty(true);
      }
    });

    newSocket.on('class:removed-from-class', ({ targetUserId, reason }) => {
      if (targetUserId === currentUserId) {
        setRemovedFromClass(true);
        setRemovedReason(reason || 'Removed by faculty');
      }
    });

    // Faculty receives unmute requests
    newSocket.on('class:unmute-request', (req) => {
      setUnmuteRequests(prev => {
        if (prev.find(r => r.userId === req.userId)) return prev;
        return [...prev, req];
      });
      // Auto-dismiss after 30s
      setTimeout(() => {
        setUnmuteRequests(prev => prev.filter(r => r.userId !== req.userId));
      }, 30000);
    });

    newSocket.on('class:participant-removed', ({ targetUserId }) => {
      // Clean local moderation state for removed participant
      setMutedParticipants(prev => { const n = { ...prev }; delete n[targetUserId]; return n; });
      setCameraDisabledParticipants(prev => { const n = { ...prev }; delete n[targetUserId]; return n; });
    });

    newSocket.on('class:moderation-error', ({ code }) => {
      console.warn('[Moderation] error:', code);
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

  // ── Dismiss unmute request (after faculty acts) ───────────────────────────
  const dismissUnmuteRequest = useCallback((userId) => {
    setUnmuteRequests(prev => prev.filter(r => r.userId !== userId));
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
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

  const sendChatMessage = useCallback((message) => {
    if (!socket || !message?.trim()) return;
    socket.emit('class:chat-message', { roomId, message: message.trim() });
  }, [socket, roomId]);

  // ── Moderation actions ────────────────────────────────────────────────────
  const muteParticipant = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:mute-participant', { roomId, targetUserId });
  }, [socket, roomId]);

  const requestUnmute = useCallback(() => {
    if (!socket) return;
    socket.emit('class:request-unmute', { roomId });
  }, [socket, roomId]);

  const allowUnmute = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:allow-unmute', { roomId, targetUserId });
    dismissUnmuteRequest(targetUserId);
  }, [socket, roomId, dismissUnmuteRequest]);

  const disableCamera = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:disable-camera', { roomId, targetUserId });
  }, [socket, roomId]);

  const removeParticipant = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:remove-participant', { roomId, targetUserId });
  }, [socket, roomId]);

  const clearParticipantHand = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:clear-participant-hand', { roomId, targetUserId });
  }, [socket, roomId]);

  return {
    // Existing
    raisedHands,
    recentReactions,
    chatMessages,
    unreadCount,
    setChatPanelOpen,
    toggleHand,
    clearHand,
    sendReaction,
    sendChatMessage,
    // Moderation state
    mutedParticipants,
    cameraDisabledParticipants,
    isMutedByFaculty,
    isCameraDisabledByFaculty,
    removedFromClass,
    removedReason,
    unmuteRequests,
    // Moderation actions
    muteParticipant,
    requestUnmute,
    allowUnmute,
    disableCamera,
    removeParticipant,
    clearParticipantHand,
    dismissUnmuteRequest,
  };
}
