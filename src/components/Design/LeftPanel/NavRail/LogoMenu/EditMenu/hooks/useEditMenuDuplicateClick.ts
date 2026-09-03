// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// utils
import { handleDuplicateSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleDuplicateSelection';

export const useEditMenuDuplicateClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    handleDuplicateSelection(dispatch, refs);
  };
};
