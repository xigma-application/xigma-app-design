export const growMaxSpan = (start: number, limit: number, isClear: (value: number) => boolean): number => {
  let span = 0;

  for (let value = start; value < limit && isClear(value); value += 1) {
    span += 1;
  }

  return Math.max(span, 1);
};
