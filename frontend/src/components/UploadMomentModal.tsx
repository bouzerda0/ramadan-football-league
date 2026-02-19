import { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle, Camera } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface UploadMomentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadMomentModal({ isOpen, onClose }: UploadMomentModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', caption);

        try {
            const response = await fetch(`${API_URL}/api/moments/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setFile(null);
                    setCaption('');
                    setStatus('idle');
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#0B0F1C] border border-[#D4A018]/20 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-[#D4A018]" />
                        Upload Your Moment
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Upload Successful!</h4>
                            <p className="text-gray-400">Your photo has been submitted for approval.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* File Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file
                                    ? 'border-[#D4A018] bg-[#D4A018]/5'
                                    : 'border-white/10 hover:border-[#D4A018]/50 hover:bg-white/5'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-full h-48 relative mb-4 rounded-lg overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-sm text-[#D4A018] font-medium truncate max-w-full">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-4">
                                        <div className="w-12 h-12 bg-[#D4A018]/10 text-[#D4A018] rounded-full flex items-center justify-center mb-4">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="text-white font-medium mb-1">Click to upload photo</p>
                                        <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Caption Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Caption (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Describe this moment..."
                                    className="w-full bg-[#141B2D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4A018]/50 transition-colors"
                                />
                            </div>

                            {/* Error Message */}
                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Failed to upload. Please try again.</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!file || isSubmitting}
                                className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all ${!file || isSubmitting
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#D4A018] text-[#0B0F1C] hover:bg-[#F4C430] shadow-lg shadow-[#D4A018]/20'
                                    }`}
                            >
                                {isSubmitting ? 'Uploading...' : 'Submit Photo'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
