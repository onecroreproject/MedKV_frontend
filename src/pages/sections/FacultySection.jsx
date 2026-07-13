import React, { useEffect, useRef } from 'react';
import Card, { CardBody } from '../../components/ui/Card';
import { FACULTY_MEMBERS } from '../../config/constants';

export default function FacultySection() {
  const leftCardsRef = useRef([]);
  const rightCardsRef = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const fadeInLeft = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-x-[-30px]');
          entry.target.classList.add('opacity-100', 'translate-x-0');
          observerLeft.unobserve(entry.target);
        }
      });
    };

    const fadeInRight = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-x-[30px]');
          entry.target.classList.add('opacity-100', 'translate-x-0');
          observerRight.unobserve(entry.target);
        }
      });
    };

    const observerLeft = new IntersectionObserver(fadeInLeft, observerOptions);
    const observerRight = new IntersectionObserver(fadeInRight, observerOptions);

    leftCardsRef.current.forEach(card => {
      if (card) observerLeft.observe(card);
    });

    rightCardsRef.current.forEach(card => {
      if (card) observerRight.observe(card);
    });

    return () => {
      observerLeft.disconnect();
      observerRight.disconnect();
    };
  }, []);

  // Split faculty members into two columns dynamically
  const leftColumnFaculty = FACULTY_MEMBERS.slice(0, Math.ceil(FACULTY_MEMBERS.length / 2));
  const rightColumnFaculty = FACULTY_MEMBERS.slice(Math.ceil(FACULTY_MEMBERS.length / 2));

  return (
    <section id="faculty" className="bg-soft-gray border-y border-slate-200/80 py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
            LEADERSHIP <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">TEAM</span>
          </h3>
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
          <p className="text-blue-gray text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
            Meet the visionary founders and esteemed educators driving the academy's mission to empower the next generation of radiologists globally.
          </p>
        </div>

        {/* Landscape Layout - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left Column - 4 Cards fade in from left */}
          <div className="space-y-4">
            {leftColumnFaculty.map((fac, idx) => (
              <div
                key={`left-${idx}`}
                ref={el => leftCardsRef.current[idx] = el}
                className="opacity-0 translate-x-[-30px] transition-all duration-700 ease-out"
              >
                <Card variant="default" className="border-slate-200 hover:border-accent/40 group hover:shadow-md transition-all duration-300 pt-4">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Faculty Avatar */}
                      <div className="flex-shrink-0">
                        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-accent p-0.5 shadow-sm bg-soft-gray">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-[#050E24] flex items-center justify-center text-accent font-bold text-lg">
                            {fac.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>

                      {/* Faculty Info - Fixed height container */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-[9px] text-accent font-bold uppercase tracking-wider">{fac.role}</span>
                          <span className="text-[9px] text-accent font-mono italic">• {fac.experience}</span>
                        </div>
                        
                        <h4 className="text-primary font-bold text-base group-hover:text-accent transition-colors mb-1">
                          {fac.name}
                        </h4>
                        
                        <div className="text-[11px] text-blue-gray font-medium mb-2">{fac.specialization}</div>

                        {/* Fixed height for bio with overflow handling */}
                        <div className="h-[60px] overflow-y-auto">
                          <p className="text-blue-gray text-xs leading-relaxed italic pr-1">
                            "{fac.bio}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>

          {/* Right Column - 4 Cards fade in from right */}
          <div className="space-y-4">
            {rightColumnFaculty.map((fac, idx) => (
              <div
                key={`right-${idx}`}
                ref={el => rightCardsRef.current[idx] = el}
                className="opacity-0 translate-x-[30px] transition-all duration-700 ease-out"
              >
                <Card variant="default" className="border-slate-200 hover:border-accent/40 group hover:shadow-md transition-all duration-300 pt-4">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Faculty Avatar */}
                      <div className="flex-shrink-0">
                        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-accent p-0.5 shadow-sm bg-soft-gray">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-[#050E24] flex items-center justify-center text-accent font-bold text-lg">
                            {fac.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>

                      {/* Faculty Info - Fixed height container */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-[9px] text-accent font-bold uppercase tracking-wider">{fac.role}</span>
                          <span className="text-[9px] text-accent font-mono italic">• {fac.experience}</span>
                        </div>
                        
                        <h4 className="text-primary font-bold text-base group-hover:text-accent transition-colors mb-1">
                          {fac.name}
                        </h4>
                        
                        <div className="text-[11px] text-blue-gray font-medium mb-2">{fac.specialization}</div>

                        {/* Fixed height for bio with overflow handling */}
                        <div className="h-[60px] overflow-y-auto">
                          <p className="text-blue-gray text-xs leading-relaxed italic pr-1">
                            "{fac.bio}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add these styles to your global CSS or CSS module */}
      <style>{`
        /* Custom scrollbar for bio section */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </section>
  );
}