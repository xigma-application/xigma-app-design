// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TGridDropTargetHover } from 'types/design/canvas/types';

export const applyGridDrop = (dispatch: AppDispatch, frame: TFrameNode, gridDropTarget: TGridDropTargetHover, nodeIds: string[]): void => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const firstIndex = gridDropTarget.rowStart * columnCount + gridDropTarget.columnStart;

  dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frame.id }));

  nodeIds.forEach((id, offset) => {
    const cellIndex = firstIndex + offset;

    dispatch(
      updateNode({
        changes: {
          gridColumnAnchorIndex: cellIndex % columnCount,
          gridRowAnchorIndex: Math.floor(cellIndex / columnCount),
          heightSizingMode: SizingMode.fill,
          widthSizingMode: SizingMode.fill,
        },
        id,
      }),
    );
  });
};
