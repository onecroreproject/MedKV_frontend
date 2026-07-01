import React from 'react';
import Button from '../../components/ui/Button';
import { LIVE_CLASSES_FEATURES } from '../../config/constants';

export default function LiveClassesSection() {
  return (
    <section id="live-classes" className="bg-soft-gray border-y border-slate-200/80 py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* Left Preview Columns */}
        <div className="lg:col-span-6 flex flex-col justify-stretch">
          <div className="relative w-full h-full min-h-[380px] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl bg-white group flex flex-col justify-between">
            <div className="absolute inset-0 bg-[#0B1F4D]/5 z-10 pointer-events-none" />
            
            {/* Zoom Interactive Overlay Graphic */}
            <div className="absolute top-4 left-4 z-20 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-lg">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>ZOOM LIVE WEBINAR</span>
            </div>

            {/* Simulated Live PACS Workstation / Screen Visual Overlay - grows to fill height */}
            <div className="w-full flex-grow flex flex-col justify-center items-center bg-[#050E24] text-center p-6 space-y-4">
              <svg className="w-20 h-20 text-accent/80 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
              </svg>
              <div className="space-y-1">
                <span className="text-white text-xs font-mono tracking-wider">ACTIVE REPORTING FEED</span>
                <p className="text-slate-300 text-[10px] max-w-xs leading-relaxed font-light">High fidelity interactive viewer displaying cranial MRI diagnostics stacks.</p>
              </div>
            </div>

            {/* Subtitle control widgets */}
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-accent/25 border border-accent flex items-center justify-center">
                  <span className="text-[#A8802E] text-[10px] font-bold">SR</span>
                </div>
                <div>
                  <div className="text-primary font-bold text-[10px]">Dr. Sam Reefath</div>
                  <div className="text-blue-gray text-[8px] font-mono">HOSTING: Neuroradiology Review</div>
                </div>
              </div>
              <span className="text-[10px] text-accent font-semibold animate-pulse">241 students connected</span>
            </div>
          </div>
        </div>

        {/* Right Side Content Column */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
              <span>✨</span> 05. INTERACTIVE BROADCASTS
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-primary leading-none">
              LIVE & RECORDED <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">CLASSES</span>
            </h3>
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mt-3" />
            <p className="text-blue-gray text-xs sm:text-sm font-light leading-relaxed">
              Experience dynamic, high-bandwidth streaming lectures designed to simulate realistic clinical diagnostics. Review clinical case presentations, differential diagnosis, and master board exam rapid firing rounds.
            </p>
          </div>

          {/* List features with premium checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {LIVE_CLASSES_FEATURES.map((feat, idx) => (
              <div key={idx} className="flex space-x-3 items-start">
                <div className="p-1 bg-accent/15 border border-accent/40 text-accent rounded-md flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-primary font-bold text-xs tracking-wide uppercase">{feat.title}</h4>
                  <p className="text-blue-gray text-[11px] leading-relaxed font-normal">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" className="uppercase tracking-widest text-xs font-bold shadow-md">
              JOIN SCHEDULE BATCH
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
