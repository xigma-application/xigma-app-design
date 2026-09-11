// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { addGridTrack } from 'store/design/utils/autoLayout/gridTracks/addGridTrack';
import { commitGridAxisTracks } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisTracks';

export const commitGridAxisAdd = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
): void => {
  const next = addGridTrack(currentTracks);
  commitGridAxisTracks(dispatch, frame.id, axis, next, next.length);
};
