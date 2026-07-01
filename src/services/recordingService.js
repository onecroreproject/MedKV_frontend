import axiosInstance from './axiosInstance';

export const getRecordings = async () => {
  const response = await axiosInstance.get('/recordings');
  return response.data;
};

export const getRecording = async (id) => {
  const response = await axiosInstance.get(`/recordings/${id}`);
  return response.data;
};

export const deleteRecording = async (id) => {
  const response = await axiosInstance.delete(`/recordings/${id}`);
  return response.data;
};

export const createExtensionOrder = async (id) => {
  const response = await axiosInstance.post(`/recordings/${id}/extend/order`);
  return response.data;
};

export const verifyExtensionPayment = async (id, paymentData) => {
  const response = await axiosInstance.post(`/recordings/${id}/extend/verify`, paymentData);
  return response.data;
};
