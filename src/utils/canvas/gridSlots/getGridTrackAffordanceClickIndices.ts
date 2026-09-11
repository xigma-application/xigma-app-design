export type TGridTrackClickModifiers = { meta: boolean; shift: boolean };

const getGridTrackRangeIndices = (anchor: number, index: number): number[] => {
  const start = Math.min(anchor, index);
  const end = Math.max(anchor, index);

  return Array.from({ length: end - start + 1 }, (_unused, offset) => start + offset);
};

const getGridTrackToggledIndices = (selected: number[], index: number): number[] => {
  if (selected.includes(index)) {
    return selected.filter((value) => value !== index);
  }

  return [...selected, index].sort((left, right) => left - right);
};

export const getGridTrackAffordanceClickIndices = (
  currentIndices: number[],
  index: number,
  modifiers: TGridTrackClickModifiers,
): number[] => {
  const anchor = currentIndices.length > 0 ? currentIndices[currentIndices.length - 1] : null;

  switch (true) {
    case modifiers.shift && anchor !== null:
      return getGridTrackRangeIndices(anchor as number, index);
    case modifiers.meta:
      return getGridTrackToggledIndices(currentIndices, index);
    default:
      return [index];
  }
};
