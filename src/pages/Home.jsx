import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
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
      <Navbar userSession={userSession} onLoginClick={() => navigate('/student/login')} onViewChange={onViewChange} ongoingLiveClass={ongoingLiveClass} />

      {/* MAIN CONTAINER */}
      <main className="flex-grow z-10">
        
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


    </div>
  );
}

export default Home;
