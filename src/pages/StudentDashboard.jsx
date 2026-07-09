import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dark_logo from "../assets/dark_logo_transparent.png";
import company_name from "../assets/company_name_transparent.png";
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { io } from 'socket.io-client';

// Import modular sub-components
import CourseLearningTab from '../components/dashboard/CourseLearningTab';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import OverviewTab from '../components/dashboard/OverviewTab';
import CoursesTab from '../components/dashboard/CoursesTab';
import LiveClassesTab from '../components/dashboard/LiveClassesTab';
import RecordedSessionsTab from '../components/dashboard/RecordedSessionsTab';
import CaseLibraryTab from '../components/dashboard/CaseLibraryTab';
import McqTestsTab from '../components/dashboard/McqTestsTab';
import MockExamsTab from '../components/dashboard/MockExamsTab';
import DailyLearningTab from '../components/dashboard/DailyLearningTab';
import BookmarksTab from '../components/dashboard/BookmarksTab';
import NotesTab from '../components/dashboard/NotesTab';
import NotificationsTab from '../components/dashboard/NotificationsTab';
import HelpdeskTab from '../components/dashboard/HelpdeskTab';
import ProfileSettingsTab from '../components/dashboard/ProfileSettingsTab';
import { usePurchase } from '../context/PurchaseContext';
import { getMe, globalSearch, getNotifications, markAllNotificationsRead } from '../services/userService';
import { getLiveClasses } from '../services/liveClassService';
import axios from 'axios';

// Removed mock data arrays

export function StudentDashboard({ userSession, onNavigate, onLogout, initialTab = 'dashboard' }) {
  // Navigation Sidebar collapsed state & active view states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeCourseId, setActiveCourseId] = useState(null); // set when student opens a course
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasOngoingLiveClass, setHasOngoingLiveClass] = useState(false);
  const [liveClassAnalytics, setLiveClassAnalytics] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Interactive mini widgets state
  const [quizScore, setQuizScore] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [notesText, setNotesText] = useState('My Clinical Notes:\n- Remember: Dawson fingers lie perpendicular to the lateral ventricles.\n- Review Stanford B aortic dissection protocols this evening.');
  const [notesSaved, setNotesSaved] = useState(false);
  const [liveClassFilter, setLiveClassFilter] = useState('upcoming');
  const [recordedFilter, setRecordedFilter] = useState('all');

  const { purchasedCourses } = usePurchase();
  const [userProfile, setUserProfile] = useState(null);

  // Derive actual enrolled courses from the userProfile if available
  let actualEnrolledCourses = [];
  if (userProfile?.enrolledCourses && userProfile.enrolledCourses.length > 0) {
    actualEnrolledCourses = userProfile.enrolledCourses
      .filter(e => e.course) // ensure course was populated successfully
      .map(e => ({
        id: e.course._id || e.course,
        title: e.course.title || 'Unknown Course',
        mentor: e.course.instructor?.name || 'Dr. Sam Reefath',
        progress: e.progress || 0,
        lastAccessed: e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : 'N/A',
        image: e.course.thumbnail || 'physics', // fallback
        modules: e.course.modules?.length || 0,
        remaining: e.course.modules ? e.course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) - Math.floor((e.progress || 0) / 10) : 0,
        completedModules: Math.floor((e.progress || 0) / 10),
      }));
  } else {
    // Fallback if not loaded
    actualEnrolledCourses = [];
  }

  // Fetch full user profile to calculate profile completion
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMe();
        if (response?.data) {
          setUserProfile(response.data);
        }
      } catch (err) {
        console.error("Failed to load user profile in dashboard:", err);
      }
    };
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        if (res?.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    const fetchLiveStatus = async () => {
      try {
        const res = await getLiveClasses();
        if (res?.success) {
          // Check if any class is currently "Live Now"
          const isOngoing = res.data.some(c => c.status === 'Live Now');
          setHasOngoingLiveClass(isOngoing);
        }
      } catch (err) {
        console.error("Failed to fetch live classes for status:", err);
      }
    };
    fetchProfile();
    fetchNotifications();
    fetchLiveStatus();

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // User ID is derived in backend from token or passed if needed. We'll use the /my-stats approach if we had one.
        // Actually, we added /student/:id, so we need the ID
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const studentId = storedUser._id || storedUser.id;
        if (!studentId) return;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/student/${studentId}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
           setLiveClassAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch live class analytics:", err);
      }
    };
    fetchAnalytics();

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [liveClassUpdateTrigger, setLiveClassUpdateTrigger] = useState(0);

  // Socket.io Initialization for Real-Time Updates
  useEffect(() => {
    if (!userProfile || !userProfile._id) return;

    const socket = io(import.meta.env.VITE_BASE_URL);

    // Join personal user room for notifications
    socket.emit('setup', userProfile);

    socket.on('newNotification', (notif) => {
      // Instantly show the new notification in the list without refresh
      setNotifications(prev => [notif, ...prev]);
      // Simple native browser alert for instant visibility (could be replaced with a toast UI)
      alert(`New Notification: ${notif.title}`);
    });

    socket.on('liveClassUpdate', (data) => {
      // A live class status was updated, instantly re-fetch status
      setLiveClassUpdateTrigger(prev => prev + 1);
      const fetchLiveStatus = async () => {
        try {
          const res = await getLiveClasses();
          if (res?.success) {
            const isOngoing = res.data.some(c => c.status === 'Live Now');
            setHasOngoingLiveClass(isOngoing);
          }
        } catch (err) {
          console.error("Failed to fetch live classes for status:", err);
        }
      };
      fetchLiveStatus();
    });

    return () => {
      socket.disconnect();
    };
  }, [userProfile]);

  // Calculate dynamic profile completion percentage
  let profileCompletion = 20; // Base 20% for just having an account
  if (userProfile) {
    const fieldsToCheck = ['name', 'email', 'phoneNumber', 'gender', 'dob', 'qualification', 'specialization', 'address', 'city', 'state', 'country'];
    const filledFields = fieldsToCheck.filter(field => userProfile[field] && userProfile[field].trim() !== '');
    // Math: 20% base + 80% based on fields
    profileCompletion = 20 + Math.round((filledFields.length / fieldsToCheck.length) * 80);
  } else if (userSession) {
    // Fallback if not loaded yet
    const baseFields = ['name', 'email'];
    const filledBase = baseFields.filter(f => userSession[f]);
    profileCompletion = 20 + Math.round((filledBase.length / 11) * 80);
  }

  const renderAvatar = (imagePath) => {
    if (!imagePath || imagePath === 'default.jpg' || imagePath === '👨‍⚕️') return '👨‍⚕️';
    const src = imagePath.startsWith('http') ? imagePath : `${import.meta.env.VITE_BASE_URL}/uploads/${imagePath}`;
    return <img src={src} alt="avatar" className="w-full h-full object-cover rounded-full" />;
  };

  // Create a dynamic profile based on user session
  const dynamicProfile = {
    name: userProfile?.name || userSession?.name || 'Student',
    email: userProfile?.email || userSession?.email || '',
    mobile: userProfile?.phoneNumber || '',
    specialty: userProfile?.specialization || 'Radiology',
    badge: userProfile?.role || userSession?.role || 'Fellow',
    avatar: renderAvatar(userProfile?.profileImage),
    overallProgress: profileCompletion,
    streak: userProfile?.streakDays || 0,
    hoursLearned: userProfile?.learningMinutes ? Math.floor(userProfile.learningMinutes / 60) : 0,
    completedLessons: userProfile?.completedLessons?.length || 0,
    examReadyScore: userProfile?.averageMockScore || 0,
    purchasedCourses: actualEnrolledCourses.length,
    subscriptionType: 'Basic'
  };

  const TAB_LABELS = {
    'dashboard': 'Overview',
    'courses': 'My Courses',
    'course-learning': 'Course Learning',
    'live': 'Live Classes',
    'recorded': 'Recorded Sessions',
    'cases': 'Case Library',
    'mcq': 'MCQ Tests',
    'mocks': 'Mock Exams',
    'daily': 'Daily Learning',
    'bookmarks': 'Bookmarks',
    'notes': 'Notes',
    'notifications': 'Notifications',
    'profile-settings': 'Profile Settings',
    'certificates': 'Certificates',
    'help': 'Help & Support'
  };

  const handleBreadcrumbNavigate = (targetView, targetTabOrParam) => {
    if (targetView === 'dashboard') {
      setActiveTab(targetTabOrParam || 'dashboard');
    } else {
      if (onNavigate) {
        onNavigate(targetView, targetTabOrParam);
      }
    }
  };

  // Trigger search dropdown updates
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await globalSearch(searchQuery);
        setSearchResults(res.data || []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Search failed", err);
        setSearchResults([]);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNotesSave = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleQuizSubmit = (correctIdx) => {
    if (selectedQuizOption === null) return;
    setQuizScore(selectedQuizOption === correctIdx ? 'Correct! Excellent clinical knowledge.' : 'Incorrect. DWI tracks hyperacute restricted water diffusion.');
  };

  // Nav icons lookup
  const getMenuIcon = (label) => {
    const svgs = {
      'Dashboard': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />,
      'My Courses': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
      'Live Classes': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
      'Recorded Sessions': <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
      'Case Library': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />,
      'MCQ Tests': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
      'Mock Exams': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      'Daily Learning': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />,
      'Bookmarks': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />,
      'Notes': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
      'Notifications': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
      'Certificates': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
      'Profile Settings': <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
      'Help & Support': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    };

    return (
      <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {svgs[label] || (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        )}
      </svg>
    );
  };

  return (
    <div 
      className="min-h-screen text-slate-800 flex font-sans overflow-x-hidden relative selection:bg-accent selection:text-[#0B1F4D] antialiased"
      style={{
        background: 'radial-gradient(circle at 90% 10%, rgba(200, 155, 60, 0.04) 0%, rgba(245, 247, 250, 1) 55%, rgba(11, 31, 77, 0.03) 100%)'
      }}
    >

      {/* 1. Collapsible Left Sidebar */}
      <DashboardSidebar 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        STUDENT_PROFILE={dynamicProfile}
        dark_logo={dark_logo}
        company_name={company_name}
        getMenuIcon={getMenuIcon}
        unreadNotificationCount={notifications.filter(n => !n.isRead).length}
        hasOngoingLiveClass={hasOngoingLiveClass}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-grow flex flex-col min-w-0 z-10 relative">
        
        {/* Sticky Top Header */}
        <DashboardHeader 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearchDropdown={showSearchDropdown}
          searchResults={searchResults}
          setActiveTab={setActiveTab}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          onLogout={onLogout}
          STUDENT_PROFILE={dynamicProfile}
          unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
          ENROLLED_COURSES={actualEnrolledCourses}
          liveClassUpdateTrigger={liveClassUpdateTrigger}
        />

        {/* 3. DYNAMIC CONTENT SCROLL Workspace */}
        <main className="flex-grow p-3 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-68px)] scroll-smooth relative z-10 text-left">
          
          {/* Dynamic Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs 
              paths={[
                { label: 'Home', view: 'home' },
                { label: 'Dashboard', view: 'dashboard', tab: 'dashboard' },
                ...(activeTab !== 'dashboard' ? [{ label: TAB_LABELS[activeTab] || activeTab }] : [])
              ]} 
              onNavigate={handleBreadcrumbNavigate} 
            />
          </div>

          {activeTab === 'dashboard' && (
            <OverviewTab 
              STUDENT_PROFILE={dynamicProfile}
              ENROLLED_COURSES={actualEnrolledCourses}
              setActiveTab={setActiveTab}
              onEnterCourse={(courseId) => { setActiveCourseId(courseId); setActiveTab('course-learning'); }}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesTab 
              ENROLLED_COURSES={actualEnrolledCourses}
              onNavigate={onNavigate}
              onEnterCourse={(courseId) => { setActiveCourseId(courseId); setActiveTab('course-learning'); }}
            />
          )}

          {activeTab === 'course-learning' && (
            <CourseLearningTab
              courseId={activeCourseId}
              setActiveTab={setActiveTab}
              enrolledCourseInfo={actualEnrolledCourses.find(c => c.id === activeCourseId)}
            />
          )}

          {activeTab === 'live' && (
            <LiveClassesTab 
              setActiveTab={setActiveTab}
              userProfile={userProfile}
              ENROLLED_COURSES={actualEnrolledCourses}
              onEnterCourse={(courseId) => { setActiveCourseId(courseId); setActiveTab('course-learning'); }}
            />
          )}

          {activeTab === 'recorded' && (
            <RecordedSessionsTab 
              recordedFilter={recordedFilter}
              setRecordedFilter={setRecordedFilter}
              userProfile={userProfile}
              ENROLLED_COURSES={actualEnrolledCourses}
              onEnterCourse={(courseId) => { setActiveCourseId(courseId); setActiveTab('course-learning'); }}
            />
          )}

          {activeTab === 'cases' && (
            <CaseLibraryTab 
              CASE_LIBRARY={[]}
            />
          )}

          {activeTab === 'mcq' && (
            <McqTestsTab 
              MCQ_TESTS={[]}
            />
          )}

          {activeTab === 'mocks' && (
            <MockExamsTab />
          )}

          {activeTab === 'daily' && (
            <DailyLearningTab 
              DAILY_FEED={null}
              selectedQuizOption={selectedQuizOption}
              setSelectedQuizOption={setSelectedQuizOption}
              quizScore={quizScore}
              handleQuizSubmit={handleQuizSubmit}
            />
          )}

          {activeTab === 'bookmarks' && (
            <BookmarksTab />
          )}

          {activeTab === 'notes' && (
            <NotesTab 
              notesText={notesText}
              setNotesText={setNotesText}
              notesSaved={notesSaved}
              handleNotesSave={handleNotesSave}
              onSave={handleNotesSave}
              saved={notesSaved}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab 
              onMount={async () => {
                const hasUnread = notifications.some(n => !n.isRead);
                if (hasUnread) {
                  try {
                    await markAllNotificationsRead();
                    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                  } catch (e) {
                    console.error("Failed to mark read:", e);
                  }
                }
              }}
              NOTIFICATIONS={notifications.map(n => ({
                id: n._id,
                type: n.type,
                title: n.title,
                desc: n.message,
                time: new Date(n.createdAt).toLocaleDateString(),
                isRead: n.isRead,
                link: n.link
              }))} 
              onNotificationClick={(not) => {
                if (not.link) {
                  // Handle dashboard tab navigation (e.g., /student/dashboard?tab=live)
                  if (not.link.includes('tab=')) {
                    const tab = new URLSearchParams(not.link.split('?')[1]).get('tab');
                    if (tab) {
                      setActiveTab(tab);
                      return;
                    }
                  }
                  // Handle course detail navigation (e.g., /courses/123)
                  if (not.link.includes('/courses/')) {
                    const courseId = not.link.split('/courses/')[1];
                    onNavigate('course-detail', courseId);
                    return;
                  }
                }
                
                // Fallback to type-based navigation
                if (not.type === 'live_class') setActiveTab('live');
                else if (not.type === 'course') setActiveTab('courses');
                else if (not.type === 'recording') setActiveTab('recorded');
              }}
            />
          )}

          {activeTab === 'certificates' && <div className="text-slate-500 p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 flex items-center justify-center font-semibold animate-pulse">Certificates integration pending...</div>}

          {activeTab === 'profile-settings' && (
            <ProfileSettingsTab 
              STUDENT_PROFILE={dynamicProfile}
              ENROLLED_COURSES={actualEnrolledCourses}
              onNavigate={onNavigate}
            />
          )}

          {activeTab === 'help' && (
            <HelpdeskTab />
          )}

        </main>

        {/* Minimal Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 z-20">
          <div className="font-medium">© 2026 Dr. Sam Reefath Radiology Academy. All Access Student Portal.</div>
          <div className="flex space-x-4 mt-2 sm:mt-0 font-bold">
            <Link to="/policy/privacy" className="hover:text-slate-600 focus:outline-none cursor-pointer transition-colors duration-200">Privacy Policy</Link>
            <Link to="/policy/terms" className="hover:text-slate-600 focus:outline-none cursor-pointer transition-colors duration-200">Terms of Service</Link>
            <Link to="/policy/refund" className="hover:text-slate-600 focus:outline-none cursor-pointer transition-colors duration-200">Refund Policy</Link>
          </div>
        </footer>

      </div>

    </div>
  );
}

export default StudentDashboard;
