export const getDraggedIndices = (index: number, count: number, isRowSelected?: (index: number) => boolean): number[] => {
  const selectedIndices = isRowSelected
    ? Array.from({ length: count }, (_, candidateIndex) => candidateIndex).filter((candidateIndex) => isRowSelected(candidateIndex))
    : [];
  const isDraggingSelection = selectedIndices.length > 1 && selectedIndices.includes(index);

  if (isDraggingSelection) {
    return selectedIndices;
  }

  return [index];
};
