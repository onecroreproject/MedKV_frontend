import React from 'react';
import Button from '../../components/ui/Button';
import bannerImg from '../../assets/banner.png';

export default function HeroSection() {
  return (
    <section id="home" className="relative bg-[#030919] text-white overflow-hidden min-h-[600px] lg:min-h-[680px]">

      {/* Full-width banner background image */}
      <img
        src={bannerImg}
        alt="Dr. Sam Reefath Radiology Academy Banner"
        className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-right"
      />

      {/* Dark left-side gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030919]/95 via-[#030919]/70 to-transparent pointer-events-none z-10" />
      {/* Top fade to blend with navbar */}
      <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#030919] to-transparent pointer-events-none z-10" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030919] to-transparent pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-32 sm:pt-44 pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-6">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1] text-white">
            ADVANCING RADIOLOGY <br />
            EDUCATION. <br />
            <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">
              EMPOWERING <br />
              RADIOLOGISTS.
            </span>
          </h1>

          <p className="text-slate-300/90 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
            Concept-oriented learning with expert guidance for a strong academic foundation and confident clinical practice.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a href="#courses" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-lg shadow-accent/20 hover:scale-102">
                EXPLORE COURSES
              </Button>
            </a>
            <a href="#about" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto !border-accent !text-accent hover:!bg-accent hover:!text-white transition-all duration-300">
                ABOUT US
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="bg-[#030919] border-t border-[#0F224D]/50 py-8 relative z-20">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">EXPERT FACULTY</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">Learn from experienced radiologists</p>
            </div>
          </div>

          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14h6m-6 4h6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">EXAM FOCUSED</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">MDRD, DNB, DMRD, FRCR & more</p>
            </div>
          </div>

          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v10H4V4zm8 10v4m-3 4h6M9 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">CASE BASED LEARNING</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">Real world cases for better understanding</p>
            </div>
          </div>

          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">FLEXIBLE LEARNING</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">Live & recorded sessions at your convenience</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
