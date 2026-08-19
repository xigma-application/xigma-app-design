// store
import { cancelCommentDraft, setActiveTool, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { selectActiveTool, selectPenActiveVertexId, selectVectorEditingNodeId } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const handleLeave = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const penActiveVertexId = selectPenActiveVertexId(state);
  const vectorEditingNodeId = selectVectorEditingNodeId(state);

  if (penActiveVertexId) {
    dispatch(setPenActiveVertexId(null));
  } else if (vectorEditingNodeId && (activeTool === ToolName.pen || activeTool === ToolName.pencil)) {
    dispatch(setActiveTool(ToolName.default));
  } else if (vectorEditingNodeId) {
    dispatch(setVectorEditingNodeId(null));
  } else {
    dispatch(setActiveTool(ToolName.default));
    dispatch(setSelection([]));
    dispatch(cancelCommentDraft());
  }
};
