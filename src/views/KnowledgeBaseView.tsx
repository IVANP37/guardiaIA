import { BookOpen, FileText, Upload, CheckCircle2 } from 'lucide-react';

export function KnowledgeBaseView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Protocolos & Knowledge Base
          </h1>
          <p className="text-sm text-slate-400">Gestiona los protocolos institucionales utilizados por la IA</p>
        </div>
        <div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Cargar Protocolo
          </button>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'Dolor Torácico en Guardia', version: '3.2', status: 'Validado', updated: 'Hace 2 meses', id: 'PROT-01' },
              { title: 'Crisis Asmática Pediátrica', version: '2.1', status: 'Validado', updated: 'Hace 15 días', id: 'PROT-02' },
              { title: 'Traumatismo Craneoencefálico', version: '1.4', status: 'Revisión', updated: 'Ayer', id: 'PROT-03' },
              { title: 'Manejo de Sepsis', version: '4.0', status: 'Validado', updated: 'Hace 6 meses', id: 'PROT-04' },
            ].map(prot => (
              <div key={prot.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors cursor-pointer flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  {prot.status === 'Validado' ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Validado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                      En Revisión
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-200 mb-1 leading-snug">{prot.title}</h3>
                <div className="text-xs text-slate-500 font-mono mb-4">{prot.id} • v{prot.version}</div>
                
                <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Actualizado: {prot.updated}</span>
                  <button className="text-indigo-400 hover:text-indigo-300 font-medium">Ver detalles</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
