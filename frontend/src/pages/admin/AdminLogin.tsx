
import { useState } from 'react';
import { API_URL } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const loginUrl = `${API_URL}/api/admin/login`;
            console.log('Attempting login to:', loginUrl);

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 'include' sends cookies with cross-origin requests (needed if backend sets cookies)
                // 'same-origin' is default but might fail if frontend/backend are on different subdomains
                // For this specific case where we use a simple token, 'include' is safer if we ever use cookies
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token for ProtectedRoute and API calls
                const token = data.token || "secret-admin-token"; // Fallback until backend is updated
                localStorage.setItem('admin_token', token);
                // Also set cookie for legacy/backup (middleware might check both initially)
                document.cookie = `admin_token=${token}; path=/; max-age=3600`;

                navigate('/admin/dashboard');
            } else {
                setError(data?.error || data?.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed - network error');
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1C] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#141B2D] p-8 rounded-2xl border border-[#D4A018]/20">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#D4A018]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[#D4A018]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#F4F6FA]">Admin Login</h1>
                    <p className="text-[#A9B3C7]">Zone 0 Football League</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded-lg px-4 py-2 text-[#F4F6FA] focus:outline-none focus:border-[#D4A018]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#A9B3C7] mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0B0F1C] border border-[#D4A018]/20 rounded-lg px-4 py-2 text-[#F4F6FA] focus:outline-none focus:border-[#D4A018]"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#D4A018] text-[#0B0F1C] font-bold py-3 rounded-lg hover:bg-[#B38612] transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
