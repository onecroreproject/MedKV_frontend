import React from 'react';
import Button from '../ui/Button';

export function BookmarksTab() {
  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">Saved Bookmarks</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Quick access to saved radiology preps, diagnostics files, and worksheets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Brain MRI Interpretation Masterclass', type: 'Course Module', action: 'Resume Course' },
          { title: 'Stanford B Aortic emergency CT files', type: 'DICOM Case Study', action: 'Open PACS' }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ease-in-out"
          >
            <div>
              <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest">{item.type}</span>
              <h4 className="text-[#0B1F4D] font-black text-sm uppercase tracking-wide leading-tight mt-2">{item.title}</h4>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => alert(`Launching ${item.title}!`)}
              className="text-[10px] font-black py-2 px-4 uppercase tracking-widest shrink-0 !border-accent !text-accent hover:!bg-accent hover:!text-white transform active:scale-95 transition-all"
            >
              {item.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookmarksTab;
