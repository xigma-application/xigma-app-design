import { useCallback, useMemo } from 'react';

// store
import { selectActivePage } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export type TUseTreeSourceResult = {
  getChildren: (item: TSceneNode) => TSceneNode[] | undefined;
  roots: TSceneNode[];
};

export const useTreeSource = (): TUseTreeSourceResult => {
  const { nodes, rootOrder } = useAppSelector(selectActivePage);

  const getChildren = useCallback(
    (item: TSceneNode): TSceneNode[] | undefined => {
      if (item.type === NodeType.group) {
        return item.childIds.map((id) => nodes[id]).filter((node): node is TSceneNode => Boolean(node));
      }

      return undefined;
    },
    [nodes],
  );

  const roots = useMemo(() => rootOrder.map((id) => nodes[id]).filter((node): node is TSceneNode => Boolean(node)), [nodes, rootOrder]);

  return { getChildren, roots };
};
