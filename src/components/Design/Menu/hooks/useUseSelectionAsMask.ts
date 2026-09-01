// store
import { useAppDispatch } from 'store';

// utils
import { handleUseSelectionAsMask } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleUseSelectionAsMask';

export const useUseSelectionAsMask = (): TFunc => {
  const dispatch = useAppDispatch();
  return (): void => handleUseSelectionAsMask(dispatch);
};
