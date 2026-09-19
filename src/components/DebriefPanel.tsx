import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Brain, 
  TrendingUp,
  MessageSquare,
  RotateCcw,
  Stethoscope,
  Wind,
  Droplets,
  Pill,
  PhoneCall,
  Eye,
  TestTube,
  Users
} from 'lucide-react';
import clsx from 'clsx';
import { ResolvedSimulation, ClinicalActionEvent, SafetyGrade, DebriefFeedback, ClinicalCase } from '../types';

interface DebriefPanelProps {
  resolvedSimulation?: ResolvedSimulation;
  currentCase?: ClinicalCase;
  events?: ClinicalActionEvent[];
  timeElapsed?: number;
  interviewTurns?: number;
  aiFeedback?: DebriefFeedback;
  debriefRecommendation?: string;
  onRetry: () => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function DebriefPanel({
  onRetry,
  resolvedSimulation,
  currentCase,
  events = [],
  timeElapsed = 0,
  interviewTurns = 0,
  aiFeedback,
  debriefRecommendation,
}: DebriefPanelProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const patientName = resolvedSimulation?.baseCase?.patient?.name || currentCase?.patient?.name || 'Paciente';
  const caseTitle = resolvedSimulation?.baseCase?.title || currentCase?.title || 'Caso clínico';
  const specialty = resolvedSimulation?.config?.specialty || currentCase?.specialty || 'Guardia';

  const hasDeath = events.some(e => e.actionId === 'DEFUNCIÓN_PACIENTE');
  const unsafeEvents = events.filter(e => e.safetyGrade === 'POTENTIALLY_UNSAFE');
  const hasReeval = events.some(e => e.actionId === 'REEVALUAR');
  const hasExam = events.some(e => e.actionId === 'EXAMEN_FISICO' || e.actionId === 'EVAL_NEURO');
  const hasStudies = events.some(e => ['ECG', 'LAB', 'RX_TORAX', 'ECO_POCUS', 'TC_CRANEO', 'TAC_TRAUMA', 'PRESION_COMPARTIMENTAL', 'GLUCEMIA'].includes(e.actionId));
  const firstIntervention = events.find(e =>
    ['O2', 'FLUIDOS', 'ASPIRINA', 'ADRENALINA_IM', 'INSULINA_IV', 'ANTIBIOTICOS_IV', 'ATB_NO_PENICILINA', 'FUROSEMIDA', 'MORFINA', 'MONITOR', 'VIA_VENOSA', 'CONTROL_HEMORRAGIA', 'HEMODERIVADOS', 'VIA_AEREA', 'NORADRENALINA', 'COLLAR_CERVICAL', 'BETABLOQUEADOR'].includes(e.actionId)
  );
  const doseMisses = events.filter(e => e.doseEffect === 'SUBTHERAPEUTIC' || e.doseEffect === 'TOXIC');

  const impactSum = events.reduce((sum, e) => sum + (e.scoreImpact ?? 0), 0);

  const anamnesisScore = interviewTurns >= 5 ? 90 : interviewTurns >= 2 ? 76 : interviewTurns >= 1 ? 62 : 48;
  const examScore = hasExam ? 88 : 58;
  const studiesScore = hasStudies ? 90 : 60;
  const timingScore = events.length > 0 ? Math.min(95, Math.max(55, 100 - Math.floor(timeElapsed / 30))) : 55;
  const managementScore = clamp(50 + impactSum, 18, 98);
  const reevalScore = hasReeval ? 92 : 58;

  let totalScore = Math.round(
    anamnesisScore * 0.15 +
    examScore * 0.15 +
    studiesScore * 0.15 +
    timingScore * 0.15 +
    managementScore * 0.25 +
    reevalScore * 0.15
  );
  if (hasDeath) totalScore = Math.min(totalScore, 32);
  totalScore = clamp(totalScore, 8, 100);

  const safetyScore = hasDeath
    ? 28
    : unsafeEvents.length >= 2
      ? 45
      : unsafeEvents.length === 1
        ? 62
        : totalScore >= 80 ? 92 : totalScore >= 65 ? 78 : 60;


  const getActionIcon = (category: string, actionId: string) => {
    switch (actionId) {
      case 'O2': return <Wind className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ECG': return <Activity className="w-3.5 h-3.5 text-blue-400" />;
      case 'LAB': return <TestTube className="w-3.5 h-3.5 text-blue-400" />;
      case 'ASPIRINA':
      case 'CLOPIDOGREL':
      case 'NITRO':
      case 'MORFINA':
      case 'HEPARINA':
      case 'BETABLOQUEADOR':
      case 'ESTATINA': return <Pill className="w-3.5 h-3.5 text-indigo-400" />;
      case 'FLUIDOS':
      case 'VIA_VENOSA': return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'AYUDA_CARDIO':
      case 'SUPERVISOR': return <PhoneCall className="w-3.5 h-3.5 text-orange-400" />;
      case 'EXAMEN_FISICO': return <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />;
      case 'RESOLUCION_CASO': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Eye className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getSafetyBadge = (grade?: SafetyGrade) => {
    switch (grade) {
      case 'OPTIMAL':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold">Óptima</span>;
      case 'APPROPRIATE':
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold">Apropiada</span>;
      case 'LATE':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold">Tardía</span>;
      case 'INAPPROPRIATE':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold">Inapropiada</span>;
      case 'UNNECESSARY':
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold">Innecesaria</span>;
      case 'POTENTIALLY_UNSAFE':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold">Riesgo Clínico</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">Registrada</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05070A] overflow-y-auto text-slate-200">
      
      {/* Header Premium */}
      <header className="border-b border-slate-800 bg-[#080C14] px-4 lg:px-8 py-6 lg:py-8 flex flex-col lg:flex-row lg:items-end justify-between sticky top-0 z-20 gap-4 lg:gap-0">
        <div>
          <div className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            GuardIA · Debriefing clínico y análisis
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Simulación Finalizada</h1>
          <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-slate-400 font-mono">
            <span>PACIENTE: {patientName}</span>
            <span className="hidden lg:inline">•</span>
            <span>ESCENARIO: {caseTitle} ({specialty})</span>
            <span className="hidden lg:inline">•</span>
            <span>NIVEL: {resolvedSimulation?.config?.level || 'Residente'}</span>
            <span className="hidden lg:inline">•</span>
            <span className={clsx(
              "font-bold",
              resolvedSimulation?.config?.difficulty === 'Fácil' && "text-emerald-500",
              (!resolvedSimulation || resolvedSimulation?.config?.difficulty === 'Intermedia') && "text-amber-500",
              resolvedSimulation?.config?.difficulty === 'Difícil' && "text-orange-500",
              resolvedSimulation?.config?.difficulty === 'Crítica' && "text-red-500"
            )}>DIFICULTAD: {resolvedSimulation?.config?.difficulty || 'Intermedia'} | MODO: {resolvedSimulation?.config?.mode || 'Entrenamiento'}</span>
          </div>
        </div>
        <div className="lg:text-right flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-0">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-0 lg:mb-1">Resultado Global</div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl lg:text-5xl font-bold text-white">{totalScore}</span>
            <span className="text-lg lg:text-xl text-slate-500">/ 100</span>
          </div>
          <div className="text-xs text-slate-400 mt-0 lg:mt-2 flex items-center gap-1 ml-auto lg:ml-0 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Tiempo Total: {formatTime(timeElapsed)}
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Competencies & Mentor */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* GuardIA Mentor Feedback Cards */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-slate-300">GuardIA Mentor Clínico</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Lo que hiciste bien</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {aiFeedback?.strengths || (hasExam || hasStudies
                    ? 'Completaste evaluación y estudios dirigidos al cuadro de ingreso.'
                    : 'Mantuviste el interrogatorio y registraste el caso.')}
                  {!aiFeedback && hasReeval ? ' Reevaluaste la evolución clínica.' : ''}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Oportunidades de Mejora</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {aiFeedback?.improvements || (doseMisses.length > 0
                    ? `Revisá las dosis indicadas: ${doseMisses.map(e => e.label).join(', ')}. En el debrief se evalúa si esa dosis era la del caso; el paciente evolucionó según el conjunto de conductas, no por un único click.`
                    : unsafeEvents.length > 0
                    ? `Se registró conducta de riesgo: ${unsafeEvents[0].label}. Revisá las contraindicaciones de este caso.`
                    : !hasReeval
                      ? 'Faltó una reevaluación explícita después de las intervenciones.'
                      : 'Se puede optimizar la secuencia y los tiempos de las conductas clave.')}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Momento Crítico</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {aiFeedback?.criticalMoment || (hasDeath
                    ? 'El paciente evolucionó a óbito. El debrief debe concentrarse en la conducta que precipitó el colapso.'
                    : firstIntervention
                      ? `Ejecutaste tu primera intervención (${firstIntervention.label}) a los ${firstIntervention.executedAtFormatted}.`
                      : 'Durante el deterioro es fundamental iniciar soporte sin demora.')}
                </p>
              </div>

              <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Recomendación Pedagógica</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {aiFeedback?.recommendation || debriefRecommendation || 'La conducta debe seguir el motivo de consulta de este caso, no un protocolo genérico.'}
                </p>
              </div>
            </div>
          </section>

          {/* Dynamic Decisions Impact Chart */}
          <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
              <span>Evolución Fisiológica e Impacto de Decisiones</span>
              <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded text-indigo-300 font-mono">SatO₂ & FC Dinámica</span>
            </h2>
            
            <div className="relative h-44 w-full border-b border-l border-slate-700/50 mb-3 font-mono">
              <div className="absolute -left-8 top-0 text-[10px] text-slate-500">100%</div>
              <div className="absolute -left-8 top-1/2 text-[10px] text-slate-500">90%</div>
              <div className="absolute -left-8 bottom-0 text-[10px] text-slate-500">80%</div>

              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d="M 0,30 L 150,30 L 300,45 L 450,110 L 600,85 L 750,50 L 900,30" fill="none" stroke="#38bdf8" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                <circle cx="450" cy="110" r="5" fill="#05070A" stroke="#f43f5e" strokeWidth="2" />
                <circle cx="600" cy="85" r="5" fill="#05070A" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="750" cy="50" r="5" fill="#05070A" stroke="#4ade80" strokeWidth="2" />
              </svg>

              <div className="absolute left-[430px] top-[115px] flex flex-col items-center">
                <div className="w-px h-8 bg-dashed border-l border-dashed border-red-500/50"></div>
                <div className="bg-red-950/80 border border-red-500/40 text-[9px] px-2 py-0.5 rounded text-red-300">Deterioro Agudo</div>
              </div>

              <div className="absolute left-[580px] top-[35px] flex flex-col items-center">
                <div className="bg-indigo-950/80 border border-indigo-500/40 text-[9px] px-2 py-0.5 rounded text-indigo-300">Intervención</div>
                <div className="w-px h-8 bg-dashed border-l border-dashed border-indigo-500/50"></div>
              </div>

              <div className="absolute left-[730px] top-[15px] flex flex-col items-center">
                <div className="bg-emerald-950/80 border border-emerald-500/40 text-[9px] px-2 py-0.5 rounded text-emerald-300">Estabilización</div>
                <div className="w-px h-8 bg-dashed border-l border-dashed border-emerald-500/50"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>00:00</span>
              <span>Inicio Guardia</span>
              <span>Deterioro</span>
              <span>Intervenciones</span>
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </section>

          {/* Ask GuardIA Mentor Interactive */}
          <section className="bg-[#080C14] border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Preguntale a GuardIA Mentor sobre tu simulación
            </h2>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-4 text-sm text-slate-300">
              <p>Estoy analizando el caso de {patientName} ({caseTitle}). ¿Tenés alguna duda sobre la secuencia de decisiones o el criterio de destino final?</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ej: ¿Qué hubiera cambiado el destino o la primera intervención en este caso?" 
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
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Puntaje de seguridad del paciente</div>
                <div className="text-sm font-bold text-slate-200">{safetyScore >= 80 ? 'Práctica Segura' : 'Atención con Riesgos'}</div>
              </div>
            </div>
            <div className={clsx("text-2xl font-bold font-mono", safetyScore >= 80 ? "text-emerald-400" : "text-amber-400")}>
              {safetyScore}
            </div>
          </div>

          {/* Competency Breakdown */}
          <div className="bg-[#080C14] border border-slate-800 rounded-2xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Evaluación por Competencias</h2>
            <div className="space-y-4">
              {[
                { label: 'Anamnesis', score: anamnesisScore },
                { label: 'Examen Físico', score: examScore },
                { label: 'Estudios Complementarios', score: studiesScore },
                { label: 'Priorización y Tiempos', score: timingScore },
                { label: 'Manejo Inicial', score: managementScore },
                { label: 'Reevaluación', score: reevalScore }
              ].map(comp => (
                <div key={comp.label}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-slate-300 font-medium">{comp.label}</span>
                    <span className="text-xs font-mono text-slate-400">{comp.score}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className={clsx("h-1.5 rounded-full transition-all duration-1000", comp.score >= 85 ? "bg-emerald-500" : comp.score >= 75 ? "bg-indigo-500" : "bg-amber-500")} 
                      style={{ width: `${comp.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REAL Clinical Timeline of Executed Actions */}
          <div className="bg-[#080C14] border border-slate-800 rounded-2xl p-5 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
              <span>Línea de tiempo de acciones clínicas</span>
              <span className="text-[10px] font-mono text-slate-500">{events.length} Registros</span>
            </h2>
            
            {events.length === 0 ? (
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                No se registraron acciones clínicas ejecutadas durante esta guardia.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-800 ml-3 space-y-4 pb-2">
                {events.map((event, idx) => (
                  <div key={event.id || idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#080C14] border-2 border-indigo-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">{event.executedAtFormatted}</span>
                      {getSafetyBadge(event.safetyGrade)}
                    </div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {getActionIcon(event.category, event.actionId)}
                      <span>{event.label}</span>
                      {typeof event.scoreImpact === 'number' && (
                        <span className={clsx(
                          "ml-auto text-[10px] font-mono",
                          event.scoreImpact > 0 ? "text-emerald-400" : event.scoreImpact < 0 ? "text-rose-400" : "text-slate-500"
                        )}>
                          {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}
                        </span>
                      )}
                    </div>
                    {event.doseEffect && (
                      <div className={clsx(
                        "text-[10px] font-mono mt-0.5",
                        event.doseEffect === 'THERAPEUTIC' ? "text-emerald-500/80" : event.doseEffect === 'TOXIC' ? "text-red-400" : "text-amber-400"
                      )}>
                        {event.doseEffect === 'THERAPEUTIC' ? 'Dosis terapéutica' : event.doseEffect === 'TOXIC' ? 'Dosis tóxica / excesiva' : 'Dosis insuficiente'}
                      </div>
                    )}
                    {event.vitalSnapshot && (
                      <div className="text-[10px] font-mono text-slate-500 mt-1 flex gap-2">
                        <span>FC: {event.vitalSnapshot.hr}</span>
                        <span>TA: {event.vitalSnapshot.bp_sys}/{event.vitalSnapshot.bp_dia}</span>
                        <span>Sat: {event.vitalSnapshot.spo2}%</span>
                      </div>
                    )}
                    {event.evaluationFeedback && (
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {event.evaluationFeedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onRetry}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar Caso / Nueva Guardia
          </button>
        </div>

      </div>
    </div>
  );
}
