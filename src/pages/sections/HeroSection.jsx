import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import bannerImg from '../../assets/banner.png';
import { getSettings } from '../../services/settingsService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await getSettings();
        if (res?.success && res.data?.banners) {
          const activeBanners = res.data.banners.filter(b => b.isActive);
          setBanners(activeBanners);
        }
      } catch (err) {
        console.error("Failed to fetch banners", err);
      }
    };
    fetchBanners();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  const hasBanners = banners.length > 0;

  return (
    <section id="home" className="relative bg-[#030919] text-white overflow-hidden min-h-[600px] lg:min-h-[680px]">

      {hasBanners ? (
        // --- CUSTOM BANNERS CAROUSEL ---
        <div className="absolute inset-0 w-full h-full">
          {banners.map((banner, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {/* Background Image (Clickable if there are no buttons configured) */}
              {banner.link && !banner.buttonText && !banner.button2Text ? (
                <a href={banner.link} target={banner.link?.startsWith('http') ? "_blank" : "_self"} rel="noreferrer" className="absolute inset-0 w-full h-full z-0 cursor-pointer block">
                  <img src={banner.imageUrl} alt={banner.title || `Banner ${index + 1}`} className="w-full h-full object-cover object-center" />
                </a>
              ) : (
                <div className="absolute inset-0 w-full h-full z-0">
                  <img src={banner.imageUrl} alt={banner.title || `Banner ${index + 1}`} className="w-full h-full object-cover object-center" />
                </div>
              )}
                
              {/* Text Overlay */}
              {(banner.title || banner.highlightText || banner.description || banner.buttonText || banner.button2Text) && (
                <>
                  {/* Dark gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#030919]/95 via-[#030919]/70 to-transparent pointer-events-none z-10" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-center max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pointer-events-none">
                    <div className="max-w-2xl space-y-6 pt-12 sm:pt-0 pointer-events-auto">
                      
                      {(banner.title || banner.highlightText) && (
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1] text-white pointer-events-none">
                          {banner.title && (
                            <>
                              {banner.title.split('\\n').map((line, i) => (
                                <React.Fragment key={`title-${i}`}>
                                  {line}
                                  {i !== banner.title.split('\\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                              {banner.highlightText && <br />}
                            </>
                          )}
                          
                          {banner.highlightText && (
                            <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">
                              {banner.highlightText.split('\\n').map((line, i) => (
                                <React.Fragment key={`highlight-${i}`}>
                                  {line}
                                  {i !== banner.highlightText.split('\\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </span>
                          )}
                        </h1>
                      )}

                      {banner.description && (
                        <p className="text-slate-300/90 text-sm sm:text-base max-w-xl leading-relaxed font-normal whitespace-pre-wrap pointer-events-none">
                          {banner.description}
                        </p>
                      )}

                      {/* Buttons */}
                      <div className="flex flex-wrap gap-4 pt-2">
                        {banner.buttonText && (
                          <a href={banner.link || '#'} className="w-full sm:w-auto">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-lg shadow-accent/20 hover:scale-102 uppercase">
                              {banner.buttonText}
                            </Button>
                          </a>
                        )}
                        {banner.button2Text && (
                          <a href={banner.button2Link || '#'} className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto !border-accent !text-accent hover:!bg-accent hover:!text-white transition-all duration-300 uppercase">
                              {banner.button2Text}
                            </Button>
                          </a>
                        )}
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {/* Carousel Controls */}
          {banners.length > 1 && (
            <>
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-all">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-all">
                <ChevronRight className="w-8 h-8" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Fades to blend into the dark theme */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#030919] to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030919] to-transparent pointer-events-none z-10" />
        </div>
      ) : (
        // --- DEFAULT HERO (If no banners configured) ---
        <>
          <img
            src={bannerImg}
            alt="Dr. Sam Reefath Radiology Academy Banner"
            className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030919]/95 via-[#030919]/70 to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#030919] to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030919] to-transparent pointer-events-none z-10" />

          {/* Content */}
          <div className="relative z-20 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 sm:pt-32 pb-16 sm:pb-20">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1] text-white">
                ADVANCING RADIOLOGY <br />
                EDUCATION. <br />
                <span className="bg-gradient-to-r from-accent to-[#EED393] bg-clip-text text-transparent">
                  EMPOWERING <br />
                  RADIOLOGISTS.
                </span>
              </h1>
              <p className="text-slate-300/90 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
                Concept-oriented learning with expert guidance for a strong academic foundation and confident clinical practice.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="#courses" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-lg shadow-accent/20 hover:scale-102">
                    EXPLORE COURSES
                  </Button>
                </a>
                <a href="#about" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto !border-accent !text-accent hover:!bg-accent hover:!text-white transition-all duration-300">
                    ABOUT US
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Highlights Strip - Kept in both modes */}
      <div className={`bg-[#030919] ${hasBanners ? 'absolute bottom-0 w-full' : 'border-t border-[#0F224D]/50 py-8 relative'} z-20`}>
        {hasBanners && <div className="absolute inset-0 bg-[#030919]/60 backdrop-blur-md border-t border-[#0F224D]/50 z-0"></div>}
        <div className={`max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 ${hasBanners ? 'py-6' : ''}`}>
          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">EXPERT FACULTY</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">Learn from experienced radiologists</p>
            </div>
          </div>
          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14h6m-6 4h6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">EXAM FOCUSED</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">MDRD, DNB, DMRD, FRCR & more</p>
            </div>
          </div>
          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v10H4V4zm8 10v4m-3 4h6M9 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">CASE BASED LEARNING</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">Real world cases for better understanding</p>
            </div>
          </div>
          <div className="flex space-x-3.5 items-center">
            <div className="text-accent flex-shrink-0">
              <svg className="w-9.5 h-9.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-accent font-bold text-xs tracking-wider uppercase leading-none">FLEXIBLE LEARNING</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal mt-1">Live & recorded sessions at your convenience</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
