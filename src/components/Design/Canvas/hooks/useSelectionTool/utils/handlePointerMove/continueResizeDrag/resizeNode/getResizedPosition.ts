// types
import { TPoint } from 'types/canvas';

// utils
import { transformCoord } from '../transformCoord';

export const getResizedPosition = (
  origin: { height: number; width: number; x: number; y: number },
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
  width: number,
  height: number,
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null,
): TPoint =>
  rotatedAnchorSolver
    ? rotatedAnchorSolver(width, height)
    : {
        x: transformCoord(origin.x + origin.width / 2, anchors.x, scaleX) - width / 2,
        y: transformCoord(origin.y + origin.height / 2, anchors.y, scaleY) - height / 2,
      };
