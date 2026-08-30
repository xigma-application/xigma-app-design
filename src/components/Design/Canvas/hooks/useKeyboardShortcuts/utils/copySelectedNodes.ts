// store
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// utils
import { collectSubtreeNodes } from './collectSubtreeNodes';
import { setClipboardNodes } from './clipboard';

export const copySelectedNodes = (): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);
  const selectedIds = selectSelectedIds(state);
  const { vectorEditingNodeIds } = state.design;

  if (selectedIds.length > 0 && vectorEditingNodeIds.length === 0) {
    setClipboardNodes(collectSubtreeNodes(nodes, selectedIds), selectedIds);
  }
};
