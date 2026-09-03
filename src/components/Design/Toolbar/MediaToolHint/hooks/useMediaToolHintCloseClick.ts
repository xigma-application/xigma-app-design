// store
import { setActiveTool } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

export const useMediaToolHintCloseClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(setActiveTool(ToolName.default));
  };
};
