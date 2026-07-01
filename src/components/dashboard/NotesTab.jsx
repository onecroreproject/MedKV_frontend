import React from 'react';
import Button from '../ui/Button';

export function NotesTab({
  notesText,
  setNotesText,
  notesSaved,
  handleNotesSave
}) {
  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-[#0B1F4D] font-black text-2xl tracking-tight uppercase">Personal Clinical Notes</h2>
        <p className="text-slate-500 text-xs mt-0.5 font-light leading-relaxed">Save custom differentials, reporting reminders, and mock revision checklists.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest">📝 Interactive Notepad</span>
          {notesSaved && (
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest animate-pulse">✓ Saved successfully</span>
          )}
        </div>

        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          rows="8"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-xs placeholder-slate-400 font-mono focus:bg-white focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300 resize-none leading-relaxed"
          placeholder="Draft your clinical notes here..."
        />

        <div className="flex justify-end pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleNotesSave}
            className="uppercase tracking-widest text-xs font-black py-3 px-8 shadow-sm transform active:scale-95 transition-all"
          >
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotesTab;
