// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleRedo } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleRedo';

export const useEditMenuRedoClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    handleRedo(dispatch, refs);
  };
};
