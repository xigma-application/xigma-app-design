// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TPathNode } from 'types/design/types';

export const syncPathTextNodes = (state: TDesignState, pathNode: TPathNode): void => {
  Object.values(state.nodes).forEach((node) => {
    if (node.type === NodeType.text && node.pathId === pathNode.id) {
      node.height = pathNode.height;
      node.rotation = pathNode.rotation;
      node.width = pathNode.width;
      node.x = pathNode.x;
      node.y = pathNode.y;
    }
  });
};
