// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { syncPathNodeFromText } from '../syncPathNodeFromText';
import { syncPathTextNodes } from '../syncPathTextNodes';
import { syncPathTextNodesFromVector } from '../syncPathTextNodesFromVector';

export const syncBoundNode = (state: TDesignState, node: TSceneNode): void => {
  switch (node.type) {
    case NodeType.path:
      syncPathTextNodes(state, node);
      break;
    case NodeType.text:
      if (node.pathId) {
        syncPathNodeFromText(state, node);
      }
      break;
    case NodeType.vector:
      syncPathTextNodesFromVector(state, node);
      break;
    default:
      break;
  }
};
