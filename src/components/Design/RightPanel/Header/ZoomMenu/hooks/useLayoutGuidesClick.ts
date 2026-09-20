// store
import { useAppDispatch } from 'store';

// utils
import { handleToggleLayoutGuides } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleToggleLayoutGuides';

export const useLayoutGuidesClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return (): void => {
    handleToggleLayoutGuides(dispatch);
  };
};
