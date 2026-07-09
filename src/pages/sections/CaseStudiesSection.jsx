import React, { useState, useEffect } from 'react';
import Card, { CardBody } from '../../components/ui/Card';
import { CASE_STUDIES } from '../../config/constants';

export default function CaseStudiesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const totalCards = CASE_STUDIES.length;

  // Dynamically calculate visible cards based on actual screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(3); // Desktop shows 3
      } else if (window.innerWidth >= 768) {
        setVisibleCards(2); // Tablet shows 2
      } else {
        setVisibleCards(1); // Mobile shows 1
      }
    };
    handleResize(); // Initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Limit sliding index to prevent empty columns on the right
  const maxIndex = totalCards - visibleCards;
  const slideCount = maxIndex + 1;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  // Adjust active index if it exceeds the new bounds on screen resize
  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [visibleCards, activeIndex, maxIndex]);

  return (
    <section id="cases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 bg-white overflow-hidden">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
          <span>✨</span> 06. DIAGNOSTIC REASONING
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
          CASE-BASED IMAGING <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">LIBRARY</span>
        </h3>
        <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
        <p className="text-blue-gray text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          Master radiological diagnosis by self-training with over 5,000 clinically correlated scans using high-fidelity overlays.
        </p>
      </div>

      {/* Manual Slider Container */}
      <div className="relative px-4 sm:px-12 md:px-16 max-w-6xl mx-auto">
        
        {/* Slider Window Clip Frame */}
        <div className="overflow-hidden py-4 w-full">
          
          {/* Flex Track translating responsive card offsets mathematically */}
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${activeIndex * (100 / totalCards)}%)`,
              width: `${(totalCards / visibleCards) * 100}%`
            }}
          >
            {CASE_STUDIES.map((study, idx) => (
              <div 
                key={idx} 
                className="px-3 flex-shrink-0"
                style={{
                  width: `${100 / totalCards}%`
                }}
              >
                {/* Responsive Card Component */}
                <div 
                  className={`bg-white rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-300 h-full
                    ${idx >= activeIndex && idx < activeIndex + visibleCards
                      ? 'border-slate-200 shadow-md hover:shadow-xl hover:border-accent/40' 
                      : 'opacity-50 border-slate-100'
                    }`}
                >
                  {/* Image Header with hover zoom */}
                  <div className="h-48 overflow-hidden relative bg-[#030919] border-b border-slate-200 flex flex-col justify-center items-center">
                    
                    {study.imageType === 'brain-mri' && (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-[#0B1F4D] to-[#030919] text-accent space-y-3">
                        <svg className="w-14 h-14 animate-pulse text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">BRAIN CORONAL MRI</span>
                      </div>
                    )}
                    
                    {study.imageType === 'ct-scan' && (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-[#0A2540] to-[#030919] text-accent space-y-3">
                        <svg className="w-14 h-14 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">CT SCANNER AXIAL</span>
                      </div>
                    )}

                    {study.imageType === 'ultrasound' && (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-[#051E3E] to-[#030919] text-accent space-y-3">
                        <svg className="w-14 h-14 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">ULTRASOUND DOPPLER</span>
                      </div>
                    )}

                    {study.imageType === 'general-diag' && (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-[#0A3D62] to-[#030919] text-accent space-y-3">
                        <svg className="w-14 h-14 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">DIAGNOSTIC PLAIN FILMS</span>
                      </div>
                    )}

                    {study.imageType === 'pacs-learning' && (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-[#0B2545] to-[#030919] text-accent space-y-3">
                        <svg className="w-14 h-14 text-accent animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">DICOM PACS VIEWER</span>
                      </div>
                    )}

                    {/* Case Count Tag */}
                    <div className="absolute top-3 left-3 z-10 bg-white/95 text-accent text-[9px] font-bold px-2.5 py-1 rounded-md border border-slate-200/80 shadow-sm tracking-widest uppercase">
                      {study.caseCount}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3 bg-white flex-grow flex flex-col justify-between">
                    <h4 className="text-primary font-bold text-sm sm:text-base leading-tight group-hover:text-accent transition-colors">
                      {study.title}
                    </h4>
                    <p className="text-blue-gray text-xs leading-relaxed line-clamp-3 font-normal">
                      {study.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Arrow Button */}
        <button 
          onClick={handlePrev}
          aria-label="Previous Case Slide"
          className="absolute left-0 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 hover:border-accent text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer focus:outline-none z-30"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Right Arrow Button */}
        <button 
          onClick={handleNext}
          aria-label="Next Case Slide"
          className="absolute right-0 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 hover:border-accent text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer focus:outline-none z-30"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators - Matches visible indices exactly */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(slideCount)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to case slide ${idx + 1}`}
              className={`transition-all duration-300 cursor-pointer focus:outline-none ${
                activeIndex === idx 
                  ? 'h-2 w-6 bg-accent rounded-full' 
                  : 'h-2 w-2 bg-slate-300 rounded-full hover:bg-accent/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
