export const getReorderedIndex = (fromIndex: number, insertionIndex: number): number =>
  insertionIndex > fromIndex ? insertionIndex - 1 : insertionIndex;
