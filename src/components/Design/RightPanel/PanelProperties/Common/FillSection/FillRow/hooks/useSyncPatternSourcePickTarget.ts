import { useEffect } from 'react';

// store
import { setPatternSourcePickTarget } from 'store/design/slice';
import { useAppDispatch } from 'store';

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
    } else {
      dispatch(setPatternSourcePickTarget(null));
    }

    return (): void => {
      dispatch(setPatternSourcePickTarget(null));
    };
  }, [dispatch, isPattern, isPickerOpen, nodeId, paintIndex]);
};
