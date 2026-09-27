import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Brain, HeartPulse, Shield, Activity, Share2, 
  Eye, FileSearch, CheckCircle, MessageCircle, Stethoscope, 
  BookOpen, Lightbulb, Target, Laptop, BrainCircuit, Users, 
  Ribbon, Heart, Dna, Scan
} from 'lucide-react';
import { FACULTY_MEMBERS } from '../config/constants';

export default function FacultyProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = FACULTY_MEMBERS.find(f => f.slug === slug);
    if (found) {
      setFaculty(found);
    } else {
      navigate('/');
    }
  }, [slug, navigate]);

  if (!faculty) {
    return (
      <div className="min-h-screen bg-[#050E24] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#C89B3C] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Fallback to simple view for other faculty members
  if (slug !== 'dr-samuel-reefath-j') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <div className="bg-gradient-to-r from-[#050E24] via-[#0A1633] to-[#050E24] pt-12 pb-24 border-b-4 border-[#C89B3C]">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-[#C89B3C] mb-8 font-medium text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="flex items-center gap-8">
              <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center text-[#050E24] font-black text-5xl border-4 border-[#C89B3C]">
                {faculty.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">{faculty.name}</h1>
                <p className="text-xl font-semibold text-[#C89B3C]">{faculty.role}</p>
                <p className="text-gray-300 mt-2">{faculty.specialization}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 -mt-12">
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 text-gray-700 text-lg leading-relaxed">
            {faculty.bio}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* 1. Hero Section */}
      <div className="relative bg-[#050E24] text-white">
        <div className="absolute inset-0 right-0 w-full lg:w-1/2 ml-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#050E24] to-transparent z-10"></div>
          <img src="/assets/radiology_hero_bg.jpg" alt="Abstract Radiology Background" className="w-full h-full object-cover opacity-60" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20 lg:pt-24 lg:pb-32">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-[#C89B3C] mb-12 transition-colors font-medium text-sm bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 backdrop-blur-sm w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-center">
            <div className="flex-shrink-0">
              <div className="h-32 w-32 lg:h-40 lg:w-40 rounded-full bg-white flex items-center justify-center text-[#050E24] font-black text-5xl lg:text-6xl border-[5px] border-[#C89B3C] shadow-[0_0_30px_rgba(200,155,60,0.5)]">
                DS
              </div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">Dr. Samuel Reefath J.</h1>
              <p className="text-xl lg:text-2xl font-bold text-[#C89B3C] uppercase tracking-wider mb-4">
                CO-FOUNDER & ACADEMIC DIRECTOR
              </p>
              <div className="inline-block px-5 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                <p className="text-sm lg:text-base text-gray-200">Onco-Radiology, Advanced Imaging, AI & Data Science</p>
              </div>
            </div>
          </div>
        </div>
        {/* Gold Bottom Border */}
        <div className="h-2 w-full bg-gradient-to-r from-[#C89B3C] via-[#EED393] to-[#C89B3C]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 -mt-10 lg:-mt-16 relative z-30">
        
        {/* 2. Professional Profile */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100 flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:flex w-1/3 bg-slate-100 rounded-xl items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
               <User className="w-24 h-24 opacity-20" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#050E24] mb-6 flex items-center gap-3">
              <span className="bg-[#C89B3C]/10 text-[#C89B3C] p-2 rounded-lg"><User className="w-6 h-6" /></span>
              Professional Profile
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
              <p>Dr. Samuel Reefath J. is a Senior Consultant & Lead Radiologist at MGM Healthcare, Malar–Adyar, Chennai, with extensive clinical experience in advanced diagnostic imaging, oncologic imaging, emergency radiology, cardiovascular imaging and image-guided interventions.</p>
              <p>He has received foundational and advanced training at prestigious national referral institutions including Christian Medical College, Ludhiana, and Tata Memorial Hospital, Mumbai. His practice has been shaped by exposure to complex oncologic imaging, multidisciplinary clinical decision-making and high-volume tertiary/quaternary care.</p>
              <p>Alongside clinical radiology, he has a strong academic interest in advanced CT and MRI, artificial intelligence and machine learning in medical imaging, data science, research and postgraduate radiology education.</p>
            </div>
          </div>
        </div>

        {/* 3. Clinical & Academic Areas of Expertise */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-[#050E24] mb-8 flex items-center gap-3">
            <span className="bg-[#050E24] text-white p-2 rounded-lg"><Shield className="w-6 h-6" /></span>
            Clinical & Academic Areas of Expertise
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 rounded-xl overflow-hidden bg-slate-100 h-64 lg:h-auto relative">
              <img src="/assets/ct_scanner.jpg" alt="CT Scanner" className="w-full h-full object-cover" />
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Neuroimaging', icon: <Brain />, text: 'Acute stroke imaging, Perfusion-based evaluation, Advanced neuroimaging, Functional MRI, Diffusion Tensor Imaging' },
                { title: 'Cardiovascular Imaging', icon: <HeartPulse />, text: 'Coronary CT angiography, Low-dose coronary CT, Ultra-low-contrast coronary imaging, TAVI planning' },
                { title: 'Advanced CT', icon: <Scan />, text: 'Ultra-low-dose CT, Dose-optimized protocols, Advanced reconstruction, Deep-learning-enabled imaging' },
                { title: 'Advanced MRI', icon: <Activity />, text: 'Whole-body diffusion imaging, Myeloma imaging, ZTE MRI, Cartilage mapping, Functional MRI' },
                { title: 'Ultrasound & Interventions', icon: <Activity />, text: 'Contrast-enhanced ultrasound, Advanced abdominal imaging, Peripheral vascular imaging' },
                { title: 'Oncologic Imaging', icon: <Dna />, text: 'Image-guided interventions, Multidisciplinary cancer care, Advanced oncologic imaging' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 text-[#050E24] flex items-center justify-center">
                    {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#050E24] text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Radiology + Artificial Intelligence */}
        <div className="bg-[#050E24] rounded-2xl shadow-xl p-8 lg:p-10 text-white flex flex-col lg:flex-row gap-10 items-center overflow-hidden relative">
          <div className="flex-1 relative z-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="bg-white/10 text-white p-2 rounded-lg"><BrainCircuit className="w-6 h-6" /></span>
              Radiology + Artificial Intelligence
            </h2>
            <div className="space-y-4 text-slate-300 text-[15px] leading-relaxed">
              <p>A distinctive component of Dr. Reefath's academic profile is his interest in the intersection of Radiology, Artificial Intelligence, Machine Learning and Data Science. His scholarly interests include AI-assisted medical imaging and quantitative approaches, with active research engagement and collaboration involving IIT Madras.</p>
              <p>His clinical and academic work explores how advanced reconstruction, deep learning and quantitative imaging can support more efficient, information-rich and clinically meaningful imaging.</p>
            </div>
          </div>
          <div className="w-full lg:w-5/12 h-64 lg:h-80 rounded-xl overflow-hidden relative z-10 border border-white/10">
             <img src="/assets/ai_brain.jpg" alt="AI Brain Scan" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* 5. Research & Innovation */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-[#050E24] mb-4 flex items-center gap-3">
            <span className="bg-[#050E24] text-white p-2 rounded-lg"><Activity className="w-6 h-6" /></span>
            Research & Innovation
          </h2>
          <p className="text-slate-600 mb-8 max-w-3xl">
            At MGM Healthcare, Malar–Adyar, Dr. Reefath has been involved in advanced CT research and clinical initiatives exploring low-dose, low-contrast and AI-assisted imaging.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
              <Users className="w-10 h-10 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-4xl font-black text-blue-700 mb-1">260+</h3>
                <p className="text-xs text-blue-900 leading-tight">Patients reported in an ultra-low-dose CT screening programme</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex items-start gap-4">
              <Ribbon className="w-10 h-10 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-4xl font-black text-green-700 mb-1">54</h3>
                <p className="text-xs text-green-900 leading-tight">Cancers identified before symptoms in the reported cohort</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex items-start gap-4">
              <Heart className="w-10 h-10 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-4xl font-black text-amber-700 mb-1">133</h3>
                <p className="text-xs text-amber-900 leading-tight">Coronary CT examinations reported using approx 15–20 mL iodinated contrast</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 italic">
            These initiatives have explored the combination of low-dose imaging, reduced contrast exposure, deep-learning reconstruction and quantitative radiology, with an emphasis on clinically useful information and patient-centred imaging.
          </p>
        </div>

        {/* 6. Academic & Teaching Profile */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-[#050E24] mb-4 flex items-center gap-3">
            <span className="bg-[#050E24] text-white p-2 rounded-lg"><BookOpen className="w-6 h-6" /></span>
            Academic & Teaching Profile
          </h2>
          <p className="text-slate-600 mb-8 max-w-3xl">
            Dr. Reefath is actively involved in postgraduate radiology teaching, examination-oriented education, FRCR-focused learning and academic mentorship. His teaching philosophy is structured around:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Concept', icon: <Lightbulb />, desc: 'Strong conceptual foundation' },
              { label: 'Pattern', icon: <Scan />, desc: 'Pattern recognition & differentials' },
              { label: 'Reasoning', icon: <Brain />, desc: 'Clinical correlation approach' },
              { label: 'Diagnosis', icon: <Target />, desc: 'Systematic examination' },
              { label: 'Clinical Application', icon: <BookOpen />, desc: 'Emerging tech & AI integration' },
              { label: 'Case-Based Learning', icon: <Users />, desc: 'Structured image interpretation' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 mb-3">
                  {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                </div>
                <h4 className="font-bold text-xs text-[#050E24] mb-1">{item.label}</h4>
                <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. The Dr. Sam Reefath Teaching Approach */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-[#050E24] mb-10 flex items-center gap-3">
            <span className="bg-[#050E24] text-white p-2 rounded-lg"><Target className="w-6 h-6" /></span>
            The Dr. Sam Reefath Teaching Approach
          </h2>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-[#C89B3C] to-blue-200 z-0"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative z-10">
              {[
                { step: '01', title: 'SEE', desc: 'Recognise the dominant imaging finding.', icon: <Eye /> },
                { step: '02', title: 'ANALYSE', desc: 'Break the case down into meaningful features.', icon: <FileSearch /> },
                { step: '03', title: 'CORRELATE', desc: 'Connect imaging with clinical information.', icon: <Share2 /> },
                { step: '04', title: 'REASON', desc: 'Build and narrow the differential diagnosis.', icon: <Brain /> },
                { step: '05', title: 'DIAGNOSE', desc: 'Reach the most appropriate conclusion.', icon: <CheckCircle /> },
                { step: '06', title: 'COMMUNICATE', desc: 'Translate interpretation into clear reporting.', icon: <MessageCircle /> }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-500 text-blue-600 flex items-center justify-center mb-3 shadow-md">
                    {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                  </div>
                  <h4 className="font-black text-xs text-slate-800 mb-1">{item.step} {item.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight px-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Healthcare Leadership */}
        <div className="bg-[#0A1633] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row text-white border border-[#14234b]">
          <div className="p-8 lg:p-10 flex-1">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="bg-white/10 text-white p-2 rounded-lg"><Activity className="w-6 h-6" /></span>
              Healthcare Leadership
            </h2>
            <h3 className="font-bold text-[#C89B3C] mb-4">Proprietor — Radiance Scans & Labs, Chennai</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Alongside his clinical and academic responsibilities, Dr. Samuel Reefath is the Proprietor of Radiance Scans & Labs, Chennai. His involvement in developing a diagnostic imaging centre brings an additional perspective spanning clinical radiology, advanced imaging technology, healthcare delivery, multidisciplinary operations and innovation.
            </p>
          </div>
          <div className="w-full md:w-5/12 h-48 md:h-auto">
            <img src="/assets/radiance_labs.jpg" alt="Radiance Scans & Labs" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* 9. Why Dr. Sam Reefath Radiology Academy? */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-[#050E24] mb-8 flex items-center gap-3">
            <span className="bg-[#050E24] text-white p-2 rounded-lg"><Shield className="w-6 h-6" /></span>
            Why Dr. Sam Reefath Radiology Academy?
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: 'Clinical Experience', desc: 'Learn from a radiologist actively involved in tertiary-care clinical practice.', icon: <Stethoscope /> },
              { title: 'Case-Based Learning', desc: 'Understand imaging through real clinical problems rather than isolated facts.', icon: <FileSearch /> },
              { title: 'Concept-Driven Teaching', desc: 'Build a foundation that helps you approach unfamiliar cases.', icon: <Lightbulb /> },
              { title: 'Exam-Oriented Training', desc: 'Develop a systematic method for postgraduate and FRCR-style learning.', icon: <Target /> },
              { title: 'Modern Radiology', desc: 'Explore advanced CT, MRI, AI, deep learning and quantitative imaging.', icon: <Laptop /> },
              { title: 'Clinical Reasoning', desc: 'Learn to connect imaging findings with the clinical question.', icon: <BrainCircuit /> }
            ].map((item, i) => (
              <div key={i} className="text-center p-4">
                <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                </div>
                <h4 className="font-bold text-sm text-[#050E24] mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed px-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 10. Vision for the Academy */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 border border-slate-100 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#050E24] mb-4 flex items-center gap-3">
              <span className="bg-[#050E24] text-white p-2 rounded-lg"><Eye className="w-6 h-6" /></span>
              Vision for the Academy
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Dr. Sam Reefath Radiology Academy aims to create a structured learning environment where postgraduate radiology students move from memorising to understanding, from seeing images to interpreting them, and from knowing diagnoses to developing a systematic radiological thought process.
            </p>
          </div>
          
          <div className="w-full md:w-1/2 bg-amber-50 p-8 rounded-xl border-l-4 border-[#C89B3C] relative">
            <div className="text-4xl text-[#C89B3C] absolute top-4 left-4 opacity-50 font-serif">"</div>
            <p className="text-[#050E24] font-bold text-lg leading-relaxed text-center italic relative z-10 px-4">
              "Don't just learn what an image looks like.<br/>Learn why it looks that way."
            </p>
            <div className="mt-4 text-center">
              <p className="text-xs font-bold text-[#050E24] uppercase tracking-wider mb-1">DR. SAM REEFATH RADIOLOGY ACADEMY</p>
              <p className="text-[10px] text-slate-500">Learn the Concepts • Decode the Images • Build the Reasoning • Think Like a Radiologist</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
