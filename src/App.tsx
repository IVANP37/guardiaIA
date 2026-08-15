/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppState, ClinicalCase, SimulationConfig, ResolvedSimulation } from './types';
import { LoginView } from './views/LoginView';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { NewShiftView } from './views/NewShiftView';
import { SimulatorView } from './views/SimulatorView';
import { EvaluationView } from './views/EvaluationView';
import { LibraryView } from './views/LibraryView';
import { CaseStudioView } from './views/CaseStudioView';
import { AnalyticsView } from './views/AnalyticsView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { VirtualActorsView } from './views/VirtualActorsView';
import { ClinicalEnvironmentsView } from './views/ClinicalEnvironmentsView';
import { SimulationsView } from './views/SimulationsView';
import { StatsView } from './views/StatsView';
import { UsersView } from './views/UsersView';
import { SettingsView } from './views/SettingsView';
import { libraryCases, demoCase } from './data/mockData';
import { resolveSimulation } from './utils/resolver';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function App() {
  const [view, setView] = useState<AppState>('login');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [resolvedSimulation, setResolvedSimulation] = useState<ResolvedSimulation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('guardia_theme') === 'light';
  });

  const toggleTheme = () => {
    setIsLightMode(prev => {
      const newTheme = !prev;
      localStorage.setItem('guardia_theme', newTheme ? 'light' : 'dark');
      return newTheme;
    });
  };

  const handleStartCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setResolvedSimulation(null); // Clear resolved simulation if starting library case
    setView('simulator');
    setIsSidebarOpen(false);
  };

  const handleStartNewShift = (config: SimulationConfig) => {
    const resolved = resolveSimulation(config);
    setResolvedSimulation(resolved);
    setActiveCaseId(null);
    setView('simulator');
    setIsSidebarOpen(false);
  };

  const handleViewChange = (newView: AppState) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  const activeCase = resolvedSimulation?.baseCase || (activeCaseId 
    ? libraryCases.find(c => c.id === activeCaseId) || demoCase 
    : demoCase);

  if (view === 'login') {
    return <LoginView onLogin={() => setView('dashboard')} />;
  }

  if (view === 'simulator') {
    return <SimulatorView onFinish={() => setView('evaluation')} activeCase={activeCase} resolvedSimulation={resolvedSimulation || undefined} />;
  }

  if (view === 'evaluation') {
    return (
      <div className="min-h-screen bg-[#05070A]">
        <EvaluationView onBack={() => setView('dashboard')} />
      </div>
    );
  }

  return (
    <div className={clsx("flex h-screen bg-[#05070A] text-slate-300 overflow-hidden font-sans selection:bg-indigo-500/30", isLightMode && "theme-light")}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - sliding on mobile, fixed on desktop */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar currentView={view} onViewChange={handleViewChange} isLightMode={isLightMode} onToggleTheme={toggleTheme} />
      </div>

      <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <div className="lg:hidden h-14 bg-[#080C14] border-b border-slate-800 flex items-center px-4 flex-shrink-0 z-20">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-center">
            <span className="text-sm font-bold text-slate-100 tracking-tight">Guard<span className="text-indigo-400">IA</span></span>
          </div>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Subtle background glow for main area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex-1 h-full">
          {view === 'dashboard' && <DashboardView onStartCase={handleStartCase} />}
          {view === 'new-shift' && <NewShiftView onStart={handleStartNewShift} />}
          {view === 'library' && <LibraryView onSelectCase={handleStartCase} />}
          {view === 'case-studio' && <CaseStudioView />}
          {view === 'analytics' && <AnalyticsView />}
          {view === 'knowledge-base' && <KnowledgeBaseView />}
          {view === 'actors' && <VirtualActorsView />}
          {view === 'environments' && <ClinicalEnvironmentsView />}
          {view === 'simulations' && <SimulationsView />}
          {view === 'stats' && <StatsView />}
          {view === 'admin-users' && <UsersView />}
          {view === 'admin-settings' && <SettingsView />}

          {/* Fallback for other sidebar items not fully implemented yet */}
          {!['dashboard', 'new-shift', 'library', 'case-studio', 'analytics', 'knowledge-base', 'actors', 'environments', 'simulations', 'stats', 'admin-users', 'admin-settings'].includes(view) && (
            <div className="p-8 flex flex-col items-center justify-center h-full text-slate-500">
              <p className="text-xl font-medium text-slate-400 mb-2">Sección en construcción</p>
              <p className="text-sm">Esta vista estará disponible en la próxima versión.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
