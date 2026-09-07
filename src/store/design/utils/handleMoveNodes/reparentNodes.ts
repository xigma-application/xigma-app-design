// types
import { TDesignPage } from '../../types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const reparentNodes = (page: TDesignPage, nodeIds: string[], targetParentId: string | null, isReparenting: boolean): void => {
  nodeIds.forEach((nodeId) => {
    const node = page.nodes[nodeId];

    if (node) {
      if (isReparenting && isBoxSceneNode(node) && node.ignoreAutoLayout) {
        node.ignoreAutoLayout = undefined;
      }

      node.parentId = targetParentId;
    }
  });
};
