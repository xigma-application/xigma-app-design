// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { isVectorWidthProfileEligible } from './isVectorWidthProfileEligible';
import { syncPathNodeFromText } from './syncPathNodeFromText';
import { syncPathTextNodes } from './syncPathTextNodes';

export const handleUpdateNode = (state: TDesignState, payload: { changes: TSceneNodeChanges; id: string }): void => {
  const node = getActivePage(state).nodes[payload.id];

  if (node) {
    Object.assign(node, payload.changes);

    if (node.type === NodeType.path) {
      syncPathTextNodes(state, node);
    } else if (node.type === NodeType.text && node.pathId) {
      syncPathNodeFromText(state, node);
    }

    if (node.type === NodeType.vector && 'segments' in payload.changes && !isVectorWidthProfileEligible(node)) {
      node.widthProfile = null;
    }
  }
};
