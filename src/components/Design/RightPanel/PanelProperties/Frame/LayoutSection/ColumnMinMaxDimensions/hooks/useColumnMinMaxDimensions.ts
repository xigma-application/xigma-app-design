// hooks
import { useAppDispatch, useAppSelector } from 'store';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectRevealedMinMax, selectSelectedNodes } from 'store/design/selectors';
import { setMinMaxRevealed, updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';

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
  const minWidth = frameNode?.minWidth;
  const maxWidth = frameNode?.maxWidth;
  const minHeight = frameNode?.minHeight;
  const maxHeight = frameNode?.maxHeight;

  const onCommitMinWidth = (value: number): void => {
    if (value <= 0) {
      dispatch(updateNode({ changes: { minWidth: undefined }, id }));
      dispatch(setMinMaxRevealed({ bound: 'minWidth', value: false }));
      return;
    }

    const maxWidthChanges = frameNode?.maxWidth !== undefined && value > frameNode.maxWidth ? { maxWidth: value } : {};

    dispatch(updateNode({ changes: { minWidth: value, ...maxWidthChanges }, id }));
  };

  const onCommitMaxWidth = (value: number): void => {
    if (value <= 0) {
      dispatch(updateNode({ changes: { maxWidth: undefined }, id }));
      dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: false }));
      return;
    }

    const minWidthChanges = frameNode?.minWidth !== undefined && value < frameNode.minWidth ? { minWidth: value } : {};

    dispatch(updateNode({ changes: { maxWidth: value, ...minWidthChanges }, id }));
  };

  const onCommitMinHeight = (value: number): void => {
    if (value <= 0) {
      dispatch(updateNode({ changes: { minHeight: undefined }, id }));
      dispatch(setMinMaxRevealed({ bound: 'minHeight', value: false }));
      return;
    }

    const maxHeightChanges = frameNode?.maxHeight !== undefined && value > frameNode.maxHeight ? { maxHeight: value } : {};

    dispatch(updateNode({ changes: { minHeight: value, ...maxHeightChanges }, id }));
  };

  const onCommitMaxHeight = (value: number): void => {
    if (value <= 0) {
      dispatch(updateNode({ changes: { maxHeight: undefined }, id }));
      dispatch(setMinMaxRevealed({ bound: 'maxHeight', value: false }));
      return;
    }

    const minHeightChanges = frameNode?.minHeight !== undefined && value < frameNode.minHeight ? { minHeight: value } : {};

    dispatch(updateNode({ changes: { maxHeight: value, ...minHeightChanges }, id }));
  };

  return {
    hasMaxHeight: maxHeight !== undefined || revealed.maxHeight,
    hasMaxWidth: maxWidth !== undefined || revealed.maxWidth,
    hasMinHeight: minHeight !== undefined || revealed.minHeight,
    hasMinWidth: minWidth !== undefined || revealed.minWidth,
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
