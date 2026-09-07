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
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';

// utils
import { getLockedDimensionsChanges } from '../utils/getLockedDimensionsChanges';

export type TUseColumnDimensionsResult = {
  height: number;
  heightSizingMode: SizingMode;
  isAutoLayout: boolean;
  locked: boolean;
  onBlurHeight: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurWidth: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubHeight: TFunc<[number]>;
  onScrubWidth: TFunc<[number]>;
  onSelectHeightSizingMode: TFunc<[SizingMode]>;
  onSelectWidthSizingMode: TFunc<[SizingMode]>;
  onToggleLock: TFunc;
  width: number;
  widthSizingMode: SizingMode;
};

export const useColumnDimensions = (): TUseColumnDimensionsResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const width = frameNode?.width ?? 0;
  const height = frameNode?.height ?? 0;
  const locked = frameNode?.lockedAspectRatio ?? false;
  const layoutMode = frameNode?.layoutMode;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const isAutoLayout = layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical;
  const primaryAxisSizingMode = frameNode?.primaryAxisSizingMode ?? SizingMode.fixed;
  const counterAxisSizingMode = frameNode?.counterAxisSizingMode ?? SizingMode.fixed;
  const widthSizingMode = isHorizontal ? primaryAxisSizingMode : counterAxisSizingMode;
  const heightSizingMode = isHorizontal ? counterAxisSizingMode : primaryAxisSizingMode;

  const commitWidth = (nextWidth: number): void => {
    dispatch(updateNode({ changes: getLockedDimensionsChanges('width', nextWidth, width, height, locked), id }));
  };

  const commitHeight = (nextHeight: number): void => {
    dispatch(updateNode({ changes: getLockedDimensionsChanges('height', nextHeight, width, height, locked), id }));
  };

  const selectWidthSizingMode = (mode: SizingMode): void => {
    dispatch(updateNode({ changes: { [isHorizontal ? 'primaryAxisSizingMode' : 'counterAxisSizingMode']: mode }, id }));
  };

  const selectHeightSizingMode = (mode: SizingMode): void => {
    dispatch(updateNode({ changes: { [isHorizontal ? 'counterAxisSizingMode' : 'primaryAxisSizingMode']: mode }, id }));
  };

  return {
    height,
    heightSizingMode,
    isAutoLayout,
    locked,
    onBlurHeight: useDimensionsCommit(height, commitHeight),
    onBlurWidth: useDimensionsCommit(width, commitWidth),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrubHeight: commitHeight,
    onScrubWidth: commitWidth,
    onSelectHeightSizingMode: selectHeightSizingMode,
    onSelectWidthSizingMode: selectWidthSizingMode,
    onToggleLock: () => dispatch(updateNode({ changes: { lockedAspectRatio: !locked }, id })),
    width,
    widthSizingMode,
  };
};
