import axiosInstance from './axiosInstance';

export const registerStudent = async (userData) => {
  const response = await axiosInstance.post('/auth/student/register', userData);
  return response.data;
};

export const loginStudent = async (email, password, rememberMe = false) => {
  const response = await axiosInstance.post('/auth/student/login', { email, password, rememberMe });
  return response.data;
};

export const forgotPasswordStudent = async (email) => {
  const response = await axiosInstance.post('/auth/student/forgotpassword', { email });
  return response.data;
};

export const resetPasswordStudent = async (token, password) => {
  const response = await axiosInstance.put(`/auth/student/resetpassword/${token}`, { password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Validate Reset Token
export const validateResetToken = async (token) => {
  const response = await axiosInstance.get(`/auth/validate-reset-token/${token}`);
  return response.data;
};
