export const getIsReorderNoOp = (draggedIndices: number[], insertionIndex: number, hasDepthChanged = false): boolean => {
  if (!hasDepthChanged) {
    const sortedIndices = [...draggedIndices].sort((a, b) => a - b);
    const firstIndex = sortedIndices[0];
    const lastIndex = sortedIndices[sortedIndices.length - 1];
    const isContiguous = lastIndex - firstIndex + 1 === sortedIndices.length;

    return isContiguous && insertionIndex >= firstIndex && insertionIndex <= lastIndex + 1;
  }

  return false;
};
