// Phonics graphemes and decodable CVC words used by Sound Pop / Blend It.

// Single-letter graphemes with a representative en-GB example word for the audio cue.
export const GRAPHEMES: { grapheme: string; example: string }[] = [
  { grapheme: 's', example: 'sun' },
  { grapheme: 'a', example: 'ant' },
  { grapheme: 't', example: 'top' },
  { grapheme: 'p', example: 'pig' },
  { grapheme: 'i', example: 'ink' },
  { grapheme: 'n', example: 'net' },
  { grapheme: 'm', example: 'map' },
  { grapheme: 'd', example: 'dog' },
  { grapheme: 'g', example: 'gate' },
  { grapheme: 'o', example: 'orange' },
  { grapheme: 'c', example: 'cat' },
  { grapheme: 'k', example: 'kite' },
  { grapheme: 'e', example: 'egg' },
  { grapheme: 'u', example: 'umbrella' },
  { grapheme: 'r', example: 'rat' },
  { grapheme: 'h', example: 'hat' },
  { grapheme: 'b', example: 'bed' },
  { grapheme: 'f', example: 'fish' },
  { grapheme: 'l', example: 'leg' },
  { grapheme: 'j', example: 'jam' },
  { grapheme: 'v', example: 'van' },
  { grapheme: 'w', example: 'web' },
  { grapheme: 'sh', example: 'ship' },
  { grapheme: 'ch', example: 'chip' },
  { grapheme: 'th', example: 'thumb' },
];

// Decodable CVC words for Blend It (split into onset/coda sounds for the animation).
export const CVC_WORDS: { word: string; sounds: string[] }[] = [
  { word: 'cat', sounds: ['c', 'a', 't'] },
  { word: 'dog', sounds: ['d', 'o', 'g'] },
  { word: 'sun', sounds: ['s', 'u', 'n'] },
  { word: 'hat', sounds: ['h', 'a', 't'] },
  { word: 'pig', sounds: ['p', 'i', 'g'] },
  { word: 'bed', sounds: ['b', 'e', 'd'] },
  { word: 'top', sounds: ['t', 'o', 'p'] },
  { word: 'net', sounds: ['n', 'e', 't'] },
  { word: 'map', sounds: ['m', 'a', 'p'] },
  { word: 'fish', sounds: ['f', 'i', 'sh'] },
  { word: 'ship', sounds: ['sh', 'i', 'p'] },
  { word: 'chip', sounds: ['ch', 'i', 'p'] },
  { word: 'red', sounds: ['r', 'e', 'd'] },
  { word: 'leg', sounds: ['l', 'e', 'g'] },
  { word: 'van', sounds: ['v', 'a', 'n'] },
];

// Simple nouns for Listen & Find, each mapped to a lucide icon name.
export const PICTURE_WORDS: { word: string; icon: string }[] = [
  { word: 'cat', icon: 'Cat' },
  { word: 'dog', icon: 'Dog' },
  { word: 'sun', icon: 'Sun' },
  { word: 'star', icon: 'Star' },
  { word: 'fish', icon: 'Fish' },
  { word: 'bird', icon: 'Bird' },
  { word: 'tree', icon: 'TreePine' },
  { word: 'house', icon: 'House' },
  { word: 'car', icon: 'Car' },
  { word: 'flower', icon: 'Flower2' },
  { word: 'apple', icon: 'Apple' },
  { word: 'heart', icon: 'Heart' },
  { word: 'moon', icon: 'Moon' },
  { word: 'cloud', icon: 'Cloud' },
  { word: 'umbrella', icon: 'Umbrella' },
  { word: 'gift', icon: 'Gift' },
];
