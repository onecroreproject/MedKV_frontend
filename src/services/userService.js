import axiosInstance from './axiosInstance';

export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const updateProfileDetails = async (profileData) => {
  const response = await axiosInstance.put('/auth/updatedetails', profileData);
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await axiosInstance.put('/auth/updatepassword', passwordData);
  return response.data;
};

export const updatePreferences = async (preferencesData) => {
  const response = await axiosInstance.put('/auth/preferences', { preferences: preferencesData });
  return response.data;
};

export const updateTwoFactor = async (isEnabled) => {
  const response = await axiosInstance.put('/auth/twofactor', { twoFactorEnabled: isEnabled });
  return response.data;
};

export const revokeDeviceSession = async (sessionId) => {
  const response = await axiosInstance.delete(`/auth/sessions/${sessionId}`);
  return response.data;
};

export const logStudyTime = async (minutes) => {
  const response = await axiosInstance.post('/progress/time', { minutes });
  return response.data;
};

export const markLessonComplete = async (lessonId) => {
  const response = await axiosInstance.post('/progress/lesson/complete', { lessonId });
  return response.data;
};

// Notifications
export const getNotifications = async () => {
  const response = await axiosInstance.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await axiosInstance.put('/notifications/read-all');
  return response.data;
};

// Search
export const globalSearch = async (query) => {
  const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// Tickets
export const createTicket = async (ticketData) => {
  const response = await axiosInstance.post('/tickets', ticketData);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await axiosInstance.get('/tickets/my');
  return response.data;
};

export const replyToTicket = async (ticketId, message) => {
  const response = await axiosInstance.post(`/tickets/${ticketId}/reply`, { message });
  return response.data;
};
