import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Brain, 
  TrendingUp,
  MessageSquare,
  ChevronRight,
  RotateCcw,
  XCircle,
  Stethoscope
} from 'lucide-react';
import clsx from 'clsx';
import { ResolvedSimulation } from '../types';

interface DebriefPanelProps {
  resolvedSimulation?: ResolvedSimulation;
  onRetry: () => void;
}

export function DebriefPanel({ onRetry, resolvedSimulation }: DebriefPanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#05070A] overflow-y-auto text-slate-200">
      
      {/* Header Premium */}
      <header className="border-b border-slate-800 bg-[#080C14] px-4 lg:px-8 py-6 lg:py-8 flex flex-col lg:flex-row lg:items-end justify-between sticky top-0 z-20 gap-4 lg:gap-0">
        <div>
          <div className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            GuardIA Clinical Debrief
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Simulación Finalizada</h1>
          <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-slate-400 font-mono">
            <span>PACIENTE: {resolvedSimulation?.baseCase?.patient?.name || 'Carlos Méndez'}</span>
            <span className="hidden lg:inline">•</span>
            <span>ESCENARIO: {resolvedSimulation?.baseCase?.title || 'Dolor Torácico'} ({resolvedSimulation?.config?.specialty || 'Cardiología'})</span>
            <span className="hidden lg:inline">•</span>
            <span>NIVEL: {resolvedSimulation?.config?.level || 'Internado'}</span>
            <span className="hidden lg:inline">•</span>
            <span className={clsx(
              "font-bold",
              resolvedSimulation?.config?.difficulty === 'Fácil' && "text-emerald-500",
              (!resolvedSimulation || resolvedSimulation?.config?.difficulty === 'Intermedia') && "text-amber-500",
              resolvedSimulation?.config?.difficulty === 'Difícil' && "text-orange-500",
              resolvedSimulation?.config?.difficulty === 'Crítica' && "text-red-500"
            )}>DIFICULTAD: {resolvedSimulation?.config?.difficulty || 'Intermedia'} | MODO: {resolvedSimulation?.config?.mode || 'Caso individual'}</span>
          </div>
        </div>
        <div className="lg:text-right flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-0">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-0 lg:mb-1">Resultado Global</div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl lg:text-5xl font-bold text-white">82</span>
            <span className="text-lg lg:text-xl text-slate-500">/ 100</span>
          </div>
          <div className="text-xs text-slate-400 mt-0 lg:mt-2 flex items-center gap-1 ml-auto lg:ml-0">
            <Clock className="w-3 h-3" /> Tiempo Total: 16:42
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Competencies & Mentor */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* GuardIA Mentor */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-slate-300">GuardIA Mentor</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Lo que hiciste bien</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Reconociste correctamente el deterioro respiratorio y hemodinámico. Realizaste una intervención apropiada con fluidoterapia y verificaste la respuesta del paciente mediante reevaluación.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Oportunidades de Mejora</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  El ECG fue solicitado más tarde de lo esperado considerando la presentación inicial del paciente. En dolor torácico, el ECG debe realizarse en los primeros 10 minutos.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Momento Crítico</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  A los 07:21 comenzó un deterioro clínico. Reconociste el cambio 41 segundos después y ejecutaste tu primera acción a los 58 segundos. Tiempo de respuesta aceptable, pero optimizable.
                </p>
              </div>
              <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Recomendación</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  En pacientes con hipotensión limítrofe (TA 90/55), priorizá la expansión de volumen antes de administrar vasodilatadores (Nitroglicerina) para evitar shock iatrogénico.
                </p>
              </div>
            </div>
          </section>

          {/* Vitals vs Decisions Evolution Chart (Conceptual) */}
          <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-between">
              Evolución del Paciente e Impacto de Decisiones
              <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">SatO₂ & FC</span>
            </h2>
            
            <div className="relative h-48 w-full border-b border-l border-slate-700/50 mb-4 font-mono">
              {/* Y Axis Labels */}
              <div className="absolute -left-8 top-0 text-[10px] text-slate-500">100</div>
              <div className="absolute -left-8 top-1/2 text-[10px] text-slate-500">90</div>
              <div className="absolute -left-8 bottom-0 text-[10px] text-slate-500">80</div>

              {/* SatO2 Line */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d="M 0,20 L 150,20 L 300,30 L 400,90 L 500,80 L 600,60 L 700,25 L 850,25" fill="none" stroke="#38bdf8" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                {/* Intervention Nodes */}
                <circle cx="400" cy="90" r="5" fill="#05070A" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="500" cy="80" r="5" fill="#05070A" stroke="#4ade80" strokeWidth="2" />
                <circle cx="700" cy="25" r="5" fill="#05070A" stroke="#4ade80" strokeWidth="2" />
              </svg>

              {/* Annotations */}
              <div className="absolute left-[380px] top-[100px] flex flex-col items-center">
                <div className="w-px h-16 bg-dashed border-l border-dashed border-slate-600"></div>
                <div className="bg-slate-800 border border-slate-700 text-[9px] px-2 py-1 rounded mt-1 text-slate-300">Deterioro (SatO₂ 89%)</div>
              </div>

              <div className="absolute left-[480px] top-[40px] flex flex-col items-center">
                <div className="bg-indigo-900 border border-indigo-500 text-[9px] px-2 py-1 rounded mb-1 text-indigo-200">INTERVENCIÓN: Oxígeno</div>
                <div className="w-px h-8 bg-dashed border-l border-dashed border-indigo-500/50"></div>
              </div>

              <div className="absolute left-[680px] top-[45px] flex flex-col items-center">
                <div className="bg-emerald-900 border border-emerald-500 text-[9px] px-2 py-1 rounded mb-1 text-emerald-200">REEVALUACIÓN</div>
                <div className="w-px h-16 bg-dashed border-l border-dashed border-emerald-500/50"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:42</span>
            </div>
          </section>

          {/* Ask GuardIA Mentor */}
          <section className="bg-[#080C14] border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Preguntale a GuardIA Mentor sobre tu simulación
            </h2>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-4 text-sm text-slate-300">
              <p>Estoy analizando el caso de Carlos Méndez. ¿Tenés alguna duda sobre tu evaluación, por qué la Nitroglicerina estaba contraindicada inicialmente, o cómo mejorar tus tiempos?</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ej: ¿Qué otra conducta habría sido razonable ante la hipotensión?" 
                className="flex-1 bg-[#05070A] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl text-sm font-bold transition-colors">
                Preguntar
              </button>
            </div>
          </section>

        </div>

        {/* Right Column: Timeline & Competencies */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Patient Safety */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Patient Safety Score</div>
                <div className="text-sm font-bold text-slate-200">Práctica Segura</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400">90</div>
          </div>

          {/* Competency Breakdown */}
          <div className="bg-[#080C14] border border-slate-800 rounded-2xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Evaluación por Competencias</h2>
            <div className="space-y-4">
              {[
                { label: 'Anamnesis', score: 91 },
                { label: 'Examen Físico', score: 76 },
                { label: 'Estudios Complementarios', score: 81 },
                { label: 'Priorización y Tiempos', score: 73 },
                { label: 'Manejo Inicial', score: 87 },
                { label: 'Reevaluación', score: 90 }
              ].map(comp => (
                <div key={comp.label}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-slate-300 font-medium">{comp.label}</span>
                    <span className="text-xs font-mono text-slate-400">{comp.score}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className={clsx("h-1.5 rounded-full", comp.score >= 85 ? "bg-emerald-500" : comp.score >= 75 ? "bg-indigo-500" : "bg-amber-500")} 
                      style={{ width: `${comp.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Timeline */}
          <div className="bg-[#080C14] border border-slate-800 rounded-2xl p-5 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
              Timeline de Decisiones
              <span className="text-[9px] text-indigo-400 cursor-pointer hover:underline">VER TODO</span>
            </h2>
            <div className="relative border-l-2 border-slate-800 ml-3 space-y-6 pb-4">
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#080C14] border-2 border-emerald-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mb-0.5">00:42</div>
                <div className="text-xs font-bold text-slate-200">Buena Decisión</div>
                <div className="text-xs text-slate-400 mt-1">Investiga características y radiación del dolor detalladamente.</div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#080C14] border-2 border-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mb-0.5">04:37</div>
                <div className="text-xs font-bold text-slate-200">Decisión Tardía</div>
                <div className="text-xs text-slate-400 mt-1">Solicita ECG. Apropiado, pero demorado para la sospecha de SCA.</div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#080C14] border-2 border-red-500 flex items-center justify-center">
                  <Activity className="w-2.5 h-2.5 text-red-500" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mb-0.5">07:21</div>
                <div className="text-xs font-bold text-red-400">Evento Crítico</div>
                <div className="text-xs text-slate-400 mt-1">Comienza deterioro hemodinámico. SatO₂ 89%. Hipotensión.</div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#080C14] border-2 border-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mb-0.5">08:19</div>
                <div className="text-xs font-bold text-slate-200">Intervención Correcta</div>
                <div className="text-xs text-slate-400 mt-1">Administra Oxígeno suplementario y expande volumen.</div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#080C14] border-2 border-slate-600 flex items-center justify-center">
                  <Stethoscope className="w-2.5 h-2.5 text-slate-500" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mb-0.5">11:20</div>
                <div className="text-xs font-bold text-slate-200">Escalamiento</div>
                <div className="text-xs text-slate-400 mt-1">Solicita ayuda a Cardiología (Hemodinamia).</div>
              </div>

            </div>
          </div>

          <button 
            onClick={onRetry}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:border-slate-600"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar Nueva Variante
          </button>
        </div>

      </div>
    </div>
  );
}
