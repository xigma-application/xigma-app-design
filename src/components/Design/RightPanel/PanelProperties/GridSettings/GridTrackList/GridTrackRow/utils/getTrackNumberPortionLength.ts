export const getTrackNumberPortionLength = (value: string): number => {
  const match = value.match(/^-?\d*\.?\d+/);

  if (match) {
    return match[0].length;
  }

  return value.length;
};
