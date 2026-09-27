import axiosInstance from './axiosInstance';

export const getLiveClasses = async () => {
  const response = await axiosInstance.get('/live-classes');
  return response.data;
};

export const getLiveClass = async (id) => {
  const response = await axiosInstance.get(`/live-classes/${id}`);
  return response.data;
};

export const logLiveClassEvent = async (id, logData) => {
  try {
    const response = await axiosInstance.post(`/live-classes/${id}/log`, logData);
    return response.data;
  } catch (err) {
    console.error('Failed to log event', err);
    return { success: false };
  }
};
