import axiosInstance from './axiosInstance';

export const getPublishedCourses = async () => {
  // Only get published courses for students
  const response = await axiosInstance.get('/courses?status=Published');
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await axiosInstance.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await axiosInstance.post('/courses', courseData);
  return response;
};

export const enrollInCourse = async (courseId) => {
  const response = await axiosInstance.post(`/enroll/${courseId}`);
  return response.data;
};

// Payment endpoints
export const createRazorpayOrder = async (courseId) => {
  const response = await axiosInstance.post(`/payment/create-order`, { courseId });
  return response.data;
};

export const verifyRazorpayPayment = async (verificationData) => {
  const response = await axiosInstance.post(`/payment/verify`, verificationData);
  return response.data;
};
