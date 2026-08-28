// store
import { selectOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { copyVectorFragment } from './copyVectorFragment';
import { setClipboardNodes } from './clipboard';

export const handleCopySelection = (refs: TCanvasRefs): void => {
  const state = store.getState();
  const { nodes, selectedIds, vectorEditingNodeIds } = state.design;
  const selectedVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;
  const selectedSegmentIds = refs.vectorEdit.selectedVectorSegmentIdsRef.current;

  if (selectedVertexIds.length > 0 || selectedSegmentIds.length > 0) {
    copyVectorFragment(nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);
  } else if (selectedIds.length > 0 && vectorEditingNodeIds.length === 0) {
    setClipboardNodes(selectOrderedNodes(state).filter((node) => selectedIds.includes(node.id)));
  }
};
