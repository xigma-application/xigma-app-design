// store
import { useAppDispatch } from 'store';

// utils
import { handleToggleRulers } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleToggleRulers';

export const useRulersClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return (): void => {
    handleToggleRulers(dispatch);
  };
};
