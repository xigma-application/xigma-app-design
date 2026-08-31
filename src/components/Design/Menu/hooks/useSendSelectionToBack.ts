// store
import { useAppDispatch } from 'store';

// utils
import { handleSendToBack } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleSendToBack';

export const useSendSelectionToBack = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => handleSendToBack(dispatch);
};
