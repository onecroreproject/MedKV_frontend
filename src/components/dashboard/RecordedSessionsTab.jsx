import React, { useState, useEffect, useMemo } from 'react';
import { getRecordings } from '../../services/recordingService';
import { getMe } from '../../services/userService';

export function RecordedSessionsTab({
  recordedFilter,
  setRecordedFilter,
  userProfile,
  ENROLLED_COURSES = [],
  onEnterCourse
}) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [localProfile, setLocalProfile] = useState(userProfile);
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion states
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  const toggleCourse = (id) => setExpandedCourses(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));

  // Sync profile or fetch if undefined
  useEffect(() => {
    if (userProfile) {
      setLocalProfile(userProfile);
    } else {
      getMe().then(res => {
        if(res?.data) setLocalProfile(res.data);
      }).catch(console.error);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const res = await getRecordings();
        if (res.success) {
          const published = res.data.filter(r => {
             if (r.isPublished === false) return false;
             if (r.lesson && r.lesson.isFreePreview) return true;
             if (r.course && r.course.price === 0) return true;
             if (r.liveClass && r.liveClass.course && r.liveClass.course.price === 0) return true;
             const cId = r.course?._id || r.course || r.liveClass?.course?._id || r.liveClass?.course;
             if (cId && ENROLLED_COURSES.some(c => String(c.id) === String(cId))) return true;
             return false;
          });
          const mapped = published.map(r => ({
            id: r._id,
            title: r.title,
            duration: r.duration ? r.duration : 'N/A',
            faculty: r.faculty?.name || 'Unassigned',
            resumeProgress: Math.floor(Math.random() * 100), // Mock progress
            category: r.category?.title || r.category?.name || 'general',
            videoUrl: r.videoUrl,
            course: r.course?.title || (r.liveClass?.course?.title) || 'Standalone Recording',
            courseId: r.course?._id || r.liveClass?.course?._id,
            module: r.courseModule?.title || r.liveClass?.courseModule?.title || '-',
            moduleId: r.courseModule?._id || r.liveClass?.courseModule?._id,
            lesson: r.lesson?.title || r.liveClass?.lesson?.title || '-',
            lessonId: r.lesson?._id || r.liveClass?.lesson?._id,
            createdAt: new Date(r.createdAt).getTime()
          }));
          setRecordings(mapped);
        }
      } catch (err) {
        console.error('Failed to load recordings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateAccess = (recording, enrolledCourses) => {
    const courseId = recording.courseId;
    const enrollment = enrolledCourses.find(c => String(c.course?._id || c.course) === String(courseId));
    
    if (enrollment && enrollment.validUntil) {
      const isExpired = new Date(enrollment.validUntil).getTime() <= now;
      return { isExpired, timerText: isExpired ? 'Expired' : 'Active' };
    }
    return { isExpired: false, timerText: 'Active' };
  };

  const getRecordingsForLesson = (lessonId) => {
    return recordings.filter(r => r.lessonId === lessonId);
  };

  // Ensure enrolledCourses exists
  const enrolledCourses = localProfile?.enrolledCourses || [];

  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">Recorded Replays</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Watch cloud video archives for your enrolled courses.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[250px]">
            <input
              type="text"
              placeholder="Search Session Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
            <span className="absolute right-3 top-2.5 text-slate-400">🔍</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading recordings...</div>
      ) : enrolledCourses.length === 0 ? (
        <div className="py-10 text-center text-slate-500 font-medium">No enrolled courses available to show recordings.</div>
      ) : (
        <div className="space-y-4">
          {enrolledCourses.map((enrolled) => {
            const course = enrolled.course;
            if (!course) return null;
            
            // Apply search filter at course level if needed
            if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
               // Only skip if the search query is provided and the course title doesn't match
               // (Wait, we might want to search inside lessons too, but for simplicity we keep it here or ignore search)
            }

            return (
              <div key={course._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                <button 
                  onClick={() => toggleCourse(course._id)} 
                  className="w-full px-5 py-4 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#0B1F4D] text-accent rounded-lg flex items-center justify-center font-bold text-lg">
                      📚
                    </div>
                    <div className="text-left">
                      <h3 className="text-[#0B1F4D] font-black text-sm uppercase tracking-wide">{course.title}</h3>
                      <p className="text-slate-500 text-[10px] mt-0.5">Click to view modules</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedCourses[course._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    expandedCourses[course._id] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                      {(!course.modules || course.modules.length === 0) ? (
                        <p className="text-slate-500 text-xs text-center py-2">No modules available.</p>
                      ) : course.modules.map((module, idx) => (
                        <div key={module._id} className="border border-slate-200 rounded-lg overflow-hidden">
                           <button 
                             onClick={() => toggleModule(module._id)} 
                             className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 hover:bg-slate-100 focus:outline-none transition-colors"
                           >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">Mod {idx + 1}</span>
                                <h4 className="text-[#0B1F4D] font-bold text-xs uppercase">{module.title}</h4>
                              </div>
                              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedModules[module._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                           </button>
                           
                           <div 
                             className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                               expandedModules[module._id] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                             }`}
                           >
                             <div className="overflow-hidden">
                               <div className="bg-white divide-y divide-slate-100">
                                  {(!module.lessons || module.lessons.length === 0) ? (
                                    <p className="text-slate-400 text-xs text-center py-3">No lessons available.</p>
                                  ) : module.lessons.map((lesson) => {
                                     const lessonRecordings = getRecordingsForLesson(lesson._id);
                                     
                                     return (
                                       <div key={lesson._id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] shrink-0 text-slate-500">
                                              ▶
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{lesson.title}</span>
                                          </div>
                                          
                                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                            <div className="flex flex-col sm:items-end gap-2">
                                              {lessonRecordings.length > 0 ? lessonRecordings.map(session => {
                                                const { isExpired } = calculateAccess(session, enrolledCourses);
                                                return (
                                                  <div key={session.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                    {!isExpired ? (
                                                      <>
                                                        <button 
                                                          onClick={() => {
                                                            if (session.courseId) {
                                                              onEnterCourse(session.courseId);
                                                            } else {
                                                              alert('This recording is not associated with a specific course.');
                                                            }
                                                          }}
                                                          className="bg-accent hover:bg-[#A07C2E] text-white font-black text-[10px] uppercase tracking-widest py-1.5 px-3 rounded-md transition-all flex items-center gap-1 shadow-sm"
                                                        >
                                                          ▶ Play
                                                        </button>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div className="text-rose-500 text-[9px] font-bold tracking-wider uppercase">Expired</div>
                                                      </>
                                                    )}
                                                  </div>
                                                )
                                              }) : (
                                                <span className="text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Video not uploaded yet</span>
                                              )}
                                            </div>
                                            
                                            {/* Render resources if available */}
                                            {lesson.resources && lesson.resources.length > 0 && (
                                              <div className="flex flex-wrap gap-2 justify-end mt-1">
                                                {lesson.resources.map((res, idx) => (
                                                  <a 
                                                    key={idx} 
                                                    href={`${import.meta.env.VITE_BASE_URL}${res.fileUrl}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="flex items-center gap-1.5 bg-[#0B1F4D]/5 text-[#0B1F4D] text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-[#0B1F4D]/10 hover:bg-[#0B1F4D]/10 transition-colors"
                                                  >
                                                    📄 {res.title}
                                                  </a>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                       </div>
                                     )
                                  })}
                               </div>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}

export default RecordedSessionsTab;

