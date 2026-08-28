// store
import { setPenActiveVertexId } from 'store/design/slice';
import { selectPenActiveVertexId, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// utils
import { deleteDanglingActiveVertex } from './deleteDanglingActiveVertex';
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';

export const handleEscapePenActiveVertex = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const penActiveVertexId = selectPenActiveVertexId(state);
  const node = getVectorEditingNode(state.design.pages[state.design.activePageId].nodes, selectVectorEditingNodeIds(state)[0] ?? null);

  if (node && penActiveVertexId) {
    deleteDanglingActiveVertex(dispatch, node, penActiveVertexId);
  } else {
    dispatch(setPenActiveVertexId(null));
  }
};
