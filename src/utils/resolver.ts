import { SimulationConfig, ResolvedSimulation, ClinicalCase, VitalSigns, ClinicalState } from '../types';

export function resolveSimulation(config: SimulationConfig, baseCase: ClinicalCase): ResolvedSimulation {
  // Deep copy base case
  const base = JSON.parse(JSON.stringify(baseCase));

  let multiplier = 1.0;
  let assistanceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'MEDIUM';
  let initialVitalsOverride: VitalSigns | undefined = undefined;
  let initialStateOverride: ClinicalState | undefined = undefined;
  let promptModifier = '';

  // 1. Difficulty & Vitals mapping per patient
  const difficulty = config.difficulty;
  const caseId = base.id;

  if (caseId === 'c-1') { // Carlos Méndez
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'El paciente presenta síntomas muy claros y típicos. Deterioro clínico lento. ';
      initialStateOverride = 'DOLOR_LEVE';
      initialVitalsOverride = { hr: 80, bp_sys: 130, bp_dia: 80, rr: 16, spo2: 98, temp: 36.5 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Presentación clínica estándar con cierta ambigüedad. Evolución dinámica con posible deterioro. ';
      initialStateOverride = 'DOLOR_MODERADO';
      initialVitalsOverride = { hr: 95, bp_sys: 145, bp_dia: 90, rr: 22, spo2: 96, temp: 36.8 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'El paciente presenta síntomas atípicos o vagos. Oculta información clave a menos que se le pregunte específicamente. Diagnósticos diferenciales competitivos. Deterioro más rápido. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 105, bp_sys: 155, bp_dia: 95, rr: 24, spo2: 94, temp: 37.0 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'El paciente está gravemente enfermo, inestable hemodinámicamente. Respuestas cortas, disnea evidente. Deterioro inminente que requiere priorización inmediata y acciones urgentes. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 120, bp_sys: 94, bp_dia: 56, rr: 26, spo2: 91, temp: 37.2 };
    }
  } else if (caseId === 'c-100' || caseId === 'c-3') { // Sofía (c-100) y Mateo (c-3) - Pediátricos
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'El niño tiene fiebre pero está reactivo y responde bien al juego. ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 120, bp_sys: 90, bp_dia: 60, rr: 24, spo2: 98, temp: 38.0 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'El niño se encuentra decaído y con tendencia al sueño, pero responde al estímulo. ';
      initialStateOverride = 'SOMNOLENCIA';
      initialVitalsOverride = { hr: 145, bp_sys: 90, bp_dia: 55, rr: 32, spo2: 97, temp: 39.2 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'El niño está confuso y alternadamente irritable. Deshidratación evidente. ';
      initialStateOverride = 'CONFUSION';
      initialVitalsOverride = { hr: 160, bp_sys: 85, bp_dia: 50, rr: 38, spo2: 95, temp: 39.8 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'El niño está en estupor, responde apenas al dolor. Signos de shock séptico/deshidratación grave. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 185, bp_sys: 75, bp_dia: 40, rr: 46, spo2: 92, temp: 40.2 };
    }
  } else if (caseId === 'c-2') { // Lucía Fernández - Traumatología
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Paciente con dolor localizado en extremidad inferior, hemodinámicamente estable. ';
      initialStateOverride = 'DOLOR_LEVE';
      initialVitalsOverride = { hr: 82, bp_sys: 120, bp_dia: 80, rr: 16, spo2: 98, temp: 36.5 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Paciente politraumatizada con dolor moderado. Signos vitales estables pero vigilantes. ';
      initialStateOverride = 'DOLOR_MODERADO';
      initialVitalsOverride = { hr: 105, bp_sys: 110, bp_dia: 70, rr: 22, spo2: 95, temp: 36.3 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Sospecha de sangrado interno. Dolor severo. Signos de shock hipovolémico compensado. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 120, bp_sys: 90, bp_dia: 60, rr: 28, spo2: 92, temp: 36.1 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Shock hipovolémico severo descompensado. Insuficiencia respiratoria inminente. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 135, bp_sys: 80, bp_dia: 45, rr: 34, spo2: 88, temp: 35.8 };
    }
  } else if (caseId === 'c-4') { // Roberto Sánchez - Cefalea / Neurología
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Cefalea leve sin signos focales ni de hipertensión endocraneana. ';
      initialStateOverride = 'DOLOR_LEVE';
      initialVitalsOverride = { hr: 72, bp_sys: 135, bp_dia: 85, rr: 16, spo2: 99, temp: 36.8 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Cefalea moderada. Elevación tensional y bradicardia leve (Cushing inicial). ';
      initialStateOverride = 'DOLOR_MODERADO';
      initialVitalsOverride = { hr: 60, bp_sys: 180, bp_dia: 110, rr: 16, spo2: 99, temp: 37.0 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Dolor de cabeza severo con rigidez de nuca. Cushing evidente, bradicardia. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 54, bp_sys: 190, bp_dia: 115, rr: 14, spo2: 98, temp: 37.0 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Riesgo inminente de herniación cerebral. Deterioro neurológico rápido y patrón respiratorio irregular. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 46, bp_sys: 210, bp_dia: 125, rr: 10, spo2: 95, temp: 37.1 };
    }
  } else if (caseId === 'c-5') { // Ana Martínez - Abdomen agudo / Guardia General
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Dolor abdominal leve, sin signos de defensa ni rebote. ';
      initialStateOverride = 'DOLOR_LEVE';
      initialVitalsOverride = { hr: 78, bp_sys: 115, bp_dia: 75, rr: 16, spo2: 99, temp: 37.0 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Dolor en fosa ilíaca derecha moderado. Febrícula y dolor localizado al examen. ';
      initialStateOverride = 'DOLOR_MODERADO';
      initialVitalsOverride = { hr: 88, bp_sys: 110, bp_dia: 70, rr: 18, spo2: 98, temp: 37.8 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Apendicitis aguda con signos de peritonitis localizada. Defensa abdominal. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 102, bp_sys: 105, bp_dia: 65, rr: 22, spo2: 96, temp: 38.5 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Apéndice perforado. Peritonitis generalizada con respuesta inflamatoria sistémica y shock séptico inicial. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 125, bp_sys: 90, bp_dia: 55, rr: 26, spo2: 94, temp: 39.4 };
    }
  } else if (caseId === 'c-6') { // Beatriz Rossi - Fibrilación Auricular
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'El paciente presenta una arritmia estable y controlada. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 110, bp_sys: 120, bp_dia: 80, rr: 18, spo2: 97, temp: 36.5 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'El paciente presenta palpitaciones notables. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 140, bp_sys: 115, bp_dia: 75, rr: 22, spo2: 95, temp: 36.6 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'El paciente presenta palpitaciones y disnea moderada de esfuerzo. ';
      initialStateOverride = 'DISNEA_MODERADA';
      initialVitalsOverride = { hr: 155, bp_sys: 105, bp_dia: 65, rr: 26, spo2: 93, temp: 36.6 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'El paciente está inestable hemodinámicamente debido a arritmia rápida. Shock inminente. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 168, bp_sys: 88, bp_dia: 50, rr: 30, spo2: 90, temp: 36.7 };
    }
  } else if (caseId === 'c-7') { // Hugo Salvatierra - Insuficiencia Cardíaca
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'El paciente presenta insuficiencia cardíaca estable con leve congestión. ';
      initialStateOverride = 'DISNEA_LEVE';
      initialVitalsOverride = { hr: 85, bp_sys: 138, bp_dia: 84, rr: 20, spo2: 96, temp: 36.4 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'El paciente presenta insuficiencia cardíaca descompensada. ';
      initialStateOverride = 'DISNEA_MODERADA';
      initialVitalsOverride = { hr: 102, bp_sys: 155, bp_dia: 90, rr: 24, spo2: 93, temp: 36.5 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'El paciente presenta edema agudo de pulmón inicial. disnea severa en reposo. ';
      initialStateOverride = 'DISNEA_SEVERA';
      initialVitalsOverride = { hr: 115, bp_sys: 175, bp_dia: 100, rr: 28, spo2: 90, temp: 36.5 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'El paciente está cursando un edema agudo de pulmón severo, con asfixia inminente. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 125, bp_sys: 185, bp_dia: 110, rr: 34, spo2: 85, temp: 36.6 };
    }
  } else if (caseId === 'c-8') { // Damián Ortiz - Síndrome Compartimental
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'El paciente presenta dolor post-traumático moderado, sin signos de síndrome compartimental. ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 80, bp_sys: 120, bp_dia: 80, rr: 16, spo2: 98, temp: 36.6 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'El miembro lesionado muestra dolor moderado-severo que aumenta con estiramiento pasivo. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 95, bp_sys: 125, bp_dia: 82, rr: 18, spo2: 98, temp: 36.6 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'El dolor es insoportable y la pierna está tensa. Síndrome compartimental agudo en evolución. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 110, bp_sys: 135, bp_dia: 88, rr: 20, spo2: 97, temp: 36.6 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Síndrome compartimental establecido severo. El dolor es extremo y hay riesgo de necrosis y colapso. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 120, bp_sys: 145, bp_dia: 95, rr: 22, spo2: 96, temp: 36.6 };
    }
  } else if (caseId === 'c-9') { // Valeria Montes - Fractura Expuesta
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Fractura expuesta de tibia estable, con sangrado mínimo ya contenido. ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 85, bp_sys: 120, bp_dia: 75, rr: 16, spo2: 98, temp: 36.7 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Fractura expuesta de tibia con sangrado venoso moderado, dolor agudo. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 100, bp_sys: 110, bp_dia: 70, rr: 20, spo2: 97, temp: 36.7 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Fractura expuesta con sangrado arterial activo, hipotensión compensada. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 115, bp_sys: 95, bp_dia: 55, rr: 24, spo2: 96, temp: 36.7 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Shock hipovolémico/hemorrágico activo severo debido a sangrado masivo en fractura expuesta. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 128, bp_sys: 85, bp_dia: 45, rr: 26, spo2: 95, temp: 36.7 };
    }
  } else if (caseId === 'c-10') { // Esteban Peralta - Anafilaxia
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Reacción alérgica cutánea leve (urticaria local) sin afectación respiratoria ni shock. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 90, bp_sys: 120, bp_dia: 76, rr: 16, spo2: 98, temp: 36.8 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Reacción alérgica sistémica (anafilaxia leve) con prurito y disnea leve. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 110, bp_sys: 105, bp_dia: 65, rr: 20, spo2: 95, temp: 36.8 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Anafilaxia con estridor respiratorio y edema laríngeo, hipotensión moderada. ';
      initialStateOverride = 'DISNEA_SEVERA';
      initialVitalsOverride = { hr: 125, bp_sys: 90, bp_dia: 50, rr: 26, spo2: 91, temp: 36.8 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Shock anafiláctico refractario inminente con asfixia por edema de glotis. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 134, bp_sys: 82, bp_dia: 40, rr: 30, spo2: 88, temp: 36.8 };
    }
  } else if (caseId === 'c-11') { // Clara Mendez - Pancreatitis
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Pancreatitis aguda leve autolimitada, dolor epigástrico tolerable. ';
      initialStateOverride = 'DOLOR_LEVE';
      initialVitalsOverride = { hr: 78, bp_sys: 120, bp_dia: 80, rr: 16, spo2: 98, temp: 36.9 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Pancreatitis aguda con dolor severo en banda, náuseas y vómitos repetidos. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 94, bp_sys: 120, bp_dia: 78, rr: 20, spo2: 97, temp: 37.2 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Pancreatitis necrotizante inicial con respuesta inflamatoria sistémica (SIRS). ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 110, bp_sys: 105, bp_dia: 65, rr: 22, spo2: 94, temp: 37.8 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Sepsis / Shock distributivo grave de origen pancreático. Estado hemodinámico crítico. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 118, bp_sys: 90, bp_dia: 50, rr: 24, spo2: 92, temp: 38.3 };
    }
  } else if (caseId === 'c-12') { // Julio César - Cetoacidosis
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Hiperglucemia moderada simple con cetosis leve, sin deshidratación severa. ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 85, bp_sys: 115, bp_dia: 75, rr: 18, spo2: 98, temp: 36.6 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Cetoacidosis diabética moderada con respiración rápida y sed intensa. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 108, bp_sys: 102, bp_dia: 60, rr: 22, spo2: 96, temp: 36.9 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Cetoacidosis diabética grave con acidosis metabólica, respiración profunda (Kussmaul) y deshidratación. ';
      initialStateOverride = 'DETERIORO';
      initialVitalsOverride = { hr: 115, bp_sys: 94, bp_dia: 52, rr: 26, spo2: 95, temp: 36.9 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Cetoacidosis diabética crítica con colapso cardiovascular inminente por deshidratación y acidosis extrema. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 122, bp_sys: 88, bp_dia: 48, rr: 28, spo2: 94, temp: 36.9 };
    }
  } else if (caseId === 'c-13') { // Marta Saldivar - Urosepsis
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Infección urinaria febril simple sin signos de respuesta inflamatoria sistémica o sepsis. ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 88, bp_sys: 120, bp_dia: 75, rr: 18, spo2: 97, temp: 38.0 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Sepsis de origen urinario con fiebre alta, escalofríos y decaimiento. ';
      initialStateOverride = 'DOLOR_MODERADO';
      initialVitalsOverride = { hr: 112, bp_sys: 96, bp_dia: 52, rr: 24, spo2: 92, temp: 39.0 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Urosepsis con hipotensión moderada sensible a fluidos, obnubilación leve en anciana. ';
      initialStateOverride = 'CONFUSION';
      initialVitalsOverride = { hr: 120, bp_sys: 90, bp_dia: 48, rr: 26, spo2: 91, temp: 39.2 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Shock séptico urinario severo refractario a fluidos iniciales. Hipoperfusión orgánica severa. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 130, bp_sys: 80, bp_dia: 42, rr: 26, spo2: 90, temp: 39.4 };
    }
  } else if (caseId === 'c-14') { // Jorge Rivas - Crisis Hipertensiva
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Hipertensión severa asintomática (urgencia hipertensiva) sin daño de órgano blanco agudo. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 75, bp_sys: 175, bp_dia: 102, rr: 16, spo2: 98, temp: 36.5 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Emergencia hipertensiva con cefalea y visión borrosa. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 88, bp_sys: 200, bp_dia: 118, rr: 18, spo2: 97, temp: 36.5 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Emergencia hipertensiva con encefalopatía hipertensiva inicial y confusión. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 98, bp_sys: 215, bp_dia: 124, rr: 20, spo2: 96, temp: 36.5 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Encefalopatía hipertensiva crítica establecida. Riesgo inminente de edema cerebral y stroke. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 105, bp_sys: 225, bp_dia: 130, rr: 22, spo2: 96, temp: 36.5 };
    }
  } else if (caseId === 'c-15') { // Ricardo Díaz - Disección Aórtica (Triage: Traumatología)
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Dolor de espalda moderado, paciente hemodinámicamente estable. ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 80, bp_sys: 135, bp_dia: 85, rr: 16, spo2: 98, temp: 36.6 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Dolor de espalda severo irradiado, hipertensión descompensada. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 90, bp_sys: 170, bp_dia: 95, rr: 18, spo2: 97, temp: 36.6 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Dolor de espalda desgarrante agudo, asimetría de pulsos inicial. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 98, bp_sys: 180, bp_dia: 100, rr: 20, spo2: 96, temp: 36.6 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Disección aórtica aguda crítica inestable. Hipertensión severa descontrolada y dolor desgarrante. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 110, bp_sys: 185, bp_dia: 105, rr: 22, spo2: 96, temp: 36.6 };
    }
  } else if (caseId === 'c-16') { // Lucas Varela - Cetoacidosis Diabética (Triage: Guardia General)
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Hiperglucemia simple estable con leve dolor abdominal. ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 88, bp_sys: 115, bp_dia: 70, rr: 18, spo2: 98, temp: 36.8 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Cetoacidosis diabética con dolor abdominal moderado difuso y deshidratación. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 110, bp_sys: 96, bp_dia: 58, rr: 24, spo2: 96, temp: 37.0 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Cetoacidosis grave simulando abdomen agudo, náuseas persistentes. ';
      initialStateOverride = 'DETERIORO';
      initialVitalsOverride = { hr: 115, bp_sys: 90, bp_dia: 52, rr: 26, spo2: 95, temp: 37.0 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Cetoacidosis diabética crítica con colapso hemodinámico inminente y dolor abdominal pseudoperitoneal. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 120, bp_sys: 85, bp_dia: 45, rr: 28, spo2: 94, temp: 37.0 };
    }
  } else if (caseId === 'c-17') { // Mariana Silva - Colecistitis Aguda (Triage: Traumatología)
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Cólico biliar simple resolviéndose, dolor de hombro leve. ';
      initialStateOverride = 'DOLOR_LEVE';
      initialVitalsOverride = { hr: 78, bp_sys: 120, bp_dia: 75, rr: 16, spo2: 98, temp: 36.8 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Colecistitis aguda con signo de Murphy positivo y dolor referido a hombro derecho. ';
      initialStateOverride = 'DOLOR_MODERADO';
      initialVitalsOverride = { hr: 88, bp_sys: 118, bp_dia: 74, rr: 18, spo2: 97, temp: 37.8 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Colecistitis aguda severa febril, hipotensión inicial reactiva. ';
      initialStateOverride = 'DOLOR_SEVERO';
      initialVitalsOverride = { hr: 102, bp_sys: 105, bp_dia: 62, rr: 22, spo2: 95, temp: 38.5 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Sepsis biliar / shock séptico inicial por colecistitis gangrenosa. Hipotensión y obnubilación. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 115, bp_sys: 92, bp_dia: 52, rr: 24, spo2: 93, temp: 39.0 };
    }
  } else if (caseId === 'c-18') { // Ramón Cáceres - Infarto Inferior (Triage: Guardia General)
    if (difficulty === 'Fácil') {
      multiplier = 0.5;
      promptModifier += 'Angina estable manifestándose como dolor en epigastrio (boca del estómago). ';
      initialStateOverride = 'NORMAL';
      initialVitalsOverride = { hr: 70, bp_sys: 120, bp_dia: 75, rr: 16, spo2: 98, temp: 36.5 };
    } else if (difficulty === 'Intermedia') {
      multiplier = 1.0;
      promptModifier += 'Infarto agudo de miocardio de cara inferior, epigastralgia y náuseas. ';
      initialStateOverride = 'ANSIEDAD';
      initialVitalsOverride = { hr: 72, bp_sys: 92, bp_dia: 52, rr: 20, spo2: 95, temp: 36.5 };
    } else if (difficulty === 'Difícil') {
      multiplier = 1.5;
      promptModifier += 'Infarto inferior con compromiso de VD inicial, hipotensión moderada. ';
      initialStateOverride = 'DETERIORO';
      initialVitalsOverride = { hr: 68, bp_sys: 90, bp_dia: 50, rr: 22, spo2: 93, temp: 36.5 };
    } else if (difficulty === 'Crítica') {
      multiplier = 2.5;
      promptModifier += 'Shock cardiogénico por infarto agudo de ventrículo derecho, hipotensión severa dependiente de precarga. ';
      initialStateOverride = 'CRITICO';
      initialVitalsOverride = { hr: 64, bp_sys: 88, bp_dia: 48, rr: 26, spo2: 91, temp: 36.5 };
    }
  }

  // Apply overrides to patient
  if (initialStateOverride) {
    base.patient.initialState = initialStateOverride;
  }
  if (initialVitalsOverride) {
    base.patient.initialVitals = initialVitalsOverride;
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
