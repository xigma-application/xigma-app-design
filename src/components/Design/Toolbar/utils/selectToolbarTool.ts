// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { setActiveTool, setVectorEditingNodeId } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { clearPenPreviewRefs } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clearPenPreviewRefs';
import { handleEscapePenActiveVertex } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleEscapePenActiveVertex';

const PEN_GROUP_TOOLS: ToolName[] = [ToolName.pen, ToolName.pencil];

export const selectToolbarTool = (dispatch: AppDispatch, tool: ToolName, refs: TCanvasRefs): void => {
  const vectorEditingNodeId = selectVectorEditingNodeId(store.getState());
  const isPenGroupTool = PEN_GROUP_TOOLS.includes(tool);

  if (vectorEditingNodeId !== null && !isPenGroupTool) {
    handleEscapePenActiveVertex(dispatch);
    clearPenPreviewRefs(refs);
    dispatch(setVectorEditingNodeId(null));
  }

  dispatch(setActiveTool(tool));
};
