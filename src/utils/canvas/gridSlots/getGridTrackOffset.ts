export const getGridTrackOffset = (sizes: number[], gap: number, index: number): number => {
  let offset = index * gap;

  for (let track = 0; track < index && track < sizes.length; track += 1) {
    offset += sizes[track];
  }

  return offset;
};
