import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { libraryCases } from '../data/mockData';
import { Clock, BarChart2, Star, Target, Zap, X, Activity, Brain, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export function DashboardView({ onStartCase }: { onStartCase: (id: string) => void }) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Solo mostrar el onboarding una vez por sesión (o simularlo en el prototipo)
    const hasSeenWelcome = sessionStorage.getItem('guardia_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('guardia_welcome_seen', 'true');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070A]/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#080C14] border border-indigo-500/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={dismissWelcome}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">G</div>
                <span className="text-2xl font-semibold tracking-tight text-white">Guard<span className="text-indigo-400">IA</span></span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenido al Simulador</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Estás accediendo a un entorno de simulación clínica inmersivo diseñado para evaluar la toma de decisiones médicas en tiempo real.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">Motor Fisiológico Dinámico</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Los signos vitales del paciente reaccionan en tiempo real a tus intervenciones médicas y a tus demoras.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <Brain className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">Debriefing Educativo</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Al finalizar, recibirás un análisis detallado de tus competencias, tiempos de respuesta y seguridad del paciente.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={dismissWelcome}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Comenzar Evaluación
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Bienvenido, Dr. López</h1>
        <p className="text-slate-400">Resumen de tu actividad y progreso clínico.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Simulaciones completadas', value: '42', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Precisión diagnóstica', value: '88%', icon: Star, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Tiempo prom. resolución', value: '14m', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Racha actual', value: '5 días', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4"
          >
            <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", stat.bg)}>
              <stat.icon className={clsx("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-white">Asignaciones Pendientes</h2>
          <div className="space-y-4">
            {libraryCases.slice(0, 2).map((c, i) => (
              <motion.div
                key={c.id}
                onClick={() => onStartCase(c.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-slate-800 text-slate-300">
                        {c.specialty}
                      </span>
                      <span className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase",
                        c.difficulty === 'Fácil' ? 'bg-green-500/10 text-green-400' :
                        c.difficulty === 'Intermedia' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      )}>
                        {c.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                  </div>
                  <div className="text-sm font-medium text-slate-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {c.duration} min
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  Paciente: {c.patient.name}, {c.patient.age} años. Motivo: {c.patient.reasonForConsultation}.
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-sm text-indigo-400 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Iniciar caso <span className="ml-1">→</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-6">Desempeño por Área</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="space-y-5">
              {[
                { label: 'Anamnesis', value: 92, color: 'bg-indigo-500' },
                { label: 'Examen Físico', value: 78, color: 'bg-blue-500' },
                { label: 'Razonamiento Clínico', value: 85, color: 'bg-emerald-500' },
                { label: 'Manejo del Tiempo', value: 65, color: 'bg-amber-500' },
              ].map((area, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{area.label}</span>
                    <span className="text-slate-400">{area.value}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={clsx("h-2 rounded-full", area.color)} style={{ width: `${area.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
