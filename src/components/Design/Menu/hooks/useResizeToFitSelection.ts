// store
import { useAppDispatch } from 'store';

// utils
import { handleResizeToFit } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleResizeToFit';

export const useResizeToFitSelection = (): TFunc => {
  const dispatch = useAppDispatch();
  return (): void => handleResizeToFit(dispatch);
};
