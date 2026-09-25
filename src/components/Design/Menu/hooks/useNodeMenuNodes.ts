// store
import { selectSelectedIds, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TSceneNode } from 'types/design/types';

export const useNodeMenuNodes = (node: TSceneNode): TSceneNode[] => {
  const selectedIds = useAppSelector(selectSelectedIds);
  const selectedNodes = useAppSelector(selectSelectedNodes);

  return selectedIds.includes(node.id) ? selectedNodes.filter((selected): selected is TSceneNode => selected !== undefined) : [node];
};
