// store
import { setSelection } from 'store/design/slice';
import { selectOrderedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';

export const handleSelectAll = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (vectorEditingNodeIds.length > 0) {
    const editingNodes = vectorEditingNodeIds
      .map((nodeId) => getVectorEditingNode(state.design.pages[state.design.activePageId].nodes, nodeId))
      .filter((node): node is TVectorNode => node !== null);

    refs.vectorEdit.selectedVectorVertexIdsRef.current = editingNodes.flatMap((node) => Object.keys(node.vertices));
    refs.vectorEdit.selectedVectorSegmentIdsRef.current = editingNodes.flatMap((node) => Object.keys(node.segments));
    refs.vectorEdit.selectedVectorHandlesRef.current = [];
  } else {
    dispatch(setSelection(selectOrderedNodes(state).map((node) => node.id)));
  }
};
