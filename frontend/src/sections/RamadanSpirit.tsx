import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Heart, HandHeart, Users, Sparkles, Award } from 'lucide-react';
import type { Team, BackendTeam } from '@/types';

export default function RamadanSpirit() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  const [spiritRanking, setSpiritRanking] = useState<Team[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/teams`)
      .then(res => res.json())
      .then((json) => {
        const data: BackendTeam[] = Array.isArray(json) ? json : (json.data || []);
        const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
        const mappedTeams: Team[] = data.map((t, index) => ({
          id: t.id,
          name: t.name,
          shortName: t.name ? t.name.substring(0, 3).toUpperCase() : 'UNK',
          logo: t.logoPath || '',
          cohort: 'Cohort ' + String.fromCharCode(65 + index),
          captain: t.captainName,
          motto: '',
          colors: {
            primary: colors[index % colors.length],
            secondary: '#F4F6FA'
          },
          squad: [],
          stats: {
            played: t.played || 0,
            won: t.won || 0,
            drawn: t.drawn || 0,
            lost: t.lost || 0,
            goalsFor: t.goalsFor || 0,
            goalsAgainst: t.goalsAgainst || 0,
            goalDifference: (t.goalsFor || 0) - (t.goalsAgainst || 0),
            points: t.points || 0,
            form: t.form ? (t.form as ('W' | 'D' | 'L')[]) : [],
            ramadanSpirit: t.ramadanSpirit || 0
          },
          qrCode: ''
        }));

        const sorted = mappedTeams.sort((a, b) => (b.stats.ramadanSpirit || 0) - (a.stats.ramadanSpirit || 0));
        setSpiritRanking(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  const criteria = [
    { icon: <HandHeart className="w-5 h-5" />, label: 'Fair Play', description: 'Respect for opponents and officials' },
    { icon: <Users className="w-5 h-5" />, label: 'Teamwork', description: 'Collaboration and mutual support' },
    { icon: <Heart className="w-5 h-5" />, label: 'Sportsmanship', description: 'Grace in victory and defeat' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'Community', description: 'Positive impact on school spirit' },
  ];

  return (
    <section
      ref={ref}
      id="ramadan-spirit"
      className="relative w-full py-20 bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1A12] via-[#0B0F1C] to-[#141B2D]" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#10B981]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#D4A018]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 mb-4">
              <Heart className="w-4 h-4 text-[#10B981]" fill="currentColor" />
              <span className="text-sm font-ui text-[#10B981]">Special Award</span>
            </div>
            <h2 className="text-section font-display font-black text-[#F4F6FA] mb-4">
              {t('spirit.title')}
            </h2>
            <p className="text-[#A9B3C7] text-lg">{t('spirit.subtitle')}</p>
          </div>

          {/* Criteria Cards */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            {criteria.map((criterion, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[#141B2D]/50 border border-[#10B981]/20 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-3 text-[#10B981]">
                  {criterion.icon}
                </div>
                <h4 className="font-semibold text-[#F4F6FA] mb-1">{criterion.label}</h4>
                <p className="text-xs text-[#6B7280]">{criterion.description}</p>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div
            className={`card-gold rounded-3xl p-8 overflow-hidden transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold text-[#F4F6FA]">Leaderboard</h3>
              <Award className="w-6 h-6 text-[#D4A018]" />
            </div>

            <div className="space-y-4">
              {spiritRanking.map((team, index) => (
                <div
                  key={team.id}
                  className={`relative transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    }`}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141B2D]/50 hover:bg-[#141B2D] transition-all duration-300">
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {index === 0 ? (
                        <div className="w-8 h-8 rounded-full bg-[#D4A018] flex items-center justify-center">
                          <Award className="w-4 h-4 text-[#0B0F1C]" />
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-[#6B7280]">{index + 1}</span>
                      )}
                    </div>

                    {/* Team */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{
                        backgroundColor: team.colors.primary,
                        color: team.colors.secondary
                      }}
                    >
                      {team.shortName}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-[#F4F6FA]">{team.name}</h4>
                      <p className="text-xs text-[#6B7280]">{team.cohort}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="hidden md:block w-48">
                      <div className="h-2 bg-[#0B0F1C] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#10B981] to-[#D4A018] rounded-full transition-all duration-1000"
                          style={{
                            width: isVisible ? `${team.stats.ramadanSpirit || 0}%` : '0%',
                            transitionDelay: `${600 + index * 100}ms`
                          }}
                        />
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-display font-bold text-[#10B981]">
                        {team.stats.ramadanSpirit || 0}
                      </span>
                      <span className="text-xs text-[#6B7280]">/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div
            className={`mt-12 text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <blockquote className="text-xl md:text-2xl font-display italic text-[#A9B3C7] max-w-2xl mx-auto">
              "The true champion is not measured by goals scored, but by the character shown on and off the pitch."
            </blockquote>
            <p className="mt-4 text-sm text-[#6B7280]">— UMPO Philosophy</p>
          </div>
        </div>
      </div>
    </section>
  );
}
