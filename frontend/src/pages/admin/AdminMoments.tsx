import { useState, useEffect, useRef } from 'react';
import { Trash2, Clock, ImageIcon, Upload, Plus } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Moment {
    id: string;
    imageUrl: string;
    caption: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function AdminMoments() {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [newMoment, setNewMoment] = useState({ caption: '', file: null as File | null });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMoments();
    }, []);

    const fetchMoments = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/moments`);
            if (response.ok) {
                const json = await response.json();
                setMoments(json.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch moments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this moment?')) return;

        try {
            const response = await fetch(`${API_URL}/api/admin/moments/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMoments(moments.filter(m => m.id !== id));
            } else {
                alert('Failed to delete moment');
            }
        } catch (error) {
            console.error('Failed to delete moment:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewMoment({ ...newMoment, file: e.target.files[0] });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMoment.file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', newMoment.file);
        formData.append('caption', newMoment.caption);

        try {
            const response = await fetch(`${API_URL}/api/admin/moments`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                await fetchMoments();
                setNewMoment({ caption: '', file: null });
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                alert('Failed to upload moment');
            }
        } catch (error) {
            console.error('Failed to upload moment:', error);
            alert('Error uploading moment');
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-display text-[#F4F6FA]">Manage Moments</h1>

            {/* Upload Section */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-white/5">
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#D4A018]" />
                    Add New Moment
                </h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-[#A9B3C7] mb-2">Photo</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${newMoment.file ? 'border-[#D4A018] bg-[#D4A018]/10' : 'border-white/10 hover:border-[#D4A018]/50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {newMoment.file ? (
                                    <div className="flex items-center justify-center gap-2 text-[#D4A018]">
                                        <ImageIcon className="w-5 h-5" />
                                        <span className="truncate max-w-[200px]">{newMoment.file.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-[#A9B3C7]">
                                        <Upload className="w-5 h-5" />
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-[2]">
                            <label className="block text-sm text-[#A9B3C7] mb-2">Caption / Description</label>
                            <input
                                type="text"
                                value={newMoment.caption}
                                onChange={(e) => setNewMoment({ ...newMoment, caption: e.target.value })}
                                placeholder="Enter a description for this moment..."
                                className="w-full bg-[#0B0F1C] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4A018]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newMoment.file || isUploading}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${!newMoment.file || isUploading
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-[#D4A018] text-[#0B0F1C] hover:bg-[#B38612]'
                                }`}
                        >
                            {isUploading ? 'Uploading...' : 'Add Moment'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Moments List */}
            <div>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">Existing Moments</h2>
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading moments...</div>
                ) : moments.length === 0 ? (
                    <div className="text-center py-12 bg-[#141B2D] rounded-xl border border-dashed border-white/10">
                        <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No moments found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {moments.map((moment) => (
                            <div key={moment.id} className="bg-[#141B2D] rounded-xl overflow-hidden border border-white/5 group relative">
                                {/* Image */}
                                <div className="aspect-video bg-black/50 relative">
                                    <img
                                        src={`${API_URL}${moment.imageUrl}`}
                                        alt={moment.caption}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Delete Button Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleDelete(moment.id)}
                                            className="bg-red-500/80 text-white p-3 rounded-full hover:bg-red-600 transition-colors transform scale-75 group-hover:scale-100 duration-200"
                                            title="Delete Moment"
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <p className="text-sm text-gray-300 mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {moment.caption || <span className="text-gray-600 italic">No caption</span>}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(moment.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
