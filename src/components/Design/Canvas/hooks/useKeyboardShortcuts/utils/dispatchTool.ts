// store
import { selectNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { setActiveTool } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { isDispatchToolBlocked } from './isDispatchToolBlocked';

export const dispatchTool = (dispatch: AppDispatch, tool: ToolName): void => {
  const state = store.getState();
  const isToolBlocked = isDispatchToolBlocked(tool, selectVectorEditingNodeIds(state), selectNodes(state));

  if (!isToolBlocked) {
    dispatch(setActiveTool(tool));
  }
};
