// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleZoomTo100 } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomTo100';

export const useViewMenuZoomTo100Click = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    handleZoomTo100(dispatch, refs);
  };
};
