import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Save, Search, TrendingUp, Shield, User, X, Plus } from 'lucide-react';

interface Player {
    id: string;
    teamId: string;
    name: string;
    number: number;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    isCaptain?: boolean;
    isSubstitute?: boolean;
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    matchesPlayed: number;
}

interface Team {
    id: string;
    name: string;
    shortName: string;
    logoPath: string;
    squad: Player[];
}

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const;
const POSITION_LABELS = {
    GK: 'Goalkeeper',
    DEF: 'Defender',
    MID: 'Midfielder',
    FWD: 'Forward',
};

export default function AdminPlayers() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState<string>('all');
    // const [teamFilter, setTeamFilter] = useState<string>('all'); // Removed in favor of selection
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null); // New state for selected team
    const [sortBy, setSortBy] = useState<'goals' | 'assists' | 'matches' | 'cards'>('goals');
    const [editingPlayer, setEditingPlayer] = useState<{ teamId: string; playerId: string } | null>(null);
    const [editValues, setEditValues] = useState<Partial<Player>>({});

    // New state for creating player
    const [isCreating, setIsCreating] = useState(false);
    const [newPlayer, setNewPlayer] = useState<{ name: string; number: number; position: string }>({
        name: '',
        number: 0,
        position: 'MID',
    });

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/teams`);
            if (response.ok) {
                const result = await response.json();
                // API returns { success: true, data: [...] }
                const teamsData = result.data || result || [];
                // Map 'players' from API to 'squad' used in frontend
                const mapped = (Array.isArray(teamsData) ? teamsData : []).map((t: Record<string, unknown>) => ({
                    ...t,
                    squad: t.players || t.squad || [],
                }));
                setTeams(mapped as Team[]);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlayer = async () => {
        if (!selectedTeamId || !newPlayer.name) return;

        try {
            const response = await fetch(`${API_URL}/api/admin/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: selectedTeamId,
                    name: newPlayer.name,
                    number: newPlayer.number,
                    position: newPlayer.position,
                }),
            });

            if (response.ok) {
                await fetchTeams();
                setIsCreating(false);
                setNewPlayer({ name: '', number: 0, position: 'MID' });
            } else {
                alert('Failed to create player');
            }
        } catch (error) {
            console.error('Failed to create player:', error);
            alert('Error creating player');
        }
    };

    const handleUpdatePlayer = async (teamId: string, playerId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/players/${playerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    ...editValues,
                }),
            });
            if (response.ok) {
                fetchTeams();
                setEditingPlayer(null);
                setEditValues({});
            } else {
                alert('Failed to update player');
            }
        } catch (error) {
            console.error('Failed to update player:', error);
            alert('Error updating player');
        }
    };

    const startEditing = (teamId: string, player: Player) => {
        setEditingPlayer({ teamId, playerId: player.id });
        setEditValues({ ...player });
    };

    const cancelEditing = () => {
        setEditingPlayer(null);
        setEditValues({});
    };

    const getAllPlayers = (): (Player & { teamName: string; teamLogo: string })[] => {
        const players: (Player & { teamName: string; teamLogo: string })[] = [];
        teams.forEach((team: Team) => {
            team.squad?.forEach((player: Player) => {
                players.push({
                    ...player,
                    teamName: team.name,
                    teamLogo: team.logoPath,
                });
            });
        });
        return players;
    };

    const getFilteredAndSortedPlayers = () => {
        let players = getAllPlayers();

        // Filter by selected team if one is selected
        if (selectedTeamId) {
            players = players.filter(p => p.teamId === selectedTeamId);
        }

        // Search filter
        if (searchTerm) {
            players = players.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.teamName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Position filter
        if (positionFilter !== 'all') {
            players = players.filter(p => p.position === positionFilter);
        }

        // Sort
        players.sort((a, b) => {
            switch (sortBy) {
                case 'goals': return b.goals - a.goals;
                case 'assists': return b.assists - a.assists;
                case 'matches': return b.matchesPlayed - a.matchesPlayed;
                case 'cards': return (b.redCards * 3 + b.yellowCards) - (a.redCards * 3 + a.yellowCards);
                default: return 0;
            }
        });

        return players;
    };

    const getTopScorers = () => {
        return getAllPlayers()
            .filter(p => p.goals > 0)
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 5);
    };

    const getTopAssisters = () => {
        return getAllPlayers()
            .filter(p => p.assists > 0)
            .sort((a, b) => b.assists - a.assists)
            .slice(0, 5);
    };

    const getCleanSheets = () => {
        return getAllPlayers()
            .filter(p => p.position === 'GK' && p.cleanSheets > 0)
            .sort((a, b) => b.cleanSheets - a.cleanSheets)
            .slice(0, 5);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A018]"></div>
            </div>
        );
    }

    // New: Team Selection View
    if (!selectedTeamId) {
        return (
            <div className="space-y-6 pb-20">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <User className="w-6 h-6 text-[#D4A018]" />
                        Players Management
                    </h2>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            onClick={() => setSelectedTeamId(team.id)}
                            className="bg-[#141B2D] border border-[#D4A018]/10 rounded-xl p-6 cursor-pointer hover:border-[#D4A018]/40 hover:bg-[#1a2340] transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                {team.logoPath ? (
                                    <img src={team.logoPath} alt={team.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#D4A018]/20 group-hover:border-[#D4A018] transition-colors" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-[#D4A018]/10 flex items-center justify-center border-2 border-[#D4A018]/20 group-hover:border-[#D4A018] transition-colors">
                                        <Shield className="w-8 h-8 text-[#D4A018]" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-xl group-hover:text-[#D4A018] transition-colors">{team.name}</h3>
                                    <p className="text-[#A9B3C7] text-sm">{team.shortName}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm bg-[#0B0F1C]/50 p-3 rounded-lg">
                                <span className="text-[#A9B3C7]">Squad Size</span>
                                <span className="font-bold text-[#F4F6FA]">{team.squad?.length || 0} Players</span>
                            </div>
                        </div>
                    ))}

                    {teams.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-[#141B2D]/50 rounded-xl border border-dashed border-[#D4A018]/20">
                            <p className="text-[#A9B3C7]">No teams found. Please register teams first.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Detail View: Selected Team Players
    const selectedTeam = teams.find(t => t.id === selectedTeamId);
    const filteredPlayers = getFilteredAndSortedPlayers();

    return (
        <div className="space-y-6 pb-20">
            {/* Header with Back Button */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedTeamId(null)}
                        className="bg-[#141B2D] hover:bg-[#1a2340] border border-[#D4A018]/20 text-[#A9B3C7] hover:text-[#F4F6FA] px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        &larr; Back to Teams
                    </button>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        {selectedTeam?.logoPath && (
                            <img src={selectedTeam.logoPath} alt={selectedTeam.name} className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <span className="text-[#D4A018]">{selectedTeam?.name}</span> Players
                    </h2>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-[#D4A018] text-[#0B0F1C] px-4 py-2 rounded-lg font-bold hover:bg-[#B38612] transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Player
                </button>
            </div>

            {/* Create Player Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/20 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#F4F6FA]">Add New Player</h3>
                            <button onClick={() => setIsCreating(false)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[#A9B3C7] mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={newPlayer.name}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                    placeholder="Player Name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#A9B3C7] mb-1">Number</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newPlayer.number}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#A9B3C7] mb-1">Position</label>
                                    <select
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newPlayer.position}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                    >
                                        {POSITIONS.map(pos => (
                                            <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 rounded text-[#A9B3C7] hover:bg-[#0B0F1C] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePlayer}
                                    className="px-4 py-2 bg-[#D4A018] text-[#0B0F1C] rounded font-bold hover:bg-[#B38612] transition-colors"
                                >
                                    Create Player
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Filters (modified to remove team filter) */}
            <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10">
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                            <input
                                type="text"
                                placeholder="Search players..."
                                className="w-full bg-[#0B0F1C] pl-10 pr-4 py-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                        >
                            <option value="all">All Positions</option>
                            {POSITIONS.map(pos => <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>)}
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'goals' | 'assists' | 'matches' | 'cards')}
                        >
                            <option value="goals">Sort by Goals</option>
                            <option value="assists">Sort by Assists</option>
                            <option value="matches">Sort by Matches</option>
                            <option value="cards">Sort by Cards</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Players Table */}
            {filteredPlayers.length === 0 ? (
                <div className="text-center py-16 bg-[#141B2D] rounded-xl border border-[#D4A018]/10">
                    <User className="w-16 h-16 text-[#D4A018]/30 mx-auto mb-4" />
                    <p className="text-[#A9B3C7] text-lg">No players found.</p>
                </div>
            ) : (
                <div className="bg-[#141B2D] rounded-xl border border-[#D4A018]/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#0B0F1C]">
                                <tr>
                                    <th className="text-left p-4 text-[#A9B3C7] font-semibold">Player</th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">#</th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">Pos</th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">MP</th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">G</th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">A</th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">CS</th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">
                                        <span className="text-yellow-400">Y</span>/<span className="text-red-400">R</span>
                                    </th>
                                    <th className="text-center p-4 text-[#A9B3C7] font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlayers.map((player) => (
                                    <tr key={player.id} className="border-t border-[#D4A018]/10 hover:bg-[#0B0F1C]/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#F4F6FA]">{player.name}</span>
                                                {player.isCaptain && <span className="text-[#D4A018] text-xs">(C)</span>}
                                                {player.isSubstitute && <span className="text-[#A9B3C7] text-xs">(Sub)</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">{player.number}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 rounded bg-[#D4A018]/10 text-[#D4A018] text-xs">
                                                {player.position}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {editingPlayer?.teamId === player.teamId && editingPlayer?.playerId === player.id ? (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="w-16 bg-[#0B0F1C] p-1 rounded border border-[#D4A018]/20 text-center"
                                                    value={editValues.matchesPlayed || 0}
                                                    onChange={(e) => setEditValues({ ...editValues, matchesPlayed: parseInt(e.target.value) || 0 })}
                                                />
                                            ) : (
                                                player.matchesPlayed
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {editingPlayer?.teamId === player.teamId && editingPlayer?.playerId === player.id ? (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="w-16 bg-[#0B0F1C] p-1 rounded border border-[#D4A018]/20 text-center"
                                                    value={editValues.goals || 0}
                                                    onChange={(e) => setEditValues({ ...editValues, goals: parseInt(e.target.value) || 0 })}
                                                />
                                            ) : (
                                                <span className="font-bold text-green-400">{player.goals}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {editingPlayer?.teamId === player.teamId && editingPlayer?.playerId === player.id ? (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="w-16 bg-[#0B0F1C] p-1 rounded border border-[#D4A018]/20 text-center"
                                                    value={editValues.assists || 0}
                                                    onChange={(e) => setEditValues({ ...editValues, assists: parseInt(e.target.value) || 0 })}
                                                />
                                            ) : (
                                                <span className="font-bold text-blue-400">{player.assists}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {editingPlayer?.teamId === player.teamId && editingPlayer?.playerId === player.id ? (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="w-16 bg-[#0B0F1C] p-1 rounded border border-[#D4A018]/20 text-center"
                                                    value={editValues.cleanSheets || 0}
                                                    onChange={(e) => setEditValues({ ...editValues, cleanSheets: parseInt(e.target.value) || 0 })}
                                                />
                                            ) : (
                                                player.cleanSheets
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {editingPlayer?.teamId === player.teamId && editingPlayer?.playerId === player.id ? (
                                                <div className="flex gap-1 justify-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="w-10 bg-[#0B0F1C] p-1 rounded border border-[#D4A018]/20 text-center"
                                                        value={editValues.yellowCards || 0}
                                                        onChange={(e) => setEditValues({ ...editValues, yellowCards: parseInt(e.target.value) || 0 })}
                                                    />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="w-10 bg-[#0B0F1C] p-1 rounded border border-[#D4A018]/20 text-center"
                                                        value={editValues.redCards || 0}
                                                        onChange={(e) => setEditValues({ ...editValues, redCards: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            ) : (
                                                <span>
                                                    <span className="text-yellow-400">{player.yellowCards}</span>
                                                    <span className="text-[#6B7280]">/</span>
                                                    <span className="text-red-400">{player.redCards}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {editingPlayer?.teamId === player.teamId && editingPlayer?.playerId === player.id ? (
                                                <div className="flex gap-1 justify-center">
                                                    <button
                                                        onClick={() => handleUpdatePlayer(player.teamId, player.id)}
                                                        className="p-1 bg-[#D4A018] text-[#0B0F1C] rounded hover:bg-[#B38612]"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-1 bg-[#141B2D] border border-[#D4A018]/20 text-[#F4F6FA] rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(player.teamId, player)}
                                                    className="text-[#D4A018] hover:text-[#B38612]"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Stats Cards (Now only showing for selected team) */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
                {/* Top Scorers */}
                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10">
                    <h3 className="font-bold text-[#D4A018] mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Top Scorers
                    </h3>
                    <div className="space-y-2">
                        {getTopScorers().length === 0 ? (
                            <p className="text-[#A9B3C7] text-sm">No goals yet</p>
                        ) : (
                            getTopScorers().map((player, idx) => (
                                <div key={player.id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="text-[#D4A018] font-bold">{idx + 1}.</span>
                                        {player.name}
                                    </span>
                                    <span className="font-bold text-[#D4A018]">{player.goals}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Assists */}
                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10">
                    <h3 className="font-bold text-[#D4A018] mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" /> Top Assists
                    </h3>
                    <div className="space-y-2">
                        {getTopAssisters().length === 0 ? (
                            <p className="text-[#A9B3C7] text-sm">No assists yet</p>
                        ) : (
                            getTopAssisters().map((player, idx) => (
                                <div key={player.id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="text-[#D4A018] font-bold">{idx + 1}.</span>
                                        {player.name}
                                    </span>
                                    <span className="font-bold text-[#D4A018]">{player.assists}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Clean Sheets */}
                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10">
                    <h3 className="font-bold text-[#D4A018] mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Clean Sheets
                    </h3>
                    <div className="space-y-2">
                        {getCleanSheets().length === 0 ? (
                            <p className="text-[#A9B3C7] text-sm">No clean sheets yet</p>
                        ) : (
                            getCleanSheets().map((player, idx) => (
                                <div key={player.id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="text-[#D4A018] font-bold">{idx + 1}.</span>
                                        {player.name}
                                    </span>
                                    <span className="font-bold text-[#D4A018]">{player.cleanSheets}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
