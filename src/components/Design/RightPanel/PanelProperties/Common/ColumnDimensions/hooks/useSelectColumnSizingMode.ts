// hooks
import { useAppDispatch } from 'store';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { updateNode } from 'store/design/slice';

// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { getChildrenFillResetChanges } from 'store/design/utils/autoLayout/getChildrenFillResetChanges';

export type TUseSelectColumnSizingModeResult = {
  selectHeightSizingMode: TFunc<[SizingMode]>;
  selectWidthSizingMode: TFunc<[SizingMode]>;
};

export const useSelectColumnSizingMode = (
  nodes: TBoxSceneNode[],
  nodesById: Record<string, TSceneNode>,
): TUseSelectColumnSizingModeResult => {
  const dispatch = useAppDispatch();

  const selectSizingMode = (axis: 'height' | 'width', mode: SizingMode): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    nodes.forEach((node) => {
      const lockChanges = mode !== SizingMode.fixed && node.lockedAspectRatio ? { lockedAspectRatio: false } : {};
      const modeChanges = axis === 'width' ? { widthSizingMode: mode } : { heightSizingMode: mode };

      dispatch(updateNode({ changes: { ...modeChanges, ...lockChanges }, id: node.id }));

      if (mode === SizingMode.hug && node.type === NodeType.frame) {
        getChildrenFillResetChanges(node, axis, nodesById).forEach((childId) => {
          dispatch(
            updateNode({
              changes: axis === 'width' ? { widthSizingMode: SizingMode.fixed } : { heightSizingMode: SizingMode.fixed },
              id: childId,
            }),
          );
        });
      }
    });
    dispatch(endHistoryGesture());
  };

  return {
    selectHeightSizingMode: (mode) => selectSizingMode('height', mode),
    selectWidthSizingMode: (mode) => selectSizingMode('width', mode),
  };
};
