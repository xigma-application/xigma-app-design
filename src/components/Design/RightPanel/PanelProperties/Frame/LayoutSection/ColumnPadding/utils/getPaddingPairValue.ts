export const getPaddingPairValue = (first: number, second: number): string => {
  if (first === second) {
    return first.toString();
  }

  return `${first}, ${second}`;
};
