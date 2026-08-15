const fs = require('fs');
let code = fs.readFileSync('src/views/SimulatorView.tsx', 'utf8');

// Use deteriorationMultiplier
code = code.replace(
  `const move = (current: number, target: number, step: number) => {`,
  `const multiplier = resolvedSimulation?.deteriorationMultiplier || 1.0;
        const move = (current: number, target: number, step: number) => {
          step = step * multiplier;`
);

// Adaptive help condition
code = code.replace(
  `// Adaptive Help System\n    let helpTimer: NodeJS.Timeout;\n    if (clinicalPhase === 1) {`,
  `// Adaptive Help System\n    let helpTimer: NodeJS.Timeout;\n    if (clinicalPhase === 1 && showHints) {`
);

// We can also lower the message threshold if multiplier is high
code = code.replace(
  `if (doctorMsgs.length === 3 && clinicalPhase === 0 && !currentCase.patient.companion) {`,
  `const triggerMsgs = (resolvedSimulation?.deteriorationMultiplier || 1.0) > 1.5 ? 1 : 3;
    if (doctorMsgs.length >= triggerMsgs && clinicalPhase === 0 && !currentCase.patient.companion) {`
);

fs.writeFileSync('src/views/SimulatorView.tsx', code);
