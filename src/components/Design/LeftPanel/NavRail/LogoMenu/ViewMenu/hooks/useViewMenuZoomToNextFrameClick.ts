// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleZoomToAdjacentFrame } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomToAdjacentFrame';

export const useViewMenuZoomToNextFrameClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    handleZoomToAdjacentFrame(dispatch, refs, 'next');
  };
};
