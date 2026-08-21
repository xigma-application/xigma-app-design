// core
import { useCanvasRefsContext } from 'pages/DesignPage/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { selectToolbarTool } from '../../utils/selectToolbarTool';

export const useSelectTool = (): ((value: string) => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (value: string): void => {
    if (value) {
      selectToolbarTool(dispatch, value as ToolName, refs);
    }
  };
};
