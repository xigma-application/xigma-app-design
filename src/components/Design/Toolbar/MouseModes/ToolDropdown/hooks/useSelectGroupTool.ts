// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { selectToolbarTool } from '../../../utils/selectToolbarTool';

export const useSelectGroupTool = (): ((tool: ToolName) => () => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (tool: ToolName) => (): void => {
    selectToolbarTool(dispatch, tool, refs);
  };
};
