// store
import { useAppDispatch } from 'store';

// utils
import { handleConvertSelectionToFrame } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleConvertSelectionToFrame';

export const useConvertSelectionToFrame = (): TFunc => {
  const dispatch = useAppDispatch();
  return (): void => handleConvertSelectionToFrame(dispatch);
};
