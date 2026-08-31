// store
import { useAppDispatch } from 'store';

// utils
import { handlePasteToReplace } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handlePasteToReplace';

export const usePasteToReplace = (): TFunc => {
  const dispatch = useAppDispatch();
  return (): void => handlePasteToReplace(dispatch);
};
