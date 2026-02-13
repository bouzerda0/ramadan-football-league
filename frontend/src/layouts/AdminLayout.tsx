import { Outlet, Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

export default function AdminLayout() {
    // Simple check for now (cookie check handles real auth on backend)
    const isAuthenticated = document.cookie.includes('admin_token=secret-admin-token');

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#0B0F1C] text-[#F4F6FA]">
            <Navigation /> {/* Reuse main nav for now, or create custom sidebar */}
            <div className="pt-24 px-4 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-[#D4A018]">Admin Dashboard</h1>
                <Outlet />
            </div>
        </div>
    );
}
