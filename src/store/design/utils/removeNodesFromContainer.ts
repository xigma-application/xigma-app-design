// types
import { TDesignPage } from '../types';
import { NodeType } from 'types/design/enums';

export const removeNodesFromContainer = (page: TDesignPage, containerParentId: string | null, nodeIds: string[]): void => {
  const nodeIdSet = new Set(nodeIds);

  if (containerParentId) {
    const parent = page.nodes[containerParentId];

    if (parent && parent.type === NodeType.group) {
      parent.childIds = parent.childIds.filter((id) => !nodeIdSet.has(id));
    }
  } else {
    page.rootOrder = page.rootOrder.filter((id) => !nodeIdSet.has(id));
  }
};
