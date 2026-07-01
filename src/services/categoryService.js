import axiosInstance from './axiosInstance';

export const getCategories = async () => {
  const response = await axiosInstance.get('/categories');
  return response.data;
};
