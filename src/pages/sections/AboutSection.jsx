import React, { useEffect, useRef } from 'react';
import { WHY_CHOOSE_US, ABOUT_US_CONTENT } from '../../config/constants';

const ICONS = {
  faculty: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  exam: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  cases: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  flexible: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clinical: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  global: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
};

function LandscapeCard({ item }) {
  return (
    <div className="flex items-center gap-5 bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-accent/40 group transition-all duration-300">
      <div className="flex-shrink-0 p-3 bg-soft-gray rounded-xl border border-slate-200 text-accent group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {ICONS[item.icon]}
      </div>
      <div className="space-y-1">
        <h4 className="text-primary font-bold text-sm leading-tight group-hover:text-accent transition-colors">
          {item.title}
        </h4>
        <p className="text-blue-gray text-xs leading-relaxed font-normal">
          {item.description}
        </p>
      </div>
    </div>
  );
}

function AnimatedColumn({ items, direction }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove('opacity-0', direction === 'left' ? '-translate-x-16' : 'translate-x-16');
          el.classList.add('opacity-100', 'translate-x-0');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [direction]);

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-5 transition-all duration-700 ease-out opacity-0 ${
        direction === 'left' ? '-translate-x-16' : 'translate-x-16'
      }`}
    >
      {items.map((item, idx) => (
        <LandscapeCard key={idx} item={item} />
      ))}
    </div>
  );
}

export default function AboutSection() {
  const leftItems = WHY_CHOOSE_US.slice(0, 4);
  const rightItems = WHY_CHOOSE_US.slice(4, 8);

  return (
    <section id="about" className="bg-soft-gray border-y border-slate-200/80 py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-14">

        {/* About Academy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 sm:mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
              ABOUT <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">US</span>
            </h2>
            <div className="h-[2px] w-20 bg-gradient-to-r from-accent to-transparent" />
            <p className="text-blue-gray text-sm md:text-base leading-relaxed">
              {ABOUT_US_CONTENT.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all">
                <h4 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  Our Mission
                </h4>
                <p className="text-blue-gray text-sm leading-relaxed">{ABOUT_US_CONTENT.mission}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all">
                <h4 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                  Our Vision
                </h4>
                <p className="text-blue-gray text-sm leading-relaxed">{ABOUT_US_CONTENT.vision}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:pl-8">
            <h3 className="text-2xl font-bold text-primary">Services <span className="text-accent">Planned</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ABOUT_US_CONTENT.services.map((service, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200/50 hover:border-accent/30 hover:shadow-md transition-all">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm font-medium text-blue-gray leading-snug">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200/80 mb-16 sm:mb-24" />

        {/* Header */}
        <div className="text-center space-y-3">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
            WHY CHOOSE THE <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">ACADEMY?</span>
          </h3>
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
          <p className="text-blue-gray text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
            Bridging the critical gap between academic theory, intensive medical examinations, and confident daily clinical reporting.
          </p>
        </div>

        {/* Two-column landscape card grid with scroll animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedColumn items={leftItems} direction="left" />
          <AnimatedColumn items={rightItems} direction="right" />
        </div>

      </div>
    </section>
  );
}
