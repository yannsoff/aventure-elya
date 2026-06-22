// Lightweight sound effects via the Web Audio API (no asset files needed).
// Soft, friendly tones only — never a harsh buzzer (confidence-first).

let ctx: AudioContext | null = null;
let sfxMuted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function setSfxMuted(value: boolean) {
  sfxMuted = value;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.18) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration);
}

function play(notes: { freq: number; at: number; dur: number; type?: OscillatorType }[]) {
  if (sfxMuted) return;
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
  notes.forEach((n) => tone(n.freq, n.at, n.dur, n.type ?? 'sine'));
}

export const sfx = {
  tap: () => play([{ freq: 660, at: 0, dur: 0.08 }]),
  correct: () => play([
    { freq: 660, at: 0, dur: 0.12 },
    { freq: 880, at: 0.1, dur: 0.16 },
  ]),
  star: () => play([
    { freq: 880, at: 0, dur: 0.1 },
    { freq: 1175, at: 0.08, dur: 0.12 },
    { freq: 1568, at: 0.16, dur: 0.16 },
  ]),
  // Gentle "try again" — descending but warm, never punishing.
  soft: () => play([
    { freq: 520, at: 0, dur: 0.14, type: 'triangle' },
    { freq: 440, at: 0.1, dur: 0.16, type: 'triangle' },
  ]),
  levelUp: () => play([
    { freq: 523, at: 0, dur: 0.12 },
    { freq: 659, at: 0.12, dur: 0.12 },
    { freq: 784, at: 0.24, dur: 0.12 },
    { freq: 1046, at: 0.36, dur: 0.22 },
  ]),
  chest: () => play([
    { freq: 392, at: 0, dur: 0.15 },
    { freq: 523, at: 0.15, dur: 0.15 },
    { freq: 659, at: 0.3, dur: 0.15 },
    { freq: 784, at: 0.45, dur: 0.15 },
    { freq: 1046, at: 0.6, dur: 0.3 },
  ]),
};

// Haptic feedback on supported mobile devices.
export function haptic(pattern: number | number[] = 30) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
