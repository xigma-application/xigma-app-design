// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { captureVectorNodeDragSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeDragSnapshot';

export const captureDraggedVectorNodeSnapshots = (armIds: string[], nodes: Record<string, TSceneNode>, canvasRefs: TCanvasRefs): void => {
  const vectorNodes = armIds
    .map((id) => nodes[id])
    .filter((node): node is TVectorNode => node.type === NodeType.vector && !node.widthProfile);

  if (vectorNodes.length > 0) {
    canvasRefs.draggedVectorNodeSnapshotsRef.current = new Map(vectorNodes.map((node) => [node.id, captureVectorNodeDragSnapshot(node)]));
  }
};
