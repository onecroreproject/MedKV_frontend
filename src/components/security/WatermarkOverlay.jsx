import React, { useEffect, useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';

export default function WatermarkOverlay({ userSession }) {
  const { settings } = useSecurity();
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  // Update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!settings.enableWatermarking || !userSession) {
    return null;
  }

  // Create an array of positions to tile the watermark
  const rows = Array.from({ length: 8 });
  const cols = Array.from({ length: 4 });

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      <div className="absolute inset-0 flex flex-col justify-between py-12">
        {rows.map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex justify-between px-12 w-[150%] -ml-[25%] opacity-[0.03]">
            {cols.map((_, colIndex) => (
              <div 
                key={`col-${rowIndex}-${colIndex}`} 
                className="transform -rotate-45 whitespace-nowrap text-slate-900 font-bold text-sm tracking-widest"
              >
                <div>{userSession.name}</div>
                <div>{userSession.email}</div>
                <div className="text-[10px]">{timestamp}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
