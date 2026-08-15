import { motion } from 'motion/react';
import { libraryCases } from '../data/mockData';
import { Search, Filter, Clock, Users, Star } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export function LibraryView({ onSelectCase }: { onSelectCase?: (caseId: string) => void }) {
  const [filter, setFilter] = useState('Todos');
  const categories = ['Todos', 'Cardiología', 'Traumatología', 'Pediatría', 'Neurología', 'Guardia General'];

  const filteredCases = filter === 'Todos' ? libraryCases : libraryCases.filter(c => c.specialty === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Biblioteca Clínica</h1>
        <p className="text-slate-400">Explora casos clínicos diseñados por expertos para tu entrenamiento.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por síntoma, diagnóstico o paciente..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
          />
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-5 h-5 text-slate-500 mr-2" />
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                filter === c 
                  ? "bg-indigo-600 text-white" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-10">
        {filteredCases.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelectCase && onSelectCase(c.id)}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all cursor-pointer group flex flex-col"
          >
            {/* Card Header Image / Color block */}
            <div className="h-32 bg-slate-800 relative overflow-hidden">
              {c.patient.avatarUrl ? (
                <img src={c.patient.avatarUrl} alt="Patient reference" className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity mix-blend-luminosity" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-1 bg-slate-950/80 backdrop-blur-sm rounded border border-slate-700/50 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  {c.specialty}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={clsx(
                  "px-2 py-1 rounded border backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest",
                  c.difficulty === 'Fácil' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  c.difficulty === 'Intermedia' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                )}>
                  {c.difficulty}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{c.title}</h3>
              
              <div className="mt-4 space-y-2 flex-1">
                <div className="flex items-start text-sm text-slate-400">
                  <Users className="w-4 h-4 mr-2 mt-0.5 text-slate-500 flex-shrink-0" />
                  <span>{c.patient.name}, {c.patient.age} años. {c.patient.gender === 'M' ? 'Masc.' : 'Fem.'}</span>
                </div>
                <div className="flex items-start text-sm text-slate-400">
                  <Star className="w-4 h-4 mr-2 mt-0.5 text-slate-500 flex-shrink-0" />
                  <span className="line-clamp-2">Motivo: {c.patient.reasonForConsultation}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center text-xs font-medium text-slate-500">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {c.duration} min
                </div>
                <button className="text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  Iniciar Caso →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
