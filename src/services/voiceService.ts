/**
 * Voice Service for GuardIA
 * STT for the doctor (es-AR) and TTS for patient/companion.
 * Uses the most natural system voice available and speaks in phrases.
 */

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export interface VoiceRecognitionOptions {
  locale?: string;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export async function requestMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return true;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err) {
    console.warn('[GuardIA Voice] Error o rechazo de permiso de micrófono:', err);
    return false;
  }
}

export async function startVoiceRecognition(options: VoiceRecognitionOptions): Promise<{ stop: () => void } | null> {
  if (!isSpeechRecognitionSupported()) {
    options.onError?.(new Error('Speech recognition not supported in this browser'));
    return null;
  }

  const hasPermission = await requestMicrophonePermission();
  if (!hasPermission) {
    options.onError?.(new Error('Permiso de micrófono no otorgado en el navegador'));
    return null;
  }

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.lang = options.locale || 'es-AR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;

  let stopped = false;

  recognition.onstart = () => options.onStart?.();

  recognition.onresult = (event: any) => {
    let finalAccumulated = '';
    let interimAccumulated = '';

    for (let i = 0; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalAccumulated += (finalAccumulated ? ' ' : '') + transcript.trim();
      } else {
        interimAccumulated += (interimAccumulated ? ' ' : '') + transcript.trim();
      }
    }

    const currentCombined = (finalAccumulated + (interimAccumulated ? ' ' + interimAccumulated : '')).trim();
    if (currentCombined) {
      options.onResult(currentCombined, false);
    }
  };

  recognition.onerror = (event: any) => options.onError?.(event);
  recognition.onend = () => options.onEnd?.();

  try {
    recognition.start();
    return {
      stop: () => {
        if (!stopped) {
          stopped = true;
          try { recognition.stop(); } catch { /* ignore */ }
        }
      },
    };
  } catch (err) {
    options.onError?.(err);
    return null;
  }
}

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
let speakGeneration = 0;

export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSynthesisSupported()) return Promise.resolve([]);
  if (voicesReady) return voicesReady;

  voicesReady = new Promise(resolve => {
    const read = () => window.speechSynthesis.getVoices() || [];
    const now = read();
    if (now.length > 0) {
      resolve(now);
      return;
    }
    const finish = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(read());
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.setTimeout(finish, 1500);
  });

  return voicesReady;
}

function scoreVoice(voice: SpeechSynthesisVoice, gender: 'M' | 'F' | 'O'): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace('_', '-');
  let score = 0;

  if (/natural|neural|online|premium|enhanced|wavenet|studio/.test(name)) score += 55;
  if (lang === 'es-ar' || name.includes('argentin')) score += 40;
  if (/es-uy|es-419|es-mx|es-cl|es-co|es-pe|es-us/.test(lang) || /latin|m[eé]xico|colombia|chile|rioplat/.test(name)) {
    score += 28;
  }
  if (lang.startsWith('es')) score += 12;
  if (!voice.localService) score += 10;

  const femaleHint = /female|mujer|femenin|sabina|helena|dalia|paulina|luc[ií]a|elena|m[ií]a|sof[ií]a|paloma|elvira|monica|laura|valentina|paula/;
  const maleHint = /male|hombre|masculin|diego|jorge|raul|ra[uú]l|alvaro|álvaro|pablo|enrique|gerardo|carlos|tomas|tomás|mateo|miguel/;

  if (gender === 'F' && femaleHint.test(name)) score += 22;
  if (gender === 'M' && maleHint.test(name)) score += 22;
  if (gender === 'F' && maleHint.test(name)) score -= 18;
  if (gender === 'M' && femaleHint.test(name)) score -= 18;

  if (/desktop|mobile|compact|espeak|microsoft david|microsoft zira/.test(name) && !/natural|neural|online/.test(name)) {
    score -= 20;
  }

  return score;
}

export function getBestArgentineVoice(gender: 'M' | 'F' | 'O' = 'M'): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const ranked = [...voices].sort((a, b) => scoreVoice(b, gender) - scoreVoice(a, gender));
  return ranked[0] && scoreVoice(ranked[0], gender) > 0 ? ranked[0] : null;
}

export interface SpeakOptions {
  gender?: 'M' | 'F' | 'O';
  clinicalPhase?: number;
  age?: number;
  ageUnit?: 'años' | 'meses' | 'días';
  speaker?: 'patient' | 'companion';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

function prepareSpokenPhrases(raw: string): string[] {
  const cleaned = raw
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[*_`#]/g, '')
    .replace(/[—–]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const parts = cleaned
    .split(/(?:\.\.\.|…)+|(?<=[\.!\?])\s+/)
    .map(part => part.trim().replace(/^[,\s]+/, ''))
    .filter(part => part.length > 0);

  return parts.length ? parts : [cleaned];
}

function voiceProfile(options: SpeakOptions) {
  const phase = options.clinicalPhase ?? 0;
  const age = options.age ?? 45;
  const months = options.ageUnit === 'meses' || options.ageUnit === 'días';
  const companion = options.speaker === 'companion';

  let rate = 1.04;
  let pitch = 1.0;

  if (companion) {
    rate = options.gender === 'F' ? 1.06 : 1.02;
    pitch = options.gender === 'F' ? 1.08 : 0.96;
  } else if (months || age < 12) {
    rate = 1.08;
    pitch = 1.18;
  } else if (age >= 70) {
    rate = 0.96;
    pitch = options.gender === 'F' ? 1.02 : 0.9;
  } else if (age >= 50) {
    rate = 1.0;
    pitch = options.gender === 'F' ? 1.04 : 0.93;
  } else if (options.gender === 'F') {
    pitch = 1.06;
  }

  if (phase === 1) {
    rate -= 0.08;
    pitch += 0.03;
  } else if (phase === 2) {
    rate += 0.02;
  } else if (phase === 3) {
    rate -= 0.14;
    pitch -= 0.04;
  }

  return {
    rate: Math.min(1.18, Math.max(0.82, rate)),
    pitch: Math.min(1.25, Math.max(0.85, pitch)),
  };
}

function speakPhrases(
  phrases: string[],
  options: SpeakOptions,
  voice: SpeechSynthesisVoice | null,
  generation: number,
  index: number
) {
  if (generation !== speakGeneration) return;
  if (index >= phrases.length) {
    options.onEnd?.();
    return;
  }

  const profile = voiceProfile(options);
  const utterance = new SpeechSynthesisUtterance(phrases[index]);
  utterance.lang = voice?.lang || 'es-AR';
  if (voice) utterance.voice = voice;
  utterance.volume = 1;
  utterance.rate = profile.rate + (index % 2 === 0 ? 0.015 : -0.015);
  utterance.pitch = profile.pitch + (index % 3 === 0 ? 0.02 : 0);

  if (index === 0) {
    utterance.onstart = () => {
      if (generation === speakGeneration) options.onStart?.();
    };
  }

  utterance.onend = () => {
    if (generation !== speakGeneration) return;
    const short = phrases[index].length < 18;
    const breath = options.clinicalPhase === 1 || options.clinicalPhase === 3 || short;
    window.setTimeout(() => {
      speakPhrases(phrases, options, voice, generation, index + 1);
    }, breath ? 220 : 90);
  };

  utterance.onerror = (event) => {
    if (generation !== speakGeneration) return;
    console.warn('[GuardIA Voice] Error durante síntesis de voz:', event);
    options.onError?.(event);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function speakPatientResponse(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSynthesisSupported()) return;

  const phrases = prepareSpokenPhrases(text);
  if (!phrases.length) return;

  speakGeneration += 1;
  const generation = speakGeneration;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }

  const start = (voice: SpeechSynthesisVoice | null) => {
    if (generation !== speakGeneration) return;
    try { window.speechSynthesis.resume(); } catch { /* ignore */ }
    speakPhrases(phrases, options, voice, generation, 0);
  };

  const ready = getBestArgentineVoice(options.gender || 'M');
  if (ready) {
    window.setTimeout(() => start(ready), 40);
    return;
  }

  void preloadVoices().then(() => {
    if (generation !== speakGeneration) return;
    start(getBestArgentineVoice(options.gender || 'M'));
  });
}

export function stopPatientSpeech(): void {
  speakGeneration += 1;
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}
