import { selectRenderOrderedNodes } from 'store/design/selectors';
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { RootState } from 'store';

import { TSceneNode } from 'types/design/types';

import { getClickThroughLeafNodes } from '../../../../utils/getClickThroughLeafNodes';

type THoverLeafNodesCache = {
  isControlPressed: boolean;
  nodesById: Record<string, TSceneNode>;
  orderedNodes: TSceneNode[];
  result: TSceneNode[];
};

let cache: THoverLeafNodesCache | null = null;

export const getHoverLeafNodes = (state: RootState, nodesById: Record<string, TSceneNode>, isControlPressed: boolean): TSceneNode[] => {
  const orderedNodes = selectRenderOrderedNodes(state);

  if (!cache || cache.orderedNodes !== orderedNodes || cache.nodesById !== nodesById || cache.isControlPressed !== isControlPressed) {
    const result = isControlPressed
      ? orderedNodes.filter((node) => !isContainerNode(node) || node.childIds.length === 0)
      : getClickThroughLeafNodes(orderedNodes, nodesById);

    cache = { isControlPressed, nodesById, orderedNodes, result };

    return result;
  }

  return cache.result;
};
