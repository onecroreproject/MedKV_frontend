import React, { useState, useEffect, useMemo } from 'react';

/**
 * ClassroomSecurityWatermark
 *
 * Implements dual-layer dynamic forensic watermarking for live classes:
 * 1. Primary Dynamic Floating Badge: Moves randomly across the video viewport every 10 seconds.
 *    Displays student name, email, mobile number, and real-time clock.
 * 2. Secondary Faint Forensic Grid: A subtle, full-screen diagonal repeating watermark
 *    ensuring that even if an attacker crops or zooms into any section, the student's identity is stamped.
 *
 * Designed specifically for high visibility on both dark backgrounds and pure white CT/X-ray slides
 * without obscuring medical text or anatomical details.
 */
export default function ClassroomSecurityWatermark({ user, isStudent = true }) {
  // Only render watermarks on student screens
  if (!isStudent || !user) return null;

  const [position, setPosition] = useState({ top: 25, left: 20 });
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());

  // Extract student details
  const studentName = user.name || 'Verified Student';
  const studentEmail = user.email || '';
  const studentMobile = user.phoneNumber || user.phone || user.mobileNumber || user.mobile || '';

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Move floating badge to random positions across the stage
  useEffect(() => {
    const moveWatermark = () => {
      // Keep within bounds: top between 10% and 75%, left between 8% and 65%
      const newTop = Math.floor(Math.random() * 65) + 10;
      const newLeft = Math.floor(Math.random() * 57) + 8;
      setPosition({ top: newTop, left: newLeft });
    };

    // Initial move after 2s, then interval every 10s
    const initialTimeout = setTimeout(moveWatermark, 2000);
    const interval = setInterval(moveWatermark, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Repeating text string for diagonal forensic background
  const gridLine = useMemo(() => {
    const base = [studentName, studentEmail, studentMobile].filter(Boolean).join(' • ');
    return `${base}    •    `.repeat(12);
  }, [studentName, studentEmail, studentMobile]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-25">
      {/* ── LAYER 1: Full-Screen Faint Forensic Diagonal Grid ── */}
      <div 
        className="absolute inset-0 opacity-[0.06] flex flex-col justify-around rotate-[-22deg] scale-150 pointer-events-none select-none overflow-hidden"
        style={{ userSelect: 'none' }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <div 
            key={i} 
            className="whitespace-nowrap font-mono text-[11px] sm:text-[13px] tracking-widest text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
          >
            {gridLine}
          </div>
        ))}
      </div>

      {/* ── LAYER 2: Dynamic Floating Primary Badge ── */}
      <div
        className="absolute z-30 transition-all duration-1000 ease-in-out pointer-events-none select-none"
        style={{
          top: `${position.top}%`,
          left: `${position.left}%`,
        }}
      >
        <div className="bg-black/35 backdrop-blur-[1px] px-3 py-1.5 rounded-lg border border-white/10 shadow-lg flex flex-col gap-0.5 text-slate-100 opacity-40">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,1)] drop-shadow-[0_0_1px_rgba(0,0,0,1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <span>{studentName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-[11px] font-mono text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] drop-shadow-[0_0_1px_rgba(0,0,0,1)]">
            {studentMobile && (
              <span className="font-semibold text-amber-200">
                📱 {studentMobile}
              </span>
            )}
            {studentEmail && (
              <span>{studentEmail}</span>
            )}
            <span className="text-slate-300 opacity-90">{currentTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
