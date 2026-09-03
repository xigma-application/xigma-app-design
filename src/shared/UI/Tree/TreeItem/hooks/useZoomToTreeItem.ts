// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { setSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

// utils
import { handleZoomToSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomToSelection';

export const useZoomToTreeItem = (id: string): (() => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return () => {
    dispatch(setSelection([id]));
    handleZoomToSelection(dispatch, refs);
  };
};
