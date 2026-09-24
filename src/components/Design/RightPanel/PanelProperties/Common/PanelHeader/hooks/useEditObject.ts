// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// others
import { handleEnterVectorEdit } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleEnterVectorEdit/handleEnterVectorEdit';

// store
import { useAppDispatch } from 'store';

export const useEditObject = (): TFunc => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (): void => {
    handleEnterVectorEdit(dispatch, refs);
  };
};
