// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { captureVectorNodeResizeSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeResizeSnapshot';
import { isSnapshotVectorNode } from '../isSnapshotVectorNode';

export const captureResizedVectorNodeSnapshots = (
  selectedNodes: TSceneNode[],
  canvasRefs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
): void => {
  const isSingleSelection = selectedNodes.length === 1;
  const vectorNodes = selectedNodes.filter((node) => isSnapshotVectorNode(node, nodes));

  if (vectorNodes.length > 0) {
    canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map(
      vectorNodes.map((node) => [node.id, captureVectorNodeResizeSnapshot(node, isSingleSelection ? node.rotation : 0)]),
    );
  }
};
