import { ClinicalCase, VitalSigns } from '../types';
import { labelClinicalState } from '../utils/uiLabels';

export interface CaseRuntimeProfile {
  openingMessage: string;
  openingSender: 'patient' | 'companion';
  forceCompanionSpeaker: boolean;
  phase0Label: string;
  phase0Voice: string;
  phase1Label: string;
  phase1Voice: string;
  phase2Label: string;
  phase2Voice: string;
  phase3Label: string;
  phase3Voice: string;
  deteriorationVitals: Pick<VitalSigns, 'hr' | 'bp_sys' | 'bp_dia' | 'rr' | 'spo2'>;
  deteriorationMessage: string;
  deteriorationSender: 'patient' | 'companion';
  reeval: {
    initial: string;
    deterioration: string;
    recovery: string;
    shock: string;
  };
  hintPriority: string;
  morphineRelief: string;
  fluidsRelief: string;
  debriefRecommendation: string;
  fallbackReplies: { match: string[]; reply: string }[];
}

const defaultFallback = (reason: string): CaseRuntimeProfile['fallbackReplies'] => [
  { match: ['dónde', 'donde', 'lugar', 'duele'], reply: `El malestar es sobre todo por ${reason.toLowerCase()}.` },
  { match: ['cuándo', 'cuando', 'tiempo', 'hora', 'empezó'], reply: 'Empezó hace unas horas y desde entonces no me deja tranquilo.' },
  { match: ['como es', 'cómo es', 'tipo', 'puntada', 'opresión', 'opresion'], reply: 'Es constante, molesto, y ahora está peor que al principio.' },
  { match: ['antecedentes', 'enfermedades', 'presión', 'hipertenso', 'diabet'], reply: 'Algunas cosas de salud sí, doctor, pero dígame qué quiere saber exactamente.' },
  { match: ['alergia', 'alérgico', 'alergico'], reply: 'No, no soy alérgico a nada que yo sepa.' },
  { match: ['fuma', 'cigarro', 'tabaco'], reply: 'Fumo, sí, pero no sé si tiene que ver con esto.' },
];

function genericProfile(caseObj: ClinicalCase): CaseRuntimeProfile {
  const p = caseObj.patient;
  const reason = p.reasonForConsultation;
  const hasCompanion = Boolean(p.companion);
  const infantOrChild = p.ageUnit === 'meses' || p.age < 6;
  const speaker: 'patient' | 'companion' = hasCompanion && infantOrChild ? 'companion' : hasCompanion ? 'companion' : 'patient';

  return {
    openingMessage: hasCompanion
      ? `Doctor, lo traje porque ${reason.toLowerCase()}. Estoy muy preocupado.`
      : `Hola doctor... vine porque ${reason.toLowerCase()}. Al principio pensé que iba a pasar, pero ahora me preocupa más.`,
    openingSender: speaker,
    forceCompanionSpeaker: hasCompanion && infantOrChild,
    phase0Label: `ESTADO CLÍNICO ACTUAL: ${labelClinicalState(p.initialState)} — motivo: ${reason}.`,
    phase0Voice: 'Habla con incomodidad y preocupación, en oraciones normales, sin entregar el diagnóstico.',
    phase1Label: `ESTADO CLÍNICO ACTUAL: DETERIORO del cuadro de ingreso (${reason}).`,
    phase1Voice: 'Frases más cortas, angustia y urgencia. El síntoma principal empeoró.',
    phase2Label: `ESTADO CLÍNICO ACTUAL: MEJORÍA PARCIAL del cuadro (${reason}).`,
    phase2Voice: 'Expresa alivio. Puede hablar con más calma.',
    phase3Label: 'ESTADO CLÍNICO ACTUAL: COLAPSO / SHOCK. Muy débil, casi sin fuerzas.',
    phase3Voice: 'Frases muy débiles, balbuceos, sensación de desmayo.',
    deteriorationVitals: {
      hr: Math.min(170, p.initialVitals.hr + 22),
      bp_sys: Math.max(78, p.initialVitals.bp_sys - 18),
      bp_dia: Math.max(42, p.initialVitals.bp_dia - 12),
      rr: Math.min(40, p.initialVitals.rr + 8),
      spo2: Math.max(86, p.initialVitals.spo2 - 6),
    },
    deteriorationMessage: hasCompanion
      ? 'Doctor... está peor, no reacciona igual que hace un rato... por favor mirelo.'
      : 'Doctor... espere... me siento mucho peor... no me deja el malestar y me falta un poco el aire...',
    deteriorationSender: speaker,
    reeval: {
      initial: `Sigo con ${reason.toLowerCase()}, doctor, pero puedo hablar.`,
      deterioration: 'Doctor... está peor, me siento mal de verdad, ayúdeme...',
      recovery: 'Sí doctor... por suerte siento que aflojó un poco y estoy más calmo.',
      shock: 'Doctor... me caigo... no tengo fuerzas... todo negro...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Priorizá soporte, reevaluación y la conducta específica de este cuadro. No demores la decisión.',
    morphineRelief: hasCompanion
      ? 'Doctor... parece que el dolor le aflojó con esa inyección, se quedó más quieto.'
      : 'Doctor... el dolor fuerte se me calmó bastante... me dio un poco de sueño también.',
    fluidsRelief: hasCompanion
      ? 'Doctor, el color de la cara le está volviendo un poquito y ya no está tan agitado.'
      : 'Doctor... el mareo fuerte se me pasó... y ya no veo tan borroso.',
    debriefRecommendation: 'Reevaluá el motivo de consulta, asegurá vía aérea/hemodinamia y no dejes pasar signos de alarma. La conducta final debe coincidir con el caso, no con un protocolo genérico de infarto.',
    fallbackReplies: hasCompanion
      ? [
          { match: ['fiebre', 'temperatura'], reply: 'Le tomé la temperatura y estaba alta. Le di algo para la fiebre pero no le bajó del todo.' },
          { match: ['come', 'leche', 'pañales', 'pis', 'orina'], reply: 'Hoy tomó y orinó mucho menos de lo normal, por eso me asusté.' },
          { match: ['cuándo', 'cuando', 'empezó'], reply: 'Empezó ayer y hoy lo veo peor.' },
        ]
      : defaultFallback(reason),
  };
}

const PROFILES: Record<string, Partial<CaseRuntimeProfile>> = {
  'c-1': {
    openingMessage: 'Hola doctor... vine porque desde esta mañana tengo un dolor acá en el pecho. Al principio pensé que era muscular, pero ahora siento que se hizo más fuerte y me empezó a faltar un poco el aire.',
    openingSender: 'patient',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DOLOR TORÁCICO MODERADO (estado inicial). Opresión precordial ~7/10.',
    phase0Voice: 'Podés hablar en oraciones normales pero con incomodidad y preocupación por el dolor de pecho.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DETERIORO CRÍTICO. Dolor torácico 9-10/10, disnea marcada.',
    phase1Voice: 'Frases CORTAS, entrecortadas por falta de aire y angustia.',
    phase2Label: 'ESTADO CLÍNICO ACTUAL: RECUPERACIÓN PARCIAL. El dolor de pecho bajó a 3-4/10.',
    phase2Voice: 'Alivio palpable. Más fluidez y calma.',
    deteriorationVitals: { hr: 132, bp_sys: 88, bp_dia: 52, rr: 28, spo2: 89 },
    deteriorationMessage: 'Doctor... espere... me está doliendo mucho más el pecho... me falta el aire, me siento mareado...',
    reeval: {
      initial: 'Siento una molestia en el centro del pecho doctor, pero puedo hablar.',
      deterioration: 'Doctor... me sigue doliendo y apretando muy fuerte el pecho, me falta el aire...',
      recovery: 'Sí doctor... por suerte siento que el dolor aflojó bastante y puedo respirar mejor.',
      shock: 'Doctor... me caigo... no tengo fuerzas... todo negro...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] En dolor torácico considerá ECG inmediato y activación de Código Infarto si corresponde.',
    morphineRelief: 'Doctor... el dolor fuerte del pecho se me calmó bastante... me dio un poco de sueño también.',
    debriefRecommendation: 'En sospecha de SCA, ECG < 10 min, monitorización, doble antiagregación si está indicado y activación precoz de reperfusión.',
    fallbackReplies: [
      { match: ['dónde', 'donde', 'lugar'], reply: 'Acá en el centro del pecho, y siento como que se me va un poco hacia el brazo izquierdo y el cuello.' },
      { match: ['cuándo', 'cuando', 'tiempo', 'hora'], reply: 'Empezó hoy a la mañana, tipo 7. Me despertó el dolor.' },
      { match: ['como es', 'cómo es', 'tipo', 'puntada', 'opresion', 'opresión'], reply: 'Es como un peso, como si me estuvieran aplastando el pecho. Muy opresivo.' },
      { match: ['antecedentes', 'enfermedades', 'presión', 'hipertenso'], reply: 'Sí, soy hipertenso hace 5 años, tomo losartán pero a veces me olvido. Y mi papá tuvo un infarto a los 60 años.' },
      { match: ['irradia', 'brazo', 'mandibula', 'cuello', 'espalda'], reply: 'Siento que se me va para el brazo izquierdo y un poco al cuello.' },
      { match: ['nausea', 'vómito', 'vomito', 'mareo', 'sudor'], reply: 'Me siento un poco mareado y transpiré frío hace un rato.' },
      { match: ['alergia', 'alérgico', 'alergico'], reply: 'No, no soy alérgico a nada que yo sepa.' },
      { match: ['fuma', 'cigarro', 'tabaco'], reply: 'Sí, fumo un atado por día desde los 20 años.' },
    ],
  },
  'c-100': {
    openingMessage: 'Doctor, desde anoche tiene fiebre y está muy decaída. Hoy casi no quiso tomar la leche y me preocupa porque normalmente come bien.',
    openingSender: 'companion',
    forceCompanionSpeaker: true,
    phase0Label: 'ESTADO CLÍNICO ACTUAL: LACTANTE FEBRIL, somnolienta, rechazo alimentario. La interlocutora es la madre.',
    phase0Voice: 'La madre habla preocupada, concreta, sin términos médicos. La bebé no habla.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DETERIORO. Más somnolienta, peor perfusión, fiebre persistente.',
    phase1Voice: 'La madre muestra miedo y urgencia. Describe a la bebé peor, no responde igual.',
    phase2Label: 'ESTADO CLÍNICO ACTUAL: MEJORÍA. Más reactiva, mejor color.',
    phase2Voice: 'La madre expresa alivio contenido.',
    deteriorationVitals: { hr: 175, bp_sys: 78, bp_dia: 42, rr: 42, spo2: 92 },
    deteriorationMessage: 'Doctor... se me está poniendo muy flojita, ya casi no me mira... por favor mirela, me asusta.',
    deteriorationSender: 'companion',
    reeval: {
      initial: 'Sigue calentita y decaída, doctor, pero todavía reacciona un poco cuando la llamo.',
      deterioration: '¡Doctor! Está peor, casi no responde y respira muy rápido...',
      recovery: 'Ahora la veo un poco más tranquila, doctor, ya no está tan flojita.',
      shock: '¡No reacciona! Está pálida y muy flácida, por favor haga algo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] En lactante febril priorizá ABC, signos de deshidratación/sepsis y rehidratación. No uses Aspirina.',
    morphineRelief: 'Doctor... parece que se quedó más quieta con esa inyección, pero igual la veo decaída.',
    fluidsRelief: '¡Doctor, muchas gracias! Con el suero se calmó y ya no está tan calentita ni tan flojita.',
    debriefRecommendation: 'En fiebre y decaimiento del lactante: evaluar hidratación, descartar sepsis, rehidratar y nunca administrar Aspirina.',
    fallbackReplies: [
      { match: ['fiebre', 'temperatura'], reply: 'Le tomé a la noche y tenía 39. Le di paracetamol pero no le bajó mucho.' },
      { match: ['pañales', 'pis', 'orina'], reply: 'Mojó dos pañales en todo el día, mucho menos de lo normal.' },
      { match: ['leche', 'come', 'alimento'], reply: 'Hoy casi no quiso tomar la mamadera. Normalmente come muy bien.' },
      { match: ['cuándo', 'cuando', 'empezó'], reply: 'Desde ayer a la noche. Hoy la veo peor, más caída.' },
      { match: ['tos', 'moco', 'resfrío'], reply: 'No tiene tos ni mocos, doctor. Solo fiebre y que no quiere comer.' },
    ],
  },
  'c-2': {
    openingMessage: 'Doctor... tuve un accidente en moto... me duele un montón el pecho, la panza y la pierna... no tenía casco...',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: POLITRAUMA. Dolor en tórax, abdomen y miembro. Posible hipovolemia.',
    phase0Voice: 'Dolor intenso, miedo, frases entrecortadas. No nombra diagnósticos.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DETERIORO. Más mareo, palidez, peor dolor, sospecha de sangrado.',
    deteriorationVitals: { hr: 138, bp_sys: 78, bp_dia: 46, rr: 32, spo2: 88 },
    deteriorationMessage: 'Doctor... me siento muy mareada... tengo mucho frío... la panza me duele cada vez más...',
    reeval: {
      initial: 'Me duele la pierna, el pecho y la panza, doctor. Estoy asustada pero hablo.',
      deterioration: 'Estoy peor... me mareo y no siento bien la pierna... tengo frío...',
      recovery: 'Con lo que me hizo me siento un poco más fuerte, doctor, el mareo aflojó.',
      shock: 'No veo... me apago... no puedo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] En politrauma: ABCDE, control de hemorragia y reposición de volumen. No betabloquees la taquicardia compensatoria.',
    morphineRelief: 'El dolor de la pierna aflojó un poco, doctor... igual sigo asustada.',
    debriefRecommendation: 'Politrauma: vía aérea, oxígeno, acceso venoso, expansión y destino quirúrgico/UTI. No anules la compensación con betabloqueantes.',
    fallbackReplies: [
      { match: ['accidente', 'moto', 'cómo', 'como pasó'], reply: 'Venía en moto, no tenía casco, frenaron de golpe y salí volando. Hace como media hora.' },
      { match: ['dónde', 'donde', 'duele'], reply: 'La pierna izquierda está doblada rara, y me duele el pecho y la panza.' },
      { match: ['alergia'], reply: 'Sí, soy alérgica a la penicilina.' },
      { match: ['antecedentes', 'enfermedades'], reply: 'Sana, no tomo medicamentos.' },
    ],
  },
  'c-3': {
    openingMessage: 'Doctor, Mateo tiene fiebre alta desde hace dos días, le duele la garganta y no quiere comer. Lo veo muy irritable.',
    openingSender: 'companion',
    forceCompanionSpeaker: true,
    phase0Label: 'ESTADO CLÍNICO ACTUAL: NIÑO FEBRIL con odinofagia. El interlocutor es el padre.',
    phase0Voice: 'El padre está preocupado, concreto. El niño habla poco; priorizá al padre si está presente.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DETERIORO. Más decaído, peor fiebre, menos reactivo.',
    deteriorationVitals: { hr: 168, bp_sys: 82, bp_dia: 48, rr: 38, spo2: 95 },
    deteriorationMessage: 'Doctor... se me está poniendo muy flojo, ya no se queja, solo se queda tirado... me asusta.',
    deteriorationSender: 'companion',
    reeval: {
      initial: 'Sigue con fiebre y no quiere tragar, doctor, pero me mira cuando lo llamo.',
      deterioration: 'Está peor, muy caído, casi no responde...',
      recovery: 'Ahora lo veo un poco más despierto, doctor.',
      shock: '¡No reacciona bien! Está pálido y muy flojo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Niño febril: ABC, hidratación, foco infeccioso. No Aspirina. No betabloqueantes.',
    morphineRelief: 'Se quedó más quieto, doctor, pero igual lo veo decaído.',
    fluidsRelief: 'Con el suero se calmó bastante, doctor. Ya no lo veo tan agitado ni tan calentito.',
    debriefRecommendation: 'Fiebre pediátrica: evaluar hidratación y foco, rehidratar, antitérmicos seguros. Aspirina contraindicada.',
    fallbackReplies: [
      { match: ['fiebre', 'temperatura'], reply: 'Hace 48 horas que tiene 39 y pico. Le doy ibuprofeno jarabe.' },
      { match: ['garganta', 'traga', 'come'], reply: 'Dice que le duele al tragar y solo acepta agua fría a sorbos.' },
      { match: ['vacuna', 'antecedentes'], reply: 'Sano, vacunas al día. No tiene alergias que yo sepa.' },
    ],
  },
  'c-4': {
    openingMessage: 'Doctor... me explotó la cabeza de golpe hace una hora... es el dolor más fuerte que tuve en mi vida... vomité dos veces...',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: CEFALEA EN ESTALLIDO. Fotofobia, náuseas, posible HTEC.',
    phase0Voice: 'Dolor extremo, fotofobia, habla con los ojos entrecerrados. No dice "hemorragia subaracnoidea".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DETERIORO NEUROLÓGICO. Más sueño, peor dolor, Cushing.',
    deteriorationVitals: { hr: 48, bp_sys: 205, bp_dia: 120, rr: 12, spo2: 96 },
    deteriorationMessage: 'Doctor... me da mucho sueño... la luz me mata... siento que se me va la vista...',
    reeval: {
      initial: 'La cabeza me parte, doctor. La luz me molesta muchísimo.',
      deterioration: 'Me quiero dormir... el cuello rígido... peor que antes...',
      recovery: 'Un poco más despejado, doctor, pero la cabeza sigue pesada.',
      shock: 'No puedo... se me apaga todo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Cefalea en estallido: vía aérea, neuroevaluación, no vasodilates (nitro) ni sobrecargues volumen.',
    morphineRelief: 'El dolor de cabeza aflojó un poco, doctor... igual me molesta la luz.',
    debriefRecommendation: 'Cefalea súbita: pensar HSA/HTEC, no nitroglicerina, no expansión agresiva, destino neurocrítico.',
    fallbackReplies: [
      { match: ['cuándo', 'cuando', 'empezó'], reply: 'Hace una hora, de golpe, como un trueno adentro de la cabeza.' },
      { match: ['luz', 'foto', 'cuello'], reply: 'La luz me molesta muchísimo y siento el cuello duro.' },
      { match: ['vómito', 'vomito', 'nausea'], reply: 'Vomité dos veces apenas empezó.' },
      { match: ['presión', 'hipertenso', 'antecedentes'], reply: 'Soy hipertenso y a veces no tomo la pastilla.' },
    ],
  },
  'c-5': {
    openingMessage: 'Hola doctor... me duele la panza. Empezó cerca del ombligo y ahora la puntada está bien abajo a la derecha, sobre todo al caminar.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DOLOR EN FID. Náuseas, anorexia, febrícula.',
    phase0Voice: 'Incomodidad abdominal, evita moverse. No dice "apendicitis".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DOLOR ABDOMINAL QUE EMPEORA. Más defensa, más náuseas.',
    deteriorationVitals: { hr: 108, bp_sys: 100, bp_dia: 62, rr: 24, spo2: 96 },
    deteriorationMessage: 'Doctor... la puntada de la derecha se me hizo insoportable... no quiero que me toquen la panza...',
    reeval: {
      initial: 'Me duele abajo a la derecha, doctor, y no tengo nada de hambre.',
      deterioration: 'Peor, no puedo ni enderezarme... las náuseas siguen...',
      recovery: 'Con lo que me puso el dolor aflojó un poco, doctor.',
      shock: 'Siento que se me revienta la panza... me mareo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Abdomen agudo: NPO, analgésia, evaluación quirúrgica. No enemas ni alimentación oral.',
    morphineRelief: 'Gracias doctor, el dolor del costado derecho se me calmó bastante. Ya no tengo tantas náuseas.',
    debriefRecommendation: 'Apendicitis: ayuno, no enemas, analgesia y destino quirúrgico. No alimentar por boca.',
    fallbackReplies: [
      { match: ['dónde', 'donde', 'ombligo', 'derecha'], reply: 'Empezó en el ombligo y ahora está bien abajo a la derecha.' },
      { match: ['come', 'hambre', 'náusea', 'nausea', 'vómito'], reply: 'No quiero ni oler comida. Tengo náuseas.' },
      { match: ['fiebre', 'temperatura'], reply: 'Creo que tengo un poco de fiebre, me siento caliente.' },
      { match: ['antecedentes', 'cirugías', 'cirugias'], reply: 'Sana, no tomo nada y no me operaron nunca.' },
    ],
  },
  'c-6': {
    openingMessage: 'Doctor... siento que el corazón se me dispara, como un aleteo. Empezó hace un rato tomando mate y me falta un poco el aire.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: PALPITACIONES. Taquiarritmia percibida, ansiedad.',
    phase0Voice: 'Ansiedad, palpitaciones. No dice "fibrilación auricular".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: TAQUIARRITMIA QUE DESCOMPENSA. Más disnea y mareo.',
    deteriorationVitals: { hr: 168, bp_sys: 88, bp_dia: 52, rr: 28, spo2: 91 },
    deteriorationMessage: 'Doctor... el corazón me va muchísimo más rápido... me mareo y me falta el aire...',
    reeval: {
      initial: 'Sigo con el aleteo en el pecho, doctor, pero puedo hablar.',
      deterioration: 'Peor... el corazón no para y se me va la vista...',
      recovery: 'Ahora late más despacio, doctor, me alivió.',
      shock: 'Me apago... no siento el pulso igual...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Taquiarritmia: ABC, ECG, estabilidad hemodinámica. Si inestable, cardioversión; si estable, control de frecuencia.',
    morphineRelief: 'Estoy un poco más calma, doctor, pero el aleteo sigue.',
    debriefRecommendation: 'FA rápida: ECG, decidir según estabilidad. No betabloquees si está hipotensa.',
    fallbackReplies: [
      { match: ['cuándo', 'cuando', 'empezó'], reply: 'Hace dos horas, tomando mate. De golpe el corazón se me disparó.' },
      { match: ['dolor', 'pecho'], reply: 'No es un dolor fuerte de pecho, es como un golpeteo rápido, un aleteo.' },
      { match: ['presión', 'hipertens', 'antecedentes'], reply: 'Soy hipertensa, tomo enalapril, a veces me olvido.' },
    ],
  },
  'c-7': {
    openingMessage: 'Doctor... no puedo respirar... al acostarme me ahogo, tuve que sentarme en la cama... siento el pecho pesado.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DISNEA / ORTOPNEA. Congestión, no infarto típico.',
    phase0Voice: 'Habla sentado, con dificultad. No dice "edema agudo de pulmón".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: INSUFICIENCIA RESPIRATORIA POR CONGESTIÓN. Peor SatO2.',
    deteriorationVitals: { hr: 122, bp_sys: 170, bp_dia: 98, rr: 34, spo2: 84 },
    deteriorationMessage: 'Doctor... me estoy ahogando... no me entra aire... siento burbujas en el pecho...',
    reeval: {
      initial: 'Me falta el aire, sobre todo si me acuesto, doctor.',
      deterioration: 'Peor... me ahogo sentado también...',
      recovery: 'Ahora respiro un poco mejor, doctor.',
      shock: 'No... no entra aire... me muero...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Ortopnea y congestión: O2, posición, diurético. NO cargues fluidos.',
    morphineRelief: 'Un poco más tranquilo el ahogo, doctor... igual el pecho está pesado.',
    debriefRecommendation: 'ICC descompensada: oxígeno, Fowler, furosemida. Los fluidos agravan el edema pulmonar.',
    fallbackReplies: [
      { match: ['acost', 'dormir', 'noche'], reply: 'Al acostarme me ahogo. Tuve que quedarme sentado en el borde de la cama.' },
      { match: ['sal', 'comí', 'comi', 'cena'], reply: 'Ayer cené picada y cosas saladas. Hoy amanecí así.' },
      { match: ['antecedentes', 'corazón', 'presión'], reply: 'Soy hipertenso y me dijeron que tengo insuficiencia cardíaca.' },
    ],
  },
  'c-8': {
    openingMessage: 'Doctor, me duele la pierna izquierda de una manera insoportable. La siento dura, tensa, y si estiro los dedos es peor.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DOLOR DESPROPORCIONADO en pierna post-trauma. Tensión de pantorrilla.',
    phase0Voice: 'Dolor extremo localizado. No dice "síndrome compartimental".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DOLOR QUE EMPEORA. Más tensión, parestesias.',
    deteriorationVitals: { hr: 118, bp_sys: 140, bp_dia: 90, rr: 22, spo2: 97 },
    deteriorationMessage: 'Doctor... el dolor de la pierna es salvaje... se me duermen los dedos... no la banco más...',
    reeval: {
      initial: 'La pantorrilla está dura y el dolor es desproporcionado, doctor.',
      deterioration: 'Peor... hormigueo y dolor al mover los dedos...',
      recovery: 'Con la analgesia lo tolero un poco más, pero sigue dura.',
      shock: 'No siento la pierna... me mareo del dolor...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Dolor desproporcionado + tensión: pensar compartimental. No yeso circular cerrado.',
    morphineRelief: 'Uff... la morfina me alivió un poco este dolor salvaje en la pierna... aunque la siento dura.',
    debriefRecommendation: 'Compartimental: sospecha clínica, no cerrar con yeso, destino a fasciotomía urgente.',
    fallbackReplies: [
      { match: ['accidente', 'moto', 'cuándo', 'cuando'], reply: 'Choqué en moto hace tres horas. Desde entonces el dolor no para y va a peor.' },
      { match: ['dedos', 'estirar', 'dura'], reply: 'Si me estiran los dedos del pie es insoportable. La pantorrilla está como piedra.' },
    ],
  },
  'c-9': {
    openingMessage: 'Doctor... me caí de una pared de escalada... se me ve el hueso en la pierna y no para de sangrar...',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: FRACTURA EXPUESTA con sangrado. Dolor y ansiedad.',
    phase0Voice: 'Miedo, dolor, ve el hueso. No da clases de Gustilo.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: SANGRADO PERSISTENTE / HIPOVOLMIA.',
    deteriorationVitals: { hr: 128, bp_sys: 82, bp_dia: 48, rr: 26, spo2: 94 },
    deteriorationMessage: 'Doctor... me siento débil... sigo sangrando... tengo frío y temblores...',
    reeval: {
      initial: 'Se ve el hueso y sangra, doctor. El dolor es terrible.',
      deterioration: 'Estoy peor, más débil, el sangrado no corta...',
      recovery: 'Con la compresión y el suero me siento más estable.',
      shock: 'Me apago... no tengo fuerzas...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Fractura expuesta: controlar hemorragia, volumen, no suturar en guardia. Destino quirúrgico.',
    morphineRelief: 'El dolor de la pierna aflojó un poco, doctor... igual da miedo mirarla.',
    fluidsRelief: 'Gracias doctor... el sangrado paró con la compresión y los líquidos me revivieron.',
    debriefRecommendation: 'Expuesta: control de hemorragia, expansión, ATB/tétanos según protocolo, quirófano. No suturar en el box.',
    fallbackReplies: [
      { match: ['cómo', 'como', 'cayó', 'caí', 'palestra'], reply: 'Me caí de unos 3 metros en la palestra. La pierna se dobló y se ve el hueso.' },
      { match: ['vacuna', 'tétanos', 'tetanos'], reply: 'Tengo las vacunas al día, también la del tétanos.' },
    ],
  },
  'c-10': {
    openingMessage: 'Doctor... me picó una avispa en el cuello... se me hincharon los labios y siento que se me cierra la garganta...',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: REACCIÓN ALÉRGICA SISTÉMICA. Urticaria, disnea, angioedema.',
    phase0Voice: 'Miedo a no poder respirar. No dice "anafilaxia".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: OBSTRUCCIÓN DE VÍA AÉREA / SHOCK ANAFILÁCTICO.',
    deteriorationVitals: { hr: 138, bp_sys: 78, bp_dia: 42, rr: 32, spo2: 86 },
    deteriorationMessage: 'Doctor... no me entra aire... silbo... se me hincha más el cuello...',
    reeval: {
      initial: 'Me pica todo y se me hincharon los labios, doctor. Me cuesta tragar.',
      deterioration: 'Peor... la garganta cerrada... no puedo...',
      recovery: 'Ahora me entra mejor el aire, doctor, la hinchazón aflojó un poco.',
      shock: 'No... no respiro... oscuro...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Vía aérea que se cierra: adrenalina IM YA. No demores con estudios ni betabloqueantes.',
    morphineRelief: 'El picor sigue, doctor, pero no era eso lo que me ahogaba...',
    debriefRecommendation: 'Anafilaxia: adrenalina IM inmediata, O2, reevaluación. Cualquier demora de primera línea es inaceptable.',
    fallbackReplies: [
      { match: ['picadura', 'avispa', 'cuándo', 'cuando'], reply: 'Hace veinte minutos, en el jardín. Una avispa en el cuello.' },
      { match: ['alergia', 'antes'], reply: 'Soy alérgico a picaduras, pero nunca me había pasado tan fuerte.' },
    ],
  },
  'c-11': {
    openingMessage: 'Doctor... me duele la boca del estómago y se me va para la espalda como un cinturón. Vomité varias veces y no tolero ni el agua.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DOLOR EPIGÁSTRICO EN BANDA, vómitos, intolerancia oral.',
    phase0Voice: 'Dolor intenso, náuseas. No dice "pancreatitis".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DOLOR QUE EMPEORA, más deshidratación.',
    deteriorationVitals: { hr: 118, bp_sys: 100, bp_dia: 62, rr: 24, spo2: 94 },
    deteriorationMessage: 'Doctor... el cinturón de dolor está peor... vomito otra vez... no doy más...',
    reeval: {
      initial: 'Dolor en la boca del estómago que se va a la espalda, doctor.',
      deterioration: 'Peor, no tolero nada y el dolor no para...',
      recovery: 'Con el suero y el ayuno el dolor dio un respiro.',
      shock: 'Me retuerzo... me mareo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Dolor en banda y vómitos: NPO, fluidos, no alimentar. Pensar páncreas/biliar.',
    morphineRelief: 'El dolor de panza aflojó un poco, doctor. Gracias.',
    fluidsRelief: 'Con el suero y el ayuno el dolor de panza me dio un respiro... ya no tengo tantas náuseas.',
    debriefRecommendation: 'Pancreatitis: ayuno, fluidos, analgesia. Alimentar por boca empeora el cuadro.',
    fallbackReplies: [
      { match: ['vesícula', 'piedras', 'antecedentes'], reply: 'Me dijeron que tengo piedras en la vesícula hace un par de años, no me operé.' },
      { match: ['dónde', 'donde', 'espalda', 'cinturón', 'cinturon'], reply: 'En la boca del estómago y se me va a la espalda, como un cinturón.' },
    ],
  },
  'c-12': {
    openingMessage: 'Doctor... estoy re débil, tengo una sed que no se me pasa y respiro raro, como profundo. Se me olvidó la insulina unos días.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DESCOMPENSACIÓN METABÓLICA. Sed, poliuria, respiración profunda.',
    phase0Voice: 'Cansancio, sed, no nombra "cetoacidosis" aunque sepa que es diabético.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: EMPEORAMIENTO. Más Kussmaul, más deshidratación.',
    deteriorationVitals: { hr: 124, bp_sys: 86, bp_dia: 48, rr: 30, spo2: 94 },
    deteriorationMessage: 'Doctor... me mareo... respiro cada vez más profundo... la panza me duele...',
    reeval: {
      initial: 'Mucha sed, orino todo el tiempo y estoy muy débil, doctor.',
      deterioration: 'Peor... la cabeza no me da... respiro raro...',
      recovery: 'Un poco menos mareado, doctor.',
      shock: 'Se me apaga todo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Diabético descompensado: fluidos + insulina IV. No lo mandes a quirófano por el dolor abdominal.',
    morphineRelief: 'El dolor de panza aflojó un poco, pero sigo con mucha sed.',
    debriefRecommendation: 'CAD: rehidratación e insulina IV. El abdomen puede ser trampa; no operes sin corregir el medio interno.',
    fallbackReplies: [
      { match: ['insulina', 'diabetes', 'azúcar', 'azucar'], reply: 'Soy diabético tipo 1. Se me olvidó la Lantus estos dos días, estaba de viaje.' },
      { match: ['sed', 'orina', 'pis'], reply: 'Tomo agua sin parar y voy al baño cada rato.' },
      { match: ['aliento', 'manzana', 'olor'], reply: 'Algunos me dijeron que tengo olor dulce en el aliento.' },
    ],
  },
  'c-13': {
    openingMessage: 'Doctor, traje a mi mamá. Desde ayer fiebre alta, hoy casi no responde, habla cosas sin sentido. Antes le ardía al orinar.',
    openingSender: 'companion',
    forceCompanionSpeaker: true,
    phase0Label: 'ESTADO CLÍNICO ACTUAL: ANCIANA FEBRIL Y CONFUSA. La interlocutora es la hija.',
    phase0Voice: 'La hija preocupada, concreta. La paciente está confusa; no inventes lucidez.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DETERIORO SÉPTICO. Más obnubilación, peor hemodinamia.',
    deteriorationVitals: { hr: 132, bp_sys: 78, bp_dia: 40, rr: 28, spo2: 88 },
    deteriorationMessage: 'Doctor... se me está yendo, ya no me reconoce... está helada de las manos...',
    deteriorationSender: 'companion',
    reeval: {
      initial: 'Sigue febril y confusa, doctor, pero todavía responde a ratos.',
      deterioration: 'Está peor, casi no responde y se puso muy pálida...',
      recovery: 'Ahora un poco más despierta, doctor, el color mejoró.',
      shock: '¡No responde! Por favor...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Anciana febril y confusa: sepsis hasta demostrar lo contrario. Fluidos, ATB precoz. No betabloquees.',
    morphineRelief: 'Se quedó más quieta, doctor, pero igual la veo muy caída.',
    fluidsRelief: 'Con el suero le volvió un poco el color, doctor. Sigue débil pero mejor.',
    debriefRecommendation: 'Urosepsis: reconocimiento precoz, volumen, antibióticos IV. El betabloqueo anula la compensación.',
    fallbackReplies: [
      { match: ['fiebre', 'temperatura'], reply: 'Ayer 39 grados, con escalofríos. Hoy amaneció así de confusa.' },
      { match: ['orina', 'pis', 'ardor'], reply: 'Los días previos se quejaba de ardor al orinar.' },
      { match: ['antecedentes', 'diabetes', 'presión'], reply: 'Es diabética, hipertensa y tiene infecciones de orina seguido. Toma metformina y enalapril.' },
    ],
  },
  'c-14': {
    openingMessage: 'Doctor... siento que la cabeza me va a explotar... veo borroso, luces... estoy mareado y medio perdido.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: CEFALEA + HTA SEVERA + visión borrosa.',
    phase0Voice: 'Cefalea intensa, ansiedad. No dice "encefalopatía hipertensiva".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: EMERGENCIA HIPERTENSIVA QUE EMPEORA.',
    deteriorationVitals: { hr: 102, bp_sys: 230, bp_dia: 128, rr: 22, spo2: 95 },
    deteriorationMessage: 'Doctor... no veo bien... la cabeza peor... me estoy confundiendo...',
    reeval: {
      initial: 'Cabeza insoportable y visión borrosa, doctor.',
      deterioration: 'Peor... más confuso... la cabeza explota...',
      recovery: 'Un poco más claro, doctor, la presión en la cabeza aflojó.',
      shock: 'Se me va la vista del todo...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] HTA con daño de órgano: descenso CONTROLADO. Evitá caídas bruscas con IECA sublingual empírico.',
    morphineRelief: 'La cabeza aflojó un poco, doctor.',
    debriefRecommendation: 'Emergencia hipertensiva: descenso titulado en UTI/monitoreo, no desplomes la TA de golpe.',
    fallbackReplies: [
      { match: ['pastilla', 'medicación', 'medicacion', 'presión', 'presion'], reply: 'Soy hipertenso. Dejé las pastillas hace tres meses porque me sentía bien.' },
      { match: ['visión', 'vision', 'luces'], reply: 'Veo luces y borroso, como si no enfocara.' },
    ],
  },
  'c-15': {
    openingMessage: 'Doctor... me levanté una caja y sentí un dolor desgarrante en la espalda alta, como si me arrancaran algo por dentro...',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DOLOR DORSAL DESGARRANTE de inicio súbito. HTA.',
    phase0Voice: 'Dolor atroz, miedo. No dice "disección aórtica".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DOLOR QUE MIGRA / INESTABILIDAD.',
    deteriorationVitals: { hr: 118, bp_sys: 188, bp_dia: 108, rr: 24, spo2: 94 },
    deteriorationMessage: 'Doctor... ahora el dolor se me fue al pecho y la panza... es peor, me muero...',
    reeval: {
      initial: 'Dolor desgarrante en la espalda alta, doctor. Empezó de golpe.',
      deterioration: 'Peor... se mueve el dolor... me falta el aire...',
      recovery: 'Con esa inyección el corazón va más despacio y el dolor aflojó un poco.',
      shock: 'Se me rompió algo adentro... todo negro...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Dolor desgarrante + HTA: pensar aorta. Control de FC/TA. No manipules ni tracciones.',
    morphineRelief: 'El dolor de la espalda aflojó un poco, doctor, pero sigue ese desgarro.',
    debriefRecommendation: 'Disección: control de frecuencia y tensión, no maniobras traumáticas, destino cardiovascular/UTI. No es un lumbago.',
    fallbackReplies: [
      { match: ['caja', 'peso', 'cuándo', 'cuando'], reply: 'Hace una hora, al levantar una caja pesada. De golpe, desgarrante.' },
      { match: ['presión', 'hipertens'], reply: 'Soy hipertenso hace años y no tomo bien la medicación.' },
    ],
  },
  'c-16': {
    openingMessage: 'Doctor... me duele toda la panza, vomité varias veces, tengo mucha sed y voy al baño cada rato. Estoy re débil.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: DOLOR ABDOMINAL + deshidratación + polidipsia. Trampa metabólica.',
    phase0Voice: 'Duele la panza, pero también sed y debilidad. No se autodiagnostica.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: EMPEORAMIENTO METABÓLICO con abdomen que engaña.',
    deteriorationVitals: { hr: 126, bp_sys: 82, bp_dia: 46, rr: 30, spo2: 94 },
    deteriorationMessage: 'Doctor... la panza peor... respiro raro... no tengo fuerzas...',
    reeval: {
      initial: 'Panza dolorida, mucha sed y vómitos, doctor.',
      deterioration: 'Peor... débil y con respiración rara...',
      recovery: 'Un poco menos mareado, doctor.',
      shock: 'Me apago...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Abdomen + diabético que omitió insulina: pensá CAD antes de mandarlo a quirófano.',
    morphineRelief: 'El dolor de panza aflojó un poco, doctor.',
    debriefRecommendation: 'CAD que simula abdomen agudo: corregí medio interno. Quirófano sin corrección puede ser fatal.',
    fallbackReplies: [
      { match: ['diabetes', 'insulina'], reply: 'Soy diabético tipo 1. Ayer y hoy no me puse la insulina porque no tenía hambre.' },
      { match: ['sed', 'orina', 'pis'], reply: 'Sed terrible y orino todo el tiempo.' },
    ],
  },
  'c-17': {
    openingMessage: 'Doctor, me duele el hombro y el cuello derecho desde hace unas horas. Casi no lo puedo mover. Después de almorzar fritura también tuve una molestia arriba en la panza.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: OMALGIA + molestia epigástrica postprandial. Dolor referido posible.',
    phase0Voice: 'Se queja del hombro. Si preguntan a fondo, aparece la molestia abdominal. No dice "colecistitis".',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DOLOR QUE SE HACE MÁS BILIAR / FEBRIL.',
    deteriorationVitals: { hr: 108, bp_sys: 102, bp_dia: 62, rr: 22, spo2: 95 },
    deteriorationMessage: 'Doctor... ahora me duele más arriba a la derecha de la panza... y el hombro sigue...',
    reeval: {
      initial: 'El hombro derecho no me deja, doctor. También una molestia en la boca del estómago.',
      deterioration: 'Peor la puntada de la panza y un poco de calor...',
      recovery: 'Un poco más cómoda, doctor.',
      shock: 'Me mareo y la panza me parte...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Hombro derecho + dispepsia: no trates solo el hombro. Buscá abdomen biliar.',
    morphineRelief: 'El hombro y la panza aflojaron un poco, doctor.',
    debriefRecommendation: 'Dolor referido biliar: anamnesis completa, no manipular el hombro como si fuera trauma.',
    fallbackReplies: [
      { match: ['hombro', 'cuello', 'mov'], reply: 'El hombro derecho y la base del cuello. No es que me lo golpeé.' },
      { match: ['panza', 'estómago', 'estomago', 'almuerzo', 'fritura'], reply: 'Después de unas frituras tuve una molestia arriba a la derecha y náuseas.' },
      { match: ['vesícula', 'barro', 'antecedentes'], reply: 'Me habían dicho que tengo barro biliar, vesícula perezosa.' },
    ],
  },
  'c-18': {
    openingMessage: 'Doctor... me duele la boca del estómago, una acidez terrible, sudé frío y vomité. Tomé un antiácido y no hizo nada. Me falta un poco el aire.',
    phase0Label: 'ESTADO CLÍNICO ACTUAL: EPIGASTRALGIA OPRESIVA + cortejo vegetativo. Trampa coronaria inferior.',
    phase0Voice: 'Cree que es el estómago. No dice "infarto". Si preguntan bien, aparecen sudor y disnea.',
    phase1Label: 'ESTADO CLÍNICO ACTUAL: DETERIORO. Más hipotensión, más malestar epigástrico.',
    deteriorationVitals: { hr: 58, bp_sys: 78, bp_dia: 44, rr: 26, spo2: 90 },
    deteriorationMessage: 'Doctor... me mareo mucho... el dolor de estómago no para... se me apaga la vista...',
    reeval: {
      initial: 'Boca del estómago, acidez, sudor frío. El antiácido no hizo nada.',
      deterioration: 'Peor... mareo y falta de aire... el estómago igual...',
      recovery: 'Con el suero me volvió un poco el alma al cuerpo, doctor.',
      shock: 'Me desmayo... no me entra aire...',
    },
    hintPriority: '⚠️ [ORIENTACIÓN] Epigastralgia + vegetatismo: hacé ECG. Cuidado con nitroglicerina si hay hipotensión / infarto inferior.',
    morphineRelief: 'El dolor de estómago aflojó un poco, doctor.',
    fluidsRelief: 'Uff, doctor... con el suero rápido me volvió el alma al cuerpo... se me pasó esa sensación de desmayo.',
    debriefRecommendation: 'IAM inferior: ECG, fluidos si VD, NUNCA nitroglicerina si está hipotenso o hay compromiso de VD.',
    fallbackReplies: [
      { match: ['antiácido', 'antiacido', 'estómago', 'estomago', 'acidez'], reply: 'Pensé que era acidez. Tomé un antiácido y no se movió nada. Sudé frío.' },
      { match: ['fuma', 'tabaco', 'diabetes', 'presión'], reply: 'Fumo un atado, soy hipertenso y diabético, tomo metformina.' },
      { match: ['pecho', 'brazo'], reply: 'Más que el pecho, es la boca del estómago. Un peso, no una puntada.' },
    ],
  },
};

export function getCaseRuntime(caseObj: ClinicalCase): CaseRuntimeProfile {
  const base = genericProfile(caseObj);
  const override = PROFILES[caseObj.id] || {};
  return {
    ...base,
    ...override,
    reeval: { ...base.reeval, ...override.reeval },
    deteriorationVitals: { ...base.deteriorationVitals, ...override.deteriorationVitals },
    fallbackReplies: override.fallbackReplies || base.fallbackReplies,
  };
}

export function matchFallbackReply(profile: CaseRuntimeProfile, userMessage: string, hasCompanion: boolean): string {
  const lower = userMessage.toLowerCase();
  const hit = profile.fallbackReplies.find(entry => entry.match.some(token => lower.includes(token)));
  if (hit) return hit.reply;
  return hasCompanion
    ? 'No sabría decirle exactamente doctor, pero lo veo peor que de costumbre.'
    : 'No estoy seguro, doctor. Pregúnteme más concreto y le digo lo que siento.';
}
