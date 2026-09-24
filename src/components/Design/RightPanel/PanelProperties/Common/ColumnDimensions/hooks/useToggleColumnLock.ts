// hooks
import { useAppDispatch } from 'store';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { updateNode } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

export const useToggleColumnLock = (nodes: TBoxSceneNode[], locked: boolean): TFunc => {
  const dispatch = useAppDispatch();

  const setNodesLock = (nextLocked: boolean): void => {
    nodes.forEach((node) => {
      const isSized =
        (node.widthSizingMode ?? SizingMode.fixed) !== SizingMode.fixed || (node.heightSizingMode ?? SizingMode.fixed) !== SizingMode.fixed;
      const sizingModeChanges = nextLocked && isSized ? { heightSizingMode: SizingMode.fixed, widthSizingMode: SizingMode.fixed } : {};

      dispatch(updateNode({ changes: { lockedAspectRatio: nextLocked, ...sizingModeChanges }, id: node.id }));
    });
  };

  return (): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    setNodesLock(!locked);
    dispatch(endHistoryGesture());
  };
};
