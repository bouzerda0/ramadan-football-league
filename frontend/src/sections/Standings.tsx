import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Trophy } from 'lucide-react';
import type { Team, BackendTeam } from '@/types';

export default function Standings() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetch('/api/standings')
      .then(res => res.json())
      .then((data: BackendTeam[]) => {
        try {
          if (!Array.isArray(data)) return;
          const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
          const mappedTeams: Team[] = data.map((t, index) => {
            // Handle form field - could be array, string, or undefined
            let formArr: ('W' | 'D' | 'L')[] = [];
            try {
              if (Array.isArray(t.form)) {
                formArr = t.form.filter((f: string) => ['W', 'D', 'L'].includes(f)) as ('W' | 'D' | 'L')[];
              } else if (typeof t.form === 'string' && t.form) {
                formArr = (t.form as string).split(',').filter((f: string) => ['W', 'D', 'L'].includes(f.trim())) as ('W' | 'D' | 'L')[];
              }
            } catch { formArr = []; }

            // API may return 'name' or 'teamName', 'captain' or 'captainName'
            const rawTeam = t as unknown as Record<string, unknown>;
            const teamName = (rawTeam.name as string) || t.teamName || 'Unknown Team';
            const captainName = (rawTeam.captain as string) || t.captainName || '';

            return {
              id: t.id || `team-${index}`,
              name: teamName,
              shortName: teamName ? teamName.substring(0, 3).toUpperCase() : 'UNK',
              logo: t.logoPath || '',
              cohort: 'Cohort ' + String.fromCharCode(65 + index),
              captain: captainName,
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
                form: formArr,
                ramadanSpirit: t.ramadanSpirit || 0
              },
              qrCode: ''
            };
          });

          // Sort by Points, then Goal Difference
          const sorted = mappedTeams.sort((a, b) => {
            if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
            return b.stats.goalDifference - a.stats.goalDifference;
          });
          setTeams(sorted);
        } catch (err) {
          console.error('Standings: Error mapping team data', err);
        }
      })
      .catch(err => console.error('Standings: Fetch error', err));
  }, []);

  return (
    <section
      ref={ref}
      id="standings"
      className="relative w-full py-20 bg-[#0B0F1C]"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1C] via-[#0D1A12]/30 to-[#0B0F1C]" />
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
              <Trophy className="w-8 h-8 text-[#D4A018]" />
              <h2 className="text-section font-display font-black text-[#F4F6FA]">
                {t('standings.title')}
              </h2>
            </div>
            <p className="text-[#A9B3C7] text-lg">{t('standings.subtitle')}</p>
          </div>

          {/* Standings Table */}
          <div
            className={`card-gold rounded-2xl overflow-hidden transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 p-4 bg-[#141B2D] border-b border-[#D4A018]/20 text-xs font-ui font-semibold text-[#A9B3C7] uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4 md:col-span-3">{t('standings.team')}</div>
              <div className="col-span-1 text-center hidden md:block">{t('standings.mp')}</div>
              <div className="col-span-1 text-center">{t('standings.w')}</div>
              <div className="col-span-1 text-center">{t('standings.d')}</div>
              <div className="col-span-1 text-center">{t('standings.l')}</div>
              <div className="col-span-1 text-center hidden md:block">{t('standings.gf')}</div>
              <div className="col-span-1 text-center hidden md:block">{t('standings.ga')}</div>
              <div className="col-span-1 text-center">{t('standings.gd')}</div>
              <div className="col-span-2 md:col-span-1 text-center">{t('standings.pts')}</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#D4A018]/10">
              {teams.length === 0 ? (
                /* Professional empty state with placeholder rows */
                <div className="p-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 p-4 items-center opacity-30">
                      <div className="col-span-1 text-center">
                        <span className="w-6 h-6 rounded-full bg-[#A9B3C7]/10 flex items-center justify-center text-sm text-[#6B7280] mx-auto">{i}</span>
                      </div>
                      <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#A9B3C7]/10 animate-pulse" />
                        <div className="h-4 w-24 bg-[#A9B3C7]/10 rounded animate-pulse" />
                      </div>
                      <div className="col-span-1 text-center hidden md:block text-[#6B7280]">--</div>
                      <div className="col-span-1 text-center text-[#6B7280]">--</div>
                      <div className="col-span-1 text-center text-[#6B7280]">--</div>
                      <div className="col-span-1 text-center text-[#6B7280]">--</div>
                      <div className="col-span-1 text-center hidden md:block text-[#6B7280]">--</div>
                      <div className="col-span-1 text-center hidden md:block text-[#6B7280]">--</div>
                      <div className="col-span-1 text-center text-[#6B7280]">--</div>
                      <div className="col-span-2 md:col-span-1 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-[#A9B3C7]/5 text-[#6B7280]">--</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-center py-6">
                    <p className="text-[#A9B3C7] font-semibold">No standings data yet</p>
                    <p className="text-sm text-[#6B7280] mt-1">Teams will appear here once matches are played</p>
                  </div>
                </div>
              ) : (
                teams.map((team: Team, index: number) => {
                  const gd = team.stats.goalDifference;
                  return (
                    <div
                      key={team.id}
                      className={`grid grid-cols-12 gap-2 p-4 items-center table-row-hover transition-all duration-500 group ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                        } ${index === 0 ? 'bg-[#D4A018]/5' : ''}`}
                      style={{ transitionDelay: `${300 + index * 100}ms` }}
                    >
                      {/* Rank */}
                      <div className="col-span-1 text-center">
                        {index === 0 ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4A018] to-[#B38612] flex items-center justify-center mx-auto shadow-lg shadow-[#D4A018]/20">
                            <Trophy className="w-3.5 h-3.5 text-[#0B0F1C]" />
                          </div>
                        ) : index === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-[#A9B3C7]/20 flex items-center justify-center text-sm font-bold text-[#A9B3C7] inline-flex mx-auto">
                            2
                          </span>
                        ) : index === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-[#B38914]/20 flex items-center justify-center text-sm font-bold text-[#B38914] inline-flex mx-auto">
                            3
                          </span>
                        ) : (
                          <span className="text-sm text-[#6B7280]">{index + 1}</span>
                        )}
                      </div>

                      {/* Team */}
                      <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: team.colors?.primary || '#333' }}
                        >
                          {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : (
                            <span className="text-white">{team.name ? team.name[0] : '?'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${index === 0 ? 'text-[#D4A018]' : 'text-[#F4F6FA]'}`}>{team.name}</p>
                          <p className="text-xs text-[#6B7280] hidden sm:block">{team.cohort}</p>
                        </div>
                      </div>

                      {/* Matches Played */}
                      <div className="col-span-1 text-center hidden md:block text-[#A9B3C7] font-medium">
                        {team.stats.played}
                      </div>

                      {/* Wins */}
                      <div className="col-span-1 text-center text-emerald-400 font-semibold">
                        {team.stats.won}
                      </div>

                      {/* Draws */}
                      <div className="col-span-1 text-center text-amber-400 font-semibold">
                        {team.stats.drawn}
                      </div>

                      {/* Losses */}
                      <div className="col-span-1 text-center text-red-400 font-semibold">
                        {team.stats.lost}
                      </div>

                      {/* Goals For */}
                      <div className="col-span-1 text-center hidden md:block text-[#A9B3C7]">
                        {team.stats.goalsFor}
                      </div>

                      {/* Goals Against */}
                      <div className="col-span-1 text-center hidden md:block text-[#A9B3C7]">
                        {team.stats.goalsAgainst}
                      </div>

                      {/* Goal Difference */}
                      <div className={`col-span-1 text-center font-semibold ${gd > 0 ? 'text-emerald-400' :
                        gd < 0 ? 'text-red-400' : 'text-[#A9B3C7]'
                        }`}>
                        {gd > 0 ? `+${gd}` : gd}
                      </div>

                      {/* Points */}
                      <div className="col-span-2 md:col-span-1 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg font-bold ${index === 0
                            ? 'bg-[#D4A018]/20 text-[#D4A018] shadow-sm shadow-[#D4A018]/10'
                            : 'bg-[#A9B3C7]/10 text-[#F4F6FA]'
                          }`}>
                          {team.stats.points}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
