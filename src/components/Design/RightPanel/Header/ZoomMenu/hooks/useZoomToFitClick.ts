// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleZoomToFit } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomToFit';

export const useZoomToFitClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (): void => {
    handleZoomToFit(dispatch, refs);
  };
};
