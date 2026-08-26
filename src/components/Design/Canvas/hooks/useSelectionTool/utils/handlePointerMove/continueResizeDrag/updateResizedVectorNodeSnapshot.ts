// types
import { TPoint } from 'types/canvas';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { getRotatedResizePivot } from './resizeNode/resizeVectorNode/getRotatedResizePivot';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { transformCoord } from './transformCoord';

export const updateResizedVectorNodeSnapshot = (
  snapshot: TVectorNodeResizeSnapshot,
  origin: TVectorNodeOrigin,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null,
): void => {
  snapshot.anchorX = anchors.x;
  snapshot.anchorY = anchors.y;
  snapshot.scaleX = scaleX;
  snapshot.scaleY = scaleY;

  if (rotatedAnchorSolver) {
    const bounds = getVectorNodeBounds(origin);

    snapshot.pivot = getRotatedResizePivot(bounds, scaleX, scaleY, rotatedAnchorSolver);
    snapshot.scaledCenter = {
      x: transformCoord(bounds.x + bounds.width / 2, anchors.x, scaleX),
      y: transformCoord(bounds.y + bounds.height / 2, anchors.y, scaleY),
    };
  }
};
