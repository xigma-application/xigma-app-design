// store
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { commitGridAxisModeChange } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisModeChange';
import { commitGridAxisValueChange } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisValueChange';
import { parseFillFieldInput } from 'store/design/utils/autoLayout/gridTracks/parseFillFieldInput';

export const commitFillTrackEdit = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  edit: TGridTrackValueEditTarget,
  currentTracks: TGridTrackSize[],
  indices: number[],
  raw: string,
): void => {
  const result = parseFillFieldInput(raw);

  if (result.mode === SizingMode.fill) {
    commitGridAxisValueChange(dispatch, frame, edit.axis, currentTracks, indices, edit.index, result.value);
  } else if (result.mode === SizingMode.fixed) {
    commitGridAxisModeChange(dispatch, frame, edit.axis, currentTracks, indices, SizingMode.fixed, result.value);
  }
};
