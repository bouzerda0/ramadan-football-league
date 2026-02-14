
import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

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
    status: string; // scheduled, live, finished
    round?: string; // QF1-4, SF1-2, Final
}

interface Team {
    id: string;
    teamName: string;
}

export default function AdminMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [_loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // New Match State
    const [newMatch, setNewMatch] = useState<Partial<Match>>({
        matchday: 1,
        date: '',
        time: '',
        venue: 'Pitch A',
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0,
        round: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [matchesRes, teamsRes] = await Promise.all([
                fetch("/api/matches"),
                fetch("/api/teams")
            ]);

            if (matchesRes.ok) {
                const data = await matchesRes.json();
                setMatches(data || []);
            }
            if (teamsRes.ok) {
                const data = await teamsRes.json();
                setTeams(data || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMatch),
            });
            if (response.ok) {
                fetchData();
                setNewMatch({ ...newMatch, homeTeamId: '', awayTeamId: '' }); // Reset selection
            }
        } catch (error) {
            console.error("Failed to create match:", error);
        }
    };

    const handleUpdateMatch = async (match: Match) => {
        try {
            const response = await fetch('/api/admin/matches', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(match),
            });
            if (response.ok) {
                fetchData();
                alert("Match updated!");
            }
        } catch (error) {
            console.error("Failed to update match:", error);
        }
    };

    const confirmDeleteMatch = async () => {
        if (!deleteId) return;
        try {
            const response = await fetch(`/api/admin/matches?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setDeleteId(null);
                fetchData();
            } else {
                alert("Failed to delete match. Check console.");
            }
        } catch (error) {
            console.error("Failed to delete match:", error);
            alert("Error deleting match.");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Create Match Form */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#D4A018]" />
                    Create New Match
                </h2>
                <form onSubmit={handleCreateMatch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                        className="bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20"
                        value={newMatch.homeTeamId}
                        onChange={(e) => setNewMatch({ ...newMatch, homeTeamId: e.target.value })}
                        required
                    >
                        <option value="">Select Home Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                    </select>

                    <select
                        className="bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20"
                        value={newMatch.awayTeamId}
                        onChange={(e) => setNewMatch({ ...newMatch, awayTeamId: e.target.value })}
                        required
                    >
                        <option value="">Select Away Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                    </select>

                    <input
                        type="date"
                        className="bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20"
                        value={newMatch.date}
                        onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                        required
                    />
                    <input
                        type="time"
                        className="bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20"
                        value={newMatch.time}
                        onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                        required
                    />

                    <select
                        className="bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20"
                        value={newMatch.round || ''}
                        onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })}
                    >
                        <option value="">League Match (Default)</option>
                        <option value="QF1">Quarter Final 1</option>
                        <option value="QF2">Quarter Final 2</option>
                        <option value="QF3">Quarter Final 3</option>
                        <option value="QF4">Quarter Final 4</option>
                        <option value="SF1">Semi Final 1</option>
                        <option value="SF2">Semi Final 2</option>
                        <option value="Final">Final</option>
                    </select>

                    <button type="submit" className="bg-[#D4A018] text-[#0B0F1C] font-bold p-2 rounded hover:bg-[#B38612]">
                        Add Match
                    </button>
                </form>
            </div>

            {/* List Matches */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Scheduled Matches</h2>
                {matches.length === 0 ? (
                    <div className="text-[#A9B3C7] italic p-4 bg-[#141B2D] rounded-xl border border-[#D4A018]/10 text-center">
                        No matches scheduled yet.
                    </div>
                ) : (
                    matches.map(match => (
                        <div key={match.id} className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10 flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 grid grid-cols-3 items-center text-center gap-4">
                                <span className="font-bold text-right">
                                    {teams.find(t => t.id === match.homeTeamId)?.teamName || 'Unknown'}
                                </span>

                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="number"
                                        className="w-12 bg-[#0B0F1C] text-center p-1 rounded"
                                        value={match.homeScore}
                                        onChange={(e) => {
                                            const updatedMatches = matches.map(m =>
                                                m.id === match.id ? { ...m, homeScore: parseInt(e.target.value) } : m
                                            );
                                            setMatches(updatedMatches);
                                        }}
                                    />
                                    <span className="text-[#6B7280]">-</span>
                                    <input
                                        type="number"
                                        className="w-12 bg-[#0B0F1C] text-center p-1 rounded"
                                        value={match.awayScore}
                                        onChange={(e) => {
                                            const updatedMatches = matches.map(m =>
                                                m.id === match.id ? { ...m, awayScore: parseInt(e.target.value) } : m
                                            );
                                            setMatches(updatedMatches);
                                        }}
                                    />
                                </div>

                                <span className="font-bold text-left">
                                    {teams.find(t => t.id === match.awayTeamId)?.teamName || 'Unknown'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    className={`bg-[#0B0F1C] p-2 rounded border text-sm ${match.status === 'live' ? 'text-red-400 border-red-500/50' :
                                        match.status === 'finished' ? 'text-emerald-400 border-emerald-500/50' :
                                            'text-[#A9B3C7] border-[#D4A018]/20'
                                        }`}
                                    value={match.status}
                                    onChange={(e) => {
                                        const updatedMatches = matches.map(m =>
                                            m.id === match.id ? { ...m, status: e.target.value } : m
                                        );
                                        setMatches(updatedMatches);
                                    }}
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="live">Live</option>
                                    <option value="finished">Finished</option>
                                </select>

                                <select
                                    className="w-24 bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20 text-xs"
                                    value={match.round || ''}
                                    onChange={(e) => {
                                        const updatedMatches = matches.map(m =>
                                            m.id === match.id ? { ...m, round: e.target.value } : m
                                        );
                                        setMatches(updatedMatches);
                                    }}
                                >
                                    <option value="">League</option>
                                    <option value="QF1">QF1</option>
                                    <option value="QF2">QF2</option>
                                    <option value="QF3">QF3</option>
                                    <option value="QF4">QF4</option>
                                    <option value="SF1">SF1</option>
                                    <option value="SF2">SF2</option>
                                    <option value="Final">Final</option>
                                </select>

                                <button
                                    onClick={() => handleUpdateMatch(match)}
                                    className="p-2 bg-[#D4A018]/10 text-[#D4A018] rounded hover:bg-[#D4A018]/20"
                                    title="Save Changes"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setDeleteId(match.id)}
                                    className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                    title="Delete Match"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141B2D] w-full max-w-sm rounded-2xl border border-red-500/20 p-6">
                        <h3 className="text-xl font-bold text-[#F4F6FA] mb-4">Delete Match?</h3>
                        <p className="text-[#A9B3C7] mb-6">Are you sure you want to delete this match?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg hover:bg-[#141B2D]/80 transition-colors text-[#F4F6FA]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteMatch}
                                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
