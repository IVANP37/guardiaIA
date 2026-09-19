import { motion } from 'motion/react';
import { ClinicalAction, MedicationDoseOption } from '../types';

interface DosePickerModalProps {
  action: ClinicalAction;
  onSelect: (dose: MedicationDoseOption) => void;
  onClose: () => void;
}

export function DosePickerModal({ action, onSelect, onClose }: DosePickerModalProps) {
  const options = action.doseOptions || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-[#0b0f16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <header className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">{action.label}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Indicá la dosis a administrar. Después podés repetir o subirla. La evolución la marca el caso y lo que ya se dio, no esta elección sola.</p>
        </header>
        <div className="p-3 flex flex-col gap-2">
          {options.map(dose => (
            <button
              key={dose.id}
              type="button"
              onClick={() => onSelect(dose)}
              className="w-full text-left px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/70 hover:bg-indigo-950/30 transition-colors"
            >
              <div className="text-sm font-bold text-slate-100">{dose.label}</div>
            </button>
          ))}
        </div>
        <footer className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            Cancelar
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
