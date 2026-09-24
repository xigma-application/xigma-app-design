export const getModeGap = (gaps: number[]): number => {
  const counts = new Map<number, number>();

  gaps.forEach((gap) => {
    const rounded = Math.max(0, Math.round(gap));
    counts.set(rounded, (counts.get(rounded) ?? 0) + 1);
  });

  return [...counts.entries()].reduce<[number, number]>(
    (best, entry) => (entry[1] > best[1] || (entry[1] === best[1] && entry[0] < best[0]) ? entry : best),
    [0, 0],
  )[0];
};
