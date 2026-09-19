import { Building, MapPin, Search } from 'lucide-react';
import { mockEnvironments } from '../data/mockData';

export function ClinicalEnvironmentsView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-400" />
            Entornos Clínicos
          </h1>
          <p className="text-sm text-slate-400">Fondos y acústica para la simulación</p>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* AI Environment Studio */}
          <div className="bg-slate-900/50 border border-indigo-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Building className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Estudio de entornos con IA
              </h2>
              <p className="text-sm text-slate-400 mb-6">Genera escenarios hospitalarios y perfiles acústicos mediante IA.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-10">
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-1 flex items-center">
                    <input 
                      type="text" 
                      placeholder="Ej: Box de guardia pediátrica de alta complejidad, iluminación fría..." 
                      className="w-full bg-transparent border-none px-4 py-2 text-sm text-slate-200 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button className="w-full h-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">
                    Generar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar entorno..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockEnvironments.map(env => (
              <div key={env.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex h-48">
                <div className="w-1/2 relative bg-slate-800 border-r border-slate-800">
                  <img src={env.backgroundImageUrl || env.bgUrl} alt={env.name} className="w-full h-full object-cover mix-blend-luminosity opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900"></div>
                </div>
                <div className="w-1/2 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-slate-200 leading-tight">{env.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{env.description || 'Entorno optimizado para simulaciones clínicas.'}</p>
                  
                  <div className="mt-auto">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Perfil Acústico</div>
                    <span className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                      {env.acousticProfile?.ambientNoiseLevel || 'Medio'} - {env.acousticProfile?.reverbLevel || 'Bajo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
