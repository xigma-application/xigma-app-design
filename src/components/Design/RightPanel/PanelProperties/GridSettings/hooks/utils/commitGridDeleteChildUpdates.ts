// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TGridTrackAxis, TGridTrackChildDeleteUpdate } from 'store/design/utils/autoLayout/gridTracks/types';

export const commitGridDeleteChildUpdates = (dispatch: AppDispatch, axis: TGridTrackAxis, updates: TGridTrackChildDeleteUpdate[]): void => {
  updates.forEach(({ anchorIndex, id, span }) => {
    if (axis === 'column') {
      dispatch(updateNode({ changes: { gridColumnAnchorIndex: anchorIndex, gridColumnSpan: span }, id }));
    } else {
      dispatch(updateNode({ changes: { gridRowAnchorIndex: anchorIndex, gridRowSpan: span }, id }));
    }
  });
};
