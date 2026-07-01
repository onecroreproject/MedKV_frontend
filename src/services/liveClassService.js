import axiosInstance from './axiosInstance';

export const getLiveClasses = async () => {
  const response = await axiosInstance.get('/live-classes');
  return response.data;
};

export const getLiveClass = async (id) => {
  const response = await axiosInstance.get(`/live-classes/${id}`);
  return response.data;
};
