// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getChildrenFillResetChanges } from 'store/design/utils/autoLayout/getChildrenFillResetChanges';

export const commitFlowChange = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  nodes: Record<string, TSceneNode>,
  nextValue: LayoutMode,
): void => {
  const isGrid = nextValue === LayoutMode.grid;
  const seedGridColumns = isGrid && frame.gridColumnCount === undefined;
  const staysManaged = nextValue === LayoutMode.horizontal || nextValue === LayoutMode.vertical || isGrid;

  dispatch(
    updateNode({ changes: { layoutMode: nextValue, layoutWrap: false, ...(seedGridColumns ? { gridColumnCount: 2 } : {}) }, id: frame.id }),
  );

  if (!staysManaged) {
    getChildrenFillResetChanges(frame, 'width', nodes).forEach((childId) => {
      dispatch(updateNode({ changes: { widthSizingMode: SizingMode.fixed }, id: childId }));
    });
    getChildrenFillResetChanges(frame, 'height', nodes).forEach((childId) => {
      dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fixed }, id: childId }));
    });
  }
};
