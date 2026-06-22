// Spoken FR encouragement phrases. {buddy} and {name} are replaced at runtime.
// Principle #1: confidence first — generous, warm, never punishing.

export const PRAISE: string[] = [
  'Bravo {name} !',
  'Tu es une championne !',
  "J'adore comme tu as essayé ce mot difficile !",
  'Waouh, quelle progression !',
  'Encore une étoile pour toi !',
  '{buddy} est super fier de toi !',
  'Magnifique, continue comme ça !',
  'Tu apprends tellement vite !',
  'Oh là là, tu es trop forte !',
];

// Said on a wrong first try — gentle, framed as a "magic mistake".
export const GENTLE_RETRY: string[] = [
  'Presque ! Essaie encore.',
  'Tu y es presque, encore un essai !',
  "Oups, une petite erreur magique ! On réessaie ?",
  "C'est en essayant qu'on grandit. Encore une fois !",
  'Pas grave du tout, réessaie tranquillement.',
];

// Said when revealing the correct answer after retries.
export const REVEAL_HELP: string[] = [
  'Regarde, le voilà ! Touche-le avec moi.',
  "Je t'aide un peu : c'est celui-ci !",
];

export const SESSION_START: string[] = [
  'On joue, {name} ! {buddy} est prêt !',
  'Allez {name}, en avant pour de nouvelles étoiles !',
];

export const SESSION_END: string[] = [
  'Bravo {name}, tu as fini ta séance !',
  'Quelle séance incroyable, {name} !',
];

export function fillPhrase(
  phrase: string,
  vars: { name: string; buddy: string },
): string {
  return phrase.replace(/\{name\}/g, vars.name).replace(/\{buddy\}/g, vars.buddy);
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
