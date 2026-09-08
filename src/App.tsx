import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
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
    // Exact routes
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }

    if (currentPath === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (currentPath === '/complaints') {
      return <ComplaintsPage onNavigate={navigate} />;
    }

    if (currentPath === '/feedback') {
      return <FeedbackPage onNavigate={navigate} />;
    }

    if (currentPath === '/notifications') {
      return <NotificationsPage onNavigate={navigate} />;
    }

    if (currentPath === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

    if (currentPath === '/settings') {
      return <SettingsPage onNavigate={navigate} />;
    }

    if (currentPath === '/ai/precheck') {
      return <AiPrecheckPage onNavigate={navigate} />;
    }

    if (currentPath === '/projects') {
      return <ProjectsPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/projects/')) {
      const id = currentPath.replace('/projects/', '');
      return <ProjectDetailPage projectId={id} onNavigate={navigate} />;
    }

    if (currentPath === '/mps' || currentPath.startsWith('/mps?')) {
      const q = currentPath.includes('?')
        ? new URLSearchParams(currentPath.split('?')[1]).get('q') ||
          new URLSearchParams(currentPath.split('?')[1]).get('query') ||
          new URLSearchParams(currentPath.split('?')[1]).get('search') ||
          ''
        : '';
      return <MpsPage initialQuery={q} onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/search')) {
      const q = currentPath.includes('?')
        ? new URLSearchParams(currentPath.split('?')[1]).get('q') ||
          new URLSearchParams(currentPath.split('?')[1]).get('query') ||
          new URLSearchParams(currentPath.split('?')[1]).get('search') ||
          ''
        : '';
      return <SearchResultsPage initialQuery={q} onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/mp/')) {
      const id = currentPath.replace('/mp/', '').split('?')[0];
      return <MpDetailPage mpId={id} onNavigate={navigate} />;
    }

    if (currentPath === '/map') {
      return <ConstituencyMapPage onNavigate={navigate} />;
    }

    if (currentPath === '/reports') {
      return <ReportsPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/verify')) {
      const parts = currentPath.split('/verify');
      const code = parts[1]?.replace('/', '') || 'MPLADS-2024-TN-0481';
      return <QrVerificationPage initialCode={code} onNavigate={navigate} />;
    }

    // Role-specific dashboards with RoleGuard protection
    if (currentPath === '/dashboard/citizen') {
      return (
        <RoleGuard allowedRoles={['CITIZEN']} onNavigate={navigate} pageTitle="Citizen & Social Audit Workspace">
          <CitizenDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/dashboard/mp') {
      return (
        <RoleGuard allowedRoles={['MP']} onNavigate={navigate} pageTitle="Member of Parliament Workspace">
          <MpDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/dashboard/district' || currentPath === '/dashboard/collector') {
      return (
        <RoleGuard allowedRoles={['DISTRICT_OFFICER']} onNavigate={navigate} pageTitle="District Collectorate Workspace">
          <DistrictDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/dashboard/agency') {
      return (
        <RoleGuard allowedRoles={['IMPLEMENTING_AGENCY']} onNavigate={navigate} pageTitle="Implementing Agency Workspace">
          <AgencyDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/dashboard/auditor') {
      return (
        <RoleGuard allowedRoles={['AUDITOR']} onNavigate={navigate} pageTitle="CAG Auditor Workspace">
          <AuditorDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/dashboard/admin') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="MoSPI National Admin Console">
          <AdminDashboard onNavigate={navigate} />
        </RoleGuard>
      );
    }

    // Admin management sub-pages
    if (currentPath === '/admin/users') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="User Directory & Role Management">
          <AdminUsersPage onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/admin/projects') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="National Project Repository">
          <AdminProjectsPage onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/admin/schemes') {
      return (
        <RoleGuard allowedRoles={['ADMIN']} onNavigate={navigate} pageTitle="Scheme Guidelines & Convergence">
          <AdminSchemesPage onNavigate={navigate} />
        </RoleGuard>
      );
    }

    if (currentPath === '/admin/audit') {
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
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-amber-200 selection:text-slate-900">
        {/* Navigation Bar */}
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Active Page View */}
        <main className="flex-1">
          {renderCurrentView()}
        </main>

        {/* Global Footer */}
        <Footer onNavigate={navigate} />

        {/* Role Copilot AI Floating Assistant */}
        <RoleCopilotWidget onNavigate={navigate} />

        {/* Global Search Dialog Modal */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={navigate}
        />
      </div>
    </AuthProvider>
  );
}
