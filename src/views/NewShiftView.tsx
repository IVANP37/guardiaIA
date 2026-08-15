import { motion } from 'motion/react';
import { Activity, Stethoscope, ChevronRight, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { SimulationConfig } from '../types';

export function NewShiftView({ onStart }: { onStart: (config: SimulationConfig) => void }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('Guardia General');
  const [selectedLevel, setSelectedLevel] = useState('Residente');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermedia');
  const [selectedMode, setSelectedMode] = useState('Caso individual');
  const [isStarting, setIsStarting] = useState(false);

  const specialties = ['Guardia General', 'Cardiología', 'Traumatología', 'Pediatría', 'Neurología', 'Neumología', 'Gastroenterología', 'Emergencias', 'Medicina Interna'];
  const levels = ['Estudiante inicial', 'Estudiante avanzado', 'Internado', 'Residente', 'Médico', 'Especialista'];
  const difficulties = ['Fácil', 'Intermedia', 'Difícil', 'Crítica'];
  const modes = ['Caso individual', 'Guardia continua', 'Examen', 'Entrenamiento'];

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStart({
        specialty: selectedSpecialty,
        level: selectedLevel,
        difficulty: selectedDifficulty,
        mode: selectedMode
      });
    }, 1200); // simulate the loading effect
  };

  if (isStarting) {
    return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <Activity className="w-16 h-16 text-indigo-500 mb-6 animate-pulse" />
          <h2 className="text-3xl font-light text-slate-300 tracking-widest uppercase">Ingresando a Guardia...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">¿Preparado para entrar de guardia?</h1>
        <p className="text-lg text-slate-400">Configura los parámetros de tu próxima simulación clínica.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 flex-1">
        {/* Left Column */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <Stethoscope className="w-4 h-4 mr-2" /> Especialidad
            </h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecialty(s)}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedSpecialty === s 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Nivel de formación</h3>
            <div className="grid grid-cols-2 gap-2">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLevel(l)}
                  className={clsx(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                    selectedLevel === l 
                      ? "bg-slate-800 border-indigo-500 text-indigo-300 border shadow-inner" 
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> Dificultad del caso
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={clsx(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all flex justify-between items-center",
                    selectedDifficulty === d 
                      ? "bg-slate-800 border border-slate-600 text-white" 
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                  )}
                >
                  {d}
                  {selectedDifficulty === d && <div className={clsx(
                    "w-2 h-2 rounded-full",
                    d === 'Fácil' ? 'bg-green-500' :
                    d === 'Intermedia' ? 'bg-amber-500' :
                    d === 'Difícil' ? 'bg-orange-500' : 'bg-red-500'
                  )} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Modo de simulación</h3>
            <div className="space-y-2">
              {modes.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMode(m)}
                  className={clsx(
                    "w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between",
                    selectedMode === m 
                      ? "bg-slate-800 border-l-4 border-indigo-500 text-slate-200" 
                      : "bg-slate-900 border-l-4 border-transparent text-slate-400 hover:bg-slate-800"
                  )}
                >
                  {m}
                  {selectedMode === m && <ChevronRight className="w-4 h-4 text-indigo-500" />}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-auto pt-10 flex justify-center">
        <button
          onClick={handleStart}
          className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] active:scale-95"
        >
          COMENZAR GUARDIA
          <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
