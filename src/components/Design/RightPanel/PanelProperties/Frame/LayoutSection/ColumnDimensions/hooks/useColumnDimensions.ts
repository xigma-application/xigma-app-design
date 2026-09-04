import { FocusEvent } from 'react';

// hooks
import { useDimensionsCommit } from './useDimensionsCommit';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getLockedDimensionsChanges } from '../utils/getLockedDimensionsChanges';

export type TUseColumnDimensionsResult = {
  height: number;
  locked: boolean;
  onBlurHeight: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurWidth: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubHeight: TFunc<[number]>;
  onScrubWidth: TFunc<[number]>;
  onToggleLock: TFunc;
  width: number;
};

export const useColumnDimensions = (): TUseColumnDimensionsResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const width = frameNode?.width ?? 0;
  const height = frameNode?.height ?? 0;
  const locked = frameNode?.lockedAspectRatio ?? false;

  const commitWidth = (nextWidth: number): void => {
    dispatch(updateNode({ changes: getLockedDimensionsChanges('width', nextWidth, width, height, locked), id }));
  };

  const commitHeight = (nextHeight: number): void => {
    dispatch(updateNode({ changes: getLockedDimensionsChanges('height', nextHeight, width, height, locked), id }));
  };

  return {
    height,
    locked,
    onBlurHeight: useDimensionsCommit(height, commitHeight),
    onBlurWidth: useDimensionsCommit(width, commitWidth),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrubHeight: commitHeight,
    onScrubWidth: commitWidth,
    onToggleLock: () => dispatch(updateNode({ changes: { lockedAspectRatio: !locked }, id })),
    width,
  };
};
