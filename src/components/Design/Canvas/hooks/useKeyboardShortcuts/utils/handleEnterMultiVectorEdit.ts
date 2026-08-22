// store
import { selectSelectedIds } from 'store/design/selectors';
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

export const handleEnterMultiVectorEdit = (dispatch: AppDispatch): void => {
  const state = store.getState();
  const vectorIds = selectSelectedIds(state).filter((id) => state.design.nodes[id]?.type === NodeType.vector);

  if (vectorIds.length >= 2) {
    dispatch(setVectorEditingNodeIds(vectorIds));
    dispatch(setActiveTool(ToolName.move));
  }
};
