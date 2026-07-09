import React from 'react';
import { usePlatform } from '../../context/PlatformContext';

export function DashboardSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  onLogout,
  STUDENT_PROFILE,
  dark_logo,
  company_name,
  getMenuIcon,
  unreadNotificationCount = 0,
  hasOngoingLiveClass = false
}) {
  const { platformSettings } = usePlatform();
  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <aside className={`shrink-0 border-r border-slate-200/60 bg-gradient-to-b from-[#050C1F] to-[#0B1F4D] text-white transition-all duration-300 z-50 flex flex-col justify-between ${
        sidebarCollapsed 
          ? '-translate-x-full lg:translate-x-0 fixed lg:relative lg:w-20 inset-y-0 left-0 h-screen lg:h-auto' 
          : 'translate-x-0 fixed lg:relative inset-y-0 left-0 w-72 h-screen lg:h-auto shadow-2xl lg:shadow-none'
      }`}>
      
      <div className="pt-6">
        {/* Logo Header */}
        <div className={`flex items-center px-5 space-x-3.5 mb-7 transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <img src={platformSettings?.general?.logoUrl || dark_logo} alt="Emblem" className="h-10 w-auto shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex flex-col text-left">
              {platformSettings?.general?.websiteName ? (
                <span className="text-white font-bold text-sm leading-tight">{platformSettings.general.websiteName}</span>
              ) : (
                <img src={company_name} alt="Typography" className="h-6 w-auto shrink-0" />
              )}
              <span className="text-accent text-[5.5px] font-black tracking-[0.18em] uppercase mt-0.5 whitespace-nowrap">
                {platformSettings?.general?.tagline || 'LEARN • UNDERSTAND • EXCEL • SERVE'}
              </span>
            </div>
          )}
        </div>

        {/* Collapsible toggle anchor button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-7 -right-3.5 bg-[#C89B3C] hover:bg-[#0B1F4D] hover:text-white text-white p-1.5 rounded-full border border-accent/30 shadow-md z-50 focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Profile Quick Summary */}
        {!sidebarCollapsed ? (
          <div className="px-5 mb-7 text-left">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm relative overflow-hidden group transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-3xl bg-white/10 border border-white/20 rounded-xl p-2.5 shadow-inner">
                {STUDENT_PROFILE.avatar}
              </span>
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-white truncate">{STUDENT_PROFILE.name}</h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] text-accent font-extrabold uppercase tracking-wider">{STUDENT_PROFILE.badge}</span>
                </div>
                
                {/* Miniature profile progress track */}
                <div 
                  className="mt-2.5 cursor-pointer group/progress" 
                  onClick={() => setActiveTab('profile-settings')}
                  title="Complete your profile"
                >
                  <div className="flex justify-between items-center text-[9px] text-slate-300 font-bold mb-1 group-hover/progress:text-white transition-colors">
                    <span>Profile Setup</span>
                    <span>{STUDENT_PROFILE.overallProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-1000 group-hover/progress:brightness-110" style={{ width: `${STUDENT_PROFILE.overallProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <span className="text-2xl border border-accent/20 bg-white/5 rounded-xl p-2 cursor-pointer shadow" title={STUDENT_PROFILE.name}>
              {STUDENT_PROFILE.avatar}
            </span>
          </div>
        )}

        {/* Sidebar Menu Navigation List */}
        <nav className="px-3 space-y-1.5 overflow-y-auto max-h-[50vh] scrollbar-none text-left">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'courses', label: 'My Courses' },
            { id: 'live', label: 'Live Classes' },
            { id: 'recorded', label: 'Recorded Sessions' },
            // { id: 'cases', label: 'Case Library' },
            // { id: 'mcq', label: 'MCQ Tests' },
            // { id: 'mocks', label: 'Mock Exams' },
            // { id: 'daily', label: 'Daily Learning' },
            // { id: 'bookmarks', label: 'Bookmarks' },
            // { id: 'notes', label: 'Notes' },
            { id: 'notifications', label: 'Notifications' },
            // { id: 'certificates', label: 'Certificates' },
            { id: 'profile-settings', label: 'Profile Settings' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-xs tracking-wider transition-all duration-300 transform active:scale-95 group cursor-pointer focus:outline-none ${
                  isActive
                    ? 'bg-[#C89B3C] text-white shadow-md shadow-accent/25 border border-accent/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                } ${sidebarCollapsed ? 'justify-center' : 'space-x-3.5'}`}
                title={tab.label}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                  {getMenuIcon(tab.label)}
                </span>
                {!sidebarCollapsed && <span>{tab.label}</span>}
                
                {/* Unread indicators specifically for Notifications */}
                {tab.id === 'notifications' && !sidebarCollapsed && unreadNotificationCount > 0 && (
                  <span className="ml-auto bg-accent text-[#060B18] text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                    {unreadNotificationCount}
                  </span>
                )}
                {tab.id === 'notifications' && sidebarCollapsed && unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                )}

                {/* Live Class Indicator */}
                {tab.id === 'live' && !sidebarCollapsed && hasOngoingLiveClass && (
                  <span className="ml-auto bg-red-600 animate-pulse text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                  </span>
                )}
                {tab.id === 'live' && sidebarCollapsed && hasOngoingLiveClass && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 animate-pulse rounded-full border border-white" title="Live Class Ongoing" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lower Sidebar Actions (Logout & Help) */}
      <div className="p-3 border-t border-white/10 space-y-1 bg-[#03060E]/50">
        <button
          onClick={() => setActiveTab('help')}
          className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-xs tracking-wider transition-all duration-300 transform active:scale-95 group cursor-pointer focus:outline-none ${
            activeTab === 'help'
              ? 'bg-[#C89B3C] text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
          } ${sidebarCollapsed ? 'justify-center' : 'space-x-3.5'}`}
          title="Help & Support"
        >
          <span className="text-slate-300 group-hover:text-white">{getMenuIcon('Help & Support')}</span>
          {!sidebarCollapsed && <span>Support</span>}
        </button>
        
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-xs tracking-wider transition-all duration-300 transform active:scale-95 group text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 focus:outline-none cursor-pointer border border-transparent ${
            sidebarCollapsed ? 'justify-center' : 'space-x-3.5'
          }`}
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>

    </aside>
    </>
  );
}

export default DashboardSidebar;
