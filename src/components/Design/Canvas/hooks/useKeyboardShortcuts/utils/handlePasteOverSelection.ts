// store
import { addNodes, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { buildPasteOverNodes } from './buildPasteOverNodes';
import { canReplaceSelectionWithClipboard } from './canReplaceSelectionWithClipboard';
import { forEachClipboardTargetPair } from './forEachClipboardTargetPair';
import { getClipboardNodes } from './clipboard';

export const handlePasteOverSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);
  const selectedIds = selectSelectedIds(state);
  const clipboard = getClipboardNodes();

  if (canReplaceSelectionWithClipboard(selectedIds, clipboard.rootIds)) {
    const clipboardNodesById: Record<string, TSceneNode> = Object.fromEntries(clipboard.nodes.map((node) => [node.id, node]));
    const addedNodes: TSceneNode[] = [];
    const addedRootIds: string[] = [];

    forEachClipboardTargetPair(selectedIds, clipboard.rootIds, clipboardNodesById, nodes, (target, clipboardRoot) => {
      const pasted = buildPasteOverNodes(clipboardNodesById, clipboardRoot, target);

      addedNodes.push(...pasted.nodes);
      addedRootIds.push(...pasted.rootIds);
    });

    if (addedNodes.length > 0) {
      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      dispatch(addNodes({ nodes: addedNodes, rootIds: addedRootIds }));
      dispatch(setSelection(addedRootIds));
      dispatch(endHistoryGesture());
    }
  }
};
