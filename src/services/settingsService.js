import axiosInstance from './axiosInstance';

export const getSettings = async () => {
  try {
    const response = await axiosInstance.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};
