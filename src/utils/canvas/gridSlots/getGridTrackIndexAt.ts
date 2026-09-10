const getOutOfRangeStartIndex = (sizes: number[], coord: number): number | null => {
  switch (true) {
    case sizes.length === 0:
    case coord < 0:
      return 0;
    default:
      return null;
  }
};

const findGridTrackContaining = (sizes: number[], gap: number, coord: number): { index: number | null; offset: number } => {
  let offset = 0;

  for (let track = 0; track < sizes.length; track += 1) {
    const end = offset + sizes[track];

    if (coord < end) {
      return { index: track, offset };
    }

    offset = end + gap;
  }

  return { index: null, offset };
};

const getOverflowTrackIndex = (sizes: number[], gap: number, coord: number, allowOverflow: boolean, offset: number): number => {
  const stride = sizes[sizes.length - 1] + gap;

  switch (true) {
    case !allowOverflow:
      return sizes.length - 1;
    case stride <= 0:
      return sizes.length;
    default:
      return sizes.length + Math.floor((coord - offset) / stride);
  }
};

export const getGridTrackIndexAt = (sizes: number[], gap: number, coord: number, allowOverflow: boolean): number => {
  const outOfRangeIndex = getOutOfRangeStartIndex(sizes, coord);
  const { index, offset } = findGridTrackContaining(sizes, gap, coord);

  switch (true) {
    case outOfRangeIndex !== null:
      return outOfRangeIndex;
    case index !== null:
      return index;
    default:
      return getOverflowTrackIndex(sizes, gap, coord, allowOverflow, offset);
  }
};
