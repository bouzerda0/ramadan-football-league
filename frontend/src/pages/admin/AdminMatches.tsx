import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Plus, Save, Trash2, Edit, Calendar, X, Trophy, Clock, MapPin } from 'lucide-react';

interface MatchEvent {
    id: string;
    minute: number;
    type: 'goal' | 'ownGoal' | 'yellowCard' | 'redCard' | 'substitution';
    playerId: string;
    playerName: string;
    teamId: string;
    assistPlayerId?: string;
    assistPlayerName?: string;
    description: string;
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
    round?: string;
    mvp?: string;
    mvpName?: string;
    events: MatchEvent[];
}

interface Player {
    id: string;
    name: string;
    number: number;
}

interface Team {
    id: string;
    name: string;
    shortName: string;
    squad?: Player[];
}

const EVENT_TYPES = [
    { value: 'goal', label: '⚽ Goal', color: 'text-green-400' },
    { value: 'ownGoal', label: '🥅 Own Goal', color: 'text-red-400' },
    { value: 'yellowCard', label: '🟨 Yellow Card', color: 'text-yellow-400' },
    { value: 'redCard', label: '🟥 Red Card', color: 'text-red-500' },
    { value: 'substitution', label: '🔄 Substitution', color: 'text-blue-400' },
] as const;

const ROUNDS = [
    { value: '', label: 'League Match' },
    { value: 'QF1', label: 'Quarter Final 1' },
    { value: 'QF2', label: 'Quarter Final 2' },
    { value: 'QF3', label: 'Quarter Final 3' },
    { value: 'QF4', label: 'Quarter Final 4' },
    { value: 'SF1', label: 'Semi Final 1' },
    { value: 'SF2', label: 'Semi Final 2' },
    { value: 'Final', label: 'Final' },
];

export default function AdminMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    // New match state
    const [newMatch, setNewMatch] = useState<Partial<Match>>({
        matchday: 1,
        date: '',
        time: '',
        venue: 'Pitch A',
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0,
        events: [],
    });

    // Event editing
    const [newEvent, setNewEvent] = useState<Partial<MatchEvent>>({
        minute: 0,
        type: 'goal',
        playerId: '',
        teamId: '',
        description: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [matchesRes, teamsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/matches`),
                fetch(`${API_URL}/api/admin/teams`),
            ]);

            if (matchesRes.ok) {
                const result = await matchesRes.json();
                const matchesData = result.data || result || [];
                setMatches((Array.isArray(matchesData) ? matchesData : []).map((m: Match) => ({ ...m, events: m.events || [] })));
            } else {
                console.error('Failed to fetch matches:', matchesRes.status);
            }
            if (teamsRes.ok) {
                const result = await teamsRes.json();
                const teamsData = result.data || result || [];
                setTeams(Array.isArray(teamsData) ? teamsData : []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newMatch.homeTeamId === newMatch.awayTeamId) {
            alert('Home and Away teams cannot be the same');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMatch),
            });
            if (response.ok) {
                fetchData();
                setShowCreateModal(false);
                resetNewMatch();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.error || 'Failed to create match');
            }
        } catch (error) {
            console.error('Failed to create match:', error);
            alert('Error creating match');
        }
    };

    const handleUpdateMatch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedMatch) return;

        try {
            const response = await fetch(`${API_URL}/api/admin/matches/${selectedMatch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedMatch),
            });
            if (response.ok) {
                fetchData();
                if (e) {
                    setShowEditModal(false);
                    setSelectedMatch(null);
                }
            } else {
                alert('Failed to update match');
            }
        } catch (error) {
            console.error('Failed to update match:', error);
            alert('Error updating match');
        }
    };

    const handleDeleteMatch = async () => {
        if (!selectedMatch) return;
        try {
            const response = await fetch(`${API_URL}/api/admin/matches/${selectedMatch.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchData();
                setShowDeleteModal(false);
                setSelectedMatch(null);
            } else {
                alert('Failed to delete match');
            }
        } catch (error) {
            console.error('Failed to delete match:', error);
            alert('Error deleting match');
        }
    };

    const resetNewMatch = () => {
        setNewMatch({
            matchday: 1,
            date: '',
            time: '',
            venue: 'Pitch A',
            status: 'scheduled',
            homeScore: 0,
            awayScore: 0,
            events: [],
        });
    };

    const getTeamName = (teamId: string) => {
        return teams.find((t: Team) => t.id === teamId)?.name || 'Unknown';
    };

    const getTeamPlayers = (teamId: string) => {
        return teams.find((t: Team) => t.id === teamId)?.squad || [];
    };

    const addEventToSelectedMatch = () => {
        if (!selectedMatch || !newEvent.minute || !newEvent.playerId) return;

        const player = getTeamPlayers(newEvent.teamId || '').find((p: Player) => p.id === newEvent.playerId);
        const assistPlayer = newEvent.assistPlayerId
            ? getTeamPlayers(newEvent.teamId || '').find((p: Player) => p.id === newEvent.assistPlayerId)
            : null;

        const event: MatchEvent = {
            id: `e${Date.now()}`,
            minute: newEvent.minute || 0,
            type: (newEvent.type as MatchEvent['type']) || 'goal',
            playerId: newEvent.playerId || '',
            playerName: player?.name || 'Unknown',
            teamId: newEvent.teamId || '',
            assistPlayerId: newEvent.assistPlayerId,
            assistPlayerName: assistPlayer?.name,
            description: newEvent.description || `${player?.name} ${newEvent.type}`,
        };

        setSelectedMatch({
            ...selectedMatch,
            events: [...(selectedMatch.events || []), event].sort((a, b) => a.minute - b.minute),
        });

        setNewEvent({
            minute: 0,
            type: 'goal',
            playerId: '',
            teamId: '',
            description: '',
        });
    };

    const removeEventFromSelectedMatch = (eventId: string) => {
        if (!selectedMatch) return;
        setSelectedMatch({
            ...selectedMatch,
            events: selectedMatch.events?.filter((e: MatchEvent) => e.id !== eventId) || [],
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'text-red-400 border-red-500/50';
            case 'finished': return 'text-emerald-400 border-emerald-500/50';
            case 'postponed': return 'text-yellow-400 border-yellow-500/50';
            default: return 'text-[#A9B3C7] border-[#D4A018]/20';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'live': return 'bg-red-500/20 text-red-400';
            case 'finished': return 'bg-emerald-500/20 text-emerald-400';
            case 'postponed': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-[#D4A018]/10 text-[#D4A018]';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A018]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#D4A018]" />
                    Matches Management
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-[#D4A018] text-[#0B0F1C] px-4 py-2 rounded-lg font-bold hover:bg-[#B38612] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Match
                </button>
            </div>

            {/* Matches List */}
            {matches.length === 0 ? (
                <div className="text-center py-16 bg-[#141B2D] rounded-xl border border-[#D4A018]/10">
                    <Calendar className="w-16 h-16 text-[#D4A018]/30 mx-auto mb-4" />
                    <p className="text-[#A9B3C7] text-lg">No matches scheduled yet.</p>
                    <p className="text-[#6B7280] text-sm mt-2">Click "Add Match" to create your first match.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {matches.map((match: Match) => (
                        <div key={match.id} className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                {/* Match Info */}
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(match.status)}`}>
                                            {match.status.toUpperCase()}
                                        </span>
                                        {match.round && (
                                            <span className="px-2 py-1 rounded text-xs bg-[#D4A018]/20 text-[#D4A018]">
                                                {ROUNDS.find(r => r.value === match.round)?.label || match.round}
                                            </span>
                                        )}
                                        <span className="text-[#A9B3C7] text-sm flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> {match.date} {match.time}
                                        </span>
                                        <span className="text-[#A9B3C7] text-sm flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> {match.venue}
                                        </span>
                                    </div>

                                    {/* Teams & Score */}
                                    <div className="flex items-center justify-center gap-4 py-2">
                                        <div className="text-right flex-1">
                                            <p className="font-bold text-lg">{getTeamName(match.homeTeamId)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-[#0B0F1C] px-4 py-2 rounded-lg">
                                            <span className="text-2xl font-bold">{match.homeScore}</span>
                                            <span className="text-[#6B7280]">-</span>
                                            <span className="text-2xl font-bold">{match.awayScore}</span>
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-lg">{getTeamName(match.awayTeamId)}</p>
                                        </div>
                                    </div>

                                    {/* MVP */}
                                    {match.mvp && (
                                        <div className="flex items-center justify-center gap-2 mt-2 text-sm">
                                            <Trophy className="w-4 h-4 text-[#D4A018]" />
                                            <span className="text-[#A9B3C7]">MVP:</span>
                                            <span className="text-[#D4A018] font-bold">{match.mvpName || 'Unknown'}</span>
                                        </div>
                                    )}

                                    {/* Events Summary */}
                                    {match.events && match.events.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                            {match.events.slice(0, 5).map((event: MatchEvent, idx: number) => (
                                                <span key={idx} className="text-xs bg-[#0B0F1C] px-2 py-1 rounded">
                                                    {EVENT_TYPES.find(t => t.value === event.type)?.label.split(' ')[0]} {event.minute}' {event.playerName}
                                                </span>
                                            ))}
                                            {match.events.length > 5 && (
                                                <span className="text-xs text-[#A9B3C7]">+{match.events.length - 5} more</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedMatch(match);
                                            setShowEditModal(true);
                                        }}
                                        className="p-2 bg-[#D4A018]/10 text-[#D4A018] rounded hover:bg-[#D4A018]/20"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedMatch(match);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Match Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141B2D] w-full max-w-2xl rounded-2xl border border-[#D4A018]/20 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[#F4F6FA]">Create New Match</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMatch} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Home Team *</label>
                                    <select
                                        required
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newMatch.homeTeamId}
                                        onChange={(e) => setNewMatch({ ...newMatch, homeTeamId: e.target.value })}
                                    >
                                        <option value="">Select Home Team</option>
                                        {teams.map((t: Team) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Away Team *</label>
                                    <select
                                        required
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newMatch.awayTeamId}
                                        onChange={(e) => setNewMatch({ ...newMatch, awayTeamId: e.target.value })}
                                    >
                                        <option value="">Select Away Team</option>
                                        {teams.map((t: Team) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newMatch.date}
                                        onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Time *</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newMatch.time}
                                        onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Venue</label>
                                    <select
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newMatch.venue}
                                        onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                                    >
                                        <option value="Pitch A">Pitch A</option>
                                        <option value="Pitch B">Pitch B</option>
                                        <option value="Main Stadium">Main Stadium</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Round</label>
                                    <select
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newMatch.round || ''}
                                        onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })}
                                    >
                                        {ROUNDS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Matchday</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newMatch.matchday}
                                        onChange={(e) => setNewMatch({ ...newMatch, matchday: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#D4A018]/10">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg text-[#F4F6FA] hover:bg-[#1a2340]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#D4A018] text-[#0B0F1C] font-bold rounded-lg hover:bg-[#B38612]"
                                >
                                    Create Match
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Match Modal */}
            {showEditModal && selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#141B2D] w-full max-w-4xl rounded-2xl border border-[#D4A018]/20 p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[#F4F6FA]">
                                Edit Match: {getTeamName(selectedMatch.homeTeamId)} vs {getTeamName(selectedMatch.awayTeamId)}
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Score & Status */}
                            <div className="bg-[#0B0F1C] p-4 rounded-xl">
                                <h4 className="font-bold text-[#D4A018] mb-4">Score & Status</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#A9B3C7] mb-1">Home Score</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className="w-full bg-[#141B2D] p-3 rounded border border-[#D4A018]/20 text-center text-2xl font-bold text-[#F4F6FA]"
                                            value={selectedMatch.homeScore}
                                            onChange={(e) => setSelectedMatch({ ...selectedMatch, homeScore: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#A9B3C7] mb-1">Away Score</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className="w-full bg-[#141B2D] p-3 rounded border border-[#D4A018]/20 text-center text-2xl font-bold text-[#F4F6FA]"
                                            value={selectedMatch.awayScore}
                                            onChange={(e) => setSelectedMatch({ ...selectedMatch, awayScore: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#A9B3C7] mb-1">Status</label>
                                        <select
                                            className={`w-full bg-[#141B2D] p-3 rounded border text-[#F4F6FA] ${getStatusColor(selectedMatch.status)}`}
                                            value={selectedMatch.status}
                                            onChange={(e) => setSelectedMatch({ ...selectedMatch, status: e.target.value as Match['status'] })}
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="live">Live</option>
                                            <option value="finished">Finished</option>
                                            <option value="postponed">Postponed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#A9B3C7] mb-1">Round</label>
                                        <select
                                            className="w-full bg-[#141B2D] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                            value={selectedMatch.round || ''}
                                            onChange={(e) => setSelectedMatch({ ...selectedMatch, round: e.target.value })}
                                        >
                                            {ROUNDS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Match Details */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedMatch.date}
                                        onChange={(e) => setSelectedMatch({ ...selectedMatch, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedMatch.time}
                                        onChange={(e) => setSelectedMatch({ ...selectedMatch, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Venue</label>
                                    <select
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedMatch.venue}
                                        onChange={(e) => setSelectedMatch({ ...selectedMatch, venue: e.target.value })}
                                    >
                                        <option value="Pitch A">Pitch A</option>
                                        <option value="Pitch B">Pitch B</option>
                                        <option value="Main Stadium">Main Stadium</option>
                                    </select>
                                </div>
                            </div>

                            {/* MVP Selection */}
                            <div className="bg-[#0B0F1C] p-4 rounded-xl">
                                <h4 className="font-bold text-[#D4A018] mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5" /> MVP Selection
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="w-full bg-[#141B2D] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedMatch.mvp || ''}
                                        onChange={(e) => {
                                            const playerId = e.target.value;
                                            const allPlayers = [
                                                ...getTeamPlayers(selectedMatch.homeTeamId),
                                                ...getTeamPlayers(selectedMatch.awayTeamId),
                                            ];
                                            const player = allPlayers.find(p => p.id === playerId);
                                            setSelectedMatch({
                                                ...selectedMatch,
                                                mvp: playerId,
                                                mvpName: player?.name
                                            });
                                        }}
                                    >
                                        <option value="">Select MVP</option>
                                        <optgroup label={getTeamName(selectedMatch.homeTeamId)}>
                                            {getTeamPlayers(selectedMatch.homeTeamId).map((p: Player) => (
                                                <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label={getTeamName(selectedMatch.awayTeamId)}>
                                            {getTeamPlayers(selectedMatch.awayTeamId).map((p: Player) => (
                                                <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    {selectedMatch.mvp && (
                                        <div className="flex items-center gap-2 text-[#D4A018]">
                                            <Trophy className="w-5 h-5" />
                                            <span className="font-bold">{selectedMatch.mvpName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Events */}
                            <div className="bg-[#0B0F1C] p-4 rounded-xl">
                                <h4 className="font-bold text-[#D4A018] mb-4">Match Events</h4>

                                {/* Add Event Form */}
                                <div className="grid grid-cols-6 gap-2 mb-4">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        min={0}
                                        max={120}
                                        className="bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm text-[#F4F6FA]"
                                        value={newEvent.minute || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, minute: parseInt(e.target.value) || 0 })}
                                    />
                                    <select
                                        className="bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm text-[#F4F6FA]"
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as MatchEvent['type'] })}
                                    >
                                        {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <select
                                        className="bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm text-[#F4F6FA]"
                                        value={newEvent.teamId}
                                        onChange={(e) => setNewEvent({ ...newEvent, teamId: e.target.value, playerId: '' })}
                                    >
                                        <option value="">Team</option>
                                        <option value={selectedMatch.homeTeamId}>{getTeamName(selectedMatch.homeTeamId)}</option>
                                        <option value={selectedMatch.awayTeamId}>{getTeamName(selectedMatch.awayTeamId)}</option>
                                    </select>
                                    <select
                                        className="bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm text-[#F4F6FA]"
                                        value={newEvent.playerId}
                                        onChange={(e) => setNewEvent({ ...newEvent, playerId: e.target.value })}
                                        disabled={!newEvent.teamId}
                                    >
                                        <option value="">Player</option>
                                        {getTeamPlayers(newEvent.teamId || '').map((p: Player) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {newEvent.type === 'goal' && (
                                        <select
                                            className="bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm text-[#F4F6FA]"
                                            value={newEvent.assistPlayerId || ''}
                                            onChange={(e) => setNewEvent({ ...newEvent, assistPlayerId: e.target.value || undefined })}
                                            disabled={!newEvent.teamId}
                                        >
                                            <option value="">Assist (opt)</option>
                                            {getTeamPlayers(newEvent.teamId || '').map((p: Player) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addEventToSelectedMatch}
                                        className="bg-[#D4A018] text-[#0B0F1C] font-bold rounded hover:bg-[#B38612]"
                                    >
                                        <Plus className="w-5 h-5 mx-auto" />
                                    </button>
                                </div>

                                {/* Events List */}
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedMatch.events?.length === 0 ? (
                                        <p className="text-[#A9B3C7] text-center py-4">No events yet</p>
                                    ) : (
                                        selectedMatch.events?.map((event: MatchEvent) => (
                                            <div key={event.id} className="flex items-center justify-between bg-[#141B2D] p-2 rounded">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[#D4A018] font-bold">{event.minute}'</span>
                                                    <span className={EVENT_TYPES.find(t => t.value === event.type)?.color}>
                                                        {EVENT_TYPES.find(t => t.value === event.type)?.label.split(' ')[0]}
                                                    </span>
                                                    <span className="text-[#F4F6FA]">{event.playerName}</span>
                                                    {event.assistPlayerName && (
                                                        <span className="text-[#A9B3C7] text-sm">(assist: {event.assistPlayerName})</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeEventFromSelectedMatch(event.id)}
                                                    className="p-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-[#D4A018]/10">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg text-[#F4F6FA] hover:bg-[#1a2340]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpdateMatch}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#D4A018] text-[#0B0F1C] font-bold rounded-lg hover:bg-[#B38612]"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141B2D] w-full max-w-sm rounded-2xl border border-red-500/20 p-6">
                        <h3 className="text-xl font-bold text-[#F4F6FA] mb-4">Delete Match?</h3>
                        <p className="text-[#A9B3C7] mb-6">
                            Are you sure you want to delete this match? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg hover:bg-[#141B2D]/80 transition-colors text-[#F4F6FA]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteMatch}
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
