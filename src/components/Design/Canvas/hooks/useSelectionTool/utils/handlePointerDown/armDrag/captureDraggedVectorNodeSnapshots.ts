// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { captureVectorNodeDragSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeDragSnapshot';
import { isSnapshotVectorNode } from '../../isSnapshotVectorNode';

export const captureDraggedVectorNodeSnapshots = (armIds: string[], nodes: Record<string, TSceneNode>, canvasRefs: TCanvasRefs): void => {
  const vectorNodes = armIds.map((id) => nodes[id]).filter((node) => isSnapshotVectorNode(node, nodes));

  if (vectorNodes.length > 0) {
    canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = new Map(
      vectorNodes.map((node) => [node.id, captureVectorNodeDragSnapshot(node)]),
    );
  }
};
