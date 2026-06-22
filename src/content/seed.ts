import type { Domain, GameType, Item, Skill } from '@/types';
import { GRAPHEMES, CVC_WORDS, PICTURE_WORDS } from './phonics';
import { HF_SETS, Y2_EXCEPTION_WORDS } from './hfwords';
import { SENTENCES } from './sentences';
import { LETTER_PATHS } from './letters';

// Builds the full static catalogue (skills + items) for the 8-week journey.
// Content is fully data-driven so new items/games can be added without touching engine logic.

interface Seed {
  skills: Skill[];
  items: Item[];
}

let _seed: Seed | null = null;

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function buildSeed(): Seed {
  if (_seed) return _seed;

  const skills: Skill[] = [];
  const items: Item[] = [];

  const addSkill = (
    id: string,
    domain: Domain,
    label: string,
    week: number,
    difficulty: number,
  ): Skill => {
    const skill: Skill = { id, domain, label, week, difficulty };
    skills.push(skill);
    return skill;
  };

  const addItem = (skillId: string, gameType: GameType, id: string, payload: Record<string, unknown>) => {
    items.push({ id, skillId, gameType, payload });
  };

  // ----- PHONICS: Sound Pop (all weeks, focus weeks 1-2) -----
  const phonicsSkill = addSkill('sk-phonics-sounds', 'phonics', 'Reconnaître les sons (phonics)', 1, 1);
  GRAPHEMES.forEach((g) => {
    addItem(phonicsSkill.id, 'sound_pop', `graph-${slug(g.grapheme)}`, {
      grapheme: g.grapheme,
      example: g.example,
    });
  });

  // ----- READING: Blend It (CVC decodable words) -----
  const blendSkill = addSkill('sk-blend-cvc', 'reading', 'Fusionner les sons (lecture)', 1, 2);
  CVC_WORDS.forEach((w) => {
    addItem(blendSkill.id, 'blend_it', `cvc-${slug(w.word)}`, { word: w.word, sounds: w.sounds });
  });

  // ----- READING: Listen & Find (picture words) -----
  const listenSkill = addSkill('sk-listen-find', 'reading', 'Écouter et trouver', 2, 2);
  PICTURE_WORDS.forEach((w) => {
    addItem(listenSkill.id, 'listen_find', `pic-${slug(w.word)}`, { word: w.word, icon: w.icon });
  });

  // ----- HF WORDS: one skill per set, mapped to focus weeks -----
  const hfWeekForSet: Record<number, number> = { 1: 1, 2: 3, 3: 5 };
  [1, 2, 3].forEach((setNo) => {
    const skill = addSkill(
      `sk-hf-set${setNo}`,
      'hfwords',
      `Mots fréquents — set ${setNo}`,
      hfWeekForSet[setNo],
      setNo + 1,
    );
    HF_SETS[setNo].forEach((word) => {
      // word_catch is the canonical assessment; flash_flip/memory_match are variants.
      addItem(skill.id, 'word_catch', `hf-${slug(word)}`, {
        word,
        variants: ['word_catch', 'flash_flip', 'memory_match'] as GameType[],
      });
    });
  });

  // ----- HF WORDS: Year 2 exception words (weeks 5-6) -----
  const exceptionSkill = addSkill('sk-hf-exception', 'hfwords', 'Mots-pièges Year 2', 5, 4);
  Y2_EXCEPTION_WORDS.forEach((word) => {
    addItem(exceptionSkill.id, 'word_catch', `hfx-${slug(word)}`, {
      word,
      variants: ['word_catch', 'flash_flip'] as GameType[],
    });
  });

  // ----- WRITING: Trace It (priority s & d, then more, plus the name) -----
  const traceSkill = addSkill('sk-trace', 'writing', 'Former les lettres', 1, 1);
  // Priority letters first.
  ['s', 'd'].forEach((l) => addItem(traceSkill.id, 'trace_it', `trace-${l}`, { letter: l, priority: true }));
  ['a', 'c', 'o', 'e', 'l', 'i', 't', 'n', 'm', 'r', 'p', 'y'].forEach((l) => {
    if (LETTER_PATHS[l]) addItem(traceSkill.id, 'trace_it', `trace-${l}`, { letter: l });
  });
  addItem(traceSkill.id, 'trace_it', 'trace-name', { name: true });

  // ----- WRITING: Build a Sentence -----
  const sentenceSkill = addSkill('sk-sentence', 'writing', 'Construire une phrase', 1, 2);
  SENTENCES.forEach((s, i) => {
    addItem(sentenceSkill.id, 'build_sentence', `sent-${i}`, {
      words: s.words,
      needsQuestion: s.needsQuestion ?? false,
      joinAnd: s.joinAnd ?? false,
      difficulty: s.difficulty,
    });
  });

  // ----- MATHS: Number bonds to 10 (weeks 1-2) -----
  const nb10 = addSkill('sk-nb10', 'maths', 'Compléments à 10', 1, 1);
  for (let part = 0; part <= 10; part++) {
    addItem(nb10.id, 'number_bonds', `nb10-${part}`, { total: 10, part });
  }

  // ----- MATHS: Number bonds to 20 (weeks 3-4) -----
  const nb20 = addSkill('sk-nb20', 'maths', 'Compléments à 20', 3, 3);
  for (let part = 0; part <= 20; part++) {
    addItem(nb20.id, 'number_bonds', `nb20-${part}`, { total: 20, part });
  }

  // ----- MATHS: Doubles (weeks 3-4) -----
  const doubles = addSkill('sk-doubles', 'maths', 'Les doubles', 3, 2);
  for (let n = 1; n <= 10; n++) {
    addItem(doubles.id, 'double_trouble', `dbl-${n}`, { n });
  }

  // ----- MATHS: Counting in steps (weeks 1-2) -----
  const counting = addSkill('sk-count', 'maths', 'Compter en 2, 5, 10', 1, 1);
  [2, 5, 10].forEach((step) => {
    addItem(counting.id, 'hop_count', `hop-${step}`, { step, start: 0, length: 5 });
  });

  // ----- MATHS: One more / one less (weeks 1-2) -----
  const oneMoreLess = addSkill('sk-onemoreless', 'maths', 'Un de plus, un de moins', 1, 1);
  for (let a = 2; a <= 12; a++) {
    addItem(oneMoreLess.id, 'add_take', `oml-p${a}`, { a, b: 1, op: '+' });
    addItem(oneMoreLess.id, 'add_take', `oml-m${a}`, { a, b: 1, op: '-' });
  }

  // ----- MATHS: Place value tens & ones (weeks 3-4, <=50) -----
  const placeValue = addSkill('sk-placevalue', 'maths', 'Dizaines et unités', 3, 3);
  [13, 24, 31, 42, 27, 35, 48, 16].forEach((n) => {
    addItem(placeValue.id, 'tens_ones', `tov-${n}`, { number: n });
  });

  // ----- MATHS: Times tables 2/5/10 (weeks 5-6) -----
  const timesTables = addSkill('sk-times', 'maths', 'Tables de 2, 5, 10', 5, 4);
  [2, 5, 10].forEach((table) => {
    for (let g = 2; g <= 5; g++) {
      addItem(timesTables.id, 'times_groups', `tg-${table}x${g}`, { table, groups: g });
    }
  });

  // ----- MATHS: Telling time to 5 minutes (weeks 5-6) -----
  const clock = addSkill('sk-clock', 'maths', "Lire l'heure", 5, 4);
  const times: [number, number][] = [
    [3, 0], [6, 0], [9, 30], [1, 30], [4, 15], [7, 45], [2, 5], [10, 20], [5, 35],
  ];
  times.forEach(([h, m]) => addItem(clock.id, 'clock_play', `clk-${h}-${m}`, { hour: h, minute: m }));

  // ----- MATHS: Add & take within 20 (weeks 5-6) -----
  const addTake = addSkill('sk-addtake', 'maths', 'Additions et soustractions', 5, 3);
  const sums: [number, number, '+' | '-'][] = [
    [5, 3, '+'], [7, 2, '+'], [8, 4, '+'], [6, 6, '+'], [9, 5, '+'], [12, 3, '+'],
    [9, 4, '-'], [12, 5, '-'], [15, 6, '-'], [10, 3, '-'], [14, 7, '-'], [8, 2, '-'],
  ];
  sums.forEach(([a, b, op], i) => addItem(addTake.id, 'add_take', `at-${i}`, { a, b, op }));

  // ----- MATHS: Fractions (weeks 7-8, Year 3 taster) -----
  const fractions = addSkill('sk-fractions', 'maths', 'Les fractions (½ ¼ ⅓)', 7, 5);
  [2, 3, 4].forEach((denom) => {
    addItem(fractions.id, 'fraction_pizza', `frac-${denom}`, { denom });
  });

  // ----- MATHS: Intro times table of 3 (weeks 7-8) -----
  const times3 = addSkill('sk-times3', 'maths', 'Table de 3', 7, 5);
  for (let g = 2; g <= 5; g++) {
    addItem(times3.id, 'times_groups', `tg-3x${g}`, { table: 3, groups: g });
  }

  _seed = { skills, items };
  return _seed;
}

// Convenience lookups.
export function getAllItems(): Item[] {
  return buildSeed().items;
}
export function getAllSkills(): Skill[] {
  return buildSeed().skills;
}
export function getItemById(id: string): Item | undefined {
  return buildSeed().items.find((i) => i.id === id);
}
export function getSkillById(id: string): Skill | undefined {
  return buildSeed().skills.find((s) => s.id === id);
}
export function getSiblings(item: Item): Item[] {
  return buildSeed().items.filter((i) => i.skillId === item.skillId && i.id !== item.id);
}

// Maps a focus week (0-indexed) to the skills whose focus begins by that week.
// Skills with week <= currentWeekNumber are "in play"; the builder prioritises the
// most recent focus week as "new" content.
export function skillsForWeek(weekIndex: number): Skill[] {
  const weekNo = weekIndex + 1;
  return getAllSkills().filter((s) => s.week <= weekNo);
}
export function newSkillsForWeek(weekIndex: number): Skill[] {
  const weekNo = weekIndex + 1;
  // The brief groups weeks in pairs (1-2, 3-4, 5-6, 7-8). Treat the pair's focus as "new".
  const pairStart = weekNo % 2 === 1 ? weekNo : weekNo - 1;
  return getAllSkills().filter((s) => s.week === pairStart || s.week === pairStart + 1);
}
