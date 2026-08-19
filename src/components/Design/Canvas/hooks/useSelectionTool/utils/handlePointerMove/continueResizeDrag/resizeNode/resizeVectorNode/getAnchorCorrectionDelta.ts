// types
import { TPoint } from 'types/canvas';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const getAnchorCorrectionDelta = (
  origin: TVectorNodeOrigin,
  scaledSegments: Record<string, TVectorSegment>,
  scaledVertices: Record<string, TVectorVertex>,
  scaleX: number,
  scaleY: number,
  rotatedAnchorSolver: (width: number, height: number) => TPoint,
): TPoint => {
  const originBounds = getVectorNodeBounds(origin);
  const newWidth = originBounds.width * Math.abs(scaleX);
  const newHeight = originBounds.height * Math.abs(scaleY);
  const solvedPosition = rotatedAnchorSolver(newWidth, newHeight);
  const newCenter = { x: solvedPosition.x + newWidth / 2, y: solvedPosition.y + newHeight / 2 };
  const scaledBounds = getVectorNodeBounds({ segments: scaledSegments, vertices: scaledVertices });
  const scaledCenter = { x: scaledBounds.x + scaledBounds.width / 2, y: scaledBounds.y + scaledBounds.height / 2 };

  return { x: newCenter.x - scaledCenter.x, y: newCenter.y - scaledCenter.y };
};
