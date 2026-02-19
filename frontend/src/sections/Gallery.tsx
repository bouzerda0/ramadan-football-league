import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Camera, ImageIcon } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Moment {
  id: string;
  imageUrl?: string;
  caption: string;
  createdAt: string;
  isDefault?: boolean;
}

const DEFAULT_MOMENTS: Moment[] = [
  {
    id: 'default-1',
    caption: 'Opening Match Ceremony',
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'default-2',
    caption: 'Epic Goal Celebration',
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'default-3',
    caption: 'Team Huddle',
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'default-4',
    caption: 'Fan Support',
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

export default function Gallery() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const [moments, setMoments] = useState<Moment[]>([]);

  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/moments`);
      if (response.ok) {
        const json = await response.json();
        const fetchedMoments: Moment[] = json.data || [];

        // Merge strategy:
        // 1. Start with fetched moments
        // 2. Fill remaining slots up to 4 with default moments
        const displayMoments = [...fetchedMoments];
        if (displayMoments.length < 4) {
          const defaultsNeeded = 4 - displayMoments.length;
          displayMoments.push(...DEFAULT_MOMENTS.slice(0, defaultsNeeded));
        }

        setMoments(displayMoments);
      } else {
        // Fallback if API fails
        setMoments(DEFAULT_MOMENTS);
      }
    } catch (error) {
      console.error('Failed to fetch moments:', error);
      setMoments(DEFAULT_MOMENTS);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            className={`mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {moments.map((item, index) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl bg-[#141B2D] card-hover transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                {/* Image or Placeholder */}
                <div className="aspect-[4/3] relative overflow-hidden bg-[#141B2D] flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={`${API_URL}${item.imageUrl}`}
                      alt={item.caption}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/141B2D/D4A018?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#D4A018]/30 group-hover:text-[#D4A018] transition-colors">
                      <ImageIcon className="w-12 h-12 mb-2" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1C] via-transparent to-transparent opacity-60" />

                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B0F1C]/80 backdrop-blur-sm">
                    <span className="text-xs text-[#F4F6FA]">{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-sm font-medium text-[#F4F6FA] line-clamp-2">
                    {item.caption}
                  </p>
                  {item.isDefault && (
                    <p className="text-xs text-[#A9B3C7] mt-2 italic">Coming soon</p>
                  )}
                </div>

                {/* Border Effect */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#D4A018]/30 transition-colors pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
