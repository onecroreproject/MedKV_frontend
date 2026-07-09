import React from 'react';

export function CoursesTab({
  ENROLLED_COURSES,
  onNavigate,
  onEnterCourse
}) {
  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">My Active Courses</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Study high-yield RCR curricula and local boards syllabi with active mentoring.</p>
      </div>

      {ENROLLED_COURSES.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm max-w-xl mx-auto mt-10">
          <svg className="w-16 h-16 text-blue-gray/50 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h4 className="text-primary font-black text-lg">No Active Enrollments</h4>
          <p className="text-blue-gray text-xs mt-1 leading-relaxed">
            You haven't enrolled in any courses yet. Browse our radiology catalog to get started.
          </p>
          <button
            onClick={() => onNavigate('courses')}
            className="mt-5.5 bg-accent text-[#0B1F4D] font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-widest cursor-pointer hover:bg-[#D4AF37] transition-all shadow-md"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {ENROLLED_COURSES.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-96 hover:shadow-xl hover:border-accent/40 hover:-translate-y-2 transition-all duration-300 ease-in-out group"
            >
              {/* Course Card Header image placeholder */}
              <div className="h-36 bg-slate-50 border-b border-slate-200/60 relative p-4 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="bg-slate-200/80 text-slate-700 text-[9px] font-black px-2.5 py-1 rounded border border-slate-300/40 uppercase tracking-widest">
                    {course.modules} Modules
                  </span>
                  <span className="bg-accent text-[#060B18] text-[9.5px] font-black px-2.5 py-1 rounded shadow uppercase tracking-wide">
                    {course.progress}%
                  </span>
                </div>

                <div className="relative z-10 flex items-center justify-center flex-grow">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🩻</span>
                </div>
              </div>

              {/* Course Card Details */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-[#0B1F4D] font-black text-base group-hover:text-accent transition-colors leading-tight line-clamp-2">{course.title}</h4>
                  <p className="text-slate-500 text-[10.5px] font-medium">Instructor: {course.mentor}</p>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-slate-100">
                  {/* Progress Bar */}
                  <div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mt-1.5">
                      <span>Remaining: {course.remaining} Lectures</span>
                      <span>Last active: {course.lastAccessed}</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onEnterCourse ? onEnterCourse(course.id) : onNavigate('course-detail', course.id)}
                      className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-white bg-accent rounded-lg border border-transparent hover:bg-[#A8802E] active:scale-95 transition-all duration-300 transform cursor-pointer shadow-sm hover:shadow flex items-center justify-center space-x-1.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={() => onNavigate('course-detail', course.id)}
                      className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-accent bg-transparent rounded-lg border border-accent hover:bg-accent/10 active:scale-95 transition-all duration-300 transform cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoursesTab;
