import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy } from 'lucide-react';

interface Match {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    status: string;
    round?: string;
    date: string;
}

interface Team {
    id: string;
    teamName: string;
    logoPath: string;
}

export default function TournamentBracket() {
    const { t, dir } = useLanguage();
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, teamsRes] = await Promise.all([
                    fetch('/api/matches'),
                    fetch('/api/teams')
                ]);

                if (matchesRes.ok && teamsRes.ok) {
                    const matchesData = await matchesRes.json();
                    const teamsData = await teamsRes.json();
                    setMatches(matchesData);
                    setTeams(teamsData);
                }
            } catch (error) {
                console.error("Failed to load bracket data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getTeam = (id: string) => teams.find(t => t.id === id);

    const getMatchByRound = (round: string) => matches.find(m => m.round === round);

    const MatchCard = ({ round, label }: { round: string, label: string }) => {
        const match = getMatchByRound(round);
        const home = match ? getTeam(match.homeTeamId) : null;
        const away = match ? getTeam(match.awayTeamId) : null;

        return (
            <div className="w-64 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg overflow-hidden shrink-0 relative">
                <div className="bg-[#0B0F1C] px-3 py-1 text-xs text-[#A9B3C7] border-b border-[#D4A018]/10 flex justify-between">
                    <span>{label}</span>
                    {match && <span className="text-[#D4A018]">{match.date}</span>}
                </div>

                {/* Home Team */}
                <div className={`flex items-center justify-between px-4 py-2 border-b border-[#D4A018]/10 ${match?.homeScore !== undefined && match?.awayScore !== undefined && match.homeScore > match.awayScore ? 'bg-[#D4A018]/10' : ''}`}>
                    <div className="flex items-center gap-2">
                        {home?.logoPath ? (
                            <img src={home.logoPath} className="w-6 h-6 object-contain" alt="" />
                        ) : (
                            <div className="w-6 h-6 bg-[#374151] rounded-full"></div>
                        )}
                        <span className={`text-sm font-medium ${match?.homeScore !== undefined && match?.awayScore !== undefined && match.homeScore > match.awayScore ? 'text-[#D4A018]' : 'text-[#F4F6FA]'}`}>
                            {home?.teamName || 'TBD'}
                        </span>
                    </div>
                    <span className="font-mono font-bold text-[#F4F6FA]">{match?.homeScore ?? '-'}</span>
                </div>

                {/* Away Team */}
                <div className={`flex items-center justify-between px-4 py-2 ${match?.homeScore !== undefined && match?.awayScore !== undefined && match.awayScore > match.homeScore ? 'bg-[#D4A018]/10' : ''}`}>
                    <div className="flex items-center gap-2">
                        {away?.logoPath ? (
                            <img src={away.logoPath} className="w-6 h-6 object-contain" alt="" />
                        ) : (
                            <div className="w-6 h-6 bg-[#374151] rounded-full"></div>
                        )}
                        <span className={`text-sm font-medium ${match?.homeScore !== undefined && match?.awayScore !== undefined && match.awayScore > match.homeScore ? 'text-[#D4A018]' : 'text-[#F4F6FA]'}`}>
                            {away?.teamName || 'TBD'}
                        </span>
                    </div>
                    <span className="font-mono font-bold text-[#F4F6FA]">{match?.awayScore ?? '-'}</span>
                </div>
            </div>
        );
    };

    if (loading) return null;

    return (
        <section className="py-20 bg-[#0B0F1C] relative overflow-x-auto" dir={dir}>
            <div className="min-w-[1000px] max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-display font-bold text-[#F4F6FA] flex items-center justify-center gap-3">
                        <Trophy className="w-8 h-8 text-[#D4A018]" />
                        {t('nav.schedule') || 'Tournament Bracket'}
                    </h2>
                </div>

                <div className="flex justify-between items-center gap-8 relative">
                    {/* Quarter Finals */}
                    <div className="space-y-8 flex flex-col justify-around h-[500px]">
                        <MatchCard round="QF1" label="Quarter Final 1" />
                        <MatchCard round="QF2" label="Quarter Final 2" />
                        <MatchCard round="QF3" label="Quarter Final 3" />
                        <MatchCard round="QF4" label="Quarter Final 4" />
                    </div>

                    {/* Connectors QF -> SF */}
                    <div className="flex flex-col justify-around h-[500px] py-10 w-8">
                        {/* QF1 & QF2 -> SF1 */}
                        <div className="h-1/4 border-r border-t border-b border-[#D4A018]/30 rounded-r-xl"></div>
                        <div className="h-1/4 border-r border-t border-b border-[#D4A018]/30 rounded-r-xl"></div>
                    </div>

                    {/* Semi Finals */}
                    <div className="space-y-24 flex flex-col justify-around h-[500px]">
                        <MatchCard round="SF1" label="Semi Final 1" />
                        <MatchCard round="SF2" label="Semi Final 2" />
                    </div>

                    {/* Connectors SF -> Final */}
                    <div className="flex flex-col justify-around h-[500px] py-32 w-8">
                        <div className="h-full border-r border-t border-b border-[#D4A018]/30 rounded-r-xl"></div>
                    </div>

                    {/* Final */}
                    <div className="flex flex-col justify-center h-[500px]">
                        <div className="relative">
                            <Trophy className="w-12 h-12 text-[#D4A018] absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce" />
                            <MatchCard round="Final" label="Grand Final" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
