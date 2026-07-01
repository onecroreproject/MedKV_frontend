import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerStudent } from '../../services/authService';
import { CheckCircle2, Circle } from 'lucide-react';
import dark_logo from '../../assets/dark_logo_transparent.png';
import company_name from '../../assets/company_name_transparent.png';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/;

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(passwordRegex, 'Please meet all password requirements')
    .required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
});

export default function StudentRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const passwordValue = watch('password', '');
  
  const passwordRequirements = [
    { label: 'At least 8 characters', met: passwordValue.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'One lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'One number', met: /\d/.test(passwordValue) },
    { label: 'One special character', met: /[^a-zA-Z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(true);
      
      const userData = {
        name: data.fullName,
        email: data.email,
        password: data.password
      };
      
      await registerStudent(userData);
      
      setIsLoading(false);
      setSuccessMsg('Registration successful! Redirecting to login...');
      
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      
      setTimeout(() => {
        if (redirect) {
          navigate(`/student/login?redirect=${encodeURIComponent(redirect)}`);
        } else {
          navigate('/student/login');
        }
      }, 2000);
      
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2 className="text-3xl font-bold text-[#0B1F4D]">Create Account</h2>
          <p className="text-gray-500 mt-2">Join our student community today.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
              {successMsg}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              {...register('fullName')}
              className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#0B1F4D] focus:border-transparent outline-none transition-colors`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#0B1F4D] focus:border-transparent outline-none transition-colors`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            
            {/* Password Strength Indicator */}
            <div className="mt-3 space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">Password Requirements:</p>
              {passwordRequirements.map((req, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  {req.met ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={`text-xs ${req.met ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#0B1F4D] focus:border-transparent outline-none transition-colors`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0B1F4D] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-md mt-6 disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to={`/student/login${location.search}`} className="text-[#0B1F4D] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
