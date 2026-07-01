import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import darkLogo from '../../../assets/dark_logo_transparent.png';
import companyNameTransparent from '../../../assets/company_name_transparent.png';

export function LoginForm({ onSubmitSuccess, onRegisterClick, onResetClick }) {
  const [role, setRole] = useState('student'); // 'student', 'mentor', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill mock credentials when switching roles for evaluation ease
  useEffect(() => {
    setError('');
    if (role === 'student') {
      setEmail('admin@samreefath.com');
      setPassword('radiology101');
    } else if (role === 'mentor') {
      setEmail('mentor@samreefath.com');
      setPassword('mentor101');
    } else {
      setEmail('sysadmin@samreefath.com');
      setPassword('admin101');
    }
  }, [role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all clinical credentials.');
      return;
    }

    setLoading(true);
    
    // Simulate API authorization response based on role
    setTimeout(() => {
      setLoading(false);
      
      if (role === 'student' && ((email === 'admin@samreefath.com' && password === 'radiology101') || (email.trim() === 'stud' && password === 'stud') || (email.trim() === 'stud@samreefath.com' && password === 'stud'))) {
        if (onSubmitSuccess) {
          onSubmitSuccess({ name: 'Dr. Alex Stone', role: 'Student' });
        }
      } else if (role === 'mentor' && email === 'mentor@samreefath.com' && password === 'mentor101') {
        if (onSubmitSuccess) {
          onSubmitSuccess({ name: 'Dr. Sam Reefath', role: 'Radiology Mentor' });
        }
      } else if (role === 'admin' && email === 'sysadmin@samreefath.com' && password === 'admin101') {
        if (onSubmitSuccess) {
          onSubmitSuccess({ name: 'System Controller', role: 'Academy Admin' });
        }
      } else {
        setError(`Invalid credentials for ${role.toUpperCase()} portal access.`);
      }
    }, 1200);
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

      {/* Sleek Role Switcher Tab Pills */}
      <div className="bg-soft-gray p-1 rounded-xl flex border border-slate-200">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 text-center py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
            role === 'student'
              ? 'bg-primary text-white shadow-md'
              : 'text-blue-gray hover:text-primary'
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole('mentor')}
          className={`flex-1 text-center py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
            role === 'mentor'
              ? 'bg-primary text-white shadow-md'
              : 'text-blue-gray hover:text-primary'
          }`}
        >
          Mentor
        </button>
        <button
          type="button"
          onClick={() => setRole('admin')}
          className={`flex-1 text-center py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
            role === 'admin'
              ? 'bg-primary text-white shadow-md'
              : 'text-blue-gray hover:text-primary'
          }`}
        >
          Admin
        </button>
      </div>

      <div className="text-center">
        <h4 className="text-primary font-extrabold text-base tracking-wide uppercase">
          {role} Access Portal
        </h4>
        <p className="text-blue-gray text-[10.5px] font-medium mt-0.5">
          {role === 'student' && 'Enter your academy email and security key to open your test modules.'}
          {role === 'mentor' && 'Staff portal access to configure board mock questions & clinical schedules.'}
          {role === 'admin' && 'System level access for managing users, courses, site features & data backups.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs px-4 py-2.5 rounded-lg font-medium">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
            Academy Email ({role})
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'student' ? 'student@samreefath.com' : `${role}@samreefath.com`}
            className="w-full bg-soft-gray border border-slate-200 rounded-lg px-4 py-2.5 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-1.5">
            Secure Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-soft-gray border border-slate-200 rounded-lg px-4 py-2.5 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
            required
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium">
          <label className="flex items-center text-blue-gray cursor-pointer select-none">
            <input type="checkbox" className="mr-1.5 accent-accent rounded" />
            Keep me authorized
          </label>
          <button
            type="button"
            onClick={onResetClick}
            className="text-accent hover:underline font-bold cursor-pointer"
          >
            Reset Credentials
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 tracking-widest text-xs font-bold uppercase mt-2"
          disabled={loading}
        >
          {loading ? 'VERIFYING CREDENTIALS...' : 'AUTHORIZE PORTAL ACCESS'}
        </Button>
      </form>

      {/* Show registration link specifically for student role */}
      {role === 'student' && (
        <div className="text-center text-xs text-blue-gray pt-2.5 border-t border-slate-100 mt-2">
          Don't have an academy account?{' '}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-accent hover:underline font-bold cursor-pointer"
          >
            Register here
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginForm;

