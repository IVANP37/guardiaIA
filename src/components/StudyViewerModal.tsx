import { motion } from 'motion/react';
import { StudyVisualSpec, LabRow } from '../data/studyVisuals';

interface StudyViewerModalProps {
  spec: StudyVisualSpec;
  patientName: string;
  patientAge: number;
  ageUnit?: string;
  recordedAt: string;
  onClose: () => void;
}

function LabSlip({ rows }: { rows: LabRow[] }) {
  return (
    <div className="bg-[#f6f1e4] text-slate-900 rounded-sm p-5 font-mono text-xs shadow-inner border border-[#d7c9a3]">
      <div className="border-b border-dashed border-[#b9a57a] pb-2 mb-3 uppercase tracking-widest text-[10px] text-[#6b5a38]">
        Determinaciones
      </div>
      <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_1fr] gap-y-1.5 gap-x-2 text-[11px]">
        <div className="text-[#6b5a38]">Prueba</div>
        <div className="text-[#6b5a38] text-right">Resultado</div>
        <div className="text-[#6b5a38]">Unidad</div>
        <div className="text-[#6b5a38]">Referencia</div>
        {rows.map(row => (
          <div key={row.test} className="contents">
            <div className="font-semibold">{row.test}</div>
            <div className="text-right font-bold">{row.result}</div>
            <div>{row.unit}</div>
            <div className="text-[#6b5a38]">{row.ref}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Glucometer({ value }: { value: number }) {
  return (
    <div className="flex justify-center py-6">
      <div className="w-56 rounded-3xl bg-slate-800 border border-slate-600 p-5 shadow-2xl">
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 text-center">mg/dL</div>
        <div className="bg-[#0f2418] border border-emerald-900 rounded-xl py-6 text-center font-mono text-5xl text-emerald-300 tracking-wider">
          {value}
        </div>
        <div className="mt-3 text-[10px] text-slate-500 text-center">Glucómetro de cabecera</div>
      </div>
    </div>
  );
}

export function StudyViewerModal({ spec, patientName, patientAge, ageUnit, recordedAt, onClose }: StudyViewerModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#0b0f16] border border-slate-800 rounded-2xl shadow-2xl"
      >
        <header className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">{spec.title}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {patientName} · {patientAge} {ageUnit || 'años'} · {recordedAt}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{spec.techLine}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            Cerrar
          </button>
        </header>

        <div className="p-4 sm:p-5">
          {spec.imageSrc && (
            <div className="bg-[#111] p-3 rounded-lg shadow-[inset_0_0_60px_#000]">
              <img
                src={spec.imageSrc}
                alt={spec.imageAlt || spec.title}
                className="w-full h-auto max-h-[70vh] object-contain mx-auto bg-black"
              />
            </div>
          )}
          {spec.lab && <LabSlip rows={spec.lab} />}
          {typeof spec.glucoseMgDl === 'number' && <Glucometer value={spec.glucoseMgDl} />}
        </div>

        <footer className="px-5 py-3 border-t border-slate-800 text-[11px] text-slate-500">
          Estudio de guardia. Sin informe automático: la interpretación es tuya. Si repetís el estudio después de tratar, puede cambiar.
        </footer>
      </motion.div>
    </div>
  );
}

export function studyChipLabel(actionId: string): string {
  switch (actionId) {
    case 'ECG':
      return 'ECG';
    case 'RX_TORAX':
      return 'Rx tórax';
    case 'TC_CRANEO':
      return 'TC cerebro';
    case 'TAC_TRAUMA':
      return 'TAC trauma';
    case 'ECO_POCUS':
      return 'POCUS';
    case 'LAB':
      return 'Lab';
    case 'GLUCEMIA':
      return 'HGT';
    default:
      return actionId;
  }
}
