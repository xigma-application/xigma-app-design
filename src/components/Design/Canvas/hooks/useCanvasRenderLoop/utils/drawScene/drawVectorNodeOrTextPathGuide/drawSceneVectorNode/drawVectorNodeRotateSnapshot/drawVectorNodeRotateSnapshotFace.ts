// types
import { TDrawSceneContext } from '../../../types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { composeVectorFillRotation } from 'utils/canvas/drawVectorNode/composeVectorFillRotation';
import { drawVectorFillGroup } from '../drawVectorFillGroup';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { rotateFillsCrop } from 'components/Design/Canvas/utils/rotateFillsCrop';
import { rotateSnapshotPoint } from './rotateSnapshotPoint';

export const drawVectorNodeRotateSnapshotFace = (
  context: TDrawSceneContext,
  snapshot: TVectorNodeRotateSnapshot,
  face: TVectorNodeRotateSnapshot['facesByPaint'][number],
): void => {
  const { paint, points } = face;
  const rotatedFaces = points.map((facePoints) => facePoints.map((point) => rotateSnapshotPoint(point, snapshot)));
  const localBounds = getVectorFillBounds(points, snapshot.fillBounds ?? null);
  const localCenter = { x: localBounds.x + localBounds.width / 2, y: localBounds.y + localBounds.height / 2 };
  const baseRotation = snapshot.fillRotation ?? { center: localCenter, degrees: 0, localBounds };
  const rotatedPaint = rotateFillsCrop(paint, snapshot.pivot, snapshot.deltaDegrees) ?? paint;

  drawVectorFillGroup(
    context,
    null,
    null,
    rotatedFaces,
    rotatedPaint,
    [],
    composeVectorFillRotation(baseRotation, snapshot.pivot, snapshot.deltaDegrees),
  );
};
