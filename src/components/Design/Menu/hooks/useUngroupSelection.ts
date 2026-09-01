// store
import { useAppDispatch } from 'store';

// utils
import { handleUngroupSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleUngroupSelection';

export const useUngroupSelection = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => handleUngroupSelection(dispatch);
};
