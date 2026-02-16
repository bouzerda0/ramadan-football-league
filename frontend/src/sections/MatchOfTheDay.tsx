import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';
import type { BackendTeam, Match as GlobalMatch } from '@/types';

// Enriched match with full team details
interface EnrichedMatch extends Omit<GlobalMatch, 'homeTeamId' | 'awayTeamId'> {
  homeTeamId: string;
  awayTeamId: string;
  home: {
    teamName: string;
    logoPath: string;
    colors: { primary: string; secondary: string };
    shortName: string;
    cohort: string;
  };
  away: {
    teamName: string;
    logoPath: string;
    colors: { primary: string; secondary: string };
    shortName: string;
    cohort: string;
  };
  stage: string;
}

export default function MatchOfTheDay() {
  const { t, dir } = useLanguage();
  const { config } = useSiteConfig();
  const { ref } = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  const [match, setMatch] = useState<EnrichedMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch(`${API_URL}/api/matches`),
          fetch(`${API_URL}/api/teams`)
        ]);

        if (matchesRes.ok && teamsRes.ok) {
          const matchesJson = await matchesRes.json();
          const teamsJson = await teamsRes.json();
          const matches: GlobalMatch[] = Array.isArray(matchesJson) ? matchesJson : (matchesJson.data || []);
          const teams: BackendTeam[] = Array.isArray(teamsJson) ? teamsJson : (teamsJson.data || []);

          if (matches.length === 0) {
            setMatch(null);
            setLoading(false);
            return;
          }

          let selectedMatch: GlobalMatch | undefined;

          if (config.autoUpdateMatches) {
            const now = new Date();
            const sortedMatches = matches.sort((a, b) => {
              return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
            });

            selectedMatch = sortedMatches.find(m => {
              const matchTime = new Date(`${m.date}T${m.time}`);
              const matchEndTime = new Date(matchTime.getTime() + 2 * 60 * 60 * 1000);
              return matchEndTime > now;
            });

            if (!selectedMatch && sortedMatches.length > 0) {
              selectedMatch = sortedMatches[sortedMatches.length - 1];
            }
          } else if (config.featuredMatchId) {
            selectedMatch = matches.find(m => m.id === config.featuredMatchId);
          }

          if (selectedMatch) {
            const homeTeam = teams.find((t) => t.id === selectedMatch!.homeTeamId);
            const awayTeam = teams.find((t) => t.id === selectedMatch!.awayTeamId);

            if (homeTeam && awayTeam) {
              setMatch({
                ...selectedMatch,
                home: {
                  teamName: homeTeam.teamName || 'Unknown Team',
                  logoPath: homeTeam.logoPath || '',
                  colors: { primary: '#D4A018', secondary: '#F4F6FA' }, // Default gold
                  shortName: homeTeam.teamName ? homeTeam.teamName.substring(0, 3).toUpperCase() : 'HOM',
                  cohort: 'Cohort ' + String.fromCharCode(65 + teams.indexOf(homeTeam)),
                },
                away: {
                  teamName: awayTeam.teamName || 'Unknown Team',
                  logoPath: awayTeam.logoPath || '',
                  colors: { primary: '#3B82F6', secondary: '#ffffff' },
                  shortName: awayTeam.teamName ? awayTeam.teamName.substring(0, 3).toUpperCase() : 'AWY',
                  cohort: 'Cohort 2'
                },
                stage: config.matchStage || 'League Match'
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load match of the day", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);

  }, [config.autoUpdateMatches, config.featuredMatchId, config.matchStage]);

  if (loading) return <div className="min-h-screen bg-[#0B0F1C] flex items-center justify-center text-[#D4A018]">{t('status.loading')} Match...</div>;

  if (!match) {
    return (
      <section className="py-16 text-center">
        <div className="max-w-md mx-auto px-6 py-10 rounded-2xl bg-[#141B2D]/60 border border-[#D4A018]/20">
          <span className="text-4xl mb-4 block">⚽</span>
          <h2 className="text-xl font-display font-bold text-[#F4F6FA] mb-2">No Match Scheduled Today</h2>
          <p className="text-sm text-[#A9B3C7]">Check back later for upcoming matches</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id="match-of-day"
      className="relative min-h-screen w-full overflow-hidden bg-[#0B0F1C]"
      dir={dir}
    >
      {/* ... existing render logic ... */}
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
            className="text-center mb-12"
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
            className="relative"
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
                    className="flex flex-col items-center"
                  >
                    <div
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black mb-4 shadow-xl overflow-hidden bg-[#0B0F1C]"
                      style={{
                        border: `2px solid ${match.home?.colors?.primary || '#D4A018'}`
                      }}
                    >
                      {match.home?.logoPath ? (
                        <img src={match.home.logoPath} alt={match.home.teamName} className="w-full h-full object-cover" />
                      ) : (
                        <span style={{ color: match.home?.colors?.secondary || '#F4F6FA' }}>
                          {match.home?.shortName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-[#F4F6FA] text-center">
                      {match.home?.teamName || 'Home Team'}
                    </h3>
                    <p className="text-sm text-[#A9B3C7]">{match.home?.cohort || 'TBD'}</p>
                  </div>

                  {/* VS Badge */}
                  <div
                    className="flex flex-col items-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-[#D4A018] flex items-center justify-center shadow-lg shadow-[#D4A018]/30">
                        <span className="text-2xl font-display font-black text-[#0B0F1C]">VS</span>
                      </div>
                      {/* Pulse only if relevant */}
                      <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-[#D4A018]/30 animate-ping" />
                    </div>
                  </div>

                  {/* Away Team */}
                  <div
                    className="flex flex-col items-center"
                  >
                    <div
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black mb-4 shadow-xl overflow-hidden bg-[#0B0F1C]"
                      style={{
                        border: `2px solid ${match.away?.colors?.primary || '#3B82F6'}`
                      }}
                    >
                      {match.away?.logoPath ? (
                        <img src={match.away.logoPath} alt={match.away.teamName} className="w-full h-full object-cover" />
                      ) : (
                        <span style={{ color: match.away?.colors?.secondary || '#F4F6FA' }}>
                          {match.away?.shortName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-[#F4F6FA] text-center">
                      {match.away?.teamName || 'Away Team'}
                    </h3>
                    <p className="text-sm text-[#A9B3C7]">{match.away?.cohort || 'TBD'}</p>
                  </div>
                </div>

                {/* Match Details */}
                <div
                  className="flex flex-wrap items-center justify-center gap-6 mb-8"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B2D]">
                    <Calendar className="w-4 h-4 text-[#D4A018]" />
                    <span className="text-sm text-[#F4F6FA]">{match?.date} • {match?.time}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B2D]">
                    <MapPin className="w-4 h-4 text-[#D4A018]" />
                    <span className="text-sm text-[#F4F6FA]">{match?.venue}</span>
                  </div>
                </div>

                {/* CTA */}
                <div
                  className="flex justify-center"
                >
                  <button className="btn-primary flex items-center gap-2 group">
                    {t('mod.details')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
