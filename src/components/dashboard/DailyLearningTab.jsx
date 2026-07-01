import React from 'react';
import Button from '../ui/Button';

export function DailyLearningTab({
  DAILY_FEED,
  selectedQuizOption,
  setSelectedQuizOption,
  quizScore,
  handleQuizSubmit
}) {
  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">Daily Learning Feed</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">High-yield revision materials delivered daily to secure diagnostic excellence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Daily Case and MCQs widgets */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Daily Case Study Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ease-in-out group">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-accent font-extrabold uppercase tracking-wider bg-accent/5 border border-accent/15 px-2.5 py-0.5 rounded">
                🧠 Case of the Day
              </span>
              <span className="bg-rose-500/10 text-rose-600 text-[9px] font-black px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">
                {DAILY_FEED.caseStudy.diff} Difficulty
              </span>
            </div>

            <h3 className="text-[#0B1F4D] font-black text-lg uppercase tracking-wide mt-1.5">{DAILY_FEED.caseStudy.title}</h3>
            <p className="text-slate-600 text-xs font-light leading-relaxed">{DAILY_FEED.caseStudy.teaser}</p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Opening detailed breakdown of Cerebral Venous Sinus Thrombosis!')}
              className="text-[10px] font-black py-2 px-4 uppercase tracking-widest !border-accent !text-accent hover:!bg-accent hover:!text-white transform active:scale-95 transition-all"
            >
              Start Learning Case
            </Button>
          </div>

          {/* Daily 5 MCQs Widget */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ease-in-out">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-[#0B1F4D] font-extrabold text-sm uppercase tracking-wider flex items-center space-x-2">
                <span>📝</span> <span>Daily diagnostic Quiz</span>
              </h4>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <p className="text-slate-800 text-xs font-bold leading-relaxed">{DAILY_FEED.mcqs[0].q}</p>
              
              <div className="space-y-2">
                {DAILY_FEED.mcqs[0].options.map((opt, oIdx) => (
                  <label
                    key={oIdx}
                    onClick={() => setSelectedQuizOption(oIdx)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedQuizOption === oIdx
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/50 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="daily-quiz"
                      checked={selectedQuizOption === oIdx}
                      onChange={() => {}}
                      className="mr-3 accent-accent"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              {quizScore && (
                <div className="bg-accent/5 border border-accent/25 text-accent p-3.5 rounded-xl font-bold">
                  {quizScore}
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuizSubmit(DAILY_FEED.mcqs[0].correct)}
                disabled={selectedQuizOption === null}
                className="w-full text-[10px] py-2.5 font-black uppercase tracking-widest transform active:scale-95 transition-all"
              >
                Submit Response
              </Button>
            </div>
          </div>

        </div>

        {/* Daily Tip and anatomy spotters */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Reporting Tip */}
          <div className="bg-gradient-to-br from-[#0B1F4D] to-[#040812] border border-accent/25 rounded-3xl p-6 shadow-lg text-left space-y-3.5 hover:shadow-xl transition-shadow duration-300">
            <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">📝 CLINICAL REPORTING TIP</span>
            <p className="text-slate-300 text-xs leading-relaxed font-light italic">
              "{DAILY_FEED.reportingTip}"
            </p>
          </div>

          {/* Anatomy Slice details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5 text-left hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ease-in-out">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">💀 Anatomy Spotter Card</span>
            <h4 className="text-[#0B1F4D] font-black text-sm uppercase tracking-wide leading-snug">{DAILY_FEED.anatomyCard.title}</h4>
            <p className="text-slate-500 text-xs font-light leading-relaxed">{DAILY_FEED.anatomyCard.desc}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Launching high-res 3D Anatomy slice bundle!')}
              className="w-full text-[10px] font-black py-2.5 uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transform active:scale-95 transition-all"
            >
              View Slice Details
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default DailyLearningTab;
