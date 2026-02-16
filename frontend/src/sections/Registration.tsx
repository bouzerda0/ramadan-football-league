import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Trophy, Users, Mail, MapPin, Phone, ExternalLink, Send } from 'lucide-react';

export default function Registration() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const navigate = useNavigate();

  const quickLinks = [
    { label: t('nav.matches'), href: '#schedule' },
    { label: t('nav.standings'), href: '#standings' },
    { label: t('nav.stats'), href: '#stats' },
    { label: t('nav.prayerTimes'), href: '#prayer-times' },
  ];

  const contactInfo = [
    { icon: <Mail className="w-4 h-4" />, text: 'zone01.oujda@school.edu.ma' },
    { icon: <Phone className="w-4 h-4" />, text: '+212 536 00 00 00' },
    { icon: <MapPin className="w-4 h-4" />, text: 'UMPO, Oujda, Morocco' },
  ];

  return (
    <section
      ref={ref}
      id="register"
      className="relative w-full py-20 bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1A12] via-[#0B0F1C] to-[#141B2D]" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#D4A018]/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Registration CTA */}
          <div
            className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A018]/10 border border-[#D4A018]/30 mb-6">
              <Users className="w-4 h-4 text-[#D4A018]" />
              <span className="text-sm font-ui text-[#D4A018]">Registration Open</span>
            </div>

            <h2 className="text-section font-display font-black text-[#F4F6FA] mb-4">
              {t('register.title')}
            </h2>
            <p className="text-[#A9B3C7] text-lg mb-8 max-w-2xl mx-auto">
              {t('register.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="btn-primary flex items-center gap-2 group"
              >
                <Send className="w-4 h-4" />
                {t('register.cta')}
              </button>
              <button
                onClick={() => navigate('/teams')}
                className="btn-secondary flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                View Teams
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer
            className={`border-t border-[#D4A018]/20 pt-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A018] flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#0B0F1C]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[#F4F6FA]">UMPO</h3>
                    <p className="text-xs text-[#6B7280]">Ramadan Football League 2026</p>
                  </div>
                </div>
                <p className="text-sm text-[#A9B3C7] mb-4 max-w-sm">
                  The premier school football tournament during Ramadan.
                  Bringing together 6 cohorts in the spirit of competition and sportsmanship.
                </p>

                {/* Contact Info */}
                <div className="space-y-2">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-[#A9B3C7]">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-[#F4F6FA] mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-sm text-[#A9B3C7] hover:text-[#D4A018] transition-colors flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tournament Info */}
              <div>
                <h4 className="font-semibold text-[#F4F6FA] mb-4">Tournament</h4>
                <ul className="space-y-2 text-sm text-[#A9B3C7]">
                  <li>6 Teams</li>
                  <li>Group Stage + Knockout</li>
                  <li>Post-Iftar Matches</li>
                  <li>March 28 - April 5, 2026</li>
                  <li>Oujda, Morocco</li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[#D4A018]/10">
              <p className="text-sm text-[#6B7280]">
                {t('footer.rights')}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#6B7280]">Made with</span>
                <span className="text-[#D4A018]">♥</span>
                <span className="text-xs text-[#6B7280]">for UMPO</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
