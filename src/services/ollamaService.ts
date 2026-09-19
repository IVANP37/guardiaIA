import { ResolvedSimulation, VitalSigns, ClinicalCase, ClinicalActionEvent, DebriefFeedback } from '../types';
import { getCaseRuntime } from '../data/caseRuntime';
import { labelClinicalState } from '../utils/uiLabels';

export interface PatientAIContext {
  userMessage: string;
  chatHistory: { role: 'user' | 'assistant' | 'system'; content: string }[];
  currentCase: ClinicalCase;
  resolvedSimulation?: ResolvedSimulation | null;
  currentVitals: VitalSigns;
  clinicalPhase: number; // 0: Inicial, 1: Deterioro Crítico, 2: Recuperación/Respuesta a tto, 3: Shock Hipotensivo
  interlocutor?: 'patient' | 'companion';
  recentActions?: { name: string; status: 'PENDING' | 'COMPLETED'; timestamp: number }[];
}

// Configurable via Vite environment variables
const getOllamaBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_OLLAMA_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:11434';
};

const getOllamaModel = (): string => {
  return import.meta.env.VITE_OLLAMA_MODEL || 'gpt-oss:120b-cloud';
};

/**
 * Builds the dynamic system prompt for the Patient Agent.
 * Ensures strict compliance with clinical simulation guidelines:
 * - Never breaks character.
 * - Never gives away the case or unprompted history.
 * - Does not use medical terminology.
 * - Modulates communication based on current dynamic physiological state.
 */
function buildPatientSystemPrompt(context: PatientAIContext): string {
  const { currentCase, resolvedSimulation, currentVitals, clinicalPhase, interlocutor, recentActions } = context;
  const patient = currentCase.patient;
  const runtime = getCaseRuntime(currentCase);
  const isCompanion = Boolean(patient.companion) && (interlocutor === 'companion' || runtime.forceCompanionSpeaker);
  const localeNote = 'Usa español de Argentina (es-AR) natural, cotidiano y respetuoso (trato de "doctor" o "doc"). No exageres con modismos caricaturescos.';
  const vitalsLine = `Signos vitales actuales: FC ${currentVitals.hr} lpm, TA ${currentVitals.bp_sys}/${currentVitals.bp_dia} mmHg, SatO2 ${currentVitals.spo2}%, FR ${currentVitals.rr} rpm, Temp ${currentVitals.temp} °C.`;

  let clinicalStateDescription = '';
  let communicationConstraint = '';

  switch (clinicalPhase) {
    case 1:
      clinicalStateDescription = `${runtime.phase1Label}
- El motivo de consulta (${patient.reasonForConsultation}) EMPEORÓ. No inventes un infarto ni dolor de pecho si el caso no lo tiene.
- ${vitalsLine}`;
      communicationConstraint = `REGLA DE VOZ: ${runtime.phase1Voice}`;
      break;
    case 2:
      clinicalStateDescription = `${runtime.phase2Label}
- Hay alivio parcial del mismo cuadro de ingreso, no de otro diagnóstico.
- ${vitalsLine}`;
      communicationConstraint = `REGLA DE VOZ: ${runtime.phase2Voice}`;
      break;
    case 3:
      clinicalStateDescription = `${runtime.phase3Label}
- ${vitalsLine}`;
      communicationConstraint = `REGLA DE VOZ: ${runtime.phase3Voice}`;
      break;
    default:
      clinicalStateDescription = `${runtime.phase0Label}
- Motivo de consulta: ${patient.reasonForConsultation}. Estado inicial: ${labelClinicalState(patient.initialState)}.
- ${vitalsLine}`;
      communicationConstraint = `REGLA DE VOZ: ${runtime.phase0Voice}`;
      break;
  }

  // Interventions context
  const completedActions = (recentActions || [])
    .filter(a => a.status === 'COMPLETED')
    .map(a => a.name)
    .join(', ');

  const interventionsNote = completedActions 
    ? `Fármacos y medidas ya administrados (con la dosis si el médico la indicó): ${completedActions}. La mejoría o el empeoramiento dependen del caso y de TODO ese conjunto, no de una sola toma. Si más tarde suben la dosis, tenelo en cuenta. No inventes mejoría mágica ni niegues el cuadro.`
    : 'Aún no se han completado intervenciones terapéuticas adicionales.';

  // Simulation Configuration Context (Difficulty, Specialty, Level, Mode)
  let simulationConfigNote = '';
  if (resolvedSimulation && resolvedSimulation.config) {
    const { specialty, difficulty, level, mode } = resolvedSimulation.config;
    simulationConfigNote = `
CONFIGURACIÓN DE LA GUARDIA Y ADAPTACIÓN PEDAGÓGICA:
- Especialidad médica: ${specialty}
- Dificultad del caso: ${difficulty}
- Nivel de formación del médico evaluado: ${level}
- Modo de simulación: ${mode}
- Modificador pedagógico activo: ${resolvedSimulation.systemPromptModifier || 'Presentación clínica estándar.'}

DIRECTIVAS SEGÚN DIFICULTAD Y NIVEL:
${difficulty === 'Fácil' ? '- Presenta tus síntomas de manera clara y típica cuando te pregunten.' : ''}
${difficulty === 'Difícil' ? '- Sé más reservado o vago en las respuestas iniciales. Obliga al médico a hacer preguntas semiológicas precisas para obtener datos clave.' : ''}
${difficulty === 'Crítica' ? '- Tu estado es de extrema gravedad. Respuestas muy cortas y entrecortadas desde el inicio por disnea y dolor severo.' : ''}
${level.includes('Estudiante') ? '- El médico es un estudiante: sé paciente pero mantén tu sintomatología realista.' : ''}
${mode === 'Examen' ? '- Modo Examen: estricta reserva de información no preguntada explícitamente.' : ''}
`;
  }

  if (isCompanion) {
    const companion = patient.companion!;
    return `Sos ${companion.name}, ${companion.role} de ${patient.name} (${patient.age} ${patient.ageUnit || 'años'}).
Estás en la guardia médica porque ${patient.reasonForConsultation}.

${localeNote}

${simulationConfigNote}

${clinicalStateDescription}

REGLAS FUNDAMENTALES:
1. Habla como un familiar preocupado y protector en una guardia médica.
2. Contesta ÚNICAMENTE a lo que el médico te pregunte por el chat.
3. No uses términos médicos técnicos.
4. NUNCA rompas el personaje. NUNCA menciones que eres una IA ni un modelo de lenguaje.
5. El cuadro es ${patient.reasonForConsultation}. No lo conviertas en un infarto ni en dolor de pecho del adulto si no corresponde.`;
  }

  return `Eres el paciente virtual en una simulación de educación médica de guardia.
Tu identidad: ${patient.name}, ${patient.age} ${patient.ageUnit || 'años'}, sexo ${patient.gender === 'M' ? 'masculino' : 'femenino'}.
Motivo de consulta: ${patient.reasonForConsultation}.
Especialidad del caso: ${currentCase.specialty}. Título: ${currentCase.title}.
NUNCA cambies este caso por un infarto o dolor de pecho si el motivo de consulta es otro.

${localeNote}

${simulationConfigNote}

${clinicalStateDescription}

${interventionsNote}

${patient.clinicalHistory || `HISTORIA CLÍNICA DEL CASO:
- Motivo de consulta: ${patient.reasonForConsultation}.
- Respondé solo con lo que un paciente real sabría de ese cuadro. No inventes una historia de infarto.`}

REGLAS ABSOLUTAS E INQUEBRANTABLES:
1. INTERPRETA EXCLUSIVAMENTE AL PACIENTE (${patient.name}). NUNCA actúes como médico, asistente, tutor ni IA.
2. NO REGALES EL CASO: Responde PUNTUALMENTE a lo que el médico escribe en el chat. Si te pregunta "¿Cuándo empezó?", responde solo la hora de inicio. NO agregues tus antecedentes, medicación ni factores de riesgo a menos que te pregunten expresamente por ellos.
3. NO CONOCES TU DIAGNÓSTICO: Nunca digas "tengo un síndrome coronario" ni nombres médicos técnicos. Habla de sensaciones: "me aprieta", "me falta el aire", "me punza", "me siento pesado".
4. LENGUAJE NATURAL: Habla como una persona común en una guardia. Sin listas, sin explicaciones académicas, sin saludos robóticos.
5. RESPETA TU ESTADO FISIOLÓGICO: ${communicationConstraint}
6. UNA ÚNICA VERDAD: No inventes cambios en tus signos vitales ni nuevos diagnósticos. La evolución depende del estado clínico provisto.
7. MANTÉN CONSISTENCIA con lo que ya hayas dicho en la conversación previa.`;
}

/**
 * Executes a call to the Ollama API with fallback to Vite proxy if direct fails.
 */
/**
 * Executes a call to the Ollama API trying direct and proxy endpoints for maximum resilience.
 */
async function callOllamaChatApi(messages: { role: string; content: string }[]): Promise<string> {
  const baseUrl = getOllamaBaseUrl();
  const model = getOllamaModel();

  const requestBody = {
    model: model,
    messages: messages,
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
    },
  };

  const candidateUrls = [
    // 1. Direct configured URL (e.g. http://127.0.0.1:11434/api/chat)
    baseUrl ? `${baseUrl}/api/chat` : 'http://127.0.0.1:11434/api/chat',
    // 2. Vite Dev Server Direct API Proxy
    '/api/chat',
    // 3. Vite Dev Server /ollama Proxy
    '/ollama/api/chat',
    // 4. Localhost fallback
    'http://localhost:11434/api/chat',
  ];

  let lastError: any = null;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (data && data.message && typeof data.message.content === 'string' && data.message.content.trim()) {
        return data.message.content.trim();
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.error('[GuardIA] Todos los endpoints de conexión con Ollama fallaron:', lastError);
  throw lastError || new Error('No se pudo conectar con Ollama en ninguno de los endpoints configurados.');
}

/**
 * Main function to generate a virtual patient response.
 * Abstraction used by SimulatorView.
 */
export async function generatePatientResponse(
  context: PatientAIContext | { userMessage: string; chatHistory: { role: 'user' | 'assistant' | 'system'; content: string }[]; resolvedSimulation: ResolvedSimulation | null }
): Promise<string> {
  // Normalize context
  const fullContext: PatientAIContext = 'currentVitals' in context 
    ? (context as PatientAIContext)
    : {
        userMessage: context.userMessage,
        chatHistory: context.chatHistory,
        currentCase: (context as any).resolvedSimulation?.baseCase || (context as any).currentCase,
        resolvedSimulation: context.resolvedSimulation,
        currentVitals: (context as any).currentCase?.patient?.initialVitals || { hr: 90, bp_sys: 130, bp_dia: 80, rr: 18, spo2: 97, temp: 36.6 },
        clinicalPhase: 0,
        interlocutor: 'patient',
      };

  const systemPrompt = buildPatientSystemPrompt(fullContext);

  // Filter and limit recent relevant conversation history (last 12 turns max)
  const recentHistory = fullContext.chatHistory
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-12);

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: fullContext.userMessage },
  ];

  return await callOllamaChatApi(messagesPayload);
}

export async function generateDebriefFeedback(params: {
  caseTitle: string;
  config: { specialty: string; level: string; difficulty: string; mode: string };
  events: ClinicalActionEvent[];
  messages: { sender: string; text: string }[];
  timeElapsed: number;
}): Promise<DebriefFeedback> {
  const eventsSummary = params.events.map(e => `[${e.executedAtFormatted}] ${e.label} (Resultado: ${e.safetyGrade || 'Registrado'})`).join('\n');
  const chatSummary = params.messages.filter(m => m.sender === 'doctor' || m.sender === 'patient').map(m => `${m.sender === 'doctor' ? 'Médico' : 'Paciente'}: ${m.text}`).join('\n');

  const systemPrompt = `Eres GuardIA Mentor, un médico supervisor experto en emergencias y educación médica.
Analiza la actuación del médico evaluado y genera un debriefing clínico personalizado y constructivo.

CASO: ${params.caseTitle}
CONFIGURACIÓN: Especialidad: ${params.config.specialty}, Nivel: ${params.config.level}, Dificultad: ${params.config.difficulty}, Modo: ${params.config.mode}
TIEMPO TOTAL: ${Math.floor(params.timeElapsed / 60)} min ${params.timeElapsed % 60} seg

Timeline de acciones realizadas por el médico:
${eventsSummary || 'No realizó ninguna acción clínica durante la simulación.'}

Diálogo del médico con el paciente:
${chatSummary || 'No hubo diálogo registrado.'}

Responde EXCLUSIVAMENTE con un objeto JSON válido, sin markdown adicional, que contenga exactamente estos campos:
{
  "strengths": "Texto indicando las fortalezas o buenas decisiones del médico (máx 30 palabras)",
  "improvements": "Texto indicando las oportunidades de mejora o errores cometidos (máx 30 palabras)",
  "criticalMoment": "Texto analizando el desempeño ante el deterioro clínico del paciente (máx 30 palabras)",
  "recommendation": "Texto con una recomendación clínica formativa útil basada en guías médicas (máx 30 palabras)"
}`;

  try {
    const rawContent = await callOllamaChatApi([
      { role: 'user', content: systemPrompt }
    ]);
    
    // Clean up potential markdown wrapper code blocks if model added them
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    return {
      strengths: parsed.strengths || 'Buen reconocimiento inicial del caso.',
      improvements: parsed.improvements || 'Se pueden optimizar los tiempos de solicitud del ECG.',
      criticalMoment: parsed.criticalMoment || 'Actuación adecuada frente al deterioro hemodinámico.',
      recommendation: parsed.recommendation || 'Recordar que en sospecha de SCA, el ECG debe realizarse en menos de 10 minutos.',
    };
  } catch (error) {
    console.warn('[GuardIA] Error al generar debriefing con IA, usando fallback estructurado:', error);
    const hasUnsafe = params.events.some(e => e.safetyGrade === 'POTENTIALLY_UNSAFE' || e.actionId === 'DEFUNCIÓN_PACIENTE');
    const hasReeval = params.events.some(e => e.actionId === 'REEVALUAR');
    const hasSupport = params.events.some(e => ['O2', 'MONITOR', 'FLUIDOS', 'VIA_VENOSA'].includes(e.actionId));
    const firstRx = params.events.find(e => ['O2', 'FLUIDOS', 'ASPIRINA', 'ADRENALINA_IM', 'INSULINA_IV', 'ANTIBIOTICOS_IV', 'ATB_NO_PENICILINA', 'FUROSEMIDA', 'MORFINA', 'CONTROL_HEMORRAGIA', 'HEMODERIVADOS', 'VIA_AEREA', 'NORADRENALINA', 'BETABLOQUEADOR'].includes(e.actionId));
    const coronaryCase = /torácico|infarto|epigastralgia|scacest/i.test(params.caseTitle);

    return {
      strengths: hasSupport
        ? 'Iniciaste medidas de soporte y no dejaste el caso sin intervenciones registradas.'
        : 'Mantuviste el interrogatorio y registraste el cuadro de ingreso.',
      improvements: hasUnsafe
        ? 'Hubo al menos una conducta de riesgo. Revisá contraindicaciones específicas de este caso.'
        : !hasReeval
          ? 'Faltó reevaluación explícita tras las intervenciones.'
          : 'Se puede ajustar la secuencia y los tiempos de las conductas clave.',
      criticalMoment: firstRx
        ? `Primera intervención registrada: ${firstRx.label} a los ${firstRx.executedAtFormatted}.`
        : 'El deterioro clínico exige una primera acción de soporte sin demora.',
      recommendation: coronaryCase
        ? 'En sospecha de SCA, ECG inmediato, monitorización y reperfusión según el escenario.'
        : 'La conducta debe seguir el motivo de consulta de ESTE caso, no un protocolo genérico de infarto.',
    };
  }
}
