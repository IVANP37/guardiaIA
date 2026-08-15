const fs = require('fs');
let code = fs.readFileSync('src/components/DebriefPanel.tsx', 'utf8');

// Add import
code = code.replace(
  `import clsx from 'clsx';`,
  `import clsx from 'clsx';\nimport { ResolvedSimulation } from '../types';`
);

// Add to props
code = code.replace(
  `interface DebriefPanelProps {`,
  `interface DebriefPanelProps {\n  resolvedSimulation?: ResolvedSimulation;`
);

// Add to component args
code = code.replace(
  `export function DebriefPanel({ onRetry }: DebriefPanelProps) {`,
  `export function DebriefPanel({ onRetry, resolvedSimulation }: DebriefPanelProps) {`
);

// Replace hardcoded values with variables
code = code.replace(
  `<span>PACIENTE: Carlos Méndez</span>`,
  `<span>PACIENTE: {resolvedSimulation?.baseCase?.patient?.name || 'Carlos Méndez'}</span>`
);
code = code.replace(
  `<span>ESCENARIO: Dolor Torácico</span>`,
  `<span>ESCENARIO: {resolvedSimulation?.baseCase?.title || 'Dolor Torácico'} ({resolvedSimulation?.config?.specialty || 'Cardiología'})</span>`
);
code = code.replace(
  `<span>NIVEL: Internado</span>`,
  `<span>NIVEL: {resolvedSimulation?.config?.level || 'Internado'}</span>`
);
code = code.replace(
  `<span className="text-amber-500">DIFICULTAD: Intermedia</span>`,
  `<span className={clsx(
              "font-bold",
              resolvedSimulation?.config?.difficulty === 'Fácil' && "text-emerald-500",
              (!resolvedSimulation || resolvedSimulation?.config?.difficulty === 'Intermedia') && "text-amber-500",
              resolvedSimulation?.config?.difficulty === 'Difícil' && "text-orange-500",
              resolvedSimulation?.config?.difficulty === 'Crítica' && "text-red-500"
            )}>DIFICULTAD: {resolvedSimulation?.config?.difficulty || 'Intermedia'} | MODO: {resolvedSimulation?.config?.mode || 'Caso individual'}</span>`
);

fs.writeFileSync('src/components/DebriefPanel.tsx', code);
