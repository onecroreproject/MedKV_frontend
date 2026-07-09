import React, { useState, useEffect } from 'react';
import { getLiveClasses } from '../../services/liveClassService';

export function DashboardHeader({
  sidebarCollapsed,
  setSidebarCollapsed,
  searchQuery,
  setSearchQuery,
  showSearchDropdown,
  searchResults,
  setActiveTab,
  profileDropdownOpen,
  setProfileDropdownOpen,
  onLogout,
  STUDENT_PROFILE,
  unreadNotificationsCount,
  ENROLLED_COURSES = [],
  liveClassUpdateTrigger
}) {
  const [upcomingLive, setUpcomingLive] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Fetch and find the closest upcoming live class
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await getLiveClasses();
        if (res.success) {
          const now = new Date();
          const upcoming = res.data
            .filter(s => {
              if (s.accessControl === 'all') return true;
              if (s.course && s.course.price === 0) return true;
              const cId = s.course?._id || s.course;
              if (cId && ENROLLED_COURSES.some(c => String(c.id) === String(cId))) return true;
              return false;
            })
            .map(s => {
              let fullStartDateTime = null;
              if (s.date && s.time) {
                const d = new Date(s.date);
                const [h, m] = s.time.split(':');
                if (h && m) {
                  d.setHours(parseInt(h), parseInt(m), 0, 0);
                  fullStartDateTime = d;
                }
              }
              return { ...s, fullStartDateTime };
            })
            .filter(s => s.fullStartDateTime && s.fullStartDateTime > now)
            .sort((a, b) => a.fullStartDateTime - b.fullStartDateTime);

          if (upcoming.length > 0) {
            setUpcomingLive(upcoming[0]);
          } else {
            setUpcomingLive(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live classes for header:", err);
      }
    };
    fetchUpcoming();
  }, [ENROLLED_COURSES, liveClassUpdateTrigger]);

  // Countdown timer logic
  useEffect(() => {
    if (!upcomingLive) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = upcomingLive.fullStartDateTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft('LIVE NOW');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else {
        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [upcomingLive]);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-sm">
      
      {/* Mobile Hamburger Menu */}
      <div className="lg:hidden mr-3">
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarCollapsed ? (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            ) : (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </button>
      </div>

      {/* Top Navbar Left: Realtime Search Widget */}
      <div className="flex-1 max-w-lg relative mr-4">
        <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/15 transition-all duration-300 shadow-sm">
          <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses, cases, MCQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-slate-800 text-xs placeholder-slate-400 w-full focus:outline-none ml-2.5"
          />
        </div>

        {/* Quick search suggestions popover */}
        {showSearchDropdown && (
          <div className="absolute top-[115%] left-0 right-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-[10px] text-accent font-black uppercase tracking-widest px-2 pb-1 border-b border-slate-100">Search Results</div>
            <div className="space-y-1 mt-2.5">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery('');
                    if (res.type === 'Course') setActiveTab('courses');
                    else if (res.type === 'Case File') setActiveTab('cases');
                    else setActiveTab('mcq');
                  }}
                  className="w-full text-left hover:bg-slate-50 px-2.5 py-2 rounded-lg flex justify-between items-center text-xs font-semibold group cursor-pointer transition-colors duration-200"
                >
                  <span className="text-slate-700 group-hover:text-[#0B1F4D] transition-colors">{res.title}</span>
                  <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wide shrink-0">{res.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Navbar Right: alerts, bell, dropdown */}
      <div className="flex items-center space-x-4">
        
        {/* Live Ticker countdown banner (Desktop only) */}
        {upcomingLive && (
          <div 
            className="hidden xl:flex items-center bg-accent/15 border border-accent/25 rounded-xl px-4 py-2 text-xs font-bold text-[#0B1F4D] space-x-2 cursor-pointer hover:bg-accent/25 transition-colors"
            onClick={() => setActiveTab('live')}
          >
            <span className="h-2 w-2 bg-accent rounded-full animate-ping" />
            <span className="uppercase tracking-wider text-[10px] text-accent font-black">Upcoming Live:</span>
            <span className="text-slate-800 font-extrabold truncate max-w-[200px]">{upcomingLive.title}</span>
            <span className="bg-white text-accent text-[9px] font-black px-2 py-0.5 rounded border border-accent/20 shadow-sm">{timeLeft}</span>
          </div>
        )}

        {/* Notifications Alert Bell */}
        <div className="relative">
          <button 
            onClick={() => setActiveTab('notifications')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 hover:text-[#0B1F4D] relative transition-all duration-300 transform active:scale-95 focus:outline-none cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-[#060B18] text-[8px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Dropdown avatar */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl p-1.5 focus:outline-none cursor-pointer transition-all duration-300 transform active:scale-95"
          >
            <span className="text-xl bg-slate-200 h-8 w-8 rounded-lg flex items-center justify-center">
              {STUDENT_PROFILE.avatar}
            </span>
            <svg className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-[115%] w-48 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5">
                <h5 className="font-extrabold text-xs text-slate-800">{STUDENT_PROFILE.name}</h5>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{STUDENT_PROFILE.email}</p>
              </div>
              <button
                onClick={() => { setProfileDropdownOpen(false); setActiveTab('dashboard'); }}
                className="w-full text-left hover:bg-slate-50 px-2 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#0B1F4D] transition-colors cursor-pointer"
              >
                My Profile
              </button>
              <button
                onClick={() => { setProfileDropdownOpen(false); setActiveTab('help'); }}
                className="w-full text-left hover:bg-slate-50 px-2 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#0B1F4D] transition-colors cursor-pointer"
              >
                Settings
              </button>
              <button
                onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                className="w-full text-left hover:bg-rose-50 px-2 py-2 rounded-lg text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;
