// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { syncPathTextNodes } from './syncPathTextNodes';

export type TTextBoxTransform = { height: number; rotation: number; width: number; x: number; y: number };

const boxCenter = (box: TTextBoxTransform): { x: number; y: number } => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

const syncVectorPathFromText = (vectorNode: TVectorNode, textNode: TTextNode, previous: TTextBoxTransform): void => {
  const from = boxCenter(previous);
  const to = boxCenter({ height: textNode.height, rotation: textNode.rotation, width: textNode.width, x: textNode.x, y: textNode.y });
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx !== 0 || dy !== 0) {
    Object.values(vectorNode.vertices).forEach((vertex) => {
      vertex.x = Math.round(vertex.x + dx);
      vertex.y = Math.round(vertex.y + dy);
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
