// Guided SVG stroke paths for the Trace It writing game.
// Coordinates use a 100 x 120 viewBox (baseline ~100, x-height top ~44).
// Tolerance during tracing is large, so approximate single-path shapes are fine.

export const LETTER_PATHS: Record<string, string> = {
  s: 'M68,44 C68,32 32,32 32,46 C32,58 68,60 68,74 C68,90 32,90 32,76',
  d: 'M70,58 C70,44 38,44 38,58 C38,72 70,72 70,58 M70,28 L70,98',
  a: 'M64,58 C64,44 36,44 36,58 C36,72 64,72 64,58 M64,46 L64,98',
  c: 'M66,48 C40,34 32,48 32,60 C32,74 40,84 66,72',
  o: 'M50,44 C32,44 32,72 50,72 C68,72 68,44 50,44',
  e: 'M34,62 L66,62 C66,46 36,44 33,60 C30,78 50,82 64,70',
  l: 'M50,26 L50,98',
  i: 'M50,48 L50,98 M50,32 L50,35',
  t: 'M52,32 L52,98 M38,50 L66,50',
  n: 'M36,50 L36,98 M36,58 C44,46 64,46 64,60 L64,98',
  m: 'M32,50 L32,98 M32,58 C40,48 50,48 50,60 L50,98 M50,60 C58,48 68,48 68,60 L68,98',
  y: 'M34,50 L50,84 M66,50 L40,110',
  p: 'M36,50 L36,110 M36,58 C44,46 66,48 66,62 C66,76 44,78 36,68',
  r: 'M40,50 L40,98 M40,58 C48,48 62,48 66,54',
  E: 'M62,30 L38,30 L38,98 L62,98 M38,64 L58,64',
};

// The child's name, traced letter by letter at first launch and in writing sessions.
export const NAME_LETTERS = ['E', 'l', 'y', 'a'];
