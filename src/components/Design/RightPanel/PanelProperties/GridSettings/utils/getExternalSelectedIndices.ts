// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackSelection } from 'types/design/canvas/types';

// others
import { EMPTY_SELECTED_INDICES } from '../constants';

export const getExternalSelectedIndices = (
  axis: TGridTrackAxis,
  frameId: string | null,
  gridTrackSelection: TGridTrackSelection | null,
): number[] => {
  if (gridTrackSelection?.frameId === frameId && gridTrackSelection.axis === axis) {
    return gridTrackSelection.indices;
  }

  return EMPTY_SELECTED_INDICES;
};
