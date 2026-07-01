import React from 'react';
import Button from '../ui/Button';

export function CaseLibraryTab({
  CASE_LIBRARY
}) {
  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">DICOM Case Library</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Scroll and analyze high-resolution clinical cases with structural diagnostic parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CASE_LIBRARY.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md hover:border-accent/40 transition-all duration-300 ease-in-out group"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-accent font-extrabold uppercase tracking-wider bg-accent/5 border border-accent/15 px-2 py-0.5 rounded">
                  {item.type}
                </span>
                <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest">
                  {item.difficulty}
                </span>
              </div>

              <h4 className="text-[#0B1F4D] font-black text-sm uppercase tracking-wide leading-tight group-hover:text-accent transition-colors">{item.title}</h4>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>Density: {item.scans}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                  item.status === 'Completed'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    : item.status === 'In Progress'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                    : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => alert(`Launching PACS Viewer Simulator for Case: ${item.title}`)}
              className="w-full text-[10px] font-black py-2.5 uppercase tracking-widest !border-accent !text-accent hover:!bg-accent hover:!text-white transform active:scale-95 transition-all"
            >
              Open PACS Viewer
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaseLibraryTab;
