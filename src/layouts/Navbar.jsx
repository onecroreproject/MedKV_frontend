import React, { useState, useEffect } from 'react';
import { NAVIGATION_LINKS } from '../config/constants';
import Button from '../components/ui/Button';
import dark_logo from "../assets/dark_logo_transparent.png";
import company_name from "../assets/company_name_transparent.png";
import { getCategories } from '../services/categoryService';
import { getPublishedCourses } from '../services/courseService';
import { ChevronRight } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

// Icon mapping dictionary matching each label
const LINK_ICONS = {
  'Home': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  'Why Choose Us': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'Courses': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  'Live Classes': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  'Case Studies': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
    </svg>
  ),
  'Faculty': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  'Features': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'FAQ': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'Contact': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'Resources': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'About Us': (
    <svg className="w-4.5 h-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

// Rich submenu configs to match the radiology academy profile
const INITIAL_SUB_MENUS = {
  'Courses': [
    { label: 'FRCR Part 1 Prep', href: '#courses', desc: 'Clinical Physics & Anatomy Module' },
    { label: 'FRCR Part 2A Prep', href: '#courses', desc: 'Systemic Diagnostics Training' },
    { label: 'FRCR Part 2B Masterclass', href: '#courses', desc: 'Rapid Reporting & Hot Seat Mock Vivas' },
    { label: 'DNB / MDRD Board prep', href: '#courses', desc: 'Comprehensive Local Board Syllabus' },
  ],
  'Resources': [
    { label: 'Imaging Scan Library', href: '#cases', desc: 'Correlated Scan DICOM Worksheets' },
    { label: 'Anatomy Slice Viewer', href: '#resources', desc: 'Cross-sectional MRI & CT Tutors' },
    { label: 'ACR Reporting Guidelines', href: '#resources', desc: 'Consistent Professional Clinical Formats' },
    { label: 'Daily Radiology MCQs', href: '#resources', desc: 'High-Yield Board Revision Questions' },
  ],
  'About Us': [
    { label: 'Our Philosophy', href: '#about', desc: 'Bridging Syllabus with Confident Practice' },
    { label: 'Senior Clinical Advisers', href: '#faculty', desc: 'Accredited Professors & Examiners' },
    { label: 'Success Testimonials', href: '#about', desc: 'Alumni Endorsements & Achievements' },
  ]
};

export function Navbar({ userSession, onLoginClick, onViewChange, hasTopBar, ongoingLiveClass }) {
  const { platformSettings } = usePlatform();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState(null); // Tracks active mobile dropdown label
  const [subMenus, setSubMenus] = useState(INITIAL_SUB_MENUS);
  const [courses, setCourses] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const fetchData = async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          getCategories(),
          getPublishedCourses().catch(() => ({ data: [] }))
        ]);
        
        if (catRes.data && catRes.data.length > 0) {
          setSubMenus(prev => ({
            ...prev,
            'Courses': catRes.data.map(cat => ({
              _id: cat._id,
              label: cat.name,
              href: '#courses',
              desc: cat.description || 'View course details'
            }))
          }));
        }
        
        if (courseRes.data) {
          setCourses(courseRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch data for navbar', err);
      }
    };

    fetchData();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileSubMenu = (label, e) => {
    e.preventDefault();
    setMobileSubMenuOpen(mobileSubMenuOpen === label ? null : label);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-gradient-to-r from-[#030919]/95 to-[#0B1F4D]/90 backdrop-blur-md py-3 shadow-lg shadow-black/35'
        : 'bg-gradient-to-r from-[#030919]/85 to-[#0B1F4D]/80 backdrop-blur-sm py-4.5 shadow-md'
      }`}>
      {/* Top thin white gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${scrolled ? 'via-white/35' : 'via-white/20'
        } to-transparent pointer-events-none transition-all duration-300`} />

      {/* Bottom thin white gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${scrolled ? 'via-white/35' : 'via-white/20'
        } to-transparent pointer-events-none transition-all duration-300`} />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between">

          {/* Logo Brand Crest Block */}
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => {
            if (onViewChange) onViewChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            <img
              src={platformSettings?.general?.logoUrl || dark_logo}
              alt="Platform Logo"
              className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <img
                src={company_name}
                alt="Dr. Sam Reefath Radiology Academy Typography"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-accent text-[8px] font-extrabold tracking-[0.16em] uppercase mt-0.5 whitespace-nowrap">
                {platformSettings?.general?.tagline || 'LEARN • UNDERSTAND • EXCEL • SERVE'}
              </span>
            </div>
          </div>

          {/* Navigation Links - Desktop with Dropdowns */}
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-6.5">
            {NAVIGATION_LINKS.map((link) => {
              const hasSubMenu = !!subMenus[link.label];

              return (
                <div key={link.label} className="relative group/nav flex items-center py-4">
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.comingSoon) {
                        e.preventDefault();
                        return;
                      }
                      if (link.label === 'Courses') {
                        if (onViewChange) {
                          e.preventDefault();
                          onViewChange('courses');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      } else if (link.label === 'Home') {
                        if (onViewChange) {
                          e.preventDefault();
                          onViewChange('home');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      } else {
                        if (onViewChange) {
                          onViewChange('home');
                        }
                      }
                    }}
                    className="inline-flex items-center text-white/90 hover:text-accent font-bold text-[16px] tracking-wider transition-all duration-200"
                  >
                    <span className="text-accent opacity-90 transition-transform duration-300 mr-2 flex items-center justify-center [&>svg]:!w-5.5 [&>svg]:!h-5.5 [&>svg]:!mr-0">
                      {LINK_ICONS[link.label]}
                    </span>
                    <span>{link.label}</span>
                    {link.comingSoon && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white bg-accent/80 rounded-sm">
                        Coming Soon
                      </span>
                    )}
                    {hasSubMenu && !link.comingSoon && (
                      <svg className="w-3.5 h-3.5 ml-1.5 text-accent opacity-70 transition-transform duration-300 group-hover/nav:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </a>

                  {/* Dropdown Menu Sub-list (Smooth fade & scale spring transition) */}
                  {hasSubMenu && link.label === 'Courses' ? (
                    <div className="absolute top-[90%] left-1/2 -translate-x-1/2 w-[700px] bg-[#0A1733] border border-accent/20 rounded-2xl shadow-2xl opacity-0 invisible scale-95 origin-top group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:scale-100 transition-all duration-300 ease-out z-50 flex overflow-hidden">
                      {/* Left: Categories */}
                      <div className="w-[45%] bg-[#081229] p-5 flex flex-col">
                        <div className="text-accent text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4 px-3 opacity-90">Categories</div>
                        <div className="space-y-1">
                          {subMenus[link.label].map((sub, sIdx) => {
                            const isHovered = hoveredCategory === sub._id || (!hoveredCategory && sIdx === 0);
                            return (
                              <a
                                key={sIdx}
                                href={sub.href}
                                onMouseEnter={() => setHoveredCategory(sub._id)}
                                onClick={(e) => {
                                  if (onViewChange) {
                                    e.preventDefault();
                                    onViewChange('courses', sub.label);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                }}
                                className={`block px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                                  isHovered ? "bg-[#0F224A] shadow-inner" : "hover:bg-[#0F224A]/50"
                                }`}
                              >
                                <div className={`font-bold text-[13px] tracking-wide transition-colors ${
                                  isHovered ? "text-accent" : "text-white"
                                }`}>
                                  {sub.label}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                        <div className="mt-auto pt-6 px-3">
                          <button 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              if (onViewChange) {
                                onViewChange('courses', 'All Categories');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }} 
                            className="text-white/80 hover:text-accent text-[12px] font-bold tracking-wider uppercase flex items-center transition-colors group"
                          >
                            View All Categories <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Right: Courses */}
                      <div className="w-[55%] p-6 bg-[#0A1733] border-l border-white/5">
                        <div className="text-white/40 text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4 px-2">
                          Available Courses
                        </div>
                        <div className="space-y-2.5">
                          {courses
                            .filter(c => {
                              const catId = c.category?._id || c.category;
                              const targetId = hoveredCategory || subMenus['Courses']?.[0]?._id;
                              return catId === targetId;
                            })
                            .slice(0, 5)
                            .map(course => (
                              <a 
                                key={course._id} 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (onViewChange) {
                                    onViewChange('course-detail', course._id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                }} 
                                className="block px-3 py-2.5 rounded-lg hover:bg-[#0F224A] transition-all cursor-pointer group/course border border-transparent hover:border-accent/10"
                              >
                                <div className="text-white/90 text-sm font-semibold group-hover/course:text-accent line-clamp-2 transition-colors">
                                  {course.title}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 opacity-60 group-hover/course:opacity-100 transition-opacity">
                                  <div className="text-accent text-[11px] font-bold uppercase tracking-wider">{course.level || 'All Levels'}</div>
                                </div>
                              </a>
                            ))}
                          
                          {courses.filter(c => (c.category?._id || c.category) === (hoveredCategory || subMenus['Courses']?.[0]?._id)).length === 0 && (
                            <div className="text-white/40 text-sm px-3 py-4 italic border border-dashed border-white/10 rounded-lg">
                              No courses currently available in this category.
                            </div>
                          )}
                        </div>
                        
                        {courses.filter(c => (c.category?._id || c.category) === (hoveredCategory || subMenus['Courses']?.[0]?._id)).length > 5 && (
                           <div className="mt-4 pt-4 border-t border-white/5 px-2">
                             <span className="text-accent text-[12px] font-bold italic opacity-80">+ more courses available</span>
                           </div>
                        )}
                      </div>
                    </div>
                  ) : hasSubMenu && (
                    <div className="absolute top-[90%] left-0 w-80 bg-[#0A1733] border border-accent/20 rounded-2xl p-4 shadow-2xl opacity-0 invisible scale-95 origin-top-left group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:scale-100 transition-all duration-300 ease-out z-50">
                      <div className="absolute -top-1.5 left-6 w-3.5 h-3.5 bg-[#0A1733] border-t border-l border-accent/20 rotate-45 pointer-events-none" />
                      <div className="space-y-1.5 relative z-10">
                        {subMenus[link.label].map((sub, sIdx) => (
                          <a
                            key={sIdx}
                            href={sub.href}
                            onClick={(e) => {
                              if (link.label === 'Courses') {
                                if (onViewChange) {
                                  e.preventDefault();
                                  onViewChange('courses', sub.label);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                              }
                            }}
                            className="block hover:bg-[#0F224A] px-3.5 py-2.5 rounded-xl transition-all duration-200 group/item"
                          >
                            <div className="text-white font-bold text-[13px] tracking-wide group-hover/item:text-accent transition-colors">
                              {sub.label}
                            </div>
                            <div className="text-blue-gray text-[10px] leading-relaxed mt-0.5 font-light">
                              {sub.desc}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Call to Action - Desktop */}
          <div className="hidden lg:block">
            {userSession ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => onViewChange && onViewChange('dashboard')}
                className="rounded-md px-6 py-2.5 uppercase tracking-[0.1em] text-[13px] font-extrabold shadow-lg hover:scale-102 transition-transform flex items-center space-x-2"
              >
                <span>MY DASHBOARD</span>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={onLoginClick}
                className="rounded-md px-6 py-2.5 uppercase tracking-[0.2em] text-[13px] font-extrabold shadow-lg shadow-accent/20 hover:scale-102 transition-transform"
              >
                STUDENT LOGIN
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-accent focus:outline-none p-1 cursor-pointer transition-colors duration-200"
            >
              <svg className="h-6.5 w-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel with Accordion Submenus */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#030919]/98 border-b border-accent/25 px-4 pt-2.5 pb-6.5 space-y-3.5 shadow-2xl">
          {NAVIGATION_LINKS.map((link) => {
            const hasSubMenu = !!subMenus[link.label];
            const isSubMenuOpen = mobileSubMenuOpen === link.label;

            return (
              <div key={link.label} className="border-b border-white/5 pb-2">
                <div className="flex items-center justify-between">
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.comingSoon) {
                        e.preventDefault();
                        return;
                      }
                      setMobileMenuOpen(false);
                      if (link.label === 'Courses') {
                        if (onViewChange) {
                          e.preventDefault();
                          onViewChange('courses');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      } else if (link.label === 'Home') {
                        if (onViewChange) {
                          e.preventDefault();
                          onViewChange('home');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      } else {
                        if (onViewChange) {
                          onViewChange('home');
                        }
                      }
                    }}
                    className="inline-flex items-center text-white/90 hover:text-accent font-semibold text-[14.5px] py-3.5 tracking-wider transition-colors duration-200"
                  >
                    <span className="text-accent mr-3.5 flex items-center justify-center [&>svg]:!w-6 [&>svg]:!h-6 [&>svg]:!mr-0">
                      {LINK_ICONS[link.label]}
                    </span>
                    <span>{link.label}</span>
                    {link.comingSoon && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white bg-accent/80 rounded-sm">
                        Coming Soon
                      </span>
                    )}
                  </a>

                  {hasSubMenu && !link.comingSoon && (
                    <button
                      onClick={(e) => toggleMobileSubMenu(link.label, e)}
                      className="text-accent focus:outline-none p-3 hover:bg-[#0F224A] rounded-xl transition-all"
                    >
                      <svg className={`w-4.5 h-4.5 transition-transform duration-300 ${isSubMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Indented mobile dropdown list (Accordion transition) */}
                {hasSubMenu && isSubMenuOpen && (
                  <div className="pl-9 mt-1.5 space-y-3 bg-[#0A1733]/50 rounded-xl p-3 border border-accent/10">
                    {subMenus[link.label].map((sub, sIdx) => (
                      <a
                        key={sIdx}
                        href={sub.href}
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          if (link.label === 'Courses') {
                            if (onViewChange) {
                              e.preventDefault();
                              onViewChange('courses', sub.label);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }
                        }}
                        className="block text-slate-300 hover:text-accent text-[12.5px] py-1 tracking-wide font-normal leading-normal transition-colors"
                      >
                        • {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-3">
            {userSession ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onViewChange) onViewChange('dashboard');
                }}
                className="w-full text-center tracking-[0.2em] text-sm font-extrabold py-3.5 px-8 rounded-xl shadow-2xl flex justify-center items-center space-x-2"
              >
                <span>MY DASHBOARD</span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLoginClick();
                }}
                className="w-full text-center tracking-[0.3em] text-sm font-extrabold py-3.5 px-8 rounded-xl shadow-2xl shadow-accent/30"
              >
                STUDENT LOGIN
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Live Class Banner perfectly attached to the bottom of the Navbar */}
      {userSession && ongoingLiveClass && (
        <div className="absolute top-full left-0 right-0 w-full bg-red-600/95 backdrop-blur-md text-white px-4 py-2 flex items-center justify-center gap-3 shadow-lg border-t border-white/20 z-40">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <p className="text-sm font-semibold">
            Live Class Ongoing: {ongoingLiveClass.title}
          </p>
          <button 
            onClick={() => {
              if (onViewChange) onViewChange('dashboard');
            }}
            className="ml-4 px-4 py-1 bg-white text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
          >
            Join Now
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
