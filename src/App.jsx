import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import Home from './pages/Home';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import EnrollmentReview from './pages/payment/EnrollmentReview';
import SecurePayment from './pages/payment/SecurePayment';
import PaymentProcessing from './pages/payment/PaymentProcessing';
import PaymentResult from './pages/payment/PaymentResult';
import WebRTCRoom from './pages/classroom/WebRTCRoom';
import StudentLiveClassMock from './pages/classroom/StudentLiveClassMock';

import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import StudentForgotPassword from './pages/auth/StudentForgotPassword';
import StudentResetPassword from './pages/auth/StudentResetPassword';
import PolicyPage from './pages/PolicyPage';
import { PlatformProvider } from './context/PlatformContext';
import { getMe } from './services/userService';
import { getCourseById } from './services/courseService';

// Wrapper that reads the slug from URL params and renders CourseDetailPage
function CourseDetailWrapper({ userSession, setUserSession }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    if (slug) {
      getCourseById(slug)
        .then(res => { if (res?.data?._id) setCourseId(res.data._id); })
        .catch(() => navigate('/', { replace: true }));
    }
  }, [slug, navigate]);

  const handleLoginSuccess = (user) => { setUserSession(user); };
  const handleNavigate = (view, param) => {
    if (view === 'courses') navigate('/?view=courses');
    else if (view === 'home') navigate('/');
    else if (view === 'dashboard') navigate('/?view=dashboard');
    else if (view === 'enrollment-review') navigate(`/?view=enrollment-review&courseId=${param || courseId}`);
    else if (view === 'secure-payment') navigate(`/?view=secure-payment&courseId=${param || courseId}`);
    else if (view === 'course-detail' && param) navigate(`/?view=course-detail&courseId=${param}`);
    else navigate(`/?view=${view}`);
  };

  if (!courseId) return (
    <div className="min-h-screen bg-[#030919] flex items-center justify-center">
      <svg className="animate-spin h-10 w-10 text-[#C89B3C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  return <CourseDetailPage onNavigate={handleNavigate} courseId={courseId} onLoginSuccess={handleLoginSuccess} userSession={userSession} />;
}
function MainApp({ userSession, setUserSession }) {
  const [initialCategory, setInitialCategory] = useState('All Categories');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('dashboard');

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get('view') || 'home';
  const activeCourseId = selectedCourseId || searchParams.get('courseId');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const enrollId = params.get('enroll');
    const courseIdParam = params.get('courseId');
    const previewId = params.get('preview');

    if (enrollId) {
      setSelectedCourseId(enrollId);
      // Move to enrollment review and clear enrollId
      navigate('?view=enrollment-review', { replace: true });
    } else if (courseIdParam && previewId && view !== 'course-detail') {
      setSelectedCourseId(courseIdParam);
      navigate(`?view=course-detail&courseId=${courseIdParam}&preview=${previewId}`, { replace: true });
    }
  }, [location.search, navigate, view]);

  const handleNavigate = (targetView, param) => {
    const params = new URLSearchParams(location.search);
    params.set('view', targetView);
    
    if (targetView === 'courses') {
      if (param) setInitialCategory(param);
      else setInitialCategory('All Categories');
    } else if (targetView === 'course-detail') {
      // Navigate to slug URL if param is an _id; we need to look it up
      // For now navigate with courseId query param — slug URL is set in course cards
      if (param) setSelectedCourseId(param);
      const newParams = new URLSearchParams();
      newParams.set('view', 'course-detail');
      newParams.set('courseId', param);
      navigate(`?${newParams.toString()}`);
      return;
    } else if (targetView === 'enrollment-review' || targetView === 'secure-payment' || targetView === 'payment-processing') {
      if (param) setSelectedCourseId(param);
    } else if (targetView === 'dashboard') {
      if (param) setDashboardTab(param);
    }
    
    const newParams = new URLSearchParams();
    newParams.set('view', targetView);
    if (params.has('preview')) newParams.set('preview', params.get('preview'));
    if (params.has('courseId')) newParams.set('courseId', params.get('courseId'));

    navigate(`?${newParams.toString()}`);
  };

  const handleLoginSuccess = (user) => {
    setUserSession(user);
    if (view === 'course-detail') {
      navigate('?view=enrollment-review');
    } else if (user.role === 'Student' || user.role === 'Radiology Student' || user.role === 'student') {
      navigate('?view=dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserSession(null);
    navigate('?view=home');
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
          courseId={activeCourseId}
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
          courseId={activeCourseId}
          onNavigate={handleNavigate}
        />
      )}
      {view === 'secure-payment' && (
        <SecurePayment
          userSession={userSession}
          courseId={activeCourseId}
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
          courseId={activeCourseId}
          onNavigate={handleNavigate}
        />
      )}
      {view === 'payment-failed' && (
        <PaymentResult
          userSession={userSession}
          status="failed"
          courseId={activeCourseId}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}

function App() {
  const [userSession, setUserSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(res => {
          if (res && res.data) {
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

  if (isLoadingSession && window.location.pathname !== '/studlive') {
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
          <Route path="/webrtc/:roomId" element={<WebRTCRoom />} />
          <Route path="/studlive" element={<StudentLiveClassMock />} />
          <Route path="/policy/:type" element={<PolicyPage />} />
          <Route path="/courses/:slug" element={<CourseDetailWrapper userSession={userSession} setUserSession={setUserSession} />} />
          <Route path="/*" element={<MainApp userSession={userSession} setUserSession={setUserSession} />} />
        </Routes>
      </Router>
    </PlatformProvider>
  );
}

export default App;
