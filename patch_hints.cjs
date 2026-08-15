const fs = require('fs');
let code = fs.readFileSync('src/views/SimulatorView.tsx', 'utf8');

// Add a mentor hint in the UI if showHints is true.
// I'll place it under the header or above the chat.
const target = `{/* Tab Content */}`;
const replacement = `
            {/* AI Context / Configuration Hint */}
            {resolvedSimulation && (
              <div className="bg-slate-900/80 border-b border-indigo-900/30 p-2 lg:p-3 flex items-start gap-3 shrink-0">
                <Brain className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5 bg-indigo-500/10">{resolvedSimulation.config.specialty}</span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 bg-slate-800/50">{resolvedSimulation.config.level}</span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 bg-slate-800/50">{resolvedSimulation.config.difficulty}</span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 border border-amber-500/30 rounded px-1.5 py-0.5 bg-amber-500/10">{resolvedSimulation.config.mode}</span>
                  </div>
                  {showHints && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-indigo-300">Mentor:</span> {resolvedSimulation.systemPromptModifier}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content */}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/views/SimulatorView.tsx', code);
