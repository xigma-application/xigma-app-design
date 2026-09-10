// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TGridDropCell } from 'utils/canvas/gridSlots/getGridDropCell';

export const applyGridDrop = (dispatch: AppDispatch, frameId: string, cells: TGridDropCell[], nodeIds: string[]): void => {
  dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frameId }));

  nodeIds.forEach((id, index) => {
    const cell = cells[index];

    if (cell) {
      dispatch(
        updateNode({
          changes: {
            gridColumnAnchorIndex: cell.column,
            gridRowAnchorIndex: cell.row,
            heightSizingMode: SizingMode.fill,
            widthSizingMode: SizingMode.fill,
          },
          id,
        }),
      );
    }
  });
};
