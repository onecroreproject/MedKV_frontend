import React, { useState, useEffect } from 'react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import Button from '../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm, RegisterForm, ResetPasswordForm } from '../features/auth';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { usePurchase } from '../context/PurchaseContext';
import { getCourseById, getPublishedCourses } from '../services/courseService';
import { getMe } from '../services/userService';

// Fallback dummy images mapping since we don't have them in backend
const getFallbackImage = (category) => {
  if(category?.includes('FRCR Part 1')) return 'physics';
  if(category?.includes('FRCR Part 2A')) return 'systemic';
  if(category?.includes('FRCR Part 2B')) return 'viva';
  if(category?.includes('Anatomy')) return 'anatomy';
  if(category?.includes('Pathology')) return 'pathology';
  if(category?.includes('Ultrasound')) return 'ultrasound';
  if(category?.includes('Protocols') || category?.includes('CT')) return 'ct';
  return 'neuro';
};

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
    : 'http://localhost:5000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export function CourseDetailPage({ onNavigate, courseId, onLoginSuccess, userSession }) {
  // Navigation and Authentication States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();

  const [previewVideo, setPreviewVideo] = useState(null);

  // Curriculum Accordion State (tracks open module indices)
  const [openModules, setOpenModules] = useState({ 0: true, 1: false });

  const [openFaq, setOpenFaq] = useState(null);

  const { hasPurchased } = usePurchase();
  const isPurchased = hasPurchased(courseId);

  const [course, setCourse] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile completion state
  const [profileCompletion, setProfileCompletion] = useState(100);
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const res = await getCourseById(courseId);
        const data = res.data;
        if(data) {
          setCourse({
            id: data._id,
            title: data.title,
            category: data.category?.name || data.category,
            tagline: data.description?.substring(0, 50) + '...',
            description: data.description,
            faculty: data.instructor?.name || 'Unknown Faculty',
            rating: 5.0,
            students: '100+',
            duration: 'Self-Paced',
            lessons: data.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
            difficulty: data.level || '',
            price: data.price || 0,
            originalPrice: data.originalPrice || null,
            previewVideoUrl: data.previewVideoUrl || null,
            imageType: getFallbackImage(data.category?.name || data.category),
            modules: data.modules || [],
            learningOutcomes: data.learningOutcomes || [],
            liveSessions: data.liveSessions || [],
            pacsCases: data.pacsCases || [],
            mockExams: data.mockExams || [],
            testimonials: data.testimonials || [],
            faqs: data.faqs || [],
            languages: data.languages || []
          });
        }

        const pubRes = await getPublishedCourses();
        if (pubRes && pubRes.data) {
          const others = pubRes.data.filter(c => c._id !== courseId).slice(0, 3);
          setRecommendedCourses(others.map(c => ({
            id: c._id,
            title: c.title,
            price: c.price || 0,
            originalPrice: c.originalPrice || null,
            imageType: getFallbackImage(c.category?.name || c.category),
            categoryName: c.category?.name || c.category || 'radiodiagnosis'
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (course && userSession && location.search) {
      const params = new URLSearchParams(location.search);
      const previewId = params.get('preview');
      if (previewId) {
        let foundVideo = null;
        course.modules.forEach(m => {
          m.lessons?.forEach(l => {
            if (l._id === previewId && l.isFreePreview) {
              foundVideo = l.videoUrl;
            }
          });
        });
        if (foundVideo) {
          setPreviewVideo(foundVideo);
          navigate(`/?courseId=${courseId}`, { replace: true });
        }
      }
    }
  }, [course, userSession, location.search, navigate, courseId]);

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (userSession) {
        try {
          const res = await getMe();
          if (res?.data) {
            const user = res.data;
            const fieldsToCheck = ['name', 'email', 'phoneNumber', 'gender', 'dob', 'qualification', 'specialization', 'address', 'city', 'state', 'country'];
            const filledFields = fieldsToCheck.filter(field => user[field] && user[field].trim() !== '');
            const completion = 20 + Math.round((filledFields.length / fieldsToCheck.length) * 80);
            setProfileCompletion(completion);
          }
        } catch (err) {
          console.error("Failed to load user profile for completion check:", err);
        }
      }
    };
    fetchProfileCompletion();
  }, [userSession]);

  const handleLoginSuccess = (user) => {
    setIsLoginOpen(false);
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  const handleEnrollClick = () => {
    if (isPurchased) {
      onNavigate('dashboard');
    } else if (userSession) {
      if (profileCompletion < 100) {
        setShowIncompleteProfileModal(true);
      } else {
        // Use course.id (MongoDB _id) not the slug prop
        onNavigate('enrollment-review', course?.id || courseId);
      }
    } else {
      navigate(`/student/login?enroll=${courseId}`);
    }
  };

  const toggleModule = (idx) => {
    setOpenModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleLessonClick = (lec) => {
    if (lec.isFreePreview) {
      if (userSession) {
        setPreviewVideo(lec.videoUrl);
      } else {
        const redirectUrl = `/?courseId=${courseId}&preview=${lec._id}`;
        navigate(`/student/register?redirect=${encodeURIComponent(redirectUrl)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-charcoal flex flex-col font-sans selection:bg-accent selection:text-white overflow-x-hidden relative">
      
      {/* 1. NAVBAR (Sticky with Navigation State Callbacks) */}
      <Navbar userSession={userSession} onLoginClick={() => navigate('/student/login')} onViewChange={onNavigate} />

      {/* Main layout with top margin for sticky header */}
      <main className="flex-grow pt-24 sm:pt-32 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-10">

        {/* INCOMPLETE PROFILE NOTICE MODAL */}
        {showIncompleteProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center">
              <button 
                onClick={() => setShowIncompleteProfileModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
              <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-[#0B1F4D] mb-2 uppercase tracking-wide">Action Required</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Your profile is currently at <strong>{profileCompletion}%</strong> completion. You must complete your profile with all required details (such as your specialization, address, and mobile number) before you are eligible to purchase a course.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="primary" 
                  className="w-full shadow-lg shadow-primary/25"
                  onClick={() => {
                    setShowIncompleteProfileModal(false);
                    onNavigate('dashboard', 'profile-settings');
                  }}
                >
                  Complete Profile Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowIncompleteProfileModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>
        ) : !course ? (
          <div className="text-center p-20 text-gray-500 font-medium">Course not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            
            {/* LEFT CONTENT AREA (Col span 8) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* 2. COURSE HERO SECTION */}
              <section className="bg-gradient-to-br from-[#030919] to-[#0A1733] text-white p-6 sm:p-10 rounded-3xl border border-accent/20 relative overflow-hidden shadow-xl text-left">
                {/* Radial glow details */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="space-y-5 relative z-10">

                  {/* Breadcrumbs — top of hero card */}
                  <Breadcrumbs 
                    paths={[
                      { label: 'Home', view: 'home' },
                      { label: 'Courses', view: 'courses', param: 'All Categories' },
                      { label: course.title }
                    ]} 
                    onNavigate={onNavigate} 
                    variant="dark"
                  />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-accent text-[#050E24] text-[9.5px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
                    {course.category}
                  </span>
                  {course.difficulty && (
                    <span className="bg-white/10 text-white text-[9.5px] font-bold px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">
                      {course.difficulty}
                    </span>
                  )}
                </div>

                <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
                  {course.title}
                </h1>
                
                <h3 className="text-accent font-extrabold text-sm sm:text-base tracking-wide uppercase">
                  {course.tagline}
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed max-w-3xl">
                  {course.description}
                </p>

                {/* Rating & stats metrics */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs text-slate-300 font-medium">
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    <span className="text-accent font-black text-sm">★ {course.rating.toFixed(1)}</span>
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 fill-accent" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-slate-400">({course.students} reviews)</span>
                  </div>

                  <span>•</span>
                  <span>{course.students} Enrolled Candidates</span>
                  <span>•</span>
                  <span>Faculty: <span className="text-white font-bold">{course.faculty}</span></span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-400 text-[10.5px] uppercase tracking-wider font-semibold">
                  <span>Duration: {course.duration}</span>
                  {course.lessons > 0 && (
                    <>
                      <span>•</span>
                      <span>Lessons: {course.lessons} Lectures</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Last Updated: 05/2026</span>
                  <span>•</span>
                  <span>Language: {course.languages && course.languages.length > 0 ? course.languages.join(', ') : 'English'}</span>
                </div>

                {/* Mobile specific buy button (Hidden on Desktop) */}
                <div className="lg:hidden pt-4 flex flex-col gap-3">
                  <div className="text-2xl font-black text-white flex items-center justify-between">
                    <span>Pricing: ₹{course.price}</span>
                    {course.originalPrice && <span className="text-xs text-slate-400 line-through">₹{course.originalPrice}</span>}
                  </div>
                  <Button
                    variant={isPurchased ? "primary" : "secondary"}
                    size="lg"
                    onClick={handleEnrollClick}
                    className={`w-full uppercase tracking-widest text-xs font-black py-4 shadow-lg ${isPurchased ? 'shadow-primary/25' : 'shadow-accent/25'}`}
                  >
                    {isPurchased ? 'Continue Learning →' : 'Enroll Now'}
                  </Button>
                </div>
              </div>
            </section>

            {/* 3. COURSE OVERVIEW SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-4 shadow-sm">
              <h3 className="text-primary font-black text-xl tracking-wide uppercase pb-2.5 border-b border-slate-100">
                About This Course
              </h3>
              <div className="text-blue-gray text-xs sm:text-sm leading-relaxed font-light space-y-4">
                <p>
                  This specialist radiology preparation program is designed specifically to help postgraduates, clinical fellows, and residents master the highly challenging syllabus components of the **Royal College of Radiologists (RCR) FRCR** and local medical boards (**DNB, MDRD, DMRD**).
                </p>
                <p>
                  Guided by expert active radiology advisors, candidates are introduced to an intense case-based curriculum. Unlike traditional abstract textbooks, you will learn to master radiological parameters by actively scrolling through cross-sectional scan files.
                </p>
                <div className="p-4 bg-soft-gray border-l-4 border-accent rounded-r-xl my-4 text-xs font-medium text-primary">
                  🧠 "Bridging the gap between clearing your theoretical board papers and writing highly structured, confident, and professional clinical diagnostic reads under acute hospital guidelines."
                </div>
                <p>
                  By completing mock boards, timed PACS reporting drills, and participating in weekly Zoom hot seat sessions, you will refine your exam pacing and diagnostic clinical logic to secure top scores.
                </p>
              </div>
            </section>

            {/* 4. WHAT YOU WILL LEARN SECTION */}
            {course.learningOutcomes?.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
                <h3 className="text-primary font-black text-xl tracking-wide uppercase pb-2.5 border-b border-slate-100">
                  What You Will Learn
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                  {course.learningOutcomes.map((outcome, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-soft-gray border border-slate-200 rounded-2xl flex items-start space-x-3.5 hover:border-accent/30 hover:bg-white transition-all duration-300 group cursor-pointer"
                    >
                      <span className="text-xl bg-white rounded-xl p-2 shadow-sm group-hover:scale-110 transition-transform">✓</span>
                      <div className="text-left text-xs">
                        <h4 className="text-primary font-black uppercase tracking-wider">{outcome.title}</h4>
                        <p className="text-blue-gray font-light leading-relaxed mt-1">{outcome.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. COURSE CURRICULUM SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-primary font-black text-xl tracking-wide uppercase">
                  Course Curriculum
                </h3>
                <span className="text-blue-gray text-xs font-semibold">
                  {course.modules?.length || 0} Modules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.modules?.length === 0 ? (
                  <p className="text-gray-500 text-sm col-span-2">No modules have been added to this course yet.</p>
                ) : course.modules?.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-xl bg-soft-gray/30 flex items-center space-x-3 text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary uppercase tracking-wide">
                        {mod.title}
                      </h4>
                      {mod.description && (
                        <p className="text-blue-gray text-[11px] font-normal leading-relaxed mt-0.5">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. LIVE CLASSES & RECORDINGS SECTION */}
            {course.liveSessions?.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
                <h3 className="text-primary font-black text-xl tracking-wide uppercase pb-2.5 border-b border-slate-100">
                  Zoom Live Classes & Recorded Replays
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {course.liveSessions.map((session, idx) => {
                    const isLive = session.sessionType === 'Live';
                    return (
                      <div key={idx} className="bg-soft-gray border border-slate-200 p-5 rounded-2xl flex flex-col justify-between h-full relative overflow-hidden text-xs">
                        <div className={`absolute top-0 right-0 text-[#050E24] text-[9.5px] font-black px-3.5 py-1 uppercase tracking-wider rounded-bl-xl shadow ${isLive ? 'bg-accent' : 'bg-primary text-white border-l border-b border-accent/20'}`}>
                          {isLive ? 'Upcoming Live' : 'Recording'}
                        </div>
                        
                        <div className="space-y-3.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isLive ? 'text-accent' : 'text-blue-gray'}`}>
                            {isLive ? 'Webinar Module' : 'Archived Replay'}
                          </span>
                          <h4 className="text-primary font-black text-sm uppercase tracking-wide leading-snug">{session.title}</h4>
                          
                          <div className="space-y-1.5 font-medium text-blue-gray">
                            {session.date && (
                              <div className="flex items-center space-x-2">
                                <span>{isLive ? '📅' : '📹'}</span>
                                <span>{isLive ? `Date: ${session.date}` : `Cloud Archive: ${session.duration}`}</span>
                              </div>
                            )}
                            {(session.time || session.accessibility) && (
                              <div className="flex items-center space-x-2">
                                <span>{isLive ? '⏱️' : '🔑'}</span>
                                <span>{isLive ? `Time: ${session.time}` : `Accessibility: ${session.accessibility}`}</span>
                              </div>
                            )}
                            {(course.faculty || session.accessTerms) && (
                              <div className="flex items-center space-x-2">
                                <span>{isLive ? '🩺' : '⏱️'}</span>
                                <span>{isLive ? `Mentor: ${course.faculty}` : `Access terms: ${session.accessTerms}`}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200/60 mt-4">
                          <Button
                            variant={isLive ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => navigate('/student/login')}
                            className="w-full text-[10px] py-2.5 uppercase tracking-widest font-black"
                          >
                            {isLive ? 'Attend via Zoom' : 'Access Recorded Replays'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 7. CASE-BASED LEARNING SECTION */}
            {course.pacsCases?.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
                <h3 className="text-primary font-black text-xl tracking-wide uppercase pb-2.5 border-b border-slate-100">
                  Radiology PACS Case preview Spotters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {course.pacsCases.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-soft-gray hover:border-accent/40 group cursor-pointer transition-all text-xs text-left shadow-sm flex flex-col justify-between"
                    >
                      <div className="h-32 bg-[#050E24] flex items-center justify-center relative">
                        {/* Laser scanning animations */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.05)_1px,transparent_1px)] bg-[size:15px_15px]" />
                        <span className="text-4xl group-hover:scale-115 transition-transform duration-300">🩻</span>
                        
                        <div className="absolute top-2.5 right-2.5 bg-accent text-[#050E24] text-[8.5px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                          {item.difficulty}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-blue-gray font-bold">
                          <span>{item.scans}</span>
                          <span className="text-accent uppercase tracking-widest">Interactive DICOM stacks</span>
                        </div>
                        <h4 className="text-primary font-black uppercase text-xs sm:text-sm group-hover:text-accent transition-colors leading-tight">
                          {item.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/student/login')}
                          className="p-0 text-accent font-bold group-hover:underline text-[10px] mt-1 shrink-0 uppercase tracking-widest justify-start"
                        >
                          View Interactive PACS Stack →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 8. MOCK EXAMS & ASSESSMENTS SECTION */}
            {course.mockExams?.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
                <h3 className="text-primary font-black text-xl tracking-wide uppercase pb-2.5 border-b border-slate-100">
                  Mock Board Exams & Assessments
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {course.mockExams.map((test, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-slate-200 rounded-2xl flex flex-col justify-between bg-soft-gray text-xs text-left shadow-sm h-full"
                    >
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 border border-accent/15 px-2 py-0.5 rounded">
                          {test.difficulty}
                        </span>
                        <h4 className="text-primary font-black uppercase text-sm leading-snug">{test.title}</h4>
                        
                        <div className="space-y-1 text-blue-gray font-medium text-[11px]">
                          <div>• Questions: {test.questions}</div>
                          <div>• Ticking Timer: {test.time}</div>
                          <div>• Evaluation: Detailed Heatmap telemetry report</div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/student/login')}
                          className="w-full text-[10px] py-2.5 font-black uppercase tracking-widest"
                        >
                          Attempt timed Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 9. MENTOR / FACULTY SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
              <h3 className="text-primary font-black text-xl tracking-wide uppercase pb-2.5 border-b border-slate-100">
                Senior Academic Mentor
              </h3>

              <div className="bg-soft-gray border border-slate-200 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-xs text-left shadow-inner">
                {/* Doctor Headshot placeholder */}
                <div className="h-32 w-32 rounded-3xl bg-[#050E24] border-2 border-accent shrink-0 flex items-center justify-center text-4xl shadow-md overflow-hidden relative">
                  <span className="relative z-10">🩺</span>
                  <div className="absolute inset-0 bg-accent/5 filter blur" />
                </div>

                <div className="space-y-3 flex-grow text-center sm:text-left">
                  <div>
                    <h4 className="text-primary font-black text-lg uppercase tracking-wide">{course.faculty}</h4>
                    <p className="text-accent text-[11px] font-extrabold uppercase tracking-widest mt-0.5">
                      Chief neuroradiology consultant & founder
                    </p>
                  </div>

                  <p className="text-blue-gray font-light leading-relaxed">
                    Accredited professor and former board examiner with over 15 years clinical experience guiding radiology Residents, clinical fellows, and doctors globally to secure top ranks.
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {['15+ Years Exp', 'Board certified', 'Active Examiner', 'Neuroradiology Spec'].map((badge) => (
                      <span key={badge} className="bg-white text-primary border border-slate-200 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 10. STUDENT REVIEWS & TESTIMONIALS */}
            {course.testimonials?.length > 0 && (
              <section className="bg-gradient-to-r from-[#030919] to-[#0A1733] text-white p-6 sm:p-8 rounded-3xl border border-accent/20 text-left space-y-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 text-8xl text-accent/5 font-serif pointer-events-none">“</div>
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
                  <h3 className="text-white font-black text-xl tracking-wide uppercase">
                    Candidate Accomplishments
                  </h3>
                  <span className="text-accent font-black text-sm">★ 5.0 out of 5</span>
                </div>

                <div className="space-y-6 relative z-10 text-xs">
                  {course.testimonials.map((test, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl bg-white/10 p-1.5 rounded-full border border-white/10 flex items-center justify-center h-10 w-10">🧑‍⚕️</span>
                        <div>
                          <h4 className="font-extrabold text-white">{test.name}</h4>
                          <p className="text-accent text-[10px] uppercase tracking-wider font-semibold">{test.role}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-light italic">
                        "{test.review}"
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 11. FAQ SECTION */}
            {course.faqs?.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
                <h3 className="text-primary font-black text-xl tracking-wide uppercase pb-2.5 border-b border-slate-100">
                  Frequently Asked Questions
                </h3>

                <div className="space-y-3.5">
                  {course.faqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;

                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-xl overflow-hidden transition-all text-xs"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full text-left px-4 py-3 flex items-center justify-between text-primary font-bold hover:bg-soft-gray focus:outline-none transition-colors cursor-pointer bg-soft-gray/30"
                        >
                          <span className="font-extrabold text-[12.5px] uppercase tracking-wide">{faq.q}</span>
                          <svg className={`w-4 h-4 text-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="px-4 py-3.5 border-t border-slate-100 bg-white text-blue-gray leading-relaxed font-light whitespace-pre-wrap">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT SIDEBAR - STICKY PURCHASE PANEL (Col span 4 - Desktop) */}
          <div className="lg:col-span-4 sticky top-32 space-y-6 text-left hidden lg:block">
            
            {/* 13. STICKY PURCHASE SIDEBAR CARD */}
            <div className="bg-[#0B1F4D] border-2 border-accent/20 rounded-3xl p-6.5 text-white shadow-xl relative overflow-hidden text-xs space-y-5">
              {/* Subtle visual grid */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.08)_0%,transparent_70%)] pointer-events-none" />

              <div className="space-y-1 text-center relative z-10 pb-4.5 border-b border-white/10">
                <span className="text-[10px] text-accent font-extrabold uppercase tracking-[0.25em]">Clinical Enrollment Key</span>
                <div className="flex items-end justify-center space-x-2 pt-1.5">
                  <span className="text-white font-black text-3xl leading-none">₹{course.price}</span>
                  {course.originalPrice && (
                    <span className="text-slate-400 line-through text-xs leading-none pb-0.5">₹{course.originalPrice}</span>
                  )}
                </div>
                <div className="text-[9px] text-[#A8802E] font-black uppercase tracking-wider mt-1">Live + Recorded Replay Access</div>
              </div>

              {/* Course Features Checklist */}
              <div className="space-y-3.5 relative z-10">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">This Course Includes:</div>
                
                <div className="space-y-2.5 font-medium text-slate-300 text-[11px]">
                  {[
                    { text: 'Weekly Zoom Live Vivas mock sessions', icon: '📡' },
                    { text: 'Recorded HD Session archives (7d replays)', icon: '📹' },
                    { text: 'Interactive PACS DICOM scan spotters', icon: '🩻' },
                    { text: 'Exam-Calibrated mock assessments & MCQs', icon: '⏱️' },
                    { text: 'Accredited clinical Certificate generated', icon: '🎓' },
                    { text: 'Optimized Mobile & Tablet access portal', icon: '📱' }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5">
                      <span>{feat.icon}</span>
                      <span>{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrollment CTA buttons */}
              <div className="space-y-3.5 pt-3 relative z-10">
                <Button
                  variant={isPurchased ? "primary" : "secondary"}
                  size="md"
                  onClick={handleEnrollClick}
                  className={`w-full rounded-xl uppercase tracking-widest text-xs font-black py-4 shadow-lg hover:scale-102 transition-transform duration-300 ${isPurchased ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'shadow-accent/20'}`}
                >
                  {isPurchased ? 'Continue Learning →' : 'Enroll In Course'}
                </Button>

                {!isPurchased && course.previewVideoUrl && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setPreviewVideo(course.previewVideoUrl)}
                    className="w-full rounded-xl border-white text-white hover:bg-white/10 uppercase tracking-widest text-xs font-black py-3.5"
                  >
                    Watch Course Preview
                  </Button>
                )}
              </div>

              <div className="text-center text-[10px] text-slate-400 font-medium relative z-10 pt-2 border-t border-white/10">
                🔒 256-bit encrypted secure medical payment gateway
              </div>
            </div>

            {/* 12. RECOMMENDED COURSES SECTION (Compact Sidebar Cards) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5.5 text-left space-y-4 shadow-sm">
              <h4 className="text-primary font-black text-xs uppercase tracking-widest pb-2 border-b border-slate-100">
                Recommended Modules
              </h4>

              <div className="space-y-4">
                {recommendedCourses.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('course-detail', rec.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="p-3 bg-soft-gray border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-accent/40 hover:bg-white transition-all group text-xs font-semibold"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base">🩻</span>
                      <div className="text-left">
                        <div className="text-primary group-hover:text-accent transition-colors font-extrabold truncate max-w-[140px] uppercase tracking-wide">
                          {rec.title}
                        </div>
                        <div className="text-[10px] text-blue-gray mt-0.5">{rec.categoryName}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-primary font-black">₹{rec.price}</div>
                      {rec.originalPrice && <div className="text-[9px] text-slate-400 line-through">₹{rec.originalPrice}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
        )}
      </main>

      {/* 14. FOOTER */}
      <Footer />

      {/* INTERACTIVE LOGIN/REGISTER/RESET MODAL OVERLAY */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0B1F4D]/45 backdrop-blur-md" 
            onClick={() => setIsLoginOpen(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 animate-duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-blue-gray hover:text-primary transition-colors cursor-pointer z-20 bg-soft-gray hover:bg-slate-200 p-1.5 rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Interactive Dynamic Forms Switcher */}
            {authView === 'login' && (
              <LoginForm 
                onSubmitSuccess={handleLoginSuccess} 
                onRegisterClick={() => setAuthView('register')}
                onResetClick={() => setAuthView('reset')}
              />
            )}
            {authView === 'register' && (
              <RegisterForm 
                onSubmitSuccess={handleLoginSuccess}
                onLoginClick={() => setAuthView('login')}
              />
            )}
            {authView === 'reset' && (
              <ResetPasswordForm 
                onLoginClick={() => setAuthView('login')}
              />
            )}
          </div>
        </div>
      )}

      {/* INLINE PORTAL TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        {userSession ? (
          <div className="bg-accent text-white px-4 py-2.5 rounded-full font-bold text-xs tracking-wider shadow-lg flex items-center space-x-2 border border-white/10 animate-bounce animate-duration-1000">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="uppercase text-[10px] tracking-widest">{userSession.role}: {userSession.name}</span>
            <button 
              onClick={() => setUserSession(null)}
              className="ml-2 bg-primary/20 hover:bg-primary/40 rounded-full p-1 text-white text-[10px] font-bold cursor-pointer"
              title="Logout"
            >
              Exit
            </button>
          </div>
        ) : (
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => navigate('/student/login')}
            className="shadow-xl shadow-accent/35 rounded-full font-bold uppercase tracking-wider text-xs border border-white/10"
          >
            ENTER STUDENT PORTAL
          </Button>
        )}
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(200,155,60,0.15)] border border-white/10">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setPreviewVideo(null)} 
                className="text-white hover:text-accent bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative pt-[56.25%] w-full bg-[#050E24] flex items-center justify-center">
              {previewVideo.includes('youtube.com') || previewVideo.includes('vimeo.com') ? (
                <iframe
                  src={previewVideo}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video 
                  src={getFullUrl(previewVideo)} 
                  controls 
                  autoPlay 
                  className="absolute inset-0 w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetailPage;
