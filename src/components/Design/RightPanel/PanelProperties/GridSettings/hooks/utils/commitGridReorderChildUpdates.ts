// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TGridTrackAxis, TGridTrackReorderChildUpdate } from 'store/design/utils/autoLayout/gridTracks/types';

export const commitGridReorderChildUpdates = (
  dispatch: AppDispatch,
  axis: TGridTrackAxis,
  updates: TGridTrackReorderChildUpdate[],
): void => {
  updates.forEach(({ anchorIndex, id }) => {
    if (axis === 'column') {
      dispatch(updateNode({ changes: { gridColumnAnchorIndex: anchorIndex }, id }));
    } else {
      dispatch(updateNode({ changes: { gridRowAnchorIndex: anchorIndex }, id }));
    }
  });
};
