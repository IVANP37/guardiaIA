import { User, Tenant, ClinicalCase, VirtualActor, ClinicalEnvironment } from '../types';

import carlosPortrait from '../assets/images/portrait_carlos_1786671988983.jpg';
import motherPortrait from '../assets/images/portrait_mother_1786671999565.jpg';
import emergencyEnv from '../assets/images/env_emergency_room_1786672011643.jpg';
import pediatricEnv from '../assets/images/env_pediatric_room_1786672023159.jpg';
import carlosScene from '../assets/images/scene_carlos_emergency_1786671968280.jpg';
import pediatricScene from '../assets/images/scene_pediatrics_mother_baby_1786671979108.jpg';

export const mockTenant: Tenant = {
  id: 't-1',
  name: 'Hospital Universitario Virtual',
  country: 'Argentina',
  locale: 'es-AR',
};

export const mockUser: User = {
  id: 'u-1',
  name: 'Dr. Santiago López',
  role: 'Residente',
  level: 'Nivel 7',
  xp: 6450,
  tenantId: 't-1',
};

export const mockVirtualActors: VirtualActor[] = [
  { id: 'va-1', nameCode: 'MALE_55_70_01', ageRange: '56-75', gender: 'M', visualUrl: carlosPortrait },
  { id: 'va-2', nameCode: 'FEMALE_25_35_01', ageRange: '23-35', gender: 'F', visualUrl: motherPortrait },
  { id: 'va-3', nameCode: 'CHILD_F_01_02_01', ageRange: '0-2', gender: 'F', visualUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=256&h=256' }, // Reusing image for demo
];

export const mockEnvironments: ClinicalEnvironment[] = [
  { 
    id: 'env-1', 
    name: 'Box de Emergencias 3', 
    type: 'BOX_GUARDIA', 
    bgUrl: 'bg-emergency',
    backgroundImageUrl: emergencyEnv,
    description: 'Box estándar de guardia para atención de urgencias de moderada y alta complejidad.',
    acousticProfile: {
      ambientNoiseLevel: 'Alto',
      reverbLevel: 'Bajo'
    }
  },
  { 
    id: 'env-2', 
    name: 'Consultorio Pediátrico B', 
    type: 'PEDIATRIA', 
    bgUrl: 'bg-pediatrics',
    backgroundImageUrl: pediatricEnv,
    description: 'Consultorio acondicionado para atención pediátrica con ambiente amigable y distendido.',
    acousticProfile: {
      ambientNoiseLevel: 'Bajo',
      reverbLevel: 'Medio'
    }
  },
];

export const demoCase: ClinicalCase = {
  id: 'c-1',
  title: 'Dolor torácico #001',
  specialty: 'Cardiología',
  difficulty: 'Intermedia',
  duration: 20,
  status: 'VALIDADO',
  version: '1.2',
  environmentId: 'env-1',
  sceneUrl: carlosScene,
  patient: {
    id: 'p-1',
    name: 'Carlos Méndez',
    age: 57,
    ageUnit: 'años',
    gender: 'M',
    reasonForConsultation: 'Dolor torácico',
    actorId: 'va-1',
    initialState: 'DOLOR_MODERADO',
    initialVitals: {
      hr: 95,
      bp_sys: 145,
      bp_dia: 90,
      rr: 22,
      spo2: 96,
      temp: 36.8,
    },
    avatarUrl: carlosPortrait
  }
};

export const demoPediatricCase: ClinicalCase = {
  id: 'c-100',
  title: 'Fiebre y decaimiento #015',
  specialty: 'Pediatría',
  difficulty: 'Fácil',
  duration: 15,
  status: 'VALIDADO',
  version: '1.0',
  environmentId: 'env-2',
  sceneUrl: pediatricScene,
  patient: {
    id: 'p-100',
    name: 'Sofía',
    age: 18,
    ageUnit: 'meses',
    gender: 'F',
    reasonForConsultation: 'Fiebre y rechazo al alimento',
    actorId: 'va-3',
    initialState: 'SOMNOLENCIA',
    companion: {
      role: 'Madre',
      name: 'Laura',
      actorId: 'va-2'
    },
    initialVitals: {
      hr: 145,
      bp_sys: 90,
      bp_dia: 55,
      rr: 32,
      spo2: 97,
      temp: 39.2,
    },
    avatarUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=256&h=256'
  }
};

export const libraryCases: ClinicalCase[] = [
  demoCase,
  demoPediatricCase,
  {
    id: 'c-2',
    title: 'Accidente motocicleta #003',
    specialty: 'Traumatología',
    difficulty: 'Difícil',
    duration: 30,
    patient: {
      id: 'p-2',
      name: 'Lucía Fernández',
      age: 24,
      gender: 'F',
      reasonForConsultation: 'Politraumatismo',
      initialVitals: { hr: 120, bp_sys: 90, bp_dia: 60, rr: 28, spo2: 92, temp: 36.1 },
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256'
    }
  },
  {
    id: 'c-3',
    title: 'Fiebre pediátrica #007',
    specialty: 'Pediatría',
    difficulty: 'Intermedia',
    duration: 15,
    patient: {
      id: 'p-3',
      name: 'Mateo Gómez',
      age: 4,
      gender: 'M',
      reasonForConsultation: 'Fiebre alta de 48h',
      initialVitals: { hr: 130, bp_sys: 95, bp_dia: 60, rr: 30, spo2: 98, temp: 39.5 },
      avatarUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=256&h=256'
    }
  },
  {
    id: 'c-4',
    title: 'Cefalea intensa #012',
    specialty: 'Neurología',
    difficulty: 'Crítica',
    duration: 25,
    patient: {
      id: 'p-4',
      name: 'Roberto Sánchez',
      age: 42,
      gender: 'M',
      reasonForConsultation: 'Cefalea súbita y vómitos',
      initialVitals: { hr: 60, bp_sys: 180, bp_dia: 110, rr: 16, spo2: 99, temp: 37.0 },
    }
  },
  {
    id: 'c-5',
    title: 'Dolor abdominal #045',
    specialty: 'Guardia General',
    difficulty: 'Fácil',
    duration: 15,
    patient: {
      id: 'p-5',
      name: 'Ana Martínez',
      age: 31,
      gender: 'F',
      reasonForConsultation: 'Dolor fosa ilíaca derecha',
      initialVitals: { hr: 88, bp_sys: 110, bp_dia: 70, rr: 18, spo2: 98, temp: 37.8 },
    }
  }
];
