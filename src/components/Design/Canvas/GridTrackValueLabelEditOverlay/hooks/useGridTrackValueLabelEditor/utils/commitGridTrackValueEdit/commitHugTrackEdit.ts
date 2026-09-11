// store
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { commitGridAxisModeChange } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisModeChange';

export const commitHugTrackEdit = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  edit: TGridTrackValueEditTarget,
  currentTracks: TGridTrackSize[],
  indices: number[],
  raw: string,
): void => {
  const parsed = parseFloat(raw.trim());

  if (!Number.isNaN(parsed)) {
    commitGridAxisModeChange(dispatch, frame, edit.axis, currentTracks, indices, SizingMode.fixed, parsed);
  }
};
