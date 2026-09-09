import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DashboardFilterProvider } from './context/DashboardFilterContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RoleCopilotWidget } from './components/RoleCopilotWidget';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { RoleGuard } from './components/RoleGuard';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AboutPage } from './pages/AboutPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AiPrecheckPage } from './pages/AiPrecheckPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { MpsPage } from './pages/MpsPage';
import { ExploreMpsPage } from './pages/ExploreMpsPage';
import { MpDetailPage } from './pages/MpDetailPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ConstituencyMapPage } from './pages/ConstituencyMapPage';
import { ReportsPage } from './pages/ReportsPage';
import { QrVerificationPage } from './pages/QrVerificationPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { MpDashboard } from './pages/dashboards/MpDashboard';
import { DistrictDashboard } from './pages/dashboards/DistrictDashboard';
import { AgencyDashboard } from './pages/dashboards/AgencyDashboard';
import { AuditorDashboard } from './pages/dashboards/AuditorDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminSchemesPage } from './pages/admin/AdminSchemesPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
      const pathname = window.location.pathname;
      if (pathname && pathname !== '/') return pathname;
    }
    return '/';
  });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync with browser history and popstate
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPath(hash || '/');
    };

    if (window.location.hash) {
      setCurrentPath(window.location.hash.replace('#', ''));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render correct page based on currentPath
  const renderCurrentView = () => {
    const [pathBase, rawQueryString] = currentPath.split('?');
    const queryParams = new URLSearchParams(rawQueryString || '');

    // Exact and query-parameterized routes
    if (pathBase === '/' || pathBase === '') {
      return <HomePage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }

    if (pathBase === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }

    if (pathBase === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (pathBase === '/complaints' || pathBase === '/grievance' || pathBase === '/grievances') {
      return <ComplaintsPage onNavigate={navigate} />;
    }

    if (pathBase === '/feedback') {
      return <FeedbackPage onNavigate={navigate} />;
    }

    if (pathBase === '/notifications') {
      return <NotificationsPage onNavigate={navigate} />;
    }

    if (pathBase === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

    if (pathBase === '/settings') {
      return <SettingsPage onNavigate={navigate} />;
    }

    if (pathBase === '/ai/precheck') {
      return <AiPrecheckPage onNavigate={navigate} />;
    }

    if (pathBase === '/projects') {
      return <ProjectsPage onNavigate={navigate} currentPath={currentPath} />;
    }

    if (pathBase.startsWith('/projects/')) {
      const id = pathBase.replace('/projects/', '');
      return <ProjectDetailPage projectId={id} onNavigate={navigate} />;
    }

    if (pathBase === '/mps' || pathBase === '/explore-mps') {
      const q =
        queryParams.get('q') ||
        queryParams.get('query') ||
        queryParams.get('search') ||
        '';
      return <ExploreMpsPage initialQuery={q} onNavigate={navigate} />;
    }

    if (pathBase === '/search' || pathBase.startsWith('/search')) {
      const q =
        queryParams.get('q') ||
        queryParams.get('query') ||
        queryParams.get('search') ||
        '';
      return <SearchResultsPage initialQuery={q} onNavigate={navigate} />;
    }

    if (pathBase.startsWith('/mp/')) {
      const id = pathBase.replace('/mp/', '');
      return <MpDetailPage mpId={id} onNavigate={navigate} />;
    }

    if (pathBase === '/map') {
      return <ConstituencyMapPage onNavigate={navigate} />;
    }

    if (pathBase === '/reports') {
      return <ReportsPage onNavigate={navigate} />;
    }

    if (pathBase.startsWith('/verify')) {
      const parts = pathBase.split('/verify');
      const code = parts[1]?.replace('/', '') || 'MPLADS-2024-TN-0481';
      return <QrVerificationPage initialCode={code} onNavigate={navigate} />;
    }

    // Role-specific dashboards with RoleGuard protection
    if (pathBase === '/dashboard/citizen') {
      return (
        <RoleGuard allowedRoles={['CITIZEN']} onNavigate={navigate} pageTitle="Citizen & Social Audit Workspace">
          <CitizenDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/dashboard/mp') {
      return (
        <RoleGuard allowedRoles={['MP']} onNavigate={navigate} pageTitle="Member of Parliament Workspace">
          <MpDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/dashboard/district' || pathBase === '/dashboard/collector') {
      return (
        <RoleGuard allowedRoles={['DISTRICT_OFFICER']} onNavigate={navigate} pageTitle="District Collectorate Workspace">
          <DistrictDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/dashboard/agency') {
      return (
        <RoleGuard allowedRoles={['IMPLEMENTING_AGENCY']} onNavigate={navigate} pageTitle="Implementing Agency Workspace">
          <AgencyDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/dashboard/auditor') {
      return (
        <RoleGuard allowedRoles={['AUDITOR']} onNavigate={navigate} pageTitle="CAG Auditor Workspace">
          <AuditorDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/dashboard/admin') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="MoSPI National Admin Console">
          <AdminDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    // Admin management sub-pages
    if (pathBase === '/admin/users') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="User Directory & Role Management">
          <AdminUsersPage onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/admin/projects') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="National Project Repository">
          <AdminProjectsPage onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/admin/schemes') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="Scheme Guidelines & Convergence">
          <AdminSchemesPage onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (pathBase === '/admin/audit') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="Statutory System Audit Log">
          <AdminAuditPage onNavigate={navigate} />
        </RoleGuard>
      );
    }

    // Default fallback to HomePage
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardFilterProvider>
          <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
            {/* Navigation Bar */}
            <Navbar
              currentPath={currentPath}
              onNavigate={navigate}
              onOpenSearch={() => setIsSearchOpen(true)}
            />

            {/* Active Page View */}
            <main className="flex-1 bg-slate-900 text-slate-100">
              {renderCurrentView()}
            </main>

            {/* Global Footer */}
            <Footer onNavigate={navigate} />

            {/* Role Copilot AI Floating Assistant */}
            <RoleCopilotWidget onNavigate={navigate} currentPath={currentPath} />

            {/* Global Search Dialog Modal */}
            <GlobalSearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onNavigate={navigate}
            />
          </div>
        </DashboardFilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
