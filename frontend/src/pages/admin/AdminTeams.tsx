import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Edit, Users, Trophy, X, ChevronDown, ChevronUp } from 'lucide-react';

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
    cohort: string;
    captain: string;
    captainEmail: string;
    captainPhone: string;
    motto: string;
    primaryColor: string;
    secondaryColor: string;
    qrCode: string;
    squad: Player[];
    registeredAt: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form: string[];
    ramadanSpirit: number;
}

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const;

export default function AdminTeams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    // New team form state
    const [newTeam, setNewTeam] = useState<Partial<Team>>({
        name: '',
        shortName: '',
        cohort: '',
        captain: '',
        captainEmail: '',
        captainPhone: '',
        motto: '',
        primaryColor: '#D4A018',
        secondaryColor: '#0B0F1C',
    });
    const [newPlayers, setNewPlayers] = useState<Partial<Player>[]>([]);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch('/api/admin/teams');
            if (response.ok) {
                const data = await response.json();
                setTeams(data || []);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', newTeam.name || '');
        formData.append('shortName', newTeam.shortName || '');
        formData.append('cohort', newTeam.cohort || '');
        formData.append('captain', newTeam.captain || '');
        formData.append('captainEmail', newTeam.captainEmail || '');
        formData.append('captainPhone', newTeam.captainPhone || '');
        formData.append('motto', newTeam.motto || '');
        formData.append('primaryColor', newTeam.primaryColor || '#D4A018');
        formData.append('secondaryColor', newTeam.secondaryColor || '#0B0F1C');

        const validPlayers = newPlayers.filter((p: Partial<Player>) => p.name && p.position) as Player[];
        formData.append('players', JSON.stringify(validPlayers));

        if (logoFile) {
            formData.append('logo', logoFile);
        }

        try {
            const response = await fetch('/api/admin/teams', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                fetchTeams();
                setShowCreateModal(false);
                resetNewTeam();
            } else {
                alert('Failed to create team');
            }
        } catch (error) {
            console.error('Failed to create team:', error);
            alert('Error creating team');
        }
    };

    const handleUpdateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeam) return;

        try {
            const response = await fetch('/api/admin/teams', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedTeam),
            });
            if (response.ok) {
                fetchTeams();
                setShowEditModal(false);
                setSelectedTeam(null);
            } else {
                alert('Failed to update team');
            }
        } catch (error) {
            console.error('Failed to update team:', error);
            alert('Error updating team');
        }
    };

    const handleDeleteTeam = async () => {
        if (!selectedTeam) return;
        try {
            const response = await fetch(`/api/admin/teams?id=${selectedTeam.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchTeams();
                setShowDeleteModal(false);
                setSelectedTeam(null);
            } else {
                alert('Failed to delete team');
            }
        } catch (error) {
            console.error('Failed to delete team:', error);
            alert('Error deleting team');
        }
    };

    const resetNewTeam = () => {
        setNewTeam({
            name: '',
            shortName: '',
            cohort: '',
            captain: '',
            captainEmail: '',
            captainPhone: '',
            motto: '',
            primaryColor: '#D4A018',
            secondaryColor: '#0B0F1C',
        });
        setNewPlayers([]);
        setLogoFile(null);
    };

    const addNewPlayer = () => {
        setNewPlayers([...newPlayers, {
            name: '',
            number: newPlayers.length + 1,
            position: 'DEF',
            isCaptain: false,
            isSubstitute: newPlayers.length >= 7,
            goals: 0,
            assists: 0,
            cleanSheets: 0,
            yellowCards: 0,
            redCards: 0,
            matchesPlayed: 0,
        }]);
    };

    const updateNewPlayer = <K extends keyof Player>(index: number, field: K, value: Player[K]) => {
        const updated = [...newPlayers];
        updated[index] = { ...updated[index], [field]: value };
        setNewPlayers(updated);
    };

    const removeNewPlayer = (index: number) => {
        setNewPlayers(newPlayers.filter((_: Partial<Player>, i: number) => i !== index));
    };

    const updateSelectedTeamPlayer = <K extends keyof Player>(playerIndex: number, field: K, value: Player[K]) => {
        if (!selectedTeam) return;
        const updatedSquad = [...selectedTeam.squad];
        updatedSquad[playerIndex] = { ...updatedSquad[playerIndex], [field]: value };
        setSelectedTeam({ ...selectedTeam, squad: updatedSquad });
    };

    const addPlayerToSelectedTeam = () => {
        if (!selectedTeam) return;
        const newPlayer: Player = {
            id: `p${Date.now()}`,
            teamId: selectedTeam.id,
            name: '',
            number: selectedTeam.squad.length + 1,
            position: 'DEF',
            isCaptain: false,
            isSubstitute: selectedTeam.squad.length >= 7,
            goals: 0,
            assists: 0,
            cleanSheets: 0,
            yellowCards: 0,
            redCards: 0,
            matchesPlayed: 0,
        };
        setSelectedTeam({ ...selectedTeam, squad: [...selectedTeam.squad, newPlayer] });
    };

    const removePlayerFromSelectedTeam = (index: number) => {
        if (!selectedTeam) return;
        setSelectedTeam({ ...selectedTeam, squad: selectedTeam.squad.filter((_: Player, i: number) => i !== index) });
    };

    const getFormArray = (form: string[]): string[] => {
        return form || [];
    };

    const updateForm = (index: number, value: string) => {
        if (!selectedTeam) return;
        const formArray = [...(selectedTeam.form || [])];
        formArray[index] = value;
        setSelectedTeam({ ...selectedTeam, form: formArray });
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
                    <Users className="w-6 h-6 text-[#D4A018]" />
                    Teams Management
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-[#D4A018] text-[#0B0F1C] px-4 py-2 rounded-lg font-bold hover:bg-[#B38612] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Team
                </button>
            </div>

            {/* Teams List */}
            {teams.length === 0 ? (
                <div className="text-center py-16 bg-[#141B2D] rounded-xl border border-[#D4A018]/10">
                    <Users className="w-16 h-16 text-[#D4A018]/30 mx-auto mb-4" />
                    <p className="text-[#A9B3C7] text-lg">No teams registered yet.</p>
                    <p className="text-[#6B7280] text-sm mt-2">Click "Add Team" to create your first team.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {teams.map((team: Team) => (
                        <div key={team.id} className="bg-[#141B2D] rounded-xl border border-[#D4A018]/10 overflow-hidden">
                            {/* Team Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a2340] transition-colors"
                                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                            >
                                <div className="flex items-center gap-4">
                                    {team.logoPath ? (
                                        <img src={team.logoPath} alt={team.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#D4A018]/20 flex items-center justify-center">
                                            <span className="text-[#D4A018] font-bold">{team.shortName || team.name.slice(0, 3).toUpperCase()}</span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg">{team.name}</h3>
                                        <p className="text-[#A9B3C7] text-sm">{team.cohort} • Captain: {team.captain}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm text-[#A9B3C7]">P: {team.played} | W: {team.won} | D: {team.drawn} | L: {team.lost}</p>
                                        <p className="text-sm font-bold text-[#D4A018]">{team.points} Points</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTeam(team);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 bg-[#D4A018]/10 text-[#D4A018] rounded hover:bg-[#D4A018]/20"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTeam(team);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        {expandedTeam === team.id ? <ChevronUp className="w-5 h-5 text-[#A9B3C7]" /> : <ChevronDown className="w-5 h-5 text-[#A9B3C7]" />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Team Details */}
                            {expandedTeam === team.id && (
                                <div className="border-t border-[#D4A018]/10 p-4 bg-[#0B0F1C]/50">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Team Info */}
                                        <div>
                                            <h4 className="font-bold mb-3 text-[#D4A018]">Team Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <p><span className="text-[#A9B3C7]">Motto:</span> {team.motto || 'N/A'}</p>
                                                <p><span className="text-[#A9B3C7]">Email:</span> {team.captainEmail || 'N/A'}</p>
                                                <p><span className="text-[#A9B3C7]">Phone:</span> {team.captainPhone || 'N/A'}</p>
                                                <p><span className="text-[#A9B3C7]">Colors:</span>
                                                    <span className="inline-block w-4 h-4 rounded ml-2 mr-1" style={{ backgroundColor: team.primaryColor }}></span>
                                                    <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: team.secondaryColor }}></span>
                                                </p>
                                                <p><span className="text-[#A9B3C7]">Ramadan Spirit:</span> {team.ramadanSpirit}%</p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div>
                                            <h4 className="font-bold mb-3 text-[#D4A018]">Statistics</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <p><span className="text-[#A9B3C7]">Goals For:</span> {team.goalsFor}</p>
                                                <p><span className="text-[#A9B3C7]">Goals Against:</span> {team.goalsAgainst}</p>
                                                <p><span className="text-[#A9B3C7]">Goal Diff:</span> {team.goalDifference}</p>
                                                <p><span className="text-[#A9B3C7]">Form:</span> {team.form?.join(', ') || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Squad */}
                                    <div className="mt-4">
                                        <h4 className="font-bold mb-3 text-[#D4A018]">Squad ({team.squad?.length || 0} players)</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {team.squad?.map((player: Player) => (
                                                <div key={player.id} className="bg-[#141B2D] p-2 rounded text-center text-sm">
                                                    <p className="font-bold">{player.name}</p>
                                                    <p className="text-[#A9B3C7] text-xs">#{player.number} {player.position}</p>
                                                    {player.isCaptain && <span className="text-[#D4A018] text-xs">(C)</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#141B2D] w-full max-w-4xl rounded-2xl border border-[#D4A018]/20 p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[#F4F6FA]">Create New Team</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTeam} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Team Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Team Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newTeam.name}
                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Short Name (3 letters)</label>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newTeam.shortName}
                                        onChange={(e) => setNewTeam({ ...newTeam, shortName: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Cohort</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newTeam.cohort}
                                        onChange={(e) => setNewTeam({ ...newTeam, cohort: e.target.value })}
                                        placeholder="e.g., Cohort A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Captain Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newTeam.captain}
                                        onChange={(e) => setNewTeam({ ...newTeam, captain: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Captain Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newTeam.captainEmail}
                                        onChange={(e) => setNewTeam({ ...newTeam, captainEmail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Captain Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newTeam.captainPhone}
                                        onChange={(e) => setNewTeam({ ...newTeam, captainPhone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Motto</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={newTeam.motto}
                                        onChange={(e) => setNewTeam({ ...newTeam, motto: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Team Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="h-12 w-12 rounded border border-[#D4A018]/20"
                                            value={newTeam.primaryColor}
                                            onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="flex-1 bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                            value={newTeam.primaryColor}
                                            onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Secondary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="h-12 w-12 rounded border border-[#D4A018]/20"
                                            value={newTeam.secondaryColor}
                                            onChange={(e) => setNewTeam({ ...newTeam, secondaryColor: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="flex-1 bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                            value={newTeam.secondaryColor}
                                            onChange={(e) => setNewTeam({ ...newTeam, secondaryColor: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Players Section */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-[#D4A018]">Squad Players</h4>
                                    <button
                                        type="button"
                                        onClick={addNewPlayer}
                                        className="flex items-center gap-1 text-sm bg-[#D4A018]/20 text-[#D4A018] px-3 py-1 rounded hover:bg-[#D4A018]/30"
                                    >
                                        <Plus className="w-4 h-4" /> Add Player
                                    </button>
                                </div>

                                {newPlayers.length === 0 ? (
                                    <p className="text-[#A9B3C7] text-center py-4">No players added yet. Click "Add Player" to start.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {newPlayers.map((player: Partial<Player>, index: number) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-[#0B0F1C] p-2 rounded">
                                                <div className="col-span-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Player Name"
                                                        className="w-full bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm"
                                                        value={player.name || ''}
                                                        onChange={(e) => updateNewPlayer(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <input
                                                        type="number"
                                                        placeholder="#"
                                                        className="w-full bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm text-center"
                                                        value={player.number || ''}
                                                        onChange={(e) => updateNewPlayer(index, 'number', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <select
                                                        className="w-full bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm"
                                                        value={player.position || 'DEF'}
                                                        onChange={(e) => updateNewPlayer(index, 'position', e.target.value as Player['position'])}
                                                    >
                                                        {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-2 flex gap-2">
                                                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.isCaptain || false}
                                                            onChange={(e) => updateNewPlayer(index, 'isCaptain', e.target.checked)}
                                                        />
                                                        C
                                                    </label>
                                                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.isSubstitute || false}
                                                            onChange={(e) => updateNewPlayer(index, 'isSubstitute', e.target.checked)}
                                                        />
                                                        Sub
                                                    </label>
                                                </div>
                                                <div className="col-span-3 flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewPlayer(index)}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
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
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Team Modal */}
            {showEditModal && selectedTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#141B2D] w-full max-w-5xl rounded-2xl border border-[#D4A018]/20 p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[#F4F6FA]">Edit Team: {selectedTeam.name}</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateTeam} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Tabs */}
                            <div className="flex gap-4 border-b border-[#D4A018]/20 pb-2">
                                <button type="button" className="text-[#D4A018] font-bold border-b-2 border-[#D4A018]">Team Info</button>
                            </div>

                            {/* Team Info */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Team Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.name}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Short Name</label>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.shortName}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, shortName: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Cohort</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.cohort}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, cohort: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Captain</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.captain}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, captain: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.captainEmail}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, captainEmail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.captainPhone}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, captainPhone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Motto</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.motto}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, motto: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Logo URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.logoPath}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, logoPath: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#A9B3C7] mb-1">QR Code URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.qrCode}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, qrCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="border-t border-[#D4A018]/10 pt-4">
                                <h4 className="font-bold text-[#D4A018] mb-3 flex items-center gap-2">
                                    <Trophy className="w-5 h-5" /> Team Statistics
                                </h4>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                    {[
                                        { label: 'Played', key: 'played' },
                                        { label: 'Won', key: 'won' },
                                        { label: 'Drawn', key: 'drawn' },
                                        { label: 'Lost', key: 'lost' },
                                        { label: 'GF', key: 'goalsFor' },
                                        { label: 'GA', key: 'goalsAgainst' },
                                        { label: 'GD', key: 'goalDifference' },
                                        { label: 'Points', key: 'points' },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="block text-xs text-[#A9B3C7] mb-1">{label}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20 text-center text-[#F4F6FA]"
                                                value={selectedTeam[key as keyof Team] as number}
                                                onChange={(e) => setSelectedTeam({ ...selectedTeam, [key]: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Ramadan Spirit (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="w-full bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                        value={selectedTeam.ramadanSpirit}
                                        onChange={(e) => setSelectedTeam({ ...selectedTeam, ramadanSpirit: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="mt-3">
                                    <label className="block text-sm text-[#A9B3C7] mb-1">Form (Last 5 matches: W,L,D,W,W)</label>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <select
                                                key={i}
                                                className="bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                                value={getFormArray(selectedTeam.form)[i] || ''}
                                                onChange={(e) => updateForm(i, e.target.value)}
                                            >
                                                <option value="">-</option>
                                                <option value="W">W</option>
                                                <option value="D">D</option>
                                                <option value="L">L</option>
                                            </select>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="border-t border-[#D4A018]/10 pt-4">
                                <h4 className="font-bold text-[#D4A018] mb-3">Team Colors</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#A9B3C7] mb-1">Primary Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-10 rounded border border-[#D4A018]/20"
                                                value={selectedTeam.primaryColor}
                                                onChange={(e) => setSelectedTeam({ ...selectedTeam, primaryColor: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                className="flex-1 bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                                value={selectedTeam.primaryColor}
                                                onChange={(e) => setSelectedTeam({ ...selectedTeam, primaryColor: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#A9B3C7] mb-1">Secondary Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                className="h-10 w-10 rounded border border-[#D4A018]/20"
                                                value={selectedTeam.secondaryColor}
                                                onChange={(e) => setSelectedTeam({ ...selectedTeam, secondaryColor: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                className="flex-1 bg-[#0B0F1C] p-2 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                                value={selectedTeam.secondaryColor}
                                                onChange={(e) => setSelectedTeam({ ...selectedTeam, secondaryColor: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Players */}
                            <div className="border-t border-[#D4A018]/10 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-[#D4A018]">Squad Players</h4>
                                    <button
                                        type="button"
                                        onClick={addPlayerToSelectedTeam}
                                        className="flex items-center gap-1 text-sm bg-[#D4A018]/20 text-[#D4A018] px-3 py-1 rounded hover:bg-[#D4A018]/30"
                                    >
                                        <Plus className="w-4 h-4" /> Add Player
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {selectedTeam.squad?.map((player: Player, index: number) => (
                                        <div key={player.id} className="grid grid-cols-12 gap-2 items-center bg-[#0B0F1C] p-2 rounded">
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    className="w-full bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm"
                                                    value={player.name}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    className="w-full bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm text-center"
                                                    value={player.number}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'number', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <select
                                                    className="w-full bg-[#141B2D] p-2 rounded border border-[#D4A018]/20 text-sm"
                                                    value={player.position}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'position', e.target.value as Player['position'])}
                                                >
                                                    {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={player.isCaptain}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'isCaptain', e.target.checked)}
                                                    title="Captain"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={player.isSubstitute}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'isSubstitute', e.target.checked)}
                                                    title="Substitute"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    placeholder="G"
                                                    className="w-full bg-[#141B2D] p-1 rounded border border-[#D4A018]/20 text-sm text-center"
                                                    value={player.goals}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'goals', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    placeholder="A"
                                                    className="w-full bg-[#141B2D] p-1 rounded border border-[#D4A018]/20 text-sm text-center"
                                                    value={player.assists}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'assists', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    placeholder="YC"
                                                    className="w-full bg-[#141B2D] p-1 rounded border border-[#D4A018]/20 text-sm text-center"
                                                    value={player.yellowCards}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'yellowCards', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    placeholder="RC"
                                                    className="w-full bg-[#141B2D] p-1 rounded border border-[#D4A018]/20 text-sm text-center"
                                                    value={player.redCards}
                                                    onChange={(e) => updateSelectedTeamPlayer(index, 'redCards', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removePlayerFromSelectedTeam(index)}
                                                    className="p-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 bg-[#D4A018] text-[#0B0F1C] font-bold rounded-lg hover:bg-[#B38612]"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141B2D] w-full max-w-sm rounded-2xl border border-red-500/20 p-6">
                        <h3 className="text-xl font-bold text-[#F4F6FA] mb-4">Delete Team?</h3>
                        <p className="text-[#A9B3C7] mb-6">
                            Are you sure you want to delete <strong>{selectedTeam.name}</strong>? This will also delete all players and cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-[#141B2D] border border-[#D4A018]/20 rounded-lg hover:bg-[#141B2D]/80 transition-colors text-[#F4F6FA]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTeam}
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
