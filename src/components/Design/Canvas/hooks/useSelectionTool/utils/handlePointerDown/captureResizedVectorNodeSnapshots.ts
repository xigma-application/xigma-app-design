// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { captureVectorNodeResizeSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeResizeSnapshot';

export const captureResizedVectorNodeSnapshots = (selectedNodes: TSceneNode[], canvasRefs: TCanvasRefs): void => {
  const isSingleSelection = selectedNodes.length === 1;
  const vectorNodes = selectedNodes.filter((node): node is TVectorNode => node.type === NodeType.vector && !node.widthProfile);

  if (vectorNodes.length > 0) {
    canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map(
      vectorNodes.map((node) => [node.id, captureVectorNodeResizeSnapshot(node, isSingleSelection ? node.rotation : 0)]),
    );
  }
};
