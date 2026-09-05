import { useCallback, useMemo } from 'react';

// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { selectActivePage } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isAutoLayoutFrame } from 'utils/canvas/signals/isAutoLayoutFrame';
import { isVectorBoundAsTextPath } from 'utils/canvas/vector/isVectorBoundAsTextPath';

export type TUseTreeSourceResult = {
  getChildren: (item: TSceneNode) => TSceneNode[] | undefined;
  roots: TSceneNode[];
};

const isTextPathGuideNode = (node: TSceneNode, nodes: Record<string, TSceneNode>): boolean =>
  node.type === NodeType.path || (node.type === NodeType.vector && isVectorBoundAsTextPath(nodes, node.id));

export const useTreeSource = (): TUseTreeSourceResult => {
  const { nodes, rootOrder } = useAppSelector(selectActivePage);

  const getChildren = useCallback(
    (item: TSceneNode): TSceneNode[] | undefined => {
      if (isContainerNode(item)) {
        const orderedChildIds = isAutoLayoutFrame(item) ? item.childIds : [...item.childIds].reverse();

        return orderedChildIds
          .map((id) => nodes[id])
          .filter((node): node is TSceneNode => Boolean(node) && !isTextPathGuideNode(node, nodes));
      }

      return undefined;
    },
    [nodes],
  );

  const roots = useMemo(
    () =>
      [...rootOrder]
        .reverse()
        .map((id) => nodes[id])
        .filter((node): node is TSceneNode => Boolean(node) && !isTextPathGuideNode(node, nodes)),
    [nodes, rootOrder],
  );

  return { getChildren, roots };
};
