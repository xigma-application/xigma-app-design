// types
import { TPoint } from 'types/canvas';

// utils
import { chainPiecesIntoLoops } from './chainPiecesIntoLoops';
import { getVectorFaceSignedArea } from '../../vectorNetwork/getVectorFaceSignedArea';
import { getWindingNumber } from './getWindingNumber';
import { splitLoopAtCrossings, TLoopPiece } from './splitLoopAtCrossings';

const SIDE_STEP = 1e-6;

const getBoundaryPiece = (piece: TLoopPiece, loop: TPoint[], sign: number): TLoopPiece | null => {
  const dx = piece.end.x - piece.start.x;
  const dy = piece.end.y - piece.start.y;
  const length = Math.hypot(dx, dy);
  const step = SIDE_STEP * Math.max(1, length);
  const middle = { x: (piece.start.x + piece.end.x) / 2, y: (piece.start.y + piece.end.y) / 2 };
  const side = { x: (-dy / length) * step, y: (dx / length) * step };
  const isLeftInside = getWindingNumber({ x: middle.x + side.x, y: middle.y + side.y }, loop) * sign > 0;
  const isRightInside = getWindingNumber({ x: middle.x - side.x, y: middle.y - side.y }, loop) * sign > 0;

  if (isLeftInside !== isRightInside) {
    return isLeftInside ? piece : { end: piece.start, start: piece.end };
  }

  return null;
};

export const getPositiveWindingLoops = (loop: TPoint[], sign: number): TPoint[][] => {
  const pieces = splitLoopAtCrossings(loop);

  if (pieces.length === loop.length) {
    const isKept = getVectorFaceSignedArea(loop) * sign > 0;
    return isKept ? [sign > 0 ? loop : [...loop].reverse()] : [];
  }

  return chainPiecesIntoLoops(
    pieces.map((piece) => getBoundaryPiece(piece, loop, sign)).filter((piece): piece is TLoopPiece => piece !== null),
  );
};
