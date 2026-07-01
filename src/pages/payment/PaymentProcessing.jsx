import React, { useEffect, useState } from 'react';

export default function PaymentProcessing({ onNavigate, courseId }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate payment processing steps
    const steps = [
      { p: 15, delay: 500 },
      { p: 45, delay: 1500 },
      { p: 75, delay: 2500 },
      { p: 100, delay: 3500 }
    ];

    steps.forEach(({ p, delay }) => {
      setTimeout(() => setProgress(p), delay);
    });

    // Navigate to success after 4 seconds
    const timer = setTimeout(() => {
      // Pass the courseId to result so it can be added to context
      onNavigate('payment-success', courseId);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onNavigate, courseId]);

  return (
    <div className="fixed inset-0 bg-[#030919]/95 z-50 flex items-center justify-center font-sans">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-sm w-full px-6">
        
        {/* Animated Rings Loader */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 border-4 border-white/20 rounded-full border-b-transparent animate-spin-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            🔒
          </div>
        </div>

        <h2 className="text-white font-black text-2xl tracking-wide mb-2">Processing Payment</h2>
        <p className="text-slate-400 text-sm mb-8 animate-pulse">
          Please do not refresh the page or click back. We are communicating with the bank...
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
          <div 
            className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs font-bold text-accent tracking-widest text-right">
          {progress}%
        </div>
      </div>
    </div>
  );
}
