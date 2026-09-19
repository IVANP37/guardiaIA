import { PieChart, TrendingUp, AlertTriangle, Users, BookOpen } from 'lucide-react';

export function AnalyticsView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-indigo-400" />
            Análisis e indicadores
          </h1>
          <p className="text-sm text-slate-400">Análisis de cohortes y desempeño institucional</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-900 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
            <option>Cardiología V - 2026</option>
            <option>Pediatría II - 2026</option>
          </select>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Ask GuardIA */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <PieChart className="w-32 h-32 text-indigo-500" />
            </div>
            <h2 className="text-sm uppercase tracking-widest font-bold text-indigo-400 mb-4 flex items-center gap-2 relative z-10">
              Preguntar a GuardIA
            </h2>
            <div className="relative z-10 max-w-2xl">
              <input 
                type="text"
                className="w-full bg-[#05070A]/50 border border-slate-700 rounded-full py-3 px-6 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Ej: ¿En qué están fallando mis estudiantes de Cardiología?"
              />
            </div>
            <div className="mt-4 flex gap-2 relative z-10">
              <button className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full transition-colors">
                ¿Cuál fue el error más frecuente?
              </button>
              <button className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full transition-colors">
                ¿Qué competencia debo reforzar?
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Estudiantes</span>
              </div>
              <div className="text-3xl font-bold text-white">200</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Promedio General</span>
              </div>
              <div className="text-3xl font-bold text-green-400">78%</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Simulaciones</span>
              </div>
              <div className="text-3xl font-bold text-white">1,420</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Errores Críticos</span>
              </div>
              <div className="text-3xl font-bold text-red-400">42</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* GuardIA Insights */}
            <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Hallazgos de GuardIA</h3>
              <div className="space-y-4">
                <div className="bg-[#05070A] p-4 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="text-amber-400 font-bold">41%</span> de los estudiantes omitió investigar antecedentes familiares relevantes en casos cardiovasculares.
                  </p>
                </div>
                <div className="bg-[#05070A] p-4 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="text-red-400 font-bold">32%</span> demoró más de 10 minutos en solicitar el ECG en sospecha de SCA.
                  </p>
                </div>
                <div className="bg-[#05070A] p-4 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    El desempeño en anamnesis mejoró <span className="text-green-400 font-bold">18%</span> respecto al período anterior.
                  </p>
                </div>
              </div>
            </div>

            {/* Competency Breakdown */}
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Desempeño por Competencias</h3>
              <div className="space-y-6">
                {[
                  { name: 'Identificación Diagnóstica', score: 74 },
                  { name: 'Anamnesis Adecuada', score: 61 },
                  { name: 'Selección de Estudios', score: 73 },
                  { name: 'Manejo Inicial', score: 69 },
                  { name: 'Gestión del Tiempo', score: 45, alert: true },
                ].map(comp => (
                  <div key={comp.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300 font-medium">{comp.name}</span>
                      <span className={comp.alert ? 'text-red-400 font-bold' : 'text-slate-400'}>{comp.score}%</span>
                    </div>
                    <div className="w-full bg-[#05070A] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${comp.alert ? 'bg-red-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${comp.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
