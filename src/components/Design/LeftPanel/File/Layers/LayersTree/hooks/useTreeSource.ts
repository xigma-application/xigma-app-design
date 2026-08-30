import { useCallback, useMemo } from 'react';

// store
import { isVectorBoundAsTextPath } from 'store/design/utils/isVectorBoundAsTextPath';
import { selectActivePage } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

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
      if (item.type === NodeType.group) {
        return item.childIds
          .map((id) => nodes[id])
          .filter((node): node is TSceneNode => Boolean(node) && !isTextPathGuideNode(node, nodes));
      }

      return undefined;
    },
    [nodes],
  );

  const roots = useMemo(
    () => rootOrder.map((id) => nodes[id]).filter((node): node is TSceneNode => Boolean(node) && !isTextPathGuideNode(node, nodes)),
    [nodes, rootOrder],
  );

  return { getChildren, roots };
};
