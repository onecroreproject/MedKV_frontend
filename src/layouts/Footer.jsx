import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAVIGATION_LINKS, BRAND_NAME, CONTACT_EMAIL } from '../config/constants';
import dark_logo from "../assets/dark_logo_transparent.png";
import company_name from "../assets/company_name_transparent.png";
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
              {platformSettings?.general?.tagline || 'Empowering global medical practitioners with premium, clinical and case-based radiology education. Helping you learn, understand, excel, and serve.'}
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
                      f
                    </a>
                  )}
                  {platformSettings?.social?.instagram && (
                    <a href={`https://instagram.com/${platformSettings.social.instagram}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-[#050E24] flex items-center justify-center hover:text-accent transition-colors border border-white/5">
                      <span className="sr-only">Instagram</span>
                      ig
                    </a>
                  )}
                  {platformSettings?.social?.linkedin && (
                    <a href={`https://linkedin.com/company/${platformSettings.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-[#050E24] flex items-center justify-center hover:text-accent transition-colors border border-white/5">
                      <span className="sr-only">LinkedIn</span>
                      in
                    </a>
                  )}
                  {platformSettings?.social?.youtube && (
                    <a href={`https://youtube.com/@${platformSettings.social.youtube}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-[#050E24] flex items-center justify-center hover:text-accent transition-colors border border-white/5">
                      <span className="sr-only">YouTube</span>
                      yt
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
      </div>
    </footer>
  );
}

export default Footer;
