// types
import { TDrawSceneContext } from '../../../types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeRotateSnapshotFace } from './drawVectorNodeRotateSnapshotFace';
import { drawVectorNodeRotateSnapshotStroke } from './drawVectorNodeRotateSnapshotStroke';

export const drawVectorNodeRotateSnapshot = (context: TDrawSceneContext, snapshot: TVectorNodeRotateSnapshot, opacity = 1): void => {
  snapshot.facesByPaint.forEach((face) => drawVectorNodeRotateSnapshotFace(context, snapshot, face));
  drawVectorNodeRotateSnapshotStroke(context, snapshot, opacity);
};
