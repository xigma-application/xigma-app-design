// store
import { useAppDispatch } from 'store';

// utils
import { handleOutlineStroke } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleOutlineStroke/handleOutlineStroke';

export const useOutlineStrokeSelection = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    void handleOutlineStroke(dispatch);
  };
};
