import { Activity, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

export function SimulationsView() {
  const simulations = [
    { id: 'sim-1', caseName: 'Carlos Méndez (SCA)', date: '14 Ago 2026', status: 'COMPLETED', score: 85, duration: '14:20' },
    { id: 'sim-2', caseName: 'Sofía (Fiebre)', date: '12 Ago 2026', status: 'EVALUATED', score: 92, duration: '18:45' },
    { id: 'sim-3', caseName: 'Raúl Domínguez (EPOC)', date: '10 Ago 2026', status: 'IN_PROGRESS', score: null, duration: '05:12' },
    { id: 'sim-4', caseName: 'María López (Politrauma)', date: '08 Ago 2026', status: 'COMPLETED', score: 78, duration: '22:10' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            Mis Simulaciones
          </h1>
          <p className="text-sm text-slate-400">Historial de sesiones y casos en curso</p>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#05070A] border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="p-4 font-bold">Caso Clínico</th>
                  <th className="p-4 font-bold">Fecha</th>
                  <th className="p-4 font-bold">Duración</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-right">Puntuación</th>
                  <th className="p-4 font-bold text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {simulations.map(sim => (
                  <tr key={sim.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{sim.caseName}</div>
                      <div className="text-xs text-slate-500 font-mono">{sim.id}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{sim.date}</td>
                    <td className="p-4 text-sm text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {sim.duration}
                    </td>
                    <td className="p-4">
                      {sim.status === 'COMPLETED' && <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded uppercase font-bold tracking-wider">Completado</span>}
                      {sim.status === 'EVALUATED' && <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded uppercase font-bold tracking-wider">Evaluado</span>}
                      {sim.status === 'IN_PROGRESS' && <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase font-bold tracking-wider">En Curso</span>}
                    </td>
                    <td className="p-4 text-right">
                      {sim.score ? (
                        <span className={`text-lg font-bold ${sim.score >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
                          {sim.score}%
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {sim.status === 'IN_PROGRESS' ? (
                        <button className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1 w-full">
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      ) : (
                        <button className="text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 w-full">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
