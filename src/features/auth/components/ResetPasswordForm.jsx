import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import darkLogo from '../../../assets/dark_logo_transparent.png';
import companyNameTransparent from '../../../assets/company_name_transparent.png';

export function ResetPasswordForm({ onLoginClick }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your registered academic email address.');
      return;
    }

    setLoading(true);
    // Simulate Academy Password Recovery API
    setTimeout(() => {
      setLoading(false);
      setSuccess(`A secure clinical credential recovery link has been dispatched to: ${email}. Please check your inbox and spam folders.`);
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

      <div className="text-center">
        <h4 className="text-primary font-extrabold text-lg tracking-wide">RESET CREDENTIALS</h4>
        <p className="text-blue-gray text-[11px] font-medium leading-relaxed mt-0.5">
          Provide your registered email address below, and we will send you secure instructions to reset your academy password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs px-4 py-2.5 rounded-lg font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs px-4 py-2.5 rounded-lg font-medium leading-relaxed">
            {success}
          </div>
        )}

        {!success && (
          <div>
            <label className="block text-charcoal text-[11px] font-bold tracking-wider uppercase mb-2">
              Registered Academic Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@radiology.com"
              className="w-full bg-soft-gray border border-slate-200 rounded-lg px-4 py-3 text-primary placeholder-blue-gray/50 text-xs focus:outline-none focus:bg-white focus:border-accent transition-all"
              required
            />
          </div>
        )}

        <div className="pt-2">
          {!success ? (
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 tracking-widest text-xs font-bold uppercase"
              disabled={loading}
            >
              {loading ? 'SENDING RECOVERY EMAIL...' : 'DISPATCH RECOVERY LINK'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onLoginClick}
              className="w-full py-3 tracking-widest text-xs font-bold uppercase"
            >
              RETURN TO LOGIN
            </Button>
          )}
        </div>
      </form>

      <div className="text-center text-xs text-blue-gray pt-2 border-t border-slate-100 mt-2">
        Remembered your credentials?{' '}
        <button
          type="button"
          onClick={onLoginClick}
          className="text-accent hover:underline font-bold cursor-pointer transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
