import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Camera, ImageIcon } from 'lucide-react';

export default function Gallery() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  // Placeholder gallery items - in production these would be actual images
  const galleryItems = [
    { 
      id: 1, 
      title: 'Opening Match Ceremony', 
      date: 'March 28, 2026',
      description: 'The tournament kicks off with an exciting opening ceremony under the lights.',
      color: '#D4A018'
    },
    { 
      id: 2, 
      title: 'Epic Goal Celebration', 
      date: 'March 30, 2026',
      description: 'Al-Mountakhab celebrates a stunning late equalizer.',
      color: '#10B981'
    },
    { 
      id: 3, 
      title: 'Sportsmanship Moment', 
      date: 'March 31, 2026',
      description: 'Players from both teams shake hands after an intense match.',
      color: '#3B82F6'
    },
    { 
      id: 4, 
      title: 'Night Pitch Atmosphere', 
      date: 'April 1, 2026',
      description: 'The beautiful lights of Zone 01 Oujda pitch at night.',
      color: '#8B5CF6'
    },
    { 
      id: 5, 
      title: 'Team Huddle', 
      date: 'March 29, 2026',
      description: 'Les Aigles strategizing before their crucial match.',
      color: '#EF4444'
    },
    { 
      id: 6, 
      title: 'Fan Support', 
      date: 'April 2, 2026',
      description: 'Amazing crowd support from all cohorts.',
      color: '#F59E0B'
    },
  ];

  return (
    <section
      ref={ref}
      id="gallery"
      className="relative w-full py-20 bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1C] via-[#141B2D]/30 to-[#0B0F1C]" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div 
            className={`mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-8 h-8 text-[#D4A018]" />
              <h2 className="text-section font-display font-black text-[#F4F6FA]">
                {t('gallery.title')}
              </h2>
            </div>
            <p className="text-[#A9B3C7] text-lg">{t('gallery.subtitle')}</p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl bg-[#141B2D] card-hover transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                {/* Image Placeholder */}
                <div 
                  className="aspect-[4/3] relative overflow-hidden"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}30` }}
                    >
                      <ImageIcon className="w-10 h-10" style={{ color: item.color }} />
                    </div>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1C] via-transparent to-transparent opacity-60" />
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B0F1C]/80 backdrop-blur-sm">
                    <span className="text-xs text-[#F4F6FA]">{item.date}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-display font-bold text-[#F4F6FA] mb-2 group-hover:text-[#D4A018] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#A9B3C7] line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Border Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#D4A018]/30 transition-colors pointer-events-none"
                />
              </div>
            ))}
          </div>

          {/* Upload CTA */}
          <div 
            className={`mt-12 text-center transition-all duration-700 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-[#A9B3C7] mb-4">Have photos from the matches?</p>
            <button className="btn-secondary inline-flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Upload Your Photos
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
