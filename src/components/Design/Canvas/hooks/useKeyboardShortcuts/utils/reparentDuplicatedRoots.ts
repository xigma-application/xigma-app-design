// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSceneNode } from 'types/design/types';

export const reparentDuplicatedRoots = (
  dispatch: AppDispatch,
  originalNodes: Record<string, TSceneNode>,
  originalRootIds: string[],
  clonedRootIds: string[],
): void => {
  for (const [index, originalId] of originalRootIds.entries()) {
    const parentId = originalNodes[originalId].parentId;
    const parent = parentId ? selectActivePage(store.getState()).nodes[parentId] : null;

    if (parent && isContainerNode(parent)) {
      dispatch(
        moveNodes({ nodeIds: [clonedRootIds[index]], targetIndex: parent.childIds.indexOf(originalId) + 1, targetParentId: parentId }),
      );
    }
  }
};
