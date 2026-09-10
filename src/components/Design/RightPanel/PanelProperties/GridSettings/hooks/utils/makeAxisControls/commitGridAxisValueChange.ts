// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { commitGridAxisTracks } from '../commitGridAxisTracks';

export const commitGridAxisValueChange = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
  index: number,
  value: number,
): void => {
  const next = currentTracks.map((track, trackIndex) => (trackIndex === index ? { ...track, value: Math.max(value, 0) } : track));
  commitGridAxisTracks(dispatch, frame.id, axis, next);
};
