// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// types
import { TSceneNode } from 'types/design/types';

export const getDropNodeOrder = (selectedIds: string[], currentParent: TSceneNode | null, rootOrder: string[]): string[] => {
  const siblingOrder = currentParent && isContainerNode(currentParent) ? currentParent.childIds : rootOrder;
  const ordered = siblingOrder.filter((id) => selectedIds.includes(id));

  return [...ordered, ...selectedIds.filter((id) => !ordered.includes(id))];
};
