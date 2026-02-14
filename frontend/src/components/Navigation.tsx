import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Menu, X, Trophy, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const { t, language, setLanguage, dir } = useLanguage();
  const { config } = useSiteConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: "Teams", href: "/teams" },
    { label: t('nav.matches'), href: "/#schedule" },
    { label: t('nav.standings'), href: "/#standings" },
    { label: t('nav.stats'), href: "/#stats" },
    { label: t('nav.prayerTimes'), href: "/#prayer-times" },
  ];

  const toggleLanguage = () => {
    const languages: Array<'en' | 'fr' | 'ar'> = ['en', 'fr', 'ar'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith('/#')) {
      const hash = href.substring(1); // #schedule

      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-[#0B0F1C]/90 backdrop-blur-lg border-b border-[#D4A018]/20'
          : 'bg-transparent'
          }`}
        dir={dir}
      >
        <div className="section-padding">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#D4A018] flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden">
                {config.logoPath ? (
                  <img src={config.logoPath} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#0B0F1C]" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-display font-bold text-[#F4F6FA] text-sm md:text-base block">
                  {config.title}
                </span>
                <span className="block text-[10px] text-[#D4A018]">{config.subtitle}</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(link.href)}
                  className="px-4 py-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors rounded-lg hover:bg-[#141B2D]/50"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#141B2D]/50 text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>

              {/* Register CTA - Desktop */}
              <button
                onClick={() => navigate('/register')}
                className="hidden md:flex btn-primary text-sm py-2 px-4"
              >
                {t('nav.register')}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-lg bg-[#141B2D]/50 flex items-center justify-center text-[#F4F6FA]"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#0B0F1C]/95 backdrop-blur-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={`absolute top-20 left-0 right-0 section-padding transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
            }`}
        >
          <div className="card-gold rounded-2xl p-6 space-y-2">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(link.href)}
                className="w-full text-left px-4 py-3 text-[#F4F6FA] hover:bg-[#141B2D] rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-[#D4A018]/20">
              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}
                className="btn-primary w-full text-center block"
              >
                {t('nav.register')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
