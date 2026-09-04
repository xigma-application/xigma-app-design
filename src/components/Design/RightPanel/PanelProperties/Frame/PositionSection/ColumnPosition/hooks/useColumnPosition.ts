import { FocusEvent } from 'react';

// hooks
import { usePositionCommit } from './usePositionCommit';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';

export type TUseColumnPositionResult = {
  onBlurX: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurY: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubX: TFunc<[number]>;
  onScrubY: TFunc<[number]>;
  x: number;
  y: number;
};

export const useColumnPosition = (): TUseColumnPositionResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const x = frameNode?.x ?? 0;
  const y = frameNode?.y ?? 0;

  const commitX = (nextX: number): void => {
    dispatch(updateNode({ changes: { x: nextX }, id }));
  };

  const commitY = (nextY: number): void => {
    dispatch(updateNode({ changes: { y: nextY }, id }));
  };

  return {
    onBlurX: usePositionCommit(x, commitX),
    onBlurY: usePositionCommit(y, commitY),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrubX: commitX,
    onScrubY: commitY,
    x,
    y,
  };
};
