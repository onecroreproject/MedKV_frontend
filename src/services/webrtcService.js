import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.onChat = null;
    this.onHandRaise = null;
    this.onParticipantsUpdate = null;
    this.onClassEnded = null;
    this.onForceKick = null;
    this.onForceMute = null;
    this.onParticipantMediaState = null;
    this.onJoinedWaitingRoom = null;
    this.onAdmitted = null;
    this.userName = '';
  }

  connect(roomId, userId, userRole, name) {
    this.userName = name;
    this.socket = io(SOCKET_URL, { transports: ['websocket'] });
    
    this.socket.on('connect', () => {
      this.socket.emit('join-room', { roomId, userId, userRole, name });
    });

    this.socket.on('class-ended', () => {
      if (this.onClassEnded) this.onClassEnded();
    });

    this.socket.on('force-kick', () => {
      if (this.onForceKick) this.onForceKick();
    });

    this.socket.on('force-mute', () => {
      if (this.onForceMute) this.onForceMute();
    });

    this.socket.on('participant-media-state', (data) => {
      if (this.onParticipantMediaState) this.onParticipantMediaState(data);
    });

    this.socket.on('receive-chat', (data) => {
      if (this.onChat) this.onChat(data);
    });

    this.socket.on('student-raised-hand', (data) => {
      if (this.onHandRaise) this.onHandRaise(data);
    });

    this.socket.on('joined-waiting-room', () => {
      if (this.onJoinedWaitingRoom) this.onJoinedWaitingRoom();
    });

    this.socket.on('admitted', () => {
      if (this.onAdmitted) this.onAdmitted();
    });
  }



  sendChat(message) {
    if (this.socket) {
      this.socket.emit('send-chat', { message });
    }
  }

  raiseHand() {
    if (this.socket) {
      this.socket.emit('raise-hand', { name: this.userName });
    }
  }

  endClass() {
    if (this.socket) this.socket.emit('end-class');
  }

  kickParticipant(targetId) {
    if (this.socket) this.socket.emit('kick-participant', { targetId });
  }

  muteParticipant(targetId) {
    if (this.socket) this.socket.emit('force-mute', { targetId });
  }

  updateMediaState(isMuted, isVideoOff) {
    if (this.socket) {
      this.socket.emit('media-state-changed', { isMuted, isVideoOff });
    }
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}

export const webrtcService = new WebRTCService();
