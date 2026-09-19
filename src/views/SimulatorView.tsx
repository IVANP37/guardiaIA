import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { demoCase, demoPediatricCase } from '../data/mockData';
import { ClinicalCase } from '../types';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplets,
  Mic,
  Send,
  Stethoscope,
  TestTube,
  Pill,
  ClipboardList,
  PhoneCall,
  Clock,
  AlertTriangle,
  Users,
  Brain,
  Eye,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

type Tab = 'interview' | 'notes' | 'evolution';

interface Message {
  id: string;
  sender: 'doctor' | 'patient' | 'companion' | 'system';
  text: string;
}

import { DebriefPanel } from '../components/DebriefPanel';
import { generatePatientResponse, generateDebriefFeedback } from '../services/ollamaService';
import { 
  startVoiceRecognition, 
  speakPatientResponse, 
  stopPatientSpeech,
  preloadVoices,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported 
} from '../services/voiceService';

import { ResolvedSimulation, ClinicalActionCategory, ClinicalActionEvent, ClinicalAction, DebriefFeedback, MedicationDoseOption } from "../types";
import { clinicalActionsCatalog } from '../data/clinicalActionsData';
import { getCaseRuntime, matchFallbackReply } from '../data/caseRuntime';
import { getActionSystemLog, getResolutionTrack, getRecoveryEffect } from '../data/caseClinicalPlaybook';
import { labelClinicalPhase, labelSafetyGrade } from '../utils/uiLabels';
import { getStudyReadyMessage, getStudyVisualSpec, isVisualStudy, resolveStudyStage, StudyStage } from '../data/studyVisuals';
import { StudyViewerModal, studyChipLabel } from '../components/StudyViewerModal';
import { DosePickerModal } from '../components/DosePickerModal';

export function SimulatorView({ onFinish, activeCase = demoCase, resolvedSimulation }: { onFinish: () => void, activeCase?: ClinicalCase, resolvedSimulation?: ResolvedSimulation }) {
  const currentCase = resolvedSimulation?.baseCase || activeCase;
  const runtime = getCaseRuntime(currentCase);
  const initialVitals = resolvedSimulation?.initialVitalsOverride || currentCase.patient.initialVitals;
  const assistanceLevel = resolvedSimulation?.assistanceLevel || 'MEDIUM';
  const showHints = assistanceLevel === 'HIGH' || assistanceLevel === 'MEDIUM';

  const getResolutionOptions = (specialty: string) => {
    switch (specialty) {
      case 'Pediatría':
        return {
          destLabel: '1. Destino Final del Paciente Pediátrico',
          procLabel: '2. Procedimiento / Estrategia de Tratamiento',
          justPlaceholder: 'Ej: Lactante estable clínicamente tras rehidratación con sales de hidratación oral. Se decide egreso a domicilio con pautas de alarma estrictas de deshidratación...',
          destinations: [
            { id: 'ALTA', title: 'Alta con Pautas de Alarma', desc: 'Egreso a domicilio con control por pediatra en 24-48 horas' },
            { id: 'SALA_PEDIATRIA', title: 'Sala de Internación Pediátrica', desc: 'Internación general para mantenimiento hidroelectrolítico' },
            { id: 'UTI_PEDIATRICA', title: 'Terapia Intensiva Pediátrica (UTIP)', desc: 'Para soporte avanzado ante shock o insuficiencia respiratoria' },
            { id: 'OBSERVACION_BOX', title: 'Permanecer en Box de Pediatría', desc: 'Monitoreo de tolerancia oral y curva térmica' }
          ],
          procedures: [
            { id: 'HIDRATACION_ORAL', title: 'Plan de Hidratación Oral (SRO)', desc: 'Reposición volumétrica fraccionada por boca con sales de rehidratación oral' },
            { id: 'HIDRATACION_IV', title: 'Plan de Hidratación Endovenoso', desc: 'Colocar suero de mantenimiento con dextrosa y electrolitos' },
            { id: 'ANTIBIOTICOS_EMP', title: 'Antibioticoterapia Empírica', desc: 'Ante sospecha de sepsis de origen bacteriano' },
            { id: 'TRATAMIENTO_SINTOMATICO', title: 'Tratamiento Sintomático (Antitérmicos)', desc: 'Manejo del confort, paracetamol y control físico de temperatura' }
          ]
        };

      case 'Traumatología':
        return {
          destLabel: '1. Destino Final del Paciente',
          procLabel: '2. Procedimiento / Conducta Traumatológica',
          justPlaceholder: 'Ej: Paciente con síndrome compartimental agudo en miembro inferior. Se decide derivación urgente a quirófano para fasciotomía descompresiva inmediata...',
          destinations: [
            { id: 'PASE_QUIROFANO', title: 'Sala de Quirófano de Urgencia', desc: 'Procedimiento de urgencia o debridación inmediata' },
            { id: 'SALA_TRAUMA', title: 'Internación General (Traumatología)', desc: 'Ingreso a sala para control evolutivo o cirugías programadas' },
            { id: 'UTI', title: 'Unidad de Terapia Intensiva (UTI)', desc: 'Para monitoreo crítico por shock hemorrágico o disección' },
            { id: 'ALTA', title: 'Alta Hospitalaria', desc: 'Egreso con inmovilización transitoria y control por consultorio' }
          ],
          procedures: [
            { id: 'FASCIOTOMIA_URGENTE', title: 'Fasciotomía / Debridación quirúrgica urgente', desc: 'Liberación quirúrgica de compartimento o limpieza de fractura expuesta' },
            { id: 'FIJACION_YESO', title: 'Reducción e inmovilización con yeso', desc: 'Alineación de fractura y colocación de férula protectora' },
            { id: 'BYPASS_CIRUGIA_VAS', title: 'Cirugía Vascular / Reparación Aórtica Urgente', desc: 'Tratamiento quirúrgico o endovascular de urgencia para disección' },
            { id: 'TRATAMIENTO_MEDICO', title: 'Tratamiento Médico y Analgesia', desc: 'Inmovilización provisoria, analgesia reglada y reposo absoluto' }
          ]
        };

      case 'Guardia General':
        return {
          destLabel: '1. Destino Final del Paciente',
          procLabel: '2. Procedimiento / Conducta Quirúrgica o Médica',
          justPlaceholder: 'Ej: Paciente con abdomen agudo inflamatorio compatible con apendicitis aguda. Se decide programar apendicectomía laparoscópica de urgencia...',
          destinations: [
            { id: 'PASE_QUIROFANO', title: 'Sala de Quirófano de Urgencia', desc: 'Cirugía abdominal o desbridamiento quirúrgico de urgencia' },
            { id: 'SALA_INTERNACION', title: 'Internación General (Cirugía/Clínica)', desc: 'Control en internación general biliar o metabólica' },
            { id: 'UTI', title: 'Unidad de Terapia Intensiva (UTI)', desc: 'Monitoreo intensivo ante sepsis abdominal o anafilaxia grave' },
            { id: 'ALTA', title: 'Alta Hospitalaria', desc: 'Alta con pautas de alarma y tratamiento sintomático' }
          ],
          procedures: [
            { id: 'APENDICECTOMIA', title: 'Apendicectomía de urgencia', desc: 'Tratamiento quirúrgico del apéndice cecal' },
            { id: 'COLECISTECTOMIA', title: 'Colecistectomía de urgencia', desc: 'Extirpación quirúrgica de la vesícula biliar' },
            { id: 'REPOSO_PANCREATICO', title: 'Ayuno + fluidos IV + analgesia', desc: 'Reposo pancreático. No cirugía de urgencia salvo colangitis o complicaciones' },
            { id: 'CORRECCION_ACIDOSIS', title: 'Corrección hidroelectrolítica e Insulina IV', desc: 'Tratamiento metabólico intensivo para cetoacidosis' },
            { id: 'MONITORIZACION_ESTRICTA', title: 'Monitoreo Estrecho pos-adrenalina', desc: 'Vigilancia continua sin requerimiento quirúrgico' }
          ]
        };

      case 'Medicina Interna':
        return {
          destLabel: '1. Destino Final del Paciente',
          procLabel: '2. Procedimiento / Conducta Clínica Definitiva',
          justPlaceholder: 'Ej: Paciente cursa cetoacidosis diabética severa. Se inicia protocolo de rehidratación agresiva e infusión de insulina. Se solicita cama en UTI...',
          destinations: [
            { id: 'UTI', title: 'Unidad de Terapia Intensiva (UTI)', desc: 'Monitoreo intensivo invasivo de cetoacidosis o shock séptico' },
            { id: 'SALA_INTERNACION', title: 'Internación General (Clínica Médica)', desc: 'Control clínico de sepsis controlada o crisis hipertensivas' },
            { id: 'OBSERVACION_BOX', title: 'Permanecer en Box de Guardia', desc: 'Continuar titulación de fármacos vasoactivos o insulina' },
            { id: 'ALTA', title: 'Alta Hospitalaria', desc: 'Egreso a domicilio con pautas claras y tratamiento oral' }
          ],
          procedures: [
            { id: 'CORRECCION_ACIDOSIS', title: 'Hidratación agresiva + Insulina corriente IV', desc: 'Protocolo de corrección metabólica y reposición de potasio' },
            { id: 'SOPORTE_VASOPRESOR', title: 'Soporte Hemodinámico + Antibióticos IV', desc: 'Inicio de vasopresores (Noradrenalina) y antibiótico empírico' },
            { id: 'VASODILATADORES_IV', title: 'Infusión controlada de Vasodilatadores IV', desc: 'Descenso tensional inteligente y continuo bajo bomba de infusión' },
            { id: 'TRATAMIENTO_MEDICO', title: 'Tratamiento Médico de Soporte', desc: 'Estabilización general y manejo sintomático' }
          ]
        };

      case 'Neurología':
        return {
          destLabel: '1. Destino Final del Paciente Neurológico',
          procLabel: '2. Procedimiento / Conducta Neurológica',
          justPlaceholder: 'Ej: Cefalea en estallido con signos de hipertensión endocraneana. Se decide internación en UTI para monitoreo neurológico estricto y tomografía urgente...',
          destinations: [
            { id: 'UTI', title: 'Unidad de Terapia Intensiva (UTI)', desc: 'Monitoreo neurológico y control de presión intracraneal' },
            { id: 'SALA_INTERNACION', title: 'Internación General (Neurología)', desc: 'Control evolutivo no crítico' },
            { id: 'OBSERVACION_BOX', title: 'Permanecer en Box de Guardia', desc: 'Observación breve sin destino definido' },
            { id: 'ALTA', title: 'Alta Hospitalaria', desc: 'Egreso a domicilio' }
          ],
          procedures: [
            { id: 'MONITORIZACION_ESTRICTA', title: 'Monitoreo neurológico + neuroimágenes urgentes', desc: 'Glasgow seriado, control de HTEC y TC/RM de urgencia' },
            { id: 'TRATAMIENTO_MEDICO', title: 'Analgesia y observación', desc: 'Manejo sintomático sin estudio de alarma' },
            { id: 'VASODILATADORES_IV', title: 'Vasodilatadores / Nitroglicerina', desc: 'Descenso tensional con vasodilatadores' },
            { id: 'SOPORTE_VASOPRESOR', title: 'Soporte hemodinámico', desc: 'Vasopresores y fluidos agresivos' }
          ]
        };

      case 'Cardiología':
      default:
        return {
          destLabel: '1. Destino Final del Paciente',
          procLabel: '2. Procedimiento / Estrategia de Reperfusión',
          justPlaceholder: 'Ej: Paciente cursa SCACEST anteroseptal de <12h de evolución. Se decide derivación urgente a Hemodinamia para angioplastia primaria de arteria culpable dada la disponibilidad inmediata...',
          destinations: [
            { id: 'PASE_HEMODINAMIA', title: 'Sala de Hemodinamia', desc: 'Para Angioplastia Coronaria de urgencia' },
            { id: 'PASE_UCO', title: 'Unidad Coronaria (UCO)', desc: 'Para monitoreo crítico y soporte' },
            { id: 'OBSERVACION_BOX', title: 'Permanecer en Box de Guardia', desc: 'Bajo monitoreo continuo en emergencias' },
            { id: 'ALTA', title: 'Alta Hospitalaria', desc: 'Con pautas de alarma e indicaciones' }
          ],
          procedures: [
            { id: 'ATC_URGENTE', title: 'Coronariografía inmediata + Angioplastia (ATC) primaria', desc: 'Reperfusión urgente en sala de cateterismo (<120 minutos)' },
            { id: 'ESTRAT_INVASIVA_24H', title: 'Coronariografía diagnóstica dentro de las 24 horas', desc: 'Estrategia invasiva diferida en paciente estabilizado' },
            { id: 'BYPASS_CORONARIO', title: 'Derivación urgente a Cirugía de Bypass (CABG)', desc: 'Interconsulta con Cirugía por sospecha de lesión compleja' },
            { id: 'FIBRINOLISIS', title: 'Fibrinólisis sistémica en Guardia', desc: 'Tratamiento trombolítico farmacológico intravenoso' },
            { id: 'TRATAMIENTO_MEDICO', title: 'Tratamiento Médico Conservador sin intervención', desc: 'Solo soporte y fármacos antianginosos' }
          ]
        };
    }
  };

  const [activeTab, setActiveTab] = useState<Tab>('interview');
  const [interlocutor, setInterlocutor] = useState<'patient' | 'companion'>(
    runtime.forceCompanionSpeaker || currentCase.patient.companion ? 'companion' : 'patient'
  );
  
  // App Phase State
  const [simulationStatus, setSimulationStatus] = useState<'ACTIVE' | 'ANALYZING' | 'DEBRIEF'>('ACTIVE');

  // Clinical Actions state
  const [selectedCategory, setSelectedCategory] = useState<ClinicalActionCategory>('EVALUATION');
  const [clinicalActionEvents, setClinicalActionEvents] = useState<ClinicalActionEvent[]>([]);
  const [aiFeedback, setAiFeedback] = useState<DebriefFeedback | undefined>(undefined);

  // Resolution Modal state
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [studyCaptures, setStudyCaptures] = useState<{ id: string; actionId: string; stage: StudyStage; capturedAtFormatted: string }[]>([]);
  const [activeCaptureId, setActiveCaptureId] = useState<string | null>(null);
  const [pendingDoseAction, setPendingDoseAction] = useState<ClinicalAction | null>(null);

  
  const initialMessageText = runtime.openingMessage;
  const initialSender = runtime.openingSender;

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: initialSender, text: initialMessageText }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [patientStatus, setPatientStatus] = useState<'Estable' | 'Observación' | 'Moderado' | 'Grave' | 'Crítico'>('Moderado');
  
  // Dynamic Vitals & Monitor State
  const [monitorState, setMonitorState] = useState<'IDLE' | 'CONNECTING' | 'ACTIVE'>('IDLE');
  const [clinicalPhase, setClinicalPhase] = useState<number>(0);
  
  const [currentVitals, setCurrentVitals] = useState({
    hr: currentCase.patient.initialVitals.hr,
    bp_sys: currentCase.patient.initialVitals.bp_sys,
    bp_dia: currentCase.patient.initialVitals.bp_dia,
    spo2: currentCase.patient.initialVitals.spo2,
    temp: currentCase.patient.initialVitals.temp,
    rr: currentCase.patient.initialVitals.rr || 16
  });
  
  const [targetVitals, setTargetVitals] = useState({ ...currentVitals });
  const [activeActions, setActiveActions] = useState<{ id: string; name: string; status: 'PENDING' | 'COMPLETED'; timestamp: number }[]>([]);

  const triggerPatientDeath = (reason: string, companionDialog?: string) => {
    setTargetVitals({
      hr: 0,
      bp_sys: 0,
      bp_dia: 0,
      spo2: 0,
      rr: 0,
      temp: 36.0
    });
    setCurrentVitals({
      hr: 0,
      bp_sys: 0,
      bp_dia: 0,
      spo2: 0,
      rr: 0,
      temp: 36.0
    });
    setPatientStatus('Crítico');
    
    setMessages(prev => {
      const msgs = [...prev, {
        id: 'sys_death_' + Date.now(),
        sender: 'system' as const,
        text: `❌ [DEFUNCIÓN DEL PACIENTE] El paciente ha fallecido debido a un paro cardiorrespiratorio provocado por: ${reason}`
      }];
      if (companionDialog) {
        msgs.push({
          id: 'px_death_comp_' + Date.now(),
          sender: 'companion' as const,
          text: companionDialog
        });
      }
      return msgs;
    });

    setTimeout(async () => {
      const level = resolvedSimulation?.config?.level || 'Residente';
      const difficulty = resolvedSimulation?.config?.difficulty || 'Intermedia';
      const uniqueId = 'DEATH_' + Date.now();
      const rawFormatted = formatTime(timeElapsed);
      const displayFormatted = rawFormatted.startsWith('00:') ? rawFormatted.substring(3) : rawFormatted;

      const deathEvent: ClinicalActionEvent = {
        id: uniqueId,
        actionId: 'DEFUNCIÓN_PACIENTE',
        label: 'Resultado Final: Óbito del Paciente',
        category: 'DISPOSITION',
        executedAtSeconds: timeElapsed,
        executedAtFormatted: displayFormatted,
        clinicalPhase: 3,
        vitalSnapshot: { hr: 0, bp_sys: 0, bp_dia: 0, rr: 0, spo2: 0, temp: 36.0 },
        status: 'COMPLETED',
        safetyGrade: 'POTENTIALLY_UNSAFE',
        evaluationCompetency: 'Priorización y Tiempos',
        scoreImpact: -50,
        evaluationFeedback: `Fallecimiento del paciente por error de manejo crítico: ${reason}`,
        systemLog: `[ÓBITO] Paciente fallece por: ${reason}`,
      };

      const updatedEvents = [...clinicalActionEvents, deathEvent];
      setClinicalActionEvents(updatedEvents);

      setSimulationStatus('ANALYZING');
      try {
        const feedbackObj = await generateDebriefFeedback({
          caseTitle: currentCase.title,
          config: {
            specialty: resolvedSimulation?.config?.specialty || 'Cardiología',
            level: level,
            difficulty: difficulty,
            mode: resolvedSimulation?.config?.mode || 'Entrenamiento'
          },
          events: updatedEvents,
          messages: messages,
          timeElapsed: timeElapsed
        });
        setAiFeedback(feedbackObj);
      } catch (err) {
        console.warn('[GuardIA] Error al solicitar debriefing con IA tras óbito:', err);
      }
      setSimulationStatus('DEBRIEF');
    }, 5000);
  };

  const applyActionPhysiologicalEffect = (action: ClinicalAction, dose?: MedicationDoseOption) => {
    const caseId = currentCase.id;
    const givenActionIds = clinicalActionEvents.map(e => e.actionId);

    const applyRecoveryIfAny = (actionId: string) => {
      const rec = getRecoveryEffect(caseId, actionId, givenActionIds);
      if (!rec) return false;
      setClinicalPhase(rec.phase);
      setTargetVitals(prev => ({ ...prev, ...rec.vitals }));
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'px_rec',
          sender: rec.sender,
          text: rec.message
        }]);
      }, 1500);
      return true;
    };

    switch (action.id) {
      case 'MONITOR':
        setMonitorState('ACTIVE');
        break;

      case 'O2':
        if (caseId === 'c-4') {
          setClinicalPhase(2); // Stabilized
          setTargetVitals(prev => ({
            ...prev,
            spo2: 98,
            rr: 16,
            hr: Math.max(70, prev.hr - 10)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_o2_neuro',
              sender: 'patient',
              text: 'Entendido doctor... sigo con el brazo y la pierna adormecidos pero me entra mejor el aire y me siento un poco más despejado.'
            }]);
          }, 1500);
        } else {
          setTargetVitals(prev => ({
            ...prev,
            spo2: Math.max(97, prev.spo2),
            rr: 18,
            hr: Math.max(72, prev.hr - 12)
          }));
          if (clinicalPhase === 1 || currentVitals.spo2 < 92) {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_o2',
                sender: 'patient',
                text: currentCase.patient.companion
                  ? 'Doctor... parece que con la mascarilla de oxígeno está un poco más tranquila.'
                  : 'Doctor... siento que el aire entra un poco mejor ahora con esta mascarilla.'
              }]);
            }, 1500);
          }
        }
        break;

      case 'ASPIRINA':
        // Contraindicación pediátrica
        if (caseId === 'c-100' || caseId === 'c-3') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Edema cerebral fulminante y falla multiorgánica (Síndrome de Reye) por administración de Aspirina en sospecha de infección viral infantil.',
              '¡Nooo! ¡Doctor! ¡Mi bebé dejó de respirar! ¡No se mueve! ¡Por favor, auxilio!'
            );
          } else {
            setClinicalPhase(3); // Shock/Colapso
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: 65,
              bp_dia: 35,
              hr: 178,
              spo2: 88,
              rr: 45
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_reye_shock',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Aspirina (ácido acetilsalicílico) a un paciente pediátrico con fiebre de sospecha viral. Se desencadena colapso sistémico agudo por sospecha de Síndrome de Reye (hepatopatía y encefalopatía aguda).'
            }, {
              id: Date.now().toString() + 'px_reye_shock',
              sender: 'companion',
              text: '¡Doctor! ¡La bebé empezó a respirar muy rápido, se puso pálida y no reacciona! ¡Por favor haga algo!'
            }]);
          }
        } else {
          // Adulto estándar
          const hasClop = givenActionIds.includes('CLOPIDOGREL');
          if (hasClop && clinicalPhase === 1 && caseId === 'c-1') {
            setClinicalPhase(2); // Recovery
            setTargetVitals(prev => ({
              ...prev,
              hr: 85,
              bp_sys: 125,
              bp_dia: 78,
              spo2: Math.max(95, prev.spo2),
              rr: 18
            }));
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_dapt',
                sender: 'patient',
                text: 'Doctor... siento que esa pastilla masticada me calmó un poco el pecho... la opresión fuerte está aflojando lentamente.'
              }]);
            }, 2000);
          } else {
            applyRecoveryIfAny(action.id);
          }
        }
        break;

      case 'CLOPIDOGREL':
      case 'HEPARINA':
        if (caseId === 'c-1') {
          // Doble antiagregación completa: si ambas están dadas, estabiliza Carlos
          const hasAsp = givenActionIds.includes('ASPIRINA');
          const hasClop = givenActionIds.includes('CLOPIDOGREL') || action.id === 'CLOPIDOGREL';
          if (hasAsp && hasClop && clinicalPhase === 1) {
            setClinicalPhase(2); // Recovery phase
            setTargetVitals(prev => ({
              ...prev,
              hr: 85,
              bp_sys: 125,
              bp_dia: 78,
              spo2: Math.max(95, prev.spo2),
              rr: 18
            }));
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_dapt',
                sender: 'patient',
                text: 'Doctor... siento que esa pastilla me calmó un poco el pecho... la opresión fuerte está aflojando lentamente.'
              }]);
            }, 2000);
          }
        } else {
          applyRecoveryIfAny(action.id);
        }
        break;

      case 'NITRO':
        if (caseId === 'c-4') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Enclavamiento de amígdalas cerebelosas por aumento crítico de la presión intracraneal secundario a venodilatación cerebral masiva inducida por Nitroglicerina.'
            );
          } else {
            // Caso neurológico: aumenta PIC
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: Math.min(230, prev.bp_sys + 15),
              hr: Math.max(40, prev.hr - 5),
              rr: 10
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_nitro_pic',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO SEVERO] Se administró Nitroglicerina en un paciente con sospecha de hipertensión endocraneana. La vasodilatación cerebral exacerba la presión intracraneal (PIC), con riesgo inminente de herniación cerebral.'
            }, {
              id: Date.now().toString() + 'px_nitro_pic',
              sender: 'patient',
              text: '¡Doctor! ¡Siento que me va a explotar la cabeza... el dolor se hizo insoportable y se me apagó la vista un segundo...!'
            }]);
          }
        } else if (caseId === 'c-18') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Shock cardiogénico profundo irreversible y colapso circulatorio total provocado por el desplome fulminante de la precarga cardíaca tras administrar Nitroglicerina en un infarto agudo de miocardio de cara inferior con compromiso de ventrículo derecho.'
            );
          } else {
            setClinicalPhase(3); // Shock
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: 68,
              bp_dia: 40,
              hr: 54,
              spo2: 88,
              rr: 26
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_nitro_rv_infarct',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Nitroglicerina en un paciente con infarto agudo de miocardio de cara inferior y sospecha de compromiso de VD. La venodilatación severa reduce drásticamente el retorno venoso, desplomando la precarga del VD infartado y provocando colapso hemodinámico.'
            }, {
              id: Date.now().toString() + 'px_nitro_rv_infarct',
              sender: 'patient',
              text: 'Doctor... se me apagó la vista... me voy a desmayar... no me entra aire... siento que me muero...'
            }]);
          }
        } else if (caseId === 'c-14') {
          setClinicalPhase(2);
          setTargetVitals(prev => ({
            ...prev,
            bp_sys: Math.max(160, prev.bp_sys - 25),
            bp_dia: Math.max(95, prev.bp_dia - 15),
            hr: Math.max(70, prev.hr - 8),
            rr: 16
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_nitro_hta',
              sender: 'patient',
              text: 'Doctor... la cabeza aflojó un poco, no tanto, pero ya no siento que me va a estallar de golpe...'
            }]);
          }, 1500);
        } else if (currentVitals.bp_sys < 95) {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Shock cardiogénico irreversible inducido por administración de Nitroglicerina sublingual en el contexto de un infarto agudo de miocardio inestable con hipotensión severa previa.'
            );
          } else {
            // Evento adverso: Shock cardiogénico por vasodilatación en hipotenso
            setClinicalPhase(3); // Shock
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: 64,
              bp_dia: 38,
              hr: 142,
              spo2: 83,
              rr: 30
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_shock',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Nitroglicerina en un paciente hipotenso (TA < 95 mmHg). Se desencadena shock distributivo/cardiogénico severo.'
            }, {
              id: Date.now().toString() + 'px_shock',
              sender: 'patient',
              text: 'Doctor... me siento muy mal... me da vueltas todo... no veo casi nada... y no siento las manos...'
            }]);
          }
        } else {
          // Paciente stable/moderado: alivia dolor
          if (clinicalPhase === 1 && caseId === 'c-1') setClinicalPhase(2);
          setTargetVitals(prev => ({
            ...prev,
            bp_sys: Math.max(98, prev.bp_sys - 12),
            bp_dia: Math.max(60, prev.bp_dia - 8),
            hr: Math.max(65, prev.hr - 5),
            spo2: Math.max(95, prev.spo2),
            rr: 18
          }));
        }
        break;

      case 'MORFINA':
        if (caseId === 'c-8') {
          setClinicalPhase(2); // Recovery
          setTargetVitals(prev => ({
            ...prev,
            bp_sys: Math.max(95, prev.bp_sys - 5),
            bp_dia: Math.max(60, prev.bp_dia - 5),
            rr: 16,
            hr: Math.max(80, prev.hr - 15)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_morphine_compartmental',
              sender: 'patient',
              text: 'Uff... doctor, la morfina me alivió un poco este dolor salvaje en la pierna... aunque la siento dura y me cuesta mover los dedos, por lo menos puedo tolerarlo ahora.'
            }]);
          }, 1500);
        } else if (caseId === 'c-5') {
          setClinicalPhase(2); // Recovery
          setTargetVitals(prev => ({
            ...prev,
            hr: 82,
            bp_sys: 118,
            bp_dia: 74,
            rr: 16
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_morphine_apendicitis',
              sender: 'patient',
              text: 'Gracias doctor, el dolor terrible en el costado derecho de la panza se me calmó bastante con el suero y la inyección. Ya no tengo tantas náuseas.'
            }]);
          }, 1500);
        } else {
          setTargetVitals(prev => ({
            ...prev,
            bp_sys: Math.max(80, prev.bp_sys - 8),
            bp_dia: Math.max(50, prev.bp_dia - 5),
            rr: Math.max(10, prev.rr - 4),
            hr: Math.max(60, prev.hr - 10)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_morphine',
              sender: currentCase.patient.companion ? 'companion' : 'patient',
              text: runtime.morphineRelief
            }]);
          }, 1500);
        }
        break;

      case 'FLUIDOS':
        if (caseId === 'c-7') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Asfixia por sobrecarga de volumen y edema pulmonar refractario masivo en el contexto de insuficiencia cardíaca descompensada crítica.'
            );
          } else {
            // Edema pulmonar moderado por sobrecarga
            setTargetVitals(prev => ({
              ...prev,
              spo2: 78,
              rr: 32,
              hr: Math.min(150, prev.hr + 15)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_fluids_hf_error',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO SEVERO] Carga de fluidos endovenosos en insuficiencia cardíaca. Exacerba de forma severa la congestión y el edema pulmonar, provocando desaturación aguda.'
            }, {
              id: Date.now().toString() + 'px_fluids_hf_error',
              sender: 'patient',
              text: '¡Doc... siento el pecho pesadísimo... no puedo meter aire... me estoy ahogando...!'
            }]);
          }
        } else {
          if (caseId === 'c-100' || caseId === 'c-3') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 100,
              bp_sys: 105,
              bp_dia: 65,
              rr: 22,
              spo2: 98,
              temp: 37.2
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_fluids_ped',
                sender: 'companion',
                text: runtime.fluidsRelief
              }]);
            }, 1500);
          } else if (caseId === 'c-2') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 90,
              bp_sys: 115,
              bp_dia: 75,
              rr: 18,
              spo2: 97,
              temp: 36.5
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_fluids_trauma',
                sender: 'patient',
                text: 'Gracias doctor... con los líquidos me volvió la fuerza... y ya no me siento tan mareada ni con frío.'
              }]);
            }, 1500);
          } else if (caseId === 'c-9') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 92,
              bp_sys: 110,
              bp_dia: 70,
              rr: 18,
              spo2: 98,
              temp: 36.6
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_fluids_expuesta',
                sender: 'patient',
                text: 'Gracias doctor... el sangrado paró con la compresión y los líquidos me revivieron... ya no me siento tan débil ni con temblores.'
              }]);
            }, 1500);
          } else if (caseId === 'c-11') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 82,
              bp_sys: 120,
              bp_dia: 75,
              rr: 16,
              spo2: 98,
              temp: 37.0
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_fluids_pancreatitis',
                sender: 'patient',
                text: 'Gracias doctor... con el suero continuo y el ayuno el dolor de panza me dio un respiro... ya no tengo tantas náuseas y me siento más estable.'
              }]);
            }, 1500);
          } else if (caseId === 'c-18') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 68,
              bp_sys: 110,
              bp_dia: 68,
              rr: 18,
              spo2: 95,
              temp: 36.5
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_fluids_vd_infarct',
                sender: 'patient',
                text: 'Uff, doctor... con el suero rápido me volvió el alma al cuerpo... se me pasó esa sensación de desmayo y el dolor de estómago se calmó bastante.'
              }]);
            }, 1500);
          } else {
            if (clinicalPhase === 3) {
              setClinicalPhase(1); // Sale de shock crítico a estado moderado
            }
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: prev.bp_sys + 20,
              bp_dia: prev.bp_dia + 10,
              hr: Math.max(80, prev.hr - 12)
            }));
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_fluids',
                sender: currentCase.patient.companion ? 'companion' : 'patient',
                text: runtime.fluidsRelief
              }]);
            }, 1500);
          }
        }
        break;

      case 'BETABLOQUEADOR':
        if (caseId === 'c-100' || caseId === 'c-3' || caseId === 'c-2' || caseId === 'c-7' || caseId === 'c-10' || caseId === 'c-13' || currentVitals.bp_sys < 95 || currentVitals.hr < 60 || clinicalPhase === 1 || clinicalPhase === 3) {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            let reason = 'Bloqueo inotrópico y colapso de bomba (paro cardiogénico) tras betabloqueo endovenoso en infarto inestable.';
            let compMsg = '¡Doctor! ¡Mi bebé se puso azulado, no respira y no le late el corazón!';
            if (caseId === 'c-100' || caseId === 'c-3') {
              reason = 'Anulación del gasto cardíaco y bradicardia extrema inducida por Betabloqueadores en taquicardia febril infantil compensatoria.';
            } else if (caseId === 'c-2') {
              reason = 'Abolición de la taquicardia refleja compensatoria por betabloqueo en shock hemorrágico activo, causando colapso hemodinámico total.';
              compMsg = undefined;
            } else if (caseId === 'c-7') {
              reason = 'Falla de bomba aguda irreversible y shock cardiogénico por administración de betabloqueantes en fase húmeda de insuficiencia cardíaca descompensada.';
              compMsg = undefined;
            } else if (caseId === 'c-10') {
              reason = 'Abolición de los receptores adrenérgicos beta en anafilaxia por betabloqueo, impidiendo el soporte vital de la adrenalina y provocando asfixia por edema de glotis refractario.';
              compMsg = undefined;
            } else if (caseId === 'c-13') {
              reason = 'Falla orgánica multisistémica irreversible por shock séptico al bloquear la respuesta adrenérgica refleja necesaria en urosepsis grave.';
              compMsg = undefined;
            }
            triggerPatientDeath(reason, compMsg);
          } else {
            // Evento adverso crítico: Shock cardiogénico / bradicardia extrema por betabloqueador
            setClinicalPhase(3); // Shock
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: 58,
              bp_dia: 32,
              hr: 42, // Bradicardia severa
              spo2: 78,
              rr: 32
            }));
            
            let alertMsg = '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Betabloqueador (Metoprolol) bloqueando la respuesta hemodinámica de compensación del paciente. Se desencadena colapso circulatorio (shock) severo y bradicardia extrema.';
            let companionMsg = 'Doctor... siento que el corazón se me frena... me falta el aire... me voy a desmayar...';
            
            if (caseId === 'c-100' || caseId === 'c-3') {
              alertMsg = '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Betabloqueador (Metoprolol) a un lactante/niño con taquicardia febril compensatoria. Se anula el gasto cardíaco y se induce bradicardia extrema y shock cardiogénico.';
              companionMsg = '¡Doctor! ¡El bebé se puso azulado, el pecho no se le mueve casi y no le siento latir el corazón! ¡Ayuda!';
            } else if (caseId === 'c-2') {
              alertMsg = '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Betabloqueador (Metoprolol) en shock hemorrágico/politraumatismo. Se anula la taquicardia refleja que sostiene la perfusión, precipitando colapso vascular total.';
              companionMsg = 'Doctor... no puedo... todo negro... no entra aire...';
            }

            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_bb_shock',
              sender: 'system',
              text: alertMsg
            }, {
              id: Date.now().toString() + 'px_bb_shock',
              sender: currentCase.patient.companion ? 'companion' : 'patient',
              text: companionMsg
            }]);
          }
        } else {
          // Paciente estable hemodinámicamente: efecto terapéutico seguro
          if (caseId === 'c-15') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 58,
              bp_sys: 115,
              bp_dia: 70,
              rr: 16,
              spo2: 97,
              temp: 36.6
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_bb_dissection_recovery',
                sender: 'patient',
                text: 'Doctor... con esa inyección siento que el corazón me late más despacio y esa presión desgarrante en la espalda aflojó bastante... puedo respirar mejor.'
              }]);
            }, 1500);
          } else if (caseId === 'c-6') {
            setClinicalPhase(2);
            setTargetVitals(prev => ({
              ...prev,
              hr: 88,
              bp_sys: 118,
              bp_dia: 74,
              rr: 16,
              spo2: 97
            }));
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_bb_fa_ok',
                sender: 'patient',
                text: 'Doctor... el aleteo salvaje se me está calmando. Ya no siento el corazón en la garganta y puedo hablar sin tanto mareo.'
              }]);
            }, 1500);
          } else {
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.max(65, prev.hr - 20),
              bp_sys: Math.max(105, prev.bp_sys - 15),
              bp_dia: Math.max(65, prev.bp_dia - 10)
            }));
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_bb_safe',
                sender: 'patient',
                text: 'Doctor... siento que el corazón me late más despacio y la presión en el pecho disminuyó un poco.'
              }]);
            }, 1500);
          }
        }
        break;

      case 'ESTATINA':
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'px_statin',
            sender: 'patient',
            text: 'Entendido Doctor, ya me tragué la pastilla para proteger las arterias.'
          }]);
        }, 1500);
        break;

      case 'ENALAPRIL_05':
        if (caseId === 'c-1' && (currentVitals.bp_sys < 100 || clinicalPhase === 1 || clinicalPhase === 3)) {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Shock distributivo/cardiogénico irreversible provocado por la administración de Enalapril sublingual/VO en fase de infarto hiperagudo inestable con hipotensión previa.'
            );
          } else {
            // Shock por Enalapril en paciente coronario hipotenso/inestable
            setClinicalPhase(3); // Shock
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: 72,
              bp_dia: 44,
              hr: 135,
              spo2: 85,
              rr: 28
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_enalapril_shock',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Enalapril (IECA) VO en un paciente con síndrome coronario agudo en fase hiperaguda inestable/hipotensa. La vasodilatación sistémica precipita shock distributivo severo.'
            }, {
              id: Date.now().toString() + 'px_enalapril_shock',
              sender: 'patient',
              text: 'Doctor... se me apagó la vista... me voy a desmayar... no me entra aire...'
            }]);
          }
        } else if (caseId === 'c-14' && resolvedSimulation?.config?.difficulty === 'Crítica') {
          triggerPatientDeath(
            'Stroke isquémico masivo y daño cerebral irreversible provocado por la caída brusca y descontrolada de la presión arterial al administrar Enalapril VO en una emergencia hipertensiva con daño de órgano blanco (encefalopatía).'
          );
        } else {
          // Leve caída de tensión esperable por IECA
          setTargetVitals(prev => ({
            ...prev,
            bp_sys: Math.max(90, prev.bp_sys - 10),
            bp_dia: Math.max(55, prev.bp_dia - 6)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_enalapril_safe',
              sender: 'patient',
              text: 'Entendido doctor, ya tomé el Enalapril para la presión.'
            }]);
          }, 1500);
        }
        break;

      case 'ALIMENTACION_VO':
        if (caseId === 'c-5') {
          // Sospecha de apendicitis
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'sys_npo_violation',
            sender: 'system',
            text: '⚠️ [VIOLACIÓN DE SEGURIDAD] Se ofreció ingesta oral de agua/alimento. Un paciente con sospecha de abdomen agudo quirúrgico debe permanecer NPO (ayuno estricto). Si requiere cirugía de urgencia, se eleva críticamente el riesgo de broncoaspiración (Síndrome de Mendelson).'
          }, {
            id: Date.now().toString() + 'px_npo_violation',
            sender: 'patient',
            text: 'Gracias doctor, me tomé el vasito de agua y las galletitas que me dio. Tenía mucha sed.'
          }]);
        } else if (caseId === 'c-11') {
          // Pancreatitis aguda
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Falla multiorgánica refractaria y shock hemorrágico pancreático agudo al alimentar por vía oral a un paciente con pancreatitis aguda descompensada grave, aboliendo el reposo pancreático.'
            );
          } else {
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.min(140, prev.hr + 15),
              bp_sys: Math.max(90, prev.bp_sys - 10)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_pancreatitis_feed',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO SEVERO] Se ofreció ingesta oral en pancreatitis aguda. Esto activa la secreción enzimática pancreática, deprimiendo el reposo glandular y exacerbando la inflamación y autodigestión del páncreas.'
            }, {
              id: Date.now().toString() + 'px_pancreatitis_feed',
              sender: 'patient',
              text: '¡Aaaay!... doctor... me empezó a doler muchísimo más la panza... siento que me retuerzo del dolor y tengo náuseas de nuevo...'
            }]);
          }
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_food_safe',
              sender: 'patient',
              text: 'Gracias doctor, el trago de agua me refrescó un poco.'
            }]);
          }, 1500);
        }
        break;

      case 'ENEMA_EVACUANTE':
        if (caseId === 'c-5') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Shock séptico fulminante secundario a perforación de víscera hueca (apéndice) inducida por la presión retrógrada del enema evacuante.'
            );
          } else {
            // Apendicitis aguda: perforación y peritonitis
            setClinicalPhase(3); // Shock/Crash
            setTargetVitals(prev => ({
              ...prev,
              hr: 120,
              bp_sys: 100,
              bp_dia: 62,
              temp: 38.8,
              rr: 26
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_enema_perforation',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] La administración de un enema evacuante en una apendicitis aguda aumenta la presión intraluminal cecal, provocando perforación apendicular inminente. El cuadro evoluciona a peritonitis aguda bacteriana.'
            }, {
              id: Date.now().toString() + 'px_enema_perforation',
              sender: 'patient',
              text: '¡AAAAHH! ¡Doctor! ¡Me dio una puntada terrible, siento que algo se me reventó adentro de la panza! ¡Me duele muchísimo más!'
            }]);
          }
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_enema_safe',
              sender: 'patient',
              text: 'Ya me colocaron el enema, doctor... esperemos que me ayude a aflojar la panza.'
            }]);
          }, 1500);
        }
        break;

      case 'EXPANSION_AGRESIVA':
        if (caseId === 'c-4') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Edema cerebral difuso masivo con enclavamiento herniario tras sobrecarga osmótica/hídrica en hipertensión endocraneana.'
            );
          } else {
            // Neurología: sobrecarga y edema cerebral
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: Math.min(240, prev.bp_sys + 20),
              hr: Math.max(38, prev.hr - 8), // Cushing aumenta
              rr: 8 // Bradipnea por compresión de tronco
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_expansion_neuro',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO SEVERO] Carga masiva de fluidos intravenosos en hipertensión endocraneana. Exacerba el edema cerebral difuso, elevando críticamente la PIC y acelerando el riesgo de enclavamiento de amígdalas cerebelosas.'
            }, {
              id: Date.now().toString() + 'px_expansion_neuro',
              sender: 'patient',
              text: 'Doctor... me siento muy mareado... y me da... mucho... sueño... no puedo tener los ojos abiertos...'
            }]);
          }
        } else if (caseId === 'c-7') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Asfixia mecánica aguda refractaria por edema agudo de pulmón masivo secundario a sobrecarga de volumen en corazón insuficiente.'
            );
          } else {
            // Edema pulmonar severo
            setTargetVitals(prev => ({
              ...prev,
              spo2: 72,
              rr: 38,
              hr: Math.min(150, prev.hr + 20)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_expansion_hf_error',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO SEVERO] Carga rápida masiva de fluidos endovenosos en insuficiencia cardíaca. Desencadena edema agudo de pulmón severo por sobrecarga hídrica ventricular.'
            }, {
              id: Date.now().toString() + 'px_expansion_hf_error',
              sender: 'patient',
              text: '¡Doc... doc... me ahogo... no entra... nada de aire... auxilio...!'
            }]);
          }
        } else {
          // Expansión estándar
          if (caseId === 'c-100' || caseId === 'c-3') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 100,
              bp_sys: 105,
              bp_dia: 65,
              rr: 22,
              spo2: 98,
              temp: 37.2
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_expansion_ped',
                sender: 'companion',
                text: '¡Doctor, muchas gracias! Con el suero la bebé se calmó y se durmió tranquila. Siento que ya se recuperó bastante.'
              }]);
            }, 1500);
          } else if (caseId === 'c-2') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 90,
              bp_sys: 115,
              bp_dia: 75,
              rr: 18,
              spo2: 97,
              temp: 36.5
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_expansion_trauma',
                sender: 'patient',
                text: 'Gracias doctor... con los líquidos rápidos me volvió la fuerza... y ya no me siento tan mareada ni con frío.'
              }]);
            }, 1500);
          } else if (caseId === 'c-9') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 92,
              bp_sys: 110,
              bp_dia: 70,
              rr: 18,
              spo2: 98,
              temp: 36.6
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_expansion_expuesta',
                sender: 'patient',
                text: 'Gracias doctor... el sangrado paró con la compresión y la infusión de suero me revivió... ya no me siento tan débil ni con frío.'
              }]);
            }, 1500);
          } else if (caseId === 'c-11') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 82,
              bp_sys: 120,
              bp_dia: 75,
              rr: 16,
              spo2: 98,
              temp: 37.0
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_expansion_pancreatitis',
                sender: 'patient',
                text: 'Gracias doctor... con el suero rápido y el ayuno el dolor de panza me dio un respiro... ya no tengo tantas náuseas y me siento más fuerte.'
              }]);
            }, 1500);
          } else if (caseId === 'c-18') {
            setClinicalPhase(2); // Recovery
            setTargetVitals({
              hr: 68,
              bp_sys: 110,
              bp_dia: 68,
              rr: 18,
              spo2: 95,
              temp: 36.5
            });
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_expansion_vd_infarct',
                sender: 'patient',
                text: 'Uff, doctor... con el suero rápido me volvió la fuerza... se me pasó esa sensación de desmayo y el dolor de estómago se calmó bastante.'
              }]);
            }, 1500);
          } else {
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: prev.bp_sys + 30,
              bp_dia: prev.bp_dia + 18,
              hr: Math.max(75, prev.hr - 15)
            }));
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_expansion_safe',
                sender: 'patient',
                text: 'Doctor, la sueroterapia rápida me rehidrató y me siento con un poco más de fuerzas.'
              }]);
            }, 1500);
          }
        }
        break;

      case 'FUROSEMIDA':
        if (caseId === 'c-100' || caseId === 'c-3' || caseId === 'c-2') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Shock hipovolémico irreversible provocado por la forzadura de diuresis (Furosemida) en un paciente con deshidratación grave o hemorragia masiva activa.'
            );
          } else {
            // Deshidratación o trauma hemorrágico: choque hipovolémico
            setClinicalPhase(3); // Shock
            setTargetVitals(prev => ({
              ...prev,
              bp_sys: caseId === 'c-2' ? 55 : 48,
              bp_dia: caseId === 'c-2' ? 30 : 25,
              hr: caseId === 'c-2' ? 145 : 190,
              spo2: 86,
              rr: caseId === 'c-2' ? 32 : 48
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_furo_shock',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] Se administró Furosemida (diurético de asa) a un paciente hipovolémico (deshidratación pediátrica / shock hemorrágico por trauma). La diuresis forzada deprime severamente el volumen intravascular y precipita colapso circulatorio total.'
            }, {
              id: Date.now().toString() + 'px_furo_shock',
              sender: caseId === 'c-2' ? 'patient' : 'companion',
              text: caseId === 'c-2' 
                ? 'Doctor... se me va... todo... no veo... me desmayo...' 
                : '¡Doctor! ¡Le dio como un espasmo y ya casi no respira! ¡Se está quedando helada, ayuda!'
            }]);
          }
        } else if (caseId === 'c-7') {
          // Edema agudo de pulmón - Estabiliza al paciente
          setClinicalPhase(2); // Recovery
          setTargetVitals(prev => ({
            ...prev,
            hr: 82,
            bp_sys: 132,
            bp_dia: 80,
            spo2: 98,
            rr: 18
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_furo_success',
              sender: 'patient',
              text: 'Doctor... siento que el ahogo fuerte se me empezó a retirar... ya no siento esa agua cargada en el pecho y puedo respirar hondo finalmente.'
            }]);
          }, 1500);
        } else {
          // Diuresis normal en paciente hemodinámicamente estable
          setTargetVitals(prev => ({
            ...prev,
            bp_sys: Math.max(92, prev.bp_sys - 12),
            bp_dia: Math.max(55, prev.bp_dia - 8)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_furo_safe',
              sender: 'patient',
              text: 'Entendido doctor, ya me pasaron la inyección para orinar.'
            }]);
          }, 1500);
        }
        break;

      case 'CARDIOCONVERSION':
        if (caseId === 'c-6') {
          const hasSedation = clinicalActionEvents.some(e => e.actionId === 'SEDACION');
          if (currentVitals.bp_sys < 95 || hasSedation) {
            // Cardioversión exitosa en FA inestable
            setClinicalPhase(2); // Recovery
            setTargetVitals(prev => ({
              ...prev,
              hr: 85,
              bp_sys: 120,
              bp_dia: 80,
              spo2: 97,
              rr: 18
            }));
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_cardio_success',
                sender: 'patient',
                text: hasSedation
                  ? 'Doctor... me dormí un segundo y al despertar el aleteo se había cortado. No sentí el golpe.'
                  : '¡Ay doctor! Sentí una descarga fuerte en el pecho... pero ese aleteo rápido y desesperante que tenía se me cortó de golpe. Me siento mucho más aliviada y ya no me da vueltas la cabeza.'
              }]);
            }, 1500);
          } else {
            // Cardioversión dolorosa en paciente FA estable sin sedación
            setTargetVitals(prev => ({
              ...prev,
              hr: 110,
              bp_sys: 135,
              bp_dia: 85
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_cardio_pain',
              sender: 'system',
              text: '⚠️ [ADVERTENCIA CLÍNICA] Se aplicó cardioversión eléctrica sincronizada en un paciente con FA despierto, consciente y hemodinámicamente estable sin sedoanalgesia previa ni intento de control farmacológico de frecuencia. Procedimiento innecesariamente doloroso y fuera de guías.'
            }, {
              id: Date.now().toString() + 'px_cardio_pain',
              sender: 'patient',
              text: '¡Aaaay doctor! ¡Qué patada espantosa! ¿Por qué me dio ese golpe de corriente en el pecho si estaba bien despierta? ¡Me dolió muchísimo!'
            }]);
          }
        } else {
          // En cualquier otro paciente no arritmogénico
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'sys_cardio_unnecessary',
            sender: 'system',
            text: '⚠️ [MALA CONDUCTA CLÍNICA] Se aplicó descarga eléctrica (cardioversión) a un paciente que no presenta arritmias con indicación de shock.'
          }]);
        }
        break;

      case 'YESO_AJUSTADO':
        if (caseId === 'c-8') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Necrosis muscular masiva del miembro inferior izquierdo, rabdomiólisis refractaria inducida e insuficiencia renal aguda terminal por colapso e isquemia prolongada provocada por yeso circular cerrado en síndrome compartimental agudo.'
            );
          } else {
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.min(150, prev.hr + 20),
              bp_sys: Math.min(180, prev.bp_sys + 15),
              rr: Math.min(35, prev.rr + 6)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_yeso_error',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO SEVERO] Colocación de yeso circular cerrado ante sospecha de síndrome compartimental. Esto eleva de manera destructiva la presión compartimental intrínseca, interrumpiendo por completo la perfusión microvascular y empeorando drásticamente el dolor y la isquemia.'
            }, {
              id: Date.now().toString() + 'px_yeso_error',
              sender: 'patient',
              text: '¡AAAAH! ¡Doctor! ¡Me duele muchísimo más! ¡Siento que la pierna me va a explotar dentro del yeso! ¡No la siento y se me puso fría!'
            }]);
          }
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_yeso_safe',
              sender: 'patient',
              text: 'Ya me colocaron el yeso, doctor. Siento el miembro más firme ahora.'
            }]);
          }, 1500);
        }
        break;

      case 'SUTURA_EXPUESTA':
        if (caseId === 'c-9') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Sepsis de inicio hiperagudo y shock séptico / gangrena gaseosa difusa irreversible al suturar herméticamente una fractura expuesta altamente contaminada sin lavado y debridación estéril previa en quirófano.'
            );
          } else {
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.min(140, prev.hr + 15),
              temp: 39.5,
              bp_sys: Math.max(90, prev.bp_sys - 15)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_sutura_error',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] Sutura directa de herida expuesta. Al sellar la piel sin debridamiento y lavado estéril mecánico en quirófano, se encierran patógenos anaerobios, induciendo infección necrotizante severa.'
            }, {
              id: Date.now().toString() + 'px_sutura_error',
              sender: 'patient',
              text: 'Doctor... siento la pierna caliente y que me late muy fuerte... me dio un chucho de frío terrible y tiemblo entero...'
            }]);
          }
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_sutura_safe',
              sender: 'patient',
              text: 'Doctor, ya me suturaron el corte en la piel.'
            }]);
          }, 1500);
        }
        break;

      case 'ADRENALINA_IM':
        if (caseId === 'c-10') {
          setClinicalPhase(2); // Recovery
          setTargetVitals(prev => ({
            ...prev,
            hr: 85,
            bp_sys: 118,
            bp_dia: 74,
            spo2: 98,
            rr: 16
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_adrena_success',
              sender: 'patient',
              text: 'Ufff... doctor... siento que el pecho se me abrió por completo... ya puedo entrar el aire bien y la picazón salvaje está desapareciendo.'
            }]);
          }, 1500);
        } else {
          setTargetVitals(prev => ({
            ...prev,
            hr: Math.min(160, prev.hr + 35),
            bp_sys: Math.min(190, prev.bp_sys + 25)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_adrena_unneeded',
              sender: 'patient',
              text: 'Doctor, sentí una inyección fuerte en la pierna y de repente el corazón me empezó a galopar a mil por hora.'
            }]);
          }, 1500);
        }
        break;

      case 'INSULINA_IV':
        if (caseId === 'c-12' || caseId === 'c-16') {
          const givenActions = clinicalActionEvents.map(e => e.actionId);
          const hasFluids = givenActions.includes('FLUIDOS') || givenActions.includes('EXPANSION_AGRESIVA');
          
          if (!hasFluids && resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Colapso cardiovascular osmótico irreversible e hipotensión profunda refractaria inducidos por infusión de insulina corriente IV sin previa reposición hídrica en cetoacidosis diabética grave.'
            );
          } else {
            setClinicalPhase(2); // Recovery
            setTargetVitals(prev => ({
              ...prev,
              hr: 82,
              bp_sys: 112,
              bp_dia: 72,
              rr: 18,
              spo2: 97
            }));
            const hasPotassium = givenActions.includes('K_IV');
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_insulina_success',
                sender: 'patient',
                text: 'Doctor... ese cansancio pesado que sentía se me está yendo poco a poco... y ya no tengo esa respiración tan rápida.'
              }, ...(hasPotassium ? [] : [{
                id: Date.now().toString() + 'sys_k_warn',
                sender: 'system' as const,
                text: '⚠️ [ALERTA] Insulina sin reposición de K: el potasio sérico caerá. En CAD hay que reponer K junto con la infusión (acción: Reposición de potasio IV).'
              }])]);
            }, 1500);
          }
        } else {
          setTargetVitals(prev => ({
            ...prev,
            bp_sys: Math.max(90, prev.bp_sys - 10)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_insulina_safe',
              sender: 'patient',
              text: 'Entendido doctor, ya me conectaron la infusión de insulina.'
            }]);
          }, 1500);
        }
        break;

      case 'CONTROL_HEMORRAGIA':
        if (caseId === 'c-8') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Isquemia irreversible del miembro por torniquete aplicado sobre un síndrome compartimental ya establecido, sin hemorragia externa que lo justifique.'
            );
          } else {
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.min(150, prev.hr + 18),
              bp_sys: Math.min(180, prev.bp_sys + 12),
              rr: Math.min(35, prev.rr + 5)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_torniquete_comp',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO] Torniquete o compresión circunferencial sobre un compartimento ya hipertenso. Empeora la isquemia; la conducta es fasciotomía, no oclusión proximal.'
            }, {
              id: Date.now().toString() + 'px_torniquete_comp',
              sender: 'patient',
              text: '¡Doctor, la pierna me va a estallar! Con esa venda apretada el dolor se puso insoportable y no siento los dedos...'
            }]);
          }
        } else if (caseId === 'c-2' || caseId === 'c-9') {
          setClinicalPhase(2);
          setTargetVitals(prev => ({
            ...prev,
            hr: Math.max(88, prev.hr - 20),
            bp_sys: Math.min(118, prev.bp_sys + 18),
            bp_dia: Math.min(75, prev.bp_dia + 10),
            rr: Math.max(16, prev.rr - 6),
            spo2: Math.min(98, prev.spo2 + 3)
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_hemorragia_ok',
              sender: 'patient',
              text: caseId === 'c-9'
                ? 'Gracias doctor... con la presión y el torniquete el chorro de sangre paró. Ya no me siento tan mareada.'
                : 'Gracias... con la compresión de la pierna el sangrado aflojó y me volvió un poco el calor.'
            }]);
          }, 1500);
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_hemorragia_neutral',
              sender: 'patient',
              text: 'Me apretaron fuerte el miembro, doctor. No veo que esté sangrando así.'
            }]);
          }, 1500);
        }
        break;

      case 'HEMODERIVADOS':
        if (caseId === 'c-2' || caseId === 'c-9') {
          setClinicalPhase(2);
          setTargetVitals(prev => ({
            ...prev,
            hr: 86,
            bp_sys: 118,
            bp_dia: 74,
            rr: 16,
            spo2: 98,
            temp: 36.6
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_hemo_ok',
              sender: 'patient',
              text: 'Con la sangre en el suero se me fue el frío y el mareo... me siento más presente, doctor.'
            }]);
          }, 1500);
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_hemo_neutral',
              sender: 'patient',
              text: 'Me están pasando sangre, doctor. No sé si hacía falta.'
            }]);
          }, 1500);
        }
        break;

      case 'ANTIBIOTICOS_IV':
        if (caseId === 'c-13') {
          setClinicalPhase(2); // Recovery
          setTargetVitals(prev => ({
            ...prev,
            hr: 86,
            bp_sys: 110,
            bp_dia: 70,
            spo2: 96,
            temp: 37.8
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_antibio_success',
              sender: 'companion',
              text: 'Doctor, parece que con el antibiótico del suero mi madre abrió un poquito los ojos y se la nota mucho menos perdida... esperemos que siga mejorando.'
            }]);
          }, 1500);
        } else if (caseId === 'c-2') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Shock anafiláctico fulminante por piperacilina/tazobactam (beta-lactámico tipo penicilina) en paciente con alergia conocida a penicilina, sin verificar antecedentes antes de infundir.'
            );
          } else {
            setClinicalPhase(3);
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.min(160, prev.hr + 30),
              bp_sys: Math.max(70, prev.bp_sys - 25),
              bp_dia: Math.max(40, prev.bp_dia - 15),
              rr: Math.min(36, prev.rr + 8),
              spo2: Math.max(86, prev.spo2 - 8)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_atb_penicilina',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO] Infusión de piperacilina/tazobactam en paciente alérgica a penicilina. Reacción inmediata: urticaria, broncoespasmo e hipotensión. Es una trampa educativa: el ATB de amplio espectro del menú incluye un beta-lactámico tipo penicilina.'
            }, {
              id: Date.now().toString() + 'px_atb_penicilina',
              sender: 'patient',
              text: '¡Doctor, me pica todo y no me entra el aire! ¡Se lo dije, soy alérgica a la penicilina!'
            }]);
          }
        } else if (caseId === 'c-17') {
          setClinicalPhase(2); // Recovery
          setTargetVitals(prev => ({
            ...prev,
            hr: 80,
            bp_sys: 118,
            bp_dia: 72,
            spo2: 98,
            temp: 37.2
          }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_antibio_colecistitis',
              sender: 'patient',
              text: 'Gracias doctor, con el suero y los antibióticos la puntada insoportable del estómago y la molestia del hombro derecho empezaron a calmarse.'
            }]);
          }, 1500);
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_antibio_safe',
              sender: 'patient',
              text: 'Gracias doctor, ya me pasaron el antibiótico en el suero.'
            }]);
          }, 1500);
        }
        break;

      case 'MANIOBRAS_TRAUMA':
        if (caseId === 'c-15') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Rotura de aneurisma disecante de aorta torácica y taponamiento cardíaco inmediato provocados por la fuerza de cizallamiento y estrés físico de las maniobras manuales de movilización sobre la espalda.'
            );
          } else {
            setClinicalPhase(3); // Shock/Crash
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.min(145, prev.hr + 25),
              bp_sys: 85,
              bp_dia: 45
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_dissection_manip',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO CRÍTICO] Se realizaron maniobras de tracción/movilización física en la espalda. Esto incrementa de forma severa la fuerza de cizallamiento aórtico, acelerando la disección y el riesgo inminente de rotura.'
            }, {
              id: Date.now().toString() + 'px_dissection_manip',
              sender: 'patient',
              text: '¡AAAAAH! ¡Doctor, se me rompió algo adentro del pecho! ¡Me duele muchísimo más, siento que me muero! ¡No puedo respirar!... todo se me pone negro...'
            }]);
          }
        } else if (caseId === 'c-17') {
          setTargetVitals(prev => ({
            ...prev,
            hr: Math.min(130, prev.hr + 12)
          }));
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'sys_colecistitis_manip',
            sender: 'system',
            text: '⚠️ [ADVERTENCIA CLÍNICA] Se realizaron maniobras de movilización física del hombro. El dolor referido es de origen biliar (Murphy +), por lo que la manipulación local del hombro no tiene efecto terapéutico y le causa dolor innecesario.'
          }, {
            id: Date.now().toString() + 'px_colecistitis_manip',
            sender: 'patient',
            text: '¡Ay doctor! ¡Me dolió un montón cuando me movió el brazo! ¡Siento que la puntada en el estómago se me hizo peor también!'
          }]);
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_manip_safe',
              sender: 'patient',
              text: 'Doctor, la movilización física me alivió un poco la tensión muscular.'
            }]);
          }, 1500);
        }
        break;

      case 'DERIVACION_QUIRURGICA':
        if (caseId === 'c-16') {
          if (resolvedSimulation?.config?.difficulty === 'Crítica') {
            triggerPatientDeath(
              'Paro cardíaco irreversible y colapso circulatorio total en quirófano bajo anestesia general por anular la hiperventilación compensatoria (respiración de Kussmaul) en cetoacidosis metabólica extrema no corregida.'
            );
          } else {
            setTargetVitals(prev => ({
              ...prev,
              hr: Math.min(140, prev.hr + 15),
              bp_sys: Math.max(78, prev.bp_sys - 12)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_dka_surgery_error',
              sender: 'system',
              text: '⚠️ [EVENTO ADVERSO SEVERO] Intento de derivación quirúrgica sin corregir la cetoacidosis diabética. Someter a cirugía general a un paciente deshidratado y acidótico severo multiplica drásticamente el riesgo de paro intraoperatorio.'
            }, {
              id: Date.now().toString() + 'px_dka_surgery_error',
              sender: 'patient',
              text: 'Doctor... me siento muy mareado... me cuesta mucho respirar... no tengo fuerzas...'
            }]);
          }
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_surg_safe',
              sender: 'patient',
              text: 'Entendido doctor, ya me preparan para la evaluación con el cirujano.'
            }]);
          }, 1500);
        }
        break;


      case 'REEVALUAR':
        setTimeout(() => {
          let reevalText = runtime.reeval.initial;
          if (clinicalPhase === 3) {
            reevalText = runtime.reeval.shock;
          } else if (clinicalPhase === 1) {
            reevalText = runtime.reeval.deterioration;
          } else if (clinicalPhase === 2) {
            reevalText = runtime.reeval.recovery;
          }
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'reeval_patient',
            sender: currentCase.patient.companion ? 'companion' : 'patient',
            text: reevalText
          }]);
        }, 600);
        break;

      case 'PASE_HEMODINAMIA':
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'sys_hemo',
          sender: 'system',
          text: '✅ [CONDUCTA CORRECTA] Paciente derivado de urgencia a Sala de Hemodinamia para realización de Angioplastia Primaria de la arteria responsable.'
        }]);
        break;

      case 'PARACETAMOL':
      case 'POSICION_FOWLER':
      case 'ATB_NO_PENICILINA':
      case 'NORADRENALINA':
      case 'COLLAR_CERVICAL':
      case 'K_IV':
        if (!applyRecoveryIfAny(action.id)) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_generic_ok',
              sender: currentCase.patient.companion ? 'companion' : 'patient',
              text: `Entendido doctor, ya realizaron: ${action.label}.`
            }]);
          }, 1500);
        }
        break;

      case 'VIA_AEREA':
        if (!applyRecoveryIfAny(action.id)) {
          setTargetVitals(prev => ({ ...prev, spo2: Math.min(99, prev.spo2 + 2) }));
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_airway',
              sender: 'patient',
              text: 'Me aseguraron la vía, doctor. Puedo respirar un poco más ordenado.'
            }]);
          }, 1500);
        }
        break;

      case 'SEDACION':
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'px_sedacion',
            sender: 'patient',
            text: 'Doctor... me dio un sueño pesado de golpe... si hay que hacer algo ahora, avísenme que no siento tanto.'
          }]);
        }, 1500);
        break;

      case 'ANTIHISTAMINICO':
        if (caseId === 'c-10') {
          const hasAdrenaline = givenActionIds.includes('ADRENALINA_IM');
          if (!hasAdrenaline) {
            setTargetVitals(prev => ({
              ...prev,
              spo2: Math.max(84, prev.spo2 - 4),
              rr: Math.min(36, prev.rr + 4)
            }));
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'sys_antiH',
              sender: 'system',
              text: '⚠️ [DEMORA] Antihistamínico/corticoide no abre la vía ni revierte el shock. En anafilaxia la primera línea es adrenalina IM; esta infusión no sustituye ese paso.'
            }, {
              id: Date.now().toString() + 'px_antiH',
              sender: 'patient',
              text: 'Doctor... la picazón aflojó un poco pero la garganta se me sigue cerrando... no me entra el aire...'
            }]);
          } else {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString() + 'px_antiH_ok',
                sender: 'patient',
                text: 'La picazón residual se me está yendo, doctor.'
              }]);
            }, 1500);
          }
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + 'px_antiH_neutral',
              sender: 'patient',
              text: 'Me pasaron una inyección para la alergia, doctor. No sé si hacía falta.'
            }]);
          }, 1500);
        }
        break;

      default:
        break;
    }
  };

  const executeClinicalAction = (action: ClinicalAction, dose?: MedicationDoseOption) => {
    if (currentVitals.hr === 0) {
      // Paciente fallecido, no se pueden realizar acciones
      return;
    }
    if (action.doseOptions?.length && !dose) {
      setPendingDoseAction(action);
      return;
    }
    const uniqueId = action.id + '_' + Date.now();
    const rawFormatted = formatTime(timeElapsed); // e.g. "00:04:12"
    const displayFormatted = rawFormatted.startsWith('00:') ? rawFormatted.substring(3) : rawFormatted;

    // Determinar pertinencia/safety de forma adaptativa y pedagógica
    let calculatedGrade = action.safetyGrade || 'APPROPRIATE';
    let scoreImpact = action.scoreImpact ?? 0;
    let evaluationFeedback = action.evaluationFeedback || '';
    const caseId = currentCase.id;

    if (caseId === 'c-10' && resolvedSimulation?.config?.difficulty === 'Crítica' && action.id !== 'ADRENALINA_IM' && action.id !== 'O2' && action.id !== 'REEVALUAR' && action.id !== 'VIA_AEREA') {
      triggerPatientDeath(
        'Fallecimiento por asfixia mecánica y shock anafiláctico refractario debido a demora crítica en la administración de Adrenalina intramuscular de primera línea, priorizando estudios o fármacos secundarios innecesarios en la fase aguda.'
      );
      return;
    }

    if (caseId === 'c-9' && resolvedSimulation?.config?.difficulty === 'Crítica' && action.id !== 'EXPANSION_AGRESIVA' && action.id !== 'FLUIDOS' && action.id !== 'O2' && action.id !== 'REEVALUAR' && action.id !== 'CONTROL_HEMORRAGIA' && action.id !== 'HEMODERIVADOS' && action.id !== 'ATB_NO_PENICILINA') {
      triggerPatientDeath(
        'Paro cardiorrespiratorio por shock hipovolémico exanguinante secundario a hemorragia arterial activa no controlada por falta de reanimación hídrica agresiva y control hemodinámico inmediato.'
      );
      return;
    }

    if (caseId === 'c-1') { // Carlos Méndez
      if (action.id === 'ENALAPRIL_05') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -15;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN / DOSIS INCORRECTA] Se administró Enalapril 0.5mg VO. En la fase hiperaguda de un infarto (SCACEST), los IECA no son de primera línea (se prioriza antiagregación y reperfusión). Además, la dosis es subterapéutica (inicio estándar: 2.5-5 mg) y la hipotensión/inestabilidad del paciente contraindica su inicio.';
      } else if (action.id === 'NITRO') {
        if (currentVitals.bp_sys < 95) {
          calculatedGrade = 'POTENTIALLY_UNSAFE';
          scoreImpact = -20;
          evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] Se administró Nitroglicerina sublingual en un paciente hipotenso (TA < 95 mmHg). Esto anula la precarga y desencadena shock cardiogénico/distributivo severo.';
        } else {
          calculatedGrade = 'APPROPRIATE';
          scoreImpact = 10;
          evaluationFeedback = 'Uso de vasodilatador coronario con monitoreo de tensión arterial.';
        }
      } else if (action.id === 'BETABLOQUEADOR') {
        if (currentVitals.bp_sys < 95 || currentVitals.hr < 60 || clinicalPhase === 1 || clinicalPhase === 3) {
          calculatedGrade = 'POTENTIALLY_UNSAFE';
          scoreImpact = -20;
          evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] Se administró Metoprolol (Betabloqueante) en un paciente hemodinámicamente inestable (hipotensión/bradicardia/shock). Esto puede causar una falla de bomba severa y paro cardíaco.';
        } else {
          calculatedGrade = 'OPTIMAL';
          scoreImpact = 10;
          evaluationFeedback = 'Administró betabloqueador para control de frecuencia cardíaca y tensión arterial en paciente estable.';
        }
      }
    } else if (caseId === 'c-100' || caseId === 'c-3') { // Pediátricos (Sofía y Mateo)
      if (action.id === 'ASPIRINA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] La administración de Aspirina en pacientes pediátricos con cuadro febril de sospecha viral está estrictamente contraindicada por el riesgo de Síndrome de Reye (encefalopatía y falla hepática fulminante).';
      } else if (action.id === 'BETABLOQUEADOR') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -20;
        evaluationFeedback = '⚠️ [ERROR GRAVE] Se administró Betabloqueador (Metoprolol) en un paciente pediátrico febril. La taquicardia en la fiebre es compensatoria; bloquearla puede causar colapso hemodinámico.';
      } else if (action.id === 'ENALAPRIL_05') {
        calculatedGrade = 'INAPPROPRIATE';
        scoreImpact = -10;
        evaluationFeedback = '⚠️ [INAPROPIADO] No hay indicación para administrar IECA (Enalapril) en un cuadro pediátrico de fiebre y deshidratación.';
      } else if (action.id === 'FUROSEMIDA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] Administrar diuréticos (Furosemida) en un paciente pediátrico febril y deshidratado agrava la hipovolemia, pudiendo inducir shock hipovolémico e insuficiencia renal aguda.';
      }
    } else if (caseId === 'c-2') { // Lucía (Trauma)
      if (action.id === 'BETABLOQUEADOR') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] Los betabloqueantes están estrictamente contraindicados en shock hemorrágico/politraumatismo, ya que anulan la taquicardia compensatoria refleja, causando colapso circulatorio inmediato.';
      } else if (action.id === 'MORFINA') {
        if (currentVitals.bp_sys < 95 || currentVitals.spo2 < 92) {
          calculatedGrade = 'POTENTIALLY_UNSAFE';
          scoreImpact = -15;
          evaluationFeedback = '⚠️ [PRECAUCIÓN DE SEGURIDAD] Administrar Morfina IV a un paciente politraumatizado inestable, hipotenso e hipóxico sin asegurar la vía aérea ni expandir volumen puede deprimir críticamente la respiración y empeorar el shock.';
        }
      } else if (action.id === 'FUROSEMIDA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] El uso de diuréticos (Furosemida) en un paciente con politraumatismo y sospecha de shock hemorrágico reduce drásticamente la volemia y precipita el colapso vascular.';
      } else if (action.id === 'CONTROL_HEMORRAGIA' || action.id === 'HEMODERIVADOS' || action.id === 'TAC_TRAUMA') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = action.id === 'TAC_TRAUMA'
          ? '✅ [ESTUDIO DIRIGIDO] El TAC de trauma localiza el sangrado y las lesiones asociadas; no reemplaza ABCDE ni la reposición.'
          : action.id === 'HEMODERIVADOS'
            ? '✅ [MANEJO ÓPTIMO] En shock hemorrágico los cristaloides no bastan: la reposición con hemoderivados restaura capacidad de transporte de oxígeno.'
            : '✅ [MANEJO ÓPTIMO] Control de hemorragia externa (compresión/torniquete) es prioridad C del politrauma.';
      } else if (action.id === 'ANTIBIOTICOS_IV') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [TRAMPA EDUCATIVA] Lucía es alérgica a penicilina. Piperacilina/tazobactam es un beta-lactámico tipo penicilina: infundirlo sin verificar alergias precipita anafilaxia. Cubrir trauma contaminado exige otro esquema (p. ej. clindamicina + aminoglucósido), no este ATB del menú.';
      } else if (action.id === 'ATB_NO_PENICILINA' || action.id === 'COLLAR_CERVICAL') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 18;
        evaluationFeedback = action.id === 'COLLAR_CERVICAL'
          ? '✅ [ABCDE] Sin casco: inmovilizar C-espinal mientras se controla hemorragia y volumen.'
          : '✅ [MANEJO ÓPTIMO] Esquema sin beta-lactámico tipo penicilina: cubre herida/abdomen contaminado respetando la alergia.';
      }
    } else if (caseId === 'c-4') { // Roberto (Neurología)
      if (action.id === 'NITRO') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] La nitroglicerina y otros vasodilatadores aumentan el flujo sanguíneo cerebral y están contraindicados ante sospecha de hipertensión endocraneana (cefalea en estallido + Cushing), ya que pueden provocar una herniación cerebral mortal.';
      } else if (action.id === 'EXPANSION_AGRESIVA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -15;
        evaluationFeedback = '⚠️ [MANEJO INADECUADO] La expansión agresiva de volumen con fluidos en pacientes con sospecha de edema cerebral o hipertensión endocraneana agrava el edema y empeora el pronóstico neurológico.';
      }
    } else if (caseId === 'c-5') { // Ana (Apendicitis)
      if (action.id === 'ENEMA_EVACUANTE') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] La administración de enemas evacuantes ante sospecha de apendicitis aguda (abdomen agudo) está contraindicada por el riesgo inminente de aumentar la presión intraluminal, perforando el apéndice y causando peritonitis química y bacteriana.';
      } else if (action.id === 'ALIMENTACION_VO') {
        calculatedGrade = 'INAPPROPRIATE';
        scoreImpact = -15;
        evaluationFeedback = '⚠️ [ERROR DE MANEJO] El paciente sospechoso de abdomen agudo quirúrgico (apendicitis) debe permanecer con nada por boca (NPO / ayuno estricto) por riesgo de broncoaspiración si requiere cirugía de urgencia.';
      }
    } else if (caseId === 'c-6') { // Beatriz (Arritmia)
      if (action.id === 'CARDIOCONVERSION') {
        if (currentVitals.bp_sys < 95) {
          calculatedGrade = 'OPTIMAL';
          scoreImpact = 20;
          evaluationFeedback = '✅ [MANEJO ÓPTIMO] Cardioversión eléctrica sincronizada indicada de urgencia en paciente inestable con arritmia rápida.';
        } else if (clinicalActionEvents.some(e => e.actionId === 'SEDACION')) {
          calculatedGrade = 'APPROPRIATE';
          scoreImpact = 12;
          evaluationFeedback = '✅ Cardioversión electiva con sedación previa. Aceptable; el control de frecuencia farmacológico sigue siendo primera línea si está estable.';
        } else {
          calculatedGrade = 'INAPPROPRIATE';
          scoreImpact = -10;
          evaluationFeedback = '⚠️ [INAPROPIADO] La cardioversión eléctrica sincronizada en un paciente con Fibrilación Auricular hemodinámicamente estable no es de primera línea sin antes intentar control farmacológico de la frecuencia o sedación adecuada.';
        }
      } else if (action.id === 'BETABLOQUEADOR') {
        if (currentVitals.bp_sys < 95) {
          calculatedGrade = 'POTENTIALLY_UNSAFE';
          scoreImpact = -20;
          evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] Se administró Betabloqueador (Metoprolol) en Fibrilación Auricular inestable (TA < 95 mmHg). Los betabloqueantes bloquean el inotropismo y empeoran el shock circulatorio.';
        } else {
          calculatedGrade = 'OPTIMAL';
          scoreImpact = 20;
          evaluationFeedback = '✅ [MANEJO ADECUADO] Control farmacológico de frecuencia con betabloqueante en FA hemodinámicamente estable.';
        }
      } else if (action.id === 'SEDACION') {
        calculatedGrade = 'APPROPRIATE';
        scoreImpact = 10;
        evaluationFeedback = 'Sedación previa si se planea cardioversión en paciente consciente.';
      }
    } else if (caseId === 'c-7') { // Hugo (Insuficiencia Cardíaca)
      if (action.id === 'FLUIDOS' || action.id === 'EXPANSION_AGRESIVA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN ABSOLUTA] La infusión de fluidos endovenosos en un paciente con edema agudo de pulmón / insuficiencia cardíaca descompensada sobrecarga de forma crítica el ventrículo izquierdo, agravando la congestión y pudiendo causar asfixia inmediata.';
      } else if (action.id === 'FUROSEMIDA') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = '✅ [TRATAMIENTO ÓPTIMO] La furosemida endovenosa disminuye la precarga por venodilatación inmediata y promueve la diuresis, aliviando la congestión pulmonar.';
      } else if (action.id === 'BETABLOQUEADOR') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -15;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN] Los betabloqueantes endovenosos disminuyen el inotropismo miocárdico en la fase hiperaguda de la insuficiencia cardíaca descompensada con congestión pulmonar, empeorando la insuficiencia y el shock.';
      }
    } else if (caseId === 'c-8') { // Damián (Compartimental)
      if (action.id === 'YESO_AJUSTADO' || action.id === 'CONTROL_HEMORRAGIA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = action.id === 'CONTROL_HEMORRAGIA'
          ? '⚠️ [CONTRAINDICACIÓN CRÍTICA] No hay hemorragia externa. Un torniquete sobre un compartimento hipertenso agrava la isquemia; la conducta es medir presión y fasciotomía, no oclusión proximal.'
          : '⚠️ [CONTRAINDICACIÓN CRÍTICA] Colocar un yeso circular cerrado ante sospecha de síndrome compartimental estrangula la circulación arterial y venosa del miembro afectado, empeorando la isquemia tisular y acelerando la necrosis.';
      } else if (action.id === 'PRESION_COMPARTIMENTAL') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = '✅ [ESTUDIO CLAVE] La presión compartimental (o ΔP) confirma el diagnóstico y habilita la fasciotomía urgente. Los pulsos distales presentes no descartan el cuadro.';
      }
    } else if (caseId === 'c-9') { // Valeria (Fractura Expuesta)
      if (action.id === 'SUTURA_EXPUESTA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] Suturar directamente la herida de una fractura expuesta sin un debridamiento quirúrgico exhaustivo y lavado en quirófano encierra bacterias anaeróbicas (como Clostridium), induciendo gangrena gaseosa y sepsis fulminante.';
      } else if (action.id === 'CONTROL_HEMORRAGIA' || action.id === 'HEMODERIVADOS' || action.id === 'ANTIBIOTICOS_IV' || action.id === 'ATB_NO_PENICILINA') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = action.id === 'ANTIBIOTICOS_IV' || action.id === 'ATB_NO_PENICILINA'
          ? '✅ [MANEJO ÓPTIMO] La cobertura antibiótica precoz forma parte del manejo de fractura expuesta, junto al control de hemorragia y el pase a quirófano para debridación (no suturar en el box).'
          : action.id === 'HEMODERIVADOS'
            ? '✅ [MANEJO ÓPTIMO] Hemorragia arterial activa: reponer con hemoderivados, no solo cristaloides.'
            : '✅ [MANEJO ÓPTIMO] Compresión/torniquete detiene el sangrado externo antes de que el shock se haga irreversible.';
      }
    } else if (caseId === 'c-10') { // Esteban (Anafilaxia)
      if (action.id === 'ADRENALINA_IM') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = '✅ [MANEJO ÓPTIMO] La administración inmediata de Adrenalina intramuscular (0.3mg IM) es el tratamiento de primera elección para revertir la vasodilatación sistémica y el edema laríngeo, salvando la vida del paciente.';
      } else if (action.id === 'BETABLOQUEADOR') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN ABSOLUTA] Los betabloqueantes bloquean los receptores adrenérgicos beta, impidiendo el efecto terapéutico de la adrenalina y provocando colapso de la vía aérea e hipotensión refractaria en anafilaxia.';
      } else if (action.id === 'VIA_AEREA') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 18;
        evaluationFeedback = '✅ [VÍA AÉREA] Asegurar vía (Guedel/IOT) es paralelo a la adrenalina IM, no un sustituto. Correcto ante amenaza de vía.';
      } else if (action.id === 'ANTIHISTAMINICO') {
        calculatedGrade = 'INAPPROPRIATE';
        scoreImpact = -10;
        evaluationFeedback = '⚠️ [SEGUNDA LÍNEA] Antihistamínico/corticoide no abre la vía ni revierte el shock. No debe ser el primer fármaco.';
      }
    } else if (caseId === 'c-11') { // Clara (Pancreatitis)
      if (action.id === 'ALIMENTACION_VO') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN ABSOLUTA] Ofrecer líquidos o alimentos VO estimula la liberación de colecistoquinina y enzimas pancreáticas, deprimiendo el reposo pancreático, exacerbando la autodigestión y agravando el shock.';
      }
    } else if (caseId === 'c-12') { // Julio (Cetoacidosis)
      if (action.id === 'INSULINA_IV') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = '✅ [TRATAMIENTO ÓPTIMO] La infusión de Insulina Corriente IV disminuye la glucemia y detiene la cetogénesis en cetoacidosis diabética. Requiere rehidratación hídrica agresiva concurrente.';
      } else if (action.id === 'GLUCEMIA' || action.id === 'K_IV') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 15;
        evaluationFeedback = action.id === 'GLUCEMIA'
          ? '✅ Glucemia capilar inmediata confirma CAD sin esperar el laboratorio.'
          : '✅ Reposición de K junto a la insulina evita hipokalemia iatrogénica.';
      }
    } else if (caseId === 'c-13') { // Marta (Urosepsis)
      if (action.id === 'ANTIBIOTICOS_IV') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 25;
        evaluationFeedback = '✅ [MANEJO ÓPTIMO] La administración rápida de antibióticos de amplio espectro endovenosos es la piedra angular del tratamiento en sepsis y shock séptico, reduciendo la mortalidad de manera directa.';
      } else if (action.id === 'BETABLOQUEADOR') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN ABSOLUTA] Los betabloqueantes anulan la respuesta simpática refleja (taquicardia) necesaria para mantener el gasto cardíaco ante la severa vasodilatación del shock séptico, precipitando el colapso.';
      } else if (action.id === 'NORADRENALINA') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = '✅ [SHOCK SÉPTICO] Noradrenalina es el vasopresor de primera línea si el volumen no restaura TAM. No sustituye ATB precoz.';
      }
    } else if (caseId === 'c-14') { // Jorge (Crisis Hipertensiva)
      if (action.id === 'NITRO') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 15;
        evaluationFeedback = '✅ [TRATAMIENTO ADECUADO] La infusión controlada de Nitroglicerina IV permite descender de manera segura e inteligente la tensión arterial en emergencias hipertensivas con encefalopatía.';
      }
    } else if (caseId === 'c-15') { // Ricardo (Disección)
      if (action.id === 'MANIOBRAS_TRAUMA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN ABSOLUTA] Las maniobras físicas, estiramientos o tracciones sobre un miembro o la espalda de un paciente con disección aórtica aguda incrementan la fuerza de cizallamiento (shear stress) en la aorta, precipitando su rotura masiva e inmediata.';
      } else if (action.id === 'TAC_TRAUMA') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 20;
        evaluationFeedback = '✅ [ESTUDIO CLAVE] El angioTAC/TAC de trauma muestra el flap aórtico. No es un lumbago: el estudio cambia el destino (vascular/UTI, no quirófano general).';
      }
    } else if (caseId === 'c-16') { // Lucas (Cetoacidosis)
      if (action.id === 'DERIVACION_QUIRURGICA') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN CRÍTICA] Indicar derivación a quirófano urgente en sospecha de apendicitis sin corregir la cetoacidosis metabólica severa es un error grave. La anestesia general con intubación y ventilación en un paciente acidótico anula la compensación respiratoria de Kussmaul, induciendo shock irreversible en el quirófano.';
      } else if (action.id === 'ENEMA_EVACUANTE') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [INAPROPIADO] No hay indicación para un enema evacuante y puede ser peligroso.';
      } else if (action.id === 'GLUCEMIA' || action.id === 'K_IV' || action.id === 'INSULINA_IV') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 18;
        evaluationFeedback = action.id === 'GLUCEMIA'
          ? '✅ Glucemia capilar desenmascara el truco: no es apendicitis, es CAD.'
          : action.id === 'K_IV'
            ? '✅ Reposición de K junto a la insulina.'
            : '✅ Insulina IV es la conducta del truco metabólico, no el quirófano.';
      }
    } else if (caseId === 'c-17') { // Mariana (Colecistitis)
      if (action.id === 'MANIOBRAS_TRAUMA') {
        calculatedGrade = 'INAPPROPRIATE';
        scoreImpact = -15;
        evaluationFeedback = '⚠️ [INAPROPIADO] El dolor en el hombro derecho es un dolor referido (frénico) por colecistitis aguda. Las maniobras de movilización física del hombro son innecesariamente dolorosas y demoran el diagnóstico.';
      } else if (action.id === 'ANTIBIOTICOS_IV') {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = 18;
        evaluationFeedback = '✅ ATB + ayuno cubren la colecistitis aguda del truco (omalgia referida).';
      }
    } else if (caseId === 'c-18') { // Ramón (Infarto Inferior/compromiso VD)
      if (action.id === 'NITRO') {
        calculatedGrade = 'POTENTIALLY_UNSAFE';
        scoreImpact = -25;
        evaluationFeedback = '⚠️ [CONTRAINDICACIÓN ABSOLUTA] La nitroglicerina sublingual o IV está contraindicada en infartos agudos de miocardio de cara inferior con compromiso de ventrículo derecho (VD). El VD infartado depende de la precarga venosa; la venodilatación masiva por nitratos reduce drásticamente el retorno venoso, precipitando colapso circulatorio total y shock cardiogénico profundo.';
      } else if (['ASPIRINA', 'CLOPIDOGREL', 'HEPARINA', 'ESTATINA', 'ECG'].includes(action.id)) {
        calculatedGrade = 'OPTIMAL';
        scoreImpact = action.id === 'ECG' ? 20 : 15;
        evaluationFeedback = '✅ Conducta de SCA: el epigastrio es un infarto inferior, no una gastritis.';
      }
    }

    // Evaluaciones generales estándar
    if (['c-2', 'c-4', 'c-8', 'c-9'].includes(caseId) && ['ASPIRINA', 'CLOPIDOGREL', 'HEPARINA'].includes(action.id)) {
      calculatedGrade = 'POTENTIALLY_UNSAFE';
      scoreImpact = -20;
      evaluationFeedback = '⚠️ [TRAMPA] Antiagregación o heparina en politrauma, fractura sangrante, compartimental o HSA aumenta el sangrado. No es un SCA.';
    }

    if ((caseId === 'c-1' || caseId === 'c-18') && action.id === 'ECG' && timeElapsed > 120) {
      calculatedGrade = 'LATE';
    } else if ((caseId === 'c-1' || caseId === 'c-18') && ['ASPIRINA', 'CLOPIDOGREL', 'HEPARINA', 'ESTATINA', 'ECG'].includes(action.id) && calculatedGrade !== 'POTENTIALLY_UNSAFE' && calculatedGrade !== 'LATE') {
      calculatedGrade = 'OPTIMAL';
      scoreImpact = Math.max(scoreImpact, action.id === 'ECG' ? 20 : 15);
    } else if (action.id === 'O2' && currentVitals.spo2 < 92) {
      calculatedGrade = 'OPTIMAL';
      scoreImpact = Math.max(scoreImpact, 15);
    }

    if (dose && calculatedGrade !== 'POTENTIALLY_UNSAFE') {
      calculatedGrade = dose.safetyGrade || calculatedGrade;
      scoreImpact = dose.scoreImpact ?? scoreImpact;
      evaluationFeedback = dose.evaluationFeedback || evaluationFeedback;
    } else if (dose && calculatedGrade === 'POTENTIALLY_UNSAFE') {
      evaluationFeedback = `${evaluationFeedback} Dosis elegida: ${dose.label}.`;
    }

    const displayLabel = dose ? `${action.label} ${dose.label}` : action.label;
    const resultLog = dose?.systemLogMessage || getActionSystemLog(currentCase.id, action.id, action.systemLogMessage);

    const newEvent: ClinicalActionEvent = {
      id: uniqueId,
      actionId: action.id,
      label: displayLabel,
      category: action.category,
      executedAtSeconds: timeElapsed,
      executedAtFormatted: displayFormatted,
      clinicalPhase,
      vitalSnapshot: { ...currentVitals },
      status: 'PENDING',
      safetyGrade: calculatedGrade,
      evaluationCompetency: action.evaluationCompetency,
      scoreImpact: scoreImpact,
      evaluationFeedback: evaluationFeedback || action.evaluationFeedback,
      systemLog: resultLog,
      selectedDoseId: dose?.id,
      selectedDoseLabel: dose?.label,
      doseEffect: dose?.effect,
    };

    setClinicalActionEvents(prev => [...prev, newEvent]);
    setActiveActions(prev => [...prev, { id: uniqueId, name: displayLabel, status: 'PENDING', timestamp: Date.now() }]);

    // Mensaje inmediato en chat de inicio de acción
    setMessages(prev => [...prev, { 
      id: Date.now().toString() + 'sys_pending', 
      sender: 'system', 
      text: `[EN CURSO] ${displayLabel} (Tiempo estimado: ${(action.executionTimeMs / 1000).toFixed(0)}s)` 
    }]);

    setTimeout(() => {
      // Completar acción
      setClinicalActionEvents(prev => prev.map(e => e.id === uniqueId ? { ...e, status: 'COMPLETED', completedAtSeconds: timeElapsed + Math.round(action.executionTimeMs / 1000) } : e));
      setActiveActions(prev => prev.map(a => a.id === uniqueId ? { ...a, status: 'COMPLETED' } : a));

      if (isVisualStudy(action.id)) {
        const stage = resolveStudyStage(currentCase.id, {
          clinicalPhase,
          completedActionIds: clinicalActionEvents.filter(e => e.status === 'COMPLETED').map(e => e.actionId)
        });
        const captureId = uniqueId;
        setStudyCaptures(prev => [...prev, {
          id: captureId,
          actionId: action.id,
          stage,
          capturedAtFormatted: displayFormatted
        }]);
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'sys_done',
          sender: 'system',
          text: getStudyReadyMessage(action.id, action.label)
        }]);
        setActiveCaptureId(captureId);
      } else if (resultLog) {
        setMessages(prev => [...prev, { 
          id: Date.now().toString() + 'sys_done', 
          sender: 'system', 
          text: resultLog
        }]);
      }

      // Aplicar cambio fisiológico
      applyActionPhysiologicalEffect(action, dose);
    }, action.executionTimeMs);
  };

  // Clinical Engine: Vitals Jitter & Drifting
  useEffect(() => {
    if (monitorState !== 'ACTIVE') return;

    const interval = setInterval(() => {
      setCurrentVitals(prev => {
        if (targetVitals.hr === 0) {
          return {
            hr: 0,
            spo2: 0,
            rr: 0,
            bp_sys: 0,
            bp_dia: 0,
            temp: 36.0
          };
        }
        const multiplier = resolvedSimulation?.deteriorationMultiplier || 1.0;
        const move = (current: number, target: number, step: number) => {
          step = step * multiplier;
          if (current < target) return Math.min(current + step, target);
          if (current > target) return Math.max(current - step, target);
          return current;
        };
        const jitter = (val: number, maxJitter: number) => val + Math.floor(Math.random() * (maxJitter * 2 + 1)) - maxJitter;

        return {
          ...prev,
          hr: jitter(move(prev.hr, targetVitals.hr, 2), 1),
          spo2: Math.min(100, jitter(move(prev.spo2, targetVitals.spo2, 1), 1)),
          rr: jitter(move(prev.rr, targetVitals.rr, 1), 1),
          bp_sys: jitter(move(prev.bp_sys, targetVitals.bp_sys, 2), 2),
          bp_dia: jitter(move(prev.bp_dia, targetVitals.bp_dia, 1), 1)
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [monitorState, targetVitals]);

  // Auto-Trigger Deterioration & Adaptive Help System
  useEffect(() => {
    const doctorMsgs = messages.filter(m => m.sender === 'doctor');
    const triggerMsgs = (resolvedSimulation?.deteriorationMultiplier || 1.0) > 1.5 ? 1 : 3;
    if (doctorMsgs.length >= triggerMsgs && clinicalPhase === 0) {
      setClinicalPhase(1);

      setTargetVitals(prev => ({
        ...prev,
        ...runtime.deteriorationVitals
      }));

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: runtime.deteriorationSender,
          text: runtime.deteriorationMessage,
        }]);
      }, 4000);
    }
    
    // Adaptive Help System (solo en modo Entrenamiento)
    let alertTimer1: NodeJS.Timeout;
    let alertTimer2: NodeJS.Timeout;
    let alertTimer3: NodeJS.Timeout;

    const isExam = resolvedSimulation?.config?.mode === 'Examen';

    if (clinicalPhase === 1 && showHints && !isExam) {
      alertTimer1 = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'hint1',
          sender: 'system',
          text: '⚠️ [ORIENTACIÓN] El estado del paciente continúa cambiando de manera desfavorable.'
        }]);
      }, 20000);

      alertTimer2 = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'hint2',
          sender: 'system',
          text: '⚠️ [ORIENTACIÓN] Reevaluá la situación clínica del paciente.'
        }]);
      }, 40000);

      alertTimer3 = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'hint3',
          sender: 'system',
          text: runtime.hintPriority
        }]);
      }, 60000);
    }
    
    return () => {
      clearTimeout(alertTimer1);
      clearTimeout(alertTimer2);
      clearTimeout(alertTimer3);
    };
  }, [messages, clinicalPhase, currentCase, showHints, resolvedSimulation]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef<{ stop: () => void } | null>(null);
    const lastRecordedTranscriptRef = useRef<string>('');
    const autoSendTimeoutRef = useRef<any>(null);

    useEffect(() => {
      void preloadVoices();
      return () => {
        stopPatientSpeech();
        recognitionRef.current?.stop();
        if (autoSendTimeoutRef.current) {
          clearTimeout(autoSendTimeoutRef.current);
        }
      };
    }, []);

    const lastSpokenMessageIdRef = useRef<string | null>(null);

    // Automatically play voice for any new patient/companion messages
    useEffect(() => {
      if (messages.length === 0) return;
      const lastMessage = messages[messages.length - 1];
      
      // Only speak if the last message is from 'patient' or 'companion'
      if (lastMessage.sender !== 'patient' && lastMessage.sender !== 'companion') return;
      
      // Check if we have already handled/spoken this message
      if (lastSpokenMessageIdRef.current === lastMessage.id) return;
      
      // Mark as handled
      lastSpokenMessageIdRef.current = lastMessage.id;

      if (isVoiceOutputEnabled) {
        const companionRole = currentCase.patient.companion?.role;
        const speakerGender = lastMessage.sender === 'companion'
          ? (companionRole === 'Padre' ? 'M' : 'F')
          : currentCase.patient.gender;

        speakPatientResponse(lastMessage.text, {
          gender: speakerGender,
          clinicalPhase: clinicalPhase,
          age: currentCase.patient.age,
          ageUnit: currentCase.patient.ageUnit,
          speaker: lastMessage.sender,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }
    }, [messages, isVoiceOutputEnabled, clinicalPhase, currentCase]);

    const toggleVoiceRecording = async () => {
      if (isRecording) {
        if (autoSendTimeoutRef.current) {
          clearTimeout(autoSendTimeoutRef.current);
          autoSendTimeoutRef.current = null;
        }
        recognitionRef.current?.stop();
        setIsRecording(false);
        return;
      }

      lastRecordedTranscriptRef.current = '';

      try {
        const rec = await startVoiceRecognition({
          locale: 'es-AR',
          onStart: () => {
            setIsRecording(true);
          },
          onResult: (transcript) => {
            lastRecordedTranscriptRef.current = transcript;
            setInputValue(transcript);

            // Detección de pausa natural: damos 3.0s de silencio continuo antes de auto-enviar
            if (autoSendTimeoutRef.current) {
              clearTimeout(autoSendTimeoutRef.current);
            }
            if (transcript.trim().length > 0) {
              autoSendTimeoutRef.current = setTimeout(() => {
                const textToSend = lastRecordedTranscriptRef.current.trim();
                if (textToSend.length > 0) {
                  recognitionRef.current?.stop();
                  setIsRecording(false);
                  handleSendMessage(textToSend);
                }
              }, 3000); // 3 segundos de pausa natural
            }
          },
          onError: () => {
            setIsRecording(false);
          },
          onEnd: () => {
            setIsRecording(false);
          },
        });

        if (rec) {
          recognitionRef.current = rec;
          setIsRecording(true);
        }
      } catch (err) {
        console.warn("[GuardIA] Error al inicializar reconocimiento de voz:", err);
        setIsRecording(false);
      }
    };

  const handleSendMessage = async (customMessage?: string) => {
    const rawMsg = typeof customMessage === 'string' ? customMessage : inputValue;
    const userMsg = rawMsg.trim();
    if (!userMsg) return;

    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    
    // Stop recording if active
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    lastRecordedTranscriptRef.current = '';
    
    const newUserMessage: Message = { id: Date.now().toString(), sender: 'doctor', text: userMsg };
    
    // Convert existing messages to Ollama format
    const chatHistory = messages
      .filter(m => m.sender !== 'system')
      .map(m => ({
        role: (m.sender === 'doctor' ? 'user' : 'assistant'),
        content: m.text
      }));

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    
    const responder = (runtime.forceCompanionSpeaker || (currentCase.patient.companion && interlocutor === 'companion'))
      ? 'companion'
      : 'patient';

    try {
      // Intentamos con Ollama primero con el contexto clínico dinámico
      const ollamaResponse = await generatePatientResponse({
        userMessage: userMsg,
        chatHistory,
        currentCase,
        resolvedSimulation: resolvedSimulation || null,
        currentVitals,
        clinicalPhase,
        interlocutor: responder,
        recentActions: activeActions,
      });
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: responder, 
        text: ollamaResponse 
      }]);
    } catch (error) {
      console.warn("[GuardIA] Error al consultar Ollama, aplicando fallback seguro:", error);
      // Fallback a lógica simulada si Ollama falla para no romper la experiencia
      setTimeout(() => {
        const responseText = matchFallbackReply(runtime, userMsg, Boolean(currentCase.patient.companion));
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          sender: responder, 
          text: responseText 
        }]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinishSimulation = () => {
    setSelectedDestination('');
    setSelectedProcedure('');
    setJustification('');
    setShowResolutionModal(true);
  };

  const handleConfirmResolution = async () => {
    const level = resolvedSimulation?.config?.level || 'Residente';
    const difficulty = resolvedSimulation?.config?.difficulty || 'Intermedia';
    const isHigherLevel = ['Residente', 'Médico', 'Especialista'].includes(level);
    const specialty = getResolutionTrack(currentCase);
    const caseId = currentCase.id;
    
    let isCorrect = false;
    let safetyGrade: 'OPTIMAL' | 'APPROPRIATE' | 'POTENTIALLY_UNSAFE' | 'INAPPROPRIATE' = 'APPROPRIATE';
    let feedback = '';
    
    // Evaluation logic matrix based on Specialty, Selected Destination, Procedure, Difficulty and Level
    if (specialty === 'Pediatría') {
      if (selectedDestination === 'ALTA') {
        if (difficulty === 'Crítica') {
          isCorrect = false;
          safetyGrade = 'POTENTIALLY_UNSAFE';
          feedback = '⚠️ Alta hospitalaria inapropiada. Paciente pediátrico crítico requiere internación en Sala de Pediatría o UTIP.';
        } else {
          isCorrect = true;
          safetyGrade = 'OPTIMAL';
          feedback = '✅ Alta hospitalaria adecuada con pautas de alarma. El paciente pediátrico se encuentra estable y rehidratado.';
        }
      } else if (selectedDestination === 'SALA_PEDIATRIA' || selectedDestination === 'UTI_PEDIATRICA') {
        isCorrect = true;
        safetyGrade = 'OPTIMAL';
        feedback = '✅ Destino correcto. Internación en cuidados pediátricos (generales o críticos) para monitoreo y soporte continuo.';
      } else {
        isCorrect = false;
        safetyGrade = 'INAPPROPRIATE';
        feedback = '⚠️ Permanecer en Box de Guardia de forma indefinida retrasa el cuidado definitivo y expone al lactante.';
      }

      if (isHigherLevel) {
        if (selectedProcedure === 'HIDRATACION_ORAL') {
          if (difficulty === 'Crítica') {
            isCorrect = false;
            safetyGrade = 'INAPPROPRIATE';
            feedback += ' La hidratación oral fraccionada es insuficiente en cuadros deshidratados críticos o de shock.';
          } else {
            isCorrect = isCorrect && true;
            safetyGrade = safetyGrade === 'OPTIMAL' ? 'OPTIMAL' : 'APPROPRIATE';
            feedback += ' Plan de Hidratación Oral (SRO) es la conducta de elección en deshidratación leve-moderada.';
          }
        } else if (selectedProcedure === 'HIDRATACION_IV') {
          isCorrect = isCorrect && true;
          safetyGrade = safetyGrade === 'OPTIMAL' ? 'OPTIMAL' : 'APPROPRIATE';
          feedback += ' Hidratación endovenosa de mantenimiento correcta para sostén hidroelectrolítico.';
        } else {
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback += ' Conducta terapéutica final incompleta para el cuadro de deshidratación febril.';
        }
      }
    } else if (specialty === 'Traumatología') {
      if (selectedDestination === 'PASE_QUIROFANO') {
        if (caseId === 'c-15') { // Disección
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback = '⚠️ El quirófano general o traumatológico no es el destino adecuado. Disección aórtica requiere quirófano cardiovascular o UTI de inmediato.';
        } else {
          isCorrect = true;
          safetyGrade = 'OPTIMAL';
          feedback = '✅ Destino óptimo. Derivación inmediata a Quirófano de Urgencia para tratamiento quirúrgico definitivo.';
        }
      } else if (selectedDestination === 'UTI') {
        isCorrect = true;
        safetyGrade = difficulty === 'Crítica' ? 'OPTIMAL' : 'APPROPRIATE';
        feedback = '✅ Destino de soporte adecuado. Internación en cuidados intensivos para estabilización hemodinámica.';
      } else if (selectedDestination === 'ALTA') {
        isCorrect = false;
        safetyGrade = 'POTENTIALLY_UNSAFE';
        feedback = '⚠️ Alta hospitalaria altamente peligrosa. El paciente cursa una patología traumatológica o vascular aguda de alta morbimortalidad.';
      } else { // SALA_TRAUMA
        isCorrect = difficulty !== 'Crítica';
        safetyGrade = difficulty === 'Crítica' ? 'INAPPROPRIATE' : 'APPROPRIATE';
        feedback = '✅ Derivación aceptable a sala de Traumatología para internación general y control.';
      }

      if (isHigherLevel) {
        if (selectedProcedure === 'FASCIOTOMIA_URGENTE') {
          if (caseId === 'c-15') {
            isCorrect = false;
            safetyGrade = 'POTENTIALLY_UNSAFE';
            feedback += ' Fasciotomía incorrecta. El paciente cursa disección aórtica, no síndrome compartimental.';
          } else {
            isCorrect = isCorrect && true;
            safetyGrade = safetyGrade === 'OPTIMAL' ? 'OPTIMAL' : 'APPROPRIATE';
            feedback += ' Tratamiento quirúrgico de elección (fasciotomía descompresiva / debridación y lavado de fractura expuesta).';
          }
        } else if (selectedProcedure === 'BYPASS_CIRUGIA_VAS') {
          if (caseId === 'c-15') {
            isCorrect = true;
            safetyGrade = 'OPTIMAL';
            feedback += ' Reparación aórtica / Cirugía cardiovascular urgente es la conducta vital definitiva en disección.';
          } else {
            isCorrect = false;
            safetyGrade = 'INAPPROPRIATE';
            feedback += ' Cirugía vascular inapropiada para lesiones osteomusculares puras.';
          }
        } else {
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback += ' Conducta procedimental incompleta. Requiere descompresión o reparación quirúrgica de urgencia.';
        }
      }
    } else if (specialty === 'Guardia General') {
      if (selectedDestination === 'PASE_QUIROFANO') {
        if (caseId === 'c-16') { // Cetoacidosis
          isCorrect = false;
          safetyGrade = 'POTENTIALLY_UNSAFE';
          feedback = '⚠️ Quirófano contraindicado. El dolor abdominal es pseudoperitoneal por cetoacidosis; operar bajo anestesia causa colapso fatal.';
        } else if (caseId === 'c-10') { // Anafilaxia
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback = '⚠️ Quirófano innecesario. Paciente con shock anafiláctico requiere UTI o sala de observación pos-estabilización.';
        } else if (caseId === 'c-11') { // Pancreatitis
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback = '⚠️ La pancreatitis aguda se trata con ayuno, fluidos y analgesia. La colecistectomía de urgencia no es el cierre salvo colangitis o complicación quirúrgica.';
        } else {
          isCorrect = true;
          safetyGrade = 'OPTIMAL';
          feedback = '✅ Destino óptimo. Derivación inmediata a Quirófano de Guardia para cirugía abdominal de urgencia.';
        }
      } else if (selectedDestination === 'UTI') {
        isCorrect = true;
        safetyGrade = difficulty === 'Crítica' ? 'OPTIMAL' : 'APPROPRIATE';
        feedback = '✅ Destino correcto. Internación en cuidados intensivos para soporte hemodinámico y metabólico.';
      } else if (selectedDestination === 'ALTA') {
        isCorrect = false;
        safetyGrade = 'POTENTIALLY_UNSAFE';
        feedback = '⚠️ Alta hospitalaria inapropiada. Paciente agudo requiere internación para control o intervención quirúrgica.';
      } else { // SALA_INTERNACION
        isCorrect = difficulty !== 'Crítica';
        safetyGrade = difficulty === 'Crítica' ? 'INAPPROPRIATE' : 'APPROPRIATE';
        feedback = '✅ Derivación aceptable a sala de internación general.';
      }

      if (isHigherLevel) {
        if (selectedProcedure === 'APENDICECTOMIA' && caseId === 'c-5') {
          isCorrect = isCorrect && true;
          safetyGrade = safetyGrade === 'OPTIMAL' ? 'OPTIMAL' : 'APPROPRIATE';
          feedback += ' Apendicectomía de urgencia es el estándar de oro quirúrgico.';
        } else if (selectedProcedure === 'COLECISTECTOMIA' && caseId === 'c-17') {
          isCorrect = isCorrect && true;
          safetyGrade = safetyGrade === 'OPTIMAL' ? 'OPTIMAL' : 'APPROPRIATE';
          feedback += ' Colecistectomía: el hombro era dolor referido de colecistitis, no trauma.';
        } else if (selectedProcedure === 'REPOSO_PANCREATICO' && caseId === 'c-11') {
          isCorrect = selectedDestination !== 'PASE_QUIROFANO';
          safetyGrade = isCorrect ? 'OPTIMAL' : 'INAPPROPRIATE';
          feedback += ' Ayuno, fluidos y analgesia son la conducta médica de la pancreatitis aguda.';
        } else if (selectedProcedure === 'CORRECCION_ACIDOSIS' && caseId === 'c-16') {
          isCorrect = isCorrect && true;
          safetyGrade = 'OPTIMAL';
          feedback += ' Corrección hidroelectrolítica con Insulina IV es la conducta médica definitiva correcta para cetoacidosis.';
        } else if (selectedProcedure === 'MONITORIZACION_ESTRICTA' && caseId === 'c-10') {
          isCorrect = isCorrect && true;
          safetyGrade = 'OPTIMAL';
          feedback += ' Monitoreo estrecho de la permeabilidad de vía aérea y patrón hemodinámico.';
        } else {
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback += ' Procedimiento definitivo incorrecto para la patología subyacente.';
        }
      }
    } else if (specialty === 'Medicina Interna') {
      if (selectedDestination === 'UTI') {
        isCorrect = true;
        safetyGrade = 'OPTIMAL';
        feedback = '✅ Destino óptimo. Paciente grave con desequilibrio metabólico, sepsis o crisis neurológica requiere cuidados críticos.';
      } else if (selectedDestination === 'SALA_INTERNACION') {
        isCorrect = difficulty !== 'Crítica';
        safetyGrade = difficulty === 'Crítica' ? 'INAPPROPRIATE' : 'APPROPRIATE';
        feedback = '✅ Derivación a internación general en clínica médica para continuación de terapéutica.';
      } else if (selectedDestination === 'ALTA') {
        isCorrect = false;
        safetyGrade = 'POTENTIALLY_UNSAFE';
        feedback = '⚠️ Alta hospitalaria inapropiada. Paciente inestable metabólica o hemodinámicamente requiere internación obligatoria.';
      } else { // OBSERVACION_BOX
        isCorrect = false;
        safetyGrade = 'INAPPROPRIATE';
        feedback = '⚠️ Permanecer en box indefinidamente prolonga la estancia en emergencias sin definir cuidados definitivos.';
      }

      if (isHigherLevel) {
        if (selectedProcedure === 'CORRECCION_ACIDOSIS' && caseId === 'c-12') {
          isCorrect = isCorrect && true;
          safetyGrade = 'OPTIMAL';
          feedback += ' Protocolo de infusión de insulina corriente y reposición hídrica agresiva correcto.';
        } else if (selectedProcedure === 'SOPORTE_VASOPRESOR' && caseId === 'c-13') {
          isCorrect = isCorrect && true;
          safetyGrade = 'OPTIMAL';
          feedback += ' Noradrenalina para shock séptico urinario y antibióticos sistémicos correctos.';
        } else if (selectedProcedure === 'VASODILATADORES_IV' && caseId === 'c-14') {
          isCorrect = isCorrect && true;
          safetyGrade = 'OPTIMAL';
          feedback += ' Infusión de Nitroglicerina IV continua en bomba de infusión para emergencia hipertensiva correcta.';
        } else {
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback += ' Procedimiento clínico incorrecto o insuficiente para este caso metabólico/infeccioso.';
        }
      }
    } else if (specialty === 'Neurología') {
      if (selectedDestination === 'UTI') {
        isCorrect = true;
        safetyGrade = 'OPTIMAL';
        feedback = '✅ Destino óptimo. Cefalea en estallido con signos de alarma requiere UTI y neuroimágenes urgentes.';
      } else if (selectedDestination === 'SALA_INTERNACION') {
        isCorrect = difficulty !== 'Crítica';
        safetyGrade = difficulty === 'Crítica' ? 'INAPPROPRIATE' : 'APPROPRIATE';
        feedback = 'Derivación a sala. En presentación crítica es insuficiente frente a HTEC.';
      } else if (selectedDestination === 'ALTA') {
        isCorrect = false;
        safetyGrade = 'POTENTIALLY_UNSAFE';
        feedback = '⚠️ Alta peligrosa. Cefalea súbita máxima requiere estudio de alarma.';
      } else {
        isCorrect = false;
        safetyGrade = 'INAPPROPRIATE';
        feedback = '⚠️ Permanecer en box retrasa neuroimágenes y control de HTEC.';
      }

      if (isHigherLevel) {
        if (selectedProcedure === 'MONITORIZACION_ESTRICTA') {
          isCorrect = isCorrect && true;
          safetyGrade = 'OPTIMAL';
          feedback += ' Monitoreo neurológico y neuroimágenes es la conducta correcta.';
        } else if (selectedProcedure === 'VASODILATADORES_IV') {
          isCorrect = false;
          safetyGrade = 'POTENTIALLY_UNSAFE';
          feedback += ' Vasodilatadores/nitroglicerina están contraindicados ante sospecha de HTEC.';
        } else {
          isCorrect = false;
          safetyGrade = 'INAPPROPRIATE';
          feedback += ' Conducta insuficiente para un cuadro neurológico de alarma.';
        }
      }
    } else { // Cardiología
      if (selectedDestination === 'ALTA') {
        safetyGrade = 'POTENTIALLY_UNSAFE';
        feedback = '⚠️ Alta hospitalaria inapropiada. Paciente con infarto agudo de miocardio activo (SCACEST) o arritmia/falla inestable requiere internación urgente.';
      } else if (selectedDestination === 'OBSERVACION_BOX') {
        safetyGrade = 'INAPPROPRIATE';
        feedback = '⚠️ Permanecer en Box de Guardia de forma indefinida retrasa de forma crítica el tratamiento de reperfusión (angioplastia).';
      } else {
        if (selectedDestination === 'PASE_HEMODINAMIA') {
          isCorrect = true;
          safetyGrade = 'OPTIMAL';
        } else { // PASE_UCO
          isCorrect = difficulty === 'Crítica' || caseId === 'c-6' || caseId === 'c-7';
          safetyGrade = (difficulty === 'Crítica' || caseId === 'c-6' || caseId === 'c-7') ? 'OPTIMAL' : 'APPROPRIATE';
        }
        
        if (isHigherLevel) {
          if (selectedProcedure === 'ATC_URGENTE') {
            isCorrect = isCorrect && (caseId === 'c-1' || caseId === 'c-18');
            safetyGrade = safetyGrade === 'OPTIMAL' ? 'OPTIMAL' : 'APPROPRIATE';
            feedback = '✅ Conducta de reperfusión de primera línea: coronariografía inmediata y angioplastia primaria (ATC) de arteria responsable.';
          } else if (selectedProcedure === 'ESTRAT_INVASIVA_24H') {
            isCorrect = false;
            safetyGrade = 'INAPPROPRIATE';
            feedback = '⚠️ Estrategia invasiva diferida (24h) incorrecta. En SCACEST, el retraso de la reperfusión aumenta de forma lineal la mortalidad y el daño miocárdico.';
          } else if (selectedProcedure === 'FIBRINOLISIS') {
            isCorrect = false;
            safetyGrade = difficulty === 'Crítica' ? 'POTENTIALLY_UNSAFE' : 'INAPPROPRIATE';
            feedback = '⚠️ Fibrinólisis inadecuada. Teniendo sala de hemodinamia disponible de inmediato (HU Virtual), la angioplastia primaria es el tratamiento de elección.';
          } else if (selectedProcedure === 'BYPASS_CORONARIO') {
            isCorrect = false;
            safetyGrade = 'INAPPROPRIATE';
            feedback = '⚠️ Cirugía de Bypass (CABG) no es de primera línea en la fase aguda del SCACEST a menos que la angioplastia no sea factible o haya shock mecánico.';
          } else { // TRATAMIENTO_MEDICO
            isCorrect = (caseId === 'c-6' || caseId === 'c-7');
            safetyGrade = (caseId === 'c-6' || caseId === 'c-7') ? 'OPTIMAL' : 'POTENTIALLY_UNSAFE';
            feedback = (caseId === 'c-6' || caseId === 'c-7')
              ? '✅ Tratamiento médico conservador correcto para control de frecuencia cardíaca o diuresis en la fase aguda.'
              : '⚠️ Tratamiento médico puramente conservador sin reperfusión coronaria es inaceptable en un SCACEST activo.';
          }
        } else {
          feedback = selectedDestination === 'PASE_HEMODINAMIA' 
            ? '✅ Derivación óptima a Hemodinamia para angioplastia primaria.'
            : '✅ Derivación aceptable a UCO para estabilización y soporte.';
        }
      }
    }
    
    const uniqueId = 'RESOLUCION_' + Date.now();
    const rawFormatted = formatTime(timeElapsed);
    const displayFormatted = rawFormatted.startsWith('00:') ? rawFormatted.substring(3) : rawFormatted;
    
    // Detailed procedure label translation based on specialty
    const allProcLabels: Record<string, Record<string, string>> = {
      'Pediatría': {
        HIDRATACION_ORAL: 'Plan de Hidratación Oral (SRO)',
        HIDRATACION_IV: 'Plan de Hidratación Endovenoso',
        ANTIBIOTICOS_EMP: 'Antibioticoterapia Empírica',
        TRATAMIENTO_SINTOMATICO: 'Tratamiento Sintomático (Antitérmicos)'
      },
      'Traumatología': {
        FASCIOTOMIA_URGENTE: 'Fasciotomía / Debridación quirúrgica urgente',
        FIJACION_YESO: 'Reducción e inmovilización con yeso',
        BYPASS_CIRUGIA_VAS: 'Cirugía Vascular / Reparación Aórtica Urgente',
        TRATAMIENTO_MEDICO: 'Tratamiento Médico y Analgesia'
      },
      'Guardia General': {
        APENDICECTOMIA: 'Apendicectomía de urgencia',
        COLECISTECTOMIA: 'Colecistectomía de urgencia',
        REPOSO_PANCREATICO: 'Ayuno + fluidos IV + analgesia',
        CORRECCION_ACIDOSIS: 'Corrección hidroelectrolítica e Insulina IV',
        MONITORIZACION_ESTRICTA: 'Monitoreo Estrecho pos-adrenalina'
      },
      'Medicina Interna': {
        CORRECCION_ACIDOSIS: 'Hidratación agresiva + Insulina corriente IV',
        SOPORTE_VASOPRESOR: 'Soporte Hemodinámico + Antibióticos IV',
        VASODILATADORES_IV: 'Infusión controlada de Vasodilatadores IV',
        TRATAMIENTO_MEDICO: 'Tratamiento Médico de Soporte'
      },
      'Neurología': {
        MONITORIZACION_ESTRICTA: 'Monitoreo neurológico + neuroimágenes urgentes',
        TRATAMIENTO_MEDICO: 'Analgesia y observación',
        VASODILATADORES_IV: 'Vasodilatadores / Nitroglicerina',
        SOPORTE_VASOPRESOR: 'Soporte hemodinámico'
      },
      'Cardiología': {
        ATC_URGENTE: 'Coronariografía + Angioplastia Urgente',
        ESTRAT_INVASIVA_24H: 'Coronariografía diagnóstica (24h)',
        BYPASS_CORONARIO: 'Bypass Coronario Urgente',
        FIBRINOLISIS: 'Fibrinólisis en Guardia',
        TRATAMIENTO_MEDICO: 'Tratamiento Médico Conservador'
      }
    };

    const specialtyKey = ['Pediatría', 'Traumatología', 'Guardia General', 'Medicina Interna', 'Neurología'].includes(specialty) ? specialty : 'Cardiología';
    const procLabels = allProcLabels[specialtyKey];

    const destLabels: Record<string, string> = {
      PASE_HEMODINAMIA: 'Sala de Hemodinamia',
      PASE_UCO: 'Unidad Coronaria (UCO)',
      OBSERVACION_BOX: 'Box de Guardia',
      ALTA: 'Alta Hospitalaria',
      SALA_PEDIATRIA: 'Sala de Pediatría',
      UTI_PEDIATRICA: 'Terapia Intensiva Pediátrica (UTIP)',
      PASE_QUIROFANO: 'Quirófano de Urgencia',
      SALA_TRAUMA: 'Sala de Traumatología',
      UTI: 'Unidad de Terapia Intensiva (UTI)',
      SALA_INTERNACION: 'Sala de Internación General'
    };
    
    const finalEvent: ClinicalActionEvent = {
      id: uniqueId,
      actionId: 'RESOLUCION_CASO',
      label: `Cierre: ${destLabels[selectedDestination] || selectedDestination}${isHigherLevel && selectedProcedure ? ` + ${procLabels[selectedProcedure] || selectedProcedure}` : ''}`,
      category: 'DISPOSITION',
      executedAtSeconds: timeElapsed,
      executedAtFormatted: displayFormatted,
      clinicalPhase,
      vitalSnapshot: { ...currentVitals },
      status: 'COMPLETED',
      safetyGrade,
      evaluationCompetency: 'Priorización y Tiempos',
      scoreImpact: isCorrect ? 20 : -15,
      evaluationFeedback: feedback + (justification ? ` Justificación: "${justification}"` : ''),
      systemLog: `[CONDUCTA FINAL] Destino: ${selectedDestination}. Procedimiento: ${selectedProcedure || 'N/A'}. Justificación: ${justification}`,
    };
    
    const updatedEvents = [...clinicalActionEvents, finalEvent];
    setClinicalActionEvents(updatedEvents);
    setShowResolutionModal(false);
    
    setSimulationStatus('ANALYZING');
    try {
      const feedbackObj = await generateDebriefFeedback({
        caseTitle: currentCase.title,
        config: {
          specialty: resolvedSimulation?.config?.specialty || 'Cardiología',
          level: level,
          difficulty: difficulty,
          mode: resolvedSimulation?.config?.mode || 'Entrenamiento'
        },
        events: updatedEvents,
        messages: messages,
        timeElapsed: timeElapsed
      });
      setAiFeedback(feedbackObj);
    } catch (err) {
      console.warn('[GuardIA] Error al solicitar debriefing con IA:', err);
    }
    setSimulationStatus('DEBRIEF');
  };

  if (simulationStatus === 'ANALYZING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#05070A] h-screen w-full">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Analizando tu actuación clínica...</h2>
        <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Compilando línea de tiempo y mentor GuardIA</p>
      </div>
    );
  }

  if (simulationStatus === 'DEBRIEF') {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col overflow-hidden">
         <header className="h-14 border-b border-slate-800 flex items-center px-4 bg-[#080C14] shrink-0 z-20">
           <button onClick={onFinish} className="text-slate-400 hover:text-white transition-colors text-sm">
             ← Salir al panel
           </button>
         </header>
         <div className="flex-1 overflow-hidden">
           <DebriefPanel 
              resolvedSimulation={resolvedSimulation}
              currentCase={currentCase}
              events={clinicalActionEvents}
              timeElapsed={timeElapsed}
              interviewTurns={messages.filter(m => m.sender === 'doctor').length}
              aiFeedback={aiFeedback}
              debriefRecommendation={runtime.debriefRecommendation}
              onRetry={() => {
                lastSpokenMessageIdRef.current = null;
                setSimulationStatus('ACTIVE');
                setMessages([{ id: '1', sender: initialSender, text: initialMessageText }]);
                setTimeElapsed(0);
                setClinicalPhase(0);
                setMonitorState('IDLE');
                setCurrentVitals(currentCase.patient.initialVitals);
                setTargetVitals(currentCase.patient.initialVitals);
                setActiveActions([]);
                setClinicalActionEvents([]);
                setAiFeedback(undefined);
                setStudyCaptures([]);
                setActiveCaptureId(null);
                setPendingDoseAction(null);
              }} 
            />
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#05070A] text-slate-200 font-sans overflow-hidden">
      
      {/* Header bar */}
      <header className="h-auto min-h-[3.5rem] py-2 lg:py-0 bg-[#080C14] border-b border-slate-800 flex flex-wrap lg:flex-nowrap items-center justify-between px-4 lg:px-6 flex-shrink-0 gap-2 lg:gap-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0">G</div>
            <span className="text-xl font-semibold tracking-tight text-white hidden sm:inline">Guard<span className="text-indigo-400">IA</span></span>
          </div>
          <div className="h-6 w-px bg-slate-700 mx-1 lg:mx-2 hidden sm:block" />
          <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
            <span className="hidden sm:inline uppercase tracking-widest text-slate-400">Especialidad:</span>
            <span className="font-medium text-slate-300 truncate max-w-[120px] sm:max-w-none">{currentCase.specialty}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-6 ml-auto">
          <div className="flex flex-col items-end hidden sm:flex">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              TIEMPO DE GUARDIA: {formatTime(timeElapsed)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-tighter hidden md:block">Simulación en curso • Nivel {resolvedSimulation?.config?.level || 'Residente'}</div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 sm:hidden">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {formatTime(timeElapsed)}
          </div>
          <button 
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-900/50 px-3 lg:px-4 py-1.5 rounded text-[10px] lg:text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap shrink-0"
          >
            Revisar Caso
          </button>
          <button 
            onClick={handleFinishSimulation}
            className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/50 px-3 lg:px-4 py-1.5 rounded text-[10px] lg:text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap shrink-0"
          >
            Finalizar<span className="hidden sm:inline"> Caso</span>
          </button>
        </div>
      </header>

      {/* Main content layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* CENTER PANEL: Clinical Scene Renderer & Conversation */}
        <section className="flex-1 flex flex-col relative bg-black min-w-[300px]">
          <style>{`
            @keyframes slide-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-ecg-slide { animation: slide-left 2.5s linear infinite; }
            .animate-spo2-slide { animation: slide-left 3.5s linear infinite; }
          `}</style>
          
          {/* The 3D window background (using AI image for now) */}
          <img 
            src={currentCase.sceneUrl || currentCase.patient.avatarUrl} 
            alt="Escena clínica" 
            className={clsx(
              "absolute inset-0 w-full h-full object-cover mix-blend-luminosity transition-all duration-1000",
              clinicalPhase === 3 ? "saturate-0 contrast-150 brightness-75 sepia-[.3] opacity-60" :
              clinicalPhase === 1 ? "saturate-50 contrast-125 brightness-90 sepia-[.2] opacity-70" : 
              clinicalPhase === 2 ? "saturate-75 brightness-95 opacity-80" : "opacity-80"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-[#05070A]/30"></div>
          
          {/* Scene Overlays */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700/50 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] font-mono text-slate-300 tracking-wider">ESCENA CLÍNICA: LISTA</span>
            </div>
            <div className={clsx(
              "bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border text-[10px] font-mono tracking-wider transition-colors duration-500",
              clinicalPhase === 0 ? "border-slate-700/50 text-amber-300" : 
              clinicalPhase === 3 ? "border-red-600/80 text-red-500 animate-bounce" :
              clinicalPhase === 1 ? "border-red-500/50 text-red-400 animate-pulse" : "border-indigo-500/50 text-indigo-300"
            )}>
               ESTADO: {labelClinicalPhase(clinicalPhase, currentCase.patient.initialState)}
            </div>
            {currentCase.patient.companion && (
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700/50 text-[10px] font-mono text-indigo-300 tracking-wider">
                 ACTORES EN ESCENA: 2 (Paciente, {currentCase.patient.companion.role})
              </div>
            )}
            {studyCaptures.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pointer-events-auto max-w-[240px]">
                {studyCaptures.map(capture => (
                    <button
                      key={capture.id}
                      type="button"
                      onClick={() => setActiveCaptureId(capture.id)}
                      className="bg-black/70 border border-slate-600 text-[10px] font-mono text-indigo-200 px-2 py-1 rounded hover:border-indigo-400"
                    >
                      {studyChipLabel(capture.actionId)} {capture.capturedAtFormatted}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Multiparametric Monitor — delante de los textos de escena */}
          <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-4 pointer-events-auto">
            
            {/* Monitor Connecting State */}
            {monitorState === 'CONNECTING' && (
              <div className="w-64 bg-black/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs text-indigo-300 font-mono animate-pulse">Conectando monitor...</p>
                <p className="text-[10px] text-slate-500 font-mono">Calibrando sensores multiparamétricos</p>
              </div>
            )}

            {/* Active Monitor */}
            {monitorState === 'ACTIVE' && (
              <div className="w-72 bg-[#05070A]/95 backdrop-blur-xl border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2 font-mono">
                <div className="flex items-center gap-3 bg-black/50 p-2 rounded border border-slate-800">
                   <div className="flex-1 overflow-hidden h-10 relative">
                      <svg className="w-[200%] h-full animate-ecg-slide stroke-green-500" fill="none" viewBox="0 0 200 40" preserveAspectRatio="none">
                         <path d="M0,20 L20,20 L25,10 L30,35 L35,5 L40,25 L45,20 L100,20 L120,20 L125,10 L130,35 L135,5 L140,25 L145,20 L200,20" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                   </div>
                   <div className="w-16 text-right">
                      <div className="text-[10px] text-green-500 mb-[-4px]">ECG (FC)</div>
                      <div className={clsx("text-2xl font-bold transition-colors", clinicalPhase === 1 ? "text-red-400 animate-pulse" : "text-green-400")}>
                        {currentVitals.hr}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-3 bg-black/50 p-2 rounded border border-slate-800">
                   <div className="flex-1 overflow-hidden h-8 relative">
                      <svg className="w-[200%] h-full animate-spo2-slide stroke-cyan-400" fill="none" viewBox="0 0 200 30" preserveAspectRatio="none">
                         <path d="M0,25 L20,25 C25,25 25,10 30,10 C35,10 35,25 40,25 L100,25 L120,25 C125,25 125,10 130,10 C135,10 135,25 140,25 L200,25" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                   </div>
                   <div className="w-16 text-right">
                      <div className="text-[10px] text-cyan-500 mb-[-4px]">SpO2 %</div>
                      <div className={clsx("text-2xl font-bold transition-colors", clinicalPhase === 1 ? "text-amber-400" : "text-cyan-400")}>
                        {currentVitals.spo2}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-3 bg-black/50 p-2 rounded border border-slate-800">
                   <div className="flex-1">
                      <div className="text-[10px] text-slate-400">PANI (mmHg)</div>
                      <div className="text-xl text-slate-200 font-bold tracking-wider">{currentVitals.bp_sys}/{currentVitals.bp_dia}</div>
                   </div>
                   <div className="w-16 text-right">
                      <div className="text-[10px] text-yellow-500 mb-[-4px]">FR</div>
                      <div className="text-xl text-yellow-400 font-bold">{currentVitals.rr}</div>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Pending Actions Overlay */}
          <div className="absolute left-4 bottom-4 z-[15] flex flex-col gap-2 pointer-events-none">
            {activeActions.filter(a => a.status === 'PENDING').map(action => (
               <div key={action.id} className="bg-indigo-900/80 backdrop-blur border border-indigo-500/50 px-3 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                 <div className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[10px] font-mono text-indigo-100 uppercase tracking-wider">{action.name}</span>
               </div>
            ))}
          </div>

          {/* Chat Overlay / Bottom Sheet — detrás del monitor */}
          <div className={clsx(
            "absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-[#05070A] via-[#05070A]/95 to-transparent flex flex-col z-20",
            (monitorState === 'ACTIVE' || monitorState === 'CONNECTING') && "lg:pr-80"
          )}>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end gap-4 pb-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                      "flex gap-4 items-start",
                      msg.sender === 'doctor' ? "justify-end" : ""
                    )}
                  >
                    {(msg.sender === 'patient' || msg.sender === 'companion') && (
                      <div className="w-8 h-8 rounded-full bg-indigo-900/80 backdrop-blur flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-lg">
                        {msg.sender === 'companion' ? 'Ac.' : 'Pac.'}
                      </div>
                    )}
                    
                    {msg.sender === 'system' ? (
                      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-2 px-4 rounded max-w-[80%] mx-auto my-2 w-full text-center shadow-lg">
                        <p className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">{msg.text}</p>
                      </div>
                    ) : msg.sender === 'doctor' ? (
                      <div className="bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 p-3 rounded-2xl rounded-tr-none max-w-[80%] text-right shadow-lg">
                        <p className="text-sm text-slate-200">{msg.text}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">Ahora</span>
                      </div>
                    ) : (
                      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-lg">
                        <p className="text-sm text-slate-300">{msg.text}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          {msg.sender === 'companion' ? currentCase.patient.companion?.role : 'Paciente'}
                        </span>
                      </div>
                    )}
                    
                    {msg.sender === 'doctor' && (
                      <div className="w-8 h-8 rounded-full bg-slate-700/80 backdrop-blur flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">Dr.</div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-slate-200">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex flex-col bg-[#05070A]/80 backdrop-blur-md shrink-0 border-t border-slate-800/50">
              {currentCase.patient.companion && (
                <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Hablar con:</span>
                  <button 
                    onClick={() => setInterlocutor('patient')}
                    className={clsx(
                      "text-xs px-3 py-1 rounded-full font-medium transition-colors border",
                      interlocutor === 'patient' 
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50" 
                        : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50"
                    )}
                  >
                    Paciente ({currentCase.patient.name})
                  </button>
                  <button 
                    onClick={() => setInterlocutor('companion')}
                    className={clsx(
                      "text-xs px-3 py-1 rounded-full font-medium transition-colors border",
                      interlocutor === 'companion' 
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50" 
                        : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50"
                    )}
                  >
                    Acompañante ({currentCase.patient.companion.role})
                  </button>
                </div>
              )}
              
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-4 px-6 flex gap-3 items-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopPatientSpeech();
                    setIsVoiceOutputEnabled(prev => !prev);
                  }}
                  title={isVoiceOutputEnabled ? "Voz del paciente: Activada (clic para silenciar)" : "Voz del paciente: Silenciada (clic para activar)"}
                  className={clsx(
                    "w-10 h-10 rounded-full transition-all border flex items-center justify-center shrink-0",
                    isVoiceOutputEnabled
                      ? isSpeaking 
                        ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/80 animate-pulse shadow-lg shadow-indigo-500/20"
                        : "bg-slate-800/80 text-indigo-400 border-slate-700/50 hover:bg-slate-700/80 hover:text-indigo-300"
                      : "bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-400"
                  )}
                >
                  {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isRecording ? "Escuchando tu voz... (hablá en español)" : "Escriba su pregunta o hable por el micrófono..."}
                    className={clsx(
                      "w-full backdrop-blur-md border rounded-full py-3 pl-6 pr-12 text-sm text-slate-200 focus:outline-none transition-all shadow-inner",
                      isRecording 
                        ? "bg-indigo-950/40 border-red-500/80 placeholder:text-red-300 animate-pulse" 
                        : "bg-slate-900/80 border-slate-700 focus:border-indigo-500 placeholder:text-slate-500"
                    )}
                  />
                  <button 
                    type="button" 
                    onClick={toggleVoiceRecording}
                    title={isRecording ? "Detener grabación de voz" : "Hablar por micrófono (es-AR)"}
                    className={clsx(
                      "absolute right-3 top-1/2 -translate-y-1/2 transition-all p-2 rounded-full flex items-center justify-center",
                      isRecording 
                        ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 scale-110" 
                        : "text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60"
                    )}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button 
                  type="submit"
                  className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 shrink-0 transition-colors"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Patient Status & Management */}
        <aside className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col bg-[#05070A] shrink-0 h-[50vh] lg:h-auto">
          
          <div className="p-4 flex flex-col gap-5 border-b border-slate-800 bg-[#080C14]">
            {/* Vitals */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center justify-between">
                <span>Signos Vitales</span>
                {monitorState === 'ACTIVE' && <span className="text-green-500 animate-pulse text-[9px] flex items-center gap-1"><Activity className="w-3 h-3"/> EN LÍNEA</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">FC (lpm)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-500 animate-bounce" : clinicalPhase === 1 ? "text-red-400" : "text-orange-400")}>{currentVitals.hr}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">TA (mmHg)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-500 animate-bounce" : clinicalPhase === 1 ? "text-red-400" : "text-orange-400")}>{currentVitals.bp_sys}/{currentVitals.bp_dia}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">SatO2 (%)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-400" : clinicalPhase === 1 ? "text-amber-400" : "text-green-400")}>{currentVitals.spo2}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-500 mb-0.5 uppercase">FR (rpm)</div>
                  <div className={clsx("text-xl font-bold transition-colors", clinicalPhase === 3 ? "text-red-400" : clinicalPhase === 1 ? "text-amber-400" : "text-green-400")}>{currentVitals.rr}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ACCIONES CLÍNICAS DINÁMICAS */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 bg-slate-900/50 flex items-center gap-2 border-b border-slate-800 shrink-0">
               <AlertTriangle className="w-4 h-4 text-indigo-400" />
               <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Acciones Clínicas</span>
            </div>

            {/* Categorías (Navegación por Pestañas) */}
            <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950 border-b border-slate-800 shrink-0">
              {([
                { id: 'EVALUATION', shortLabel: 'Evaluar', icon: Eye },
                { id: 'MONITORING_SUPPORT', shortLabel: 'Soporte', icon: Wind },
                { id: 'STUDIES', shortLabel: 'Estudios', icon: Activity },
                { id: 'TREATMENT', shortLabel: 'Tratar', icon: Pill },
                { id: 'ESCALATION', shortLabel: 'Ayuda', icon: PhoneCall },
                { id: 'DISPOSITION', shortLabel: 'Destino', icon: ShieldAlert }
              ] as { id: ClinicalActionCategory; shortLabel: string; icon: any }[]).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={clsx(
                    "px-1 py-1.5 rounded text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all border",
                    selectedCategory === cat.id
                      ? "bg-indigo-600/25 border-indigo-500/80 text-indigo-300 shadow-md shadow-indigo-500/10"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900"
                  )}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span className="truncate text-[9px]">{cat.shortLabel}</span>
                </button>
              ))}
            </div>
            
            {/* Listado de Acciones por Categoría */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
               {clinicalActionsCatalog
                 .filter(action => action.category === selectedCategory)
                 .map(action => {
                   const isExecuting = activeActions.some(a => a.id.startsWith(action.id + '_') && a.status === 'PENDING');
                   const isCompleted = clinicalActionEvents.some(e => e.actionId === action.id && e.status === 'COMPLETED');
                   
                   // Helper inline para iconos
                   const getActionIconComponent = (name?: string) => {
                     switch (name) {
                       case 'Eye': return Eye;
                       case 'Stethoscope': return Stethoscope;
                       case 'Brain': return Brain;
                       case 'ClipboardList': return ClipboardList;
                       case 'Activity': return Activity;
                       case 'Wind': return Wind;
                       case 'Droplets': return Droplets;
                       case 'PhoneCall': return PhoneCall;
                       case 'TestTube': return TestTube;
                       case 'Pill': return Pill;
                       case 'Users': return Users;
                       case 'ShieldAlert': return ShieldAlert;
                       default: return Activity;
                     }
                   };
                   const IconComponent = getActionIconComponent(action.iconName);

                   return (
                     <button 
                       key={action.id}
                       type="button"
                       disabled={isExecuting}
                       onClick={() => executeClinicalAction(action)}
                       className={clsx(
                         "w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 group text-xs",
                         isExecuting 
                           ? "bg-indigo-950/40 border-indigo-500/80 animate-pulse cursor-wait" 
                           : isCompleted 
                             ? "bg-slate-900/60 border-slate-700/60 hover:border-indigo-500/60 text-slate-200" 
                             : "bg-slate-900/40 border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-900/20 text-slate-300 hover:text-white"
                       )}
                     >
                       <div className="flex items-center justify-between w-full">
                         <div className="flex items-center gap-2 font-bold text-slate-200 group-hover:text-white">
                           <IconComponent className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                           <span>{action.label}</span>
                         </div>
                         <div className="flex items-center gap-1.5 shrink-0">
                           {isExecuting ? (
                             <span className="text-[10px] font-mono text-indigo-300 flex items-center gap-1">
                               <div className="w-2.5 h-2.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                               {(action.executionTimeMs / 1000)}s
                             </span>
                           ) : isCompleted ? (
                             <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                               <CheckCircle2 className="w-2.5 h-2.5" /> {isVisualStudy(action.id) ? 'Repetir' : action.doseOptions?.length ? 'Otra dosis' : 'Listo'}
                             </span>
                             ) : (
                             <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                               {action.doseOptions?.length ? 'Dosis' : `${action.executionTimeMs / 1000}s`}
                             </span>
                           )}
                         </div>
                       </div>
                       <p className="text-[11px] text-slate-400 leading-snug">{action.description}</p>
                     </button>
                   );
                 })}
            </div>
          </div>
        </aside>

      </div>
      
      {/* Footer bar */}
      <footer className="h-16 border-t border-slate-800 px-6 flex items-center gap-4 bg-[#05070A] shrink-0">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest w-32 shrink-0">Diagnóstico diferencial:</div>
        <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide items-center">
          <button className="border border-dashed border-slate-700 px-4 py-1.5 rounded-full text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors whitespace-nowrap">
            + Agregar Hipótesis
          </button>
        </div>
        <div className="w-56 flex justify-end gap-3 items-center shrink-0 border-l border-slate-800 pl-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Plan Activo</div>
            <div className="text-xs text-indigo-400 font-medium">Evaluación Inicial</div>
          </div>
          <div className="w-1.5 h-8 bg-slate-800 rounded-full"></div>
        </div>
      </footer>

      {/* CASE RESOLUTION MODAL */}
      <AnimatePresence>
        {showResolutionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResolutionModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl bg-[#080C14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col font-sans"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                    Cierre del Caso y Conducta Definitiva
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                    Caso: {currentCase.patient.name} • Dificultad: {resolvedSimulation?.config?.difficulty || 'Intermedia'} • Nivel: {resolvedSimulation?.config?.level || 'Residente'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowResolutionModal(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
                {/* 1. Destination (For everyone) */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    {getResolutionOptions(getResolutionTrack(currentCase)).destLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getResolutionOptions(getResolutionTrack(currentCase)).destinations.map(dest => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => setSelectedDestination(dest.id)}
                        className={clsx(
                          "p-3 rounded-xl border text-left transition-all hover:bg-slate-900/60 flex flex-col gap-0.5",
                          selectedDestination === dest.id
                            ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5"
                            : "bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700"
                        )}
                      >
                        <span className="font-bold text-xs uppercase text-slate-200">{dest.title}</span>
                        <span className="text-[11px] text-slate-500 leading-snug">{dest.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Procedure (Only for Resident/Med/Spec) */}
                {['Residente', 'Médico', 'Especialista'].includes(resolvedSimulation?.config?.level || 'Residente') && (
                  <div className="space-y-3 border-t border-slate-800/80 pt-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      {getResolutionOptions(getResolutionTrack(currentCase)).procLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {getResolutionOptions(getResolutionTrack(currentCase)).procedures.map(proc => (
                        <button
                          key={proc.id}
                          type="button"
                          onClick={() => setSelectedProcedure(proc.id)}
                          className={clsx(
                            "w-full p-3 rounded-xl border text-left transition-all hover:bg-slate-900/60 flex flex-col gap-0.5",
                            selectedProcedure === proc.id
                              ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5"
                              : "bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <span className="font-bold text-xs uppercase text-slate-200">{proc.title}</span>
                          <span className="text-[11px] text-slate-500 leading-snug">{proc.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Justification (Only for Resident/Med/Spec) */}
                {['Residente', 'Médico', 'Especialista'].includes(resolvedSimulation?.config?.level || 'Residente') && (
                  <div className="space-y-2 border-t border-slate-800/80 pt-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      3. Justificación Clínica y Plan de Cuidados
                    </label>
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder={getResolutionOptions(getResolutionTrack(currentCase)).justPlaceholder}
                      rows={3}
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResolutionModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResolution}
                  disabled={
                    !selectedDestination || 
                    (['Residente', 'Médico', 'Especialista'].includes(resolvedSimulation?.config?.level || 'Residente') && !selectedProcedure)
                  }
                  className={clsx(
                    "px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all",
                    (!selectedDestination || (['Residente', 'Médico', 'Especialista'].includes(resolvedSimulation?.config?.level || 'Residente') && !selectedProcedure))
                      ? "bg-slate-800 text-slate-600 border border-slate-700/60 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                  )}
                >
                  Confirmar y Finalizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(() => {
          const capture = studyCaptures.find(c => c.id === activeCaptureId);
          const spec = capture ? getStudyVisualSpec(currentCase.id, capture.actionId, capture.stage) : null;
          if (!capture || !spec) return null;
          return (
            <StudyViewerModal
              spec={spec}
              patientName={currentCase.patient.name}
              patientAge={currentCase.patient.age}
              ageUnit={currentCase.patient.ageUnit}
              recordedAt={capture.capturedAtFormatted}
              onClose={() => setActiveCaptureId(null)}
            />
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDoseAction && (
          <DosePickerModal
            action={pendingDoseAction}
            onSelect={(dose) => {
              const selectedAction = pendingDoseAction;
              setPendingDoseAction(null);
              executeClinicalAction(selectedAction, dose);
            }}
            onClose={() => setPendingDoseAction(null)}
          />
        )}
      </AnimatePresence>

      {/* CASE AUDIT & CLINICAL REVIEW MODAL */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl bg-[#080C14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col font-sans"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-400" />
                    Auditoría y Revisión Activa del Caso
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                    Paciente: {currentCase.patient.name} • {currentCase.patient.age} años • Sexo {currentCase.patient.gender === 'M' ? 'Masc' : 'Fem'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Patient Profile & History */}
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Historia Clínica y Antecedentes</h4>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-200">Paciente:</span> {currentCase.patient.name} · {currentCase.patient.age} {currentCase.patient.ageUnit || 'años'}
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-200">Motivo de consulta:</span> {currentCase.patient.reasonForConsultation}
                      </p>
                      <p className="leading-relaxed whitespace-pre-line text-slate-400">
                        {(currentCase.patient.clinicalHistory || 'Sin historia clínica detallada cargada en este caso.')
                          .replace(/^HISTORIA CLÍNICA DEL CASO[^\n]*\n?/i, '')
                          .trim()}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Estado Hemodinámico Actual</h4>
                      <div className="grid grid-cols-2 gap-2 text-center text-slate-200">
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[8px] text-slate-500 uppercase">Frec. Cardíaca</div>
                          <div className="text-base font-bold text-orange-400 font-mono">{currentVitals.hr} lpm</div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[8px] text-slate-500 uppercase">Presión Arterial</div>
                          <div className="text-base font-bold text-orange-400 font-mono">{currentVitals.bp_sys}/{currentVitals.bp_dia}</div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[8px] text-slate-500 uppercase">Sat. Oxígeno</div>
                          <div className="text-base font-bold text-green-400 font-mono">{currentVitals.spo2}%</div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[8px] text-slate-500 uppercase">Frec. Resp.</div>
                          <div className="text-base font-bold text-cyan-400 font-mono">{currentVitals.rr} rpm</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions and Treatments Audit */}
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2.5 flex flex-col h-full max-h-[350px]">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Intervenciones Realizadas ({clinicalActionEvents.length})</h4>
                      <div className="overflow-y-auto space-y-2 pr-1 flex-1">
                        {clinicalActionEvents.length === 0 ? (
                          <p className="text-slate-500 text-center py-8">No se han registrado acciones aún.</p>
                        ) : (
                          clinicalActionEvents.map((evt, index) => (
                            <div key={evt.id || index} className="p-2 bg-slate-900/40 rounded border border-slate-800/80 flex items-center justify-between gap-3">
                              <div>
                                <div className="font-bold text-slate-200 text-[11px]">{evt.label}</div>
                                <div className="text-[9px] text-slate-500 font-mono">Ejecutado a las: {evt.executedAtFormatted}</div>
                              </div>
                              <span className={clsx(
                                "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0",
                                evt.safetyGrade === 'OPTIMAL' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                                evt.safetyGrade === 'APPROPRIATE' && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                                evt.safetyGrade === 'POTENTIALLY_UNSAFE' && "bg-red-500/10 text-red-400 border border-red-500/20",
                                !evt.safetyGrade && "bg-slate-800 text-slate-400"
                              )}>
                                {labelSafetyGrade(evt.safetyGrade)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/15 transition-all"
                >
                  Entendido / Volver al Caso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
