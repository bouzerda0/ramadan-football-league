import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { ChevronDown, Moon, Star, Clock } from 'lucide-react';
import type { Team } from '@/types';

interface StarProps {
  top: string;
  left: string;
  width: string;
  height: string;
  animationDelay: string;
}

const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function Hero() {
  const { t, dir } = useLanguage();
  const { config } = useSiteConfig();
  const { timeToIftar } = usePrayerTimes();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stars] = useState<StarProps[]>(() =>
    [...Array(20)].map(() => ({
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 100}%`,
      width: `${4 + Math.random() * 8}px`,
      height: `${4 + Math.random() * 8}px`,
      animationDelay: `${Math.random() * 2}s`,
    }))
  );
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    console.log('Hero: Mounting');
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams');
        console.log('Hero: Fetch Status', res.status);
        if (res.ok) {
          const json = await res.json();
          const data = Array.isArray(json) ? json : (json.data || []);
          console.log('Hero: Data received', data);

          if (!Array.isArray(data)) {
            console.error('Hero: Data is not an array', data);
            throw new Error('Data is not an array');
          }

          const mappedTeams: Team[] = data.map((t, index) => ({
            id: t.id,
            name: t.teamName,
            shortName: t.teamName ? t.teamName.substring(0, 3).toUpperCase() : 'UNK',
            logo: t.logoPath || '',
            cohort: 'Cohort ' + String.fromCharCode(65 + index), // A, B, C...
            captain: t.captainName,
            motto: '',
            colors: {
              primary: COLORS[index % COLORS.length] || '#1F2937',
              secondary: '#F4F6FA'
            },
            squad: [],
            stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [], ramadanSpirit: 0 },
            qrCode: ''
          }));

          // Fill with placeholders up to 6
          const displayTeams = [...mappedTeams];
          while (displayTeams.length < 6) {
            const i = displayTeams.length;
            displayTeams.push({
              id: `placeholder-${i}`,
              name: `Team ${i + 1}`,
              shortName: `TM${i + 1}`,
              logo: '',
              cohort: '',
              captain: '',
              motto: '',
              colors: { primary: '#1F2937', secondary: '#9CA3AF' }, // Gray
              squad: [],
              stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [], ramadanSpirit: 0 },
              qrCode: ''
            });
          }
          console.log('Hero: Setting teams', displayTeams);
          setTeams(displayTeams);
        } else {
          throw new Error('Fetch failed');
        }
      } catch (err) {
        console.error("Hero: Failed to fetch teams", err);
        // Fallback
        const placeholders = Array(6).fill(null).map((_, i) => ({
          id: `placeholder-${i}`,
          name: `Team ${i + 1}`,
          shortName: `TM${i + 1}`,
          logo: '',
          cohort: '',
          captain: '',
          motto: '',
          colors: { primary: '#1F2937', secondary: '#9CA3AF' },
          squad: [],
          stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [], ramadanSpirit: 0 },
          qrCode: ''
        })) as Team[];
        setTeams(placeholders);
      }
      setIsLoaded(true);
    };

    fetchTeams();
  }, []);

  const nextMatch = {
    home: teams[0],
    away: teams[3],
    date: 'April 3, 2026',
    time: '19:30',
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-[#0B0F1C] via-[#0D1A12] to-[#0B0F1C] transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
        />
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 islamic-pattern opacity-50" />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0F1C]/50 to-[#0B0F1C]" />
      </div>

      {/* Animated Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star: StarProps, i: number) => (
          <Star
            key={i}
            className={`absolute text-[#D4A018] star-twinkle transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              top: star.top,
              left: star.left,
              width: star.width,
              height: star.height,
              animationDelay: star.animationDelay,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      {/* Crescent Moon */}
      <div
        className={`absolute top-16 right-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
      >
        <div className="relative">
          <Moon className="w-24 h-24 text-[#D4A018] crescent-glow" fill="currentColor" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen section-padding">
        {/* Tournament Bracket Visualization */}
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A018]/10 border border-[#D4A018]/30 mb-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <Star className="w-4 h-4 text-[#D4A018]" fill="currentColor" />
              <span className="text-sm font-ui text-[#D4A018]">Zone 01 Oujda 202</span>
              <Star className="w-4 h-4 text-[#D4A018]" fill="currentColor" />
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12">
            <h1
              className={`font-display font-black text-[#F4F6FA] transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            >

              <span className="block text-hero tracking-tight">{config.heroTitle1 || t('hero.ramadan')}</span>
              <span className="block text-hero text-gold-gradient tracking-tight">{config.heroTitle2 || t('hero.football')}</span>
              <span className="block text-hero tracking-tight">{config.heroTitle3 || t('hero.league')}</span>
            </h1>
            <p
              className={`mt-4 text-lg text-[#A9B3C7] font-ui transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              {config.heroSubtitle || t('hero.subtitle')}
            </p>
          </div>

          {/* Tournament Bracket */}
          <div
            className={`relative mb-12 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Left Teams */}
              <div className="flex flex-col gap-3">
                {teams.slice(0, 3).map((team: Team, i: number) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#141B2D]/80 border border-[#D4A018]/20 backdrop-blur-sm"
                    style={{ animationDelay: `${400 + i * 100}ms` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: team.colors.primary, color: team.colors.secondary }}
                    >
                      {team.shortName[0]}
                    </div>
                    <span className="text-sm font-medium text-[#F4F6FA] hidden sm:block">{team.name}</span>
                  </div>
                ))}
              </div>

              {/* Bracket Lines - SVG */}
              <svg
                className="w-24 h-40 hidden md:block"
                viewBox="0 0 100 160"
                fill="none"
              >
                {/* Left lines */}
                <path d="M0 20 H40 V50 H60" stroke="#D4A018" strokeWidth="2" fill="none" className={isLoaded ? 'draw-line' : ''} style={{ animationDelay: '500ms' }} />
                <path d="M0 80 H50" stroke="#D4A018" strokeWidth="2" fill="none" className={isLoaded ? 'draw-line' : ''} style={{ animationDelay: '600ms' }} />
                <path d="M0 140 H40 V110 H60" stroke="#D4A018" strokeWidth="2" fill="none" className={isLoaded ? 'draw-line' : ''} style={{ animationDelay: '700ms' }} />
                {/* Center node */}
                <circle cx="60" cy="80" r="6" fill="#D4A018" className={`transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} style={{ transitionDelay: '800ms' }} />
                {/* Right lines */}
                <path d="M100 20 H60 V50 H40" stroke="#D4A018" strokeWidth="2" fill="none" className={isLoaded ? 'draw-line' : ''} style={{ animationDelay: '500ms' }} />
                <path d="M100 80 H50" stroke="#D4A018" strokeWidth="2" fill="none" className={isLoaded ? 'draw-line' : ''} style={{ animationDelay: '600ms' }} />
                <path d="M100 140 H60 V110 H40" stroke="#D4A018" strokeWidth="2" fill="none" className={isLoaded ? 'draw-line' : ''} style={{ animationDelay: '700ms' }} />
              </svg>

              {/* Center Trophy */}
              <div
                className={`flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A018] to-[#B38914] shadow-lg shadow-[#D4A018]/30 transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                style={{ transitionDelay: '800ms' }}
              >
                <Star className="w-10 h-10 text-[#0B0F1C]" fill="currentColor" />
              </div>

              {/* Right Teams */}
              <div className="flex flex-col gap-3">
                {teams.slice(3, 6).map((team: Team, i: number) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#141B2D]/80 border border-[#D4A018]/20 backdrop-blur-sm"
                    style={{ animationDelay: `${400 + i * 100}ms` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: team.colors.primary, color: team.colors.secondary }}
                    >
                      {team.shortName[0]}
                    </div>
                    <span className="text-sm font-medium text-[#F4F6FA] hidden sm:block">{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Match Card */}
          <div
            className={`max-w-md mx-auto mb-8 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="card-gold rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-ui text-[#D4A018] uppercase tracking-wider">{t('hero.nextMatch')}</span>
                <div className="flex items-center gap-1 text-xs text-[#A9B3C7]">
                  <Clock className="w-3 h-3" />
                  <span>Semi-Final</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2"
                    style={{ backgroundColor: nextMatch.home?.colors?.primary || '#1F2937', color: nextMatch.home?.colors?.secondary || '#9CA3AF' }}
                  >
                    {nextMatch.home?.shortName?.[0] || '?'}
                  </div>
                  <span className="text-sm font-semibold text-[#F4F6FA]">{nextMatch.home?.name || 'TBD'}</span>
                </div>
                <div className="flex flex-col items-center px-4">
                  <span className="text-2xl font-display font-bold text-[#D4A018]">VS</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2"
                    style={{ backgroundColor: nextMatch.away?.colors?.primary || '#1F2937', color: nextMatch.away?.colors?.secondary || '#9CA3AF' }}
                  >
                    {nextMatch.away?.shortName?.[0] || '?'}
                  </div>
                  <span className="text-sm font-semibold text-[#F4F6FA]">{nextMatch.away?.name || 'TBD'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Iftar Countdown */}
          <div
            className={`flex justify-center mb-8 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-[#10B981]/10 border border-[#10B981]/30">
              <Moon className="w-5 h-5 text-[#10B981]" />
              <span className="text-sm text-[#A9B3C7]">Time to Iftar:</span>
              <span className="text-lg font-mono font-bold text-[#10B981]">{timeToIftar}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <a href="#schedule" className="btn-primary flex items-center gap-2">
              {t('hero.cta')}
              <ChevronDown className="w-4 h-4" />
            </a>
            <span className="text-sm text-[#A9B3C7]">{t('hero.meta')}</span>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0F1C] to-transparent" />
    </section>
  );
}
