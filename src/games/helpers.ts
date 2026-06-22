// Build a set of `count` distinct numbers including `answer`, near it, within bounds.
export function nearbyNumbers(
  answer: number,
  count: number,
  min = 0,
  max = 999,
): number[] {
  const set = new Set<number>([answer]);
  let delta = 1;
  while (set.size < count) {
    for (const cand of [answer - delta, answer + delta]) {
      if (cand >= min && cand <= max) set.add(cand);
      if (set.size >= count) break;
    }
    delta++;
    if (delta > (max - min) + 2) break;
  }
  return Array.from(set);
}
