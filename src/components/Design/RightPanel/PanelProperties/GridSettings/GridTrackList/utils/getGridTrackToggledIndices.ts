export const getGridTrackToggledIndices = (selected: number[], index: number): number[] => {
  if (selected.includes(index)) {
    return selected.filter((value) => value !== index);
  }

  return [...selected, index].sort((left, right) => left - right);
};
