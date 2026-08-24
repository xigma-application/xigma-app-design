// store
import { selectOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// utils
import { setClipboardNodes } from './clipboard';

export const handleCopySelection = (): void => {
  const state = store.getState();
  const { selectedIds, vectorEditingNodeIds } = state.design;

  if (selectedIds.length > 0 && vectorEditingNodeIds.length === 0) {
    setClipboardNodes(selectOrderedNodes(state).filter((node) => selectedIds.includes(node.id)));
  }
};
