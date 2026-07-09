import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiveClasses } from '../../services/liveClassService';
import { getRecordings } from '../../services/recordingService';

// ─── Full Dataset ─────────────────────────────────────────────────────────────
const ALL_SESSIONS = [
  {
    id: 'live-1',
    title: 'Brain MRI Interpretation – Live Case Discussion',
    mentor: 'Dr. Sam Reefath',
    specialization: 'Neuroradiology Consultant',
    course: 'FRCR Part 2A Advanced',
    date: 'Jun 2, 2026',
    time: '18:00 – 21:00 GMT',
    duration: '3h 00m',
    countdown: '6 days',
    daysLeft: 6,
    zoomLink: 'https://zoom.us/mock/j/111111111',
    status: 'upcoming',
    participants: 142,
    category: 'neuro',
    emoji: '🧠',
  },
  {
    id: 'live-2',
    title: 'FRCR Part 2A Mock Session – Systemic Diagnostics',
    mentor: 'Dr. Sam Reefath',
    specialization: 'Neuroradiology Consultant',
    course: 'FRCR Part 2A Advanced',
    date: 'Jun 5, 2026',
    time: '14:00 – 17:00 GMT',
    duration: '3h 00m',
    countdown: '9 days',
    daysLeft: 9,
    zoomLink: 'https://zoom.us/mock/j/222222222',
    status: 'upcoming',
    participants: 98,
    category: 'frcr',
    emoji: '📋',
  },
  {
    id: 'live-3',
    title: 'Chest CT Diagnostic Workshop – Trauma Protocols',
    mentor: 'Dr. Sarah Jenkins',
    specialization: 'Thoracic Radiology Specialist',
    course: 'CT Scan Masterclass',
    date: 'Jun 8, 2026',
    time: '19:00 – 21:30 GMT',
    duration: '2h 30m',
    countdown: '12 days',
    daysLeft: 12,
    zoomLink: 'https://zoom.us/mock/j/333333333',
    status: 'upcoming',
    participants: 76,
    category: 'ct',
    emoji: '🩻',
  },
  {
    id: 'live-4',
    title: 'Anatomy Rapid Revision – Cross-Sectional MRI',
    mentor: 'Prof. Marcus Vance',
    specialization: 'Clinical Anatomy Advisor',
    course: 'Anatomy Specialty Module',
    date: 'Jun 10, 2026',
    time: '16:00 – 18:00 GMT',
    duration: '2h 00m',
    countdown: '14 days',
    daysLeft: 14,
    zoomLink: 'https://zoom.us/mock/j/444444444',
    status: 'upcoming',
    participants: 54,
    category: 'anatomy',
    emoji: '💀',
  },
  {
    id: 'live-now-1',
    title: 'FRCR Part 2B Rapid Reporting – Live Hot Seat Viva',
    mentor: 'Dr. Sam Reefath',
    specialization: 'Neuroradiology Consultant',
    course: 'FRCR Part 2B Masterclass',
    date: 'May 26, 2026',
    time: '17:30 – 20:30 GMT',
    duration: '3h 00m',
    countdown: 'LIVE',
    daysLeft: 0,
    zoomLink: 'https://zoom.us/mock/j/999999999',
    status: 'live',
    participants: 214,
    category: 'frcr',
    emoji: '📡',
    elapsedMin: 47,
    totalMin: 180,
  },
  {
    id: 'live-5',
    title: 'Pathology Imaging Session – ACR Differentials',
    mentor: 'Prof. Marcus Vance',
    specialization: 'Clinical Anatomy Advisor',
    course: 'Pathology Essentials',
    date: 'May 24, 2026',
    time: '14:00 – 17:00 GMT',
    duration: '3h 00m',
    countdown: null,
    daysLeft: null,
    zoomLink: 'https://zoom.us/mock/j/555555555',
    status: 'completed',
    participants: 167,
    category: 'pathology',
    emoji: '🔬',
    recordingMins: 178,
  },
  {
    id: 'live-6',
    title: 'Brain MRI Differentials Staging & Board Vivas',
    mentor: 'Dr. Sam Reefath',
    specialization: 'Neuroradiology Consultant',
    course: 'FRCR Part 2A Advanced',
    date: 'May 20, 2026',
    time: '14:00 – 17:00 GMT',
    duration: '3h 00m',
    countdown: null,
    daysLeft: null,
    zoomLink: null,
    status: 'missed',
    participants: 189,
    category: 'neuro',
    emoji: '🧠',
    recordingAvailable: true,
    accessExpiresInDays: 4,
  },
  {
    id: 'live-7',
    title: 'Emergency CT Chest Angiographies',
    mentor: 'Dr. Sarah Jenkins',
    specialization: 'Thoracic Radiology Specialist',
    course: 'CT Scan Masterclass',
    date: 'May 15, 2026',
    time: '19:00 – 21:00 GMT',
    duration: '2h 00m',
    countdown: null,
    daysLeft: null,
    zoomLink: null,
    status: 'missed',
    participants: 103,
    category: 'ct',
    emoji: '🩻',
    recordingAvailable: false,
    accessExpiresInDays: 0,
  },
];


const FACULTY = [
  { name: 'Dr. Sam Reefath', specialization: 'Neuroradiology Consultant & Founder', upcomingSessions: 4, avatar: '🧑‍⚕️', tag: 'Chief Advisor' },
  { name: 'Dr. Sarah Jenkins', specialization: 'Thoracic Radiology Specialist', upcomingSessions: 2, avatar: '👩‍⚕️', tag: 'Senior Faculty' },
  { name: 'Prof. Marcus Vance', specialization: 'Clinical Anatomy & Pathology', upcomingSessions: 3, avatar: '👨‍🏫', tag: 'Anatomy Lead' },
];

const RESOURCES = [
  { title: 'Session Notes PDF', desc: 'FRCR 2B Hot Seat Viva – May 26', icon: '📄', action: 'Download' },
  { title: 'Presentation Slides', desc: 'Brain MRI Differentials Deck', icon: '📊', action: 'View' },
  { title: 'Practice MCQs', desc: '40 Board-Calibrated Questions', icon: '✏️', action: 'Attempt' },
  { title: 'Related Cases', desc: '12 Neuro DICOM Case Spotters', icon: '🩻', action: 'View' },
  { title: 'Anatomy References', desc: 'MRI Slice Cross-Section Atlas', icon: '💀', action: 'Download' },
  { title: 'Reporting Templates', desc: 'ACR Structured Report Formats', icon: '📋', action: 'Download' },
];

const FAQS = [
  { q: 'How do I join a live class?', a: 'Click the "Join Session" button on your upcoming session card. This redirects you to the secure Zoom learning portal automatically authenticated with your student credentials.' },
  { q: 'Will recordings be available after the session?', a: 'Yes. All live sessions are recorded in HD and published to your "Recorded Sessions" library within 2 hours of the session ending.' },
  { q: 'How long can I access missed session recordings?', a: 'Missed class recordings remain accessible for the duration of your course validity.' },
  { q: 'Can I join from a mobile device?', a: 'Absolutely. Our platform and Zoom integration are fully optimised for mobile. Install the Zoom app on iOS or Android and tap "Join Session" to attend.' },
  { q: 'Is Zoom required to join?', a: 'Yes, a valid Zoom account (free or paid) is required. We recommend installing the desktop client for the best interactive experience during viva sessions.' },
  { q: 'What if I miss a session entirely?', a: 'You can access the full HD recording under "Missed Sessions" or "Recordings Available" within 24 hours. The recording will include all case discussions and faculty Q&A.' },
];

const NOTIFICATIONS = [
  { icon: '📡', text: 'Live class starts in 15 minutes – FRCR 2B Hot Seat', time: '15 mins', type: 'urgent' },
  { icon: '📅', text: 'New session scheduled: Brain MRI – Jun 2, 18:00 GMT', time: '2h ago', type: 'new' },
  { icon: '🎥', text: 'Recording uploaded: Pathology Imaging Session', time: '4h ago', type: 'upload' },
  { icon: '🧑‍⚕️', text: 'Dr. Sam Reefath updated session notes for FRCR 2A', time: 'Yesterday', type: 'update' },
];

// ─── Helper Components ────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'live') return (
    <span className="flex items-center space-x-1.5 bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-rose-500/30 animate-pulse">
      <span className="h-1.5 w-1.5 bg-white rounded-full" />
      <span>Live Now</span>
    </span>
  );
  if (status === 'upcoming') return (
    <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Upcoming</span>
  );
  if (status === 'completed') return (
    <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Completed</span>
  );
  return (
    <span className="bg-rose-50 border border-rose-200 text-rose-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Missed</span>
  );
}

function CategoryIcon({ emoji }) {
  return (
    <div className="h-12 w-12 rounded-2xl bg-[#0B1F4D] border border-accent/20 flex items-center justify-center text-xl shadow-md shrink-0">
      {emoji}
    </div>
  );
}

function ProgressBar({ value, className = '' }) {
  return (
    <div className={`h-1.5 bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LiveClassesTab({ setActiveTab, onEnterCourse, ENROLLED_COURSES = [], userProfile, liveClassUpdateTrigger, analytics }) {
  const extractUrl = (text) => {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches[0] : text;
  };
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [recordingFilter, setRecordingFilter] = useState('recent');
  const [openFaq, setOpenFaq] = useState(null);
  const [calendarView, setCalendarView] = useState('week');
  const [liveTimer, setLiveTimer] = useState({ h: 0, m: 47, s: 12 });

  const [sessions, setSessions] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecordings, setLoadingRecordings] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [joinMessage, setJoinMessage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [learningAlerts, setLearningAlerts] = useState([]);

  useEffect(() => {
    const fetchSessionsAndRecordings = async () => {
      try {
        const [liveRes, recRes] = await Promise.all([getLiveClasses(), getRecordings()]);
        
        let filteredLive = [];
        if (liveRes.success) {
          filteredLive = liveRes.data.filter(s => {
             // 1. Is it available to all?
             if (s.accessControl === 'all') return true;
             // 2. Is course free?
             if (s.course && s.course.price === 0) return true;
             // 3. Enrolled?
             if (s.course && ENROLLED_COURSES.some(c => String(c.id) === String(s.course._id || s.course))) return true;
             // Default false
             return false;
          });

          const mapped = filteredLive.map(s => {
            let fullStartDateTime = null;
            if (s.date && s.time) {
              const d = new Date(s.date);
              const [h, m] = s.time.split(':');
              if (h && m) {
                d.setHours(parseInt(h), parseInt(m), 0, 0);
                fullStartDateTime = d;
              }
            }
            return {
              id: s._id,
              title: s.title,
              mentor: s.faculty?.name || 'Dr. Sam Reefath',
              specialization: 'Neuroradiology Consultant',
              course: s.course?.title || 'General',
              courseId: s.course?._id || s.course,
              date: new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              time: s.time,
              duration: s.duration + 'm',
              status: s.status === 'Scheduled' ? 'upcoming' : (s.status === 'Live Now' ? 'live' : 'completed'),
              zoomLink: s.zoomLink,
              meetingProvider: s.meetingProvider,
              participants: Math.floor(Math.random() * 50) + 10,
              emoji: '📡',
              totalMin: s.duration,
              fullStartDateTime,
              notes: s.notes
            };
          });
          setSessions(mapped);
        }
        
        if (recRes.success) {
          // Filter out drafts, only show published recordings to students
          const published = recRes.data.filter(r => {
             if (r.isPublished === false) return false;
             // Is lesson free?
             if (r.lesson && r.lesson.isFreePreview) return true;
             // Is course free?
             if (r.course && r.course.price === 0) return true;
             if (r.liveClass && r.liveClass.course && r.liveClass.course.price === 0) return true;
             // Is enrolled?
             const cId = r.course?._id || r.course || r.liveClass?.course?._id || r.liveClass?.course;
             if (cId && ENROLLED_COURSES.some(c => String(c.id) === String(cId))) return true;
             // Default false
             return false;
          });
          setRecordings(published);
        }

        // Generating Dynamic Alerts
        const generatedAlerts = [];
        const now = new Date();
        
        if (liveRes.success) {
          filteredLive.forEach(s => {
            let fullStartDateTime = null;
            if (s.date && s.time) {
              const d = new Date(s.date);
              const [h, m] = s.time.split(':');
              if (h && m) {
                d.setHours(parseInt(h), parseInt(m), 0, 0);
                fullStartDateTime = d;
              }
            }
            if (fullStartDateTime) {
              const diffMs = fullStartDateTime - now;
              const diffMins = Math.floor(diffMs / 60000);
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              
              if (s.status === 'Live Now' || (diffMins >= 0 && diffMins <= 60)) {
                generatedAlerts.push({
                  icon: '📡',
                  text: `Live class starts in ${diffMins > 0 ? diffMins : 0} minutes – ${s.title}`,
                  time: `${diffMins > 0 ? diffMins : 0} mins`,
                  type: 'urgent',
                  timestamp: fullStartDateTime
                });
              } else if (diffMins > 60 && diffMins < 24 * 60 * 7) { // within 7 days
                generatedAlerts.push({
                  icon: '📅',
                  text: `New session scheduled: ${s.title} – ${new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${s.time}`,
                  time: diffDays === 0 ? 'Today' : (diffDays === 1 ? 'Tomorrow' : `${diffDays} days`),
                  type: 'new',
                  timestamp: fullStartDateTime
                });
              }
            }
          });
        }

        if (recRes.success) {
          published.forEach(r => {
            if (r.createdAt) {
              const recDate = new Date(r.createdAt);
              const diffDays = Math.floor((now - recDate) / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor((now - recDate) / (1000 * 60 * 60));
              
              if (diffDays <= 30) {
                let timeStr = diffHours < 24 ? `${diffHours}h ago` : (diffDays === 1 ? 'Yesterday' : `${diffDays}d ago`);
                if (diffHours === 0) timeStr = 'Just now';
                
                generatedAlerts.push({
                  icon: '🎥',
                  text: `Recording uploaded: ${r.title}`,
                  time: timeStr,
                  type: 'upload',
                  timestamp: recDate
                });
              }
            }
          });
        }

        // Sort by timestamp proximity to now
        generatedAlerts.sort((a, b) => {
          if (a.type === 'urgent') return -1;
          if (b.type === 'urgent') return 1;
          return Math.abs(a.timestamp - now) - Math.abs(b.timestamp - now);
        });

        // Add a fallback if empty
        if (generatedAlerts.length === 0) {
          generatedAlerts.push({ icon: '🎓', text: 'No recent learning alerts.', time: 'Now', type: 'info', timestamp: now });
        }

        setLearningAlerts(generatedAlerts.slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setLoadingRecordings(false);
      }
    };

    fetchSessionsAndRecordings();
  }, []);

  // Tick the live session timer
  useEffect(() => {
    const id = setInterval(() => {
      setLiveTimer(prev => {
        let { h, m, s } = prev;
        s++;
        if (s === 60) { s = 0; m++; }
        if (m === 60) { m = 0; h++; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const liveSession = sessions.find(s => s.status === 'live');
  const filteredSessions = sessions.filter(s => {
    if (activeFilter === 'upcoming') return s.status === 'upcoming';
    if (activeFilter === 'live') return s.status === 'live';
    if (activeFilter === 'completed') return s.status === 'completed';
    if (activeFilter === 'missed') return s.status === 'missed';
    if (activeFilter === 'recordings') return s.status === 'completed' || (s.status === 'missed' && s.recordingAvailable);
    return true;
  });

  const fmt = (n) => String(n).padStart(2, '0');

  const sessionCounts = {
    upcoming: sessions.filter(s => s.status === 'upcoming').length,
    live: sessions.filter(s => s.status === 'live').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    missed: sessions.filter(s => s.status === 'missed').length,
  };

  // Color map for week schedule
  const calColors = { accent: 'bg-accent/15 border-accent/30 text-accent', blue: 'bg-blue-500/10 border-blue-500/20 text-blue-600', emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600', violet: 'bg-violet-500/10 border-violet-500/20 text-violet-600' };
  
  const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = daysArr[new Date().getDay()];

  const dynamicWeekSchedule = useMemo(() => {
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); 
    const startOfWeek = new Date(todayDate);
    const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const schedule = [];
    const colors = ['accent', 'blue', 'emerald', 'violet'];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      const dayStr = daysArr[currentDay.getDay()];
      const dateStr = currentDay.getDate() + ' ' + currentDay.toLocaleString('default', { month: 'short' });
      
      const daySessions = sessions.filter(s => {
        if (!s.fullStartDateTime) return false;
        return s.fullStartDateTime.toDateString() === currentDay.toDateString();
      }).map((s, idx) => ({
        time: s.time,
        title: s.title,
        faculty: s.mentor,
        color: colors[idx % colors.length]
      }));

      schedule.push({
        day: dayStr,
        date: dateStr,
        sessions: daySessions
      });
    }
    return schedule;
  }, [sessions]);

  const navigate = useNavigate(); // Need to import this at top

  const handleJoinSession = (cls) => {
    if (cls.meetingProvider === 'webrtc') {
      navigate(`/webrtc/${cls.id || cls.roomId}`);
      return;
    }

    if (!cls.zoomLink) {
      setJoinMessage({ type: 'error', text: 'Zoom link has not been provided yet.' });
      return;
    }

    if (cls.fullStartDateTime) {
      const now = new Date();
      if (now < cls.fullStartDateTime) {
        const diffMs = cls.fullStartDateTime - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setJoinMessage({ type: 'wait', title: 'Class Not Started', text: `Session starts in ${diffHrs} hrs ${diffMins} mins ${diffSecs} secs.` });
        return;
      }
    }

    // Fallback if time has passed or no fullStartDateTime
    window.open(extractUrl(cls.zoomLink), '_blank');
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-10">

      {/* ── 1. HERO SECTION ───────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#030919] via-[#0B1F4D] to-[#0A1733] rounded-3xl p-4 sm:p-8 lg:p-10 overflow-hidden border border-accent/15 shadow-2xl">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 left-0 w-[300px] h-[300px] bg-blue-800/10 rounded-full blur-[80px] pointer-events-none" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div className="space-y-5 text-left">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-rose-500 rounded-full animate-ping" />
              <span className="text-[10px] text-rose-400 font-black uppercase tracking-[0.25em]">Live Sessions Active</span>
            </div>
            <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
              Live Radiology<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#D4AF37]">Learning Sessions</span>
            </h1>
            <p className="text-slate-400 text-sm font-light leading-relaxed max-w-lg">
              Attend expert-led radiology classes, interactive case discussions, FRCR mock vivas, and board preparation sessions with live faculty Q&A.
            </p>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { label: 'Upcoming', value: sessionCounts.upcoming, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Completed', value: sessionCounts.completed, color: 'text-slate-300', bg: 'bg-white/5 border-white/10' },
                { label: 'Missed', value: sessionCounts.missed, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                { label: 'Recordings', value: recordings.length, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} border rounded-2xl p-3 text-center`}>
                  <div className={`${stat.color} font-black text-2xl leading-none`}>{stat.value}</div>
                  <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – radiology visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-full h-full rounded-full border-4 border-dashed border-accent/20 flex items-center justify-center animate-[spin_60s_linear_infinite]">
                <div className="w-48 h-48 rounded-full border border-accent/40 flex items-center justify-center p-4">
                  <svg className="w-20 h-20 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
                  </svg>
                </div>
              </div>
              {/* Scanning line */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent to-transparent animate-bounce pointer-events-none" />
              {/* Live badge */}
              <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-lg shadow-rose-500/30 animate-pulse">
                <span className="h-1.5 w-1.5 bg-white rounded-full" />
                <span>Live</span>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0B1F4D] border border-accent/20 rounded-xl px-3 py-1.5 text-center whitespace-nowrap">
                <div className="text-accent text-[9px] font-black uppercase tracking-widest">Active PACS Simulator</div>
                <div className="text-white text-[11px] font-bold">{sessionCounts.live} Session Live</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1.5 MY LIVE CLASSES STATS ────────────────────────────────────────────── */}
      {analytics && (
        <section className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl shadow-inner shadow-accent/5">
              📊
            </div>
            <div>
              <h2 className="text-[#0B1F4D] font-black text-xl">My Live Class Performance</h2>
              <p className="text-slate-500 text-xs font-medium">Your interactive metrics across all attended live sessions</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">Classes Attended</p>
               <p className="text-3xl font-black text-[#0B1F4D]">{analytics.stats?.totalClasses || 0}</p>
             </div>
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">Watch Time</p>
               <p className="text-3xl font-black text-emerald-600">{analytics.stats?.totalDuration || 0}<span className="text-sm font-bold text-emerald-600/70 ml-1">min</span></p>
             </div>
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">Total Chats</p>
               <p className="text-3xl font-black text-blue-600">{analytics.stats?.totalChats || 0}</p>
             </div>
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">Hand Raises</p>
               <p className="text-3xl font-black text-accent">{analytics.stats?.totalHandRaises || 0}</p>
             </div>
          </div>
        </section>
      )}

      {/* ── 2. LIVE NOW BANNER ────────────────────────────────────────────── */}
      {liveSession && (
        <section className="relative bg-gradient-to-r from-rose-950/80 via-[#0B1F4D] to-[#030919] border border-rose-500/30 rounded-3xl p-4 sm:p-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/20">
                  📡
                </div>
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 rounded-full border-2 border-[#030919] animate-ping" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-rose-500/30 shadow-sm">
                    <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                    <span>Live Now</span>
                  </span>
                  <span className="text-slate-400 text-xs">{liveSession.participants} students attending</span>
                </div>
                <h3 className="text-white font-black text-lg sm:text-xl leading-tight">{liveSession.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs font-medium">
                  <span>{liveSession.mentor}</span>
                  <span>•</span>
                  <span>{liveSession.course}</span>
                  <span>•</span>
                  <span>{liveSession.time}</span>
                </div>
                {/* Live progress */}
                <div className="pt-1 max-w-xs">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>Session Progress</span>
                    <span className="text-rose-400 font-black tabular-nums">
                      {fmt(liveTimer.h)}:{fmt(liveTimer.m)}:{fmt(liveTimer.s)} elapsed
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(((liveTimer.m + liveTimer.h * 60) / liveSession.totalMin) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0">
                <button 
                  onClick={() => handleJoinSession(liveSession)}
                  className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2">
                  <span className="h-2 w-2 bg-white rounded-full animate-ping" />
                  <span>Join Live Now</span>
                </button>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. FILTER TABS ────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'upcoming', label: 'Upcoming Classes', count: sessionCounts.upcoming },
          { id: 'live', label: 'Live Now', count: sessionCounts.live, urgent: true },
          { id: 'completed', label: 'Completed', count: sessionCounts.completed },
          { id: 'missed', label: 'Missed', count: sessionCounts.missed },
          { id: 'recordings', label: 'Recordings Available', count: recordings.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer focus:outline-none transition-all duration-300 flex items-center space-x-1.5 ${activeFilter === tab.id
                ? tab.urgent ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-[#0B1F4D] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            <span>{tab.label}</span>
            <span className={`h-4 w-4 rounded-full text-[9px] font-black flex items-center justify-center ${activeFilter === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
              }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── 4. SESSION CARDS GRID ─────────────────────────────────────────── */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📭</div>
          <h4 className="text-slate-800 font-black text-lg">No sessions found</h4>
          <p className="text-slate-500 text-xs mt-1">Check another filter or come back later for new sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSessions.map(cls => (
            <div
              key={cls.id}
              className={`bg-white border rounded-3xl overflow-hidden flex flex-col shadow-sm hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group ${cls.status === 'live'
                  ? 'border-rose-300 shadow-rose-100'
                  : cls.status === 'missed'
                    ? 'border-rose-100'
                    : 'border-slate-200 hover:border-accent/30'
                }`}
            >
              {/* Card Header Banner */}
              <div className={`h-28 relative flex items-end p-4 overflow-hidden ${cls.status === 'live' ? 'bg-gradient-to-br from-rose-900 to-[#0B1F4D]' : 'bg-gradient-to-br from-[#050C1F] to-[#0B1F4D]'
                }`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,155,60,0.12)_0%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.04)_1px,transparent_1px)] bg-[size:15px_15px]" />
                <div className="relative z-10 flex items-end justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <CategoryIcon emoji={cls.emoji} />
                    <div>
                      <div className="text-accent text-[9px] font-black uppercase tracking-widest">{cls.course}</div>
                      <div className="text-white/60 text-[10px] font-medium mt-0.5">{cls.duration}</div>
                    </div>
                  </div>
                  <StatusBadge status={cls.status} />
                </div>
                {cls.status === 'live' && (
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="h-2 w-2 bg-rose-400 rounded-full animate-ping" />
                    <span className="text-rose-300 text-[9px] font-black uppercase tracking-widest">Broadcasting</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-grow space-y-3">
                <h4 className="text-slate-800 font-black text-sm leading-snug group-hover:text-[#0B1F4D] transition-colors line-clamp-2">{cls.title}</h4>

                <div className="flex items-center space-x-2">
                  <span className="h-7 w-7 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shrink-0">
                    {FACULTY.find(f => f.name === cls.mentor)?.avatar || '🧑‍⚕️'}
                  </span>
                  <div>
                    <div className="text-[#0B1F4D] font-bold text-[11px]">{cls.mentor}</div>
                    <div className="text-slate-400 text-[9.5px] font-medium">{cls.specialization}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium mt-4">
                  <div className="flex items-center space-x-1.5"><span>📅</span><span>{cls.date}</span></div>
                  <div className="flex items-center space-x-1.5"><span>⏱️</span><span>{cls.time}</span></div>
                  <div className="flex items-center space-x-1.5"><span>👥</span><span>{cls.participants} students</span></div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${cls.meetingProvider === 'webrtc' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {cls.meetingProvider === 'webrtc' ? 'WebRTC' : 'Zoom'}
                    </span>
                  </div>
                </div>

                {/* Countdown for upcoming */}
                {cls.status === 'upcoming' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center space-x-2">
                    <span className="text-emerald-500 text-sm">⏳</span>
                    <div>
                      <div className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">Starts in {cls.countdown}</div>
                      <div className="text-emerald-600 text-[9px] font-medium">Add to calendar</div>
                    </div>
                  </div>
                )}

                {/* Missed session recording notice */}
                {cls.status === 'missed' && (
                  <div className={`rounded-xl px-3 py-2 ${cls.recordingAvailable ? 'bg-accent/5 border border-accent/20' : 'bg-rose-50 border border-rose-200'}`}>
                    {cls.recordingAvailable ? (
                      <>
                        <div className="text-accent text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                          <span>🎥</span><span>Recording Available</span>
                        </div>
                        <div className="text-slate-500 text-[9px] font-medium mt-0.5">
                          Available until your course access expires
                        </div>
                      </>
                    ) : (
                      <div className="text-rose-500 text-[10px] font-black uppercase tracking-wider">Recording Expired</div>
                    )}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="pt-2 mt-auto flex flex-col gap-2">
                  {cls.status === 'upcoming' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinSession(cls)}
                        className="flex-1 bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-accent/20 active:scale-95 cursor-pointer"
                      >
                        Join Session
                      </button>
                      <button
                        onClick={() => setSelectedClass(cls)}
                        className="flex-1 border-2 border-[#0B1F4D] text-[#0B1F4D] hover:bg-[#0B1F4D] hover:text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                  {cls.status === 'live' && (
                    <button
                      onClick={() => handleJoinSession(cls)}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl shadow-md shadow-rose-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                      <span>Join Live Now</span>
                    </button>
                  )}
                  {cls.status === 'missed' && cls.recordingAvailable && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('recorded')}
                        className="flex-1 bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                      >
                        Watch Recording
                      </button>
                      <button className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer">
                        Session Notes
                      </button>
                    </div>
                  )}
                  {cls.status === 'completed' && (
                    <button 
                      onClick={() => setActiveTab('recorded')}
                      className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Watch Archived Recording
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 9. NOTIFICATIONS ──────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-[#0B1F4D] font-black text-xl tracking-tight uppercase">Live Learning Alerts</h2>
        </div>
        <div className="space-y-3">
          {learningAlerts.map((n, i) => (
            <div key={i} className={`flex items-start space-x-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${n.type === 'urgent' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${n.type === 'urgent' ? 'bg-rose-100' : 'bg-white border border-slate-200'
                }`}>
                {n.icon}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-slate-800 text-xs font-semibold leading-relaxed">{n.text}</p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider shrink-0 ${n.type === 'urgent' ? 'text-rose-500' : 'text-slate-400'
                }`}>{n.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. RECORDINGS SECTION ─────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-[#0B1F4D] font-black text-xl tracking-tight uppercase">Recorded Sessions</h2>
            <p className="text-slate-500 text-xs mt-0.5 font-light">Continue watching or revisit previous sessions</p>
          </div>
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex space-x-1 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none w-full sm:w-auto">
            {[['recent', 'Recently Added'], ['watching', 'Continue Watching'], ['popular', 'Most Popular']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setRecordingFilter(id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer focus:outline-none transition-all duration-300 whitespace-nowrap shrink-0 ${recordingFilter === id ? 'bg-[#C89B3C] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {loadingRecordings ? (
            <div className="col-span-full py-10 text-center text-slate-500 font-medium">Loading recordings...</div>
          ) : recordings.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-500 font-medium">No recorded sessions available yet.</div>
          ) : recordings.map(rec => (
            <div key={rec._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-accent/30 transition-all duration-300 group flex flex-col">
              {/* Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-[#050C1F] to-[#0B1F4D] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.1)_0%,transparent_70%)]" />
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300 relative z-10">🎥</span>
                <div className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[9px] font-black px-2 py-0.5 rounded">
                  {rec.duration || 'N/A'}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h5 className="text-slate-800 font-black text-xs uppercase tracking-wide leading-snug group-hover:text-accent transition-colors line-clamp-2">{rec.title}</h5>
                <p className="text-slate-400 text-[10px] font-medium mt-1">{rec.faculty?.name || 'Unassigned'}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1">
                    <span>Progress</span><span>0%</span>
                  </div>
                  <ProgressBar value={0} />
                </div>
                <div className="text-slate-400 text-[9px] font-medium mt-2">Added {new Date(rec.createdAt).toLocaleDateString()}</div>
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => {
                      if (rec.course) {
                        onEnterCourse(rec.course._id || rec.course.id || rec.course);
                      } else {
                        alert('This recording is not associated with a specific course.');
                      }
                    }}
                    className="flex-1 bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[9.5px] uppercase tracking-widest py-2 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    Watch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. WEEKLY CALENDAR ────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-[#0B1F4D] font-black text-xl tracking-tight uppercase">Weekly Class Calendar</h2>
            <p className="text-slate-500 text-xs mt-0.5 font-light">This week's live session schedule</p>
          </div>
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex space-x-1 self-start sm:self-auto">
            {[['week', 'Week View'], ['agenda', 'Agenda']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setCalendarView(id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer focus:outline-none transition-all ${calendarView === id ? 'bg-[#C89B3C] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="grid grid-cols-7 gap-2 min-w-[500px]">
            {dynamicWeekSchedule.map((day) => (
              <div key={day.day} className={`rounded-2xl p-2 sm:p-3 transition-all ${day.day === today ? 'bg-[#0B1F4D] text-white' : 'bg-slate-50 border border-slate-100'
                }`}>
                <div className={`text-center mb-2 ${day.day === today ? '' : ''}`}>
                  <div className={`text-[9px] font-black uppercase tracking-wider ${day.day === today ? 'text-accent' : 'text-slate-400'}`}>{day.day}</div>
                  <div className={`font-black text-sm ${day.day === today ? 'text-white' : 'text-slate-700'}`}>{day.date.split(' ')[0]}</div>
                </div>
                <div className="space-y-1.5">
                  {day.sessions.length === 0 ? (
                    <div className={`h-1 w-3 rounded mx-auto ${day.day === today ? 'bg-white/20' : 'bg-slate-200'}`} />
                  ) : (
                    day.sessions.map((sess, i) => (
                      <div key={i} className={`rounded-lg p-1.5 border ${calColors[sess.color] || 'bg-accent/10 border-accent/20 text-accent'} text-left`}>
                        <div className="text-[8px] font-black uppercase">{sess.time}</div>
                        <div className="text-[8px] font-semibold leading-tight sm:block truncate text-ellipsis overflow-hidden">{sess.title}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FACULTY SESSIONS ───────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="pb-3 border-b border-slate-200">
          <h2 className="text-[#0B1F4D] font-black text-xl tracking-tight uppercase">Faculty Sessions</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-light">Your mentors and their upcoming session count</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FACULTY.map(f => (
            <div key={f.name} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-accent/30 transition-all duration-300 group">
              <div className="h-16 w-16 rounded-2xl bg-[#0B1F4D] border-2 border-accent/20 flex items-center justify-center text-3xl mb-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                {f.avatar}
              </div>
              <div className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">{f.tag}</div>
              <h4 className="text-[#0B1F4D] font-black text-sm uppercase tracking-wide">{f.name}</h4>
              <p className="text-slate-400 text-[10px] font-medium mt-0.5 leading-relaxed">{f.specialization}</p>
              <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full">
                {f.upcomingSessions} Upcoming Sessions
              </div>
              <button className="mt-3 w-full border-2 border-[#0B1F4D] text-[#0B1F4D] hover:bg-[#0B1F4D] hover:text-white font-black text-[10px] uppercase tracking-widest py-2 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer">
                View Schedule
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. LEARNING RESOURCES ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#030919] to-[#0B1F4D] rounded-3xl p-4 sm:p-8 border border-accent/15 shadow-xl space-y-5">
        <div className="pb-3 border-b border-white/10">
          <h2 className="text-white font-black text-xl tracking-tight uppercase">Learning Resources</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-light">Quick access to session materials and references</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCES.map((res, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-4 hover:bg-white/10 hover:border-accent/30 transition-all duration-300 group cursor-pointer">
              <div className="h-11 w-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                {res.icon}
              </div>
              <div className="flex-grow min-w-0">
                <h5 className="text-white font-black text-xs uppercase tracking-wide truncate">{res.title}</h5>
                <p className="text-slate-400 text-[10px] font-light mt-0.5 truncate">{res.desc}</p>
              </div>
              <button className="shrink-0 border border-accent/30 text-accent hover:bg-accent hover:text-[#050E24] font-black text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer">
                {res.action}
              </button>
            </div>
          ))}
        </div>
      </section>



      {/* ── 10. FAQ SECTION ───────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-[#0B1F4D] font-black text-xl tracking-tight uppercase">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-light">Everything you need to know about live sessions</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/70 hover:bg-slate-50 text-left focus:outline-none transition-colors cursor-pointer"
              >
                <span className="text-[#0B1F4D] font-black text-xs uppercase tracking-wide pr-4">{faq.q}</span>
                <svg className={`w-4 h-4 text-accent shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 py-4 bg-white border-t border-slate-100 text-slate-500 text-xs font-light leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. CLASS DETAILS MODAL ────────────────────────────────────────── */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedClass(null)}
              className="absolute top-4 right-4 h-8 w-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors z-10"
            >
              ✕
            </button>

            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="flex items-center space-x-3 mb-4">
                <CategoryIcon emoji={selectedClass.emoji || '📡'} />
                <div>
                  <div className="text-accent text-[10px] font-black uppercase tracking-widest">{selectedClass.course}</div>
                  <div className="text-slate-500 text-[11px] font-medium mt-0.5">{selectedClass.date} • {selectedClass.time}</div>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#0B1F4D] mb-4 leading-tight">{selectedClass.title}</h3>

              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-6">
                <span className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  {FACULTY.find(f => f.name === selectedClass.mentor)?.avatar || '🧑‍⚕️'}
                </span>
                <div>
                  <div className="text-[#0B1F4D] font-bold text-xs">{selectedClass.mentor}</div>
                  <div className="text-slate-400 text-[10px] font-medium">{selectedClass.specialization}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Session Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</div>
                      <div className="text-[#0B1F4D] font-semibold">{selectedClass.duration}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Participants</div>
                      <div className="text-[#0B1F4D] font-semibold">{selectedClass.participants} registered</div>
                    </div>
                  </div>
                </div>

                {selectedClass.notes && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Agenda & Notes</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                      {selectedClass.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 mt-auto">
              {selectedClass.status === 'upcoming' && (
                <button
                  onClick={() => {
                    onEnterCourse(selectedClass.courseId);
                  }}
                  className="w-full bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Join Session Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 11. JOIN MESSAGE MODAL ─────────────────────────────────────────── */}
      {joinMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 shadow-sm border border-slate-100 bg-slate-50">
              {joinMessage.type === 'wait' ? (
                <span className="text-3xl animate-bounce">⏳</span>
              ) : (
                <span className="text-3xl">⚠️</span>
              )}
            </div>
            <h3 className="text-xl font-black text-[#0B1F4D] mb-2 leading-tight">
              {joinMessage.title || 'Attention'}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              {joinMessage.text}
            </p>
            <button
              onClick={() => setJoinMessage(null)}
              className="w-full bg-[#0B1F4D] hover:bg-[#0B1F4D]/90 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}



    </div>
  );
}

export default LiveClassesTab;
