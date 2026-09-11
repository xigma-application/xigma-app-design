import { Dispatch, SetStateAction } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { publishGridTrackSelection } from 'store/design/utils/publishGridTrackSelection';

export const commitGridTrackSelectionChange = (
  dispatch: AppDispatch,
  axis: TGridTrackAxis,
  frameId: string | null,
  setLocalIndices: Dispatch<SetStateAction<number[]>>,
  indices: number[],
): void => {
  setLocalIndices(indices);

  if (frameId) {
    publishGridTrackSelection(dispatch, indices.length > 0 ? { axis, frameId, indices } : null);
  }
};
