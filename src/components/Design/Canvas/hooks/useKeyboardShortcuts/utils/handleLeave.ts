// store
import { cancelCommentDraft, setActiveTool, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { selectActiveTool, selectPenActiveVertexId, selectVectorEditingNodeId } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { handleEscapePenActiveVertex } from './handleEscapePenActiveVertex';

export const handleLeave = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const penActiveVertexId = selectPenActiveVertexId(state);
  const vectorEditingNodeId = selectVectorEditingNodeId(state);

  switch (true) {
    case penActiveVertexId !== null:
      handleEscapePenActiveVertex(dispatch);
      break;
    case vectorEditingNodeId !== null && activeTool !== ToolName.move:
      dispatch(setActiveTool(ToolName.move));
      break;
    case vectorEditingNodeId !== null:
      dispatch(setActiveTool(ToolName.default));
      dispatch(setVectorEditingNodeId(null));
      break;
    default:
      dispatch(setActiveTool(ToolName.default));
      dispatch(setSelection([]));
      dispatch(cancelCommentDraft());
  }
};
