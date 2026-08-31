// store
import { useAppDispatch } from 'store';

// utils
import { handleFlattenSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleFlattenSelection';

export const useFlattenSelection = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    void handleFlattenSelection(dispatch);
  };
};
