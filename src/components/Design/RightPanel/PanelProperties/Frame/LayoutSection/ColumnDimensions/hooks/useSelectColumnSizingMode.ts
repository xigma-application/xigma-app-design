// hooks
import { useAppDispatch } from 'store';

// store
import { updateNode } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getChildrenFillResetChanges } from 'store/design/utils/autoLayout/getChildrenFillResetChanges';

export type TUseSelectColumnSizingModeResult = {
  selectHeightSizingMode: TFunc<[SizingMode]>;
  selectWidthSizingMode: TFunc<[SizingMode]>;
};

export const useSelectColumnSizingMode = (
  id: string,
  frameNode: TFrameNode | undefined,
  nodes: Record<string, TSceneNode>,
  locked: boolean,
): TUseSelectColumnSizingModeResult => {
  const dispatch = useAppDispatch();

  const selectWidthSizingMode = (mode: SizingMode): void => {
    const lockChanges = mode !== SizingMode.fixed && locked ? { lockedAspectRatio: false } : {};

    dispatch(updateNode({ changes: { widthSizingMode: mode, ...lockChanges }, id }));

    if (mode === SizingMode.hug && frameNode) {
      getChildrenFillResetChanges(frameNode, 'width', nodes).forEach((childId) => {
        dispatch(updateNode({ changes: { widthSizingMode: SizingMode.fixed }, id: childId }));
      });
    }
  };

  const selectHeightSizingMode = (mode: SizingMode): void => {
    const lockChanges = mode !== SizingMode.fixed && locked ? { lockedAspectRatio: false } : {};

    dispatch(updateNode({ changes: { heightSizingMode: mode, ...lockChanges }, id }));

    if (mode === SizingMode.hug && frameNode) {
      getChildrenFillResetChanges(frameNode, 'height', nodes).forEach((childId) => {
        dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fixed }, id: childId }));
      });
    }
  };

  return { selectHeightSizingMode, selectWidthSizingMode };
};
