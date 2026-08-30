// types
import { TDesignPage } from '../../types';
import { NodeType } from 'types/design/enums';

export const insertNodesIntoContainer = (
  page: TDesignPage,
  containerParentId: string | null,
  nodeIds: string[],
  targetIndex: number,
): void => {
  if (containerParentId) {
    const parent = page.nodes[containerParentId];

    if (parent && parent.type === NodeType.group) {
      parent.childIds = [...parent.childIds.slice(0, targetIndex), ...nodeIds, ...parent.childIds.slice(targetIndex)];
    }
  } else {
    page.rootOrder = [...page.rootOrder.slice(0, targetIndex), ...nodeIds, ...page.rootOrder.slice(targetIndex)];
  }
};
