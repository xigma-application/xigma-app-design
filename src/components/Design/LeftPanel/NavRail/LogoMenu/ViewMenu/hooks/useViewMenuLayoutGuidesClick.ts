// others
import { handleToggleLayoutGuides } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleToggleLayoutGuides';

// store
import { useAppDispatch } from 'store';

export const useViewMenuLayoutGuidesClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    handleToggleLayoutGuides(dispatch);
  };
};
