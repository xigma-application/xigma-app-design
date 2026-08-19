// store
import { setPenActiveVertexId } from 'store/design/slice';
import { selectPenActiveVertexId, selectVectorEditingNodeId } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// utils
import { deleteDanglingActiveVertex } from './deleteDanglingActiveVertex';
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';

export const handleEscapePenActiveVertex = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const penActiveVertexId = selectPenActiveVertexId(state);
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

  if (node && penActiveVertexId) {
    deleteDanglingActiveVertex(dispatch, node, penActiveVertexId);
  } else {
    dispatch(setPenActiveVertexId(null));
  }
};
