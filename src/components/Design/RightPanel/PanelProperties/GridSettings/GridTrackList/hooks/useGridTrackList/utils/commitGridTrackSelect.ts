import { RefObject } from 'react';

// hooks
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';
import { TGridTrackSelectModifiers } from '../../useGridTrackSelection';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { getGridTrackRangeIndices } from '../../../utils/getGridTrackRangeIndices';
import { getGridTrackToggledIndices } from '../../../utils/getGridTrackToggledIndices';

export const commitGridTrackSelect = (
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  anchorRef: RefObject<number | null>,
  setSelection: (indices: number[]) => void,
  selectedIndices: number[],
  index: number,
  modifiers: TGridTrackSelectModifiers,
): void => {
  coordinator.onSelectionChange(axis, true);

  switch (true) {
    case modifiers.shift && anchorRef.current !== null:
      setSelection(getGridTrackRangeIndices(anchorRef.current!, index));
      break;
    case modifiers.meta:
      anchorRef.current = index;
      setSelection(getGridTrackToggledIndices(selectedIndices, index));
      break;
    default:
      anchorRef.current = index;
      setSelection([index]);
      break;
  }
};
