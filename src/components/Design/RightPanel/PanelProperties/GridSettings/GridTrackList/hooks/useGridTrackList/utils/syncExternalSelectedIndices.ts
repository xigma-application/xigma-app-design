import { RefObject } from 'react';

// hooks
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const syncExternalSelectedIndices = (
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  externalSelectedIndices: number[],
  lastExternalSelectedIndicesRef: RefObject<number[]>,
  setSelection: (indices: number[]) => void,
): void => {
  const hasChanged =
    lastExternalSelectedIndicesRef.current.length !== externalSelectedIndices.length ||
    lastExternalSelectedIndicesRef.current.some((index, position) => index !== externalSelectedIndices[position]);

  if (hasChanged) {
    lastExternalSelectedIndicesRef.current = externalSelectedIndices;

    if (externalSelectedIndices.length > 0) {
      coordinator.onSelectionChange(axis, true);
      setSelection(externalSelectedIndices);
    }
  }
};
