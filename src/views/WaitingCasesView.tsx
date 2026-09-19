import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, User, Stethoscope, ChevronRight, Activity, ShieldAlert, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { ClinicalCase, SimulationConfig } from '../types';
import { libraryCases } from '../data/mockData';

export function WaitingCasesView({
  config,
  onSelectCase,
  onBack
}: {
  config: SimulationConfig;
  onSelectCase: (selectedCase: ClinicalCase) => void;
  onBack: () => void;
}) {
  const [hoveredCaseId, setHoveredCaseId] = useState<string | null>(null);

  // Filter cases according to active specialty
  const filteredCases = useMemo(() => {
    const specialty = config.specialty;
    // General specialties see all cases
    if (
      specialty === 'Guardia General' ||
      specialty === 'Emergencias' ||
      specialty === 'Medicina Interna'
    ) {
      return libraryCases;
    }
    // Specific specialties filter strictly
    return libraryCases.filter(
      c => c.specialty.toLowerCase() === specialty.toLowerCase()
    );
  }, [config.specialty]);

  // Color mapping based on difficulty (educational triage levels)
  const triageBadge = useMemo(() => {
    switch (config.difficulty) {
      case 'Fácil':
        return {
          label: 'Triage Verde (Baja Urgencia)',
          colorClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          dotClass: 'bg-emerald-500'
        };
      case 'Intermedia':
        return {
          label: 'Triage Amarillo (Urgencia)',
          colorClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          dotClass: 'bg-amber-500'
        };
      case 'Difícil':
        return {
          label: 'Triage Naranja (Emergencia Moderada)',
          colorClass: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
          dotClass: 'bg-orange-500'
        };
      case 'Crítica':
        return {
          label: 'Triage Rojo (Emergencia Crítica)',
          colorClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          dotClass: 'bg-rose-500'
        };
      default:
        return {
          label: 'Triage Amarillo (Urgencia)',
          colorClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          dotClass: 'bg-amber-500'
        };
    }
  }, [config.difficulty]);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4"
      >
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
            Sistema de Admisión de Emergencias
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
            Casos en Espera (Triage)
          </h1>
        </div>

        {/* Configuration Summary Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-2 text-sm max-w-md shadow-inner backdrop-blur-md">
          <div>
            <span className="text-slate-500 block text-xs uppercase tracking-wider">Especialidad</span>
            <span className="font-semibold text-slate-200">{config.specialty}</span>
          </div>
          <div className="border-l border-slate-800 pl-6">
            <span className="text-slate-500 block text-xs uppercase tracking-wider">Formación</span>
            <span className="font-semibold text-indigo-300">{config.level}</span>
          </div>
          <div className="border-l border-slate-800 pl-6">
            <span className="text-slate-500 block text-xs uppercase tracking-wider">Dificultad</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span className={clsx("w-2 h-2 rounded-full", triageBadge.dotClass)} />
              {config.difficulty}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid List */}
      <div className="flex-1 flex flex-col">
        {filteredCases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-950/20"
          >
            <AlertTriangle className="w-12 h-12 text-amber-500/80 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">No hay pacientes esperando</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              No se encontraron casos clínicos que coincidan con la especialidad seleccionada para esta guardia.
            </p>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-all"
            >
              Volver a Configurar
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider px-2">
              <span>Pacientes en Lista de Espera ({filteredCases.length})</span>
              <span>Haga clic en un paciente para admitir a Box</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCases.map((caseItem, idx) => {
                const patient = caseItem.patient;
                const isHovered = hoveredCaseId === caseItem.id;
                
                return (
                  <motion.div
                    key={caseItem.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={clsx(
                      "group bg-[#090D16] border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full shadow-lg relative",
                      isHovered
                        ? "border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)] bg-indigo-950/5"
                        : "border-slate-800/80 hover:border-slate-700 bg-gradient-to-b from-[#090D16] to-[#06080F]"
                    )}
                    onMouseEnter={() => setHoveredCaseId(caseItem.id)}
                    onMouseLeave={() => setHoveredCaseId(null)}
                    onClick={() => onSelectCase(caseItem)}
                  >
                    <div className="p-5 flex gap-4 flex-1">
                      {/* Avatar container */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0 bg-slate-900 self-center">
                        {patient.avatarUrl ? (
                          <img
                            src={patient.avatarUrl}
                            alt={patient.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <User className="w-10 h-10" />
                          </div>
                        )}
                      </div>

                      {/* Info details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-white text-lg truncate group-hover:text-indigo-400 transition-colors">
                            {patient.name}
                          </h3>
                          <span className={clsx("px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border whitespace-nowrap self-start", triageBadge.colorClass)}>
                            {triageBadge.label}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-3 mb-3">
                          <span className="bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                            {patient.age} {patient.ageUnit || 'años'}
                          </span>
                          <span>•</span>
                          <span>Sexo: {patient.gender === 'M' ? 'Masculino' : 'Femenino'}</span>
                          <span>•</span>
                          <span className="text-indigo-400/90 font-medium">{caseItem.specialty}</span>
                        </div>

                        {/* Consulting Reason & History snippet */}
                        <div className="space-y-1.5">
                          <div className="text-xs text-slate-400 flex gap-1.5 items-start">
                            <Stethoscope className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300">
                              <strong className="text-slate-400">Motivo:</strong> {patient.reasonForConsultation}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-2 italic pl-5">
                            {patient.clinicalHistory ? patient.clinicalHistory.replace('HISTORIA CLÍNICA DEL CASO:', '').trim() : 'Sin antecedentes descriptos.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action bar */}
                    <div className={clsx(
                      "h-11 px-5 border-t flex items-center justify-between text-xs transition-all duration-300",
                      isHovered
                        ? "bg-indigo-600 border-indigo-500/30 text-white"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                    )}>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Duración: {caseItem.duration} minutos</span>
                      </div>
                      <span className="flex items-center gap-1 font-semibold tracking-wider">
                        ADMITIR A BOX
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Back button */}
            <div className="pt-6 flex justify-start">
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-400 rounded-xl text-sm font-medium transition-all"
              >
                ← Volver a Configurar Guardia
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
