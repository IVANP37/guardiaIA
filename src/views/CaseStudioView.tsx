import { PenTool, Brain, Sparkles, CheckCircle2, Copy } from 'lucide-react';

export function CaseStudioView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-6 h-6 text-indigo-400" />
            Case Studio
          </h1>
          <p className="text-sm text-slate-400">Creación y gestión de escenarios clínicos con IA</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            Mis Casos
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generar Caso con IA
          </button>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Prompt AI */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              Generador IA
            </h2>
            <div className="relative">
              <textarea 
                className="w-full h-32 bg-[#05070A] border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                placeholder="Ej: Crear un caso de Cardiología para estudiantes de quinto año. Dificultad intermedia. Paciente argentino. Duración 20 min. Evaluar anamnesis y diagnóstico diferencial."
              />
              <button className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generar
              </button>
            </div>
          </div>

          {/* Generated Case Preview */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white">Crisis Hipertensiva #042</h3>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Borrador IA</span>
                </div>
                <p className="text-sm text-slate-400">Generado hoy, 18:42 • Basado en Protocolo HUSG v3.2</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded flex items-center gap-2 text-sm border border-slate-700">
                  <PenTool className="w-4 h-4" />
                  Editar
                </button>
                <button className="bg-green-600/10 hover:bg-green-600/20 text-green-500 border border-green-500/30 px-3 py-1.5 rounded flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Validar Caso
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Info Column */}
              <div className="col-span-1 space-y-4">
                <div className="bg-[#05070A] p-4 rounded-xl border border-slate-800">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Metadata</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-600">Especialidad</div>
                      <div className="text-sm text-slate-300">Medicina Interna</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-600">Nivel</div>
                      <div className="text-sm text-slate-300">Residencia 1° Año</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-600">Dificultad</div>
                      <div className="text-sm text-amber-400 font-medium">Intermedia-Alta</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#05070A] p-4 rounded-xl border border-slate-800">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Generación Masiva</h4>
                  <p className="text-xs text-slate-400 mb-4">Crea múltiples variantes clínicas manteniendo los objetivos educativos.</p>
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded flex items-center justify-center gap-2 text-sm border border-slate-700 transition-colors">
                    <Copy className="w-4 h-4" />
                    Generar 20 Variantes
                  </button>
                </div>
              </div>

              {/* Content Column */}
              <div className="col-span-2 space-y-4">
                <div className="bg-[#05070A] p-4 rounded-xl border border-slate-800">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Asignación Automática IA
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-indigo-400 font-bold">Act</div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Virtual Actor</div>
                        <div className="text-xs text-slate-300 font-mono">MALE_60_75_02 <span className="text-slate-500">(Reutilizado)</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-emerald-400 font-bold">Env</div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Clinical Environment</div>
                        <div className="text-xs text-slate-300 font-mono">EMERGENCY_BOX_01 <span className="text-slate-500">(Reutilizado)</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-blue-400 font-bold">Vox</div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Voice Profile</div>
                        <div className="text-xs text-slate-300 font-mono">ES_AR_MALE_65</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-amber-400 font-bold">St</div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Initial Visual State</div>
                        <div className="text-xs text-slate-300 font-mono">MODERATE_PAIN</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#05070A] p-4 rounded-xl border border-slate-800">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Estructura Clínica</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 font-medium mb-1">Motivo de Consulta</div>
                      <div className="text-sm text-slate-300">Cefalea intensa y mareos de 3 horas de evolución.</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium mb-1">Diagnóstico Real</div>
                      <div className="text-sm text-slate-300">Emergencia hipertensiva con daño a órgano blanco (encefalopatía).</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium mb-1">Competencias Evaluadas</div>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Anamnesis</span>
                        <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Manejo Inicial</span>
                        <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Farmacología</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
