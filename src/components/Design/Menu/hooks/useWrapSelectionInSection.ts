// store
import { useAppDispatch } from 'store';

// utils
import { handleWrapSelectionInSection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleWrapSelectionInSection';

export const useWrapSelectionInSection = (): TFunc => {
  const dispatch = useAppDispatch();
  return (): void => handleWrapSelectionInSection(dispatch);
};
