import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, Video, Target, FileText, Award, Activity, GraduationCap, Lock, ChevronRight } from 'lucide-react';
import { loginStudent } from '../../services/authService';
import dark_logo from '../../assets/dark_logo_transparent.png';
import company_name from '../../assets/company_name_transparent.png';

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/;

const schema = yup.object().shape({
  email: yup.string()
    .matches(emailRegex, 'Please enter a valid email address')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function StudentLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const enrollCourseId = searchParams.get('enroll');
  const redirect = searchParams.get('redirect');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      setIsLoading(true);
      
      const response = await loginStudent(data.email, data.password, data.remember);
      
      localStorage.setItem('token', response.token);
      
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({ role: 'student', name: response.user.name, email: response.user.email });
      }
      
      if (redirect) {
        navigate(decodeURIComponent(redirect));
      } else if (enrollCourseId) {
        navigate(`/?enroll=${enrollCourseId}`);
      } else {
        navigate('/'); 
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-[#C89B3C] selection:text-white">
      
      {/* LEFT SIDE BRANDING SECTION (Desktop) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-[#0B1F4D] relative overflow-hidden flex-col justify-between p-12 text-white shadow-2xl z-10">
        {/* Abstract Medical Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C89B3C] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <img
              src={dark_logo}
              alt="Platform Logo"
              className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <img
                src={company_name}
                alt="Dr. Sam Reefath Radiology Academy Typography"
                className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
              <span className="text-[#C89B3C] text-[8px] font-extrabold tracking-[0.16em] uppercase mt-0.5 whitespace-nowrap">
                LEARN • UNDERSTAND • EXCEL • SERVE
              </span>
            </div>
          </div>

          <div className="mt-16 animate-in fade-in slide-in-from-left-8 duration-700 delay-150 fill-mode-both">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Advance Your Career in <span className="text-[#C89B3C]">Radiology Excellence.</span>
            </h2>
            <p className="text-blue-100 text-lg max-w-lg mb-12 leading-relaxed">
              Welcome to the ultimate learning ecosystem. Access world-class courses, live mentorship, and a vast library of interactive radiology cases.
            </p>

            <div className="grid grid-cols-2 gap-y-8 gap-x-6">
              <div className="flex flex-col border-l-2 border-[#C89B3C]/40 pl-4">
                <span className="text-3xl font-bold text-white">5000+</span>
                <span className="text-blue-200 text-sm font-medium">Active Students</span>
              </div>
              <div className="flex flex-col border-l-2 border-[#C89B3C]/40 pl-4">
                <span className="text-3xl font-bold text-white">100+</span>
                <span className="text-blue-200 text-sm font-medium">Specialized Courses</span>
              </div>
              <div className="flex flex-col border-l-2 border-[#C89B3C]/40 pl-4">
                <span className="text-3xl font-bold text-white">50+</span>
                <span className="text-blue-200 text-sm font-medium">Faculty Experts</span>
              </div>
              <div className="flex flex-col border-l-2 border-[#C89B3C]/40 pl-4">
                <span className="text-3xl font-bold text-white">3000+</span>
                <span className="text-blue-200 text-sm font-medium">Radiology Cases</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200/60 flex justify-between items-center animate-in fade-in duration-1000 delay-300 fill-mode-both">
          <p>© 2026 Dr. Sam Reefath Radiology Academy</p>
          <div className="flex space-x-6">
            <Link to="/policy/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/policy/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/policy/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE LOGIN SECTION */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-[#F8FAFC]">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden w-full flex items-center justify-center space-x-3 mb-8 animate-in fade-in duration-500 bg-[#0B1F4D] p-4 rounded-xl shadow-md">
          <img
            src={dark_logo}
            alt="Platform Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col justify-center">
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

        <div className="w-full max-w-[520px] animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
          
          {/* Glassmorphism Card */}
          <div className="w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-12 relative overflow-hidden">
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">Student Login</h2>
              <p className="text-[#60738A]">Access your personalized learning dashboard.</p>
            </div>


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                  {errorMsg}
                </div>
              )}
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2 transition-colors group-focus-within:text-[#0B1F4D]">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('email')}
                    className={`w-full px-5 py-3.5 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50/50'} focus:bg-white focus:ring-2 focus:ring-[#C89B3C]/50 focus:border-[#C89B3C] outline-none transition-all duration-200 text-[#1A1A1A]`}
                    placeholder="Enter your registered email"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-[#1A1A1A] transition-colors group-focus-within:text-[#0B1F4D]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full px-5 py-3.5 rounded-xl border ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50/50'} focus:bg-white focus:ring-2 focus:ring-[#C89B3C]/50 focus:border-[#C89B3C] outline-none transition-all duration-200 text-[#1A1A1A] pr-12`}
                    placeholder="Enter Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[14px] text-gray-400 hover:text-[#0B1F4D] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    {...register('remember')}
                    className="w-4 h-4 rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C] cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm font-medium text-[#60738A] cursor-pointer hover:text-[#1A1A1A] transition-colors">
                    Remember Me
                  </label>
                </div>
                <Link to="/student/forgot-password" className="text-sm font-semibold text-[#C89B3C] hover:text-[#0B1F4D] transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#0B1F4D] to-[#15347B] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-[0_8px_20px_rgba(11,31,77,0.25)] transition-all duration-300 disabled:opacity-70 group mt-4 border border-[#0B1F4D]"
              >
                {/* Gold hover overlay */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#C89B3C] to-[#E3BE70] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      Enter Student Portal
                      <ChevronRight className="w-5 h-5 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
            
            <p className="mt-8 text-center text-sm text-[#60738A]">
              Don't have an account?{' '}
              <Link to={`/student/register${location.search}`} className="text-[#0B1F4D] font-bold hover:underline transition-all">Enroll Now</Link>
            </p>
          </div>

          {/* Features Available After Login */}
          <div className="w-full mt-8 animate-in fade-in duration-1000 delay-300 fill-mode-both px-2">
            <h3 className="text-[11px] font-bold text-[#60738A] mb-4 uppercase tracking-widest text-center">Your Learning Tools</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center text-xs font-medium text-[#1A1A1A] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/60">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" /> My Courses
              </span>
              <span className="inline-flex items-center text-xs font-medium text-[#1A1A1A] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/60">
                <Video className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" /> Live Sessions
              </span>
              <span className="inline-flex items-center text-xs font-medium text-[#1A1A1A] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/60">
                <Target className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" /> Mock Exams
              </span>
              <span className="inline-flex items-center text-xs font-medium text-[#1A1A1A] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/60">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" /> Case Studies
              </span>
              <span className="inline-flex items-center text-xs font-medium text-[#1A1A1A] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/60">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" /> Study Notes
              </span>
              <span className="inline-flex items-center text-xs font-medium text-[#1A1A1A] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/60">
                <Award className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" /> Certificates
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 flex items-center justify-center text-xs font-medium text-[#60738A] animate-in fade-in duration-1000 delay-500 fill-mode-both bg-white px-4 py-2.5 rounded-full shadow-sm border border-gray-200/60">
            <Lock className="w-3.5 h-3.5 mr-2 text-green-600" />
            Secure Student Portal. Your progress is automatically saved.
          </div>
          
          {/* Mobile Footer */}
          <div className="md:hidden w-full mt-12 text-center text-xs text-[#60738A] pb-8">
             <p>© 2026 Dr. Sam Reefath Radiology Academy</p>
             <div className="flex justify-center space-x-4 mt-3">
               <Link to="/policy/privacy" className="hover:text-[#0B1F4D] font-medium">Privacy Policy</Link>
               <Link to="/policy/terms" className="hover:text-[#0B1F4D] font-medium">Terms & Conditions</Link>
               <Link to="/policy/refund" className="hover:text-[#0B1F4D] font-medium">Refund Policy</Link>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}
