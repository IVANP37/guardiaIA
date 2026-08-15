import { motion } from 'motion/react';
import { Trophy, CheckCircle, XCircle, AlertCircle, PlayCircle, BarChart3, Clock } from 'lucide-react';
import clsx from 'clsx';
import { demoCase } from '../data/mockData';

export function EvaluationView({ onBack }: { onBack: () => void }) {
  const metrics = [
    { name: 'Anamnesis', score: 88 },
    { name: 'Examen Físico', score: 75 },
    { name: 'Razonamiento Clínico', score: 90 },
    { name: 'Diagnóstico Diferencial', score: 84 },
    { name: 'Estudios Solicitados', score: 78 },
    { name: 'Manejo y Tratamiento', score: 80 },
    { name: 'Comunicación', score: 92 },
    { name: 'Gestión del Tiempo', score: 69 },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen pb-20">
      
      {/* Header Result */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 relative">
        <div className="absolute left-0 top-0">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center">
            ← Volver al Dashboard
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Resultado de la Simulación</h1>
        <p className="text-slate-400 mb-8">Evaluación IA basada en guías clínicas y protocolos.</p>
        
        <div className="inline-flex items-center justify-center relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
          <div className="w-32 h-32 rounded-full border-4 border-indigo-500 flex flex-col items-center justify-center bg-slate-900 relative z-10">
            <span className="text-4xl font-bold text-white">82</span>
            <span className="text-xs text-indigo-400 uppercase tracking-widest mt-1">/ 100</span>
          </div>
        </div>
        <p className="text-indigo-400 font-medium tracking-wide mt-4 flex justify-center items-center">
          <Trophy className="w-4 h-4 mr-2" />
          Desempeño Excelente
        </p>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Radar/Metrics Categories */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Desglose de Competencias
          </h2>
          <div className="space-y-4">
            {metrics.map((m, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{m.name}</span>
                  <span className={clsx(
                    "font-semibold",
                    m.score >= 80 ? "text-green-400" : m.score >= 60 ? "text-amber-400" : "text-red-400"
                  )}>{m.score}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${m.score}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
                    className={clsx(
                      "h-full rounded-full",
                      m.score >= 80 ? "bg-green-500" : m.score >= 60 ? "bg-amber-500" : "bg-red-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Feedback */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-4">
          
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Lo que hiciste bien
            </h3>
            <ul className="space-y-3 text-sm text-emerald-200/80">
              <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">•</span> Identificaste rápidamente el carácter opresivo del dolor y su irradiación.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">•</span> Solicitaste un ECG dentro de los primeros 10 minutos (Protocolo SCA).</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">•</span> Mantuviste una comunicación empática y calmada con el paciente.</li>
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-6">
            <h3 className="text-amber-400 font-semibold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" /> Podrías mejorar
            </h3>
            <ul className="space-y-3 text-sm text-amber-200/80">
              <li className="flex items-start"><span className="text-amber-500 mr-2 mt-0.5">•</span> No preguntaste sobre antecedentes familiares cardiovasculares hasta muy avanzado el caso.</li>
              <li className="flex items-start"><span className="text-amber-500 mr-2 mt-0.5">•</span> Demora en la administración de oxígeno suplementario ante dolor precordial.</li>
              <li className="flex items-start"><span className="text-amber-500 mr-2 mt-0.5">•</span> Faltó indagar sobre el horario exacto de la última comida (importante ante posible intervención).</li>
            </ul>
          </div>

        </motion.div>
      </div>

      {/* Timeline Replay */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Línea de tiempo de decisiones
          </h2>
          <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            <PlayCircle className="w-4 h-4 mr-2" />
            REVISAR SIMULACIÓN
          </button>
        </div>

        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
          {[
            { time: '00:00', text: 'Paciente ingresa con dolor torácico.', status: 'neutral' },
            { time: '02:14', text: 'Anamnesis: Pregunta por características del dolor.', status: 'correct' },
            { time: '04:32', text: 'Solicita signos vitales.', status: 'correct' },
            { time: '07:15', text: 'Omitió preguntar antecedentes al inicio.', status: 'warning' },
            { time: '08:48', text: 'Solicita ECG (Electrocardiograma).', status: 'correct' },
            { time: '12:04', text: 'Solicita Troponina I de alta sensibilidad.', status: 'correct' },
            { time: '15:22', text: 'Inicia manejo con antiagregación plaquetaria.', status: 'correct' },
          ].map((event, i) => (
            <div key={i} className="relative">
              <div className={clsx(
                "absolute -left-[31px] top-0.5 w-3 h-3 rounded-full border-2 border-slate-900",
                event.status === 'correct' ? 'bg-green-500' :
                event.status === 'warning' ? 'bg-amber-500' :
                event.status === 'error' ? 'bg-red-500' : 'bg-slate-500'
              )} />
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="font-mono text-sm text-slate-500">{event.time}</span>
                <span className="text-slate-300 text-sm">{event.text}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
