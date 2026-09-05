// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const reparentToDropTarget = (
  dispatch: AppDispatch,
  state: RootState,
  canvasRefs: TCanvasRefs,
  movedNodeIds: string[],
  desiredParentId: string | null,
): void => {
  canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;

  const page = selectActivePage(state);
  const targetParent = desiredParentId ? page.nodes[desiredParentId] : null;
  const targetIndex = targetParent && isContainerNode(targetParent) ? targetParent.childIds.length : page.rootOrder.length;

  dispatch(moveNodes({ nodeIds: movedNodeIds, targetIndex, targetParentId: desiredParentId }));
};
