import { STUDY_IMAGES, StudyImageKey } from './studyAssets';

export const VISUAL_STUDY_IDS = [
  'ECG',
  'RX_TORAX',
  'TC_CRANEO',
  'TAC_TRAUMA',
  'ECO_POCUS',
  'LAB',
  'GLUCEMIA',
] as const;

export type VisualStudyId = (typeof VISUAL_STUDY_IDS)[number];
export type StudyStage = 'acute' | 'improved';

export interface LabRow {
  test: string;
  result: string;
  unit: string;
  ref: string;
}

export interface StudyVisualSpec {
  actionId: VisualStudyId;
  title: string;
  techLine: string;
  imageSrc?: string;
  imageAlt?: string;
  lab?: LabRow[];
  glucoseMgDl?: number;
}

export interface StudyStageContext {
  clinicalPhase: number;
  completedActionIds: string[];
}

export function isVisualStudy(actionId: string): actionId is VisualStudyId {
  return (VISUAL_STUDY_IDS as readonly string[]).includes(actionId);
}

export function getStudyReadyMessage(actionId: string, label: string): string {
  switch (actionId) {
    case 'ECG':
      return 'ECG de 12 derivaciones impreso. Interpretá el trazado.';
    case 'RX_TORAX':
      return 'Placa de tórax en negatoscopio. Interpretá la radiografía.';
    case 'TC_CRANEO':
      return 'TC de cerebro en consola. Interpretá los cortes.';
    case 'TAC_TRAUMA':
      return 'TAC de trauma en consola. Interpretá los cortes.';
    case 'ECO_POCUS':
      return 'Ecografía a pie de cama. Interpretá la imagen.';
    case 'LAB':
      return 'Laboratorio de guardia impreso. Interpretá los valores.';
    case 'GLUCEMIA':
      return 'Glucómetro a pie de cama. Leé el valor.';
    default:
      return `${label} disponible.`;
  }
}

const RECOVERY_ACTIONS: Record<string, string[]> = {
  'c-1': ['ASPIRINA', 'HEPARINA', 'CLOPIDOGREL', 'O2', 'NITRO'],
  'c-18': ['ASPIRINA', 'HEPARINA', 'CLOPIDOGREL', 'FLUIDOS'],
  'c-6': ['BETABLOQUEADOR', 'CARDIOCONVERSION', 'SEDACION'],
  'c-7': ['FUROSEMIDA', 'POSICION_FOWLER', 'O2'],
  'c-12': ['FLUIDOS', 'INSULINA_IV', 'K_IV', 'EXPANSION_AGRESIVA'],
  'c-16': ['FLUIDOS', 'INSULINA_IV', 'K_IV'],
  'c-10': ['ADRENALINA_IM', 'O2', 'VIA_AEREA'],
  'c-13': ['FLUIDOS', 'EXPANSION_AGRESIVA', 'ATB_NO_PENICILINA', 'ANTIBIOTICOS_IV', 'NORADRENALINA'],
  'c-2': ['CONTROL_HEMORRAGIA', 'HEMODERIVADOS', 'EXPANSION_AGRESIVA', 'FLUIDOS'],
  'c-9': ['CONTROL_HEMORRAGIA', 'HEMODERIVADOS', 'EXPANSION_AGRESIVA'],
  'c-100': ['FLUIDOS', 'PARACETAMOL'],
  'c-3': ['PARACETAMOL', 'FLUIDOS'],
  'c-5': ['ANTIBIOTICOS_IV', 'FLUIDOS', 'PARACETAMOL'],
  'c-8': ['DERIVACION_QUIRURGICA'],
  'c-11': ['FLUIDOS', 'ANTIBIOTICOS_IV'],
  'c-14': ['NITRO', 'BETABLOQUEADOR'],
  'c-17': ['ANTIBIOTICOS_IV', 'FLUIDOS', 'PARACETAMOL'],
  'c-15': ['BETABLOQUEADOR', 'NITRO'],
};

export function resolveStudyStage(caseId: string, ctx: StudyStageContext): StudyStage {
  if (ctx.clinicalPhase === 2) return 'improved';
  if (ctx.clinicalPhase === 1 || ctx.clinicalPhase === 3) return 'acute';
  const keys = RECOVERY_ACTIONS[caseId] || [];
  if (keys.some(id => ctx.completedActionIds.includes(id))) return 'improved';
  return 'acute';
}

const DEFAULT_LAB: LabRow[] = [
  { test: 'Hemoglobina', result: '13.8', unit: 'g/dL', ref: '13.0–17.0' },
  { test: 'Leucocitos', result: '7.400', unit: '/mm³', ref: '4.500–11.000' },
  { test: 'Creatinina', result: '0.9', unit: 'mg/dL', ref: '0.6–1.2' },
  { test: 'Potasio', result: '4.1', unit: 'mEq/L', ref: '3.5–5.1' },
  { test: 'Glucemia', result: '98', unit: 'mg/dL', ref: '70–100' },
  { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
];

interface CaseVisuals {
  ecg: Record<StudyStage, StudyImageKey>;
  rx: Record<StudyStage, StudyImageKey>;
  brain: Record<StudyStage, StudyImageKey>;
  trauma: Record<StudyStage, StudyImageKey>;
  pocus: Record<StudyStage, StudyImageKey>;
  lab: Record<StudyStage, LabRow[]>;
  glucose: Record<StudyStage, number>;
}

const CASE_VISUALS: Record<string, CaseVisuals> = {
  'c-1': {
    ecg: { acute: 'ecg-stemi-anterior', improved: 'ecg-stemi-anterior-evolved' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 108, improved: 104 },
    lab: {
      acute: [
        { test: 'Hemoglobina', result: '14.2', unit: 'g/dL', ref: '13.0–17.0' },
        { test: 'Creatinina', result: '1.0', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Potasio', result: '4.2', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'CPK', result: '340', unit: 'U/L', ref: '30–200' },
        { test: 'Troponina T us', result: '0.080', unit: 'ng/mL', ref: '<0.014' },
      ],
      improved: [
        { test: 'Hemoglobina', result: '14.1', unit: 'g/dL', ref: '13.0–17.0' },
        { test: 'Creatinina', result: '1.0', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Potasio', result: '4.0', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'CPK', result: '410', unit: 'U/L', ref: '30–200' },
        { test: 'Troponina T us', result: '0.210', unit: 'ng/mL', ref: '<0.014' },
      ],
    },
  },
  'c-18': {
    ecg: { acute: 'ecg-stemi-inferior', improved: 'ecg-stemi-inferior' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 168, improved: 142 },
    lab: {
      acute: [
        { test: 'Troponina T us', result: '0.210', unit: 'ng/mL', ref: '<0.014' },
        { test: 'CPK', result: '520', unit: 'U/L', ref: '30–200' },
        { test: 'Creatinina', result: '1.1', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Glucemia', result: '168', unit: 'mg/dL', ref: '70–100' },
      ],
      improved: [
        { test: 'Troponina T us', result: '0.480', unit: 'ng/mL', ref: '<0.014' },
        { test: 'CPK', result: '690', unit: 'U/L', ref: '30–200' },
        { test: 'Creatinina', result: '1.1', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Glucemia', result: '142', unit: 'mg/dL', ref: '70–100' },
      ],
    },
  },
  'c-6': {
    ecg: { acute: 'ecg-af-rvr', improved: 'ecg-af-controlled' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 96, improved: 94 },
    lab: {
      acute: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Potasio', result: '4.0', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'Creatinina', result: '0.9', unit: 'mg/dL', ref: '0.6–1.2' },
      ],
      improved: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Potasio', result: '4.1', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'Creatinina', result: '0.9', unit: 'mg/dL', ref: '0.6–1.2' },
      ],
    },
  },
  'c-7': {
    ecg: { acute: 'ecg-lvh', improved: 'ecg-lvh' },
    rx: { acute: 'rx-edema', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-blines', improved: 'us-blines' },
    glucose: { acute: 124, improved: 118 },
    lab: {
      acute: [
        { test: 'Troponina T us', result: '0.018', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Creatinina', result: '1.3', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Sodio', result: '134', unit: 'mEq/L', ref: '135–145' },
      ],
      improved: [
        { test: 'Troponina T us', result: '0.016', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Creatinina', result: '1.4', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Sodio', result: '136', unit: 'mEq/L', ref: '135–145' },
      ],
    },
  },
  'c-4': {
    ecg: { acute: 'ecg-sinus-brady', improved: 'ecg-sinus-brady' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-sah', improved: 'ct-sah' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 118, improved: 110 },
    lab: {
      acute: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Leucocitos', result: '9.800', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'Creatinina', result: '0.9', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Potasio', result: '4.0', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
      improved: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Leucocitos', result: '9.600', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'Creatinina', result: '0.9', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Potasio', result: '4.0', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
    },
  },
  'c-2': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-ribs', improved: 'rx-ribs' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'ct-abdomen-trauma', improved: 'ct-abdomen-trauma' },
    pocus: { acute: 'us-fast-fluid', improved: 'us-fast-fluid' },
    glucose: { acute: 142, improved: 128 },
    lab: {
      acute: [
        { test: 'Hemoglobina', result: '9.4', unit: 'g/dL', ref: '12.0–16.0' },
        { test: 'Lactato', result: '3.8', unit: 'mmol/L', ref: '0.5–2.0' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
      ],
      improved: [
        { test: 'Hemoglobina', result: '10.6', unit: 'g/dL', ref: '12.0–16.0' },
        { test: 'Lactato', result: '2.1', unit: 'mmol/L', ref: '0.5–2.0' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
      ],
    },
  },
  'c-15': {
    ecg: { acute: 'ecg-lvh', improved: 'ecg-lvh' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'ct-aortic', improved: 'ct-aortic' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 112, improved: 108 },
    lab: {
      acute: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Creatinina', result: '1.2', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Hemoglobina', result: '14.0', unit: 'g/dL', ref: '13.0–17.0' },
      ],
      improved: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Creatinina', result: '1.2', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Hemoglobina', result: '13.9', unit: 'g/dL', ref: '13.0–17.0' },
      ],
    },
  },
  'c-12': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 428, improved: 246 },
    lab: {
      acute: [
        { test: 'Glucemia', result: '428', unit: 'mg/dL', ref: '70–100' },
        { test: 'Cetonas', result: '+++', unit: '', ref: 'Negativas' },
        { test: 'Potasio', result: '5.1', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'HCO3', result: '8', unit: 'mEq/L', ref: '22–26' },
      ],
      improved: [
        { test: 'Glucemia', result: '246', unit: 'mg/dL', ref: '70–100' },
        { test: 'Cetonas', result: '++', unit: '', ref: 'Negativas' },
        { test: 'Potasio', result: '4.4', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'HCO3', result: '14', unit: 'mEq/L', ref: '22–26' },
      ],
    },
  },
  'c-16': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 396, improved: 228 },
    lab: {
      acute: [
        { test: 'Glucemia', result: '396', unit: 'mg/dL', ref: '70–100' },
        { test: 'Cetonas', result: '+++', unit: '', ref: 'Negativas' },
        { test: 'Potasio', result: '5.0', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
      improved: [
        { test: 'Glucemia', result: '228', unit: 'mg/dL', ref: '70–100' },
        { test: 'Cetonas', result: '+', unit: '', ref: 'Negativas' },
        { test: 'Potasio', result: '4.3', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
    },
  },
  'c-17': {
    ecg: { acute: 'ecg-sinus', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-gallbladder', improved: 'us-gallbladder' },
    glucose: { acute: 104, improved: 102 },
    lab: {
      acute: [
        { test: 'Leucocitos', result: '13.100', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'PCR', result: '48', unit: 'mg/L', ref: '<5' },
        { test: 'FA', result: '220', unit: 'U/L', ref: '40–129' },
        { test: 'Bilirrubina', result: '1.8', unit: 'mg/dL', ref: '0.2–1.2' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
      ],
      improved: [
        { test: 'Leucocitos', result: '12.400', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'PCR', result: '42', unit: 'mg/L', ref: '<5' },
        { test: 'FA', result: '210', unit: 'U/L', ref: '40–129' },
        { test: 'Bilirrubina', result: '1.7', unit: 'mg/dL', ref: '0.2–1.2' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
      ],
    },
  },
  'c-100': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 92, improved: 96 },
    lab: {
      acute: [
        { test: 'Leucocitos', result: '11.800', unit: '/mm³', ref: '6.000–17.000' },
        { test: 'PCR', result: '28', unit: 'mg/L', ref: '<5' },
        { test: 'Glucemia', result: '92', unit: 'mg/dL', ref: '70–100' },
        { test: 'Sodio', result: '138', unit: 'mEq/L', ref: '135–145' },
        { test: 'Potasio', result: '4.0', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
      improved: [
        { test: 'Leucocitos', result: '10.400', unit: '/mm³', ref: '6.000–17.000' },
        { test: 'PCR', result: '22', unit: 'mg/L', ref: '<5' },
        { test: 'Glucemia', result: '96', unit: 'mg/dL', ref: '70–100' },
        { test: 'Sodio', result: '139', unit: 'mEq/L', ref: '135–145' },
        { test: 'Potasio', result: '4.1', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
    },
  },
  'c-8': {
    ecg: { acute: 'ecg-sinus', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-tibia', improved: 'rx-tibia' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 101, improved: 99 },
    lab: {
      acute: [
        { test: 'CPK', result: '620', unit: 'U/L', ref: '30–200' },
        { test: 'Potasio', result: '4.4', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'Creatinina', result: '0.9', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
      ],
      improved: [
        { test: 'CPK', result: '580', unit: 'U/L', ref: '30–200' },
        { test: 'Potasio', result: '4.3', unit: 'mEq/L', ref: '3.5–5.1' },
        { test: 'Creatinina', result: '0.9', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
      ],
    },
  },
  'c-9': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-tibia', improved: 'rx-tibia' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 128, improved: 110 },
    lab: {
      acute: [
        { test: 'Hemoglobina', result: '10.1', unit: 'g/dL', ref: '12.0–16.0' },
        { test: 'Lactato', result: '2.9', unit: 'mmol/L', ref: '0.5–2.0' },
      ],
      improved: [
        { test: 'Hemoglobina', result: '11.2', unit: 'g/dL', ref: '12.0–16.0' },
        { test: 'Lactato', result: '1.8', unit: 'mmol/L', ref: '0.5–2.0' },
      ],
    },
  },
  'c-3': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 88, improved: 92 },
    lab: {
      acute: [
        { test: 'Leucocitos', result: '12.800', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'PCR', result: '28', unit: 'mg/L', ref: '<5' },
        { test: 'Glucemia', result: '88', unit: 'mg/dL', ref: '70–100' },
      ],
      improved: [
        { test: 'Leucocitos', result: '11.200', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'PCR', result: '24', unit: 'mg/L', ref: '<5' },
        { test: 'Glucemia', result: '92', unit: 'mg/dL', ref: '70–100' },
      ],
    },
  },
  'c-5': {
    ecg: { acute: 'ecg-sinus', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-appendix', improved: 'us-appendix' },
    glucose: { acute: 102, improved: 98 },
    lab: {
      acute: [
        { test: 'Leucocitos', result: '14.600', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'PCR', result: '42', unit: 'mg/L', ref: '<5' },
        { test: 'β-hCG', result: 'Negativa', unit: '', ref: 'Negativa' },
      ],
      improved: [
        { test: 'Leucocitos', result: '13.100', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'PCR', result: '38', unit: 'mg/L', ref: '<5' },
        { test: 'β-hCG', result: 'Negativa', unit: '', ref: 'Negativa' },
      ],
    },
  },
  'c-10': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 118, improved: 104 },
    lab: {
      acute: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Leucocitos', result: '9.200', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'Potasio', result: '4.1', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
      improved: [
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Leucocitos', result: '8.800', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'Potasio', result: '4.0', unit: 'mEq/L', ref: '3.5–5.1' },
      ],
    },
  },
  'c-11': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-gallbladder', improved: 'us-gallbladder' },
    glucose: { acute: 132, improved: 118 },
    lab: {
      acute: [
        { test: 'Lipasa', result: '1240', unit: 'U/L', ref: '13–60' },
        { test: 'Amilasa', result: '680', unit: 'U/L', ref: '30–110' },
        { test: 'Leucocitos', result: '13.900', unit: '/mm³', ref: '4.500–11.000' },
      ],
      improved: [
        { test: 'Lipasa', result: '860', unit: 'U/L', ref: '13–60' },
        { test: 'Amilasa', result: '410', unit: 'U/L', ref: '30–110' },
        { test: 'Leucocitos', result: '11.800', unit: '/mm³', ref: '4.500–11.000' },
      ],
    },
  },
  'c-13': {
    ecg: { acute: 'ecg-sinus-tach', improved: 'ecg-sinus' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 186, improved: 142 },
    lab: {
      acute: [
        { test: 'Leucocitos', result: '18.200', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'Lactato', result: '4.1', unit: 'mmol/L', ref: '0.5–2.0' },
        { test: 'Creatinina', result: '1.8', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'PCR', result: '186', unit: 'mg/L', ref: '<5' },
      ],
      improved: [
        { test: 'Leucocitos', result: '14.600', unit: '/mm³', ref: '4.500–11.000' },
        { test: 'Lactato', result: '2.4', unit: 'mmol/L', ref: '0.5–2.0' },
        { test: 'Creatinina', result: '1.5', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'PCR', result: '142', unit: 'mg/L', ref: '<5' },
      ],
    },
  },
  'c-14': {
    ecg: { acute: 'ecg-lvh', improved: 'ecg-lvh' },
    rx: { acute: 'rx-normal', improved: 'rx-normal' },
    brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
    trauma: { acute: 'rx-normal', improved: 'rx-normal' },
    pocus: { acute: 'us-echo', improved: 'us-echo' },
    glucose: { acute: 110, improved: 106 },
    lab: {
      acute: [
        { test: 'Creatinina', result: '1.4', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Hemoglobina', result: '14.6', unit: 'g/dL', ref: '13.0–17.0' },
      ],
      improved: [
        { test: 'Creatinina', result: '1.3', unit: 'mg/dL', ref: '0.6–1.2' },
        { test: 'Troponina T us', result: '<0.010', unit: 'ng/mL', ref: '<0.014' },
        { test: 'Hemoglobina', result: '14.5', unit: 'g/dL', ref: '13.0–17.0' },
      ],
    },
  },
};

const FALLBACK: CaseVisuals = {
  ecg: { acute: 'ecg-sinus', improved: 'ecg-sinus' },
  rx: { acute: 'rx-normal', improved: 'rx-normal' },
  brain: { acute: 'ct-brain-normal', improved: 'ct-brain-normal' },
  trauma: { acute: 'rx-normal', improved: 'rx-normal' },
  pocus: { acute: 'us-echo', improved: 'us-echo' },
  lab: { acute: DEFAULT_LAB, improved: DEFAULT_LAB },
  glucose: { acute: 98, improved: 96 },
};

function visualsFor(caseId: string): CaseVisuals {
  return CASE_VISUALS[caseId] || FALLBACK;
}

function img(key: StudyImageKey): string {
  return STUDY_IMAGES[key];
}

export function getStudyVisualSpec(
  caseId: string,
  actionId: string,
  stage: StudyStage = 'acute'
): StudyVisualSpec | null {
  if (!isVisualStudy(actionId)) return null;
  const v = visualsFor(caseId);

  switch (actionId) {
    case 'ECG':
      return {
        actionId,
        title: 'Electrocardiograma de 12 derivaciones',
        techLine: '25 mm/s  ·  10 mm/mV  ·  Registro de guardia',
        imageSrc: img(v.ecg[stage]),
        imageAlt: 'Trazado electrocardiográfico impreso',
      };
    case 'RX_TORAX':
      return {
        actionId,
        title: 'Radiografía de tórax',
        techLine: 'Portátil AP  ·  placa de guardia',
        imageSrc: img(v.rx[stage]),
        imageAlt: 'Radiografía de tórax',
      };
    case 'TC_CRANEO':
      return {
        actionId,
        title: 'TC de cerebro sin contraste',
        techLine: 'Axial  ·  ventana cerebral',
        imageSrc: img(v.brain[stage]),
        imageAlt: 'Corte de TC de cerebro',
      };
    case 'TAC_TRAUMA':
      return {
        actionId,
        title: 'TAC de trauma / angioTAC',
        techLine: 'Axial  ·  ventana tejidos / vascular',
        imageSrc: img(v.trauma[stage]),
        imageAlt: 'Corte de TAC de trauma',
      };
    case 'ECO_POCUS':
      return {
        actionId,
        title: 'Ecografía a pie de cama',
        techLine: 'Ventana dirigida  ·  2–5 MHz',
        imageSrc: img(v.pocus[stage]),
        imageAlt: 'Imagen de ecografía a pie de cama',
      };
    case 'LAB':
      return {
        actionId,
        title: 'Laboratorio de guardia',
        techLine: 'Muestra venosa  ·  urgente',
        lab: v.lab[stage],
      };
    case 'GLUCEMIA':
      return {
        actionId,
        title: 'Glucemia capilar',
        techLine: 'Punción digital  ·  tira reactiva',
        glucoseMgDl: v.glucose[stage],
      };
    default:
      return null;
  }
}
