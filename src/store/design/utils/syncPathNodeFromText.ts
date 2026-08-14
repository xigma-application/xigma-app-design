// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { syncPathTextNodes } from './syncPathTextNodes';

export const syncPathNodeFromText = (state: TDesignState, textNode: TTextNode): void => {
  const pathNode = textNode.pathId ? state.nodes[textNode.pathId] : undefined;

  if (pathNode && pathNode.type === NodeType.path) {
    pathNode.height = textNode.height;
    pathNode.rotation = textNode.rotation;
    pathNode.width = textNode.width;
    pathNode.x = textNode.x;
    pathNode.y = textNode.y;
    syncPathTextNodes(state, pathNode);
  }
};
