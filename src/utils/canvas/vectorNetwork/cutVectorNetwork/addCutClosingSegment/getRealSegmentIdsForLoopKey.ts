export const getRealSegmentIdsForLoopKey = (loopKey: string): Set<string> =>
  new Set(loopKey.split(',').map((pieceKey) => pieceKey.split('[')[0]));
