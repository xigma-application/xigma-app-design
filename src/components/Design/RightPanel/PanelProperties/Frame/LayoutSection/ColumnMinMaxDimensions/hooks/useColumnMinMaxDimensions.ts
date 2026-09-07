// hooks
import { useAppDispatch, useAppSelector } from 'store';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectRevealedMinMax, selectSelectedNodes } from 'store/design/selectors';
import { setMinMaxRevealed, updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';

// utils
import { clampAutoLayoutSize } from 'store/design/utils/autoLayout/clampAutoLayoutSize';

export type TUseColumnMinMaxDimensionsResult = {
  hasMaxHeight: boolean;
  hasMaxWidth: boolean;
  hasMinHeight: boolean;
  hasMinWidth: boolean;
  maxHeight: number | undefined;
  maxWidth: number | undefined;
  minHeight: number | undefined;
  minWidth: number | undefined;
  onCommitMaxHeight: TFunc<[number]>;
  onCommitMaxWidth: TFunc<[number]>;
  onCommitMinHeight: TFunc<[number]>;
  onCommitMinWidth: TFunc<[number]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
};

export const useColumnMinMaxDimensions = (): TUseColumnMinMaxDimensionsResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const revealed = useAppSelector(selectRevealedMinMax);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const width = frameNode?.width ?? 0;
  const height = frameNode?.height ?? 0;
  const minWidth = frameNode?.minWidth;
  const maxWidth = frameNode?.maxWidth;
  const minHeight = frameNode?.minHeight;
  const maxHeight = frameNode?.maxHeight;
  const isFrame = frameNode !== undefined;

  const onCommitMinWidth = (nextValue: number): void => {
    if (nextValue <= 0) {
      dispatch(updateNode({ changes: { minWidth: undefined, width: clampAutoLayoutSize(width, undefined, maxWidth) }, id }));
      dispatch(setMinMaxRevealed({ bound: 'minWidth', value: false }));
    } else {
      const nextMaxWidth = maxWidth !== undefined && nextValue > maxWidth ? nextValue : maxWidth;
      const maxWidthChanges = nextMaxWidth !== maxWidth ? { maxWidth: nextMaxWidth } : {};

      dispatch(
        updateNode({
          changes: { minWidth: nextValue, width: clampAutoLayoutSize(width, nextValue, nextMaxWidth), ...maxWidthChanges },
          id,
        }),
      );
    }
  };

  const onCommitMaxWidth = (nextValue: number): void => {
    if (nextValue <= 0) {
      dispatch(updateNode({ changes: { maxWidth: undefined, width: clampAutoLayoutSize(width, minWidth, undefined) }, id }));
      dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: false }));
    } else {
      const nextMinWidth = minWidth !== undefined && nextValue < minWidth ? nextValue : minWidth;
      const minWidthChanges = nextMinWidth !== minWidth ? { minWidth: nextMinWidth } : {};

      dispatch(
        updateNode({
          changes: { maxWidth: nextValue, width: clampAutoLayoutSize(width, nextMinWidth, nextValue), ...minWidthChanges },
          id,
        }),
      );
    }
  };

  const onCommitMinHeight = (nextValue: number): void => {
    if (nextValue <= 0) {
      dispatch(updateNode({ changes: { height: clampAutoLayoutSize(height, undefined, maxHeight), minHeight: undefined }, id }));
      dispatch(setMinMaxRevealed({ bound: 'minHeight', value: false }));
    } else {
      const nextMaxHeight = maxHeight !== undefined && nextValue > maxHeight ? nextValue : maxHeight;
      const maxHeightChanges = nextMaxHeight !== maxHeight ? { maxHeight: nextMaxHeight } : {};

      dispatch(
        updateNode({
          changes: { height: clampAutoLayoutSize(height, nextValue, nextMaxHeight), minHeight: nextValue, ...maxHeightChanges },
          id,
        }),
      );
    }
  };

  const onCommitMaxHeight = (nextValue: number): void => {
    if (nextValue <= 0) {
      dispatch(updateNode({ changes: { height: clampAutoLayoutSize(height, minHeight, undefined), maxHeight: undefined }, id }));
      dispatch(setMinMaxRevealed({ bound: 'maxHeight', value: false }));
    } else {
      const nextMinHeight = minHeight !== undefined && nextValue < minHeight ? nextValue : minHeight;
      const minHeightChanges = nextMinHeight !== minHeight ? { minHeight: nextMinHeight } : {};

      dispatch(
        updateNode({
          changes: { height: clampAutoLayoutSize(height, nextMinHeight, nextValue), maxHeight: nextValue, ...minHeightChanges },
          id,
        }),
      );
    }
  };

  return {
    hasMaxHeight: isFrame && revealed.maxHeight,
    hasMaxWidth: isFrame && revealed.maxWidth,
    hasMinHeight: isFrame && revealed.minHeight,
    hasMinWidth: isFrame && revealed.minWidth,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    onCommitMaxHeight,
    onCommitMaxWidth,
    onCommitMinHeight,
    onCommitMinWidth,
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
  };
};
