// store
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const enterVectorEditMode = (dispatch: AppDispatch, vectorNodeIds: string[]): void => {
  if (vectorNodeIds.length > 0) {
    dispatch(setVectorEditingNodeIds(vectorNodeIds));
    dispatch(setActiveTool(ToolName.move));
  }
};
