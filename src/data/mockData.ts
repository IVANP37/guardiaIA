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
    avatarUrl: carlosPortrait,
    clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y dolor: Opresión en el centro del pecho, como un peso o aplastamiento. Irradia hacia el hombro/brazo izquierdo y la mandíbula/cuello. Empezó hoy cerca de las 7:00 AM y te despertó.
- Síntomas acompañantes: Falta de aire progresiva, sudor frío, leve mareo.
- Antecedentes personales: Hipertenso hace 5 años (tomas Losartán, pero a veces te olvidas de tomarlo). Fumador de 1 atado por día desde los 20 años. No sabes de diabetes ni alergias.
- Antecedentes familiares: Tu padre falleció de un infarto al corazón a los 60 años.`
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
    avatarUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=256&h=256',
    clinicalHistory: `HISTORIA CLÍNICA DEL CASO (Respondés como Laura, la madre de Sofía):
- Motivo de consulta: Sofía tiene 18 meses. Desde ayer a la noche tiene fiebre alta (llegó a 39.2 °C) y la notás muy caída, decaída. Hoy casi no quiso tomar la leche de la mamadera, lo cual te preocupa mucho porque suele comer muy bien.
- Síntomas acompañantes: Somnolencia, está muy quietita, rechazo total al alimento y líquidos, pañales menos mojados de lo habitual. No tiene tos ni mocos.
- Antecedentes de la paciente: Nacida a término, vacunas al día. No tiene enfermedades previas ni alergias conocidas.`
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
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo de consulta: Tuviste un accidente en moto hace 30 minutos. No tenías casco puesto. Sentís un dolor insoportable en el pecho, el abdomen y la pierna izquierda, la cual ves doblada de forma rara.
- Síntomas acompañantes: Te cuesta respirar, te sentís muy mareada y con frío.
- Antecedentes personales: Sana, no tomás medicamentos. Alérgica a la Penicilina.`
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
      avatarUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=256&h=256',
      companion: {
        role: 'Padre',
        name: 'Martín',
        actorId: 'va-1'
      },
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO (Respondés como el padre de Mateo):
- Motivo de consulta: Mateo tiene 44 meses (casi 4 años) y está con fiebre alta (39.5 °C) desde hace 48 horas. Le duele mucho la garganta al tragar y no quiere comer nada, solo acepta agua fría a sorbos.
- Síntomas acompañantes: Muy irritable, dolor de cabeza leve, decaimiento general cuando le sube la fiebre.
- Antecedentes personales: Sano, vacunas al día. Toma Ibuprofeno jarabe para la fiebre.`
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
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo de consulta: Sentís una cefalea (dolor de cabeza) súbita y extremadamente intensa, la peor de tu vida. Empezó hace 1 hora de golpe y te hizo vomitar dos veces.
- Síntomas acompañantes: Náuseas, fotofobia (te molesta mucho la luz), rigidez en el cuello y confusión leve.
- Antecedentes personales: Hipertenso diagnosticado, no tomás la medicación regularmente. No fumás.`
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
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo de consulta: Dolor en la panza que empezó ayer a la noche como una molestia alrededor del ombligo, pero ahora se movió bien abajo a la derecha (fosa ilíaca derecha) y duele mucho más, sobre todo al caminar o moverte.
- Síntomas acompañantes: Náuseas, perdiste el apetito por completo (anorexia), y tenés un poco de fiebre (37.8 °C).
- Antecedentes personales: Sana, no tomás medicamentos. No tenés cirugías previas.`
    }
  },
  {
    id: 'c-6',
    title: 'Palpitaciones agudas #088',
    specialty: 'Cardiología',
    difficulty: 'Intermedia',
    duration: 20,
    patient: {
      id: 'p-6',
      name: 'Beatriz Rossi',
      age: 68,
      gender: 'F',
      reasonForConsultation: 'Palpitaciones y falta de aire',
      initialVitals: { hr: 140, bp_sys: 115, bp_dia: 75, rr: 22, spo2: 95, temp: 36.6 },
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Sensación súbita de "aleteo" o golpeteo rápido en el pecho (palpitaciones) que empezó hace 2 horas mientras tomabas unos mates. Sentís una leve falta de aire al caminar o hablar mucho y un ligero mareo.
- Antecedentes personales: Hipertensa desde hace 10 años (tomas Enalapril 10mg, pero a veces te olvidas). No tienes dolor de pecho ni antecedentes de infartos o arritmias previas.`
    }
  },
  {
    id: 'c-7',
    title: 'Disnea súbita #099',
    specialty: 'Cardiología',
    difficulty: 'Difícil',
    duration: 25,
    patient: {
      id: 'p-7',
      name: 'Hugo Salvatierra',
      age: 72,
      gender: 'M',
      reasonForConsultation: 'Falta de aire extrema al acostarse',
      initialVitals: { hr: 102, bp_sys: 155, bp_dia: 90, rr: 24, spo2: 93, temp: 36.5 },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Falta de aire extrema de inicio rápido esta noche. Al acostarte te ahogabas por completo (ortopnea), por lo que tuviste que sentarte en el borde de la cama para poder respirar algo. Sientes tos seca y una opresión leve en el pecho por el esfuerzo.
- Antecedentes personales: Hipertenso crónico e insuficiencia cardíaca diagnosticada. Ayer cenaste picadas y embutidos salados, lo que sospechas que desencadenó esta crisis.`
    }
  },
  {
    id: 'c-8',
    title: 'Trauma de miembro #032',
    specialty: 'Traumatología',
    difficulty: 'Intermedia',
    duration: 20,
    patient: {
      id: 'p-8',
      name: 'Damián Ortiz',
      age: 28,
      gender: 'M',
      reasonForConsultation: 'Dolor severo en pierna izquierda post-accidente',
      initialVitals: { hr: 95, bp_sys: 125, bp_dia: 82, rr: 18, spo2: 98, temp: 36.6 },
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Dolor severo en la pierna izquierda tras chocar en moto hace 3 horas. El dolor es insoportable, desproporcionado, y sientes la pantorrilla muy dura y tensa. El dolor empeora drásticamente al estirar los dedos del pie (estiramiento pasivo).
- Antecedentes personales: Sano, sin antecedentes de enfermedades crónicas ni cirugías.`
    }
  },
  {
    id: 'c-9',
    title: 'Fractura expuesta #054',
    specialty: 'Traumatología',
    difficulty: 'Difícil',
    duration: 25,
    patient: {
      id: 'p-9',
      name: 'Valeria Montes',
      age: 34,
      gender: 'F',
      reasonForConsultation: 'Fractura expuesta de pierna con sangrado activo',
      initialVitals: { hr: 100, bp_sys: 110, bp_dia: 70, rr: 20, spo2: 97, temp: 36.7 },
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Te caíste de una pared de escalada (palestra) de 3 metros y tu pierna izquierda se dobló feo. Hay un hueso roto que sobresale de la piel (tibia) y está sangrando de manera activa y pulsátil. Tienes dolor intenso en toda la zona.
- Antecedentes personales: Sana, activa deportista. Vacunas al día (tienes la antitetánica).`
    }
  },
  {
    id: 'c-10',
    title: 'Dificultad respiratoria #021',
    specialty: 'Guardia General',
    difficulty: 'Crítica',
    duration: 15,
    patient: {
      id: 'p-10',
      name: 'Esteban Peralta',
      age: 45,
      gender: 'M',
      reasonForConsultation: 'Dificultad para respirar e hinchazón tras picadura',
      initialVitals: { hr: 110, bp_sys: 105, bp_dia: 65, rr: 24, spo2: 93, temp: 36.8 },
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Te picó una avispa en el cuello hace 20 minutos mientras trabajabas en el jardín. Empezaste a llenarte de ronchas que pican por todo el cuerpo, se te hincharon los labios y sientes que se te cierra la garganta (dificultad severa para tragar y respirar, con un silbido al tomar aire).
- Antecedentes personales: Alérgico a picaduras de insectos, pero nunca habías tenido una reacción tan severa.`
    }
  },
  {
    id: 'c-11',
    title: 'Dolor abdominal agudo #076',
    specialty: 'Guardia General',
    difficulty: 'Intermedia',
    duration: 20,
    patient: {
      id: 'p-11',
      name: 'Clara Mendez',
      age: 58,
      gender: 'F',
      reasonForConsultation: 'Dolor abdominal severo en cinturón y vómitos',
      initialVitals: { hr: 94, bp_sys: 120, bp_dia: 78, rr: 20, spo2: 97, temp: 37.2 },
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Empezaste hace 6 horas con un dolor abdominal insoportable en la boca del estómago (epigastrio) que se te va hacia la espalda como un cinturón (dolor en banda). Has vomitado 4 veces y no toleras nada de agua.
- Antecedentes personales: Tienes diagnóstico de piedras en la vesícula (litiasis biliar) desde hace 2 años, pero no te habías operado.`
    }
  },
  {
    id: 'c-12',
    title: 'Cetoacidosis diabética #014',
    specialty: 'Medicina Interna',
    difficulty: 'Difícil',
    duration: 25,
    patient: {
      id: 'p-12',
      name: 'Julio César',
      age: 62,
      gender: 'M',
      reasonForConsultation: 'Cansancio extremo, sed insaciable y confusión',
      initialVitals: { hr: 108, bp_sys: 102, bp_dia: 60, rr: 22, spo2: 96, temp: 36.9 },
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Eres diabético tipo 1. Olvidaste aplicarte la insulina basal (Lantus) las últimas 48 horas porque estuviste de viaje. Sientes una sed insaciable (polidipsia), fuiste a orinar muchísimas veces (poliuria), te sientes extremadamente débil, con dolor de panza, náuseas, y respiras muy rápido y profundo (respiración de Kussmaul). Sientes un olor frutal en tu aliento (manzana).
- Antecedentes personales: Diabético tipo 1 diagnosticado hace 20 años.`
    }
  },
  {
    id: 'c-13',
    title: 'Urosepsis grave #090',
    specialty: 'Medicina Interna',
    difficulty: 'Crítica',
    duration: 25,
    patient: {
      id: 'p-13',
      name: 'Marta Saldivar',
      age: 70,
      gender: 'F',
      reasonForConsultation: 'Fiebre, decaimiento severo y confusión',
      initialVitals: { hr: 112, bp_sys: 96, bp_dia: 52, rr: 24, spo2: 92, temp: 39.0 },
      avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=256&h=256',
      companion: {
        role: 'Familiar',
        name: 'Lucía',
        actorId: 'va-2'
      },
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO (Respondés como la hija de Marta):
- Motivo de consulta: Traje a mi madre porque desde ayer está con mucha fiebre (39 °C), tiene escalofríos y hoy amaneció muy decaída, casi no responde, habla cosas sin sentido y está muy confundida. Previamente se quejaba de ardor al orinar.
- Antecedentes personales: Madre diabética, hipertensa y con infecciones urinarias recurrentes. Toma metformina y enalapril.`
    }
  },
  {
    id: 'c-14',
    title: 'Crisis hipertensiva #043',
    specialty: 'Medicina Interna',
    difficulty: 'Difícil',
    duration: 20,
    patient: {
      id: 'p-14',
      name: 'Jorge Rivas',
      age: 55,
      gender: 'M',
      reasonForConsultation: 'Dolor de cabeza severo, confusión y visión borrosa',
      initialVitals: { hr: 88, bp_sys: 200, bp_dia: 118, rr: 18, spo2: 97, temp: 36.5 },
      avatarUrl: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO:
- Motivo y molestia: Sientes un dolor de cabeza insoportable ("siento que me va a explotar"), ves luces brillantes y borroso, estás algo desorientado y mareado.
- Antecedentes personales: Hipertenso diagnosticado hace 10 años, suspendiste la medicación hace 3 meses porque "te sentías bien".`
    }
  },
  {
    id: 'c-15',
    title: 'Dolor lumbar agudo #082',
    specialty: 'Traumatología',
    difficulty: 'Difícil',
    duration: 25,
    patient: {
      id: 'p-15',
      name: 'Ricardo Díaz',
      age: 52,
      gender: 'M',
      reasonForConsultation: 'Dolor agudo e insoportable en la espalda alta al levantar peso',
      initialVitals: { hr: 90, bp_sys: 170, bp_dia: 95, rr: 18, spo2: 97, temp: 36.6 },
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO (Caso Truco: Disección Aórtica Aguda):
- Motivo y molestia: Dolor de espalda alta que empezó de repente hace 1 hora al levantar una caja pesada. El dolor es desgarrante ("siento que me arrancan la espalda por dentro") y se irradia hacia el pecho y el abdomen.
- Antecedentes personales: Hipertenso crónico diagnosticado hace 12 años, no tomas la medicación de forma regular porque te produce efectos secundarios.`
    }
  },
  {
    id: 'c-16',
    title: 'Dolor abdominal agudo #041',
    specialty: 'Guardia General',
    difficulty: 'Difícil',
    duration: 20,
    patient: {
      id: 'p-16',
      name: 'Lucas Varela',
      age: 24,
      gender: 'M',
      reasonForConsultation: 'Dolor abdominal difuso severo y vómitos repetidos',
      initialVitals: { hr: 110, bp_sys: 96, bp_dia: 58, rr: 24, spo2: 96, temp: 37.0 },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO (Caso Truco: Cetoacidosis Diabética):
- Motivo y molestia: Dolor en toda la panza (abdomen) desde hace 12 horas, muy molesto, acompañado de 5 episodios de vómitos. Te sientes extremadamente débil y tienes mucha sed. Has ido a orinar a cada rato.
- Antecedentes personales: Diagnosticado con Diabetes Tipo 1 hace 4 años, no te has colocado la dosis de insulina ayer ni hoy porque no te sentías con hambre.`
    }
  },
  {
    id: 'c-17',
    title: 'Omalgia persistente #063',
    specialty: 'Traumatología',
    difficulty: 'Intermedia',
    duration: 20,
    patient: {
      id: 'p-17',
      name: 'Mariana Silva',
      age: 48,
      gender: 'F',
      reasonForConsultation: 'Dolor constante en hombro y cuello derecho',
      initialVitals: { hr: 88, bp_sys: 118, bp_dia: 74, rr: 18, spo2: 97, temp: 37.8 },
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO (Caso Truco: Colecistitis Aguda con dolor referido):
- Motivo y molestia: Dolor continuo en el hombro derecho y la base del cuello que empezó hace 4 horas. No puedes mover el hombro por el dolor. Si te preguntan a fondo, también tienes una molestia en la parte alta y derecha del abdomen (boca del estómago) y tuviste náuseas después de almorzar una fritura.
- Antecedentes personales: Tienes antecedentes de "barro biliar" (vesícula perezosa).`
    }
  },
  {
    id: 'c-18',
    title: 'Epigastralgia severa #015',
    specialty: 'Guardia General',
    difficulty: 'Difícil',
    duration: 25,
    patient: {
      id: 'p-18',
      name: 'Ramón Cáceres',
      age: 65,
      gender: 'M',
      reasonForConsultation: 'Dolor severo en la boca del estómago, acidez y vómitos',
      initialVitals: { hr: 72, bp_sys: 92, bp_dia: 52, rr: 20, spo2: 95, temp: 36.5 },
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256',
      clinicalHistory: `HISTORIA CLÍNICA DEL CASO (Caso Truco: Infarto Agudo de Miocardio de Cara Inferior):
- Motivo y molestia: Dolor opresivo insoportable en la boca del estómago (epigastrio) que empezó hace 2 horas, acompañado de sudor frío, acidez marcada y náuseas con 1 vómito. Tomaste un antiácido en tu casa pero el dolor no cedió en lo más mínimo y sientes que te falta el aire.
- Antecedentes personales: Tabaquista de 1 atado diario, hipertenso y diabético tipo 2 en tratamiento con metformina.`
    }
  }
];
