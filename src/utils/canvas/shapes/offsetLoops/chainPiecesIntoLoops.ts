// types
import { TLoopPiece } from './splitLoopAtCrossings';
import { TPoint } from 'types/canvas';

const getKey = (point: TPoint): string => `${point.x.toFixed(6)},${point.y.toFixed(6)}`;

export const chainPiecesIntoLoops = (pieces: TLoopPiece[]): TPoint[][] => {
  const outgoing = new Map<string, TLoopPiece[]>();
  const used = new Set<TLoopPiece>();
  const loops: TPoint[][] = [];

  pieces.forEach((piece) => {
    const key = getKey(piece.start);
    outgoing.set(key, [...(outgoing.get(key) ?? []), piece]);
  });

  pieces.forEach((first) => {
    if (!used.has(first)) {
      const firstKey = getKey(first.start);
      const loop: TPoint[] = [];
      let piece: TLoopPiece | undefined = first;

      while (piece) {
        used.add(piece);
        loop.push(piece.start);
        piece = getKey(piece.end) === firstKey ? undefined : outgoing.get(getKey(piece.end))?.find((candidate) => !used.has(candidate));
      }

      loops.push(loop);
    }
  });

  return loops;
};
