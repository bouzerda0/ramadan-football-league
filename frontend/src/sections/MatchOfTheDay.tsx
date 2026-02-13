import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getTeamById } from '@/data/leagueData';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';

export default function MatchOfTheDay() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  const match = {
    home: getTeamById('team1'),
    away: getTeamById('team2'),
    date: 'Tuesday, March 31',
    time: '19:30',
    venue: 'Zone 01 Oujda Pitch',
    stage: 'Semi-Final Preview',
  };

  return (
    <section
      ref={ref}
      id="match-of-day"
      className="relative min-h-screen w-full overflow-hidden bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1A12] via-[#0B0F1C] to-[#141B2D]" />
        <div className="absolute inset-0 islamic-pattern opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen section-padding py-20">
        <div className="w-full max-w-6xl mx-auto">
          {/* Section Header */}
          <div 
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A018]/10 border border-[#D4A018]/30 mb-4">
              <Trophy className="w-4 h-4 text-[#D4A018]" />
              <span className="text-sm font-ui text-[#D4A018]">{match.stage}</span>
            </div>
            <h2 className="text-section font-display font-black text-[#F4F6FA]">
              {t('mod.title')}
            </h2>
          </div>

          {/* Match Card */}
          <div 
            className={`relative transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
            }`}
          >
            <div className="card-gold rounded-3xl p-8 md:p-12 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4A018]/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D4A018]/5 rounded-full translate-x-1/4 translate-y-1/4" />

              <div className="relative">
                {/* Teams Display */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                  {/* Home Team */}
                  <div 
                    className={`flex flex-col items-center transition-all duration-700 delay-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                    }`}
                  >
                    <div 
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black mb-4 shadow-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${match.home?.colors.primary}, ${match.home?.colors.primary}dd)`,
                        color: match.home?.colors.secondary
                      }}
                    >
                      {match.home?.shortName}
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-[#F4F6FA] text-center">
                      {match.home?.name}
                    </h3>
                    <p className="text-sm text-[#A9B3C7]">{match.home?.cohort}</p>
                  </div>

                  {/* VS Badge */}
                  <div 
                    className={`flex flex-col items-center transition-all duration-700 delay-400 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-[#D4A018] flex items-center justify-center shadow-lg shadow-[#D4A018]/30">
                        <span className="text-2xl font-display font-black text-[#0B0F1C]">VS</span>
                      </div>
                      <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-[#D4A018]/30 animate-ping" />
                    </div>
                  </div>

                  {/* Away Team */}
                  <div 
                    className={`flex flex-col items-center transition-all duration-700 delay-500 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                    }`}
                  >
                    <div 
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black mb-4 shadow-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${match.away?.colors.primary}, ${match.away?.colors.primary}dd)`,
                        color: match.away?.colors.secondary
                      }}
                    >
                      {match.away?.shortName}
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-[#F4F6FA] text-center">
                      {match.away?.name}
                    </h3>
                    <p className="text-sm text-[#A9B3C7]">{match.away?.cohort}</p>
                  </div>
                </div>

                {/* Match Details */}
                <div 
                  className={`flex flex-wrap items-center justify-center gap-6 mb-8 transition-all duration-700 delay-600 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B2D]">
                    <Calendar className="w-4 h-4 text-[#D4A018]" />
                    <span className="text-sm text-[#F4F6FA]">{match.date} • {match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B2D]">
                    <MapPin className="w-4 h-4 text-[#D4A018]" />
                    <span className="text-sm text-[#F4F6FA]">{match.venue}</span>
                  </div>
                </div>

                {/* CTA */}
                <div 
                  className={`flex justify-center transition-all duration-700 delay-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <button className="btn-primary flex items-center gap-2 group">
                    {t('mod.details')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Team Stats Comparison */}
          <div 
            className={`grid grid-cols-3 gap-4 mt-8 transition-all duration-700 delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              { label: 'Goals Scored', home: 18, away: 12 },
              { label: 'Clean Sheets', home: 2, away: 1 },
              { label: 'Form', home: 'W-W-D-W', away: 'W-L-D-W' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-[#141B2D]/50">
                <p className="text-xs text-[#A9B3C7] mb-2">{stat.label}</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-lg font-bold text-[#F4F6FA]">{stat.home}</span>
                  <span className="text-xs text-[#6B7280]">vs</span>
                  <span className="text-lg font-bold text-[#F4F6FA]">{stat.away}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
