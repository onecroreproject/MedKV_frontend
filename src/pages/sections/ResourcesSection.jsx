import React from 'react';
import Card, { CardBody } from '../../components/ui/Card';
import { LEARNING_FEATURES } from '../../config/constants';

export default function ResourcesSection() {
  return (
    <section id="resources" className="bg-soft-gray border-y border-slate-200/80 py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
            <span>✨</span> 09. POWERFUL ACADEMY UTILITIES
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
            STUDENT PORTAL <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">POWERHOUSE</span>
          </h3>
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
          <p className="text-blue-gray text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
            Discover specialized features built natively inside the student portal to turbocharge your medical diagnostic proficiency.
          </p>
        </div>

        {/* 8 learning feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {LEARNING_FEATURES.map((feat, idx) => (
            <Card key={idx} variant="default" className="hover:scale-102 border-slate-200 group bg-white shadow-sm transition-all duration-300">
              <CardBody className="p-6 space-y-4 bg-white">
                <div className="inline-flex p-2.5 bg-soft-gray border border-slate-200 text-accent rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {feat.icon === 'mcq' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  {feat.icon === 'viewer' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  {feat.icon === 'path' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>}
                  {feat.icon === 'cards' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  {feat.icon === 'mocks' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  {feat.icon === 'tracking' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                  {feat.icon === 'reports' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  {feat.icon === 'protocols' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                </div>
                <h4 className="text-primary font-bold text-sm tracking-wide uppercase group-hover:text-accent transition-colors">
                  {feat.title}
                </h4>
                <p className="text-blue-gray text-xs leading-relaxed font-normal">
                  {feat.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
