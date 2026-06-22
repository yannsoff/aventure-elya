// The 100 high-frequency words ("Letters and Sounds"), in 3 sets of ~33.
// These are spoken in en-GB by the speech engine.

export const HF_SET_1: string[] = [
  'the', 'and', 'a', 'to', 'said', 'in', 'he', 'I', 'of', 'it', 'was', 'you',
  'they', 'on', 'she', 'is', 'for', 'at', 'his', 'but', 'that', 'with', 'all',
  'we', 'can', 'are', 'up', 'had', 'my', 'her', 'what', 'there', 'out',
];

export const HF_SET_2: string[] = [
  'this', 'have', 'went', 'be', 'like', 'some', 'so', 'not', 'then', 'were',
  'go', 'little', 'as', 'no', 'mum', 'one', 'them', 'do', 'me', 'down', 'dad',
  'big', 'when', "it's", 'see', 'looked', 'very', 'look', "don't", 'come',
  'will', 'into', 'back',
];

export const HF_SET_3: string[] = [
  'from', 'children', 'him', 'Mr', 'get', 'just', 'now', 'came', 'oh', 'about',
  'got', 'their', 'people', 'your', 'put', 'could', 'house', 'old', 'too', 'by',
  'day', 'made', 'time', "I'm", 'if', 'help', 'Mrs', 'called', 'here', 'off',
  'asked', 'saw', 'make', 'an',
];

// Year 2 common exception words, introduced in weeks 5-6.
export const Y2_EXCEPTION_WORDS: string[] = [
  'door', 'floor', 'again', 'because', 'eye', 'many', 'people', 'water',
  'where', 'who', 'whole', 'any', 'sugar', 'two', 'beautiful',
];

export const HF_SETS: Record<number, string[]> = {
  1: HF_SET_1,
  2: HF_SET_2,
  3: HF_SET_3,
};
