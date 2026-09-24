// others
import { COMPONENT_NON_MATCHING_HINT_LABEL_KEY } from '../constants';

// store
import { setDesignHintLabelKey } from 'store/design/slice';
import { useAppDispatch } from 'store';

// hooks
import { useIsSelectionFromOneParent } from './useIsSelectionFromOneParent';

export const useCreateComponent = (): TFunc => {
  const dispatch = useAppDispatch();
  const isFromOneParent = useIsSelectionFromOneParent();

  return (): void => {
    if (!isFromOneParent) {
      dispatch(setDesignHintLabelKey(COMPONENT_NON_MATCHING_HINT_LABEL_KEY));
    }
  };
};
