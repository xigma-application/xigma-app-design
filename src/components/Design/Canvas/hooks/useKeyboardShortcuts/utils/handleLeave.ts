// store
import { cancelCommentDraft, setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActiveTool, selectPenActiveVertexId, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { clearPenPreviewRefs } from './clearPenPreviewRefs';
import { handleEscapePenActiveVertex } from './handleEscapePenActiveVertex';

export const handleLeave = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const penActiveVertexId = selectPenActiveVertexId(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  switch (true) {
    case penActiveVertexId !== null:
      handleEscapePenActiveVertex(dispatch);
      clearPenPreviewRefs(refs);
      break;
    case vectorEditingNodeIds.length > 0 && activeTool !== ToolName.move:
      dispatch(setActiveTool(ToolName.move));
      break;
    case vectorEditingNodeIds.length > 0:
      dispatch(setActiveTool(ToolName.default));
      dispatch(setVectorEditingNodeIds([]));
      break;
    default:
      dispatch(setActiveTool(ToolName.default));
      dispatch(setSelection([]));
      dispatch(cancelCommentDraft());
  }
};
