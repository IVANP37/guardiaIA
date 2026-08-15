import { BarChart2, TrendingUp, Crosshair, Brain, Shield, Award } from 'lucide-react';

export function StatsView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-400" />
            Mis Estadísticas
          </h1>
          <p className="text-sm text-slate-400">Progreso personal y desarrollo de competencias clínicas</p>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Simulaciones Realizadas</div>
              <div className="text-3xl font-bold text-white">42</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Promedio General</div>
              <div className="text-3xl font-bold text-green-400">84%</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Horas de Vuelo</div>
              <div className="text-3xl font-bold text-indigo-400">18.5h</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Racha Actual</div>
              <div className="text-3xl font-bold text-amber-400 flex items-center gap-2">
                5 días <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Competency Radar Alternative */}
            <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Radar de Competencias</h3>
              <div className="space-y-5">
                {[
                  { label: 'Anamnesis', score: 88, icon: <Brain className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Diagnóstico', score: 75, icon: <Crosshair className="w-4 h-4 text-emerald-400" /> },
                  { label: 'Manejo Inicial', score: 82, icon: <Shield className="w-4 h-4 text-blue-400" /> },
                  { label: 'Empatía', score: 95, icon: <Award className="w-4 h-4 text-amber-400" /> },
                ].map(comp => (
                  <div key={comp.label}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        {comp.icon}
                        {comp.label}
                      </div>
                      <span className="text-xs font-bold text-slate-400">{comp.score}%</span>
                    </div>
                    <div className="w-full bg-[#05070A] rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${comp.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights & Recommendations */}
            <div className="col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Brain className="w-32 h-32 text-indigo-500" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 relative z-10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  Recomendaciones GuardIA
                </h3>
                <div className="space-y-3 relative z-10">
                  <div className="bg-[#05070A]/50 border border-slate-800 p-4 rounded-xl">
                    <p className="text-sm text-slate-300">
                      Has mostrado una mejora del <strong className="text-green-400">15%</strong> en el manejo de protocolos de Sepsis en los últimos 30 días.
                    </p>
                  </div>
                  <div className="bg-[#05070A]/50 border border-slate-800 p-4 rounded-xl">
                    <p className="text-sm text-slate-300">
                      Oportunidad de mejora: En tus últimos 3 casos cardiovasculares, has demorado un promedio de 12 minutos en solicitar un ECG. <strong className="text-amber-400">Sugerimos revisar el protocolo de dolor torácico.</strong>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Casos Sugeridos para Mejorar</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="border border-slate-700 hover:border-indigo-500/50 p-4 rounded-xl bg-[#05070A] transition-colors cursor-pointer">
                       <h4 className="font-bold text-slate-200 mb-1">Dolor Torácico Atípico</h4>
                       <p className="text-xs text-slate-500 mb-3">Cardiología • Dificultad: Alta</p>
                       <button className="text-xs font-bold text-indigo-400">Iniciar Práctica →</button>
                    </div>
                    <div className="border border-slate-700 hover:border-indigo-500/50 p-4 rounded-xl bg-[#05070A] transition-colors cursor-pointer">
                       <h4 className="font-bold text-slate-200 mb-1">Crisis Hipertensiva</h4>
                       <p className="text-xs text-slate-500 mb-3">Guardia General • Dificultad: Media</p>
                       <button className="text-xs font-bold text-indigo-400">Iniciar Práctica →</button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
