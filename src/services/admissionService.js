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
      this.socket = io(SOCKET_URL, { transports: ['websocket'] });
      
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
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  requestJoin(roomId, userId, userRole, name) {
    if (this.socket) {
      this.socket.emit('class:join-request', { roomId, userId, userRole, name });
    }
  }

  getWaitingStudents(roomId, userId, userRole) {
    if (this.socket) {
      this.socket.emit('class:get-waiting-students', { roomId, userId, userRole });
    }
  }

  admitStudent(roomId, facultyId, userRole, targetUserId) {
    if (this.socket) {
      this.socket.emit('class:admit-student', { roomId, facultyId, userRole, targetUserId });
    }
  }

  rejectStudent(roomId, facultyId, userRole, targetUserId) {
    if (this.socket) {
      this.socket.emit('class:reject-student', { roomId, facultyId, userRole, targetUserId });
    }
  }
}

export const admissionService = new AdmissionService();
