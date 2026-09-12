// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';

export const fillSizeNodesForGridAutoInsert = (dispatch: AppDispatch, nodeIds: string[]): void => {
  nodeIds.forEach((id) => {
    dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }, id }));
  });
};
