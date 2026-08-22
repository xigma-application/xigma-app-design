// store
import { deleteNode, setPenActiveVertexId, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

export const deleteDanglingActiveVertex = (dispatch: AppDispatch, node: TVectorNode, vertexId: string): void => {
  const isConnectedToASegment = Object.values(node.segments).some((segment) => segment.startId === vertexId || segment.endId === vertexId);

  if (isConnectedToASegment) {
    dispatch(setPenActiveVertexId(null));
  } else if (Object.keys(node.vertices).length === 1) {
    dispatch(deleteNode(node.id));
    dispatch(setVectorEditingNodeIds(selectVectorEditingNodeIds(store.getState()).filter((id) => id !== node.id)));
    dispatch(setPenActiveVertexId(null));
  } else {
    const vertices = Object.fromEntries(Object.entries(node.vertices).filter(([id]) => id !== vertexId));
    const vertexHandleModes = Object.fromEntries(Object.entries(node.vertexHandleModes).filter(([id]) => id !== vertexId));

    dispatch(updateNode({ changes: { vertexHandleModes, vertices }, id: node.id }));
    dispatch(setPenActiveVertexId(null));
  }
};
