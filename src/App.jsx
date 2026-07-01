import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import EnrollmentReview from './pages/payment/EnrollmentReview';
import SecurePayment from './pages/payment/SecurePayment';
import PaymentProcessing from './pages/payment/PaymentProcessing';
import PaymentResult from './pages/payment/PaymentResult';

import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import StudentForgotPassword from './pages/auth/StudentForgotPassword';
import StudentResetPassword from './pages/auth/StudentResetPassword';
import PolicyPage from './pages/PolicyPage';
import { PlatformProvider } from './context/PlatformContext';
import { getMe } from './services/userService';
function MainApp({ userSession, setUserSession, view, setView }) {
  const [initialCategory, setInitialCategory] = useState('All Categories');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('dashboard');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const enrollId = params.get('enroll');
    const courseIdParam = params.get('courseId');
    const previewId = params.get('preview');
    
    if (enrollId) {
      setSelectedCourseId(enrollId);
      setView('enrollment-review');
      // Clear the query param from the URL to prevent loops
      navigate('/', { replace: true });
    } else if (courseIdParam && previewId) {
      setSelectedCourseId(courseIdParam);
      setView('course-detail');
      // Don't clear it immediately so CourseDetailPage can read previewId
    }
  }, [location.search, navigate, setView]);

  const handleNavigate = (targetView, param) => {
    setView(targetView);
    if (targetView === 'courses') {
      if (param) {
        setInitialCategory(param);
      } else {
        setInitialCategory('All Categories');
      }
    } else if (targetView === 'course-detail') {
      if (param) {
        setSelectedCourseId(param);
      }
    } else if (targetView === 'enrollment-review' || targetView === 'secure-payment' || targetView === 'payment-processing') {
      if (param) {
        setSelectedCourseId(param);
      }
    } else if (targetView === 'dashboard') {
      if (param) {
        setDashboardTab(param);
      }
    }
  };

  const handleLoginSuccess = (user) => {
    setUserSession(user);
    if (view === 'course-detail') {
      setView('enrollment-review');
    } else if (user.role === 'Student' || user.role === 'Radiology Student' || user.role === 'student') {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserSession(null);
    setView('home');
  };

  return (
    <>
      {view === 'home' && (
        <Home 
          userSession={userSession}
          onViewChange={handleNavigate} 
        />
      )}
      {view === 'courses' && (
        <CoursesPage 
          onNavigate={handleNavigate} 
          initialCategory={initialCategory} 
          onLoginSuccess={handleLoginSuccess} 
          userSession={userSession}
        />
      )}
      {view === 'course-detail' && (
        <CourseDetailPage 
          onNavigate={handleNavigate} 
          courseId={selectedCourseId} 
          onLoginSuccess={handleLoginSuccess} 
          userSession={userSession}
        />
      )}
      {view === 'dashboard' && (
        <StudentDashboard 
          userSession={userSession} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
          initialTab={dashboardTab}
        />
      )}
      {view === 'enrollment-review' && (
        <EnrollmentReview 
          userSession={userSession} 
          courseId={selectedCourseId}
          onNavigate={handleNavigate} 
        />
      )}
      {view === 'secure-payment' && (
        <SecurePayment 
          userSession={userSession} 
          courseId={selectedCourseId}
          onNavigate={handleNavigate} 
        />
      )}
      {view === 'payment-processing' && (
        <PaymentProcessing 
          onNavigate={handleNavigate} 
        />
      )}
      {view === 'payment-success' && (
        <PaymentResult 
          userSession={userSession}
          status="success"
          courseId={selectedCourseId}
          onNavigate={handleNavigate} 
        />
      )}
      {view === 'payment-failed' && (
        <PaymentResult 
          userSession={userSession}
          status="failed"
          courseId={selectedCourseId}
          onNavigate={handleNavigate} 
        />
      )}
    </>
  );
}

function App() {
  const [userSession, setUserSession] = useState(null);
  const [view, setView] = useState('home');
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(res => {
           if(res && res.data) {
             setUserSession(res.data);
           }
        })
        .catch(err => {
           console.error('Session hydration failed', err);
           localStorage.removeItem('token');
        })
        .finally(() => {
           setIsLoadingSession(false);
        });
    } else {
      setIsLoadingSession(false);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setUserSession(user);
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#030919] flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-[#C89B3C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <PlatformProvider>
      <Router>
        <Routes>
          <Route path="/student/login" element={<StudentLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
          <Route path="/student/reset-password/:token" element={<StudentResetPassword />} />
          <Route path="/policy/:type" element={<PolicyPage />} />
          <Route path="/*" element={<MainApp userSession={userSession} setUserSession={setUserSession} view={view} setView={setView} />} />
        </Routes>
      </Router>
    </PlatformProvider>
  );
}

export default App;
