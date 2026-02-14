import { useEffect, useState } from 'react';
import { Trash2, Trophy, Edit, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Team {
    id: string;
    teamName: string;
    captainName: string;
    logoPath: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    form: string;
}

export default function AdminTeams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch("/api/teams");
            if (response.ok) {
                const data = await response.json();
                setTeams(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`/api/admin/teams?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setDeleteId(null);
                fetchTeams(); // Refresh list
            } else {
                const errText = await response.text();
                alert(`Failed to delete team: ${errText}`);
            }
        } catch (error) {
            console.error("Failed to delete team:", error);
            alert("Failed to delete team. Check console for details.");
        }
    };

    const handleUpdateStats = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeam) return;

        try {
            const response = await fetch(`/api/admin/teams`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTeam),
            });

            if (response.ok) {
                setEditingTeam(null);
                fetchTeams();
            } else {
                alert("Failed to update team.");
            }
        } catch (error) {
            console.error("Failed to update team:", error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-[#F4F6FA]">Manage Teams</h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid gap-4">
                    {teams.map((team) => (
                        <div key={team.id} className="bg-[#141B2D] p-4 rounded-lg flex items-center justify-between border border-[#D4A018]/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#0B0F1C] rounded-lg flex items-center justify-center overflow-hidden">
                                    {team.logoPath ? (
                                        <img src={team.logoPath} alt={team.teamName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Trophy className="w-6 h-6 text-[#D4A018]" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#F4F6FA]">{team.teamName}</h3>
                                    <p className="text-sm text-[#A9B3C7]">{team.captainName}</p>
                                    <div className="text-xs text-[#6B7280] mt-1 flex gap-2">
                                        <span>P: {team.played || 0}</span>
                                        <span>Pts: {team.points || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/admin/players?teamId=${team.id}`}
                                    className="p-2 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                                    title="Manage Players"
                                >
                                    <Users className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => setEditingTeam(team)}
                                    className="p-2 text-[#D4A018] hover:bg-[#D4A018]/10 rounded-lg transition-colors"
                                    title="Edit Stats"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setDeleteId(team.id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete Team"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141B2D] w-full max-w-sm rounded-2xl border border-red-500/20 p-6">
                        <h3 className="text-xl font-bold text-[#F4F6FA] mb-4">Delete Team?</h3>
                        <p className="text-[#A9B3C7] mb-6">Are you sure you want to delete this team? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg hover:bg-[#141B2D]/80 transition-colors text-[#F4F6FA]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141B2D] w-full max-w-lg rounded-2xl border border-[#D4A018]/20 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#F4F6FA]">Edit Stats: {editingTeam.teamName}</h3>
                            <button onClick={() => setEditingTeam(null)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStats} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Played</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingTeam.played || 0}
                                        onChange={e => setEditingTeam({ ...editingTeam, played: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Points</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingTeam.points || 0}
                                        onChange={e => setEditingTeam({ ...editingTeam, points: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Won</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingTeam.won || 0}
                                        onChange={e => setEditingTeam({ ...editingTeam, won: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Drawn</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingTeam.drawn || 0}
                                        onChange={e => setEditingTeam({ ...editingTeam, drawn: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Lost</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingTeam.lost || 0}
                                        onChange={e => setEditingTeam({ ...editingTeam, lost: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Goals For</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingTeam.goalsFor || 0}
                                        onChange={e => setEditingTeam({ ...editingTeam, goalsFor: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Goals Against</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                        value={editingTeam.goalsAgainst || 0}
                                        onChange={e => setEditingTeam({ ...editingTeam, goalsAgainst: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Form (e.g. W,L,W)</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded p-2 text-[#F4F6FA]"
                                    value={editingTeam.form || ''}
                                    onChange={e => setEditingTeam({ ...editingTeam, form: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingTeam(null)}
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
