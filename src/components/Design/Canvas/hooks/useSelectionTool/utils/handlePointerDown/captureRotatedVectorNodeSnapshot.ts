// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { captureVectorNodeRotateSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeRotateSnapshot';
import { isSnapshotVectorNode } from '../isSnapshotVectorNode';

export const captureRotatedVectorNodeSnapshot = (
  selectedNodes: TSceneNode[],
  canvasRefs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
): void => {
  const [node] = selectedNodes;

  if (selectedNodes.length === 1 && isSnapshotVectorNode(node, nodes)) {
    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([[node.id, captureVectorNodeRotateSnapshot(node)]]);
  }
};
