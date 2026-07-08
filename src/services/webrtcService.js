import { io } from 'socket.io-client';
import Peer from 'simple-peer/simplepeer.min.js'; // Use minified for browser

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peers = {};
    this.localStream = null;
    this.onTrack = null;
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

  initTeacher(stream, onStudentJoined) {
    this.localStream = stream;
    this.socket.on('student-joined', ({ socketId, name, userId }) => {
      console.log('Student joined, creating peer:', name);
      
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: this.localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      peer.on('signal', (data) => {
        this.socket.emit('offer', { target: socketId, sdp: data });
      });

      peer.on('stream', (studentStream) => {
        if (this.onTrack) this.onTrack(socketId, studentStream);
      });

      this.peers[socketId] = peer;
      if (onStudentJoined) onStudentJoined({ socketId, name, userId });
    });

    this.socket.on('answer', ({ caller, sdp }) => {
      if (this.peers[caller]) {
        this.peers[caller].signal(sdp);
      }
    });

    this.socket.on('student-left', ({ socketId }) => {
      if (this.peers[socketId]) {
        this.peers[socketId].destroy();
        delete this.peers[socketId];
      }
      if (this.onParticipantsUpdate) this.onParticipantsUpdate(socketId, false);
    });
  }

  initStudent(stream, onTeacherJoined) {
    this.localStream = stream;
    this.socket.on('offer', ({ caller, sdp, name }) => {
      console.log('Received offer from teacher:', name);
      
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: this.localStream, // Optional: student can send mic/cam back
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      peer.on('signal', (data) => {
        this.socket.emit('answer', { target: caller, sdp: data });
      });

      peer.on('stream', (teacherStream) => {
        if (this.onTrack) this.onTrack(caller, teacherStream);
      });

      peer.signal(sdp);
      this.peers[caller] = peer;
      if (onTeacherJoined) onTeacherJoined({ socketId: caller, name });
    });

    this.socket.on('teacher-left', () => {
      console.log('Teacher ended the class.');
      Object.keys(this.peers).forEach(id => this.peers[id].destroy());
      this.peers = {};
      if (this.onParticipantsUpdate) this.onParticipantsUpdate('teacher', false);
    });
  }

  setLocalStream(stream) {
    this.localStream = stream;
    // Replace track for existing peers
    Object.keys(this.peers).forEach(socketId => {
      const peer = this.peers[socketId];
      // In simple-peer replacing tracks dynamically is slightly tricky,
      // generally we addStream/removeStream or replaceTrack if natively implemented.
      // For a robust implementation, it's better to negotiate or use replaceTrack on raw connection.
      if (peer._pc) {
        const senders = peer._pc.getSenders();
        stream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track && s.track.kind === track.kind);
          if (sender) sender.replaceTrack(track);
        });
      }
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
    Object.keys(this.peers).forEach(id => this.peers[id].destroy());
    this.peers = {};
  }
}

export const webrtcService = new WebRTCService();
