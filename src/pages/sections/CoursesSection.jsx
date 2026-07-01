import React, { useState, useEffect } from 'react';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getPublishedCourses } from '../../services/courseService';
export default function CoursesSection({ onViewChange }) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getPublishedCourses();
        const mappedData = (data?.data || []).map(c => ({
          ...c,
          category: c.category?.name || c.category
        }));
        setCourses(mappedData);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses based on user query
  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(courseFilter.toLowerCase()) ||
    course.description?.toLowerCase().includes(courseFilter.toLowerCase())
  );

  // Manual Slider Controls
  const nextSlide = () => {
    setCurrentIndex((prev) => {
      // If we can slide forward by 1, do so; otherwise, loop back to start
      if (prev + 3 >= filteredCourses.length) {
        return 0;
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      // If we are at 0, wrap to the last possible window of 3 cards
      if (prev === 0) {
        return Math.max(0, filteredCourses.length - 3);
      }
      return prev - 1;
    });
  };

  // Get active courses slice for the slider window
  const visibleCourses = filteredCourses.slice(currentIndex, currentIndex + 3);

  return (
    <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10 bg-white">
      
      {/* Header & Slider Actions UI */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-slate-100">
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
            <span>✨</span> 04. INTENSIVE CURRICULUMS
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight text-primary leading-none">
            FEATURED SPECIALIST <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">COURSES</span>
          </h3>
          <p className="text-blue-gray text-xs sm:text-sm max-w-md font-light leading-relaxed mt-2">
            Select high-yield prep modules led by examiners, featuring interactive clinical scan review engines.
          </p>
        </div>

        {/* Action controls (Filter query & Slider navigation) */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Quick Filter */}
          <div className="flex items-center space-x-2 bg-soft-gray border border-slate-200 rounded-xl px-4 py-2.5 max-w-xs shadow-inner focus-within:border-accent focus-within:bg-white transition-all duration-300">
            <svg className="w-4 h-4 text-blue-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setCurrentIndex(0); // Reset slider window on filter change
              }}
              placeholder="Quick-filter by exam (e.g. FRCR)"
              className="bg-transparent border-none text-primary text-xs placeholder-blue-gray/60 w-full focus:outline-none"
            />
          </div>

          {/* Slider Arrow Controllers + View All Header Button */}
          {filteredCourses.length > 3 && (
            <div className="flex items-center space-x-2 bg-soft-gray p-1 rounded-xl border border-slate-200">
              <button
                onClick={prevSlide}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-primary hover:bg-accent hover:border-transparent hover:text-white active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Slide Left"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-primary hover:bg-accent hover:border-transparent hover:text-white active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Slide Right"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => onViewChange('courses')}
            className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white uppercase tracking-widest text-[10px] font-black py-3 px-5 shadow-sm"
          >
            View All
          </Button>
        </div>
      </div>

      {/* Slide cards view */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-blue-gray bg-soft-gray">
          No specialty courses match your current search query. Try typing another term.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleCourses.map((course) => (
            <Card key={course._id} variant="default" className="border-slate-200 hover:border-accent/40 group relative flex flex-col justify-between bg-white shadow-sm hover:shadow-md animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Visual Thumbnail */}
              <div className="h-48 overflow-hidden relative border-b border-slate-200 bg-soft-gray">
                {/* Decorative High-End Vector Gradients & Graphics */}
                <div className="absolute inset-0 bg-gradient-to-tr from-soft-gray via-primary/5 to-accent/5 z-0" />
                
                {course.category === 'FRCR Part 1' && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-6 space-y-2">
                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
                    </svg>
                    <span className="text-[10px] text-primary font-bold tracking-widest uppercase">PHYSICS & DOSIMETRY</span>
                  </div>
                )}
                {course.category === 'FRCR Part 2A' && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-6 space-y-2">
                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[10px] text-primary font-bold tracking-widest uppercase">SYSTEMIC DIAGNOSIS</span>
                  </div>
                )}
                {course.category === 'FRCR Part 2B' && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-6 space-y-2">
                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-[10px] text-primary font-bold tracking-widest uppercase">MOCK VIVA-VOCE HOT SEAT</span>
                  </div>
                )}
                {course.category === 'Board Prep' && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-6 space-y-2">
                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                    <span className="text-[10px] text-primary font-bold tracking-widest uppercase">BOARD EXAM SPECIALISTS</span>
                  </div>
                )}
                {course.category === 'Anatomy' && (
                  <div className="w-full h-full flex flex-col justify-center items-center bg-primary/5 text-accent text-center p-6 space-y-2">
                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-[10px] text-primary font-bold tracking-widest uppercase">ANATOMY SCAN</span>
                  </div>
                )}
                {course.category === 'Pathology' && (
                  <div className="w-full h-full flex flex-col justify-center items-center bg-primary/5 text-accent text-center p-6 space-y-2">
                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-[10px] text-primary font-bold tracking-widest uppercase">PATHOLOGY WORKSTATION</span>
                  </div>
                )}

                {/* Rating Tag */}
                <div className="absolute bottom-3 right-3 bg-white/95 text-accent text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 shadow-sm tracking-wider">
                  ★ {course.rating ? course.rating.toFixed(1) : '4.9'}
                </div>
              </div>

              {/* Body Content */}
              <CardBody className="p-6 space-y-4 flex-grow flex flex-col justify-between bg-white text-left">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-accent font-bold uppercase tracking-wider">
                    <span>{course.duration || 'Flexible Timeline'}</span>
                    <span className="text-primary bg-soft-gray px-2 py-0.5 rounded border border-slate-200/40">ONLINE</span>
                  </div>
                  <h4 
                    onClick={() => onViewChange('course-detail', course._id)}
                    className="text-primary font-bold text-base leading-tight group-hover:text-accent transition-colors cursor-pointer"
                  >
                    {course.title}
                  </h4>
                  <p className="text-blue-gray text-xs leading-relaxed font-normal line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    {course.originalPrice && (
                      <span className="text-[10px] text-blue-gray line-through leading-none mb-0.5">
                        ₹{course.originalPrice}
                      </span>
                    )}
                    <span className="text-primary font-bold text-lg leading-none">₹{course.price}</span>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => onViewChange('course-detail', course._id)}
                    className="rounded-md uppercase tracking-wider text-[10px] font-bold"
                  >
                    ENROLL NOW
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* VIEW ALL COURSES BUTTON (Bottom centre luxury button redirecting to details page) */}
      <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-100 gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={() => onViewChange('courses')}
          className="rounded-xl uppercase tracking-widest text-xs font-black px-8 py-3.5 shadow-md shadow-accent/25 hover:scale-102 transition-transform duration-300"
        >
          VIEW ALL RADIOLOGY COURSES
        </Button>
        <span className="text-[10.5px] text-blue-gray font-medium">Explore all {courses.length} courses in our deep-dive portfolio</span>
      </div>

    </section>
  );
}
