// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackSize } from 'types/design/types';

export const commitGridAxisTracks = (
  dispatch: AppDispatch,
  frameId: string,
  axis: TGridTrackAxis,
  tracks: TGridTrackSize[],
  count?: number,
): void => {
  if (axis === 'column') {
    dispatch(
      updateNode({
        changes: count === undefined ? { gridColumnSizes: tracks } : { gridColumnCount: count, gridColumnSizes: tracks },
        id: frameId,
      }),
    );

    return;
  }

  dispatch(
    updateNode({
      changes: count === undefined ? { gridRowSizes: tracks } : { gridRowCount: count, gridRowSizes: tracks },
      id: frameId,
    }),
  );
};
