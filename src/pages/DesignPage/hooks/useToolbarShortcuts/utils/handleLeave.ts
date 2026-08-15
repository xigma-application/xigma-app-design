// store
import { setActiveTool, setSelection } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const handleLeave = (dispatch: AppDispatch): void => {
  dispatch(setActiveTool(ToolName.default));
  dispatch(setSelection([]));
};
