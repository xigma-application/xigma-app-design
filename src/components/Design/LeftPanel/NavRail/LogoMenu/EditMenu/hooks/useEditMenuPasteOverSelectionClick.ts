// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handlePasteOverSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handlePasteOverSelection';

export const useEditMenuPasteOverSelectionClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    handlePasteOverSelection(dispatch, refs);
  };
};
