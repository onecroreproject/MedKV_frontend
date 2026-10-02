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

  // ── Connection state ───────────────────────────────────────────────────────
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketAuthError, setSocketAuthError] = useState(null);

  // ── Recording state ────────────────────────────────────────────────────────
  const [recordingState, setRecordingState] = useState('idle');
  const [recordingStartedAt, setRecordingStartedAt] = useState(null);
  const [recordingAccumulatedDuration, setRecordingAccumulatedDuration] = useState(0);

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
  const [cameraRequests, setCameraRequests] = useState([]);

  // ── Waiting Room state ──────────────────────────────────────────────────────
  const [waitingStudents, setWaitingStudents] = useState([]);

  // ── Co-host state ───────────────────────────────────────────────────────────
  // Set of userId strings who have been promoted to co-host by the host
  const [coHosts, setCoHosts] = useState(new Set());

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

    // Fetch recording state
    const fetchRecordingState = async () => {
      try {
        const res = await fetch(`${SOCKET_URL}/api/v1/class-recordings/status/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setRecordingState(data.data.recordingState || 'idle');
          if (data.data.startedAt) setRecordingStartedAt(data.data.startedAt);
          if (data.data.accumulatedDuration) setRecordingAccumulatedDuration(data.data.accumulatedDuration);
        }
      } catch (err) {
        console.error('Failed to fetch recording state', err);
      }
    };

    newSocket.on('connect', () => {
      setIsSocketConnected(true);
      setSocketAuthError(null);
      console.log(`[Realtime] socket connected`);
      console.log(`[CLASSROOM] emitting class:room-join roomId = ${roomId}`);
      newSocket.emit('class:room-join', { roomId });
      console.log(`[Realtime] joined classroom room ${roomId}`);
      fetchRecordingState();
      
      // Fetch waiting students for faculty
      const uRole = user?.role?.toLowerCase();
      if (user && (uRole === 'teacher' || uRole === 'faculty' || uRole === 'admin')) {
        newSocket.emit('class:get-waiting-students', { roomId });
      }
    });

    newSocket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[ClassroomRealtime] socket auth error:', err.message);
      setIsSocketConnected(false);
      setSocketAuthError(err.message);
    });

    // ── Recording Events ──────────────────────────────────────────────────────
    newSocket.on('class:recording-started', (payload) => {
      console.log('[Recording][Socket] Received recording-started');
      console.log('[Recording][Socket] Room:', payload.roomId);
      console.log('[Recording][Socket] Recording ID:', payload.recordingId);
      setRecordingState(payload.status || 'recording');
      setRecordingStartedAt(payload.startedAt || new Date());
    });

    newSocket.on('class:recording-stopping', (payload) => {
      console.log('[Recording][Socket] Received recording-stopping');
      setRecordingState('stopping');
    });

    newSocket.on('class:recording-completed', (payload) => {
      console.log('[Recording][Socket] Received recording-completed');
      setRecordingState('completed');
    });

    newSocket.on('class:recording-failed', (payload) => {
      console.log('[Recording][Socket] Received recording-failed');
      setRecordingState('failed');
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

    newSocket.on('class:participant-camera-disabled', ({ targetUserId }) => {
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

    // Faculty receives camera enable requests
    newSocket.on('class:camera-request', (req) => {
      setCameraRequests(prev => {
        if (prev.find(r => r.userId === req.userId)) return prev;
        return [...prev, req];
      });
      setTimeout(() => {
        setCameraRequests(prev => prev.filter(r => r.userId !== req.userId));
      }, 30000);
    });

    newSocket.on('class:camera-approved', ({ targetUserId }) => {
      setCameraDisabledParticipants(prev => { const n = { ...prev }; delete n[targetUserId]; return n; });
      if (targetUserId === currentUserId) {
        setIsCameraDisabledByFaculty(false);
      }
    });

    newSocket.on('class:host-requested-camera', ({ targetUserId }) => {
      if (targetUserId === currentUserId) {
        window.dispatchEvent(new CustomEvent('host-requested-camera'));
      }
    });

    newSocket.on('class:participant-removed', ({ targetUserId }) => {
      // Clean local moderation state for removed participant
      setMutedParticipants(prev => { const n = { ...prev }; delete n[targetUserId]; return n; });
      setCameraDisabledParticipants(prev => { const n = { ...prev }; delete n[targetUserId]; return n; });
    });

    newSocket.on('class:moderation-error', ({ code }) => {
      console.warn('[Moderation] error:', code);
    });

    newSocket.on('class:host-requested-unmute', ({ targetUserId }) => {
      if (targetUserId === currentUserId) {
        window.dispatchEvent(new CustomEvent('host-requested-unmute'));
      }
    });

    // ── Admission / Waiting Room ─────────────────────────────────────────────
    newSocket.on('class:waiting-student', (student) => {
      console.log(`[REALTIME] class:waiting-student RECEIVED`, student);
      setWaitingStudents(prev => {
        if (prev.find(s => s.userId === student.userId)) return prev;
        return [...prev, student];
      });
    });

    newSocket.on('class:waiting-students-list', (studentsList) => {
      console.log(`[REALTIME] waiting-students-list RECEIVED`, studentsList);
      setWaitingStudents(studentsList);
    });

    newSocket.on('class:student-left-waiting', (data) => {
      console.log(`[REALTIME] student-left-waiting RECEIVED`, data);
      setWaitingStudents(prev => prev.filter(s => s.userId !== data.userId));
    });

    newSocket.on('class-ended', () => {
      setSocketAuthError('Class has ended.');
    });

    // ── Co-host events ────────────────────────────────────────────────────────
    newSocket.on('class:cohost-updated', ({ targetUserId, assign }) => {
      console.log(`[CoHost] Received cohost-updated targetUserId=${targetUserId} assign=${assign}`);
      setCoHosts(prev => {
        const next = new Set(prev);
        if (assign) {
          next.add(String(targetUserId));
        } else {
          next.delete(String(targetUserId));
        }
        return next;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user]);

  useEffect(() => {
    console.log('[REALTIME] waitingStudents changed', waitingStudents);
  }, [waitingStudents]);

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

  const requestCamera = useCallback(() => {
    if (!socket) return;
    socket.emit('class:request-camera', { roomId });
  }, [socket, roomId]);

  const allowUnmute = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:allow-unmute', { roomId, targetUserId });
    dismissUnmuteRequest(targetUserId);
  }, [socket, roomId, dismissUnmuteRequest]);

  const hostRequestUnmute = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:host-request-unmute', { roomId, targetUserId });
  }, [socket, roomId]);

  const disableCamera = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:disable-camera', { roomId, targetUserId });
  }, [socket, roomId]);

  const allowCamera = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:allow-camera', { roomId, targetUserId });
  }, [socket, roomId]);

  const hostRequestCamera = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:host-request-camera', { roomId, targetUserId });
  }, [socket, roomId]);

  const removeParticipant = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:remove-participant', { roomId, targetUserId });
  }, [socket, roomId]);

  const clearParticipantHand = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:clear-participant-hand', { roomId, targetUserId });
  }, [socket, roomId]);

  const admitStudent = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:admit-student', { roomId, targetUserId });
  }, [socket, roomId]);

  const rejectStudent = useCallback((targetUserId) => {
    if (!socket) return;
    socket.emit('class:reject-student', { roomId, targetUserId });
  }, [socket, roomId]);

  const assignCoHost = useCallback((targetUserId, assign) => {
    if (!socket) return;
    console.log(`[CoHost] Emitting assign-cohost targetUserId=${targetUserId} assign=${assign}`);
    socket.emit('class:assign-cohost', { roomId, targetUserId: String(targetUserId), assign });
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
    cameraRequests,
    // Moderation actions
    muteParticipant,
    requestUnmute,
    requestCamera,
    allowUnmute,
    allowCamera,
    hostRequestUnmute,
    hostRequestCamera,
    disableCamera,
    removeParticipant,
    clearParticipantHand,
    dismissUnmuteRequest,
    // Admission / Waiting Room
    waitingStudents,
    admitStudent,
    rejectStudent,
    // Co-host
    coHosts,
    assignCoHost,
    // Recording
    recordingState,
    recordingStartedAt,
    recordingAccumulatedDuration,
    // Connection
    isSocketConnected,
    socketAuthError,
  };
}
