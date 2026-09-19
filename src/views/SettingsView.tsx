import { Settings, Server, Shield, Database } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Configuración del Sistema
          </h1>
          <p className="text-sm text-slate-400">Preferencias de la institución y ajustes del motor de IA</p>
        </div>
        <div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
            Guardar Cambios
          </button>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* General Settings */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Settings className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-white">General (Institución)</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre de la Institución</label>
                  <input type="text" defaultValue="Hospital Universitario Virtual" className="w-full bg-[#05070A] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">ID de la institución</label>
                  <input type="text" defaultValue="t-1" disabled className="w-full bg-[#05070A]/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Zona Horaria</label>
                <select className="w-full bg-[#05070A] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors">
                  <option>America/Argentina/Buenos_Aires (UTC-3)</option>
                  <option>America/Santiago (UTC-4)</option>
                </select>
              </div>
            </div>
          </section>

          {/* AI Engine Settings */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Server className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Motor GuardIA (Gemini)</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#05070A] rounded-xl border border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Generación de actores visuales (estudio de actores)</h3>
                  <p className="text-xs text-slate-400 mt-1">Permitir a los instructores generar nuevos actores virtuales usando IA.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Modelo de Lenguaje Base</label>
                <select className="w-full bg-[#05070A] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors">
                  <option>Gemini 1.5 Pro (Recomendado para casos complejos)</option>
                  <option>Gemini 1.5 Flash (Mejor latencia)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Rigor de Evaluación</label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">Laxo</span>
                  <input type="range" className="flex-1 accent-indigo-500" min="1" max="10" defaultValue="7" />
                  <span className="text-xs text-slate-500">Estricto</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Determina qué tan estricta es la IA al evaluar las competencias del estudiante al finalizar un caso.</p>
              </div>
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
}
