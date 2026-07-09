import React from 'react';
import { ACADEMY_STATISTICS } from '../../config/constants';

export default function StatisticsSection() {
  return (
    <section className="bg-primary border-t border-slate-200 py-10 sm:py-16 relative overflow-hidden shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {ACADEMY_STATISTICS.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-accent bg-gradient-to-b from-accent to-[#EED393] bg-clip-text text-transparent">
                {item.count}
              </span>
              <span className="text-white font-semibold text-xs tracking-wider uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
