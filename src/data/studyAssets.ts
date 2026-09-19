import ecgStemiAnterior from '../assets/studies/ecg-stemi-anterior.jpg';
import ecgStemiAnteriorEvolved from '../assets/studies/ecg-stemi-anterior-evolved.jpg';
import ecgStemiInferior from '../assets/studies/ecg-stemi-inferior.jpg';
import ecgSinus from '../assets/studies/ecg-sinus.jpg';
import ecgSinusBrady from '../assets/studies/ecg-sinus-brady.jpg';
import ecgSinusTach from '../assets/studies/ecg-sinus-tach.jpg';
import ecgAfRvr from '../assets/studies/ecg-af-rvr.jpg';
import ecgAfControlled from '../assets/studies/ecg-af-controlled.jpg';
import ecgLvh from '../assets/studies/ecg-lvh.jpg';
import rxNormal from '../assets/studies/rx-normal.jpg';
import rxEdema from '../assets/studies/rx-edema-interstitial.jpg';
import rxRibs from '../assets/studies/rx-ribs.jpg';
import rxTibia from '../assets/studies/rx-tibia.jpg';
import ctAortic from '../assets/studies/ct-aortic-dissection.png';
import ctBrainNormal from '../assets/studies/ct-brain-normal.png';
import ctSah from '../assets/studies/ct-sah.jpg';
import usGallbladder from '../assets/studies/us-gallbladder.jpg';
import usAppendix from '../assets/studies/us-appendix.jpg';
import usEcho from '../assets/studies/us-echo.jpg';
import usFastFluid from '../assets/studies/us-fast-fluid.jpg';
import usBlines from '../assets/studies/us-blines.jpg';
import ctAbdomenTrauma from '../assets/studies/ct-abdomen-trauma.jpg';

/** Trazados y placas reales (Wikimedia Commons, licencias libres). No son esquemas. */
export const STUDY_IMAGES = {
  'ecg-stemi-anterior': ecgStemiAnterior,
  'ecg-stemi-anterior-evolved': ecgStemiAnteriorEvolved,
  'ecg-stemi-inferior': ecgStemiInferior,
  'ecg-sinus': ecgSinus,
  'ecg-sinus-brady': ecgSinusBrady,
  'ecg-sinus-tach': ecgSinusTach,
  'ecg-af-rvr': ecgAfRvr,
  'ecg-af-controlled': ecgAfControlled,
  'ecg-lvh': ecgLvh,
  'rx-normal': rxNormal,
  'rx-edema': rxEdema,
  'rx-ribs': rxRibs,
  'rx-tibia': rxTibia,
  'ct-brain-normal': ctBrainNormal,
  'ct-sah': ctSah,
  'ct-aortic': ctAortic,
  'us-fast-fluid': usFastFluid,
  'us-echo': usEcho,
  'us-gallbladder': usGallbladder,
  'us-appendix': usAppendix,
  'us-blines': usBlines,
  'ct-abdomen-trauma': ctAbdomenTrauma,
} as const;

export type StudyImageKey = keyof typeof STUDY_IMAGES;
