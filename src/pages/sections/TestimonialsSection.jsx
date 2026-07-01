import React, { useState, useEffect } from 'react';
import { STUDENT_TESTIMONIALS } from '../../config/constants';

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    let interval;
    if (isAutoSliding && STUDENT_TESTIMONIALS.length > 0) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % STUDENT_TESTIMONIALS.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoSliding]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % STUDENT_TESTIMONIALS.length);
    setIsAutoSliding(false);
    // Resume auto slide after a long delay if clicked
    setTimeout(() => setIsAutoSliding(true), 12000);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + STUDENT_TESTIMONIALS.length) % STUDENT_TESTIMONIALS.length);
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 12000);
  };

  const getStudentImage = (student) => {
    if (student.image) return student.image;
    // Clean up academic prefix like "Dr." or "Prof." to get accurate initials
    const cleanName = student.name.replace(/^(Dr\.|Dr|Prof\.|Prof)\s+/i, '');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=C89B3C&color=fff&size=200&rounded=true&bold=true`;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 bg-white overflow-hidden">

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
          <span>✨</span> 08. ALUMNI ENDORSEMENTS
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
          STUDENT SUCCESS <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">STORIES</span>
        </h3>
        <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
        <p className="text-blue-gray text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
          Read how postgraduate doctors from around the globe secured national board seats and cleared their fellowship boards.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative px-4 sm:px-12 md:px-20 max-w-6xl mx-auto">

        {/* 3D absolute slider container frame */}
        <div className="relative h-[480px] sm:h-[450px] w-full flex items-center justify-center overflow-visible">
          {STUDENT_TESTIMONIALS.map((student, idx) => {
            const total = STUDENT_TESTIMONIALS.length;
            let cardPosition = 'hidden';

            if (idx === activeIndex) {
              cardPosition = 'active';
            } else if (idx === (activeIndex - 1 + total) % total) {
              cardPosition = 'prev';
            } else if (idx === (activeIndex + 1) % total) {
              cardPosition = 'next';
            }

            return (
              <div
                key={idx}
                className={`absolute w-full max-w-[340px] sm:max-w-[400px] transition-all duration-700 ease-out select-none
                  ${cardPosition === 'active'
                    ? 'z-30 opacity-100 scale-100 translate-x-0 pointer-events-auto filter drop-shadow-2xl'
                    : ''
                  }
                  ${cardPosition === 'prev'
                    ? 'z-20 opacity-40 scale-85 -translate-x-[60%] lg:-translate-x-[85%] pointer-events-none filter blur-[1px] hidden md:block'
                    : ''
                  }
                  ${cardPosition === 'next'
                    ? 'z-20 opacity-40 scale-85 translate-x-[60%] lg:translate-x-[85%] pointer-events-none filter blur-[1px] hidden md:block'
                    : ''
                  }
                  ${cardPosition === 'hidden'
                    ? 'z-10 opacity-0 scale-75 pointer-events-none absolute'
                    : ''
                  }
                `}
              >
                {/* Individual Testimonial Card */}
                <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                  ${cardPosition === 'active'
                    ? 'border-accent/40 ring-2 ring-accent/10 shadow-2xl'
                    : 'border-slate-200/80 shadow-md'
                  }`}
                >
                  {/* Card Header with Dark Gradient Banner */}
                  <div className="bg-gradient-to-r from-primary to-[#0B1730] px-6 py-5 relative h-24">
                    {/* Quotation mark in background */}
                    <div className="absolute top-3 right-4 opacity-15">
                      <svg className="h-14 w-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Floating Avatar Overlay */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <img
                          src={getStudentImage(student)}
                          alt={student.name}
                          className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg bg-soft-gray"
                        />
                        {/* Golden star badge indicating high clinical score */}
                        <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-1 border-2 border-white shadow-md">
                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="pt-12 px-6 pb-8 space-y-5">
                    {/* Star Ratings */}
                    <div className="flex justify-center space-x-1">
                      {[...Array(student.rating || 5)].map((_, i) => (
                        <span key={i} className="text-accent text-lg">★</span>
                      ))}
                    </div>

                    {/* Quote statement */}
                    <blockquote className="text-primary text-xs sm:text-sm font-light italic leading-relaxed text-center min-h-[96px] max-h-[110px] overflow-y-auto px-2">
                      "{student.quote}"
                    </blockquote>

                    {/* Student Identity Metadata */}
                    <div className="text-center space-y-1.5 pt-3.5 border-t border-slate-100">
                      <h4 className="text-accent font-bold text-sm tracking-wide leading-none">
                        {student.name}
                      </h4>
                      <div className="text-primary font-bold text-[10px] uppercase tracking-wider">
                        {student.role}
                      </div>
                      <div className="text-blue-gray text-[9px] font-semibold flex items-center justify-center gap-1 mt-0.5">
                        <svg className="h-3 w-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {student.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Control Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous Testimonial"
          className="absolute left-0 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 hover:border-accent text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer focus:outline-none z-40"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Control Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next Testimonial"
          className="absolute right-0 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 hover:border-accent text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer focus:outline-none z-40"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dynamic Dot Indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {STUDENT_TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setIsAutoSliding(false);
                setTimeout(() => setIsAutoSliding(true), 12000);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 cursor-pointer focus:outline-none ${activeIndex === idx
                  ? 'h-2 w-6 bg-accent rounded-full'
                  : 'h-2 w-2 bg-slate-300 rounded-full hover:bg-accent/60'
                }`}
            />
          ))}
        </div>

        {/* Slide Tracker Telemetry */}
        <div className="text-center mt-3">
          <span className="text-[10px] text-blue-gray font-mono uppercase tracking-wider">
            {activeIndex + 1} of {STUDENT_TESTIMONIALS.length} Testimonials
          </span>
        </div>
      </div>
    </section>
  );
}