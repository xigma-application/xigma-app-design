// store
import { setGridSettingsPanelOpen, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { LayoutMode, SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getChildrenFillResetChanges } from 'store/design/utils/autoLayout/getChildrenFillResetChanges';

const resetFrameGridLayout = (dispatch: AppDispatch, frame: TFrameNode): void => {
  dispatch(
    updateNode({
      changes: {
        gridAutoPlacement: undefined,
        gridColumnCount: undefined,
        gridColumnSizes: undefined,
        gridRowCount: undefined,
        gridRowSizes: undefined,
        layoutMode: LayoutMode.freeForm,
        layoutWrap: false,
      },
      id: frame.id,
    }),
  );
};

const resetGridChildrenPlacement = (dispatch: AppDispatch, frame: TFrameNode): void => {
  frame.childIds.forEach((childId) => {
    dispatch(
      updateNode({
        changes: {
          gridChildHorizontalAlign: undefined,
          gridChildVerticalAlign: undefined,
          gridColumnAnchorIndex: undefined,
          gridColumnSpan: undefined,
          gridRowAnchorIndex: undefined,
          gridRowSpan: undefined,
        },
        id: childId,
      }),
    );
  });
};

const resetChildrenFillSizing = (dispatch: AppDispatch, frame: TFrameNode, nodes: Record<string, TSceneNode>): void => {
  getChildrenFillResetChanges(frame, 'width', nodes).forEach((childId) => {
    dispatch(updateNode({ changes: { widthSizingMode: SizingMode.fixed }, id: childId }));
  });

  getChildrenFillResetChanges(frame, 'height', nodes).forEach((childId) => {
    dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fixed }, id: childId }));
  });
};

export const commitGridLayoutExit = (dispatch: AppDispatch, frame: TFrameNode, nodes: Record<string, TSceneNode>): void => {
  resetFrameGridLayout(dispatch, frame);
  resetGridChildrenPlacement(dispatch, frame);
  resetChildrenFillSizing(dispatch, frame, nodes);
  dispatch(setGridSettingsPanelOpen(false));
};
