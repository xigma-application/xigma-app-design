// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// types
import { TSceneNode } from 'types/design/types';

export const getDropNodeOrder = (selectedIds: string[], currentParent: TSceneNode | null, rootOrder: string[]): string[] => {
  const siblingOrder = currentParent && isContainerNode(currentParent) ? currentParent.childIds : rootOrder;
  const selectedIdSet = new Set(selectedIds);
  const ordered = siblingOrder.filter((id) => selectedIdSet.has(id));
  const orderedIdSet = new Set(ordered);

  return [...ordered, ...selectedIds.filter((id) => !orderedIdSet.has(id))];
};
