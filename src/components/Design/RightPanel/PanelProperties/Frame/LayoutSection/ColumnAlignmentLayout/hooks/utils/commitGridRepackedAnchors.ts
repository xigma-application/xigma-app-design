// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TGridRepackedCell } from 'store/design/utils/autoLayout/getGridResizeRepack';

export const commitGridRepackedAnchors = (dispatch: AppDispatch, repacked: TGridRepackedCell[]): void => {
  repacked.forEach(({ column, id, row }) => {
    dispatch(updateNode({ changes: { gridColumnAnchorIndex: column, gridRowAnchorIndex: row }, id }));
  });
};
