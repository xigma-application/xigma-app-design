// store
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { commitGridAxisTracks } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisTracks';

export const commitGridAxisValueChange = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
  indices: number[],
  triggerIndex: number,
  value: number,
): void => {
  const mode = currentTracks[triggerIndex]?.mode ?? SizingMode.fixed;
  const next = currentTracks.map((track, trackIndex) => (indices.includes(trackIndex) ? { mode, value: Math.max(value, 0) } : track));

  commitGridAxisTracks(dispatch, frame.id, axis, next);
};
