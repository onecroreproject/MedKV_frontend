import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';

import { forgotPasswordStudent } from '../../services/authService';
import dark_logo from '../../assets/dark_logo_transparent.png';
import company_name from '../../assets/company_name_transparent.png';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
});

export default function StudentForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      await forgotPasswordStudent(data.email);
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-full flex items-center justify-center space-x-3 mb-6 bg-[#0B1F4D] p-4 rounded-xl shadow-md mx-auto max-w-sm">
            <img
              src={dark_logo}
              alt="Platform Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col justify-center text-left">
              <img
                src={company_name}
                alt="Typography"
                className="h-6 w-auto object-contain"
              />
              <span className="text-[#C89B3C] text-[6px] font-extrabold tracking-[0.16em] uppercase mt-0.5 whitespace-nowrap">
                LEARN • UNDERSTAND • EXCEL • SERVE
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#0B1F4D]">Reset Password</h2>
          <p className="text-gray-500 mt-2">Enter your email to receive a reset link.</p>
        </div>

        {isSubmitted ? (
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-green-800 mb-2">Check your email</h3>
            <p className="text-green-600 text-sm">We have sent password reset instructions to your email address.</p>
            <Link to="/student/login" className="block mt-6 text-[#0B1F4D] font-semibold hover:underline">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#0B1F4D] focus:border-transparent outline-none transition-colors`}
                placeholder="student@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0B1F4D] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F4D]/90 transition-all shadow-md flex justify-center items-center disabled:opacity-70"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Send Reset Link'
              )}
            </button>
            
            <div className="text-center mt-6">
              <Link to="/student/login" className="text-sm text-gray-600 hover:text-[#0B1F4D] font-medium transition-colors">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
