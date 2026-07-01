import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import axiosInstance from '../../services/axiosInstance';
import { 
  CONTACT_EMAIL, 
  CONTACT_PHONE, 
  CONTACT_ADDRESS 
} from '../../config/constants';

export default function ContactSection() {
  // Contact Form Submission Mock state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setIsSubmitting(true);
      try {
        const response = await axiosInstance.post('/enquiries', {
          name: contactName,
          email: contactEmail,
          message: contactMessage
        });
        
        if (response.data.success) {
          setContactSubmitted(true);
          setTimeout(() => {
            setContactSubmitted(false);
            setContactName('');
            setContactEmail('');
            setContactMessage('');
          }, 3500);
        }
      } catch (error) {
        console.error("Failed to submit enquiry:", error);
        alert("Failed to send message. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section id="contact" className="relative bg-gradient-to-b from-[#0B1F4D] to-[#030919] border-t border-[#0F224D]/60 py-24 overflow-hidden text-white">
      
      {/* Visual background glows to represent gold clinical ambient light */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Header - Perfect Gold and Navy Blue typography pairing */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
            <span>✨</span> 12. ACADEMIC ENQUIRIES
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
            GET IN TOUCH WITH <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">US</span>
          </h3>
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
            Have questions regarding syllabus registrations, batch schedules, or institutional rates? Reach our medical administration team.
          </p>
        </div>

        {/* Alignment Grid - Standardized Heights, Premium Gold Borders, and Navy Blue Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Contact Form Panel - Deep Navy Blue with Gold Highlights */}
          <div className="lg:col-span-7 bg-[#0A1733]/90 backdrop-blur-md border border-accent/20 hover:border-accent/40 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between transition-all duration-300">
            <div>
              <h4 className="text-accent font-extrabold text-sm tracking-wider uppercase mb-6 flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                ADMISSIONS ENGAGEMENT PORTAL
              </h4>
              
              {contactSubmitted ? (
                <div className="bg-accent/10 border border-accent/30 text-accent rounded-2xl p-10 text-center space-y-4 my-auto">
                  <svg className="w-16 h-16 text-accent mx-auto animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-white font-bold text-xl uppercase tracking-wider">ENQUIRY TRANSMITTED SUCCESSFULLY</h4>
                  <p className="text-slate-300 text-xs max-w-sm mx-auto leading-relaxed">
                    Thank you for contacting the Academy. An admissions manager will review your submission and connect within 24 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 text-[10px] font-bold tracking-wider uppercase mb-2">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Dr. Alexander Wright"
                          className="w-full bg-[#0F224A] text-white border border-slate-700/80 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:bg-[#0F224A]/60 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-[10px] font-bold tracking-wider uppercase mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="wright@medical.org"
                          className="w-full bg-[#0F224A] text-white border border-slate-700/80 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:bg-[#0F224A]/60 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-[10px] font-bold tracking-wider uppercase mb-2">Your Enquiry Message</label>
                    <textarea
                      required
                      rows="5"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Draft your diagnostic academic enquiries or institutional group request parameters..."
                      className="w-full bg-[#0F224A] text-white border border-slate-700/80 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:bg-[#0F224A]/60 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="secondary" 
                    className="w-full py-4 tracking-widest text-xs font-bold uppercase shadow-lg shadow-accent/25 hover:shadow-accent/40 rounded-xl hover:scale-[1.01] transition-all duration-300"
                  >
                    TRANSMIT SECURE ENQUIRY
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right Contacts & Map Column - Matching Navy Blue & Gold styling */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            
            {/* Contact channels card */}
            <div className="bg-[#0A1733]/90 backdrop-blur-md border border-accent/20 hover:border-accent/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex-grow flex flex-col justify-center transition-all duration-300">
              <h4 className="text-accent text-sm font-extrabold tracking-wider uppercase border-b border-accent/20 pb-3 mb-5">
                OFFICIAL ACADEMIC CHANNELS
              </h4>
              
              <div className="space-y-6">
                
                {/* Channel 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2.5 bg-accent/15 border border-accent/30 text-accent rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs uppercase tracking-wider">Head Office Address</div>
                    <div className="text-slate-300 text-xs mt-1 leading-relaxed font-light">{CONTACT_ADDRESS}</div>
                  </div>
                </div>

                {/* Channel 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2.5 bg-accent/15 border border-accent/30 text-accent rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs uppercase tracking-wider">Academic Support Email</div>
                    <div className="text-slate-300 text-xs mt-1 font-mono">{CONTACT_EMAIL}</div>
                  </div>
                </div>

                {/* Channel 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2.5 bg-accent/15 border border-accent/30 text-accent rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs uppercase tracking-wider">Administrative Phone</div>
                    <div className="text-slate-300 text-xs mt-1 font-mono">{CONTACT_PHONE}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Map Frame Card - Aligned, Rounded and Highlighted */}
            <div className="bg-[#0A1733]/90 border border-accent/20 hover:border-accent/40 rounded-3xl overflow-hidden aspect-[16/10] relative flex items-center justify-center shadow-2xl group transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#030919] to-primary/20 opacity-70 z-0" />
              <div className="absolute inset-0 bg-[radial-gradient(#C89B3C_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-25 z-0" />
              
              <div className="z-10 text-center space-y-3.5 p-6">
                <span className="text-3xl filter drop-shadow">🗺️</span>
                <h5 className="text-white font-bold text-xs uppercase tracking-widest">Interactive Campus Navigator</h5>
                <p className="text-[10px] text-slate-300 max-w-[240px] mx-auto leading-relaxed font-light">
                  Located adjacent to the prestigious New York City Health & Imaging Wing Campus.
                </p>
                <span className="inline-block text-[9px] text-accent border border-accent/40 bg-[#0F224A]/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider group-hover:bg-accent group-hover:text-white transition-all duration-300 cursor-pointer shadow-md">
                  LAUNCH CLINICAL DIRECTIONS
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
