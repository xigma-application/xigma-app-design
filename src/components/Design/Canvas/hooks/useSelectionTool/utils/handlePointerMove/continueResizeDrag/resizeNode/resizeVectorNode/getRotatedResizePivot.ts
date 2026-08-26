// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getRotatedResizePivot = (
  originBounds: TDraftRect,
  scaleX: number,
  scaleY: number,
  rotatedAnchorSolver: (width: number, height: number) => TPoint,
): TPoint => {
  const newWidth = originBounds.width * Math.abs(scaleX);
  const newHeight = originBounds.height * Math.abs(scaleY);
  const solvedPosition = rotatedAnchorSolver(newWidth, newHeight);

  return { x: solvedPosition.x + newWidth / 2, y: solvedPosition.y + newHeight / 2 };
};
