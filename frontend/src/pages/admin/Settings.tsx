import { useState, useRef, useEffect } from 'react';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Save, Upload, ImageIcon } from 'lucide-react';

export default function Settings() {
    const { config, updateLocalConfig } = useSiteConfig();
    const [title, setTitle] = useState(config.title);
    const [subtitle, setSubtitle] = useState(config.subtitle);
    const [heroSubtitle, setHeroSubtitle] = useState(config.heroSubtitle);
    const [heroTitle1, setHeroTitle1] = useState(config.heroTitle1);
    const [heroTitle2, setHeroTitle2] = useState(config.heroTitle2);
    const [heroTitle3, setHeroTitle3] = useState(config.heroTitle3);
    const [autoUpdateMatches, setAutoUpdateMatches] = useState(config.autoUpdateMatches);
    const [featuredMatchId, setFeaturedMatchId] = useState(config.featuredMatchId);
    const [matchStage, setMatchStage] = useState(config.matchStage);

    // For featured match dropdown
    const [matches, setMatches] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitle(config.title);
        setSubtitle(config.subtitle);
        setHeroSubtitle(config.heroSubtitle);
        setHeroTitle1(config.heroTitle1);
        setHeroTitle2(config.heroTitle2);
        setHeroTitle3(config.heroTitle3);
        setAutoUpdateMatches(config.autoUpdateMatches);
        setFeaturedMatchId(config.featuredMatchId);
        setMatchStage(config.matchStage);
    }, [config]);

    // Fetch Matches and Teams for dropdown
    useEffect(() => {
        if (!autoUpdateMatches) {
            Promise.all([
                fetch('/api/matches').then(res => res.json()),
                fetch('/api/teams').then(res => res.json())
            ]).then(([matchesData, teamsData]) => {
                setMatches(matchesData || []);
                setTeams(teamsData || []);
            }).catch(err => console.error("Failed to fetch data for dropdown", err));
        }
    }, [autoUpdateMatches]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('heroSubtitle', heroSubtitle);
        formData.append('heroTitle1', heroTitle1);
        formData.append('heroTitle2', heroTitle2);
        formData.append('heroTitle3', heroTitle3);
        formData.append('autoUpdateMatches', String(autoUpdateMatches));
        formData.append('featuredMatchId', featuredMatchId || '');
        formData.append('matchStage', matchStage);

        if (fileInputRef.current?.files?.[0]) {
            formData.append('logo', fileInputRef.current.files[0]);
        }

        try {
            const res = await fetch('/api/admin/config', {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                updateLocalConfig(data);
                setMessage('Settings updated successfully!');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setMessage('Failed to update settings');
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#F4F6FA]">Site Settings</h2>
            </div>

            <div className="card-gold p-8 rounded-2xl max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#A9B3C7]">Website Logo</label>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-xl bg-[#141B2D] border border-[#D4A018]/20 flex items-center justify-center overflow-hidden">
                                {config.logoPath ? (
                                    <img src={config.logoPath} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-[#D4A018]/50" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={() => { }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 rounded-lg bg-[#141B2D] border border-[#D4A018]/30 text-[#D4A018] hover:bg-[#D4A018]/10 transition-colors flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload New Logo
                                </button>
                                <p className="text-xs text-[#6B7280] mt-2">Recommended: 512x512px, PNG or SVG</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#A9B3C7]">Site Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors"
                                placeholder="Zone 01 Oujda"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#A9B3C7]">Subtitle / Event Name</label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors"
                                placeholder="RFL 2026"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#A9B3C7]">Hero Subtitle (Main Page)</label>
                        <input
                            type="text"
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors"
                            placeholder="Zone 01 Oujda • School Tournament 2026"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#A9B3C7]">Hero Title Line 1 (White)</label>
                            <input
                                type="text"
                                value={heroTitle1}
                                onChange={(e) => setHeroTitle1(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors"
                                placeholder="RAMADAN"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#A9B3C7]">Hero Title Line 2 (Gold)</label>
                            <input
                                type="text"
                                value={heroTitle2}
                                onChange={(e) => setHeroTitle2(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors"
                                placeholder="FOOTBALL"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#A9B3C7]">Hero Title Line 3 (White)</label>
                            <input
                                type="text"
                                value={heroTitle3}
                                onChange={(e) => setHeroTitle3(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors"
                                placeholder="LEAGUE"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-[#D4A018]/10">
                        <h3 className="text-lg font-bold text-[#F4F6FA]">Match of the Day Settings</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={autoUpdateMatches}
                                        onChange={(e) => setAutoUpdateMatches(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-[#0B0F1C] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D4A018]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A018]"></div>
                                    <span className="ml-3 text-sm font-medium text-[#F4F6FA]">
                                        Auto-Update "Next Match" based on time
                                    </span>
                                </label>
                            </div>
                            <p className="text-xs text-[#A9B3C7] ml-14">
                                If enabled, the homepage will automatically display the next upcoming match (or current live one).
                                <br />
                                If disabled, you can manually select which match to feature below.
                            </p>

                            {!autoUpdateMatches && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-medium text-[#A9B3C7]">Select Featured Match</label>
                                    <select
                                        value={featuredMatchId}
                                        onChange={(e) => setFeaturedMatchId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors appearance-none"
                                    >
                                        <option value="">-- Select a Match --</option>
                                        {matches.map(m => {
                                            const home = teams.find(t => t.id === m.homeTeamId)?.teamName || 'Unknown';
                                            const away = teams.find(t => t.id === m.awayTeamId)?.teamName || 'Unknown';
                                            return (
                                                <option key={m.id} value={m.id}>
                                                    {m.date} {m.time} - {home} vs {away}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#A9B3C7]">Match Stage Label</label>
                                <input
                                    type="text"
                                    value={matchStage}
                                    onChange={(e) => setMatchStage(e.target.value)}
                                    placeholder="e.g. Semi-Final, Group Stage"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0B0F1C] border border-[#D4A018]/20 text-[#F4F6FA] focus:border-[#D4A018] focus:outline-none transition-colors"
                                />
                                <p className="text-xs text-[#A9B3C7]">
                                    This text appears above the "Match of the Day" section (e.g. "Semi-Final").
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        {message && (
                            <span className={`text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                                {message}
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
