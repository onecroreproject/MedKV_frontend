import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import { getRecordings } from '../../services/recordingService';
import { getMe, logStudyTime, markLessonComplete } from '../../services/userService';
import { getLiveClasses } from '../../services/liveClassService';


// Removed mock arrays

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressRing({ percent, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#C89B3C" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  );
}

function DifficultyBadge({ level }) {
  const styles = { Easy: 'bg-emerald-50 text-emerald-600 border-emerald-200', Medium: 'bg-amber-50 text-amber-600 border-amber-200', Hard: 'bg-orange-50 text-orange-600 border-orange-200', Expert: 'bg-rose-50 text-rose-600 border-rose-200' };
  return <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${styles[level] || styles.Medium}`}>{level}</span>;
}

// ─── VIDEO PLAYER ─────────────────────────────────────────────────────────────
function VideoPlayer({ lesson, onAddNotes, isExpired, isCompleted }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('1x');
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [marked, setMarked] = useState(isCompleted || false);

  useEffect(() => {
    setMarked(isCompleted || false);
  }, [isCompleted, lesson]);
  const [bookmarked, setBookmarked] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const lastSaveTimeRef = useRef(0);

  useEffect(() => {
    const lessonId = lesson?._id || lesson?.id;
    if (!lessonId) {
      setShowResumePrompt(false);
      setSavedTime(0);
      return;
    }

    const saved = localStorage.getItem(`video-progress-${lessonId}`);
    if (saved && parseFloat(saved) > 5) {
      setSavedTime(parseFloat(saved));
      setShowResumePrompt(true);
      setPlaying(false);
    } else {
      setShowResumePrompt(false);
      setSavedTime(0);
      setPlaying(false);
    }
    lastSaveTimeRef.current = 0;
  }, [lesson?.id, lesson?._id]);

  useEffect(() => {
    if (videoRef.current) {
      if (playing) videoRef.current.play().catch(e => console.error("Play failed", e));
      else videoRef.current.pause();
    }
  }, [playing]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = parseFloat(speed);
    }
  }, [speed]);

  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => {
        logStudyTime(1).catch(console.error);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);

      // Save progress to localStorage periodically
      if (!lastSaveTimeRef.current || Math.abs(current - lastSaveTimeRef.current) > 5) {
        const lessonId = lesson?._id || lesson?.id;
        if (lessonId && current > 0 && current < total - 5) {
          localStorage.setItem(`video-progress-${lessonId}`, current.toString());
          lastSaveTimeRef.current = current;
        } else if (lessonId && current >= total - 5) {
          // Clear progress if finished
          localStorage.removeItem(`video-progress-${lessonId}`);
          if (!marked) {
            setMarked(true);
            markLessonComplete(lessonId).catch(console.error);
          }
        }
      }
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
      setProgress(pos * 100);
    }
  };

  const skipForward = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen?.();
    }
  };

  const parseVideoUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return null; // We are handling raw mp4
    let cleanUrl = url.replace(/\\/g, '/');
    if (!cleanUrl.startsWith('http')) {
      if (!cleanUrl.startsWith('/uploads/')) {
        cleanUrl = '/uploads/' + cleanUrl;
      }
      return `${import.meta.env.VITE_BASE_URL}${cleanUrl}`;
    }
    return cleanUrl;
  };

  const videoSrc = lesson ? parseVideoUrl(lesson.videoUrl) : null;

  return (
    <div className="space-y-4">
      {/* Player */}
      <div
        ref={containerRef}
        className="relative bg-[#030919] rounded-2xl overflow-hidden shadow-2xl border border-accent/10 group"
        style={{ aspectRatio: '16/9' }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        {videoSrc ? (
          <video 
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover cursor-pointer"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setPlaying(false)}
            onClick={() => {
              if (!showResumePrompt) setPlaying(p => !p);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
             No video available for this lesson.
          </div>
        )}
        
        {/* Expired Overlay */}
        {isExpired ? (
          <div className="absolute inset-0 z-50 bg-[#030919]/90 flex flex-col items-center justify-center backdrop-blur-md px-4">
            <h4 className="text-white font-black text-xl sm:text-2xl mb-4 text-center">Access Expired</h4>
            <p className="text-slate-300 text-sm mb-6 text-center max-w-sm">Your access to this course has expired.</p>
          </div>
        ) : showResumePrompt && videoSrc ? (
          <div className="absolute inset-0 z-40 bg-[#030919]/90 flex flex-col items-center justify-center backdrop-blur-md">
            <h4 className="text-white font-black text-xl sm:text-2xl mb-6">Resume watching?</h4>
            <div className="flex gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.currentTime = savedTime;
                  }
                  setShowResumePrompt(false);
                  setPlaying(true);
                }}
                className="bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Resume ({Math.floor(savedTime / 60)}:{String(Math.floor(savedTime % 60)).padStart(2, '0')})
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                  setShowResumePrompt(false);
                  setPlaying(true);
                  const lessonId = lesson?._id || lesson?.id;
                  if (lessonId) localStorage.removeItem(`video-progress-${lessonId}`);
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start Over
              </button>
            </div>
          </div>
        ) : null}

        {/* Play overlay */}
        {!playing && !showResumePrompt && videoSrc && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-accent/90 flex items-center justify-center shadow-2xl shadow-accent/40 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-[#050E24] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        {/* Controls bar */}
        <div className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-t from-black/90 to-transparent px-4 pt-8 pb-3 space-y-2">
            {/* Seek bar */}
            <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group/seek" onClick={handleSeek}>
              <div className="h-full bg-accent rounded-full transition-all duration-200 pointer-events-none" style={{ width: `${progress}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-accent rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity cursor-grab pointer-events-none" style={{ left: `calc(${progress}% - 7px)` }} />
            </div>
            {/* Buttons row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }} className="text-white hover:text-accent transition-colors cursor-pointer focus:outline-none p-1">
                  {playing ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <button onClick={skipForward} className="text-white hover:text-accent transition-colors cursor-pointer focus:outline-none p-1" title="Skip 10s">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                  </svg>
                </button>
                <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                  <input type="range" min={0} max={100} value={volume} onChange={e => { e.stopPropagation(); setVolume(+e.target.value); }}
                    className="w-16 h-1 accent-[#C89B3C] cursor-pointer" onClick={e => e.stopPropagation()} />
                </div>
                <span className="text-white/70 text-[10px] font-mono">
                  {videoRef.current ? Math.floor(videoRef.current.currentTime / 60) : 0}:{String(Math.floor((videoRef.current ? videoRef.current.currentTime : 0) % 60)).padStart(2, '0')} / {lesson ? lesson.duration : '00:00'}
                </span>
              </div>
              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                {/* Speed */}
                <div className="relative group/speed">
                  <button className="text-white text-[10px] font-black bg-white/10 hover:bg-accent/30 px-2 py-1 rounded transition-colors cursor-pointer focus:outline-none">{speed}</button>
                  <div className="absolute bottom-full right-0 mb-1 bg-[#0B1F4D] border border-accent/20 rounded-xl p-1.5 hidden group-hover/speed:flex flex-col space-y-0.5 shadow-xl z-50 min-w-[60px]">
                    {['0.75x', '1x', '1.25x', '1.5x', '2x'].map(s => (
                      <button key={s} onClick={(e) => { e.stopPropagation(); setSpeed(s); }}
                        className={`text-[10px] font-black px-2 py-1 rounded text-left cursor-pointer transition-colors ${speed === s ? 'bg-accent text-[#050E24]' : 'text-white hover:bg-white/10'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Quality */}
                <button className="text-white text-[10px] font-black bg-white/10 hover:bg-accent/30 px-2 py-1 rounded transition-colors cursor-pointer focus:outline-none">HD</button>
                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="text-white hover:text-accent transition-colors cursor-pointer focus:outline-none p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below video meta & actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-[#0B1F4D] font-black text-lg leading-tight">{lesson?.title || 'Course Lesson'}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs font-medium">
            <span className="flex items-center space-x-1.5"><span>🧑‍⚕️</span><span>Instructor</span></span>
            <span>•</span>
            <span>{lesson?.duration || '00:00'}</span>
            <span>•</span>
            <span>Uploaded May 20, 2026</span>
            <span className="flex items-center space-x-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span>✓</span><span>In Progress ({Math.round(progress)}%)</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (!marked) {
                setMarked(true);
                const lessonId = lesson?._id || lesson?.id;
                if (lessonId) markLessonComplete(lessonId).catch(console.error);
              }
            }}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer border ${marked ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-[#0B1F4D] text-white border-[#0B1F4D] hover:bg-[#0a1a42]'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{marked ? 'Completed' : 'Mark Complete'}</span>
          </button>
          <button
            onClick={() => setBookmarked(b => !b)}
            className={`p-2.5 rounded-xl border text-sm transition-all duration-300 active:scale-95 cursor-pointer ${bookmarked ? 'bg-accent text-[#050E24] border-accent' : 'bg-white border-slate-200 text-slate-500 hover:border-accent hover:text-accent'}`}
            title="Bookmark Lesson"
          >🔖</button>
          <button onClick={onAddNotes} className="p-2.5 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-accent hover:text-accent text-sm transition-all duration-300 active:scale-95 cursor-pointer" title="Add Notes">✏️</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function CourseLearningTab({ courseId, setActiveTab, enrolledCourseInfo }) {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [learningTab, setLearningTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState({});
  const [curriculumOpen, setCurriculumOpen] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [courseLiveClasses, setCourseLiveClasses] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [weeklyData] = useState([65, 72, 58, 81, 74, 90, 68]);

  const [now, setNow] = useState(Date.now());
  const [localProfile, setLocalProfile] = useState(null);

  useEffect(() => {
    getMe().then(res => {
      if(res?.data) setLocalProfile(res.data);
    }).catch(console.error);
    
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateAccess = () => {
    if (!localProfile?.enrolledCourses) return { isExpired: false };
    const enrollment = localProfile.enrolledCourses.find(c => String(c.course?._id || c.course) === String(courseId));
    
    if (enrollment && enrollment.validUntil) {
      const isExpired = new Date(enrollment.validUntil).getTime() <= now;
      return { isExpired };
    }
    return { isExpired: false };
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getCourseById(courseId);
        if (res.data) {
           setCourseData(res.data);
           // Initialize first module expanded and first lesson active
           if (res.data.modules && res.data.modules.length > 0) {
             setExpandedModules({ [res.data.modules[0]._id]: true });
             if (res.data.modules[0].lessons && res.data.modules[0].lessons.length > 0) {
               setActiveLesson(res.data.modules[0].lessons[0]);
             }
           }
        }
        const recRes = await getRecordings();
        if (recRes.success) {
          setRecordings(recRes.data);
        }
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("Failed to load course content.");
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const toggleModule = (id) => setExpandedModules(p => ({ ...p, [id]: !p[id] }));

  const calculateTotalDuration = () => {
    if (!courseData?.modules) return '0h 0m';
    let totalSeconds = 0;
    courseData.modules.forEach(module => {
      module.lessons?.forEach(lesson => {
        if (lesson.duration) {
          const parts = lesson.duration.split(':').map(Number);
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
             totalSeconds += parts[0] * 60 + parts[1];
          } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
             totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
          }
        }
      });
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-10 text-center text-status-error font-bold">{error}</div>;
  if (!courseData) return <div className="p-10 text-center text-slate-500 font-medium">Course not found.</div>;

  const totalLessonsCount = courseData.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  // Estimate completed lessons based on progress percentage
  const progressPercent = enrolledCourseInfo?.progress || 0;
  const completedLessonsEstimate = Math.floor(totalLessonsCount * (progressPercent / 100));

  const course = {
    title: courseData.title || 'Course Title',
    subtitle: courseData.description || 'Course Description',
    mentor: courseData.instructor?.name || 'Instructor',
    mentorRole: 'Instructor',
    mentorAvatar: courseData.instructor?.profileImage ? '🧑‍⚕️' : '🧑‍⚕️',
    progress: progressPercent,
    totalModules: courseData.modules?.length || 0,
    totalLessons: totalLessonsCount,
    completedLessons: completedLessonsEstimate,
    totalHours: calculateTotalDuration(),
    category: courseData.category?.name || 'Category',
    emoji: courseData.thumbnail ? '🖼️' : '📋',
  };

  const remaining = course.totalLessons - course.completedLessons;
  const { isExpired } = calculateAccess();

  return (
    <div className="space-y-0 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

      {/* ── COURSE HEADER ──────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#030919] via-[#0B1F4D] to-[#0A1733] rounded-3xl p-5 sm:p-7 mb-6 overflow-hidden border border-accent/15 shadow-xl">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.025)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Left */}
          <div className="flex items-start space-x-4 flex-grow min-w-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0B1F4D]/80 border border-accent/25 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shrink-0">
              {course.emoji}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="bg-accent/15 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">{course.category}</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{course.progress}% Complete</span>
              </div>
              <h2 className="text-white font-black text-xl sm:text-2xl leading-tight truncate">{course.title}</h2>
              <p className="text-slate-400 text-xs font-light leading-relaxed line-clamp-1 hidden sm:block">{course.subtitle}</p>
              <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-medium">
                <span>{course.mentorAvatar}</span>
                <span>{course.mentor}</span>
                <span>•</span>
                <span>{course.mentorRole}</span>
              </div>
            </div>
          </div>
          {/* Right stats */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3">
              {[
                { label: 'Modules', value: course.totalModules },
                { label: 'Done', value: course.completedLessons },
                { label: 'Left', value: remaining },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center min-w-[60px]">
                  <div className="text-white font-black text-xl leading-none">{s.value}</div>
                  <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="relative">
              <ProgressRing percent={course.progress} size={64} stroke={6} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-xs">{course.progress}%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="relative z-10 mt-5 space-y-1.5">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-[#D4AF37] rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
            <span>{course.totalHours} total</span>
          </div>
        </div>
        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-5">
          <button className="bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-accent/20 active:scale-95 cursor-pointer flex items-center space-x-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            <span>Continue Learning</span>
          </button>
          <button onClick={() => setActiveTab('live')} className="bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer flex items-center space-x-2">
            <span className="h-2 w-2 bg-white rounded-full animate-ping" />
            <span>Join Live Session</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer flex items-center space-x-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Notes</span>
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ─────────────────────────────────────────────────── */}
      <div className={`flex gap-6 items-start ${curriculumOpen ? 'flex-col xl:flex-row' : ''}`}>

        {/* LEFT: Video + Tabs */}
        <div className="flex-grow min-w-0 space-y-6">

          {/* Video Player */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
            <VideoPlayer 
              lesson={activeLesson} 
              onAddNotes={() => setLearningTab('notes')} 
              isExpired={isExpired}
              isCompleted={localProfile?.completedLessons?.includes(activeLesson?._id || activeLesson?.id)}
            />
          </div>

          {/* Learning Tabs */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Tab Nav */}
            <div className="flex items-center space-x-1 p-2 border-b border-slate-100 overflow-x-auto scrollbar-none">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'content', label: 'Course Content', icon: '📚' },
                { id: 'notes', label: 'Notes & PDFs', icon: '📄' },
                { id: 'quizzes', label: 'Quizzes', icon: '✏️' },
                { id: 'cases', label: 'Cases', icon: '🩻' },
                { id: 'discussion', label: 'Discussion', icon: '💬' },
                { id: 'live', label: 'Live Sessions', icon: '📡' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLearningTab(tab.id)}
                  className={`shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer focus:outline-none transition-all duration-300 whitespace-nowrap ${
                    learningTab === tab.id
                      ? 'bg-[#0B1F4D] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-5 sm:p-6">

              {/* OVERVIEW */}
              {learningTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[#0B1F4D] font-black text-base uppercase tracking-wide mb-3">Course Description</h4>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">
                      This comprehensive FRCR Part 2A course provides expert-led, case-based radiology training designed for clinical radiology registrars preparing for the FRCR, DNB, DMRD, and MDRD examinations. The curriculum covers systemic radiology with real DICOM case spotters, pattern recognition training, and mock board vivas with Dr. Sam Reefath.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[#0B1F4D] font-black text-base uppercase tracking-wide mb-3">Learning Objectives</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        'Master systematic MRI brain interpretation with case-based differentials',
                        'Recognise acute ischaemic stroke, demyelination, and neoplastic patterns on DWI/FLAIR',
                        'Apply ACR reporting standards and structured radiology reports',
                        'Achieve confidence in FRCR 2A rapid reporting and viva format',
                        'Interpret chest CT patterns including pulmonary, mediastinal, and pleural disease',
                        'Perform FRCR 2A mock examinations under timed, board-calibrated conditions',
                      ].map((obj, i) => (
                        <div key={i} className="flex items-start space-x-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="h-5 w-5 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-2.5 h-2.5 text-accent" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-slate-600 text-xs font-medium leading-relaxed">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Exam Prep', value: 'FRCR / DNB', icon: '🎓' },
                      { label: 'Level', value: 'Advanced', icon: '📊' },
                      { label: 'Certificate', value: 'On Completion', icon: '🏅' },
                      { label: 'Support', value: 'Faculty Q&A', icon: '💬' },
                    ].map(s => (
                      <div key={s.label} className="bg-gradient-to-br from-[#030919] to-[#0B1F4D] border border-accent/15 rounded-2xl p-4 text-center">
                        <div className="text-2xl mb-1.5">{s.icon}</div>
                        <div className="text-white font-black text-xs uppercase tracking-wide">{s.value}</div>
                        <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COURSE CONTENT */}
              {learningTab === 'content' && (
                <div className="space-y-3">
                  <p className="text-slate-500 text-xs font-light">{course.completedLessons} of {course.totalLessons} lessons completed · {course.totalHours} total</p>
                  {courseData.modules && courseData.modules.map((mod, i) => (
                    <div key={mod._id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleModule(mod._id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 text-left focus:outline-none cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">📦</span>
                          <span className="text-[#0B1F4D] font-black text-xs uppercase tracking-wide">{mod.title}</span>
                          <span className="text-slate-400 text-[9px] font-bold">{mod.lessons?.length || 0} lessons</span>
                        </div>
                        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${expandedModules[mod._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedModules[mod._id] && mod.lessons && (
                        <div className="divide-y divide-slate-100">
                          {mod.lessons.map(les => {
                            const { isExpired } = calculateAccess();
                            return (
                            <div
                              key={les._id}
                              className={`w-full flex flex-col px-4 py-3 text-left transition-colors focus:outline-none ${
                                activeLesson && les._id === activeLesson._id ? 'bg-accent/5 border-l-2 border-accent' :
                                'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-3 w-full">
                                <button
                                  onClick={() => !isExpired && setActiveLesson(les)}
                                  className={`flex items-center space-x-3 flex-grow min-w-0 ${isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <div className={`h-7 w-7 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                                    activeLesson && les._id === activeLesson._id ? 'bg-accent/15 text-accent border border-accent/25' :
                                    'bg-slate-100 text-slate-400 border border-slate-200'
                                  }`}>
                                    {activeLesson && les._id === activeLesson._id ? '▶' : '○'}
                                  </div>
                                  <div className="flex-grow min-w-0 text-left">
                                    <div className={`text-xs font-bold truncate ${activeLesson && les._id === activeLesson._id ? 'text-accent' : 'text-slate-700'}`}>{les.title}</div>
                                  </div>
                                </button>
                                
                                <div className="flex items-center gap-2 shrink-0 sm:self-auto self-start pl-10 sm:pl-0">
                                  <span className="text-slate-400 text-[10px] font-mono">{les.duration}</span>
                                </div>
                              </div>
                              
                              {les.resources && les.resources.length > 0 && (
                                <div className="flex flex-wrap gap-2 w-full pl-10 pt-2">
                                  {les.resources.map((res, idx) => (
                                    <a 
                                      key={idx} 
                                      href={`${import.meta.env.VITE_BASE_URL}${res.fileUrl}`} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="flex items-center gap-1.5 bg-[#0B1F4D]/5 text-[#0B1F4D] text-[9px] font-bold px-2 py-1 rounded-md border border-[#0B1F4D]/10 hover:bg-[#0B1F4D]/10 transition-colors"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      📄 {res.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )})}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* NOTES & PDFs */}
              {learningTab === 'notes' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {courseData?.modules?.flatMap(mod => mod.lessons?.flatMap(les => (les.resources || []).map(r => ({ ...r, lessonTitle: les.title, moduleTitle: mod.title }))))?.length > 0 ? 
                      courseData.modules.flatMap(mod => mod.lessons?.flatMap(les => (les.resources || []).map(r => ({ ...r, lessonTitle: les.title, moduleTitle: mod.title })))).map((res, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 group">
                        <div className="flex items-start space-x-3">
                          <div className="h-11 w-11 rounded-xl bg-[#0B1F4D] border border-accent/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">📄</div>
                          <div className="flex-grow min-w-0">
                            <h5 className="text-[#0B1F4D] font-black text-xs uppercase tracking-wide truncate group-hover:text-accent transition-colors">{res.title}</h5>
                            <p className="text-slate-400 text-[10px] font-medium mt-1 line-clamp-2 leading-relaxed break-words">
                              <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Mod:</span> {res.moduleTitle} <span className="mx-1">•</span> <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Lesson:</span> {res.lessonTitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a href={res.fileUrl?.startsWith('http') ? res.fileUrl : `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${res.fileUrl?.startsWith('/') ? '' : '/'}${res.fileUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-[#0B1F4D] hover:bg-[#0a1a42] text-white font-black text-[9px] uppercase tracking-widest py-2 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer text-center flex items-center justify-center space-x-1">
                            <span>View / Download</span>
                          </a>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-1 sm:col-span-2 text-center py-10 text-slate-400 font-medium">No notes or PDFs available for this course.</div>
                    )}
                  </div>
                </div>
              )}

              {/* QUIZZES, CASES, DISCUSSION */}
              {(learningTab === 'quizzes' || learningTab === 'cases' || learningTab === 'discussion') && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="text-5xl mb-4 opacity-50">🚧</div>
                  <h3 className="text-[#0B1F4D] font-black text-xl uppercase tracking-wide mb-2">Coming Soon</h3>
                  <p className="text-slate-500 font-light max-w-md">We are working hard to bring you interactive {learningTab} to enhance your learning experience. Stay tuned!</p>
                </div>
              )}

              {/* LIVE SESSIONS */}
              {learningTab === 'live' && (
                <div className="space-y-4">
                  {courseLiveClasses.length > 0 ? courseLiveClasses.map(sess => (
                    <div key={sess._id} className={`border rounded-2xl p-5 transition-all duration-300 ${sess.status === 'Scheduled' || sess.status === 'Ongoing' ? 'bg-slate-50 border-slate-200 hover:border-accent/30' : 'bg-rose-50 border-rose-200'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-grow space-y-2">
                          <div className="flex items-center space-x-2">
                            {sess.status === 'Scheduled' || sess.status === 'Ongoing' ? (
                              <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{sess.status}</span>
                            ) : (
                              <span className="bg-rose-50 border border-rose-200 text-rose-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{sess.status || 'Completed'}</span>
                            )}
                          </div>
                          <h4 className="text-[#0B1F4D] font-black text-sm uppercase tracking-wide">{sess.topic}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-[10px] font-medium">
                            <span>🧑‍⚕️ {sess.faculty?.name || 'Unassigned'}</span>
                            <span>📅 {new Date(sess.scheduleDate).toLocaleDateString()}</span>
                            <span>⏱️ {sess.startTime} - {sess.endTime}</span>
                          </div>
                        </div>
                        {sess.status === 'Scheduled' || sess.status === 'Ongoing' ? (
                          <button 
                            onClick={() => {
                              if (sess.meetingProvider === 'webrtc') {
                                navigate(`/webrtc/${sess._id || sess.roomId}`);
                              } else {
                                window.open(sess.zoomLink, '_blank');
                              }
                            }}
                            className="shrink-0 bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer">
                            Join Class
                          </button>
                        ) : (
                          <button onClick={() => setActiveTab('recorded')} className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer">
                            Watch Recording
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-slate-400 font-medium">No live sessions scheduled for this course.</div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── PROGRESS ANALYTICS ────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-[#0B1F4D] font-black text-base uppercase tracking-wide">Learning Analytics</h3>
              <p className="text-slate-500 text-xs font-light mt-0.5">Your progress and activity for this course</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Hours Watched', value: '28h 45m', icon: '⏱️', color: 'text-[#0B1F4D]' },
                { label: 'Lessons Done', value: `${course.completedLessons}/${course.totalLessons}`, icon: '✅', color: 'text-emerald-600' },
                { label: 'Quiz Avg', value: '83%', icon: '✏️', color: 'text-amber-600' },
                { label: 'Current Streak', value: '18 Days', icon: '🔥', color: 'text-rose-600' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1.5">{s.icon}</div>
                  <div className={`font-black text-lg ${s.color}`}>{s.value}</div>
                  <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Weekly activity chart (bars) */}
            <div>
              <div className="flex items-end justify-between gap-1.5 h-20">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden flex items-end" style={{ height: '60px' }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-1000 delay-100"
                        style={{
                          height: `${weeklyData[i]}%`,
                          background: i === 4 ? '#C89B3C' : i === 5 || i === 6 ? '#e2e8f0' : '#0B1F4D',
                          opacity: i === 5 || i === 6 ? 0.4 : 1
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">{day}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-[9px] font-medium mt-2 text-center">Weekly session attendance rate (%)</p>
            </div>
          </div>

          {/* ── RECOMMENDED ──────────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-[#030919] to-[#0B1F4D] rounded-3xl p-5 sm:p-6 border border-accent/15 shadow-xl space-y-4">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-white font-black text-base uppercase tracking-wide">Recommended For You</h3>
              <p className="text-slate-400 text-xs font-light mt-0.5">Courses, cases, and resources matched to your learning path</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            </div>
          </div>

        </div>

        {/* RIGHT: Curriculum Playlist Sidebar */}
        <div className={`${curriculumOpen ? 'xl:w-80 xl:shrink-0' : 'w-full'} relative`}>
          {/* Toggle */}
          <button
            onClick={() => setCurriculumOpen(o => !o)}
            className="hidden xl:flex absolute -left-3 top-4 z-20 h-7 w-7 rounded-full bg-accent border border-accent/30 text-[#050E24] items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${curriculumOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {curriculumOpen && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm xl:sticky xl:top-4">
              <div className="bg-gradient-to-r from-[#030919] to-[#0B1F4D] px-5 py-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-widest">Course Content</h4>
                  <p className="text-slate-400 text-[9px] font-medium mt-0.5">{course.completedLessons}/{course.totalLessons} completed</p>
                </div>
                <div className="relative">
                  <ProgressRing percent={course.progress} size={44} stroke={4} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-[9px]">{course.progress}%</span>
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none">
                {courseData && courseData.modules && courseData.modules.map(mod => (
                  <div key={mod._id}>
                    <button
                      onClick={() => toggleModule(mod._id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100 hover:bg-slate-100/60 focus:outline-none cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-base shrink-0">📦</span>
                        <span className="text-[#0B1F4D] font-black text-[10px] uppercase tracking-wide leading-tight text-left truncate">{mod.title}</span>
                      </div>
                      <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${expandedModules[mod._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedModules[mod._id] && mod.lessons && mod.lessons.map(les => {
                      const { isExpired, timerText } = calculateAccess(les);
                      const isCompleted = localProfile?.completedLessons?.includes(les._id);
                      return (
                      <button
                        key={les._id}
                        onClick={() => !isExpired && setActiveLesson(les)}
                        className={`w-full flex items-center space-x-2.5 px-4 py-3 text-left border-b border-slate-100 transition-colors focus:outline-none ${
                          activeLesson && les._id === activeLesson._id ? 'bg-accent/5 border-l-[3px] border-l-accent' :
                          isExpired ? 'opacity-45 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                          isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          activeLesson && les._id === activeLesson._id ? 'bg-accent text-[#050E24]' :
                          'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {isCompleted ? '✓' : activeLesson && les._id === activeLesson._id ? '▶' : '○'}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className={`text-[10px] font-bold truncate leading-snug ${activeLesson && les._id === activeLesson._id ? 'text-accent' : isExpired ? 'text-slate-400' : 'text-slate-700'}`}>{les.title}</div>
                          <div className="text-slate-400 text-[9px] font-mono mt-0.5">{les.duration}</div>
                        </div>
                      </button>
                    )})}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CourseLearningTab;
