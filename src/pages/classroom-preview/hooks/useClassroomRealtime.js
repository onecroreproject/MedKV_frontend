import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export function useClassroomRealtime(roomId, user) {
  const [socket, setSocket] = useState(null);
  const [raisedHands, setRaisedHands] = useState([]); // Array of userIds
  const [recentReactions, setRecentReactions] = useState([]); // Array of { id, reaction, name, timestamp }

  useEffect(() => {
    if (!roomId || !user) return;

    // We reuse the same socket endpoint/namespace, but connect here for classroom events
    // (Note: Socket.IO clients automatically multiplex multiple logical connections if URLs match)
    const newSocket = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      // We don't need a separate "join-room" event because validateAndExecute in backend
      // checks DB, but wait! The backend needs to know which socket is in which room for `io.to(roomId)`.
      // Actually, wait, does `classroomHandler.js` have a `join-room`? No, it relies on the socket being joined!
      // Let's emit a join event to ensure this socket is in the roomId!
      newSocket.emit('class:room-join', { roomId, userId: user._id || user.id, userRole: user.role });
    });

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

    newSocket.on('class:reaction', (payload) => {
      // payload: { userId, name, reaction, timestamp }
      const newReaction = {
        ...payload,
        id: `${payload.userId}-${payload.timestamp}-${Math.random()}`
      };
      
      setRecentReactions(prev => [...prev, newReaction]);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        setRecentReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 3000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user]);

  const toggleHand = useCallback((isRaised) => {
    if (!socket || !user) return;
    const eventName = isRaised ? 'class:raise-hand' : 'class:lower-hand';
    socket.emit(eventName, { roomId, userId: user._id || user.id, userRole: user.role });
  }, [socket, roomId, user]);

  const clearHand = useCallback((targetUserId) => {
    if (!socket || !user) return;
    socket.emit('class:clear-hand', { roomId, facultyId: user._id || user.id, userRole: user.role, targetUserId });
  }, [socket, roomId, user]);

  const sendReaction = useCallback((reaction) => {
    if (!socket || !user) return;
    socket.emit('class:reaction', { roomId, userId: user._id || user.id, userRole: user.role, name: user.name, reaction });
  }, [socket, roomId, user]);

  return {
    raisedHands,
    recentReactions,
    toggleHand,
    clearHand,
    sendReaction
  };
}
