import { ClinicalCase, VitalSigns } from '../types';

type LogMap = Record<string, string>;

const GENERIC_LOGS: LogMap = {
  ECG: 'RESULTADO ECG: Ritmo sinusal. Sin supradesnivel del ST. Sin bloqueos nuevos. No hay patrón de SCACEST.',
  LAB: 'RESULTADO LABORATORIO: Hemograma sin leucocitosis marcada. Iones y creatinina conservados. Troponina negativa. Glucemia en rango.',
  RX_TORAX: 'RESULTADO RX TÓRAX: Campos pulmonares sin infiltrados ni edema. Silueta cardíaca habitual. No neumotórax.',
  ECO_POCUS: 'RESULTADO POCUS: Función ventricular conservada. Sin derrame pericárdico. IVC no colapsada. Sin hallazgo dirigido de SCA.',
  EXAMEN_FISICO: 'Examen físico: estado general conservado. Hallazgos dirigidos al motivo de consulta, sin signos de shock.',
  EVAL_NEURO: 'Evaluación neurológica: Glasgow 15/15. Pupilas isocóricas y reactivas. Sin foco motor.',
  TC_CRANEO: 'RESULTADO TC DE CEREBRO: Sin hemorragia, masa ni desviación de línea media. No explica un cuadro extra-neurológico.',
  SCORE_TIMI_KILLIP: 'Estratificación TIMI/Killip: no aplicable a este motivo de consulta. No sustituye el diagnóstico del caso.',
  TAC_TRAUMA: 'RESULTADO TAC DE TRAUMA: Sin lesiones traumáticas graves. Estudio no dirigido al motivo de consulta actual.',
  PRESION_COMPARTIMENTAL: 'Presión compartimental: no elevada. El miembro no presenta síndrome compartimental.',
  GLUCEMIA: 'RESULTADO GLUCEMIA CAPILAR: 98 mg/dL. No explica el cuadro de ingreso.',
};

const PLAYBOOKS: Record<string, LogMap> = {
  'c-1': {
    ECG: 'RESULTADO ECG: Ritmo sinusal. Supradesnivel del ST de 3 mm en cara anteroseptal (V1-V4). Compatible con SCACEST anterior.',
    LAB: 'RESULTADO LABORATORIO: Troponina T ultrasensible positiva (0.08 ng/mL). CPK 340 UI/L. Creatinina 1.0. K 4.2. Hemograma normal.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Silueta cardíaca en límites. Campos libres. Sin ensanchamiento mediastinal ni congestión franca.',
    ECO_POCUS: 'RESULTADO POCUS: Hipocinesia de cara anterior y septum. Fey estimada 48%. Sin derrame pericárdico.',
    EXAMEN_FISICO: 'Examen físico: sudoración, palidez. R1-R2 conservados. Pulsos simétricos. No ingurgitación yugular marcada.',
    EVAL_NEURO: 'Evaluación neurológica: lúcido, Glasgow 15/15. Ansioso por el dolor precordial. Sin foco.',
    TC_CRANEO: 'RESULTADO TC DE CEREBRO: Normal. No explica el dolor torácico. Demora innecesaria si hay SCA en curso.',
    SCORE_TIMI_KILLIP: 'Estratificación: Killip I. TIMI 4 (riesgo moderado-alto). Compatible con SCA.',
  },
  'c-100': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal acorde a fiebre/edad. Sin supradesnivel ni arritmia. No hay patrón de SCA (no aplica al lactante).',
    LAB: 'RESULTADO LABORATORIO: Leucocitos 11.800. PCR 28. Glucemia 92. Na 138. K 4.0. Urea levemente elevada. Troponina negativa (no indicada).',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin infiltrados ni condensación. No justifica el decaimiento por neumonía evidente.',
    ECO_POCUS: 'RESULTADO POCUS: Corazón normal. IVC colapsable (sugiere hipovolemia). Sin derrame.',
    EXAMEN_FISICO: 'Examen físico: lactante febril, somnolienta, mucosas secas, llenado capilar 3 s, pañal poco húmedo. Sin rash. Fontanela deprimida.',
    EVAL_NEURO: 'Evaluación neurológica: reactiva al estímulo, sin foco. Irritable al manejo. No rigidez de nuca evidente.',
    TC_CRANEO: 'RESULTADO TC DE CEREBRO: Normal. Irradiación innecesaria en lactante febril sin signos de HTEC.',
    SCORE_TIMI_KILLIP: 'TIMI/Killip no aplican en pediatría. No aportan al caso de deshidratación febril.',
    GLUCEMIA: 'RESULTADO GLUCEMIA CAPILAR: 92 mg/dL. No es una hipoglucemia. El cuadro es fiebre y deshidratación.',
  },
  'c-3': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal febril. Trazado pediátrico sin isquemia. No SCA.',
    LAB: 'RESULTADO LABORATORIO: Leucocitos 13.200. PCR 42. Glucemia 98. Iones normales. Troponina negativa.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin condensación. No explica la odinofagia.',
    ECO_POCUS: 'RESULTADO POCUS: Cardíaco normal. IVC intermedia.',
    EXAMEN_FISICO: 'Examen físico: niño febril, irritable, eritema faríngeo, adenopatías cervicales leves. Hidratación límite. Sin meningismo.',
    EVAL_NEURO: 'Glasgow 15. Irritable con la fiebre. Sin foco motor ni fotofobia franca.',
    TC_CRANEO: 'RESULTADO TC: Normal. No indicada como primera línea en faringitis febril.',
    SCORE_TIMI_KILLIP: 'Los puntajes coronarios TIMI/Killip no aplican en este niño.',
    GLUCEMIA: 'RESULTADO GLUCEMIA CAPILAR: 98 mg/dL. No es hipoglucemia. El cuadro es faringitis febril.',
  },
  'c-2': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Sin supradesnivel. Compatible con dolor, anemia aguda o hipovolemia. No SCACEST.',
    LAB: 'RESULTADO LABORATORIO: Hb 9.4 g/dL. Lactato 3.8. Creatinina 1.1. Troponina negativa. Coagulación conservada.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin neumotórax a tensión. Sin ensanchamiento mediastinal franco. Posible contusión costal. No edema pulmonar.',
    ECO_POCUS: 'RESULTADO FAST/POCUS: Líquido libre en receso de Morrison. Sin taponamiento. IVC colapsada (hipovolemia).',
    EXAMEN_FISICO: 'Examen físico: palidez, frialdad, pierna deformada, dolor abdominal y torácico. Pulsos filiformes. Penicilina: alergia referida.',
    EVAL_NEURO: 'Glasgow 14-15. Pudo haber TCE (sin casco). Responde, quejosa. Reevaluar vía aérea y conciencia.',
    TC_CRANEO: 'RESULTADO TC: Sin hemorragia masiva evidente en esta adquisición. El shock no se explica por el cerebro: priorizar abdomen/pelvis y volumen.',
    SCORE_TIMI_KILLIP: 'No es un score de politrauma. No reemplaza ABCDE.',
    TAC_TRAUMA: 'RESULTADO TAC DE TRAUMA: Líquido libre perihepático. Pelvis sin sangrado arterial franco. Cráneo sin hematoma masivo. Fémur izquierdo deformado. El shock es hipovolémico: priorizar volumen, hemoderivados y control de hemorragia, no demorar por más cortes.',
    PRESION_COMPARTIMENTAL: 'Presión compartimental de pierna izquierda: no en rango de fasciotomía. El problema es politrauma y hemorragia, no compartimental establecido.',
  },
  'c-4': {
    ECG: 'RESULTADO ECG: Bradicardia sinusal. Sin supradesnivel. Compatible con respuesta de Cushing, no con SCACEST.',
    LAB: 'RESULTADO LABORATORIO: Troponina negativa. Coagulación conservada. Iones normales. Leucocitos 9.800.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Normal. No ensanchamiento mediastinal. No explica la cefalea en estallido.',
    ECO_POCUS: 'RESULTADO POCUS: Función biventricular conservada. Sin derrame. No sustituye la neuroimagen.',
    EXAMEN_FISICO: 'Examen físico: fotofobia, rigidez de nuca, palidez. TA elevada con bradicardia. Fondo de ojo no valorable aquí.',
    EVAL_NEURO: 'Glasgow 14/15. Somnoliento, fotofobia, rigidez nucal, sin hemiparesia franca. Signos de alarma de HTEC/HSA.',
    TC_CRANEO: 'RESULTADO TC DE CEREBRO SIN CONTRASTE: Hiperdensidad en cisternas basales compatible con HSA. Sin herniación franca aún. Requiere UTI y no vasodilatadores.',
    SCORE_TIMI_KILLIP: 'No aplica. El cuadro es neurológico, no coronario.',
  },
  'c-5': {
    ECG: 'RESULTADO ECG: Ritmo sinusal. Sin isquemia. El dolor en FID no es coronario.',
    LAB: 'RESULTADO LABORATORIO: Leucocitos 14.600 con neutrofilia. PCR 56. Troponina negativa. β-hCG negativa. Amilasa normal.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Normal. No aporta al abdomen agudo.',
    ECO_POCUS: 'RESULTADO ECO A PIE DE CAMA: Dolor exquisito en FID. No se visualiza apéndice con certeza. Sin líquido libre masivo. No hay discinesia cardíaca.',
    EXAMEN_FISICO: 'Examen físico: defensa y dolor en FID, signo de Blumberg dudoso, no distensión masiva. Febrícula. Ayuno indicado.',
    EVAL_NEURO: 'Glasgow 15. Sin foco. El cuadro es abdominal.',
    TC_CRANEO: 'RESULTADO TC CEREBRO: Normal. Estudio equivocado para apendicitis.',
    SCORE_TIMI_KILLIP: 'No aplica a abdomen agudo.',
  },
  'c-6': {
    ECG: 'RESULTADO ECG: Fibrilación auricular con respuesta ventricular rápida (~140 lpm). Sin supradesnivel del ST. No es un SCACEST.',
    LAB: 'RESULTADO LABORATORIO: Troponina negativa. TSH pendiente. K 4.0. Creatinina 0.9. Hemograma normal.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin congestión franca. Silueta no muy aumentada.',
    ECO_POCUS: 'RESULTADO POCUS: Fey conservada. Aurícula izquierda algo dilatada. Sin WMA regional de SCA. Sin trombo visible.',
    EXAMEN_FISICO: 'Examen físico: irregularmente irregular, ansiosa, bien perfundida si TA estable. Sin dolor opresivo típico.',
    EVAL_NEURO: 'Glasgow 15. Sin déficit. Si hay inestabilidad, el problema es hemodinámico por la FA.',
    TC_CRANEO: 'RESULTADO TC: Normal. Las palpitaciones no son un ACV en este momento.',
    SCORE_TIMI_KILLIP: 'TIMI no es el score de FA. Priorizar estabilidad y control de frecuencia o cardioversión si inestable.',
  },
  'c-7': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Sobrecarga ventricular izquierda. Sin supradesnivel. No SCACEST.',
    LAB: 'RESULTADO LABORATORIO: Troponina negativa o mínimamente elevada no diagnóstica de IAM. Creatinina 1.3. Na 134. Hemograma sin anemia aguda.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Congestión hiliar, redistribución de flujo, líneas B de Kerley. Compatible con edema pulmonar. No neumotórax.',
    ECO_POCUS: 'RESULTADO POCUS: Fey reducida (~35%). Líneas B bilaterales difusas. IVC dilatada y poco colapsable (congestión, no hipovolemia).',
    EXAMEN_FISICO: 'Examen físico: ortopnea, crepitantes, ingurgitación, edemas. No es un abdomen ni un SCA típico.',
    EVAL_NEURO: 'Glasgow 15. Disnea limita el habla, no hay foco neurológico.',
    TC_CRANEO: 'RESULTADO TC: Normal. El problema es pulmonar/cardíaco de congestión.',
    SCORE_TIMI_KILLIP: 'Killip II-III por congestión. No sustituye diurético y no fluidos.',
  },
  'c-8': {
    ECG: 'RESULTADO ECG: Sinusal. Sin isquemia. El dolor es del miembro, no coronario.',
    LAB: 'RESULTADO LABORATORIO: CPK elevada por músculo. K 4.4. Creatinina 0.9. Troponina negativa. Hb normal.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Normal. No aporta al compartimento de la pierna.',
    ECO_POCUS: 'RESULTADO POCUS: Cardíaco normal. Doppler/compartimento no reemplaza la clínica: dolor desproporcionado y pantorrilla tensa.',
    EXAMEN_FISICO: 'Examen físico: pantorrilla pétrea, dolor a la extensión pasiva de dedos, palidez distal relativa. Pulsos aún presentes (no descarta compartimental).',
    EVAL_NEURO: 'Glasgow 15. Parestesias del pie izquierdo.',
    TC_CRANEO: 'RESULTADO TC: Normal. Caso ortopédico/vascular de miembro.',
    SCORE_TIMI_KILLIP: 'No aplica.',
    TAC_TRAUMA: 'RESULTADO TAC DE TRAUMA: Sin lesiones de torso. Demora innecesaria: el diagnóstico de compartimental es clínico y de presión, no de tomógrafo.',
    PRESION_COMPARTIMENTAL: 'Presión compartimental anterior 48 mmHg. ΔP (TAM − P compartimental) < 30 mmHg. Criterio de fasciotomía urgente. Pulsos distales aún presentes no descartan el diagnóstico.',
  },
  'c-9': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Sin STE. Compatible con dolor y pérdida de volumen.',
    LAB: 'RESULTADO LABORATORIO: Hb 10.1 en descenso. Lactato 2.9. Troponina negativa. Coagulación conservada.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Normal. El foco es la pierna expuesta.',
    ECO_POCUS: 'RESULTADO POCUS: Sin taponamiento. IVC colapsable. FAST negativo. El sangrado es externo/óseo.',
    EXAMEN_FISICO: 'Examen físico: hueso expuesto, sangrado pulsátil, dolor intenso. Priorizar hemorragia, volumen y no suturar en el box.',
    EVAL_NEURO: 'Glasgow 15. Sin TCE.',
    TC_CRANEO: 'RESULTADO TC: Normal.',
    SCORE_TIMI_KILLIP: 'No aplica.',
    TAC_TRAUMA: 'RESULTADO TAC DE TRAUMA: Sin lesión de torso. El foco es la fractura expuesta y el sangrado externo: no sustituye control de hemorragia, volumen y pase a quirófano.',
    PRESION_COMPARTIMENTAL: 'Presión compartimental no elevada. El cuadro es fractura expuesta con hemorragia, no síndrome compartimental.',
  },
  'c-10': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Sin SCA. El problema es vía aérea y anafilaxia.',
    LAB: 'RESULTADO LABORATORIO: No retrasa la adrenalina. Hemograma posterior: no cambia la primera línea. Troponina no indicada ahora.',
    RX_TORAX: 'RESULTADO RX TÓRAX: No demorar vía aérea. Sin condensación. Puede haber hiperinsuflación.',
    ECO_POCUS: 'RESULTADO POCUS: Corazón hiperdinámico. Sin taponamiento. No reemplaza adrenalina IM.',
    EXAMEN_FISICO: 'Examen físico: urticaria, angioedema labial, estridor, sibilancias. Shock distributivo posible.',
    EVAL_NEURO: 'Ansioso, lúcido si perfunde. Si se cierra la vía, cae la conciencia.',
    TC_CRANEO: 'RESULTADO TC: Contraindicado como primer paso: se muere en el tomógrafo.',
    SCORE_TIMI_KILLIP: 'No aplica. Primera línea: adrenalina IM.',
  },
  'c-11': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Sin supradesnivel. El dolor en banda no es un IAM inferior (aunque hay que pensarlo: acá el ECG no muestra SCA).',
    LAB: 'RESULTADO LABORATORIO: Lipasa 1.240 U/L. Amilasa 680. Leucocitos 13.900. Troponina negativa. Glucemia 148. Ca 8.4.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin derrame masivo. No edema agudo.',
    ECO_POCUS: 'RESULTADO POCUS: Sin discinesia inferoposterior. Vesícula con barro/pared algo engrosada. No líquido libre masivo.',
    EXAMEN_FISICO: 'Examen físico: dolor epigástrico a la palpación, íleo leve, no defensa generalizada aún. Náuseas. NPO.',
    EVAL_NEURO: 'Glasgow 15.',
    TC_CRANEO: 'RESULTADO TC cerebro: Normal. El páncreas no se ve en este estudio.',
    SCORE_TIMI_KILLIP: 'No aplica. Lipasa > ECG.',
  },
  'c-12': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Ondas T inespecíficas. Sin STE. No infarto.',
    LAB: 'RESULTADO LABORATORIO: Glucemia 428 mg/dL. Cetonas positivas. K 5.1. Na 132. HCO3 bajo / acidosis metabólica. Troponina negativa. Leucocitos 11.000.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin condensación. Respiración de Kussmaul no es neumonía.',
    ECO_POCUS: 'RESULTADO POCUS: IVC colapsada (deshidratación). Función cardíaca conservada.',
    EXAMEN_FISICO: 'Examen físico: deshidratado, aliento afrutado, respiración profunda, abdomen blando aunque doloroso (no peritonitis franca).',
    EVAL_NEURO: 'Obnubilación leve. Sin foco. Compatible con descompensación metabólica.',
    TC_CRANEO: 'RESULTADO TC: Normal. Corregir CAD antes de perseguir ACV.',
    SCORE_TIMI_KILLIP: 'No aplica.',
    GLUCEMIA: 'RESULTADO GLUCEMIA CAPILAR: 428 mg/dL. Hiperglucemia crítica. No esperar el lab para iniciar fluidos; la insulina va con reposición de K.',
  },
  'c-13': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Sin STE.',
    LAB: 'RESULTADO LABORATORIO: Leucocitos 18.400. PCR 160. Lactato 4.2. Creatinina 1.8. Glucemia 210. EMO: nitritos +, piuria. Troponina negativa.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin condensación franca. El foco es urinario/sepsis.',
    ECO_POCUS: 'RESULTADO POCUS: IVC colapsable. Corazón hiperdinámico. Sin vegetación evidente.',
    EXAMEN_FISICO: 'Examen físico: anciana febril, mal perfundida, puño-percusión dudosa, confusa. Shock séptico hasta demostrar lo contrario.',
    EVAL_NEURO: 'Confusa, no focal. Delirium / hipoperfusión. No es un ACV típico.',
    TC_CRANEO: 'RESULTADO TC: Sin sangrado. La confusión es sepsis hasta que se cubra el foco.',
    SCORE_TIMI_KILLIP: 'No aplica. Priorizar ATB y volumen.',
  },
  'c-14': {
    ECG: 'RESULTADO ECG: HVI con sobrecarga. Sin supradesnivel. No SCACEST. TA 200 no se trata con IECA sublingual empírico.',
    LAB: 'RESULTADO LABORATORIO: Creatinina 1.4. Troponina negativa. Hemograma normal. No cocaína documentada.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Sin edema franco en esta placa.',
    ECO_POCUS: 'RESULTADO POCUS: HVI. Fey conservada. Sin WMA aguda.',
    EXAMEN_FISICO: 'Examen físico: cefalea, visión borrosa, agitado. Sin déficit motor franco.',
    EVAL_NEURO: 'Confusión leve, no hemiparesia. Emergencia hipertensiva con daño de órgano (encefalopatía).',
    TC_CRANEO: 'RESULTADO TC: Sin hemorragia ni ACV isquémico masivo visible. No autoriza bajar la TA de golpe con Enalapril VO.',
    SCORE_TIMI_KILLIP: 'No es un SCA. Descenso TITULADO, no SL empírico de IECA.',
  },
  'c-15': {
    ECG: 'RESULTADO ECG: HVI. Sin supradesnivel típico de SCACEST anterior. El dolor desgarrante no se “cierra” con un infarto de V1-V4.',
    LAB: 'RESULTADO LABORATORIO: Troponina negativa o dudosa. Creatinina 1.2. Hb estable. D-dímero no específico.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Mediastino no claramente ensanchado. No descarta disección. No congestión típica de EAP.',
    ECO_POCUS: 'RESULTADO POCUS: Sin WMA regional clara. Aorta torácica no se ve bien por ventana. No taponamiento aún.',
    EXAMEN_FISICO: 'Examen físico: dolor desgarrante, HTA, pulsos a valorar. No es un lumbago mecánico típico.',
    EVAL_NEURO: 'Lúcido. Si aparecen síncope o déficit, peor pronóstico.',
    TC_CRANEO: 'RESULTADO TC cerebro: Normal. El estudio que falta es angioTAC de aorta, no cráneo.',
    SCORE_TIMI_KILLIP: 'Pensar aorta, no solo TIMI.',
    TAC_TRAUMA: 'RESULTADO ANGIOTAC DE AORTA / TAC TRAUMA: Flap intimal en aorta torácica descendente compatible con disección. No es lumbago ni trauma osteomuscular. Derivar a cirugía vascular / UTI, no a quirófano general de trauma.',
    PRESION_COMPARTIMENTAL: 'Presión compartimental normal. El dolor desgarrante no es del compartimento de la pierna.',
  },
  'c-16': {
    ECG: 'RESULTADO ECG: Taquicardia sinusal. Sin STE. El “abdomen agudo” no es apendicitis en el trazado: buscar metabólico.',
    LAB: 'RESULTADO LABORATORIO: Glucemia 396 mg/dL. Cetonas +++. Acidosis. K 5.0. Leucocitos 12.000 (no prueba apendicitis). Troponina negativa.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Normal.',
    ECO_POCUS: 'RESULTADO POCUS: IVC colapsada. Sin líquido libre. Apéndice no es el hallazgo. Corazón normal.',
    EXAMEN_FISICO: 'Examen físico: abdomen doloroso DIFUSO sin defensa localizada clara, deshidratación, sed, polipnea. No Blumberg nítido.',
    EVAL_NEURO: 'Débil, lúcido. No foco.',
    TC_CRANEO: 'RESULTADO TC: Normal.',
    SCORE_TIMI_KILLIP: 'No aplica. Insulina + fluidos, no quirófano.',
    GLUCEMIA: 'RESULTADO GLUCEMIA CAPILAR: 396 mg/dL. El “abdomen agudo” es CAD hasta demostrar lo contrario. No mandar a quirófano.',
  },
  'c-17': {
    ECG: 'RESULTADO ECG: Sinusal. Sin isquemia. El hombro derecho no es un SCA ni un manguito por sí solo.',
    LAB: 'RESULTADO LABORATORIO: Leucocitos 13.100. PCR 48. FA y GGT elevadas. Bilirrubina 1.8. Lipasa normal-limítrofe. Troponina negativa.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Normal. No explica omalgia referida.',
    ECO_POCUS: 'RESULTADO POCUS: Murphy sonográfico positivo / pared vesicular engrosada. Hombro sin derrame traumático. Corazón normal.',
    EXAMEN_FISICO: 'Examen físico: hombro sin hematoma ni deformidad. Dolor a la palpación de hipocondrio derecho si se busca. Postprandial.',
    EVAL_NEURO: 'Glasgow 15.',
    TC_CRANEO: 'RESULTADO TC cerebro: Normal. El cuello no es un ACV.',
    SCORE_TIMI_KILLIP: 'No aplica. Es biliar referido, no trauma de hombro.',
  },
  'c-18': {
    ECG: 'RESULTADO ECG: Bradicardia relativa. Supradesnivel del ST en II, III y aVF. Compatible con IAM INFERIOR. Valorar V3R-V4R (VD). No es gastritis.',
    LAB: 'RESULTADO LABORATORIO: Troponina positiva. CPK elevada. Creatinina 1.1. Glucemia 168. Hemograma sin anemia.',
    RX_TORAX: 'RESULTADO RX TÓRAX: Campos libres. No perforación con aire libre evidente en esta placa.',
    ECO_POCUS: 'RESULTADO POCUS: Hipocinesia inferior. VD dilatado/hipokinético. Sin derrame. Cuidado con nitratos (depende de precarga).',
    EXAMEN_FISICO: 'Examen físico: palidez, sudor, epigastrio opresivo, hipoperfusión. Abdomen blando. No es un abdomen quirúrgico típico.',
    EVAL_NEURO: 'Glasgow 15. Mareo por bajo gasto, no ACV.',
    TC_CRANEO: 'RESULTADO TC: Normal. El tiempo es del ECG y la reperfusión, no del tomógrafo.',
    SCORE_TIMI_KILLIP: 'SCA inferior. Killip I-II. Priorizar ECG, fluidos si VD, NO nitroglicerina.',
  },
};

export function getActionSystemLog(caseId: string, actionId: string, fallback?: string): string | undefined {
  const caseLogs = PLAYBOOKS[caseId];
  if (caseLogs?.[actionId]) return caseLogs[actionId];
  if (GENERIC_LOGS[actionId]) return GENERIC_LOGS[actionId];
  return fallback;
}

/** Track de cierre (destino/procedimiento) según el diagnóstico real, no el disfraz del triage. */
export function getResolutionTrack(caseObj: ClinicalCase): string {
  switch (caseObj.id) {
    case 'c-18':
      return 'Cardiología';
    case 'c-17':
      return 'Guardia General';
    default:
      return caseObj.specialty;
  }
}

export interface RecoveryApply {
  phase: 2;
  vitals: Partial<VitalSigns> & { temp?: number };
  message: string;
  sender: 'patient' | 'companion';
}

export function getRecoveryEffect(
  caseId: string,
  actionId: string,
  givenActionIds: string[]
): RecoveryApply | null {
  const companion = (msg: string, vitals: RecoveryApply['vitals']): RecoveryApply => ({
    phase: 2,
    vitals,
    message: msg,
    sender: 'companion',
  });
  const patient = (msg: string, vitals: RecoveryApply['vitals']): RecoveryApply => ({
    phase: 2,
    vitals,
    message: msg,
    sender: 'patient',
  });

  if (actionId === 'PARACETAMOL' && (caseId === 'c-100' || caseId === 'c-3')) {
    return companion(
      caseId === 'c-100'
        ? 'Doctor, con el antitérmico ya no está tan calentita y se quedó un poco más tranquila.'
        : 'Doctor, con el antitérmico le bajó un poco la fiebre y está menos irritable.',
      { temp: 37.4, hr: caseId === 'c-100' ? 128 : 118, rr: caseId === 'c-100' ? 28 : 26 }
    );
  }

  if (actionId === 'POSICION_FOWLER' && caseId === 'c-7') {
    return patient(
      'Doctor... sentado así me entra un poco mejor el aire, ya no me ahogo tanto como acostado.',
      { spo2: 95, rr: 20, hr: 96 }
    );
  }

  if ((actionId === 'ASPIRINA' || actionId === 'CLOPIDOGREL' || actionId === 'HEPARINA') && caseId === 'c-18') {
    return patient(
      'El peso de la boca del estómago aflojó un poco, doctor... igual sigo débil.',
      { spo2: 96, rr: 18 }
    );
  }

  if (actionId === 'ANTIBIOTICOS_IV' && caseId === 'c-9') {
    return patient(
      'Entendido doctor, ya me pasaron el antibiótico. La pierna sigue abierta, pero me siento más contenido.',
      {}
    );
  }

  if (actionId === 'INSULINA_IV' && caseId === 'c-16') {
    const hasFluids = givenActionIds.includes('FLUIDOS') || givenActionIds.includes('EXPANSION_AGRESIVA');
    if (!hasFluids) return null;
    return patient(
      'Doctor... con el suero y la insulina se me está yendo esa respiración tan rara y el mareo.',
      { hr: 92, bp_sys: 108, bp_dia: 64, rr: 18, spo2: 97 }
    );
  }

  if (actionId === 'ATB_NO_PENICILINA' && (caseId === 'c-2' || caseId === 'c-9')) {
    return patient(
      caseId === 'c-2'
        ? 'Gracias doctor, me preguntaron si era alérgica y me pusieron otro antibiótico. No me picó nada.'
        : 'Me pasaron un antibiótico distinto, doctor. La pierna sigue abierta, pero no me siento mal del suero.',
      {}
    );
  }

  if (actionId === 'NORADRENALINA' && caseId === 'c-13') {
    return companion(
      'Doctor, con esa infusión la presión le está subiendo y se la nota un poco más presente... sigue grave, pero ya no tan apagada.',
      { hr: 98, bp_sys: 108, bp_dia: 62, spo2: 95 }
    );
  }

  if (actionId === 'VIA_AEREA' && caseId === 'c-10') {
    return patient(
      'Doctor... con el tubo ya me entra el aire. Sigo hinchado, pero no me ahogo igual.',
      { spo2: 97, rr: 16, hr: 100 }
    );
  }

  if (actionId === 'COLLAR_CERVICAL' && caseId === 'c-2') {
    return patient(
      'Me pusieron el collar, doctor. El cuello está firme. Sigo con dolor en la panza y la pierna.',
      {}
    );
  }

  if (actionId === 'K_IV' && (caseId === 'c-12' || caseId === 'c-16')) {
    return patient(
      'Me están pasando el potasio, doctor. Las piernas me duelen menos calambres.',
      {}
    );
  }

  return null;
}
