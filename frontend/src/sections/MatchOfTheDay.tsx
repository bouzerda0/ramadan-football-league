import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';

interface Team {
  id: string;
  teamName: string;
  logoPath: string;
  // Mocking colors/shortName if not in DB yet, or deriving them
}

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  venue: string;
  status: string;
}

export default function MatchOfTheDay() {
  const { t, dir } = useLanguage();
  const { config } = useSiteConfig();
  const { ref } = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/teams')
        ]);

        if (matchesRes.ok && teamsRes.ok) {
          const matches: Match[] = await matchesRes.json();
          const teams: Team[] = await teamsRes.json();

          if (matches.length === 0) {
            setMatch(null);
            setLoading(false);
            return;
          }

          let selectedMatch: Match | undefined;

          if (config.autoUpdateMatches) {
            // Logic: Find first match that is NOT finished, or the next upcoming one
            // "if time of match current is ended automaticcally passe of next matche"
            const now = new Date();

            // Parse dates and sort
            const sortedMatches = matches.sort((a, b) => {
              return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
            });

            // Find first match in the future (or currently playing theoretically)
            // Assuming 2 hours duration for a match
            selectedMatch = sortedMatches.find(m => {
              const matchTime = new Date(`${m.date}T${m.time}`);
              const matchEndTime = new Date(matchTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours
              return matchEndTime > now;
            });

            // If all matches finished, show the last one? Or null?
            if (!selectedMatch && sortedMatches.length > 0) {
              selectedMatch = sortedMatches[sortedMatches.length - 1];
            }
          } else if (config.featuredMatchId) {
            selectedMatch = matches.find(m => m.id === config.featuredMatchId);
          }

          if (selectedMatch) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const homeTeam = teams.find((t: any) => t.id === selectedMatch!.homeTeamId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const awayTeam = teams.find((t: any) => t.id === selectedMatch!.awayTeamId);

            setMatch({
              ...selectedMatch,
              home: {
                ...homeTeam,
                colors: { primary: '#10B981', secondary: '#ffffff' }, // Fallback colors
                shortName: homeTeam?.teamName.substring(0, 3).toUpperCase() || 'HOM',
                cohort: 'Cohort 1'
              },
              away: {
                ...awayTeam,
                colors: { primary: '#3B82F6', secondary: '#ffffff' }, // Fallback colors
                shortName: awayTeam?.teamName.substring(0, 3).toUpperCase() || 'AWAY',
                cohort: 'Cohort 2'
              },
              stage: config.matchStage || 'League Match'
            });
          }
        }
      } catch (error) {
        console.error("Failed to load match of the day", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up interval to check every minute if auto-update is on?
    // For now, just load on mount. User can refresh. 
    // Or strictly strictly: "automaticcally passe"
    const interval = setInterval(fetchData, 60000); // Check every minute
    return () => clearInterval(interval);

  }, [config.autoUpdateMatches, config.featuredMatchId]);

  if (!match && !loading) {
    return (
      <section className="py-20 text-center text-[#D4A018]">
        <h2 className="text-2xl font-display font-bold">No Upcoming Matches</h2>
      </section>
    );
  }
  if (loading) return <div className="min-h-screen bg-[#0B0F1C] flex items-center justify-center text-[#D4A018]">Loading Match...</div>;

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
                    <span className="text-sm text-[#F4F6FA]">{match.date} • {match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B2D]">
                    <MapPin className="w-4 h-4 text-[#D4A018]" />
                    <span className="text-sm text-[#F4F6FA]">{match.venue}</span>
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
