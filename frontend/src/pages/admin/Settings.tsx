import { useEffect, useState } from 'react';
import { Save, Upload, Globe, Sun, Moon, Cloud, Wind, Droplets, Type, Image, Trophy, RefreshCw } from 'lucide-react';

interface SiteConfig {
    title: string;
    subtitle: string;
    heroSubtitle: string;
    heroTitle1: string;
    heroTitle2: string;
    heroTitle3: string;
    logoPath: string;
    autoUpdateMatches: boolean;
    featuredMatchId: string;
    matchStage: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    weatherTemp: number;
    weatherCondition: string;
    weatherWind: number;
    weatherHumidity: number;
}

const WEATHER_CONDITIONS = [
    'Clear',
    'Sunny',
    'Partly Cloudy',
    'Cloudy',
    'Rainy',
    'Stormy',
    'Snowy',
];

export default function Settings() {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/admin/config');
            if (response.ok) {
                const data = await response.json();
                setConfig(data);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch('/api/admin/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (response.ok) {
                const data = await response.json();
                setConfig(data);
                setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                setSaveMessage({ type: 'error', text: 'Failed to save settings' });
            }
        } catch (error) {
            console.error('Error saving config:', error);
            setSaveMessage({ type: 'error', text: 'Error saving settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async () => {
        if (!logoFile || !config) return;

        const formData = new FormData();
        formData.append('logo', logoFile);
        formData.append('title', config.title);
        formData.append('subtitle', config.subtitle);

        try {
            const response = await fetch('/api/admin/config', {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setConfig(data);
                setLogoFile(null);
                setPreviewLogo(null);
                setSaveMessage({ type: 'success', text: 'Logo uploaded successfully!' });
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            setSaveMessage({ type: 'error', text: 'Failed to upload logo' });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewLogo(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A018]"></div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="text-center py-16">
                <p className="text-[#A9B3C7]">Failed to load settings</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Globe className="w-6 h-6 text-[#D4A018]" />
                    Website Settings
                </h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#D4A018] text-[#0B0F1C] px-4 py-2 rounded-lg font-bold hover:bg-[#B38612] transition-colors disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={`p-4 rounded-xl ${saveMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {saveMessage.text}
                </div>
            )}

            {/* General Settings */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5 text-[#D4A018]" /> General Settings
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Website Title</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.title}
                            onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Subtitle</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.subtitle}
                            onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm text-[#A9B3C7] mb-1">Hero Subtitle</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.heroSubtitle}
                            onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Hero Title Line 1</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.heroTitle1}
                            onChange={(e) => setConfig({ ...config, heroTitle1: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Hero Title Line 2</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.heroTitle2}
                            onChange={(e) => setConfig({ ...config, heroTitle2: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Hero Title Line 3</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.heroTitle3}
                            onChange={(e) => setConfig({ ...config, heroTitle3: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Match Stage</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.matchStage}
                            onChange={(e) => setConfig({ ...config, matchStage: e.target.value })}
                            placeholder="e.g., League Match, Quarter Finals"
                        />
                    </div>
                </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-[#D4A018]" /> Website Logo
                </h3>
                
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-[#0B0F1C] rounded-xl flex items-center justify-center border border-[#D4A018]/20 overflow-hidden">
                        {previewLogo ? (
                            <img src={previewLogo} alt="Preview" className="w-full h-full object-contain" />
                        ) : config.logoPath ? (
                            <img src={config.logoPath} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-[#A9B3C7] text-sm">No Logo</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA] mb-2"
                        />
                        {logoFile && (
                            <button
                                onClick={handleLogoUpload}
                                className="flex items-center gap-2 bg-[#D4A018] text-[#0B0F1C] px-4 py-2 rounded-lg font-bold hover:bg-[#B38612]"
                            >
                                <Upload className="w-4 h-4" /> Upload Logo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Prayer Times */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-[#D4A018]" /> Prayer Times
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { key: 'fajr', label: 'Fajr', icon: Moon },
                        { key: 'sunrise', label: 'Sunrise', icon: Sun },
                        { key: 'dhuhr', label: 'Dhuhr', icon: Sun },
                        { key: 'asr', label: 'Asr', icon: Sun },
                        { key: 'maghrib', label: 'Maghrib', icon: Moon },
                        { key: 'isha', label: 'Isha', icon: Moon },
                    ].map(({ key, label, icon: Icon }) => (
                        <div key={key}>
                            <label className="block text-sm text-[#A9B3C7] mb-1 flex items-center gap-1">
                                <Icon className="w-4 h-4" /> {label}
                            </label>
                            <input
                                type="time"
                                className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                value={config[key as keyof SiteConfig] as string}
                                onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Weather */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-[#D4A018]" /> Weather Settings
                </h3>
                
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Temperature (°C)</label>
                        <input
                            type="number"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.weatherTemp}
                            onChange={(e) => setConfig({ ...config, weatherTemp: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Condition</label>
                        <select
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.weatherCondition}
                            onChange={(e) => setConfig({ ...config, weatherCondition: e.target.value })}
                        >
                            {WEATHER_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1 flex items-center gap-1">
                            <Wind className="w-4 h-4" /> Wind (km/h)
                        </label>
                        <input
                            type="number"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.weatherWind}
                            onChange={(e) => setConfig({ ...config, weatherWind: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1 flex items-center gap-1">
                            <Droplets className="w-4 h-4" /> Humidity (%)
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.weatherHumidity}
                            onChange={(e) => setConfig({ ...config, weatherHumidity: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#D4A018]" /> Advanced Settings
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0B0F1C] rounded-lg">
                        <div>
                            <p className="font-bold text-[#F4F6FA]">Auto-update Matches</p>
                            <p className="text-sm text-[#A9B3C7]">Automatically update match status based on time</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.autoUpdateMatches}
                                onChange={(e) => setConfig({ ...config, autoUpdateMatches: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-[#0B0F1C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A018]"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Featured Match ID</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                            value={config.featuredMatchId}
                            onChange={(e) => setConfig({ ...config, featuredMatchId: e.target.value })}
                            placeholder="Enter match ID to feature on homepage"
                        />
                        <p className="text-xs text-[#A9B3C7] mt-1">Leave empty to show the next upcoming match</p>
                    </div>
                </div>
            </div>

            {/* Save Button (Bottom) */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#D4A018] text-[#0B0F1C] px-6 py-3 rounded-lg font-bold hover:bg-[#B38612] transition-colors disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
