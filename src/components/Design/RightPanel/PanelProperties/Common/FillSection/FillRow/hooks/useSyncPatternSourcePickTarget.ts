import { useEffect, useRef } from 'react';

// store
import { selectPatternSourcePickTarget } from 'store/design/selectors';
import { setPatternSourcePickTarget } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const useSyncPatternSourcePickTarget = (
  nodeIds: string[],
  paintIndex: number,
  property: TPaintProperty,
  isPickerOpen: boolean,
  isPattern: boolean,
): void => {
  const dispatch = useAppDispatch();
  const nodeIdsRef = useRef(nodeIds);
  const nodeIdsKey = nodeIds.join(',');
  nodeIdsRef.current = nodeIds;

  useEffect(() => {
    if (nodeIdsKey && isPickerOpen && isPattern) {
      dispatch(setPatternSourcePickTarget({ nodeIds: nodeIdsRef.current, paintIndex, property }));
    }

    return (): void => {
      const current = selectPatternSourcePickTarget(store.getState());

      if (
        current &&
        current.nodeIds.join(',') === nodeIdsKey &&
        current.paintIndex === paintIndex &&
        (current.property ?? 'fills') === property
      ) {
        dispatch(setPatternSourcePickTarget(null));
      }
    };
  }, [dispatch, isPattern, isPickerOpen, nodeIdsKey, paintIndex, property]);
};
