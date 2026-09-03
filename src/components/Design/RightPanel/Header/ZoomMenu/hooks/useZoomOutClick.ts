// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleZoomOut } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomOut';

export const useZoomOutClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (): void => {
    handleZoomOut(dispatch, refs);
  };
};
