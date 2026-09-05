// types
import { TDrawSceneContext } from '../../types';
import { TVectorNode } from 'types/design/types';
import { TVectorSnapshotsRefs } from 'types/design/canvas/types';

// utils
import { drawVectorNode } from './drawVectorNode';
import { drawVectorNodeDragSnapshot } from './drawVectorNodeDragSnapshot';
import { drawVectorNodeResizeSnapshot } from './drawVectorNodeResizeSnapshot';
import { drawVectorNodeRotateSnapshot } from './drawVectorNodeRotateSnapshot';

export const drawSceneVectorNode = (context: TDrawSceneContext, node: TVectorNode, vectorSnapshots: TVectorSnapshotsRefs): void => {
  const dragSnapshot = vectorSnapshots.draggedVectorNodeSnapshotsRef.current?.get(node.id);
  const resizeSnapshot = vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.get(node.id);
  const rotateSnapshot = vectorSnapshots.rotatedVectorNodeSnapshotsRef.current?.get(node.id);

  switch (true) {
    case Boolean(dragSnapshot):
      drawVectorNodeDragSnapshot(context, dragSnapshot!);
      break;
    case Boolean(resizeSnapshot):
      drawVectorNodeResizeSnapshot(context, resizeSnapshot!);
      break;
    case Boolean(rotateSnapshot):
      drawVectorNodeRotateSnapshot(context, rotateSnapshot!);
      break;
    default:
      drawVectorNode(context, node);
  }
};
