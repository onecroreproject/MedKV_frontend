import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import Button from '../components/ui/Button';
import { getLiveClasses } from '../services/liveClassService';
import { Radio } from 'lucide-react';
// Section components
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import CoursesSection from './sections/CoursesSection';
import LiveClassesSection from './sections/LiveClassesSection';
import CaseStudiesSection from './sections/CaseStudiesSection';
import FacultySection from './sections/FacultySection';
import TestimonialsSection from './sections/TestimonialsSection';
import ResourcesSection from './sections/ResourcesSection';
import StatisticsSection from './sections/StatisticsSection';
import FaqSection from './sections/FaqSection';
import ContactSection from './sections/ContactSection';

export function Home({ userSession, onViewChange }) {
  const navigate = useNavigate();
  const [ongoingLiveClass, setOngoingLiveClass] = useState(null);

  useEffect(() => {
    const fetchLiveStatus = async () => {
      try {
        const res = await getLiveClasses();
        if (res?.success) {
          const ongoing = res.data.find(c => c.status === 'Live Now');
          if (ongoing) {
            setOngoingLiveClass(ongoing);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live classes:", err);
      }
    };
    fetchLiveStatus();
  }, []);

  return (
    <div className="min-h-screen bg-white text-charcoal flex flex-col font-sans selection:bg-accent selection:text-white overflow-x-hidden">
      
      {/* RADIAL AMBIENT GLOW EFFECTS (LIGHT THEME LUXURY GOLDS & TEALS STARTING BELOW HERO) */}
      <div className="absolute top-[650px] left-0 right-0 h-[1000px] bg-gradient-to-b from-[#F5F7FA] via-white to-transparent pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[1800px] left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[3200px] right-10 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* STICKY PREMIUM NAVBAR */}
      <Navbar userSession={userSession} onLoginClick={() => navigate('/student/login')} onViewChange={onViewChange} />

      {/* MAIN CONTAINER */}
      <main className="flex-grow z-10">
        
        {/* Live Class Banner */}
        {ongoingLiveClass && (
          <div className="w-full bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 relative z-20 shadow-md">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <p className="text-sm font-semibold">
              Live Class Ongoing: {ongoingLiveClass.title}
            </p>
            <button 
              onClick={() => {
                if (userSession) {
                  onViewChange('dashboard');
                } else {
                  navigate('/student/login');
                }
              }}
              className="ml-4 px-4 py-1 bg-white text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
            >
              Join Now
            </button>
          </div>
        )}
        
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Why Choose Us / About Us Section */}
        <AboutSection />

        {/* 3. Featured Courses Section */}
        <CoursesSection onViewChange={onViewChange} />

        {/* 4. Live & Recorded Classes Section */}
        <LiveClassesSection />

        {/* 5. Case-Based Imaging Library Section */}
        <CaseStudiesSection />

        {/* 6. Mentors / Faculty Section */}
        <FacultySection />

        {/* 7. Testimonials Section */}
        <TestimonialsSection />

        {/* 8. Student Portal Powerhouse Section */}
        <ResourcesSection />

        {/* 9. Statistics Section */}
        <StatisticsSection />

        {/* 10. Frequently Asked Questions (FAQ) Section */}
        <FaqSection />

        {/* 11. Contact Section */}
        <ContactSection />

      </main>

      {/* PREMIUM ACADEMY FOOTER */}
      <Footer />

      {/* INLINE PORTAL TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        {userSession ? (
          <div className="bg-accent text-white px-4 py-2.5 rounded-full font-bold text-xs tracking-wider shadow-lg flex items-center space-x-2 border border-white/10 animate-bounce animate-duration-1000 cursor-pointer hover:scale-105 transition-transform" onClick={() => onViewChange('dashboard')}>
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="uppercase text-[10px] tracking-widest">{userSession.name}'s Dashboard</span>
            <div className="ml-2 bg-white/20 rounded-full p-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
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

    </div>
  );
}

export default Home;
