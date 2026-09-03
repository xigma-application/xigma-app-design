// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleZoomToSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomToSelection';

export const useViewMenuZoomToSelectionClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    handleZoomToSelection(dispatch, refs);
  };
};
