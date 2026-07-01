import React from 'react';

export function OverviewTab({
  STUDENT_PROFILE,
  ENROLLED_COURSES,
  setActiveTab,
  onEnterCourse
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Premium Welcome Hero Card */}
      <div className="bg-gradient-to-br from-[#0B1F4D] to-[#040817] border border-accent/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl text-left transition-all duration-300 hover:shadow-2xl">
        {/* Tech grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.04)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold tracking-wider uppercase">
              🩺 Radiology Workspace
            </span>
            <h2 className="text-white font-black text-3xl sm:text-4xl tracking-tight">
              Welcome Back, {STUDENT_PROFILE.name.split(' ')[0] || STUDENT_PROFILE.name} 👋
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed max-w-xl">
              Continue your radiology learning journey with live mock boards, timed PACS diagnostic cases, and high-yield RCR mock exam series.
            </p>

            {/* Miniature stats counter deck */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {[
                { label: 'Courses Enrolled', value: STUDENT_PROFILE.purchasedCourses, color: 'text-accent' },
                { label: 'Streak Days', value: `${STUDENT_PROFILE.streak} days`, color: 'text-emerald-400' },
                { label: 'Mock Test Score', value: `${STUDENT_PROFILE.examReadyScore}%`, color: 'text-blue-400' },
                { label: 'Completed Lessons', value: STUDENT_PROFILE.completedLessons, color: 'text-white' }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#050C1F]/90 border border-[#1C2C4E]/60 p-3 rounded-xl text-left shadow shadow-black/25">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</div>
                  <div className={`text-lg font-black mt-1 ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side vector diagnostics placeholder graphic */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-accent/20 flex items-center justify-center p-3 relative transform-gpu will-change-transform">
              <div className="w-full h-full rounded-full border border-accent/35 flex items-center justify-center p-4 bg-[#0A1224]/90 shadow-lg shadow-black/30">
                <svg className="w-16 h-16 text-accent transition-transform duration-300 hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Progress Analytics deck with chart simulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Learning Hours', value: `${STUDENT_PROFILE.hoursLearned} hrs`, desc: 'Total study telemetry', perc: 85, color: 'bg-[#C89B3C]' },
          { label: 'Syllabus Mastered', value: `${STUDENT_PROFILE.overallProgress}%`, desc: 'RCR curriculum mapping', perc: STUDENT_PROFILE.overallProgress, color: 'bg-emerald-500' },
          { label: 'Exam Readiness', value: `${STUDENT_PROFILE.examReadyScore}%`, desc: 'Average mock feedback', perc: STUDENT_PROFILE.examReadyScore, color: 'bg-blue-500' },
          { label: 'Weekly Active Rate', value: '92%', desc: 'Consistency checklist', perc: 92, color: 'bg-indigo-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 text-left shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ease-in-out transform-gpu will-change-transform">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-slate-100" />
            <div className={`absolute top-0 left-0 h-1.5 transition-all duration-1000 ${stat.color}`} style={{ width: `${stat.perc}%` }} />
            
            <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</h5>
            <div className="text-2xl font-black mt-2 text-slate-800">{stat.value}</div>
            <p className="text-[11px] text-slate-500 font-light mt-0.5">{stat.desc}</p>
            
            {/* Ring graphics simulator */}
            <div className="mt-4 flex items-center space-x-3.5">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${stat.color}`} style={{ width: `${stat.perc}%` }} />
              </div>
              <span className="text-[10px] text-slate-700 font-bold shrink-0">{stat.perc}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid holding main tasks checklists & notification widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Courses mini lists */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
            <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider">Active Modules</h3>
            <button onClick={() => setActiveTab('courses')} className="text-accent hover:text-[#0B1F4D] hover:underline text-xs font-bold focus:outline-none transition-colors duration-200 cursor-pointer">View All Courses →</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ENROLLED_COURSES.slice(0, 2).map((course) => (
              <div
                key={course.id}
                onClick={() => onEnterCourse(course.id)}
                className="bg-white border border-slate-200/80 hover:border-accent/40 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-48 cursor-pointer hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ease-in-out transform-gpu will-change-transform group"
              >
                <div className="space-y-2">
                  <span className="bg-accent/10 text-accent text-[9px] font-black px-2.5 py-1 rounded-lg border border-accent/20 uppercase tracking-wider">
                    {course.progress}% Completed
                  </span>
                  <h4 className="text-slate-800 font-black text-sm group-hover:text-accent transition-colors line-clamp-2 mt-1">{course.title}</h4>
                  <p className="text-slate-500 text-[10px] font-medium">{course.mentor}</p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[9.5px] text-slate-500 font-bold">
                    <span>{course.remaining} Lectures Left</span>
                    <span className="text-accent uppercase tracking-widest group-hover:underline">Resume →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* mini achievements streaks */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <div className="pb-3.5 border-b border-slate-200">
            <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider">Telemetry Streaks</h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ease-in-out transform-gpu will-change-transform">
            <div className="flex items-center space-x-3.5">
              <span className="text-3xl bg-slate-50 p-2.5 rounded-xl border border-accent/20">🔥</span>
              <div>
                <h4 className="text-[#0B1F4D] font-black text-sm">{STUDENT_PROFILE.streak}-Day Study Streak!</h4>
                <p className="text-slate-500 text-[10.5px] font-light leading-relaxed mt-0.5">Clearing exams requires active diagnostic consistency.</p>
              </div>
            </div>

            <div className="p-3.5 bg-accent/5 border border-accent/15 rounded-xl text-[10.5px] text-slate-600 leading-relaxed font-light">
              🏆 <span className="font-extrabold text-accent">Award Badges Unlocked:</span> 
              <div className="flex flex-wrap gap-2 mt-2">
                {['Physics Ace', 'DWI Master', 'ACR Expert'].map((badge) => (
                  <span key={badge} className="bg-slate-100 text-slate-700 border border-accent/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">{badge}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default OverviewTab;
