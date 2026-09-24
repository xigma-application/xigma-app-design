import { FocusEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// hooks
import { useCommitColumnDimensions } from './useCommitColumnDimensions';
import { useDimensionsCommit } from './useDimensionsCommit';
import { useSelectColumnSizingMode } from './useSelectColumnSizingMode';
import { useToggleColumnLock } from './useToggleColumnLock';
import { useToggleColumnMinMax } from './useToggleColumnMinMax';

// others
import { translationNameSpace } from '../constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes, selectSelectedParentNode } from 'store/design/selectors';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';
import { TDimensionsScrubStart } from '../types';

// utils
import { commitColumnHeight } from './utils/commitColumnHeight';
import { commitColumnWidth } from './utils/commitColumnWidth';
import { commitNodeDimension } from './utils/commitNodeDimension';
import { getMixedOrValue } from 'components/Design/RightPanel/PanelProperties/Common/utils/getMixedOrValue';
import { isExistingBoxSceneNode } from 'components/Design/Canvas/utils/isExistingBoxSceneNode';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';
import { selectSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

export type TUseColumnDimensionsResult = {
  canFillHeight: boolean;
  canFillWidth: boolean;
  canHug: boolean;
  displayHeight: number | string;
  displayWidth: number | string;
  hasMaxHeightValue: boolean;
  hasMaxWidthValue: boolean;
  hasMinHeightValue: boolean;
  hasMinWidthValue: boolean;
  height: number;
  heightSizingMode: SizingMode;
  lockDisabled: boolean;
  locked: boolean;
  maxHeightShown: boolean;
  maxHeightValue: number | string | undefined;
  maxWidthShown: boolean;
  maxWidthValue: number | string | undefined;
  minHeightShown: boolean;
  minHeightValue: number | string | undefined;
  minWidthShown: boolean;
  minWidthValue: number | string | undefined;
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [selectedNode] = selectedNodes;
  const boxNodes = selectedNodes.filter(isExistingBoxSceneNode);
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
  const isMultiSelection = !imageCrop && boxNodes.length > 1;
  const mixedLabel = t(`${translationNameSpace}.mixed`);
  const filteredBoxNodes = boxNodes.filter((boxNode) => boxNode.type === NodeType.frame);
  const minMax = useToggleColumnMinMax(filteredBoxNodes, mixedLabel);
  const mixedWidth = isMultiSelection ? getMixedOrValue(boxNodes.map((boxNode) => boxNode.width)) : width;
  const mixedHeight = isMultiSelection ? getMixedOrValue(boxNodes.map((boxNode) => boxNode.height)) : height;
  const displayWidth = mixedWidth === 'mixed' ? mixedLabel : mixedWidth;
  const displayHeight = mixedHeight === 'mixed' ? mixedLabel : mixedHeight;
  const scrubStartRef = useRef<TDimensionsScrubStart>({ height: 0, sizes: {}, width: 0 });

  const commitWidth = (nextWidth: number): void => commitColumnWidth(dispatch, imageCrop, height, _cW, nextWidth);
  const commitHeight = (nextHeight: number): void => commitColumnHeight(dispatch, imageCrop, width, _ch, nextHeight);

  const getFreshBoxNodes = (): TBoxSceneNode[] =>
    boxNodes.map((boxNode) => selectNodes(store.getState())[boxNode.id]).filter(isExistingBoxSceneNode);

  const getCommittedDisplayValue = (axis: 'height' | 'width'): number | string => {
    const mixedOrValue = getMixedOrValue(getFreshBoxNodes().map((boxNode) => boxNode[axis]));
    return mixedOrValue === 'mixed' ? mixedLabel : mixedOrValue;
  };

  const commitEachDimension = (axis: 'height' | 'width', value: number): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    getFreshBoxNodes().forEach((boxNode) => commitNodeDimension(dispatch, boxNode, axis, value));
    dispatch(endHistoryGesture());
  };

  const scrubEachDimension = (axis: 'height' | 'width', value: number): void => {
    const start = scrubStartRef.current;

    getFreshBoxNodes().forEach((boxNode) => {
      const startSize = start.sizes[boxNode.id] ?? { height: boxNode.height, width: boxNode.width };
      commitNodeDimension(dispatch, boxNode, axis, startSize[axis] + value - start[axis]);
    });
  };

  const startScrub = (): void => {
    scrubStartRef.current = {
      height,
      sizes: Object.fromEntries(boxNodes.map((boxNode) => [boxNode.id, { height: boxNode.height, width: boxNode.width }])),
      width,
    };
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  };

  return {
    canFillHeight,
    canFillWidth,
    canHug,
    displayHeight,
    displayWidth,
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
    onBlurHeight: useDimensionsCommit(
      displayHeight,
      isMultiSelection ? (value): void => commitEachDimension('height', value) : commitHeight,
      isMultiSelection ? (): number | string => getCommittedDisplayValue('height') : undefined,
    ),
    onBlurWidth: useDimensionsCommit(
      displayWidth,
      isMultiSelection ? (value): void => commitEachDimension('width', value) : commitWidth,
      isMultiSelection ? (): number | string => getCommittedDisplayValue('width') : undefined,
    ),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: startScrub,
    onRemoveHeightBounds: minMax.onRemoveHeightBounds,
    onRemoveWidthBounds: minMax.onRemoveWidthBounds,
    onRevealMaxHeight: minMax.onRevealMaxHeight,
    onRevealMaxWidth: minMax.onRevealMaxWidth,
    onRevealMinHeight: minMax.onRevealMinHeight,
    onRevealMinWidth: minMax.onRevealMinWidth,
    onScrubHeight: isMultiSelection ? (value): void => scrubEachDimension('height', value) : commitHeight,
    onScrubWidth: isMultiSelection ? (value): void => scrubEachDimension('width', value) : commitWidth,
    onSelectHeightSizingMode: selectHeightSizingMode,
    onSelectWidthSizingMode: selectWidthSizingMode,
    onToggleLock: toggleLock,
    width,
    widthSizingMode,
  };
};
