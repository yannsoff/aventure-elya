// Audio-first speech engine built on the Web Speech API.
// FR (fr-FR) for instructions/encouragements, EN (en-GB) for learning content.
// Falls back gracefully (no-op + on-screen text) when speechSynthesis is missing.

type Lang = 'fr-FR' | 'en-GB';

let muted = false;
let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function loadVoices() {
  if (!supported) return;
  cachedVoices = window.speechSynthesis.getVoices();
  voicesLoaded = cachedVoices.length > 0;
}

if (supported) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  if (!voicesLoaded) loadVoices();
  const exact = cachedVoices.find((v) => v.lang === lang);
  if (exact) return exact;
  const prefix = lang.split('-')[0];
  // Prefer a voice from the same language family; favour higher-quality/local ones.
  const family = cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  return family.find((v) => v.localService) ?? family[0];
}

export function setMuted(value: boolean) {
  muted = value;
  if (muted && supported) window.speechSynthesis.cancel();
}

export function isMuted(): boolean {
  return muted;
}

export function cancelSpeech() {
  if (supported) window.speechSynthesis.cancel();
}

// Speak a single utterance. Resolves when speech ends (or immediately if muted/unsupported).
export function speak(text: string, lang: Lang = 'fr-FR', rate = 0.95): Promise<void> {
  return new Promise((resolve) => {
    if (!supported || muted || !text) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = lang === 'fr-FR' ? 1.15 : 1.05; // a touch brighter for a kids tone
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    // Safety: some browsers never fire onend; resolve after an estimated duration.
    const estMs = Math.min(8000, 600 + text.length * 70);
    setTimeout(() => resolve(), estMs);
    window.speechSynthesis.speak(u);
  });
}

export interface SpeechChunk {
  text: string;
  lang?: Lang;
}

// Speak a mixed FR/EN sequence in order (e.g. instruction FR + word EN).
export async function speakSequence(chunks: SpeechChunk[]): Promise<void> {
  for (const c of chunks) {
    // eslint-disable-next-line no-await-in-loop
    await speak(c.text, c.lang ?? 'fr-FR');
    if (muted) break;
  }
}
