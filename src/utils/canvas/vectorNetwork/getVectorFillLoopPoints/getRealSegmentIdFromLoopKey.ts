export const getRealSegmentIdFromLoopKey = (loopKey: string): string => {
  const [firstPieceKey] = loopKey.split(',');
  const bracketIndex = firstPieceKey.indexOf('[');

  return bracketIndex === -1 ? firstPieceKey : firstPieceKey.slice(0, bracketIndex);
};
