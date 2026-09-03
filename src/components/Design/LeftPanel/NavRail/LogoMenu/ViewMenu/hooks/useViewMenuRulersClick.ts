// others
import { handleToggleRulers } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleToggleRulers';

// store
import { useAppDispatch } from 'store';

export const useViewMenuRulersClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    handleToggleRulers(dispatch);
  };
};
