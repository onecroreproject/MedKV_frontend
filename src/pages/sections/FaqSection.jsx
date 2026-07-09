import React, { useState } from 'react';
import { FAQS } from '../../config/constants';

export default function FaqSection() {
  // Interactive FAQ Accordion states
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 bg-white">
      
      <div className="text-center space-y-3">
        
        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary leading-none">
          FREQUENTLY ASKED <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">QUESTIONS</span>
        </h3>
        <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
        <p className="text-blue-gray text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          Answers to clarify queries relating to program formats, department integrations, and dashboard systems.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div 
              key={idx} 
              className={`border rounded-xl transition-all duration-300 ${
                isOpen ? 'bg-soft-gray border-accent/40 shadow-sm' : 'bg-white border-slate-200 hover:border-accent/20 shadow-sm'
              }`}
            >
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full text-left p-6 flex justify-between items-center text-primary focus:outline-none cursor-pointer"
              >
                <span className="font-bold text-sm sm:text-base leading-snug">
                  {faq.question}
                </span>
                <span className="text-accent text-xl font-bold ml-4">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-0 border-t border-slate-200/40 transition-all duration-300">
                  <p className="text-blue-gray text-xs sm:text-sm leading-relaxed pt-4 font-normal">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
