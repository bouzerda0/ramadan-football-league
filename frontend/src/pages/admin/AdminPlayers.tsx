import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, X, User } from 'lucide-react';

interface Player {
    id: number;
    teamId: string;
    name: string;
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    matchesPlayed: number;
}

interface Team {
    id: string;
    teamName: string;
    players: Player[];
}

export default function AdminPlayers() {
    const [searchParams] = useSearchParams();
    const teamId = searchParams.get('teamId');

    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    useEffect(() => {
        fetchTeams();
    }, [teamId]);

    const fetchTeams = async () => {
        try {
            const response = await fetch("/api/teams");
            if (response.ok) {
                const data = await response.json();
                if (teamId) {
                    const foundTeam = data.find((t: any) => t.id === teamId);
                    setTeam(foundTeam);
                }
            }
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStats = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlayer) return;

        try {
            const response = await fetch(`/api/admin/players`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPlayer),
            });

            if (response.ok) {
                setEditingPlayer(null);
                fetchTeams(); // Refresh to get updated data
            } else {
                alert("Failed to update player.");
            }
        } catch (error) {
            console.error("Failed to update player:", error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!team) return <p>Team not found or not selected.</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-[#F4F6FA]">Manage Players: {team.teamName}</h2>

            <div className="grid gap-4">
                {team.players.map((player) => (
                    <div key={player.id} className="bg-[#141B2D] p-4 rounded-lg flex items-center justify-between border border-[#D4A018]/10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#0B0F1C] rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-[#D4A018]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#F4F6FA]">{player.name}</h3>
                                <div className="text-xs text-[#6B7280] flex gap-3 mt-1">
                                    <span>G: {player.goals || 0}</span>
                                    <span>A: {player.assists || 0}</span>
                                    <span>CS: {player.cleanSheets || 0}</span>
                                    <span>YC: {player.yellowCards || 0}</span>
                                    <span>RC: {player.redCards || 0}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditingPlayer(player)}
                            className="p-2 text-[#D4A018] hover:bg-[#D4A018]/10 rounded-lg transition-colors"
                            title="Edit Stats"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141B2D] w-full max-w-lg rounded-2xl border border-[#D4A018]/20 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#F4F6FA]">Edit Stats: {editingPlayer.name}</h3>
                            <button onClick={() => setEditingPlayer(null)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStats} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Matches Played</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingPlayer.matchesPlayed || 0}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, matchesPlayed: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Goals</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingPlayer.goals || 0}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, goals: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Assists</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingPlayer.assists || 0}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, assists: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Clean Sheets</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingPlayer.cleanSheets || 0}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, cleanSheets: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Yellow Cards</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingPlayer.yellowCards || 0}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, yellowCards: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Red Cards</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingPlayer.redCards || 0}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, redCards: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingPlayer(null)}
                                    className="px-4 py-2 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg hover:bg-[#141B2D]/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#D4A018] text-[#0B0F1C] font-bold rounded-lg hover:bg-[#B38612] transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
