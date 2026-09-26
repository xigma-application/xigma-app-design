// types
import { TBoxFillRotation } from 'utils/canvas/drawVectorNode/drawVectorPatternSourceTile';
import { TDrawSceneContext } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillGroup } from '../drawVectorFillGroup';
import { getFillFrameFromPoints } from 'utils/canvas/drawVectorNode/getFillFrameFromPoints';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { scaleFillsCrop } from 'components/Design/Canvas/utils/scaleFillsCrop';
import { scalePoint } from './scalePoint';

const getScaledFillFrame = (snapshot: TVectorNodeResizeSnapshot, points: TPoint[][]): { frame: TBoxFillRotation; oldCenter: TPoint } => {
  if (snapshot.fillFrame) {
    const frame = getFillFrameFromPoints(
      snapshot.fillFrame.points.map((point) => scalePoint(point, snapshot)),
      snapshot.rotation + snapshot.fillFrame.degrees,
    );
    const { localBounds } = getFillFrameFromPoints(snapshot.fillFrame.points, snapshot.fillFrame.degrees);

    return { frame, oldCenter: { x: localBounds.x + localBounds.width / 2, y: localBounds.y + localBounds.height / 2 } };
  }

  const localBounds = getVectorFillBounds(points, snapshot.fillBounds ?? null);
  const oldCenter = { x: localBounds.x + localBounds.width / 2, y: localBounds.y + localBounds.height / 2 };
  const center = scalePoint(oldCenter, snapshot);
  const width = localBounds.width * snapshot.scaleX;
  const height = localBounds.height * snapshot.scaleY;

  return {
    frame: { center, degrees: snapshot.rotation, localBounds: { height, width, x: center.x - width / 2, y: center.y - height / 2 } },
    oldCenter,
  };
};

export const drawVectorNodeResizeSnapshotFace = (
  context: TDrawSceneContext,
  snapshot: TVectorNodeResizeSnapshot,
  face: TVectorNodeResizeSnapshot['facesByPaint'][number],
): void => {
  const { paint, points } = face;
  const scaledFaces = points.map((facePoints) => facePoints.map((point) => scalePoint(point, snapshot)));
  const { frame, oldCenter } = getScaledFillFrame(snapshot, points);
  const { scaleX, scaleY } = snapshot;
  const scaledPaint =
    scaleFillsCrop(paint, {
      newCenterX: frame.center.x,
      newCenterY: frame.center.y,
      oldCenterX: oldCenter.x,
      oldCenterY: oldCenter.y,
      scaleX,
      scaleY,
    }) ?? paint;

  drawVectorFillGroup(context, null, null, scaledFaces, scaledPaint, [], frame);
};
