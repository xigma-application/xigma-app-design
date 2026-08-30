// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { isVectorWidthProfileEligible } from './isVectorWidthProfileEligible';
import { syncGroupBounds } from './syncGroupBounds';
import { syncPathNodeFromText } from './syncPathNodeFromText';
import { syncPathTextNodes } from './syncPathTextNodes';
import { syncPathTextNodesFromVector } from './syncPathTextNodesFromVector';

export const handleUpdateNode = (state: TDesignState, payload: { changes: TSceneNodeChanges; id: string }): void => {
  const node = getActivePage(state).nodes[payload.id];

  if (node) {
    const previousTextBox =
      node.type === NodeType.text ? { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y } : null;
    Object.assign(node, payload.changes);

    switch (node.type) {
      case NodeType.path:
        syncPathTextNodes(state, node);
        break;
      case NodeType.text:
        if (node.pathId && previousTextBox) {
          syncPathNodeFromText(state, node, previousTextBox);
        }
        break;
      case NodeType.vector:
        syncPathTextNodesFromVector(state, node);
        break;
      default:
        break;
    }

    if (node.type === NodeType.vector && 'segments' in payload.changes && !isVectorWidthProfileEligible(node)) {
      node.widthProfile = null;
    }

    syncGroupBounds(state, node.parentId);
  }
};
