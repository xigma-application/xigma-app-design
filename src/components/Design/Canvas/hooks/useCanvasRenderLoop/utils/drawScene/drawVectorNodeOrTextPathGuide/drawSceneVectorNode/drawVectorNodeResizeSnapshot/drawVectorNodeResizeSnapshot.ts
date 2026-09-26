// types
import { TDrawSceneContext } from '../../../types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeResizeSnapshotFace } from './drawVectorNodeResizeSnapshotFace';
import { drawVectorNodeResizeSnapshotStroke } from './drawVectorNodeResizeSnapshotStroke';

export const drawVectorNodeResizeSnapshot = (context: TDrawSceneContext, snapshot: TVectorNodeResizeSnapshot, opacity = 1): void => {
  snapshot.facesByPaint.forEach((face) => drawVectorNodeResizeSnapshotFace(context, snapshot, face));
  drawVectorNodeResizeSnapshotStroke(context, snapshot, opacity);
};
