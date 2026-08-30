// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TTextNode, TVectorNode, TVectorTangent } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { syncPathTextNodes } from './syncPathTextNodes';

const scaleTangent = (tangent: TVectorTangent, scaleX: number, scaleY: number): TVectorTangent =>
  tangent ? { x: tangent.x * scaleX, y: tangent.y * scaleY } : null;

const syncVectorPathFromText = (vectorNode: TVectorNode, textNode: TTextNode): void => {
  const bounds = getVectorNodeBounds(vectorNode);
  const scaleX = bounds.width > 0 ? textNode.width / bounds.width : 1;
  const scaleY = bounds.height > 0 ? textNode.height / bounds.height : 1;
  const movedOrScaled = textNode.x !== bounds.x || textNode.y !== bounds.y || scaleX !== 1 || scaleY !== 1;

  if (movedOrScaled) {
    Object.values(vectorNode.vertices).forEach((vertex) => {
      vertex.x = Math.round(textNode.x + (vertex.x - bounds.x) * scaleX);
      vertex.y = Math.round(textNode.y + (vertex.y - bounds.y) * scaleY);
    });

    Object.values(vectorNode.segments).forEach((segment) => {
      segment.tangentStart = scaleTangent(segment.tangentStart, scaleX, scaleY);
      segment.tangentEnd = scaleTangent(segment.tangentEnd, scaleX, scaleY);
    });
  }

  vectorNode.rotation = textNode.rotation;
};

export const syncPathNodeFromText = (state: TDesignState, textNode: TTextNode): void => {
  const pathNode = textNode.pathId ? getActivePage(state).nodes[textNode.pathId] : undefined;

  if (pathNode?.type === NodeType.path) {
    pathNode.height = textNode.height;
    pathNode.rotation = textNode.rotation;
    pathNode.width = textNode.width;
    pathNode.x = textNode.x;
    pathNode.y = textNode.y;
    syncPathTextNodes(state, pathNode);
  } else if (pathNode?.type === NodeType.vector) {
    syncVectorPathFromText(pathNode, textNode);
  }
};
