import { LanguageProvider } from '@/context/LanguageContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import RegistrationPage from '@/pages/RegistrationPage';
import TeamsPage from '@/pages/TeamsPage';

// Admin Imports
import AdminLayout from '@/layouts/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTeams from '@/pages/admin/AdminTeams';
import AdminMatches from '@/pages/admin/AdminMatches';
import AdminPlayers from '@/pages/admin/AdminPlayers';
import AdminMoments from '@/pages/admin/AdminMoments';
import Settings from '@/pages/admin/Settings';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <LanguageProvider>
      <SiteConfigProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#0B0F1C] text-[#F4F6FA] overflow-x-hidden">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/teams" element={<TeamsPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="teams" element={<AdminTeams />} />
                  <Route path="players" element={<AdminPlayers />} />
                  <Route path="matches" element={<AdminMatches />} />
                  <Route path="moments" element={<AdminMoments />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </SiteConfigProvider>
    </LanguageProvider>
  );
}

export default App;
