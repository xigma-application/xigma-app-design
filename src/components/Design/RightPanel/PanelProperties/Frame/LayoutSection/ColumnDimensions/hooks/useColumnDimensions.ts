import { FocusEvent } from 'react';

// hooks
import { useCommitColumnDimensions } from './useCommitColumnDimensions';
import { useDimensionsCommit } from './useDimensionsCommit';
import { useSelectColumnSizingMode } from './useSelectColumnSizingMode';
import { useToggleColumnLock } from './useToggleColumnLock';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes, selectSelectedParentNode } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';

export type TUseColumnDimensionsResult = {
  canFillHeight: boolean;
  canFillWidth: boolean;
  canHug: boolean;
  height: number;
  heightSizingMode: SizingMode;
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
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const parentNode = useAppSelector(selectSelectedParentNode);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const width = frameNode?.width ?? 0;
  const height = frameNode?.height ?? 0;
  const locked = frameNode?.lockedAspectRatio ?? false;
  const layoutMode = frameNode?.layoutMode;
  const canHug = layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical;
  const parentFrame = parentNode?.type === NodeType.frame ? parentNode : undefined;
  const parentIsAutoLayout = parentFrame?.layoutMode === LayoutMode.horizontal || parentFrame?.layoutMode === LayoutMode.vertical;
  const parentWidthMode = parentFrame?.widthSizingMode ?? SizingMode.fixed;
  const parentHeightMode = parentFrame?.heightSizingMode ?? SizingMode.fixed;
  const canFillWidth = parentIsAutoLayout && parentWidthMode !== SizingMode.hug;
  const canFillHeight = parentIsAutoLayout && parentHeightMode !== SizingMode.hug;
  const widthSizingMode = frameNode?.widthSizingMode ?? SizingMode.fixed;
  const heightSizingMode = frameNode?.heightSizingMode ?? SizingMode.fixed;
  const { commitHeight, commitWidth } = useCommitColumnDimensions(id, selectedNode, width, height, locked);
  const { selectHeightSizingMode, selectWidthSizingMode } = useSelectColumnSizingMode(id, frameNode, nodes, locked);
  const toggleLock = useToggleColumnLock(id, locked, widthSizingMode, heightSizingMode);

  return {
    canFillHeight,
    canFillWidth,
    canHug,
    height,
    heightSizingMode,
    locked,
    onBlurHeight: useDimensionsCommit(height, commitHeight),
    onBlurWidth: useDimensionsCommit(width, commitWidth),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrubHeight: commitHeight,
    onScrubWidth: commitWidth,
    onSelectHeightSizingMode: selectHeightSizingMode,
    onSelectWidthSizingMode: selectWidthSizingMode,
    onToggleLock: toggleLock,
    width,
    widthSizingMode,
  };
};
