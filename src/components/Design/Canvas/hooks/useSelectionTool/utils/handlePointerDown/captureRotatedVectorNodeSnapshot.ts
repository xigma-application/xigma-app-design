// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { captureVectorNodeRotateSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeRotateSnapshot';

export const captureRotatedVectorNodeSnapshot = (selectedNodes: TSceneNode[], canvasRefs: TCanvasRefs): void => {
  const [node] = selectedNodes;

  if (selectedNodes.length === 1 && node.type === NodeType.vector && !node.widthProfile) {
    canvasRefs.rotatedVectorNodeSnapshotsRef.current = new Map([[node.id, captureVectorNodeRotateSnapshot(node)]]);
  }
};
