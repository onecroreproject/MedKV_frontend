import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAVIGATION_LINKS, BRAND_NAME, CONTACT_EMAIL } from '../config/constants';
import dark_logo from "../assets/dark_logo_transparent.png";
import company_name from "../assets/company_name_transparent.png";
import designed_by_logo from "../assets/designed_by_logo.png";
import { usePlatform } from '../context/PlatformContext';
import { subscribeNewsletter } from '../services/newsletterService';

export function Footer() {
  const { platformSettings } = usePlatform();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await subscribeNewsletter(email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Successfully subscribed!');
        setEmail('');
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="bg-[#030919] border-t border-[#0F224D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Brand statement */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src={platformSettings?.general?.logoUrl || dark_logo}
                alt="Platform Logo"
                className="h-10 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              {platformSettings?.general?.nameLogoUrl ? (
                <img
                  src={platformSettings.general.nameLogoUrl}
                  alt="Platform Typography"
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 hidden sm:block"
                />
              ) : (
                <img
                  src={company_name}
                  alt="Dr. Sam Reefath Radiology Academy Typography"
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 hidden sm:block"
                />
              )}
            </div>
            <p className="text-blue-gray text-xs leading-relaxed max-w-sm">
              {platformSettings?.general?.tagline || 'Empowering global medical practitioners with clinical and case-based radiology education. Helping you learn, understand, excel, and serve.'}
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="col-span-1 space-y-4">
            <h4 className="text-accent text-xs font-bold tracking-widest uppercase">QUICK LINKS</h4>
            <ul className="space-y-2 text-xs text-blue-gray">
              {NAVIGATION_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support info */}
          <div className="col-span-1 space-y-4">
            <h4 className="text-accent text-xs font-bold tracking-widest uppercase">CONTACT US</h4>
            <ul className="space-y-2 text-xs text-blue-gray">
              <li>{platformSettings?.contact?.address || 'Academic Head Office'}</li>
              <li>{platformSettings?.contact?.primaryPhone || 'Radiology & Imaging Center'}</li>
              <li className="text-white font-medium">{platformSettings?.contact?.publicEmail || CONTACT_EMAIL}</li>
              <li className="pt-2">
                <div className="flex items-center space-x-3">
                  {platformSettings?.social?.facebook && (
                    <a href={`https://facebook.com/${platformSettings.social.facebook}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-[#050E24] flex items-center justify-center hover:text-accent transition-colors border border-white/5">
                      <span className="sr-only">Facebook</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  )}
                  {platformSettings?.social?.instagram && (
                    <a href={`https://instagram.com/${platformSettings.social.instagram}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-[#050E24] flex items-center justify-center hover:text-accent transition-colors border border-white/5">
                      <span className="sr-only">Instagram</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                  )}
                  {platformSettings?.social?.linkedin && (
                    <a href={`https://linkedin.com/company/${platformSettings.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-[#050E24] flex items-center justify-center hover:text-accent transition-colors border border-white/5">
                      <span className="sr-only">LinkedIn</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  )}
                  {platformSettings?.social?.youtube && (
                    <a href={`https://youtube.com/@${platformSettings.social.youtube}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-[#050E24] flex items-center justify-center hover:text-accent transition-colors border border-white/5">
                      <span className="sr-only">YouTube</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 7.17c.15-1.5 1.34-2.69 2.84-2.84C8.24 4 12 4 12 4s3.76 0 6.66.33c1.5.15 2.69 1.34 2.84 2.84.33 2.87.33 5.83.33 5.83s0 2.96-.33 5.83c-.15 1.5-1.34 2.69-2.84 2.84C15.76 21 12 21 12 21s-3.76 0-6.66-.33c-1.5-.15-2.69-1.34-2.84-2.84C2 14.79 2 11.83 2 11.83s0-2.96.33-5.83Z"/><path d="m10 15 5-3-5-3z"/></svg>
                    </a>
                  )}
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
            <h4 className="text-accent text-xs font-bold tracking-widest uppercase">STAY UPDATED</h4>
            <p className="text-xs text-blue-gray">Subscribe to our newsletter for the latest medical courses, live classes, and academy news.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2 relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                className={`bg-[#0F224D]/50 text-white text-xs px-4 py-3 rounded-lg outline-none w-full border ${status === 'error' ? 'border-red-500/50 focus:border-red-500/50' : 'border-[#0F224D] focus:border-[#C89B3C]/50'} transition-colors placeholder:text-blue-gray/50`}
                required
                disabled={status === 'loading'}
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="bg-[#C89B3C] text-[#030919] px-4 py-3 rounded-lg text-xs font-bold hover:bg-white transition-colors w-full disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center h-[40px]"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-[#030919] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Subscribe Now'
                )}
              </button>
              
              {/* Status Messages */}
              {status === 'success' && (
                <p className="text-emerald-400 text-[10px] mt-1 absolute -bottom-5 left-0 right-0">{message}</p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-[10px] mt-1 absolute -bottom-5 left-0 right-0">{message}</p>
              )}
            </form>
          </div>
        </div>

        {/* Legal Strip */}
        <div className="mt-12 pt-8 border-t border-[#0F224D]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-gray space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} {platformSettings?.general?.websiteName || BRAND_NAME}. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/policy/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/policy/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/policy/refund" className="hover:text-white">Refund Policy</Link>
          </div>
        </div>
        
        {/* Designed By Badge */}
        <div className="mt-6 flex justify-center items-center text-[10px] text-blue-gray gap-2">
          <span>Designed by</span>
          <img src={designed_by_logo} alt="Designer Logo" className="h-6 w-auto object-contain bg-white px-2 py-0.5 rounded opacity-90 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
