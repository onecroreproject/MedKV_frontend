import React from 'react';
import Button from '../ui/Button';

export function MockExamsTab() {
  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">Board Mock Exams</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Royal College style rapid reporting mocks and viva simulations under calibrated timers.</p>
      </div>

      <div className="bg-gradient-to-br from-[#0B1F4D] to-[#0A1121] border border-accent/25 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg space-y-5 hover:shadow-xl transition-shadow duration-300">
        <div className="absolute top-0 right-0 bg-accent text-[#060B18] text-[9.5px] font-black px-4.5 py-1.5 uppercase tracking-wider rounded-bl-2xl shadow">
          Exam Portal Active
        </div>

        <div className="space-y-3.5 max-w-2xl">
          <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">Calibrated Mock Suite</span>
          <h3 className="text-white font-black text-xl uppercase tracking-wide leading-tight">RCR FRCR Part 2B Rapid Reporting Mock Calibration</h3>
          <p className="text-slate-300 text-xs font-light leading-relaxed">
            Test your rapid-reporting diagnostic limits. Clear 30 high-yield clinical bone and chest radiographs under strict 35-minute timing parameters. Calibrated identically to the Royal College interface.
          </p>

          <div className="space-y-1.5 font-medium text-slate-300 text-[11px] pt-3">
            <div>⏱️ Timer constraints: 35 Minutes fixed pacing</div>
            <div>📋 Density: 30 Spotter Scans</div>
            <div>🥇 Passing criteria: 27 / 30 correct diagnoses</div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-3 max-w-md">
          <Button
            variant="secondary"
            size="md"
            onClick={() => alert('Initiating 35-minute board mock session!')}
            className="uppercase tracking-widest text-xs font-black py-3 px-6 shadow-md transform active:scale-95 transition-all"
          >
            Start Calibrated Exam
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MockExamsTab;
