import { Users, Filter, Plus, User } from 'lucide-react';
import { mockVirtualActors } from '../data/mockData';

export function VirtualActorsView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Actores Virtuales
          </h1>
          <p className="text-sm text-slate-400">Gestiona los modelos visuales (avatares) disponibles para los casos</p>
        </div>
        <div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Actor
          </button>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* AI Actor Studio */}
          <div className="bg-slate-900/50 border border-indigo-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Users className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                AI Actor Studio
              </h2>
              <p className="text-sm text-slate-400 mb-6">Genera un nuevo actor virtual hiperrealista mediante IA para usar en casos clínicos.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-10">
                  <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-1 flex items-center">
                    <input 
                      type="text" 
                      placeholder="Ej: Paciente masculino latinoamericano de aproximadamente 65 años con cabello gris..." 
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
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                   <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rol:</label>
                   <select className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1">
                      <option>Paciente</option>
                      <option>Acompañante / Familiar</option>
                   </select>
                </div>
                <div className="flex items-center gap-2">
                   <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Edad:</label>
                   <select className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1">
                      <option>Adulto (18-60)</option>
                      <option>Adulto Mayor (60+)</option>
                      <option>Pediátrico (0-12)</option>
                      <option>Adolescente (13-17)</option>
                   </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-medium hover:bg-slate-700 transition-colors">Todos</button>
              <button className="px-4 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-medium transition-colors">Adultos</button>
              <button className="px-4 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-medium hover:bg-slate-700 transition-colors">Pediátricos</button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              Filtrar
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockVirtualActors.map(actor => (
              <div key={actor.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group">
                <div className="aspect-[4/5] relative bg-slate-800">
                  <img src={actor.visualUrl} alt={actor.nameCode} className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-700">
                      {actor.nameCode}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-200 text-sm truncate">{actor.nameCode}</h3>
                    <span className="text-xs text-slate-500 font-mono">{actor.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <User className="w-3 h-3" />
                    {actor.ageRange} años • {actor.gender === 'M' ? 'Masculino' : actor.gender === 'F' ? 'Femenino' : 'Otro'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Ropa Casual</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Pijama</span>
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
