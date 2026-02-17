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
            // Enhanced debugging and resolving logic
            const preloadedHome = (selectedMatch as any).homeTeam;
            const preloadedAway = (selectedMatch as any).awayTeam;
            const listHome = teams.find((t) => String(t.id) === String(selectedMatch!.homeTeamId));
            const listAway = teams.find((t) => String(t.id) === String(selectedMatch!.awayTeamId));
            const homeTeam = (preloadedHome && preloadedHome.name) ? preloadedHome : listHome;
            const awayTeam = (preloadedAway && preloadedAway.name) ? preloadedAway : listAway;

            if (homeTeam || awayTeam) {
              const getSafeName = (team: any) => {
                if (!team) return 'Unknown Team';
                if (team.name) return team.name;
                if (team.teamName) return team.teamName;
                return 'Unknown Team';
              };

              setMatch({
                ...selectedMatch,
                home: {
                  teamName: getSafeName(homeTeam),
                  logoPath: homeTeam?.logoPath || '',
                  colors: { primary: homeTeam?.primaryColor || '#D4AF37', secondary: homeTeam?.secondaryColor || '#F8FAFC' },
                  shortName: homeTeam?.shortName || (homeTeam?.name || 'HOM').substring(0, 3).toUpperCase(),
                  cohort: homeTeam?.cohort || 'Cohort A',
                },
                away: {
                  teamName: getSafeName(awayTeam),
                  logoPath: awayTeam?.logoPath || '',
                  colors: { primary: awayTeam?.primaryColor || '#10B981', secondary: awayTeam?.secondaryColor || '#ffffff' },
                  shortName: awayTeam?.shortName || (awayTeam?.name || 'AWY').substring(0, 3).toUpperCase(),
                  cohort: awayTeam?.cohort || 'Cohort B'
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

  if (loading) return <div className="min-h-screen bg-[var(--rl-navy)] flex items-center justify-center text-[var(--rl-gold)] font-display text-xl animate-pulse">{t('status.loading')} Match...</div>;

  if (!match) {
    return (
      <section className="py-24 text-center bg-[var(--rl-navy)]">
        <div className="max-w-md mx-auto px-8 py-12 rounded-3xl glass border border-[var(--rl-gold)]/20 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
          <Trophy className="w-16 h-16 mx-auto mb-6 text-[var(--rl-gold)] opacity-50" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">No Match Scheduled Today</h2>
          <p className="text-[var(--rl-gray)]">Returns soon. Check the schedule for details.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id="match-of-day"
      className="relative min-h-screen w-full overflow-hidden bg-[var(--rl-navy)]"
      dir={dir}
    >
      {/* Background with Noise & Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[var(--rl-navy-light)] via-[var(--rl-navy)] to-black" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        <div className="absolute -bottom-1/2 left-0 right-0 h-1/2 bg-gradient-to-t from-[var(--rl-gold)]/5 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen section-padding py-24">
        <div className="w-full max-w-7xl mx-auto">

          {/* Section Header */}
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rl-gold)]/10 border border-[var(--rl-gold)]/30 mb-6 backdrop-blur-md">
              <Trophy className="w-4 h-4 text-[var(--rl-gold)]" />
              <span className="text-sm font-ui font-bold text-[var(--rl-gold)] tracking-wider">MATCH OF THE DAY • {match.stage}</span>
            </div>
            <h2 className="text-section font-display font-black text-white leading-tight">
              {t('mod.title')}
            </h2>
          </div>

          {/* Match Card - Glass & Gold */}
          <div className="relative z-20 perspective-1000">
            <div className="card-gold rounded-[2.5rem] p-8 md:p-16 overflow-hidden transform hover:scale-[1.01] transition-transform duration-700">

              {/* Decorative Glows */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--rl-gold)]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--rl-emerald)]/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />

              <div className="relative flex flex-col items-center">

                {/* Teams Layout */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 items-center mb-12">

                  {/* Home Team */}
                  <div className="flex flex-col items-center justify-center text-center group">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-[var(--rl-navy-light)] border border-[var(--rl-gold)]/30 flex items-center justify-center p-6 shadow-2xl mb-6 group-hover:shadow-[0_0_30px_var(--rl-gold)]/20 transition-all duration-500">
                      {match.home?.logoPath ? (
                        <img src={match.home.logoPath} alt={match.home.teamName} className="w-full h-full object-contain filter drop-shadow-lg" />
                      ) : (
                        <span className="text-4xl font-black text-[var(--rl-gold)]">{match.home?.shortName}</span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-black text-white mb-2">{match.home?.teamName}</h3>
                    <div className="badge px-3 py-1 rounded-full bg-[var(--rl-gold)]/10 text-[var(--rl-gold)] text-xs font-bold uppercase tracking-wider border border-[var(--rl-gold)]/20">
                      {match.home?.cohort}
                    </div>
                  </div>

                  {/* VS / Info */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--rl-gold)] to-[var(--rl-gold-dark)] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] z-10 relative">
                        <span className="text-3xl font-display font-black text-[var(--rl-navy)]">VS</span>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-[var(--rl-gold)] animate-ping opacity-20" />
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-center justify-center gap-2 text-[var(--rl-gray)] bg-[var(--rl-navy-light)]/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                        <Calendar className="w-4 h-4 text-[var(--rl-gold)]" />
                        <span className="font-mono text-sm">{match?.date}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-[var(--rl-gray)] bg-[var(--rl-navy-light)]/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                        <MapPin className="w-4 h-4 text-[var(--rl-emerald)]" />
                        <span className="font-mono text-sm">{match?.time} • {match?.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center justify-center text-center group">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-[var(--rl-navy-light)] border border-[var(--rl-emerald)]/30 flex items-center justify-center p-6 shadow-2xl mb-6 group-hover:shadow-[0_0_30px_var(--rl-emerald)]/20 transition-all duration-500">
                      {match.away?.logoPath ? (
                        <img src={match.away.logoPath} alt={match.away.teamName} className="w-full h-full object-contain filter drop-shadow-lg" />
                      ) : (
                        <span className="text-4xl font-black text-[var(--rl-emerald)]">{match.away?.shortName}</span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-black text-white mb-2">{match.away?.teamName}</h3>
                    <div className="badge px-3 py-1 rounded-full bg-[var(--rl-emerald)]/10 text-[var(--rl-emerald)] text-xs font-bold uppercase tracking-wider border border-[var(--rl-emerald)]/20">
                      {match.away?.cohort}
                    </div>
                  </div>

                </div>

                {/* CTA */}
                <button className="btn-primary flex items-center gap-3 group text-lg px-8 py-4 shadow-xl">
                  {t('mod.details')}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
