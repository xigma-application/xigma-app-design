// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { commitGridAxisValueChange } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisValueChange';

export const commitFixedTrackEdit = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  edit: TGridTrackValueEditTarget,
  currentTracks: TGridTrackSize[],
  indices: number[],
  raw: string,
): void => {
  const parsed = parseFloat(raw.trim());

  if (!Number.isNaN(parsed)) {
    commitGridAxisValueChange(dispatch, frame, edit.axis, currentTracks, indices, edit.index, parsed);
  }
};
