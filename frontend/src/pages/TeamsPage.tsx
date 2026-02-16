
import Navigation from '@/components/Navigation';
// import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { Users, Trophy, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Player {
    name: string;
}

interface Team {
    id: string;
    teamName: string;
    captainName: string;
    logoPath: string;
    players: Player[];
    registeredAt: string;
}

export default function TeamsPage() {
    // const { t, dir } = useLanguage();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch(`${API_URL}/api/teams`);
                if (response.ok) {
                    const result = await response.json();
                    console.log("Fetched teams:", result); // Debugging
                    // API returns { success: true, data: [...] }
                    const teamsData = result.data || result || [];
                    // Map API field names to frontend field names
                    const mapped = (Array.isArray(teamsData) ? teamsData : []).map((t: Record<string, unknown>) => ({
                        ...t,
                        teamName: t.name || t.teamName || '',
                        captainName: t.captain || t.captainName || '',
                    }));
                    setTeams(mapped as Team[]);
                } else {
                    setError("Failed to load teams");
                }
            } catch (error) {
                console.error("Failed to fetch teams:", error);
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const filteredTeams = teams.filter(team =>
        (team.teamName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.captainName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0B0F1C] text-[#F4F6FA] pb-20">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 pt-32">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-[#F4F6FA] mb-4">
                        <span className="text-[#D4A018]">Registered</span> Teams
                    </h1>
                    <p className="text-[#A9B3C7]">Meet the challengers of the UMPO Ramadan League 2026</p>
                </div>

                {/* Search */}
                <div className="max-w-md mx-auto mb-12 relative">
                    <Input
                        placeholder="Search teams..."
                        className="bg-[#141B2D] border-[#D4A018]/20 text-white pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-[#D4A018] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-[#A9B3C7]">Loading teams...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 bg-[#141B2D]/30 rounded-2xl border border-red-500/20">
                        <p>{error}</p>
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <div className="text-center py-20 bg-[#141B2D]/30 rounded-2xl border border-dashed border-[#D4A018]/20">
                        <Users className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[#F4F6FA] mb-2">No Teams Found</h3>
                        <p className="text-[#A9B3C7]">
                            {searchTerm ? "Try adjusting your search terms" : "Be the first to register!"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <div key={team.id} className="bg-[#141B2D]/50 border border-[#D4A018]/10 rounded-xl overflow-hidden hover:border-[#D4A018]/30 transition-all hover:shadow-lg hover:shadow-[#D4A018]/5 group">
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-[#0B0F1C] border border-[#D4A018]/20 flex items-center justify-center overflow-hidden shrink-0">
                                            {team.logoPath ? (
                                                <img src={team.logoPath} alt={team.teamName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Trophy className="w-8 h-8 text-[#D4A018]" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold font-display text-[#F4F6FA] group-hover:text-[#D4A018] transition-colors">
                                                {team.teamName}
                                            </h3>
                                            <p className="text-sm text-[#A9B3C7]">Capt: {team.captainName}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Squad Preview</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(team.players || []).slice(0, 5).map((player, idx) => (
                                                <span key={idx} className="px-2 py-1 rounded bg-[#0B0F1C] border border-[#D4A018]/10 text-xs text-[#A9B3C7]">
                                                    {player.name}
                                                </span>
                                            ))}
                                            {(team.players || []).length > 5 && (
                                                <span className="px-2 py-1 rounded bg-[#D4A018]/10 text-xs text-[#D4A018]">
                                                    +{(team.players || []).length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#0B0F1C]/50 px-6 py-3 border-t border-[#D4A018]/5 flex justify-between items-center text-xs text-[#6B7280]">
                                    <span>Registered</span>
                                    <span>{new Date(team.registeredAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
