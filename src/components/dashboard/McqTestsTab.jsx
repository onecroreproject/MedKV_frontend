import React, { useState, useEffect, useCallback } from 'react';

// ─── All Test Definitions ────────────────────────────────────────────────────
const TEST_CATALOG = [
  {
    id: 'mcq-1',
    title: 'FRCR Part 1 – Physics & Anatomy Mock',
    category: 'FRCR Part 1',
    faculty: 'Prof. Marcus Vance',
    totalQ: 40,
    totalMarks: 40,
    durationSec: 2400, // 40 min
    difficulty: 'Calibrated Board',
    negativeMarking: '-0.25 per wrong',
    tags: ['Timed Test', 'Mock Exam', 'Physics'],
    emoji: '⚛️',
  },
  {
    id: 'mcq-2',
    title: 'FRCR 2A Advanced Neuro & MSK Modules',
    category: 'FRCR Part 2A',
    faculty: 'Dr. Sam Reefath',
    totalQ: 60,
    totalMarks: 60,
    durationSec: 5400, // 90 min
    difficulty: 'Advanced Diagnostic',
    negativeMarking: '-0.33 per wrong',
    tags: ['Case-Based Assessment', 'Mock Exam', 'Timed Test'],
    emoji: '🧠',
  },
  {
    id: 'mcq-3',
    title: 'ACR Chest CT Rapid Reporting Drill',
    category: 'FRCR Part 2B',
    faculty: 'Dr. Sarah Jenkins',
    totalQ: 20,
    totalMarks: 20,
    durationSec: 1800, // 30 min
    difficulty: 'Clinical Standard',
    negativeMarking: 'None',
    tags: ['Rapid Reporting', 'FRCR 2B', 'Timed Test'],
    emoji: '🩻',
  },
  {
    id: 'mcq-4',
    title: 'Anatomy Identification Spotter Quiz',
    category: 'Anatomy',
    faculty: 'Prof. Marcus Vance',
    totalQ: 25,
    totalMarks: 25,
    durationSec: 1500,
    difficulty: 'Intermediate',
    negativeMarking: 'None',
    tags: ['Anatomy Quiz', 'Image-Based'],
    emoji: '💀',
  },
  {
    id: 'mcq-5',
    title: 'Pathology Imaging Pattern Recognition',
    category: 'Pathology',
    faculty: 'Dr. Sam Reefath',
    totalQ: 30,
    totalMarks: 30,
    durationSec: 2700,
    difficulty: 'Hard',
    negativeMarking: '-0.25 per wrong',
    tags: ['Pathology Quiz', 'Case-Based Assessment'],
    emoji: '🔬',
  },
  {
    id: 'mcq-6',
    title: 'Daily MCQ Drill – Brain MRI Focus',
    category: 'Daily Practice',
    faculty: 'Dr. Sam Reefath',
    totalQ: 10,
    totalMarks: 10,
    durationSec: 600,
    difficulty: 'Medium',
    negativeMarking: 'None',
    tags: ['Daily MCQs', 'Neuro'],
    emoji: '📅',
  },
];

// ─── Questions bank (shared across tests for demo) ────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    type: 'Clinical Diagnosis',
    text: 'A 45-year-old patient presents with acute onset headache and right-sided weakness. The MRI shows a hyperintense lesion on DWI with corresponding low signal on ADC map in the left MCA territory. What is the most likely diagnosis?',
    hasImage: true,
    imageEmoji: '🧠',
    imageLabel: 'DWI Brain MRI – Left MCA Territory',
    options: ['Brain Tumour (GBM)', 'Acute Ischaemic Stroke', 'Multiple Sclerosis Plaque', 'Hypertensive Encephalopathy'],
    correct: 1,
    explanation: 'The combination of DWI hyperintensity with ADC hypointensity (restricted diffusion) in a vascular territory is the hallmark of acute ischaemic stroke. GBM and MS may show restricted diffusion, but the vascular distribution and acute clinical presentation clinch the diagnosis.',
    topic: 'Neuroradiology',
    difficulty: 'Hard',
  },
  {
    id: 2,
    type: 'Anatomy Identification',
    text: 'On the axial T2-weighted MRI of the posterior fossa, the highlighted structure (arrowed) lying lateral to the fourth ventricle contains cranial nerves VII and VIII. What structure is this?',
    hasImage: true,
    imageEmoji: '🔬',
    imageLabel: 'Axial T2 MRI – Posterior Fossa',
    options: ['Jugular foramen', 'Foramen lacerum', 'Internal Acoustic Canal (IAC)', 'Foramen ovale'],
    correct: 2,
    explanation: 'The Internal Acoustic Canal (IAC) transmits the facial nerve (CN VII) and vestibulocochlear nerve (CN VIII). On thin-slice T2 MRI, both nerves can be individually resolved within the IAC, which lies lateral to the fourth ventricle.',
    topic: 'Neuroanatomy',
    difficulty: 'Medium',
  },
  {
    id: 3,
    type: 'Radiology Physics',
    text: 'Which MRI sequence demonstrates the highest sensitivity for detecting hyperacute cerebral infarction within the first 6 hours of symptom onset?',
    hasImage: false,
    options: ['T1 Weighted Imaging', 'T2 FLAIR', 'Diffusion Weighted Imaging (DWI)', 'Susceptibility Weighted Imaging (SWI)'],
    correct: 2,
    explanation: 'DWI demonstrates cytotoxic oedema within minutes of ischaemia onset, making it the most sensitive sequence for hyperacute stroke. FLAIR changes become positive only after 4–6 hours. The DWI/FLAIR mismatch is exploited in the WAKE-UP trial protocol.',
    topic: 'MRI Physics',
    difficulty: 'Medium',
  },
  {
    id: 4,
    type: 'Pathology Recognition',
    text: 'A ring-enhancing lesion is identified in the right temporal lobe on contrast-enhanced MRI. The patient is a known HIV-positive individual with a CD4 count of 80 cells/μL. What is the MOST likely diagnosis?',
    hasImage: true,
    imageEmoji: '💊',
    imageLabel: 'T1 Contrast MRI – Right Temporal Lobe',
    options: ['High-Grade Glioma (GBM)', 'CNS Lymphoma', 'Cerebral Toxoplasmosis', 'Pyogenic Abscess'],
    correct: 2,
    explanation: 'In an immunocompromised patient with CD4 <200 cells/μL, cerebral toxoplasmosis is the single most common cause of ring-enhancing lesion. While CNS lymphoma and GBM also ring-enhance, the clinical context strongly favours toxoplasmosis. Empirical anti-toxoplasma therapy is commenced first.',
    topic: 'Neuroradiology',
    difficulty: 'Hard',
  },
  {
    id: 5,
    type: 'Clinical Diagnosis',
    text: 'On chest CT, a patient demonstrates bilateral, symmetrical ground-glass opacities with interlobular septal thickening producing a "crazy paving" pattern. Which condition does this BEST describe?',
    hasImage: true,
    imageEmoji: '🩻',
    imageLabel: 'HRCT Chest – Bilateral GGO Pattern',
    options: ['Pulmonary Fibrosis (UIP)', 'Pulmonary Alveolar Proteinosis (PAP)', 'COVID-19 Pneumonia', 'Sarcoidosis'],
    correct: 1,
    explanation: 'The "crazy paving" pattern — ground-glass opacity with superimposed interlobular septal thickening — is the classic CT descriptor for Pulmonary Alveolar Proteinosis (PAP). While COVID-19 can show GGO, it rarely produces true crazy paving. UIP shows basal-predominant reticulation with honeycombing.',
    topic: 'Thoracic Radiology',
    difficulty: 'Hard',
  },
  {
    id: 6,
    type: 'Anatomy Identification',
    text: 'On a coronal CT of the abdomen, a tubular structure with a "beak sign" and "whirl sign" is identified arising from the superior mesenteric vein axis. Which condition does this indicate?',
    hasImage: false,
    options: ['Ogilvie Syndrome', 'Superior Mesenteric Artery (SMA) Syndrome', 'Midgut Malrotation with Volvulus', 'Colonic Pseudo-obstruction'],
    correct: 2,
    explanation: 'The "whirl sign" on CT represents the rotational mesenteric wrapping in midgut volvulus. The "beak sign" at the point of obstruction, combined with a whirl of mesentery around the SMA, is pathognomonic of midgut malrotation with volvulus — a surgical emergency.',
    topic: 'Abdominal Radiology',
    difficulty: 'Expert',
  },
  {
    id: 7,
    type: 'Radiology Physics',
    text: 'What is the primary advantage of using a higher kVp (kilovoltage peak) setting in conventional radiography?',
    hasImage: false,
    options: ['Increases patient radiation dose significantly', 'Reduces image noise at the expense of contrast resolution', 'Increases photoelectric interactions providing better bone contrast', 'Decreases the energy of the X-ray beam reducing penetration'],
    correct: 1,
    explanation: 'Higher kVp increases the mean energy of the X-ray beam, increasing Compton scatter and reducing photoelectric absorption. This improves penetration but reduces inherent subject contrast (particularly bone-to-soft tissue). Higher kVp generally reduces patient dose while reducing low-contrast detectability.',
    topic: 'X-Ray Physics',
    difficulty: 'Medium',
  },
  {
    id: 8,
    type: 'Clinical Diagnosis',
    text: 'A 60-year-old smoker undergoes HRCT chest. The imaging shows bilateral basal and peripheral-predominant fibrosis with honeycombing and traction bronchiectasis. The pattern is consistent with which ILD?',
    hasImage: true,
    imageEmoji: '🫁',
    imageLabel: 'HRCT – Basal Fibrosis & Honeycombing',
    options: ['Non-Specific Interstitial Pneumonia (NSIP)', 'Desquamative Interstitial Pneumonia (DIP)', 'Usual Interstitial Pneumonia (UIP) / IPF', 'Cryptogenic Organising Pneumonia (COP)'],
    correct: 2,
    explanation: 'UIP pattern, the CT correlate of Idiopathic Pulmonary Fibrosis (IPF), is characterised by bilateral, basal, subpleural-predominant reticulation with honeycombing ± traction bronchiectasis in the absence of features suggesting an alternative ILD. It portends a poor prognosis.',
    topic: 'Thoracic Radiology',
    difficulty: 'Hard',
  },
  {
    id: 9,
    type: 'Anatomy Identification',
    text: 'On MRI of the knee, which structure has the characteristic "bow-tie" appearance on sagittal imaging when normal, representing the two leaflets visible on consecutive peripheral sagittal slices?',
    hasImage: false,
    options: ['Anterior Cruciate Ligament', 'Posterior Cruciate Ligament', 'Medial Meniscus', 'Lateral Meniscus'],
    correct: 2,
    explanation: 'The normal medial meniscus demonstrates a "bow-tie" appearance on peripheral sagittal MRI slices due to its C-shaped morphology — the body appears as two triangular wedges ("bow-tie") on at least two consecutive 4–5 mm sagittal slices. Absence of the bow-tie sign suggests a bucket-handle tear.',
    topic: 'MSK Radiology',
    difficulty: 'Medium',
  },
  {
    id: 10,
    type: 'Rapid Reporting',
    text: 'Interpret the following chest radiograph. The trachea is deviated to the right. There is complete opacification of the left hemithorax with no visible lung markings. What is your primary diagnosis?',
    hasImage: true,
    imageEmoji: '🩺',
    imageLabel: 'PA CXR – Left Hemithorax',
    options: ['Left-sided Pleural Effusion', 'Left-sided Tension Pneumothorax', 'Left Total Lung Collapse (Collapse/Consolidation)', 'Left-sided Mesothelioma'],
    correct: 0,
    explanation: 'Complete opacification of a hemithorax with tracheal and mediastinal shift toward the CONTRALATERAL side (right) indicates a massive pleural effusion. In tension pneumothorax, the trachea shifts away from the pneumothorax (also right-sided deviation if left-sided tension) — however the total opacity favours effusion over air.',
    topic: 'Thoracic Radiology',
    difficulty: 'Hard',
  },
];

// ─── Helper: format seconds → MM:SS ─────────────────────────────────────────
const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ level }) {
  const map = {
    Easy: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200',
    Hard: 'bg-orange-50 text-orange-600 border-orange-200',
    Expert: 'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${map[level] || map.Medium}`}>
      {level}
    </span>
  );
}

// ─── PHASE 0 — Catalog (test selection) ──────────────────────────────────────
function TestCatalog({ onStart }) {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'FRCR Part 1', 'FRCR Part 2A', 'FRCR Part 2B', 'Anatomy', 'Pathology', 'Daily Practice'];
  const shown = filter === 'all' ? TEST_CATALOG : TEST_CATALOG.filter(t => t.category === filter);

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#030919] via-[#0B1F4D] to-[#0A1733] rounded-3xl p-6 sm:p-8 overflow-hidden border border-accent/15 shadow-2xl">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.025)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-grow space-y-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-accent rounded-full animate-pulse" />
              <span className="text-[10px] text-accent font-black uppercase tracking-[0.25em]">Assessment Centre</span>
            </div>
            <h1 className="text-white font-black text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight">
              MCQ Assessment<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#D4AF37]">Practice & Mock Exams</span>
            </h1>
            <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xl">
              Attempt exam-calibrated FRCR, DNB, and MDRD practice papers. Case-based, timed, and analytics-driven for board excellence.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[{ v: '6', l: 'Test Sets' }, { v: '175', l: 'Questions' }, { v: '83%', l: 'Avg Score' }].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-white font-black text-2xl leading-none">{s.v}</div>
                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer focus:outline-none transition-all duration-300 ${filter === cat ? 'bg-[#0B1F4D] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            {cat === 'all' ? 'All Tests' : cat}
          </button>
        ))}
      </div>

      {/* Test cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {shown.map(test => (
          <div key={test.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:border-accent/30 transition-all duration-300 group flex flex-col">
            {/* Card banner */}
            <div className="h-28 bg-gradient-to-br from-[#050C1F] to-[#0B1F4D] relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,155,60,0.1)_0%,transparent_60%)]" />
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300 relative z-10">{test.emoji}</span>
              <div className="absolute top-3 left-3">
                <span className="bg-accent/15 border border-accent/30 text-accent text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">{test.category}</span>
              </div>
              <div className="absolute top-3 right-3">
                <DiffBadge level={test.difficulty.split(' ')[0]} />
              </div>
            </div>
            {/* Card body */}
            <div className="p-5 flex flex-col flex-grow space-y-3">
              <h4 className="text-[#0B1F4D] font-black text-sm uppercase tracking-wide leading-snug group-hover:text-accent transition-colors">{test.title}</h4>
              <p className="text-slate-400 text-[10px] font-medium">🧑‍⚕️ {test.faculty}</p>
              <div className="flex flex-wrap gap-1.5">
                {test.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 text-slate-500 border border-slate-200 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'Questions', value: test.totalQ },
                  { label: 'Marks', value: test.totalMarks },
                  { label: 'Duration', value: fmtTime(test.durationSec) },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center">
                    <div className="text-[#0B1F4D] font-black text-sm">{s.value}</div>
                    <div className="text-slate-400 text-[8px] font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-slate-400 text-[10px] font-medium">
                Negative Marking: <span className="text-rose-500 font-black">{test.negativeMarking}</span>
              </div>
              <button
                onClick={() => onStart(test)}
                className="mt-auto w-full bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-accent/20 active:scale-95 cursor-pointer"
              >
                Start Test →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PHASE 1 — Test briefing card ────────────────────────────────────────────
function TestBriefing({ test, onBegin, onBack }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-[#0B1F4D] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer focus:outline-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        <span>Back to Tests</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#030919] to-[#0B1F4D] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-accent/8 rounded-full blur-[60px]" />
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-accent/15 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">{test.category}</span>
              {test.tags.map(tag => (
                <span key={tag} className="bg-white/10 text-white/70 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-white/15">{tag}</span>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-5xl">{test.emoji}</span>
              <h2 className="text-white font-black text-xl sm:text-2xl leading-tight">{test.title}</h2>
            </div>
            <p className="text-slate-400 text-sm font-light">Faculty: {test.faculty}</p>
          </div>
        </div>

        {/* Exam details grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: '❓', label: 'Total Questions', value: test.totalQ },
              { icon: '🏆', label: 'Total Marks', value: test.totalMarks },
              { icon: '⏱️', label: 'Duration', value: fmtTime(test.durationSec) },
              { icon: '⚠️', label: 'Negative Marking', value: test.negativeMarking },
              { icon: '📊', label: 'Difficulty', value: test.difficulty },
              { icon: '🎓', label: 'Exam Type', value: 'Board-Calibrated' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-[#0B1F4D] font-black text-sm">{s.value}</div>
                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-amber-700 font-black text-xs uppercase tracking-wide flex items-center space-x-1.5">
              <span>⚠️</span><span>Exam Instructions</span>
            </h4>
            <ul className="space-y-1.5 text-amber-700 text-[11px] font-medium leading-relaxed">
              <li>• The timer starts immediately when you click "Start Test" and cannot be paused.</li>
              <li>• You may mark questions for review and return before final submission.</li>
              <li>• All your answers are auto-saved every 10 seconds.</li>
              <li>• Negative marking applies as specified above — do not guess randomly.</li>
              <li>• Ensure a stable internet connection before starting.</li>
            </ul>
          </div>

          <button
            onClick={onBegin}
            className="w-full bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-sm uppercase tracking-widest py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-accent/25 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            <span>Start Test Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 2 — Active exam ────────────────────────────────────────────────────
function ActiveExam({ test, onSubmit }) {
  const TOTAL = Math.min(test.totalQ, QUESTIONS.length);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // qIdx → optionIdx
  const [marked, setMarked] = useState({}); // qIdx → bool
  const [timeLeft, setTimeLeft] = useState(test.durationSec);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFiveMinWarn, setShowFiveMinWarn] = useState(false);
  const [expandImage, setExpandImage] = useState(false);
  const [navOpen, setNavOpen] = useState(true);

  const q = QUESTIONS[currentQ];

  // Timer
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(id); handleForceSubmit(); return 0; }
        if (prev === 300) setShowFiveMinWarn(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    const id = setInterval(() => setLastSaved(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const handleForceSubmit = useCallback(() => {
    onSubmit({ answers, marked, timeTaken: test.durationSec - timeLeft, total: TOTAL });
  }, [answers, marked, timeLeft, TOTAL]);

  const attempted = Object.keys(answers).length;
  const markedCount = Object.keys(marked).filter(k => marked[k]).length;
  const skipped = TOTAL - attempted;

  const selectAnswer = (optIdx) => {
    if (answers[currentQ] === optIdx) {
      const { [currentQ]: _, ...rest } = answers;
      setAnswers(rest);
    } else {
      setAnswers(p => ({ ...p, [currentQ]: optIdx }));
    }
  };

  const toggleMark = () => setMarked(p => ({ ...p, [currentQ]: !p[currentQ] }));

  const getNavColor = (i) => {
    if (i === currentQ) return 'bg-[#0B1F4D] text-white ring-2 ring-[#0B1F4D]/40';
    if (marked[i]) return 'bg-amber-400 text-[#050E24]';
    if (answers[i] !== undefined) return 'bg-emerald-500 text-white';
    return 'bg-slate-100 text-slate-500 hover:bg-slate-200';
  };

  const timerColor = timeLeft < 300 ? 'text-rose-500' : timeLeft < 600 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="space-y-4">
      {/* 5-min warning toast */}
      {showFiveMinWarn && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-top-4 duration-500">
          <span className="text-xl">⏰</span>
          <span className="font-black text-sm">Warning: Only 5 minutes remaining!</span>
          <button onClick={() => setShowFiveMinWarn(false)} className="text-white/70 hover:text-white ml-2 cursor-pointer focus:outline-none">✕</button>
        </div>
      )}

      {/* Image expand modal */}
      {expandImage && q.hasImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExpandImage(false)}>
          <div className="bg-[#050C1F] rounded-3xl p-8 max-w-lg w-full border border-accent/20 shadow-2xl text-center space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-8xl">{q.imageEmoji}</div>
            <p className="text-accent font-black text-sm uppercase tracking-widest">{q.imageLabel}</p>
            <p className="text-slate-400 text-xs font-light">Simulated imaging panel — DICOM viewer in full portal</p>
            <button onClick={() => setExpandImage(false)} className="border border-white/20 text-white font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">Close</button>
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="text-center space-y-2">
              <div className="text-4xl">📋</div>
              <h3 className="text-[#0B1F4D] font-black text-lg uppercase tracking-wide">Review Before Submit</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Attempted', value: attempted, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                { label: 'Not Answered', value: skipped, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
                { label: 'For Review', value: markedCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border rounded-2xl p-3 text-center`}>
                  <div className={`${s.color} font-black text-2xl`}>{s.value}</div>
                  <div className="text-slate-500 text-[8px] font-bold uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {skipped > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-600 text-xs font-medium text-center">
                ⚠️ You have {skipped} unanswered question{skipped !== 1 ? 's' : ''}. Are you sure you want to submit?
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 border-2 border-[#0B1F4D] text-[#0B1F4D] hover:bg-[#0B1F4D] hover:text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer">Continue Exam</button>
              <button onClick={() => onSubmit({ answers, marked, timeTaken: test.durationSec - timeLeft, total: TOTAL })} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20">Final Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky progress header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-[#0B1F4D] font-black text-sm">
              Q{currentQ + 1} <span className="text-slate-400 font-bold">of {TOTAL}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center space-x-1 text-emerald-600"><span className="h-2 w-2 bg-emerald-500 rounded-full" /><span>{attempted} Answered</span></span>
              <span className="flex items-center space-x-1 text-amber-500"><span className="h-2 w-2 bg-amber-400 rounded-full" /><span>{markedCount} Review</span></span>
              <span className="flex items-center space-x-1 text-slate-400"><span className="h-2 w-2 bg-slate-200 rounded-full" /><span>{skipped} Skipped</span></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`font-black text-xl tabular-nums ${timerColor}`}>⏱ {fmtTime(timeLeft)}</div>
            <button onClick={() => setShowSubmitModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95">Submit</button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-[#D4AF37] rounded-full transition-all duration-700" style={{ width: `${(attempted / TOTAL) * 100}%` }} />
        </div>
      </div>

      {/* Main layout: question + navigator */}
      <div className="flex gap-5 items-start">

        {/* Question card */}
        <div className="flex-grow min-w-0 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            {/* Q meta */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#0B1F4D] text-white font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-widest">Q{currentQ + 1}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded">{q.type}</span>
              <DiffBadge level={q.difficulty} />
              <span className="text-[9px] text-slate-400 font-medium ml-auto">{q.topic}</span>
              {marked[currentQ] && <span className="bg-amber-50 border border-amber-200 text-amber-600 text-[8px] font-black uppercase px-2 py-0.5 rounded">Marked for Review</span>}
            </div>

            {/* Optional image panel */}
            {q.hasImage && (
              <div
                className="relative bg-gradient-to-br from-[#050C1F] to-[#0B1F4D] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer group border border-accent/15 hover:border-accent/30 transition-all"
                style={{ minHeight: 140 }}
                onClick={() => setExpandImage(true)}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.06)_0%,transparent_60%)]" />
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10 mb-2">{q.imageEmoji}</div>
                <p className="text-accent text-[10px] font-black uppercase tracking-widest relative z-10">{q.imageLabel}</p>
                <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                  <span className="bg-white/10 border border-white/15 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider">🔍 Zoom</span>
                  <span className="bg-white/10 border border-white/15 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider">⛶ Full</span>
                </div>
                <p className="text-white/30 text-[9px] font-medium mt-1 relative z-10">Click to expand imaging panel</p>
              </div>
            )}

            {/* Question text */}
            <p className="text-[#0B1F4D] font-semibold text-sm sm:text-[15px] leading-relaxed">{q.text}</p>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = answers[currentQ] === i;
                const letters = ['A', 'B', 'C', 'D', 'E'];
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full flex items-start space-x-3 text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-250 cursor-pointer focus:outline-none group ${
                      isSelected
                        ? 'border-accent bg-accent/5 shadow-md shadow-accent/10'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all duration-250 ${isSelected ? 'bg-accent text-[#050E24]' : 'bg-white border border-slate-200 text-slate-500 group-hover:border-slate-300'}`}>
                      {letters[i]}
                    </span>
                    <span className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-[#0B1F4D] font-semibold' : 'text-slate-600'}`}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={toggleMark}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer border ${marked[currentQ] ? 'bg-amber-400 text-[#050E24] border-amber-400' : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600'}`}
              >
                <span>🔖</span><span>{marked[currentQ] ? 'Unmark' : 'Mark for Review'}</span>
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                disabled={currentQ === 0}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                <span>Previous</span>
              </button>
              {currentQ < TOTAL - 1 ? (
                <button
                  onClick={() => setCurrentQ(q => Math.min(TOTAL - 1, q + 1))}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#0B1F4D] text-white hover:bg-[#0a1a42] transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <span>Save & Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <span>Submit Test</span>
                </button>
              )}
            </div>
          </div>

          {/* Auto-save status */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] text-slate-400 font-medium shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-emerald-500 rounded-full" />
              <span>Connected</span>
            </div>
          </div>
        </div>

        {/* Question navigator sidebar */}
        <div className={`${navOpen ? 'w-52 shrink-0' : 'w-10 shrink-0'} hidden sm:block sticky top-20 transition-all duration-300`}>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              {navOpen && <h4 className="text-[#0B1F4D] font-black text-[10px] uppercase tracking-widest">Navigator</h4>}
              <button onClick={() => setNavOpen(o => !o)} className="ml-auto text-slate-400 hover:text-[#0B1F4D] transition-colors cursor-pointer focus:outline-none p-0.5">
                <svg className={`w-3.5 h-3.5 transition-transform ${navOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            {navOpen && (
              <div className="p-3 space-y-3">
                {/* Legend */}
                <div className="space-y-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  {[
                    { color: 'bg-[#0B1F4D]', label: 'Current' },
                    { color: 'bg-emerald-500', label: 'Answered' },
                    { color: 'bg-amber-400', label: 'For Review' },
                    { color: 'bg-slate-200', label: 'Not Answered' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center space-x-2">
                      <span className={`h-3 w-3 rounded ${l.color}`} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
                {/* Grid */}
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: TOTAL }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={`h-8 w-full rounded-lg text-[10px] font-black transition-all duration-200 cursor-pointer focus:outline-none hover:scale-110 ${getNavColor(i)}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-[9.5px] uppercase tracking-widest py-2.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer shadow-sm shadow-rose-500/20"
                >
                  Submit Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 3 — Results dashboard ─────────────────────────────────────────────
function ResultsDashboard({ test, result, onRetake, onBack }) {
  const { answers, timeTaken, total } = result;
  const TOTAL = Math.min(total, QUESTIONS.length);

  let correct = 0, wrong = 0;
  Object.entries(answers).forEach(([idx, chosen]) => {
    if (QUESTIONS[+idx]?.correct === chosen) correct++;
    else wrong++;
  });
  const skipped = TOTAL - correct - wrong;
  const score = correct - (wrong * 0.25);
  const pct = Math.round((score / TOTAL) * 100);
  const rank = pct >= 85 ? 'Distinction' : pct >= 70 ? 'Pass' : pct >= 50 ? 'Borderline' : 'Below Pass';
  const rankColor = { Distinction: 'text-emerald-600', Pass: 'text-blue-600', Borderline: 'text-amber-600', 'Below Pass': 'text-rose-600' }[rank];

  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQ, setReviewQ] = useState(0);

  const topicPerf = QUESTIONS.slice(0, TOTAL).reduce((acc, q, i) => {
    const t = q.topic;
    if (!acc[t]) acc[t] = { correct: 0, total: 0 };
    acc[t].total++;
    if (answers[i] === q.correct) acc[t].correct++;
    return acc;
  }, {});

  if (reviewMode) {
    const rq = QUESTIONS[reviewQ];
    const chosen = answers[reviewQ];
    const isCorrect = chosen === rq.correct;
    return (
      <div className="space-y-4 animate-in fade-in duration-400">
        <div className="flex items-center justify-between">
          <button onClick={() => setReviewMode(false)} className="flex items-center space-x-2 text-slate-500 hover:text-[#0B1F4D] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors focus:outline-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span>Back to Results</span>
          </button>
          <span className="text-slate-500 font-black text-xs">Q{reviewQ + 1} of {TOTAL}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <span className="bg-[#0B1F4D] text-white font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-widest">Q{reviewQ + 1}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded">{rq.type}</span>
            <DiffBadge level={rq.difficulty} />
          </div>
          <p className="text-[#0B1F4D] font-semibold text-sm leading-relaxed">{rq.text}</p>
          <div className="space-y-2.5">
            {rq.options.map((opt, i) => {
              const isAnswer = i === rq.correct;
              const isChosen = i === chosen;
              return (
                <div key={i} className={`flex items-start space-x-3 px-4 py-3 rounded-2xl border-2 ${isAnswer ? 'border-emerald-400 bg-emerald-50' : isChosen && !isAnswer ? 'border-rose-400 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}>
                  <span className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isAnswer ? 'bg-emerald-500 text-white' : isChosen ? 'bg-rose-500 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                    {['A', 'B', 'C', 'D', 'E'][i]}
                  </span>
                  <span className={`text-sm font-medium leading-relaxed ${isAnswer ? 'text-emerald-700 font-semibold' : isChosen ? 'text-rose-600' : 'text-slate-500'}`}>{opt}</span>
                  {isAnswer && <span className="ml-auto text-emerald-600 font-black text-[9px] shrink-0">✓ Correct</span>}
                  {isChosen && !isAnswer && <span className="ml-auto text-rose-500 font-black text-[9px] shrink-0">✗ Wrong</span>}
                </div>
              );
            })}
          </div>
          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-1.5">
            <h5 className="text-blue-700 font-black text-xs uppercase tracking-wide flex items-center space-x-1.5"><span>💡</span><span>Explanation</span></h5>
            <p className="text-blue-700 text-xs font-light leading-relaxed">{rq.explanation}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setReviewQ(q => Math.max(0, q - 1))} disabled={reviewQ === 0} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95">Previous</button>
            <button onClick={() => setReviewQ(q => Math.min(TOTAL - 1, q + 1))} disabled={reviewQ === TOTAL - 1} className="flex-1 bg-[#0B1F4D] text-white hover:bg-[#0a1a42] font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95">Next</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Score hero */}
      <div className="relative bg-gradient-to-br from-[#030919] via-[#0B1F4D] to-[#0A1733] rounded-3xl p-6 sm:p-8 overflow-hidden border border-accent/15 shadow-2xl text-center">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/6 rounded-full blur-[80px]" />
        <div className="relative z-10 space-y-4">
          <div className="text-5xl">🎓</div>
          <div>
            <div className="text-[10px] text-accent font-black uppercase tracking-[0.25em] mb-2">Exam Complete</div>
            <h2 className="text-white font-black text-3xl sm:text-4xl">{test.title}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            <div className="text-center">
              <div className={`font-black text-5xl ${pct >= 70 ? 'text-accent' : 'text-rose-400'}`}>{pct}%</div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Score</div>
            </div>
            <div className="text-center">
              <div className={`font-black text-3xl ${rankColor}`}>{rank}</div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Grade</div>
            </div>
            <div className="text-center">
              <div className="font-black text-3xl text-white">{fmtTime(timeTaken)}</div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Time Taken</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Correct', value: correct, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Wrong', value: wrong, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Skipped', value: skipped, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Net Score', value: score.toFixed(1), color: 'text-accent', bg: 'bg-accent/5 border-accent/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <div className={`${s.color} font-black text-3xl`}>{s.value}</div>
            <div className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Performance bar chart by topic */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-[#0B1F4D] font-black text-base uppercase tracking-wide">Subject Performance Analytics</h3>
        <div className="space-y-3">
          {Object.entries(topicPerf).map(([topic, data]) => {
            const tPct = Math.round((data.correct / data.total) * 100);
            return (
              <div key={topic} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-600">{topic}</span>
                  <span className={tPct >= 70 ? 'text-emerald-600' : tPct >= 50 ? 'text-amber-600' : 'text-rose-500'}>{tPct}% ({data.correct}/{data.total})</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${tPct >= 70 ? 'bg-emerald-500' : tPct >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`}
                    style={{ width: `${tPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement suggestions */}
      <div className="bg-gradient-to-br from-[#030919] to-[#0B1F4D] rounded-3xl p-5 sm:p-6 border border-accent/15 shadow-xl space-y-4">
        <h3 className="text-white font-black text-base uppercase tracking-wide">Performance Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(topicPerf).map(([topic, data]) => {
            const tPct = Math.round((data.correct / data.total) * 100);
            const isStrong = tPct >= 70;
            return (
              <div key={topic} className={`rounded-2xl p-4 border ${isStrong ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-rose-500/10 border-rose-500/25'}`}>
                <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isStrong ? 'text-emerald-400' : 'text-rose-400'}`}>{isStrong ? '✓ Strong Area' : '⚠ Needs Work'}</div>
                <div className="text-white font-black text-xs">{topic}</div>
                <div className={`text-[10px] font-medium mt-0.5 ${isStrong ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {isStrong ? `Excellent – ${tPct}% accuracy` : `Practice more – only ${tPct}% accuracy`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setReviewMode(true)} className="flex-1 min-w-[140px] bg-[#0B1F4D] hover:bg-[#0a1a42] text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer">Review Answers</button>
        <button onClick={onRetake} className="flex-1 min-w-[140px] bg-accent hover:bg-[#A07C2E] text-[#050E24] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer shadow-md shadow-accent/20">Retake Test</button>
        <button onClick={onBack} className="flex-1 min-w-[140px] border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer">Back to Tests</button>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export function McqTestsTab({ MCQ_TESTS }) {
  const [phase, setPhase] = useState('catalog'); // catalog | brief | exam | result
  const [selectedTest, setSelectedTest] = useState(null);
  const [examResult, setExamResult] = useState(null);

  const handleStart = (test) => { setSelectedTest(test); setPhase('brief'); };
  const handleBegin = () => setPhase('exam');
  const handleSubmit = (result) => { setExamResult(result); setPhase('result'); };
  const handleRetake = () => { setExamResult(null); setPhase('brief'); };
  const handleBack = () => { setSelectedTest(null); setExamResult(null); setPhase('catalog'); };

  return (
    <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {phase === 'catalog' && <TestCatalog onStart={handleStart} />}
      {phase === 'brief' && <TestBriefing test={selectedTest} onBegin={handleBegin} onBack={handleBack} />}
      {phase === 'exam' && <ActiveExam test={selectedTest} onSubmit={handleSubmit} />}
      {phase === 'result' && <ResultsDashboard test={selectedTest} result={examResult} onRetake={handleRetake} onBack={handleBack} />}
    </div>
  );
}

export default McqTestsTab;
