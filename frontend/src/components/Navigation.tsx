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
      setIsScrolled(window.scrollY > 50);
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
          ? 'bg-[var(--rl-navy)]/80 backdrop-blur-xl border-b border-[var(--rl-gold)]/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-2'
          : 'bg-transparent py-6'
          }`}
        dir={dir}
      >
        <div className="section-padding">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[var(--rl-gold)] to-[var(--rl-gold-dark)] flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_20px_var(--rl-gold)]/30">
                {config.logoPath ? (
                  <img src={config.logoPath} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[var(--rl-navy)]" />
                )}
              </div>
              <div className="text-left block ml-1 md:ml-0">
                <span className="font-display font-black text-white text-sm sm:text-lg tracking-tight uppercase leading-none block group-hover:text-[var(--rl-gold)] transition-colors">
                  {config.title}
                </span>
                <span className="block text-[8px] sm:text-[10px] font-bold text-[var(--rl-gold)] tracking-widest uppercase mt-0.5">{config.subtitle}</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-[var(--rl-navy-light)]/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/5">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(link.href)}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[var(--rl-gray)] hover:text-white transition-all rounded-full hover:bg-white/5 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--rl-navy-light)] border border-white/5 text-[var(--rl-gray)] hover:text-[var(--rl-gold)] hover:border-[var(--rl-gold)]/30 transition-all font-mono text-xs uppercase group"
              >
                <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>{language}</span>
              </button>

              {/* Register CTA - Desktop */}
              <button
                onClick={() => navigate('/register')}
                className="hidden md:flex btn-primary text-xs py-2.5 px-5 shadow-lg shadow-[var(--rl-gold)]/20"
              >
                {t('nav.register')}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl bg-[var(--rl-navy-light)] border border-white/5 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
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
          className="absolute inset-0 bg-[var(--rl-navy)]/95 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={`absolute top-24 left-0 right-0 section-padding transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
            }`}
        >
          <div className="card-gold rounded-3xl p-6 space-y-2 border border-[var(--rl-gold)]/20 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(link.href)}
                className="w-full text-left px-5 py-4 text-white hover:text-[var(--rl-gold)] hover:bg-[var(--rl-navy-light)] rounded-xl transition-all font-display font-bold uppercase tracking-wide text-lg flex items-center justify-between group"
              >
                {link.label}
                <span className="w-2 h-2 rounded-full bg-[var(--rl-gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            <div className="pt-6 mt-2 border-t border-white/10">
              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}
                className="btn-primary w-full text-center block py-4 text-sm tracking-widest"
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
