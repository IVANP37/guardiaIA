const fs = require('fs');
let code = fs.readFileSync('src/views/SimulatorView.tsx', 'utf8');
code = code.replace(/activeCase\.sceneUrl/g, 'currentCase.sceneUrl');
code = code.replace(/activeCase\.patient\.avatarUrl/g, 'currentCase.patient.avatarUrl');
fs.writeFileSync('src/views/SimulatorView.tsx', code);
