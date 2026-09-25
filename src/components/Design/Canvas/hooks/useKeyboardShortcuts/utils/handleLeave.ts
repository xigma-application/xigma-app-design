// store
import {
  cancelCommentDraft,
  setActiveTool,
  setImageEditor,
  setOffsetVector,
  setSelection,
  setVectorEditingNodeIds,
} from 'store/design/slice';
import {
  selectActiveTool,
  selectImageEditor,
  selectOffsetVector,
  selectPenActiveVertexId,
  selectVectorEditingNodeIds,
} from 'store/design/selectors';
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
  const imageEditor = selectImageEditor(state);
  const penActiveVertexId = selectPenActiveVertexId(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  switch (true) {
    case refs.drawing.cancelDrawRef.current !== null:
      refs.drawing.cancelDrawRef.current();
      break;
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
    case selectOffsetVector(state) !== null:
      dispatch(setOffsetVector(null));
      break;
    case imageEditor !== null:
      dispatch(setImageEditor(null));
      break;
    default:
      dispatch(setActiveTool(ToolName.default));
      dispatch(setSelection([]));
      dispatch(cancelCommentDraft());
  }
};
