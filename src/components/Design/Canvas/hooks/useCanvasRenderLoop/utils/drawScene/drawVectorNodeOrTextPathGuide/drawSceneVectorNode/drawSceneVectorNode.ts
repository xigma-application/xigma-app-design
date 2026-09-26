// types
import { TDrawSceneContext } from '../../types';
import { TVectorNode } from 'types/design/types';
import { TVectorSnapshotsRefs } from 'types/design/canvas/types';

// utils
import { drawVectorNode } from './drawVectorNode';
import { drawVectorNodeDragSnapshot } from './drawVectorNodeDragSnapshot';
import { drawVectorNodeResizeSnapshot } from './drawVectorNodeResizeSnapshot/drawVectorNodeResizeSnapshot';
import { drawVectorNodeRotateSnapshot } from './drawVectorNodeRotateSnapshot/drawVectorNodeRotateSnapshot';
import { withSnapshotFacesOpacity } from './withSnapshotFacesOpacity';

export const drawSceneVectorNode = (
  context: TDrawSceneContext,
  node: TVectorNode,
  vectorSnapshots: TVectorSnapshotsRefs,
  opacity = 1,
): void => {
  const dragSnapshot = vectorSnapshots.draggedVectorNodeSnapshotsRef.current?.get(node.id);
  const resizeSnapshot = vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.get(node.id);
  const rotateSnapshot = vectorSnapshots.rotatedVectorNodeSnapshotsRef.current?.get(node.id);

  switch (true) {
    case Boolean(dragSnapshot):
      drawVectorNodeDragSnapshot(context, withSnapshotFacesOpacity(dragSnapshot!, opacity), opacity);
      break;
    case Boolean(resizeSnapshot):
      drawVectorNodeResizeSnapshot(context, withSnapshotFacesOpacity(resizeSnapshot!, opacity), opacity);
      break;
    case Boolean(rotateSnapshot):
      drawVectorNodeRotateSnapshot(context, withSnapshotFacesOpacity(rotateSnapshot!, opacity), opacity);
      break;
    default:
      drawVectorNode(context, node, opacity);
  }
};
