import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import darkLogo from '../../../assets/dark_logo_transparent.png';
import companyNameTransparent from '../../../assets/company_name_transparent.png';

export function RegisterForm({ onLoginClick, onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('Resident');
  const [course, setCourse] = useState('FRCR Part 1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all clinical and contact fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Verify your security credentials.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters for medical portal security.');
      return;
    }

    setLoading(true);
    // Simulate Academy Registration API
    setTimeout(() => {
      setLoading(false);
      setSuccess('Account created successfully! Authorizing access...');
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess({ name, role: `${specialty} - ${course}` });
        }
      }, 1000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Brand Logos Integration - Unified Navbar Pattern */}
      <div className="flex items-center justify-center space-x-3 bg-[#0B1F4D] p-3.5 rounded-xl border border-white/5 shadow-md shadow-primary/10 mb-1">
        <img
          src={darkLogo}
          alt="Dr. Sam Reefath Radiology Academy Emblem"
          className="h-11 w-auto object-contain"
        />
        <div className="flex flex-col justify-center text-left">
          <img
            src={companyNameTransparent}
            alt="Dr. Sam Reefath Radiology Academy Typography"
            className="h-7 w-auto object-contain"
          />
          <span className="text-accent text-[6px] font-extrabold tracking-[0.16em] uppercase mt-0.5 whitespace-nowrap">
            LEARN • UNDERSTAND • EXCEL • SERVE
          </span>
        </div>
      </div>

      <div className="text-center">
        <h4 className="text-primary font-extrabold text-lg tracking-wide">STUDENT REGISTRATION</h4>
        <p className="text-blue-gray text-[11px] font-medium leading-relaxed mt-0.5">
          Join the academy to access interactive cases, live boards & online test materials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs px-4 py-2.5 rounded-lg font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs px-4 py-2.5 rounded-lg font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
              Full Name (with Title)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. John Doe"
              className="w-full bg-soft-gray border border-slate-200 rounded-lg px-3.5 py-2 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
              Clinical Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.com"
              className="w-full bg-soft-gray border border-slate-200 rounded-lg px-3.5 py-2 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
              Contact Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full bg-soft-gray border border-slate-200 rounded-lg px-3.5 py-2 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
              Clinical Grade / Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-soft-gray border border-slate-200 rounded-lg px-3 py-2 text-primary text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
            >
              <option value="Resident">Radiology Resident</option>
              <option value="Fellow">Clinical Fellow</option>
              <option value="Consultant">Consultant Radiologist</option>
              <option value="Technologist">Imaging Specialist / Tech</option>
              <option value="Student">Medical Student</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
            Select Academy Target Course
          </label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full bg-soft-gray border border-slate-200 rounded-lg px-3 py-2 text-primary text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
          >
            <option value="FRCR Part 1">FRCR Part 1 Prep (Physics & Anatomy)</option>
            <option value="FRCR Part 2A">FRCR Part 2A Prep (Systemic Diagnostics)</option>
            <option value="FRCR Part 2B">FRCR Part 2B Masterclass (Viva & Mock Board)</option>
            <option value="DNB / MDRD">DNB / MDRD Board Prep Suite</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
              Secure Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-soft-gray border border-slate-200 rounded-lg px-3.5 py-2 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-soft-gray border border-slate-200 rounded-lg px-3.5 py-2 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 tracking-widest text-xs font-bold uppercase"
            disabled={loading}
          >
            {loading ? 'REGISTERING ACCOUNT...' : 'SUBMIT REGISTRATION'}
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-blue-gray pt-2 border-t border-slate-100 mt-2">
        Already registered?{' '}
        <button
          type="button"
          onClick={onLoginClick}
          className="text-accent hover:underline font-bold cursor-pointer transition-colors"
        >
          Sign In using clinical credentials
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
