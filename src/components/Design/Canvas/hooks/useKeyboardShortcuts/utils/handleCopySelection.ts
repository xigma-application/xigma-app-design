// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { copySelectedNodes } from './copySelectedNodes';
import { copyVectorFragment } from './copyVectorFragment';

export const handleCopySelection = (refs: TCanvasRefs): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);
  const { vectorEditingNodeIds } = state.design;
  const selectedVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;
  const selectedSegmentIds = refs.vectorEdit.selectedVectorSegmentIdsRef.current;

  if (selectedVertexIds.length > 0 || selectedSegmentIds.length > 0) {
    copyVectorFragment(nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);
  } else {
    copySelectedNodes();
  }
};
