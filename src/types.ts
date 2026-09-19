export type AppState = 'login' | 'dashboard' | 'new-shift' | 'waiting-cases' | 'simulator' | 'evaluation' | 'library' | 'case-studio' | 'analytics' | 'knowledge-base' | 'actors' | 'environments' | 'simulations' | 'stats' | 'ranking' | 'history' | 'training' | 'admin-users' | 'admin-settings';

export interface User {
  id: string;
  name: string;
  role: string;
  level: string;
  xp: number;
  avatarUrl?: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  logoUrl?: string;
  country?: string;
  locale?: string;
}

export interface VitalSigns {
  hr: number; // Heart rate
  bp_sys: number;
  bp_dia: number;
  rr: number; // Respiratory rate
  spo2: number;
  temp: number;
}

export type ClinicalState = 'NORMAL' | 'DOLOR_LEVE' | 'DOLOR_MODERADO' | 'DOLOR_SEVERO' | 'ANSIEDAD' | 'DISNEA_LEVE' | 'DISNEA_MODERADA' | 'DISNEA_SEVERA' | 'SOMNOLENCIA' | 'CONFUSION' | 'AGITACION' | 'DETERIORO' | 'CRITICO' | 'INCONSCIENTE';

export interface VirtualActor {
  id: string;
  nameCode: string; // e.g. MALE_60_75_01
  ageRange: string;
  gender: 'M' | 'F' | 'O';
  visualUrl: string;
}

export interface ClinicalEnvironment {
  id: string;
  name: string;
  type: 'CONSULTORIO' | 'BOX_GUARDIA' | 'SHOCK_ROOM' | 'SALA_INTERNACION' | 'PEDIATRIA' | 'TRIAGE';
  bgUrl: string;
  backgroundImageUrl?: string;
  description?: string;
  acousticProfile?: {
    ambientNoiseLevel: string;
    reverbLevel: string;
  };
}

export interface VoiceProfile {
  id: string;
  language: string;
  locale: string;
  accent: string;
}

export interface Companion {
  role: 'Madre' | 'Padre' | 'Tutor' | 'Familiar';
  name: string;
  actorId: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  ageUnit?: 'años' | 'meses' | 'días';
  gender: 'M' | 'F' | 'O';
  reasonForConsultation: string;
  initialVitals: VitalSigns;
  avatarUrl?: string;
  actorId?: string;
  companion?: Companion;
  initialState?: ClinicalState;
  clinicalHistory?: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  specialty: string;
  difficulty: 'Fácil' | 'Intermedia' | 'Difícil' | 'Crítica';
  duration: number; // minutes
  patient: Patient;
  environmentId?: string;
  sceneUrl?: string;
  isCompleted?: boolean;
  score?: number;
  status?: 'BORRADOR_IA' | 'PENDIENTE_VALIDACION' | 'VALIDADO';
  version?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient' | 'companion' | 'system';
  text: string;
  timestamp: Date;
}

export interface SimulationConfig {
  specialty: string;
  level: string;
  difficulty: string;
  mode: string;
}

export interface ResolvedSimulation {
  baseCase: ClinicalCase;
  config: SimulationConfig;
  deteriorationMultiplier: number;
  assistanceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  initialVitalsOverride?: VitalSigns;
  systemPromptModifier: string;
}

export type ClinicalActionCategory = 
  | 'EVALUATION' 
  | 'MONITORING_SUPPORT' 
  | 'STUDIES' 
  | 'TREATMENT' 
  | 'ESCALATION' 
  | 'DISPOSITION';

export type SafetyGrade = 
  | 'OPTIMAL' 
  | 'APPROPRIATE' 
  | 'LATE' 
  | 'UNNECESSARY' 
  | 'INAPPROPRIATE' 
  | 'POTENTIALLY_UNSAFE';

export type DoseEffect = 'THERAPEUTIC' | 'SUBTHERAPEUTIC' | 'TOXIC';

export interface MedicationDoseOption {
  id: string;
  label: string;
  effect: DoseEffect;
  safetyGrade?: SafetyGrade;
  scoreImpact?: number;
  evaluationFeedback?: string;
  systemLogMessage?: string;
}

export interface ClinicalAction {
  id: string;
  category: ClinicalActionCategory;
  label: string;
  description: string;
  iconName?: string;
  executionTimeMs: number; // Simulated duration in ms
  availableFromPhase?: number;
  availableUntilPhase?: number;
  specialty?: string[];
  trainingLevel?: ('Estudiante' | 'Internado' | 'Residente' | 'Médico')[];
  effectMessage?: string;
  patientFeedbackMessage?: string;
  systemLogMessage?: string;
  safetyGrade?: SafetyGrade;
  evaluationCompetency?: string;
  scoreImpact?: number;
  evaluationFeedback?: string;
  doseOptions?: MedicationDoseOption[];
}

export interface ClinicalActionEvent {
  id: string;
  actionId: string;
  label: string;
  category: ClinicalActionCategory;
  executedAtSeconds: number;
  executedAtFormatted: string; // e.g. "04:12"
  clinicalPhase: number;
  vitalSnapshot: VitalSigns;
  status: 'PENDING' | 'COMPLETED';
  completedAtSeconds?: number;
  safetyGrade?: SafetyGrade;
  evaluationCompetency?: string;
  scoreImpact?: number;
  evaluationFeedback?: string;
  systemLog?: string;
  selectedDoseId?: string;
  selectedDoseLabel?: string;
  doseEffect?: DoseEffect;
}

export interface DebriefFeedback {
  strengths: string;
  improvements: string;
  criticalMoment: string;
  recommendation: string;
}

