// store
import { useAppDispatch } from 'store';

// utils
import { handleFlipSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleFlipSelection';

export type TFlipSelectionActions = {
  onFlipHorizontal: TFunc;
  onFlipVertical: TFunc;
};

export const useFlipSelection = (): TFlipSelectionActions => {
  const dispatch = useAppDispatch();

  return {
    onFlipHorizontal: (): void => handleFlipSelection(dispatch, 'horizontal'),
    onFlipVertical: (): void => handleFlipSelection(dispatch, 'vertical'),
  };
};
