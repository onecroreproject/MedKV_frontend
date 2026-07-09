import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm, ResetPasswordForm } from '../features/auth';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { usePurchase } from '../context/PurchaseContext';
import { getPublishedCourses } from '../services/courseService';

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



export function CoursesPage({ onNavigate, initialCategory, onLoginSuccess, userSession }) {
  // Navigation and Authentication States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const navigate = useNavigate();

  // Search & Filter State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [coursesList, setCoursesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { hasPurchased } = usePurchase();

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    
    const fetchCourses = async () => {
      try {
        const res = await getPublishedCourses();
        setCoursesList(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [initialCategory]);

  const availableCategories = useMemo(() => {
    const catSet = new Set(coursesList.map(c => c.category?.name || c.category).filter(Boolean));
    return ['All Categories', ...Array.from(catSet)];
  }, [coursesList]);
  
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');

  // FAQs State (which accordion is open)
  const [openFaq, setOpenFaq] = useState(null);

  // Testimonials slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLoginSuccess = (user) => {
    setIsLoginOpen(false);
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  const handleEnrollClick = (courseId) => {
    if (hasPurchased(courseId)) {
      onNavigate('dashboard');
    } else if (userSession) {
      onNavigate('enrollment-review', courseId);
    } else {
      navigate(`/student/login?enroll=${courseId}`);
    }
  };

  // Filter and Sort Logic Memoized
  const filteredCourses = useMemo(() => {
    return coursesList.map(c => ({
      ...c,
      id: c._id,
      title: c.title,
      category: c.category?.name || c.category,
      description: c.description,
      faculty: c.instructor?.name || 'Unknown Faculty',
      duration: 'Self-Paced',
      lessons: c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
      students: '0+',
      rating: 5.0,
      price: c.price || 0,
      originalPrice: c.originalPrice || null,
      difficulty: c.level || '',
      imageType: getFallbackImage(c.category?.name || c.category)
    })).filter((course) => {
      // Search Match
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.faculty.toLowerCase().includes(searchQuery.toLowerCase());

      // Category Match
      const matchesCategory =
        selectedCategory === 'All Categories' || course.category === selectedCategory;

      // Difficulty Match
      const matchesDifficulty =
        selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;

      // Price Match
      const matchesPrice =
        selectedPriceRange === 'All' ||
        (selectedPriceRange === 'Under ₹300' && course.price < 300) ||
        (selectedPriceRange === '₹300 - ₹500' && course.price >= 300 && course.price <= 500) ||
        (selectedPriceRange === 'Over ₹500' && course.price > 500);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'Latest') return b.lessons - a.lessons; // Mock latest using lesson count
      if (sortBy === 'Popular') return parseInt(b.students) - parseInt(a.students);
      if (sortBy === 'Top Rated') return b.rating - a.rating;
      return a.id.localeCompare(b.id); // Recommended default
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDuration, selectedPriceRange, sortBy, coursesList]);

  // Testimonials Data
  const testimonials = [
    {
      name: 'Dr. Amit Patel',
      course: 'FRCR Part 2B Masterclass',
      rating: 5,
      feedback: 'The simulated PACS workstation and viva timers were identical to the Royal College interface. The live advisor critiques boosted my scoring confidence dramatically!',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120&h=120'
    },
    {
      name: 'Dr. Clara Thorne',
      course: 'Brain MRI Interpretation',
      rating: 5,
      feedback: 'Incredible neuro courses! The anatomy slices correlating to pathology signs helped me master subtle anatomical parameters. Simply outstanding medical portal.',
      image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120&h=120'
    },
    {
      name: 'Dr. Kareem Al-Farsi',
      course: 'FRCR Part 1 Prep',
      rating: 5,
      feedback: 'Excellent physics explanations by Prof. Marcus Vance! Electromagnetic vectors and scanning dosage schemas became perfectly clear after his live mock discussions.',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120&h=120'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-charcoal flex flex-col font-sans selection:bg-accent selection:text-white overflow-x-hidden">

      {/* 1. NAVBAR (Sticky) */}
      <Navbar userSession={userSession} onLoginClick={() => navigate('/student/login')} onViewChange={onNavigate} />

      {/* Main content shifted down to account for sticky navbar */}
      <main className="flex-grow pt-24">

        {/* 2. HERO BANNER */}
        <section className="relative bg-gradient-to-r from-[#030919] via-[#0B1F4D] to-[#0A1733] text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-accent/20 overflow-hidden">
          {/* Glowing Ambient Watermarks */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-10 left-0 w-[400px] h-[400px] bg-blue-gray/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-[1536px] mx-auto relative z-10">

            {/* Breadcrumbs — top of the hero section */}
            <div className="mb-8">
              <Breadcrumbs 
                paths={[
                  { label: 'Home', view: 'home' },
                  { label: 'Courses', view: 'courses', param: 'All Categories' },
                  ...(selectedCategory !== 'All Categories' ? [{ label: selectedCategory }] : [])
                ]} 
                onNavigate={onNavigate} 
                variant="dark"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center bg-accent/10 border border-accent/30 text-accent text-xs font-extrabold uppercase tracking-[0.25em] px-4.5 py-1.5 rounded-full">
                Professional Academy Portal
              </span>
              <h1 className="text-white font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
                Explore Professional <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#D4AF37]">Radiology Courses</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                Advance your clinical radiology diagnostics with expert-led training, case-based DICOM scan worksheets, mock RCR exams, and high-yield live board preparations.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('search-filter-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-xl uppercase tracking-[0.15em] text-xs font-black px-8 py-4 shadow-xl shadow-accent/20"
                >
                  Explore Learning
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('home')}
                  className="rounded-xl border-white text-white hover:bg-white/10 uppercase tracking-[0.15em] text-xs font-black px-8 py-4"
                >
                  Return Home
                </Button>
              </div>
            </div>

            {/* Right Side - Radiology Scanning Graphics */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-square rounded-3xl bg-[#081535]/80 border border-accent/25 shadow-2xl p-6 flex flex-col justify-between overflow-hidden group">
                {/* Tech grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                {/* Visual Brain Scan emblem */}
                <div className="flex-grow flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent rounded-full filter blur-xl animate-pulse" />

                  {/* Mock Brain Scan DICOM Circle */}
                  <div className="w-56 h-56 rounded-full border-4 border-dashed border-accent/20 flex items-center justify-center p-3 relative animate-[spin_60s_linear_infinite]">
                    <div className="w-full h-full rounded-full border border-accent/40 flex items-center justify-center p-4">
                      <svg className="w-24 h-24 text-accent/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
                      </svg>
                    </div>
                  </div>

                  {/* Pulsing focal lines representing MRI laser slices */}
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent animate-bounce top-1/2 pointer-events-none" />
                </div>

                <div className="relative z-10 bg-primary/95 border border-accent/20 rounded-xl p-3.5 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">Active PACS Simulator stacks</span>
                  </div>
                  <div className="text-white text-xs font-bold tracking-wide mt-1">Cross-sectional Brain T1/T2 Slice Directory</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* 3. COURSE SEARCH & FILTER SECTION (Sticky modern filter area) */}
        <section id="search-filter-section" className="sticky top-20 z-30 bg-white border-b border-slate-200 shadow-md py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1536px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            {/* Realtime Search Bar */}
            <div className="flex-1 min-w-[280px] relative">
              <input
                type="text"
                placeholder="Search radiology topics, courses, faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-soft-gray border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-primary text-sm placeholder-blue-gray/60 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-gray/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            {/* Select Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 lg:w-[60%] xl:w-[50%]">

              {/* Category filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-soft-gray border border-slate-200 rounded-xl px-3.5 py-3.5 text-primary text-xs font-semibold focus:outline-none focus:border-accent focus:bg-white transition-all cursor-pointer"
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty filter */}
              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-soft-gray border border-slate-200 rounded-xl px-3.5 py-3.5 text-primary text-xs font-semibold focus:outline-none focus:border-accent focus:bg-white transition-all cursor-pointer"
                >
                  <option value="All">All Difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Price range filter */}
              <div>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full bg-soft-gray border border-slate-200 rounded-xl px-3.5 py-3.5 text-primary text-xs font-semibold focus:outline-none focus:border-accent focus:bg-white transition-all cursor-pointer"
                >
                  <option value="All">All Prices</option>
                  <option value="Under ₹300">Under ₹300</option>
                  <option value="₹300 - ₹500">₹300 - ₹500</option>
                  <option value="Over ₹500">Over ₹500</option>
                </select>
              </div>

              {/* Sort filter */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-soft-gray border border-slate-200 rounded-xl px-3.5 py-3.5 text-primary text-xs font-semibold focus:outline-none focus:border-accent focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Latest">Latest</option>
                  <option value="Popular">Popular</option>
                  <option value="Top Rated">Top Rated</option>
                </select>
              </div>

            </div>
          </div>

          {/* Quick categories horizontal bar */}
          <div className="max-w-[1536px] mx-auto mt-4.5 pt-4 border-t border-slate-100 flex items-center space-x-2.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-blue-gray font-extrabold uppercase tracking-widest whitespace-nowrap mr-2.5">
              Categories:
            </span>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All Categories' ? 'All Categories' : cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${(selectedCategory === 'All Categories' && cat === 'All Categories') || selectedCategory === cat
                    ? 'bg-primary text-white shadow-sm border border-transparent'
                    : 'bg-soft-gray text-blue-gray hover:text-primary hover:bg-slate-200 border border-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* 4. FEATURED COURSES SECTION (Responsive grid with glow and lift hover) */}
        <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto text-left">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8.5">
            <div>
              <span className="text-accent text-[11px] font-extrabold uppercase tracking-[0.25em]">
                Academic Offerings
              </span>
              <h2 className="text-primary font-black text-3xl sm:text-4xl mt-1 tracking-tight">
                Curated Radiology Curriculums
              </h2>
            </div>
            <div className="text-blue-gray text-sm mt-2 sm:mt-0 font-medium">
              Showing <span className="text-primary font-bold">{filteredCourses.length}</span> of {coursesList.length} courses
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm max-w-xl mx-auto">
              <svg className="w-16 h-16 text-blue-gray/50 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="text-primary font-black text-lg">No matching radiology modules found</h4>
              <p className="text-blue-gray text-xs mt-1 leading-relaxed">
                We couldn't find matches under those specific filters. Try expanding your search query or resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedDifficulty('All');
                  setSelectedPriceRange('All');
                  setSelectedDuration('All');
                }}
                className="mt-5.5 bg-primary text-white font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-widest cursor-pointer hover:bg-[#071433] transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200/85 overflow-hidden flex flex-col h-full shadow-md hover:-translate-y-2 hover:shadow-[0_15px_35px_-5px_rgba(11,31,77,0.12)] hover:border-accent/35 transition-all duration-300 group"
                >
                  {/* Thumbnail Banner with Discount/Status Overlay */}
                  <div className="h-52 bg-gradient-to-br from-[#0B1F4D] to-[#0A1733] relative p-5 flex flex-col justify-between overflow-hidden">
                    {/* Visual abstract clinical wave */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.1)_0%,transparent_70%)] pointer-events-none" />

                    {/* Interactive overlay items */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="bg-[#050E24] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">
                        {course.category}
                      </span>
                      {course.discountBadge && (
                        <span className="bg-accent text-[#050E24] text-[10px] font-black px-3.5 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                          {course.discountBadge}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center justify-center flex-grow py-3">
                      {/* Graphics matching category type */}
                      <div className="h-20 w-20 rounded-full border border-white/15 flex items-center justify-center p-2 relative">
                        <div className="absolute inset-0 bg-accent/5 rounded-full filter blur-md" />
                        <svg className="w-10 h-10 text-accent group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          {course.imageType === 'physics' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          )}
                          {course.imageType === 'systemic' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          )}
                          {course.imageType === 'viva' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          )}
                          {course.imageType === 'neuro' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
                          )}
                          {course.imageType === 'ct' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          )}
                          {course.imageType === 'anatomy' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          )}
                          {course.imageType === 'pathology' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          )}
                          {course.imageType === 'ultrasound' && (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0l-3.536 3.536" />
                          )}
                        </svg>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-slate-300 text-[10px] tracking-wider uppercase font-bold">
                      <span>{course.duration?.toLowerCase() === 'lifetime' ? 'Self-Paced' : course.duration}</span>
                      <span>•</span>
                      <span>{course.lessons} Lectures</span>
                    </div>
                  </div>

                  {/* Course Details Block */}
                  <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {course.difficulty ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent bg-accent/5 border border-accent/10 px-2 py-0.5 rounded">
                            {course.difficulty}
                          </span>
                        ) : <div />}
                        {/* Star Ratings */}
                        <div className="flex items-center space-x-1">
                          <svg className="w-3.5 h-3.5 text-accent fill-accent" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-charcoal font-black text-xs">{course.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <h3 className="text-primary font-black text-lg leading-snug group-hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-blue-gray text-[12px] leading-relaxed font-light line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    {/* Faculty and student metrics */}
                    <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between text-xs text-blue-gray font-medium">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-5.5 w-5.5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[9px] text-primary border border-slate-300">
                          {course.faculty ? (course.faculty.split(' ')[1]?.[0] || course.faculty[0]) : 'F'}
                        </span>
                        <span>{course.faculty || 'Faculty'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-3.5 h-3.5 opacity-75" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{course.students} Active</span>
                      </div>
                    </div>

                    {/* Price and CTAs */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        {course.originalPrice && (
                          <span className="text-[10px] text-blue-gray line-through leading-none mb-0.5">
                            ₹{course.originalPrice}
                          </span>
                        )}
                        <span className="text-primary font-black text-xl leading-none">
                          ₹{course.price}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate('course-detail', course.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          Details
                        </button>
                        <Button
                          variant={hasPurchased(course.id) ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => handleEnrollClick(course.id)}
                          className={`rounded-xl font-extrabold uppercase tracking-widest text-[10px] py-2 px-4.5 ${hasPurchased(course.id) ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' : ''}`}
                        >
                          {hasPurchased(course.id) ? 'Continue →' : 'Enroll'}
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </section>

        {/* 5. COURSE CATEGORIES SECTION (Horizontal card layout) */}
        <section className="bg-white py-16 border-t border-b border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1536px] mx-auto text-left">

            <div className="mb-10 text-center lg:text-left">
              <span className="text-accent text-[11px] font-extrabold uppercase tracking-[0.25em]">
                Syllabus Clusters
              </span>
              <h2 className="text-primary font-black text-3xl sm:text-4xl mt-1 tracking-tight">
                Academic Specializations
              </h2>
              <p className="text-blue-gray text-xs mt-1.5 max-w-xl font-light">
                Click any domain path below to instantly filter radiology preps and resources matching that domain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'FRCR Courses', count: '3 Programs', icon: '📝', query: 'FRCR Part 2B' },
                { title: 'Anatomy Specialty', count: '2 Modules', icon: '💀', query: 'Anatomy Module' },
                { title: 'Pathology & Cases', count: '1 Library', icon: '🧠', query: 'Pathology Library' },
                { title: 'Mock Board preps', count: 'Weekly live', icon: '⏱️', query: 'FRCR Part 1' },
                { title: 'Live webinars', count: 'Weekly batches', icon: '📡', query: 'FRCR Part 2A' },
                { title: 'Daily MCQs tests', count: 'Free revision', icon: '📚', query: 'FRCR Part 2B' },
                { title: 'Case Worksheets', count: '5,000+ files', icon: '🩻', query: 'Radiology Protocols' },
                { title: 'ACR Templates', count: 'Clinical templates', icon: '📁', query: 'Reporting Templates' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(item.query);
                    const el = document.getElementById('search-filter-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-soft-gray border border-slate-200 rounded-2xl p-5.5 flex items-center space-x-4 cursor-pointer hover:bg-primary hover:border-accent hover:text-white transition-all duration-300 group"
                >
                  <span className="text-3xl bg-white rounded-xl p-2.5 shadow-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                  <div className="text-left">
                    <h4 className="text-primary font-black text-sm group-hover:text-accent transition-colors uppercase tracking-wider">
                      {item.title}
                    </h4>
                    <p className="text-blue-gray text-[11px] font-medium leading-relaxed group-hover:text-slate-300 transition-colors mt-0.5">
                      {item.count}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 6. WHY LEARN WITH US SECTION (Clinical exposure & mock checklists) */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto text-left">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Graphics card */}
            <div className="lg:col-span-5 relative flex justify-center order-last lg:order-first">
              {/* Glowing circles */}
              <div className="absolute inset-0 bg-accent/5 rounded-full filter blur-3xl animate-pulse" />

              <div className="relative bg-[#050E24] border-2 border-accent/25 rounded-3xl p-6.5 max-w-[400px] w-full text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent w-full" />

                <h4 className="text-accent font-black text-xs uppercase tracking-[0.25em] mb-4">Academic Telemetry Check</h4>

                <div className="space-y-4 relative z-10 text-xs">
                  {[
                    { label: 'Royal College Calibration', value: '100% Calibrated' },
                    { label: 'Clinical Reporting Integration', value: 'ACR Templates' },
                    { label: 'PACS Sim DICOM stack density', value: '5,000+ files' },
                    { label: 'Simulated Viva-voce timer accuracy', value: '0.01s Precision' }
                  ].map((stat, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-slate-400">{stat.label}</span>
                      <span className="text-white font-extrabold">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center space-x-3">
                  <span className="text-2xl">🎓</span>
                  <div className="text-left text-[11px] leading-relaxed">
                    <div className="font-extrabold text-accent">Board Certification Ready</div>
                    <div className="text-slate-300 font-light mt-0.5">Accredited certificates of completion generated upon passing final module mocks.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right details */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-accent text-[11px] font-extrabold uppercase tracking-[0.25em]">
                  Academy Philosophy
                </span>
                <h2 className="text-primary font-black text-3xl sm:text-4xl mt-1 tracking-tight leading-snug">
                  Clear Board Exams & Refine <br />
                  Daily Clinical Reporting Pathways
                </h2>
                <p className="text-blue-gray text-xs mt-2.5 max-w-xl font-light leading-relaxed">
                  We don't just teach syllabus syllabus parameters. We bridge the critical gap between clearing theoretical exams and writing confident, professional diagnostic reads in your daily active hospital workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3.5">
                {[
                  { title: 'Expert Faculty', desc: 'Study under consulting specialists and board advisors.', emoji: '🧑‍⚕️' },
                  { title: 'Case-Based Systemics', desc: 'Gain diagnostic confidence using clinical scans.', emoji: '🧠' },
                  { title: 'Timer-Calibrated Mocks', desc: 'Train pacing matching exact RCR test formats.', emoji: '⏱️' },
                  { title: 'Daily MCQ telemetry', desc: 'High-yield Board revision questions emailed daily.', emoji: '📈' }
                ].map((item, idx) => (
                  <div key={idx} className="flex space-x-3.5">
                    <span className="text-2xl bg-white border border-slate-200 rounded-xl p-2.5 h-12 w-12 flex items-center justify-center shadow-sm">{item.emoji}</span>
                    <div className="text-left text-xs">
                      <h4 className="text-primary font-black uppercase tracking-wider">{item.title}</h4>
                      <p className="text-blue-gray font-light leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* 7. STUDENT TESTIMONIALS SLIDER SECTION */}
        <section className="bg-gradient-to-r from-[#030919] to-[#0A1733] text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-accent/20">
          <div className="max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Header */}
            <div className="lg:col-span-5 text-left space-y-4">
              <span className="text-accent text-[11px] font-extrabold uppercase tracking-[0.25em]">
                Student Success
              </span>
              <h2 className="text-white font-black text-3xl sm:text-4xl tracking-tight leading-tight">
                Alumni Endorsements <br />
                & Board Accomplishments
              </h2>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Discover how postgraduates, clinical fellows, and radiology residents globally passed their board credentials using Dr. Sam Reefath's training modules.
              </p>

              {/* Slider Arrows */}
              <div className="flex space-x-3.5 pt-3.5">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="p-3 bg-white/5 border border-white/10 hover:bg-accent hover:border-transparent hover:text-primary rounded-xl cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="p-3 bg-white/5 border border-white/10 hover:bg-accent hover:border-transparent hover:text-primary rounded-xl cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Testimonial Card */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6.5 sm:p-8 max-w-xl w-full text-left relative overflow-hidden backdrop-blur-md">

                {/* Gold Quotation watermark */}
                <span className="absolute top-6 right-8 text-7xl text-accent/10 font-serif leading-none">“</span>

                <div className="flex items-center space-x-4 mb-5.5">
                  <img
                    src={testimonials[currentSlide].image}
                    alt={testimonials[currentSlide].name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-accent"
                  />
                  <div>
                    <h4 className="text-white font-extrabold text-sm tracking-wide">{testimonials[currentSlide].name}</h4>
                    <p className="text-accent text-[10.5px] font-black uppercase tracking-wider mt-0.5">
                      {testimonials[currentSlide].course}
                    </p>
                  </div>
                </div>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light italic">
                  "{testimonials[currentSlide].feedback}"
                </p>

                <div className="mt-5.5 pt-4.5 border-t border-white/5 flex items-center justify-between text-slate-400 text-[10.5px]">
                  <span>Board Certified Alumnus</span>
                  {/* Testimonial Stars */}
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, starIdx) => (
                      <svg key={starIdx} className="w-3.5 h-3.5 text-accent fill-accent" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 8. FAQ ACCORDION SECTION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left">

          <div className="text-center mb-10">
            <span className="text-accent text-[11px] font-extrabold uppercase tracking-[0.25em]">
              Common Inquiries
            </span>
            <h2 className="text-primary font-black text-3xl sm:text-4xl mt-1 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-blue-gray text-xs mt-1.5 max-w-lg mx-auto font-light">
              Clear parameters regarding clinical enrollment keys, payment methods, certification terms, and viva timelines.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is the duration of access for course modules?',
                a: 'Enrollment in any target syllabus includes full, unlimited access for 12 months. This includes access to recorded video webinars, test analytics telemetry, flashcard suites, and clinical scan PACS stacks.'
              },
              {
                q: 'How are the live board viva mock classes scheduled?',
                a: 'Live viva-voce board preparations are held twice weekly via private, high-bandwidth Zoom webinars. Timing is staggered (Batch A & Batch B) to accommodate residents working global hospital shift schedules.'
              },
              {
                q: 'Do you offer institution seats for university residency programs?',
                a: 'Yes. We partner with radiology societies, university medical centers, and clinical hospital imaging groups globally to issue group seats. Get in touch with our billing department for institutional license quotes.'
              },
              {
                q: 'Are certificates of completion issued after passing mock boards?',
                a: 'Absolutely. Academy certificates of completion bearing accreditation values are generated automatically. This is a addition to support your clinical residency resumes.'
              },
              {
                q: 'What payment methods do you support for international candidates?',
                a: 'We accept all major global credit cards (Visa, MasterCard, Amex), direct clinical institutional bank transfers, and flexible instalment options through Stripe/PayPal gateways.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5.5 py-4.5 flex items-center justify-between text-primary font-bold text-sm sm:text-base hover:bg-soft-gray focus:outline-none transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <svg className={`w-5 h-5 text-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-5.5 pb-5 pt-1 border-t border-slate-100 text-blue-gray text-xs sm:text-sm leading-relaxed font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </section>

        {/* 9. NEWSLETTER SUBSCRIPTION SECTION */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto">
          <div className="bg-gradient-to-r from-[#030919] to-[#0A1733] rounded-3xl border-2 border-accent/25 p-8.5 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,155,60,0.1)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <span className="text-accent text-[10.5px] font-black uppercase tracking-[0.25em]">
                Monthly Digest
              </span>
              <h2 className="text-white font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
                Stay Updated with New Radiology Courses
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                Receive high-yield board revision MCQs, cross-sectional anatomy scans, and early notifications on live mock webinars directly in your clinical inbox.
              </p>

              <form
                onSubmit={(e) => { e.preventDefault(); alert('Subscribed to academy digest!'); }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
              >
                <input
                  type="email"
                  placeholder="doctor@radiology-academy.com"
                  className="w-full sm:w-[65%] bg-[#081535] border border-accent/30 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-accent transition-all"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-[35%] rounded-xl uppercase tracking-widest text-xs font-black py-3.5 px-6 shadow-md shadow-accent/25"
                >
                  Subscribe
                </Button>
              </form>
              <div className="text-[10px] text-slate-400 font-medium">
                🔒 Protected clinical data. Zero spam. Opt-out at any time.
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 10. ACADEMY FOOTER */}
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

    </div>
  );
}

export default CoursesPage;
