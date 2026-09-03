// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleZoomIn } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomIn';

export const useZoomInClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (): void => {
    handleZoomIn(dispatch, refs);
  };
};
