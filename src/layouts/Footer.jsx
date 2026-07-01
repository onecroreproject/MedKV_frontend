import React from 'react';
import { Link } from 'react-router-dom';
import { NAVIGATION_LINKS, BRAND_NAME, CONTACT_EMAIL } from '../config/constants';
import dark_logo from "../assets/dark_logo_transparent.png";
import company_name from "../assets/company_name_transparent.png";
import { usePlatform } from '../context/PlatformContext';

export function Footer() {
  const { platformSettings } = usePlatform();
  return (
    <footer className="bg-[#030919] border-t border-[#0F224D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Brand statement */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src={platformSettings?.general?.logoUrl || dark_logo}
                alt="Platform Logo"
                className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <img
                src={company_name}
                alt="Dr. Sam Reefath Radiology Academy Typography"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="text-blue-gray text-xs leading-relaxed max-w-sm">
              {platformSettings?.general?.tagline || 'Empowering global medical practitioners with premium, clinical and case-based radiology education. Helping you learn, understand, excel, and serve.'}
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
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
          <div className="space-y-4">
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
