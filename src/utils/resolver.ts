import { SimulationConfig, ResolvedSimulation } from '../types';
import { demoCase } from '../data/mockData';

export function resolveSimulation(config: SimulationConfig): ResolvedSimulation {
  // Use Carlos as the base case for this prototype
  const base = JSON.parse(JSON.stringify(demoCase)); // Deep copy

  let multiplier = 1.0;
  let assistanceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'MEDIUM';
  let initialVitalsOverride = undefined;
  let promptModifier = '';

  // 1. Difficulty
  switch(config.difficulty) {
    case 'Fácil':
      multiplier = 0.5;
      promptModifier += 'El paciente presenta síntomas muy claros y típicos. Deterioro clínico lento. Mayor ventana de tiempo para actuar. ';
      break;
    case 'Difícil':
      multiplier = 1.5;
      promptModifier += 'El paciente presenta síntomas atípicos o vagos. Oculta información clave a menos que se le pregunte específicamente. Diagnósticos diferenciales competitivos. Deterioro más rápido. ';
      break;
    case 'Crítica':
      multiplier = 2.5;
      promptModifier += 'El paciente está gravemente enfermo, inestable hemodinámicamente. Respuestas cortas, disnea evidente. Deterioro inminente que requiere priorización inmediata y acciones urgentes. ';
      initialVitalsOverride = {
        hr: 125,
        bp_sys: 90,
        bp_dia: 55,
        rr: 28,
        temp: 37.8,
        spo2: 91
      };
      break;
    default: // Intermedia
      multiplier = 1.0;
      promptModifier += 'Presentación clínica estándar con cierta ambigüedad. Evolución dinámica con posible deterioro. ';
      break;
  }

  // 2. Specialty
  if (config.specialty === 'Cardiología') {
     promptModifier += 'Enfoque cardiológico estricto. Se espera anamnesis cardiovascular detallada, evaluación de riesgo e interpretación profunda. ';
     base.specialty = 'Cardiología';
  } else if (config.specialty === 'Emergencias') {
     promptModifier += 'Enfoque de emergentología y soporte vital inicial (ABCDE). El tiempo apremia y requiere priorización. ';
     base.specialty = 'Emergencias';
  } else {
     promptModifier += 'Enfoque de guardia general e integral. Requiere evaluación inicial completa y diagnóstico diferencial amplio. ';
     base.specialty = config.specialty;
  }

  // 3. Training Level
  if (config.level.includes('Estudiante')) {
    assistanceLevel = 'HIGH';
    promptModifier += 'El evaluado es un estudiante de medicina. Se espera anamnesis básica, reconocimiento de signos de alarma y que solicite ayuda oportunamente. ';
  } else if (config.level === 'Internado') {
    assistanceLevel = 'MEDIUM';
    promptModifier += 'El evaluado es un médico interno. Se espera evaluación eficiente, priorización inicial y reconocimiento temprano de deterioro. ';
  } else if (config.level === 'Residente') {
    assistanceLevel = 'LOW';
    promptModifier += 'El evaluado es un médico residente. Se espera autonomía, decisiones rápidas, interpretación de estudios, manejo específico y escalamiento apropiado. ';
  } else { // Médico, Especialista
    assistanceLevel = 'NONE';
    promptModifier += 'El evaluado es un médico o especialista. Evaluación de alto nivel, autonomía total, priorización avanzada y eficiencia en recursos. ';
  }

  // 4. Mode
  if (config.mode === 'Examen') {
    assistanceLevel = 'NONE';
  }

  return {
    baseCase: base,
    config,
    deteriorationMultiplier: multiplier,
    assistanceLevel,
    initialVitalsOverride,
    systemPromptModifier: promptModifier.trim()
  };
}
