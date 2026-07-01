import React, { useEffect } from 'react';

export function NotificationsTab({
  NOTIFICATIONS,
  onMount,
  onNotificationClick
}) {
  useEffect(() => {
    if (onMount) onMount();
  }, [onMount]);

  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">Academy Notifications</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Keep up with live classes schedule updates, diagnostic uploads, and mock metrics.</p>
      </div>

      <div className="space-y-4">
        {NOTIFICATIONS.map((not) => (
          <div
            key={not.id}
            onClick={() => onNotificationClick && onNotificationClick(not)}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start space-x-4 hover:border-accent/30 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <span className="text-2xl bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 shrink-0 flex items-center justify-center h-12 w-12 shadow-inner">
              {not.type === 'Alert' ? '📡' : not.type === 'System' ? '📁' : '🏆'}
            </span>

            <div className="space-y-1 text-left min-w-0 flex-grow">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">{not.type}</span>
                <span className="text-[10px] text-slate-400">{not.time}</span>
              </div>
              <h4 className="text-[#0B1F4D] font-bold text-xs uppercase tracking-wide leading-tight">{not.title}</h4>
              <p className="text-slate-500 text-[11px] font-light leading-relaxed mt-1">{not.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsTab;
