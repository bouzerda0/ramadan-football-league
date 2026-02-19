import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';

export default function AdminLayout() {
    // Simple check for now (cookie check handles real auth on backend)
    const isAuthenticated = document.cookie.includes('admin_token=secret-admin-token');
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#0B0F1C] text-[#F4F6FA]">
            <Navigation /> {/* Reuse main nav for now, or create custom sidebar */}

            <div className="pt-24 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-[#D4A018]">Admin Dashboard</h1>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { path: '/admin/dashboard', label: 'Dashboard' },
                            { path: '/admin/teams', label: 'Teams' },
                            { path: '/admin/players', label: 'Players' },
                            { path: '/admin/matches', label: 'Matches' },
                            { path: '/admin/moments', label: 'Moments' },
                            { path: '/admin/settings', label: 'Settings' },
                        ].map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? 'bg-[#D4A018] text-[#0B0F1C]'
                                    : 'bg-[#141B2D] text-[#A9B3C7] hover:text-[#F4F6FA]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
