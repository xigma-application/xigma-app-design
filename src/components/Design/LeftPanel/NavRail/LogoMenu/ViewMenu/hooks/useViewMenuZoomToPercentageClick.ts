// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleZoomToPercentage } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomToPercentage';

export const useViewMenuZoomToPercentageClick = (): ((percent: number) => () => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (percent: number) => (): void => {
    handleZoomToPercentage(dispatch, refs, percent);
  };
};
