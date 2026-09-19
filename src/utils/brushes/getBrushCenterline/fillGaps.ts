export const fillGaps = (mids: (number | null)[], first: number, last: number): number[] => {
  const filled: number[] = [];
  let previous = mids[first] ?? 0;

  for (let x = first; x <= last; x += 1) {
    const current = mids[x];

    if (current !== null) {
      previous = current;
    }

    filled.push(previous);
  }

  return filled;
};
