const fs = require('fs');
let code = fs.readFileSync('src/views/SimulatorView.tsx', 'utf8');

// Replace activeCase with currentCase in the initialization
code = code.replace(
  `const [activeTab, setActiveTab] = useState<Tab>('interview');`,
  `const currentCase = resolvedSimulation?.baseCase || activeCase;
  const initialVitals = resolvedSimulation?.initialVitalsOverride || currentCase.patient.initialVitals;
  const assistanceLevel = resolvedSimulation?.assistanceLevel || 'MEDIUM';
  const showHints = assistanceLevel === 'HIGH' || assistanceLevel === 'MEDIUM';

  const [activeTab, setActiveTab] = useState<Tab>('interview');`
);

// Replace activeCase.patient with currentCase.patient
code = code.replace(/activeCase\.patient/g, 'currentCase.patient');
code = code.replace(/activeCase\.specialty/g, 'currentCase.specialty');
code = code.replace(/activeCase\.environmentId/g, 'currentCase.environmentId');

// Update vitals initialization
code = code.replace(
  `const [currentVitals, setCurrentVitals] = useState({    hr: currentCase.patient.initialVitals.hr,    bp_sys: currentCase.patient.initialVitals.bp_sys,    bp_dia: currentCase.patient.initialVitals.bp_dia,    spo2: currentCase.patient.initialVitals.spo2,    temp: currentCase.patient.initialVitals.temp,    rr: currentCase.patient.initialVitals.rr || 16  });`,
  `const [currentVitals, setCurrentVitals] = useState({ hr: initialVitals.hr, bp_sys: initialVitals.bp_sys, bp_dia: initialVitals.bp_dia, spo2: initialVitals.spo2, temp: initialVitals.temp, rr: initialVitals.rr || 16 });`
);

// We should also multiply the elapsed time if there's a deterioration multiplier.
code = code.replace(
  `const interval = setInterval(() => {      setCurrentVitals`,
  `const interval = setInterval(() => {      setCurrentVitals`
); // Let's just do a simpler replacement for the multiplier.

fs.writeFileSync('src/views/SimulatorView.tsx', code);
