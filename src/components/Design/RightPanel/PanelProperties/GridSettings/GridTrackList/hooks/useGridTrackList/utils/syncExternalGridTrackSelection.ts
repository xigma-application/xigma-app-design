import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const syncExternalGridTrackSelection = (
  axis: TGridTrackAxis,
  controls: TGridAxisControls,
  coordinator: TGridTrackSelectionCoordinator,
  isSelfChangeRef: RefObject<boolean>,
  previousRevisionRef: RefObject<unknown>,
  initialSelectedIndicesRef: RefObject<number[]>,
  setSelection: (indices: number[]) => void,
): void => {
  if (previousRevisionRef.current !== controls.revision) {
    if (!isSelfChangeRef.current) {
      setSelection(initialSelectedIndicesRef.current);

      if (initialSelectedIndicesRef.current.length > 0) {
        coordinator.onSelectionChange(axis, true);
      }
    }

    isSelfChangeRef.current = false;
    previousRevisionRef.current = controls.revision;
  }
};
