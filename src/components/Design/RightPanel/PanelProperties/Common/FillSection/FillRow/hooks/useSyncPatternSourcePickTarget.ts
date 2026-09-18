import { useEffect } from 'react';

// store
import { selectPatternSourcePickTarget } from 'store/design/selectors';
import { setPatternSourcePickTarget } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const useSyncPatternSourcePickTarget = (
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty,
  isPickerOpen: boolean,
  isPattern: boolean,
): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (nodeId && isPickerOpen && isPattern) {
      dispatch(setPatternSourcePickTarget({ nodeId, paintIndex, property }));
    }

    return (): void => {
      const current = selectPatternSourcePickTarget(store.getState());

      if (current && current.nodeId === nodeId && current.paintIndex === paintIndex && (current.property ?? 'fills') === property) {
        dispatch(setPatternSourcePickTarget(null));
      }
    };
  }, [dispatch, isPattern, isPickerOpen, nodeId, paintIndex, property]);
};
