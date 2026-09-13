export const resolveFillDragIndices = (selectedIndices: number[], setSelection: (indices: number[]) => void, index: number): number[] => {
  if (selectedIndices.includes(index)) {
    return selectedIndices;
  }

  setSelection([index]);

  return [index];
};
