import axiosInstance from './axiosInstance';

export const subscribeNewsletter = async (email) => {
  const response = await axiosInstance.post('/newsletter/subscribe', { email });
  return response.data;
};
