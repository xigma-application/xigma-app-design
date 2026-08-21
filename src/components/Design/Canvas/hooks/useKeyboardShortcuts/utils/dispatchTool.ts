// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { setActiveTool } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const VECTOR_EDIT_ALLOWED_TOOLS: ToolName[] = [ToolName.pen, ToolName.pencil, ToolName.lasso, ToolName.paint, ToolName.move];

export const dispatchTool = (dispatch: AppDispatch, tool: ToolName): void => {
  const isBlocked = selectVectorEditingNodeId(store.getState()) !== null && !VECTOR_EDIT_ALLOWED_TOOLS.includes(tool);

  if (!isBlocked) {
    dispatch(setActiveTool(tool));
  }
};
