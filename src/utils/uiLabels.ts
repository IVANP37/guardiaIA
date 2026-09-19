/** Etiquetas visibles en español. Los ids internos (enums) no se muestran crudos. */

export function labelClinicalState(state?: string): string {
  const map: Record<string, string> = {
    NORMAL: 'Estable',
    DOLOR_LEVE: 'Dolor leve',
    DOLOR_MODERADO: 'Dolor moderado',
    DOLOR_SEVERO: 'Dolor severo',
    ANSIEDAD: 'Ansiedad',
    DISNEA_LEVE: 'Disnea leve',
    DISNEA_MODERADA: 'Disnea moderada',
    DISNEA_SEVERA: 'Disnea severa',
    SOMNOLENCIA: 'Somnolencia',
    CONFUSION: 'Confusión',
    AGITACION: 'Agitación',
    DETERIORO: 'Deterioro',
    CRITICO: 'Crítico',
    INCONSCIENTE: 'Inconsciente',
    CRITICAL_DETERIORATION: 'Deterioro crítico',
    HYPOTENSIVE_SHOCK: 'Shock hipotensivo',
    RECOVERY_PHASE: 'Fase de recuperación',
    SINTOMÁTICO: 'Sintomático',
  };
  if (!state) return 'En evaluación';
  return map[state] || state.replace(/_/g, ' ').toLowerCase();
}

export function labelSafetyGrade(grade?: string): string {
  switch (grade) {
    case 'OPTIMAL':
      return 'Óptima';
    case 'APPROPRIATE':
      return 'Apropiada';
    case 'LATE':
      return 'Tardía';
    case 'INAPPROPRIATE':
      return 'Inapropiada';
    case 'UNNECESSARY':
      return 'Innecesaria';
    case 'POTENTIALLY_UNSAFE':
      return 'Riesgo clínico';
    default:
      return 'Registrada';
  }
}

export function labelClinicalPhase(phase: number, initialState?: string): string {
  if (phase === 1) return 'Deterioro crítico';
  if (phase === 2) return 'Fase de recuperación';
  if (phase === 3) return 'Shock hipotensivo';
  return labelClinicalState(initialState);
}
