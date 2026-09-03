// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { selectToolbarTool } from 'components/Design/Toolbar/utils/selectToolbarTool';

export const useFileMenuPlaceImageClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    selectToolbarTool(dispatch, ToolName.media, refs);
  };
};
