import { useEffect } from 'react';

// store
import { selectPatternSourcePickTarget } from 'store/design/selectors';
import { setPatternSourcePickTarget } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

export const useSyncPatternSourcePickTarget = (
  nodeId: string | undefined,
  paintIndex: number,
  isPickerOpen: boolean,
  isPattern: boolean,
): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (nodeId && isPickerOpen && isPattern) {
      dispatch(setPatternSourcePickTarget({ nodeId, paintIndex }));
    }

    return (): void => {
      const current = selectPatternSourcePickTarget(store.getState());

      if (current && current.nodeId === nodeId && current.paintIndex === paintIndex) {
        dispatch(setPatternSourcePickTarget(null));
      }
    };
  }, [dispatch, isPattern, isPickerOpen, nodeId, paintIndex]);
};
