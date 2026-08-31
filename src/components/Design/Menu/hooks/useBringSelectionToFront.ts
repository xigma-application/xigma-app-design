// store
import { useAppDispatch } from 'store';

// utils
import { handleBringToFront } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleBringToFront';

export const useBringSelectionToFront = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => handleBringToFront(dispatch);
};
