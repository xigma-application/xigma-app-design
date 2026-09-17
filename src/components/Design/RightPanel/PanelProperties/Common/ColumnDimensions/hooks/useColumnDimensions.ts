import { FocusEvent } from 'react';

// hooks
import { useCommitColumnDimensions } from './useCommitColumnDimensions';
import { useDimensionsCommit } from './useDimensionsCommit';
import { useSelectColumnSizingMode } from './useSelectColumnSizingMode';
import { useToggleColumnLock } from './useToggleColumnLock';
import { useToggleColumnMinMax } from './useToggleColumnMinMax';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes, selectSelectedParentNode } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';

// utils
import { commitColumnHeight } from './utils/commitColumnHeight';
import { commitColumnWidth } from './utils/commitColumnWidth';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';
import { selectSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

export type TUseColumnDimensionsResult = {
  canFillHeight: boolean;
  canFillWidth: boolean;
  canHug: boolean;
  hasMaxHeightValue: boolean;
  hasMaxWidthValue: boolean;
  hasMinHeightValue: boolean;
  hasMinWidthValue: boolean;
  height: number;
  heightSizingMode: SizingMode;
  lockDisabled: boolean;
  locked: boolean;
  maxHeightShown: boolean;
  maxHeightValue: number | undefined;
  maxWidthShown: boolean;
  maxWidthValue: number | undefined;
  minHeightShown: boolean;
  minHeightValue: number | undefined;
  minWidthShown: boolean;
  minWidthValue: number | undefined;
  onBlurHeight: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurWidth: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onRemoveHeightBounds: TFunc;
  onRemoveWidthBounds: TFunc;
  onRevealMaxHeight: TFunc;
  onRevealMaxWidth: TFunc;
  onRevealMinHeight: TFunc;
  onRevealMinWidth: TFunc;
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
  const imageCrop = useAppSelector(selectSelectedImageCrop);
  const node = selectedNode && isBoxSceneNode(selectedNode) ? selectedNode : undefined;
  const frameNode = node?.type === NodeType.frame ? node : undefined;
  const id = node?.id ?? '';
  const width = imageCrop ? imageCrop.crop.width : (node?.width ?? 0);
  const height = imageCrop ? imageCrop.crop.height : (node?.height ?? 0);
  const locked = imageCrop ? true : (node?.lockedAspectRatio ?? false);
  const layoutMode = frameNode?.layoutMode;
  const canHug = !imageCrop && (layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical);
  const parentFrame = parentNode?.type === NodeType.frame ? parentNode : undefined;
  const parentIsAutoLayout = isManagedLayoutFrame(parentFrame);
  const parentWidthMode = parentFrame?.widthSizingMode ?? SizingMode.fixed;
  const parentHeightMode = parentFrame?.heightSizingMode ?? SizingMode.fixed;
  const canFillWidth = !imageCrop && parentIsAutoLayout && parentWidthMode !== SizingMode.hug;
  const canFillHeight = !imageCrop && parentIsAutoLayout && parentHeightMode !== SizingMode.hug;
  const widthSizingMode = node?.widthSizingMode ?? SizingMode.fixed;
  const heightSizingMode = node?.heightSizingMode ?? SizingMode.fixed;
  const { commitHeight: _ch, commitWidth: _cW } = useCommitColumnDimensions(id, selectedNode, width, height, locked);
  const { selectHeightSizingMode, selectWidthSizingMode } = useSelectColumnSizingMode(id, frameNode, nodes, locked);
  const toggleLock = useToggleColumnLock(id, locked, widthSizingMode, heightSizingMode);
  const minMax = useToggleColumnMinMax(id, frameNode);

  const commitWidth = (nextWidth: number): void => commitColumnWidth(dispatch, imageCrop, height, _cW, nextWidth);
  const commitHeight = (nextHeight: number): void => commitColumnHeight(dispatch, imageCrop, width, _ch, nextHeight);

  return {
    canFillHeight,
    canFillWidth,
    canHug,
    hasMaxHeightValue: !imageCrop && minMax.hasMaxHeightValue,
    hasMaxWidthValue: !imageCrop && minMax.hasMaxWidthValue,
    hasMinHeightValue: !imageCrop && minMax.hasMinHeightValue,
    hasMinWidthValue: !imageCrop && minMax.hasMinWidthValue,
    height,
    heightSizingMode,
    lockDisabled: Boolean(imageCrop),
    locked,
    maxHeightShown: !imageCrop && minMax.maxHeightShown,
    maxHeightValue: minMax.maxHeightValue,
    maxWidthShown: !imageCrop && minMax.maxWidthShown,
    maxWidthValue: minMax.maxWidthValue,
    minHeightShown: !imageCrop && minMax.minHeightShown,
    minHeightValue: minMax.minHeightValue,
    minWidthShown: !imageCrop && minMax.minWidthShown,
    minWidthValue: minMax.minWidthValue,
    onBlurHeight: useDimensionsCommit(height, commitHeight),
    onBlurWidth: useDimensionsCommit(width, commitWidth),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onRemoveHeightBounds: minMax.onRemoveHeightBounds,
    onRemoveWidthBounds: minMax.onRemoveWidthBounds,
    onRevealMaxHeight: minMax.onRevealMaxHeight,
    onRevealMaxWidth: minMax.onRevealMaxWidth,
    onRevealMinHeight: minMax.onRevealMinHeight,
    onRevealMinWidth: minMax.onRevealMinWidth,
    onScrubHeight: commitHeight,
    onScrubWidth: commitWidth,
    onSelectHeightSizingMode: selectHeightSizingMode,
    onSelectWidthSizingMode: selectWidthSizingMode,
    onToggleLock: toggleLock,
    width,
    widthSizingMode,
  };
};
