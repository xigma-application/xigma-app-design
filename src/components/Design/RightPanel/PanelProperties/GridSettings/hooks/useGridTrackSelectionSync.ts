import { useEffect, useRef } from 'react';

// store
import { setGridTrackSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const useGridTrackSelectionSync = (frameId: string | null, activeAxis: TGridTrackAxis | null, selectedIndices: number[]): void => {
  const dispatch = useAppDispatch();
  const hasMountedRef = useRef(false);
  const hasPublishedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
    } else if (frameId && activeAxis && selectedIndices.length > 0) {
      hasPublishedRef.current = true;
      dispatch(setGridTrackSelection({ axis: activeAxis, frameId, indices: selectedIndices }));
    }

    return (): void => {
      if (hasPublishedRef.current) {
        hasPublishedRef.current = false;
        dispatch(setGridTrackSelection(null));
      }
    };
  }, [activeAxis, dispatch, frameId, selectedIndices]);
};
