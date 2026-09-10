// store
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { commitGridAxisTracks } from '../commitGridAxisTracks';

export const commitGridAxisModeChange = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  axis: TGridTrackAxis,
  currentTracks: TGridTrackSize[],
  index: number,
  mode: SizingMode,
  value?: number,
): void => {
  const next = currentTracks.map((track, trackIndex) =>
    trackIndex === index ? { mode, value: mode === SizingMode.fill ? 1 : (value ?? track.value ?? 0) } : track,
  );

  commitGridAxisTracks(dispatch, frame.id, axis, next);
};
