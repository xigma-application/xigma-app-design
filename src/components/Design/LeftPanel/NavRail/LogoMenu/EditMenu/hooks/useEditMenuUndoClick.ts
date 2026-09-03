// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleUndo } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleUndo';

export const useEditMenuUndoClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    handleUndo(dispatch, refs);
  };
};
