import { useCallback, useRef } from 'react';
import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let errorSynth: Tone.Synth | null = null;
let completeSynth: Tone.PolySynth | null = null;
let initialized = false;

async function initAudio() {
  if (initialized) return;
  try {
    await Tone.start();
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.6 },
      volume: -10,
    }).toDestination();

    completeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.05, release: 0.4 },
      volume: -12,
    }).toDestination();

    errorSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
      volume: -8,
    }).toDestination();

    initialized = true;
  } catch {
    // Audio init failed
  }
}

export function useSound(enabled: boolean) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const playCapture = useCallback(async () => {
    if (!enabledRef.current) return;
    await initAudio();
    if (!synth) return;
    const now = Tone.now();
    synth.triggerAttackRelease(['C5', 'E5'], '8n', now);
    synth.triggerAttackRelease(['G5'], '16n', now + 0.08);
  }, []);

  const playError = useCallback(async () => {
    if (!enabledRef.current) return;
    await initAudio();
    if (!errorSynth) return;
    errorSynth.triggerAttackRelease('A3', '32n');
  }, []);

  const playComplete = useCallback(async () => {
    if (!enabledRef.current) return;
    await initAudio();
    if (!completeSynth) return;
    const now = Tone.now();
    completeSynth.triggerAttackRelease(['C4', 'G4'], '8n', now);
  }, []);

  const playDelete = useCallback(async () => {
    if (!enabledRef.current) return;
    await initAudio();
    if (!errorSynth) return;
    errorSynth.triggerAttackRelease('G3', '16n');
  }, []);

  return { playCapture, playError, playComplete, playDelete };
}
