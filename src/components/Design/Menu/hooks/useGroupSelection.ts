// store
import { useAppDispatch } from 'store';

// utils
import { handleGroupSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleGroupSelection';

export const useGroupSelection = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => handleGroupSelection(dispatch);
};
