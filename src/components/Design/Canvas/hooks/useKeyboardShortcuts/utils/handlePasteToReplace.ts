// store
import { addNodes, replaceNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSceneNode } from 'types/design/types';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// utils
import { buildReplacementNodes } from './buildReplacementNodes';
import { canReplaceSelectionWithClipboard } from './canReplaceSelectionWithClipboard';
import { getClipboardNodes } from './clipboard';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const handlePasteToReplace = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);
  const selectedIds = selectSelectedIds(state);
  const clipboard = getClipboardNodes();
  const canReplace = canReplaceSelectionWithClipboard(selectedIds, clipboard.rootIds);

  if (canReplace) {
    const clipboardNodesById: Record<string, TSceneNode> = Object.fromEntries(clipboard.nodes.map((node) => [node.id, node]));

    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));

    selectedIds.forEach((targetId, index) => {
      const target = nodes[targetId];
      const clipboardRootId = clipboard.rootIds.length === 1 ? clipboard.rootIds[0] : clipboard.rootIds[index];
      const clipboardRoot = clipboardNodesById[clipboardRootId];

      if (target && clipboardRoot && isBoxSceneNode(target) && isBoxSceneNode(clipboardRoot)) {
        const { descendants, newRoot } = buildReplacementNodes(clipboardNodesById, clipboardRoot, target);

        if (descendants.length > 0) {
          dispatch(addNodes({ nodes: descendants, rootIds: [] }));
        }

        dispatch(replaceNode({ id: targetId, node: newRoot }));
      }
    });

    dispatch(endHistoryGesture());
  }
};
