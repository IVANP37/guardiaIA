import { AppState } from '../types';
import { mockUser, mockTenant } from '../data/mockData';
import { 
  Activity, 
  Stethoscope, 
  BookOpen, 
  BarChart2, 
  Trophy, 
  History, 
  GraduationCap, 
  Users, 
  Settings,
  FolderOpen,
  PenTool,
  Library,
  Video,
  Monitor,
  PieChart,
  Sun,
  Moon
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  currentView: AppState;
  onViewChange: (view: AppState) => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
}

export function Sidebar({ currentView, onViewChange, isLightMode, onToggleTheme }: SidebarProps) {
  const studentNav = [
    { id: 'new-shift', label: 'Nueva Guardia', icon: Activity, primary: true },
    { id: 'dashboard', label: 'Mis Casos', icon: FolderOpen },
    { id: 'simulations', label: 'Simulaciones', icon: Stethoscope },
    { id: 'library', label: 'Biblioteca Clínica', icon: Library },
    { id: 'stats', label: 'Mis Estadísticas', icon: BarChart2 },
  ];

  const teacherNav = [
    { id: 'case-studio', label: 'Case Studio', icon: PenTool, primary: true, highlight: true },
    { id: 'analytics', label: 'Analytics & Insights', icon: PieChart },
    { id: 'knowledge-base', label: 'Protocolos (Knowledge Base)', icon: BookOpen },
    { id: 'actors', label: 'Virtual Actors', icon: Video },
    { id: 'environments', label: 'Clinical Environments', icon: Monitor },
  ];

  const adminNav = [
    { id: 'admin-users', label: 'Usuarios', icon: Users },
    { id: 'admin-settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#05070A] border-r border-slate-800 flex flex-col h-full flex-shrink-0 z-10">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">G</div>
          <span className="text-xl font-bold text-slate-100 tracking-tight">Guard<span className="text-indigo-400">IA</span></span>
        </div>
        {onToggleTheme && (
          <button 
            onClick={onToggleTheme}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-md transition-colors"
            title={isLightMode ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <div className="px-6 pb-2">
        <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Tenant</div>
        <div className="text-sm text-slate-300 font-medium truncate">{mockTenant.name}</div>
        <div className="text-[10px] text-slate-500 flex gap-2 mt-1">
          <span>{mockTenant.country}</span>
          <span>•</span>
          <span>{mockTenant.locale}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 px-3 scrollbar-hide">
        <div className="space-y-1">
          <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Estudiante</h3>
          {studentNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as AppState)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : item.primary 
                      ? "text-indigo-400 hover:bg-indigo-500/10"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive || item.primary ? "text-indigo-400" : "text-slate-500")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <h3 className="px-3 text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mb-2">Docente</h3>
          {teacherNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as AppState)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : item.highlight
                      ? "text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/20"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive || item.highlight ? "text-indigo-400" : "text-slate-500")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Administración</h3>
          {adminNav.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200"
            >
              <item.icon className="w-5 h-5 text-slate-500" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
            <span className="text-slate-300 font-medium">SL</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{mockUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{mockUser.role} • {mockUser.level}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
