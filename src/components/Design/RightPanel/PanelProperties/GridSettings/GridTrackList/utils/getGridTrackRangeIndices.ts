export const getGridTrackRangeIndices = (anchor: number, index: number): number[] => {
  const start = Math.min(anchor, index);
  const end = Math.max(anchor, index);

  return Array.from({ length: end - start + 1 }, (_unused, offset) => start + offset);
};
