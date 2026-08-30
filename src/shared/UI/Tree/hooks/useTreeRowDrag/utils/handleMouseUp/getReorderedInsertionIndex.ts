export const getReorderedInsertionIndex = (draggedIndices: number[], insertionIndex: number): number => {
  const removedBeforeInsertion = draggedIndices.filter((index) => index < insertionIndex).length;

  return insertionIndex - removedBeforeInsertion;
};
