// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TTextNode, TVectorNode, TVectorTangent } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { syncPathTextNodes } from './syncPathTextNodes';

export type TTextBoxTransform = { height: number; rotation: number; width: number; x: number; y: number };

const scaleTangent = (tangent: TVectorTangent, scaleX: number, scaleY: number): TVectorTangent =>
  tangent ? { x: tangent.x * scaleX, y: tangent.y * scaleY } : null;

const syncVectorPathFromText = (vectorNode: TVectorNode, textNode: TTextNode, previous: TTextBoxTransform): void => {
  const scaleX = previous.width > 0 ? textNode.width / previous.width : 1;
  const scaleY = previous.height > 0 ? textNode.height / previous.height : 1;
  const dx = textNode.x - previous.x;
  const dy = textNode.y - previous.y;

  if (dx !== 0 || dy !== 0 || scaleX !== 1 || scaleY !== 1) {
    Object.values(vectorNode.vertices).forEach((vertex) => {
      vertex.x = Math.round(textNode.x + (vertex.x - previous.x) * scaleX);
      vertex.y = Math.round(textNode.y + (vertex.y - previous.y) * scaleY);
    });

    Object.values(vectorNode.segments).forEach((segment) => {
      segment.tangentStart = scaleTangent(segment.tangentStart, scaleX, scaleY);
      segment.tangentEnd = scaleTangent(segment.tangentEnd, scaleX, scaleY);
    });
  }

  vectorNode.rotation = textNode.rotation;
};

export const syncPathNodeFromText = (state: TDesignState, textNode: TTextNode, previous: TTextBoxTransform): void => {
  const pathNode = textNode.pathId ? getActivePage(state).nodes[textNode.pathId] : undefined;

  if (pathNode?.type === NodeType.path) {
    pathNode.height = textNode.height;
    pathNode.rotation = textNode.rotation;
    pathNode.width = textNode.width;
    pathNode.x = textNode.x;
    pathNode.y = textNode.y;
    syncPathTextNodes(state, pathNode);
  } else if (pathNode?.type === NodeType.vector) {
    syncVectorPathFromText(pathNode, textNode, previous);
  }
};
