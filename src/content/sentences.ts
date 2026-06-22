// Sentence sets for Build a Sentence, ordered by week difficulty.
// The child drags word tiles into order, then adds the capital + full stop.
// "needsQuestion" sentences end with a question mark instead.

export interface SentenceSpec {
  words: string[]; // correct order, lowercase, no punctuation
  needsQuestion?: boolean;
  joinAnd?: boolean; // contains "and" linking two ideas
  difficulty: number; // 1..5
}

export const SENTENCES: SentenceSpec[] = [
  { words: ['I', 'like', 'my', 'cat'], difficulty: 1 },
  { words: ['the', 'dog', 'is', 'big'], difficulty: 1 },
  { words: ['we', 'can', 'play'], difficulty: 1 },
  { words: ['I', 'see', 'a', 'star'], difficulty: 1 },
  { words: ['she', 'has', 'a', 'hat'], difficulty: 2 },
  { words: ['the', 'sun', 'is', 'hot'], difficulty: 2 },
  { words: ['I', 'like', 'cats', 'and', 'dogs'], joinAnd: true, difficulty: 3 },
  { words: ['we', 'run', 'and', 'jump'], joinAnd: true, difficulty: 3 },
  { words: ['can', 'you', 'help', 'me'], needsQuestion: true, difficulty: 3 },
  { words: ['where', 'is', 'my', 'ball'], needsQuestion: true, difficulty: 4 },
  { words: ['the', 'big', 'dog', 'ran', 'to', 'the', 'park'], difficulty: 4 },
  { words: ['I', 'went', 'to', 'school', 'and', 'I', 'had', 'fun'], joinAnd: true, difficulty: 5 },
];
