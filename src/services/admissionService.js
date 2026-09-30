import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

class AdmissionService {
  constructor() {
    this.socket = null;
    this.onAdmitted = null;
    this.onRejected = null;
    this.onWaitingRoomJoined = null;
    this.onWaitingStudent = null;
    this.onWaitingStudentsList = null;
    this.onStudentLeftWaiting = null;
  }

  connect() {
    if (!this.socket) {
      const token = localStorage.getItem('token');
      this.socket = io(SOCKET_URL, { 
        transports: ['websocket'],
        auth: { token }       // JWT verified server-side by io.use()
      });
      
      this.socket.on('class:admitted', () => {
        if (this.onAdmitted) this.onAdmitted();
      });

      this.socket.on('class:rejected', (data) => {
        if (this.onRejected) this.onRejected(data);
      });

      this.socket.on('class:waiting-room-joined', () => {
        if (this.onWaitingRoomJoined) this.onWaitingRoomJoined();
      });

      this.socket.on('class:waiting-student', (student) => {
        if (this.onWaitingStudent) this.onWaitingStudent(student);
      });

      this.socket.on('class:waiting-students-list', (students) => {
        if (this.onWaitingStudentsList) this.onWaitingStudentsList(students);
      });

      this.socket.on('class:student-left-waiting', (data) => {
        if (this.onStudentLeftWaiting) this.onStudentLeftWaiting(data);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[AdmissionService] socket auth error:', err.message);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // roomId only — backend resolves identity from JWT
  requestJoin(roomId) {
    if (this.socket) {
      this.socket.emit('class:join-request', { roomId });
    }
  }

  // roomId only
  getWaitingStudents(roomId) {
    if (this.socket) {
      this.socket.emit('class:get-waiting-students', { roomId });
    }
  }

  // Faculty admits a student — only targetUserId as data
  admitStudent(roomId, targetUserId) {
    if (this.socket) {
      this.socket.emit('class:admit-student', { roomId, targetUserId });
    }
  }

  // Faculty rejects a student
  rejectStudent(roomId, targetUserId) {
    if (this.socket) {
      this.socket.emit('class:reject-student', { roomId, targetUserId });
    }
  }
}

export const admissionService = new AdmissionService();
