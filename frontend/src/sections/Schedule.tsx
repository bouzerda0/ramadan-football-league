import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Calendar, MapPin, Clock, CheckCircle2, PlayCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Team {
  id: string;
  name: string;
  shortName: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
}

interface Match {
  id: string;
  matchday: number;
  date: string;
  time: string;
  venue: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
}

export default function Schedule() {
  const { t, dir } = useLanguage();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/teams'),
        ]);

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData);
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          const teamsMap: Record<string, Team> = {};
          teamsData.forEach((team: Team) => {
            teamsMap[team.id] = team;
          });
          setTeams(teamsMap);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group matches by matchday
  const matchdays = matches.reduce((acc, match) => {
    if (!acc[match.matchday]) {
      acc[match.matchday] = [];
    }
    acc[match.matchday].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finished':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'live':
        return <PlayCircle className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-[#A9B3C7]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finished':
        return t('schedule.finished');
      case 'live':
        return t('schedule.live');
      case 'scheduled':
        return t('schedule.scheduled');
      default:
        return status;
    }
  };

  const getMatchdayLabel = (matchday: number) => {
    switch (matchday) {
      case 1:
      case 2:
      case 3:
        return `${t('schedule.matchday')} ${matchday}`;
      case 4:
        return 'Semi-Finals';
      case 5:
        return 'Final';
      default:
        return `${t('schedule.matchday')} ${matchday}`;
    }
  };

  const getTeamName = (teamId: string) => teams[teamId]?.name || teamId;
  const getTeamShortName = (teamId: string) => teams[teamId]?.shortName || teamId.substring(0, 3);
  const getTeamColor = (teamId: string) => teams[teamId]?.primaryColor || '#333';
  const getTeamSecondaryColor = (teamId: string) => teams[teamId]?.secondaryColor || '#fff';
  const getTeamLogo = (teamId: string) => teams[teamId]?.logoPath;

  if (loading) return <div className="py-20 text-center text-[#A9B3C7]">Loading schedule...</div>;

  return (
    <section
      ref={ref}
      id="schedule"
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
              <Calendar className="w-8 h-8 text-[#D4A018]" />
              <h2 className="text-section font-display font-black text-[#F4F6FA]">
                {t('schedule.title')}
              </h2>
            </div>
            <p className="text-[#A9B3C7] text-lg">{t('schedule.subtitle')}</p>
          </div>

          {/* Matchdays */}
          <div className="space-y-8">
            {Object.entries(matchdays).map(([matchday, dayMatches], dayIndex) => (
              <div
                key={matchday}
                className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                style={{ transitionDelay: `${200 + dayIndex * 150}ms` }}
              >
                {/* Matchday Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4A018]/30 to-transparent" />
                  <h3 className="text-lg font-display font-bold text-[#D4A018]">
                    {getMatchdayLabel(Number(matchday))}
                  </h3>
                  <span className="text-sm text-[#6B7280]">{dayMatches[0]?.date}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4A018]/30 to-transparent" />
                </div>

                {/* Matches */}
                <div className="grid gap-3">
                  {dayMatches.map((match: Match) => (
                    <div
                      key={match.id}
                      className="card-gold rounded-xl p-4 md:p-6 hover:bg-[#141B2D] transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Status */}
                        <div className="flex items-center gap-2 md:w-24">
                          {getStatusIcon(match.status)}
                          <span className={`text-xs font-medium ${match.status === 'live' ? 'text-red-400' :
                            match.status === 'finished' ? 'text-emerald-400' :
                              'text-[#A9B3C7]'
                            }`}>
                            {getStatusText(match.status)}
                          </span>
                        </div>

                        {/* Teams */}
                        <div className="flex-1 flex items-center justify-between md:justify-center gap-4">
                          {/* Home Team */}
                          <div className="flex items-center gap-3 flex-1 md:flex-initial">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold overflow-hidden"
                              style={{
                                backgroundColor: getTeamColor(match.homeTeamId),
                                color: getTeamSecondaryColor(match.homeTeamId)
                              }}
                            >
                              {getTeamLogo(match.homeTeamId) ? (
                                <img src={getTeamLogo(match.homeTeamId)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                getTeamShortName(match.homeTeamId)
                              )}
                            </div>
                            <span className="font-semibold text-[#F4F6FA] hidden sm:block">
                              {getTeamName(match.homeTeamId)}
                            </span>
                          </div>

                          {/* Score / VS */}
                          <div className="flex items-center gap-3 px-4">
                            {match.status === 'finished' ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-display font-bold text-[#F4F6FA]">
                                  {match.homeScore}
                                </span>
                                <span className="text-[#6B7280]">-</span>
                                <span className="text-2xl font-display font-bold text-[#F4F6FA]">
                                  {match.awayScore}
                                </span>
                              </div>
                            ) : match.status === 'live' ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-display font-bold text-[#F4F6FA]">
                                  {match.homeScore || 0}
                                </span>
                                <span className="text-red-400 animate-pulse">Live</span>
                                <span className="text-2xl font-display font-bold text-[#F4F6FA]">
                                  {match.awayScore || 0}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-display font-bold text-[#D4A018]">
                                VS
                              </span>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-3 flex-1 md:flex-initial justify-end">
                            <span className="font-semibold text-[#F4F6FA] hidden sm:block text-right">
                              {getTeamName(match.awayTeamId)}
                            </span>
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold overflow-hidden"
                              style={{
                                backgroundColor: getTeamColor(match.awayTeamId),
                                color: getTeamSecondaryColor(match.awayTeamId)
                              }}
                            >
                              {getTeamLogo(match.awayTeamId) ? (
                                <img src={getTeamLogo(match.awayTeamId)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                getTeamShortName(match.awayTeamId)
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Time & Venue */}
                        <div className="flex items-center gap-4 text-sm text-[#A9B3C7] md:w-48 justify-end">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{match.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="hidden sm:inline">{match.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {matches.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-[#D4A018]/30 mx-auto mb-4" />
              <p className="text-[#A9B3C7] text-lg">No matches scheduled yet.</p>
              <p className="text-[#6B7280] text-sm mt-2">Check back later for the schedule.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
