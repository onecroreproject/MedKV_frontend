import React, { useRef, useState, useEffect } from 'react';
import ParticipantVideo from './ParticipantVideo';
import { Track } from 'livekit-client';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';

const ParticipantGrid = React.memo(({ isTeacher, tracks, localParticipant }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const cameraTracks = tracks.filter(t => t.source === Track.Source.Camera);
  const otherTracks = cameraTracks.filter(t => !t.participant.isLocal);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [otherTracks.length]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  // ── Student: self-view PIP ──────────────────────────────────────────
  if (!isTeacher) {
    return (
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-24 md:w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl z-20 group">
        {localParticipant && (
          <ParticipantVideo
            participant={localParticipant}
            isLocal={true}
            trackRef={cameraTracks.find(t => t.participant.isLocal)}
          />
        )}
      </div>
    );
  }

  // ── Teacher: scrollable participant strip ───────────────────────────
  return (
    <div className="relative mt-3 select-none">

      {/* Header row: label + count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Users size={13} />
          Participants
        </span>
        <span className="bg-slate-700/70 text-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-600">
          {otherTracks.length} joined
        </span>
      </div>

      {/* Left scroll arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-full p-1.5 shadow-xl transition-all duration-200 hover:scale-110 mt-4"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
      )}

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
      >
        {otherTracks.length === 0 ? (
          <div className="flex items-center justify-center w-full h-28 text-slate-500 text-sm italic">
            No participants have joined yet...
          </div>
        ) : (
          otherTracks.map(track => (
            <div
              key={track.participant.identity}
              className="shrink-0 w-44 h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-lg hover:border-blue-500/60 hover:shadow-blue-500/10 hover:shadow-lg transition-all duration-200"
            >
              <ParticipantVideo
                participant={track.participant}
                isLocal={false}
                trackRef={track}
              />
            </div>
          ))
        )}
      </div>

      {/* Right scroll arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-full p-1.5 shadow-xl transition-all duration-200 hover:scale-110 mt-4"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      )}
    </div>
  );
});

export default ParticipantGrid;

