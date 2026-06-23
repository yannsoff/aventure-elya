import { HF_SET_1, HF_SET_2, HF_SET_3, Y2_EXCEPTION_WORDS } from './hfwords';

// Swipe flashcards ("WordSwipe" for reading, "NumSwipe" for maths).
// Parent-led: the child reads/answers aloud, the parent swipes right (su)
// or left (à revoir). Each card is an SRS item (mastery keyed by id).
// Content is English (the child is schooled in English); levels span Y1 -> Y3.

export type Deck = 'reading' | 'maths';
export type Level = 'Y1' | 'Y2' | 'Y3';

export interface Flashcard {
  id: string;
  deck: Deck;
  category: string; // FR label, also used as skillId for the SRS / parent dashboard
  front: string; // big content shown to the child
  back: string; // revealed answer / note (parent verification)
  speak?: string; // en-GB text pronounced on demand
  week: number; // 1..8 focus week of introduction
  level: Level;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

let _cards: Flashcard[] | null = null;

function build(): Flashcard[] {
  if (_cards) return _cards;
  const cards: Flashcard[] = [];
  const add = (c: Flashcard) => cards.push(c);

  // ---------------------------------------------------------------------------
  // READING (WordSwipe)
  // ---------------------------------------------------------------------------
  const word = (
    id: string,
    text: string,
    category: string,
    week: number,
    level: Level,
    back?: string,
  ) =>
    add({
      id,
      deck: 'reading',
      category,
      front: text,
      back: back ?? text,
      speak: text,
      week,
      level,
    });

  // High-frequency words (100), in 3 sets across the consolidate/reinforce weeks.
  HF_SET_1.forEach((w) => word(`r-hf-${slug(w)}`, w, 'Mots fréquents (set 1)', 1, 'Y1'));
  HF_SET_2.forEach((w) => word(`r-hf-${slug(w)}`, w, 'Mots fréquents (set 2)', 3, 'Y1'));
  HF_SET_3.forEach((w) => word(`r-hf-${slug(w)}`, w, 'Mots fréquents (set 3)', 5, 'Y1'));

  // Decodable single-syllable words to blend and read aloud.
  ['cat', 'dog', 'sun', 'hat', 'pig', 'bed', 'top', 'net', 'map', 'fish', 'ship',
   'chip', 'red', 'leg', 'van', 'bus', 'cup', 'hen', 'jam', 'log', 'fox', 'box',
   'pot', 'win', 'zip', 'wet', 'duck', 'frog', 'tree', 'rain']
    .forEach((w) => word(`r-cvc-${slug(w)}`, w, 'Lecture : petits mots', 1, 'Y1'));

  // Two-syllable decodable words (fluency).
  ['sunset', 'pocket', 'rabbit', 'basket', 'kitten', 'garden', 'picnic', 'magnet',
   'helmet', 'button', 'carpet', 'tennis', 'sandwich', 'dolphin', 'children', 'hundred']
    .forEach((w) => word(`r-syl-${slug(w)}`, w, 'Mots à 2 syllabes', 3, 'Y2'));

  // Suffix / ending words (-s, -es, -ing, -ed, -er, -est, un-).
  ['cats', 'boxes', 'wishes', 'jumping', 'running', 'played', 'hopped', 'faster',
   'taller', 'biggest', 'smallest', 'unhappy', 'unlock', 'undo', 'kissed', 'foxes']
    .forEach((w) => word(`r-suf-${slug(w)}`, w, 'Terminaisons (-ing, -ed, -er…)', 3, 'Y2'));

  // Contractions (apostrophe).
  [["I'll", 'I will'], ["I'm", 'I am'], ["we'll", 'we will'], ["don't", 'do not'],
   ["it's", 'it is'], ["can't", 'cannot'], ["didn't", 'did not'], ["isn't", 'is not'],
   ["that's", 'that is'], ["let's", 'let us'], ["he's", 'he is'], ["she's", 'she is']]
    .forEach(([w, exp]) => word(`r-con-${slug(w)}`, w, 'Contractions', 4, 'Y2', exp));

  // Year 2 common exception words.
  Y2_EXCEPTION_WORDS.concat(['would', 'should', 'could', 'great', 'clothes', 'busy',
    'money', 'half', 'friend', 'every', 'class', 'last', 'past', 'father', 'after'])
    .forEach((w) => word(`r-y2x-${slug(w)}`, w, 'Mots-pièges Year 2', 5, 'Y2'));

  // Richer Year 2 / Year 3 vocabulary (read + understand).
  [['enormous', 'très grand'], ['suddenly', 'soudain'], ['important', 'important'],
   ['gentle', 'doux'], ['whisper', 'chuchoter'], ['journey', 'voyage'],
   ['treasure', 'trésor'], ['brave', 'courageux'], ['curious', 'curieux'],
   ['delicious', 'délicieux'], ['magnificent', 'magnifique'], ['mysterious', 'mystérieux'],
   ['ancient', 'ancien'], ['fierce', 'féroce'], ['gigantic', 'gigantesque'],
   ['sparkle', 'scintiller'], ['discover', 'découvrir'], ['adventure', 'aventure']]
    .forEach(([w, fr]) => word(`r-voc-${slug(w)}`, w, 'Vocabulaire Y2/Y3', 5, 'Y3', `${w} — ${fr}`));

  // Year 2 sentences to read aloud (fluency + punctuation awareness).
  ['The big dog ran to the park.',
   'I can see a little bird in the tree.',
   'We went to the shop and bought some milk.',
   'She has a red hat and a blue bag.',
   'My mum made a cake for my birthday.',
   'The sun is hot and the sky is blue.']
    .forEach((s, i) => add({ id: `r-sen-${i}`, deck: 'reading', category: 'Phrases à lire', front: s, back: s, speak: s, week: 5, level: 'Y2' }));

  // Year 3 sentences with expression / inference (read with feeling).
  ['The children were excited about the long journey.',
   'Suddenly, the door opened with a loud bang!',
   'He felt sad because he had lost his favourite toy.',
   'The enormous dragon flew over the ancient castle.',
   '"Where are you going?" asked the curious little fox.']
    .forEach((s, i) => add({ id: `r-y3s-${i}`, deck: 'reading', category: 'Phrases Y3 (expression)', front: s, back: s, speak: s, week: 7, level: 'Y3' }));

  // ---------------------------------------------------------------------------
  // MATHS (NumSwipe)
  // ---------------------------------------------------------------------------
  const maths = (
    id: string,
    front: string,
    back: string,
    category: string,
    week: number,
    level: Level,
    speak?: string,
  ) => add({ id, deck: 'maths', category, front, back, speak, week, level });

  // Number bonds to 10.
  for (let p = 0; p <= 10; p++) {
    maths(`m-nb10-${p}`, `${p} + ? = 10`, `${10 - p}`, 'Compléments à 10', 1, 'Y1',
      `${p} plus what equals ten`);
  }

  // Number bonds to 20.
  [0, 1, 2, 5, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19].forEach((p) =>
    maths(`m-nb20-${p}`, `${p} + ? = 20`, `${20 - p}`, 'Compléments à 20', 3, 'Y2',
      `${p} plus what equals twenty`));

  // Doubles 1..10.
  for (let n = 1; n <= 10; n++) {
    maths(`m-dbl-${n}`, `double ${n}`, `${n * 2}`, 'Doubles', 3, 'Y2', `double ${n}`);
  }

  // Halves of even numbers.
  [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].forEach((n) =>
    maths(`m-half-${n}`, `half of ${n}`, `${n / 2}`, 'Moitiés', 3, 'Y2', `half of ${n}`));

  // One more / one less.
  [3, 6, 7, 9, 12, 15, 19].forEach((n) => {
    maths(`m-1more-${n}`, `1 more than ${n}`, `${n + 1}`, 'Un de plus / un de moins', 1, 'Y1');
    maths(`m-1less-${n}`, `1 less than ${n}`, `${n - 1}`, 'Un de plus / un de moins', 1, 'Y1');
  });

  // Ten more / ten less (Y2).
  [20, 34, 45, 52, 68].forEach((n) => {
    maths(`m-10more-${n}`, `10 more than ${n}`, `${n + 10}`, '10 de plus / de moins', 5, 'Y2');
    maths(`m-10less-${n}`, `10 less than ${n}`, `${n - 10}`, '10 de plus / de moins', 5, 'Y2');
  });

  // Add & subtract within 20.
  [[8, 5], [7, 6], [9, 4], [6, 7], [13, 5], [12, 8], [15, 6], [11, 9]].forEach(([a, b], i) => {
    maths(`m-add-${i}`, `${a} + ${b} = ?`, `${a + b}`, 'Additions (≤20)', 5, 'Y2');
    maths(`m-sub-${i}`, `${a + b} - ${b} = ?`, `${a}`, 'Soustractions (≤20)', 5, 'Y2');
  });

  // 2-digit + 1-digit and + tens (Y2).
  [[23, 5], [34, 4], [46, 3], [40, 30], [50, 20], [27, 10]].forEach(([a, b], i) =>
    maths(`m-2d-${i}`, `${a} + ${b} = ?`, `${a + b}`, 'Nombres à 2 chiffres', 5, 'Y2'));

  // Times tables 2, 5, 10 (Y2) and 3, 4 (Y3).
  ([[2, 'Y2', 5], [5, 'Y2', 5], [10, 'Y2', 5], [3, 'Y3', 7], [4, 'Y3', 7]] as [number, Level, number][]).forEach(
    ([table, level, week]) => {
      for (let g = 2; g <= 6; g++) {
        maths(`m-tbl-${table}x${g}`, `${table} × ${g} = ?`, `${table * g}`, `Table de ${table}`, week, level,
          `${table} times ${g}`);
      }
    },
  );

  // Place value (Y2 tens/ones, Y3 hundreds).
  [13, 24, 31, 42, 35, 48].forEach((n) =>
    maths(`m-pv-${n}`, `${n} = ? tens and ? ones`, `${Math.floor(n / 10)} tens, ${n % 10} ones`, 'Dizaines et unités', 3, 'Y2'));
  [245, 318, 506, 730].forEach((n) =>
    maths(`m-pv3-${n}`, `${n} = ? hundreds ? tens ? ones`,
      `${Math.floor(n / 100)} hundreds, ${Math.floor((n % 100) / 10)} tens, ${n % 10} ones`,
      'Centaines (Year 3)', 7, 'Y3'));

  // Hundred more / less (Y3).
  [250, 340, 612, 705].forEach((n) => {
    maths(`m-100more-${n}`, `100 more than ${n}`, `${n + 100}`, '100 de plus / de moins', 7, 'Y3');
    maths(`m-100less-${n}`, `100 less than ${n}`, `${n - 100}`, '100 de plus / de moins', 7, 'Y3');
  });

  // Counting sequences (find the next number).
  [[2, 1], [5, 1], [10, 1]].forEach(([step]) =>
    maths(`m-count-${step}`, `${step}, ${step * 2}, ${step * 3}, ?`, `${step * 4}`, 'Compter en 2/5/10', 1, 'Y1'));
  [[4, 1], [8, 1]].forEach(([step]) =>
    maths(`m-count-${step}`, `${step}, ${step * 2}, ${step * 3}, ?`, `${step * 4}`, 'Compter en 4 et 8 (Y3)', 7, 'Y3'));

  // Column-addition taster (Y3).
  [[23, 14], [35, 22], [46, 31], [52, 27]].forEach(([a, b], i) =>
    maths(`m-col-${i}`, `${a} + ${b} = ?`, `${a + b}`, 'Addition posée (Year 3)', 7, 'Y3'));

  _cards = cards;
  return cards;
}

export function allCards(): Flashcard[] {
  return build();
}
export function cardsForDeck(deck: Deck): Flashcard[] {
  return build().filter((c) => c.deck === deck);
}
export function getCardById(id: string): Flashcard | undefined {
  return build().find((c) => c.id === id);
}
