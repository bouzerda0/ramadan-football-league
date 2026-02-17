import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Trophy } from 'lucide-react';
import type { Team } from '@/types';

interface BackendTeam {
  id: string;
  name: string;
  group: string;
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
    gf: number;
    ga: number;
  };
}

export default function Standings() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/teams`);

        if (!response.ok) {
          throw new Error('Failed to fetch from Backend');
        }

        const data: BackendTeam[] = await response.json();

        const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

        const mappedTeams: Team[] = data.map((t, index) => ({
          id: t.id,
          name: t.name,
          shortName: t.name.substring(0, 3).toUpperCase(),
          logo: '',
          cohort: `Group ${t.group}`,
          captain: 'Unknown',
          motto: '',
          colors: {
            primary: colors[index % colors.length],
            secondary: '#F4F6FA'
          },
          squad: [],
          stats: {
            played: t.stats.played,
            won: t.stats.won,
            drawn: t.stats.drawn,
            lost: t.stats.lost,
            goalsFor: t.stats.gf,
            goalsAgainst: t.stats.ga,
            goalDifference: t.stats.gf - t.stats.ga,
            points: t.stats.points,
            form: [],
            ramadanSpirit: 80 + Math.floor(Math.random() * 20)
          },
          qrCode: ''
        }));

        const sorted = mappedTeams.sort((a, b) => {
          if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
          return b.stats.goalDifference - a.stats.goalDifference;
        });

        setTeams(sorted);
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  return (
    <section
      ref={ref}
      id="standings"
      className="relative w-full py-20 bg-[#040710]"
      dir={dir}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#0D1321] via-[#040710] to-[#000000]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      <div className="relative z-10 section-padding">
        <div className="max-w-6xl mx-auto">
          <div
            className={`mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-[#FACC15]" />
              <h2 className="text-section font-display font-black text-[#FDFDF8]">
                {t('standings.title') || "League Standings"}
              </h2>
            </div>
            <p className="text-[#94A3B8] text-lg font-ui">{t('standings.subtitle') || "Track the progress of all teams"}</p>
          </div>

          <div
            className={`card-gold rounded-3xl overflow-hidden transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
          >
            <div className="grid grid-cols-12 gap-2 p-6 bg-[#0D1321]/80 border-b border-[#FACC15]/20 text-xs font-bold text-[#FACC15] uppercase tracking-widest">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4 md:col-span-3">Team</div>
              <div className="col-span-1 text-center hidden md:block">MP</div>
              <div className="col-span-1 text-center">W</div>
              <div className="col-span-1 text-center">D</div>
              <div className="col-span-1 text-center">L</div>
              <div className="col-span-1 text-center hidden md:block">GF</div>
              <div className="col-span-1 text-center hidden md:block">GA</div>
              <div className="col-span-1 text-center">GD</div>
              <div className="col-span-2 md:col-span-1 text-center">Pts</div>
            </div>

            <div className="divide-y divide-[#FACC15]/10">
              {loading ? (
                <div className="text-center py-10 text-[#FACC15] animate-pulse">Connecting to server...</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#94A3B8] font-semibold text-lg">No data found</p>
                  <p className="text-sm text-[#475569] mt-2">Check if Backend (main.go) is running</p>
                </div>
              ) : (
                teams.map((team: Team, index: number) => {
                  const gd = team.stats.goalDifference;
                  return (
                    <div
                      key={team.id}
                      className={`grid grid-cols-12 gap-2 p-4 items-center table-row-hover transition-all duration-500 group ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                        } ${index === 0 ? 'bg-[#FACC15]/10' : ''}`}
                      style={{ transitionDelay: `${300 + index * 100}ms` }}
                    >
                      <div className="col-span-1 text-center">
                        {index === 0 ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4A018] to-[#B38612] flex items-center justify-center mx-auto shadow-lg shadow-[#D4A018]/20">
                            <Trophy className="w-3.5 h-3.5 text-[#0B0F1C]" />
                          </div>
                        ) : (
                          <span className="text-sm text-[#6B7280]">{index + 1}</span>
                        )}
                      </div>

                      <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: team.colors?.primary || '#333' }}
                        >
                          <span className="text-white">{team.name ? team.name[0] : '?'}</span>
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${index === 0 ? 'text-[#D4A018]' : 'text-[#F4F6FA]'}`}>{team.name}</p>
                          <p className="text-xs text-[#6B7280] hidden sm:block">{team.cohort}</p>
                        </div>
                      </div>

                      <div className="col-span-1 text-center hidden md:block text-[#A9B3C7] font-medium">{team.stats.played}</div>
                      <div className="col-span-1 text-center text-emerald-400 font-semibold">{team.stats.won}</div>
                      <div className="col-span-1 text-center text-amber-400 font-semibold">{team.stats.drawn}</div>
                      <div className="col-span-1 text-center text-red-400 font-semibold">{team.stats.lost}</div>
                      <div className="col-span-1 text-center hidden md:block text-[#A9B3C7]">{team.stats.goalsFor}</div>
                      <div className="col-span-1 text-center hidden md:block text-[#A9B3C7]">{team.stats.goalsAgainst}</div>

                      <div className={`col-span-1 text-center font-semibold ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-[#A9B3C7]'}`}>
                        {gd > 0 ? `+${gd}` : gd}
                      </div>

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