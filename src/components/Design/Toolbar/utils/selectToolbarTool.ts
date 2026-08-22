// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { clearPenPreviewRefs } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clearPenPreviewRefs';
import { handleEscapePenActiveVertex } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleEscapePenActiveVertex';

const PEN_GROUP_TOOLS: ToolName[] = [ToolName.pen, ToolName.pencil];

export const selectToolbarTool = (dispatch: AppDispatch, tool: ToolName, refs: TCanvasRefs): void => {
  const vectorEditingNodeIds = selectVectorEditingNodeIds(store.getState());
  const isPenGroupTool = PEN_GROUP_TOOLS.includes(tool);

  if (vectorEditingNodeIds.length > 0 && !isPenGroupTool) {
    handleEscapePenActiveVertex(dispatch);
    clearPenPreviewRefs(refs);
    dispatch(setVectorEditingNodeIds([]));
  }

  dispatch(setActiveTool(tool));
};
