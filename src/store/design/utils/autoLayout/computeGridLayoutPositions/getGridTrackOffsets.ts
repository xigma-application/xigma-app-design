export const getGridTrackOffsets = (sizes: number[], gap: number, leadingOffset: number): number[] => {
  const offsets: number[] = [];
  let cursor = leadingOffset;

  sizes.forEach((size) => {
    offsets.push(cursor);
    cursor += size + gap;
  });

  return offsets;
};
