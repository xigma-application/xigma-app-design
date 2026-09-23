// others
import { handleSelectMatchingLayers } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleSelectMatchingLayers';

// store
import { useAppDispatch } from 'store';

export const useSelectMatchingLayers = (): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    handleSelectMatchingLayers(dispatch);
  };
};
