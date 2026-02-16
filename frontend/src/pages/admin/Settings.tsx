import { useState } from 'react';
import { Save, Upload, Globe, Image, Trophy, RefreshCw } from 'lucide-react';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { API_URL } from '@/lib/api';

export default function Settings() {
    const { config, isLoading, refreshConfig, updateLocalConfig } = useSiteConfig();
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (response.ok) {
                // Refresh the global config so homepage picks up changes immediately
                refreshConfig();
                setSaveMessage({ type: 'success', text: '✅ Settings saved! Changes are now live on the homepage.' });
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
            const response = await fetch(`${API_URL}/api/admin/config`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                setLogoFile(null);
                setPreviewLogo(null);
                refreshConfig();
                setSaveMessage({ type: 'success', text: '✅ Logo uploaded! Changes are now live.' });
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

    if (isLoading) {
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

            {/* All Settings in One Card */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#D4A018]" /> Site Configuration
                </h3>

                <div className="space-y-8">
                    {/* Branding & Logo */}
                    <div>
                        <h4 className="text-sm font-semibold text-[#D4A018] uppercase tracking-wider mb-4">Branding</h4>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Website Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={config.title}
                                    onChange={(e) => updateLocalConfig({ title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={config.subtitle}
                                    onChange={(e) => updateLocalConfig({ subtitle: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-[#A9B3C7] mb-1">Website Logo</label>
                            <div className="flex items-center gap-4 p-3 bg-[#0B0F1C] rounded border border-[#D4A018]/20">
                                <div className="w-16 h-16 rounded-lg flex items-center justify-center border border-[#D4A018]/20 overflow-hidden bg-[#141B2D] flex-shrink-0">
                                    {previewLogo ? (
                                        <img src={previewLogo} alt="Preview" className="w-full h-full object-contain" />
                                    ) : config.logoPath ? (
                                        <img src={config.logoPath} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Image className="w-5 h-5 text-[#A9B3C7]" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full bg-[#0B0F1C] text-[#F4F6FA] text-sm"
                                    />
                                </div>
                                {logoFile && (
                                    <button
                                        onClick={handleLogoUpload}
                                        className="flex items-center gap-1 bg-[#D4A018] text-[#0B0F1C] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#B38612] flex-shrink-0"
                                    >
                                        <Upload className="w-3 h-3" /> Upload
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <hr className="border-[#D4A018]/10" />

                    {/* Hero Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-[#D4A018] uppercase tracking-wider mb-4">Hero Section</h4>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Title Line 1</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={config.heroTitle1}
                                    onChange={(e) => updateLocalConfig({ heroTitle1: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Title Line 2</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={config.heroTitle2}
                                    onChange={(e) => updateLocalConfig({ heroTitle2: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Title Line 3</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={config.heroTitle3}
                                    onChange={(e) => updateLocalConfig({ heroTitle3: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-[#A9B3C7] mb-1">Hero Subtitle</label>
                            <input
                                type="text"
                                className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                value={config.heroSubtitle}
                                onChange={(e) => updateLocalConfig({ heroSubtitle: e.target.value })}
                            />
                        </div>
                    </div>

                    <hr className="border-[#D4A018]/10" />

                    {/* Match Settings */}
                    <div>
                        <h4 className="text-sm font-semibold text-[#D4A018] uppercase tracking-wider mb-4">Match Settings</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Match Stage</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={config.matchStage}
                                    onChange={(e) => updateLocalConfig({ matchStage: e.target.value })}
                                    placeholder="e.g., League Match, Quarter Finals"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#A9B3C7] mb-1">Featured Match ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0B0F1C] p-3 rounded border border-[#D4A018]/20 text-[#F4F6FA]"
                                    value={config.featuredMatchId}
                                    onChange={(e) => updateLocalConfig({ featuredMatchId: e.target.value })}
                                    placeholder="Leave empty for next upcoming match"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#0B0F1C] rounded-lg mt-4">
                            <div>
                                <p className="font-bold text-[#F4F6FA]">Auto-update Matches</p>
                                <p className="text-sm text-[#A9B3C7]">Automatically update match status based on time</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.autoUpdateMatches}
                                    onChange={(e) => updateLocalConfig({ autoUpdateMatches: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-[#0B0F1C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A018]"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info about automatic features */}
            <div className="bg-[#0D1A12]/40 p-4 rounded-xl border border-emerald-500/20">
                <p className="text-sm text-emerald-400">
                    ℹ️ <strong>Prayer Times</strong> and <strong>Weather</strong> are automatically fetched for Oujda — no configuration needed.
                </p>
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
