import React, { useEffect, useRef } from 'react';
import Card, { CardBody } from '../../components/ui/Card';

export default function FacultySection() {
  const leftCardsRef = useRef([]);
  const rightCardsRef = useRef([]);

  // Dummy data for 8 faculty members with varying bio lengths
  const facultyMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Radiologist",
      specialization: "Neuroradiology",
      experience: "18+ Years Experience",
      bio: "Pioneer in advanced brain imaging techniques and former board examiner."
    },
    {
      name: "Dr. Michael Chen",
      role: "Professor of Radiology",
      specialization: "Musculoskeletal Imaging",
      experience: "15+ Years Experience",
      bio: "Internationally recognized for innovative approaches to sports medicine imaging."
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Clinical Director",
      specialization: "Pediatric Radiology",
      experience: "12+ Years Experience",
      bio: "Dedicated to reducing radiation exposure in children through advanced protocols."
    },
    {
      name: "Dr. James Wilson",
      role: "Senior Consultant",
      specialization: "Cardiothoracic Imaging",
      experience: "20+ Years Experience",
      bio: "Leading expert in cardiac MRI and CT angiography with numerous publications."
    },
    {
      name: "Dr. Priya Patel",
      role: "Research Director",
      specialization: "Breast Imaging",
      experience: "14+ Years Experience",
      bio: "Award-winning researcher in early breast cancer detection technologies."
    },
    {
      name: "Dr. Robert Taylor",
      role: "Interventional Lead",
      specialization: "Interventional Radiology",
      experience: "16+ Years Experience",
      bio: "Specializes in minimally invasive procedures and image-guided therapies."
    },
    {
      name: "Dr. Lisa Anderson",
      role: "Education Head",
      specialization: "Abdominal Imaging",
      experience: "13+ Years Experience",
      bio: "Passionate educator training next generation of radiology specialists."
    },
    {
      name: "Dr. David Kim",
      role: "Nuclear Medicine Chief",
      specialization: "Molecular Imaging",
      experience: "17+ Years Experience",
      bio: "Expert in PET/CT and theranostics for personalized cancer treatment."
    }
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const fadeInLeft = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-left');
          observer.unobserve(entry.target);
        }
      });
    };

    const fadeInRight = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-right');
          observer.unobserve(entry.target);
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

  // Split 8 faculty members: 4 on left, 4 on right
  const leftColumnFaculty = facultyMembers.slice(0, 4);
  const rightColumnFaculty = facultyMembers.slice(4, 8);

  return (
    <section id="faculty" className="bg-soft-gray border-y border-slate-200/80 py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
            <span>✨</span> 07. CLINICAL MENTORS
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
            BOARD ELITE FACULTY <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">MEMBERS</span>
          </h3>
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
          <p className="text-blue-gray text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
            Train under international radiology leaders, accredited professors, and board exam advisers committed to your success.
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
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.7s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.7s ease-out forwards;
        }

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