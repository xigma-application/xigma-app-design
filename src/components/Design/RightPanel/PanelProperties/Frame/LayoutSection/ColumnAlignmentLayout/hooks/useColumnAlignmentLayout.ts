// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentLayout, AlignTextBaseline, GapMode, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutEffectiveGaps } from 'store/design/utils/autoLayout/getAutoLayoutGapHandles/getAutoLayoutEffectiveGaps';
import { useColumnGridArea, TUseColumnGridAreaResult } from './useColumnGridArea';

export type TUseColumnAlignmentLayoutResult = {
  alignment: AlignmentLayout;
  gridArea: TUseColumnGridAreaResult;
  horizontalGap: number;
  horizontalGapMode: GapMode;
  isBaselineAligned: boolean;
  isGrid: boolean;
  isHorizontal: boolean;
  isHorizontalGapModeDisabled: boolean;
  isVerticalGapModeDisabled: boolean;
  isVisible: boolean;
  isWrap: boolean;
  onChangeAlignment: TFunc<[AlignmentLayout]>;
  onCommitHorizontalGap: TFunc<[number]>;
  onCommitVerticalGap: TFunc<[number]>;
  onRemoveBaselineAlignment: TFunc;
  onSelectHorizontalGapAuto: TFunc;
  onSelectHorizontalGapFixed: TFunc;
  onSelectVerticalGapAuto: TFunc;
  onSelectVerticalGapFixed: TFunc;
  verticalGap: number;
  verticalGapMode: GapMode;
};

export const useColumnAlignmentLayout = (): TUseColumnAlignmentLayoutResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const gridArea = useColumnGridArea();
  const layoutMode = frameNode?.layoutMode;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const isGrid = layoutMode === LayoutMode.grid;
  const isBaselineAligned = isHorizontal && frameNode?.alignTextBaseline === AlignTextBaseline.on;
  const alignment = frameNode?.layoutAlignment ?? AlignmentLayout.topLeft;
  const horizontalGapMode = frameNode?.horizontalGapMode ?? GapMode.fixed;
  const verticalGapMode = frameNode?.verticalGapMode ?? GapMode.fixed;
  const children: TSceneNode[] = frameNode?.childIds.map((childId) => nodes[childId]).filter(Boolean) ?? [];
  const effectiveGaps = frameNode ? getAutoLayoutEffectiveGaps(frameNode, children) : { horizontal: 0, vertical: 0 };
  const rawHorizontalGap = frameNode?.horizontalGap ?? 0;
  const rawVerticalGap = frameNode?.verticalGap ?? (isHorizontal ? rawHorizontalGap : 0);
  const horizontalGap = horizontalGapMode === GapMode.auto ? effectiveGaps.horizontal : rawHorizontalGap;
  const verticalGap = verticalGapMode === GapMode.auto ? effectiveGaps.vertical : rawVerticalGap;

  const commitHorizontalGap = (nextGap: number): void => {
    dispatch(updateNode({ changes: { horizontalGap: nextGap, horizontalGapMode: undefined }, id }));
  };

  const commitVerticalGap = (nextGap: number): void => {
    dispatch(updateNode({ changes: { verticalGap: nextGap, verticalGapMode: undefined }, id }));
  };

  return {
    alignment,
    gridArea,
    horizontalGap,
    horizontalGapMode,
    isBaselineAligned,
    isGrid,
    isHorizontal,
    isHorizontalGapModeDisabled: isGrid || (frameNode?.widthSizingMode ?? SizingMode.fixed) === SizingMode.hug,
    isVerticalGapModeDisabled: isGrid || (frameNode?.heightSizingMode ?? SizingMode.fixed) === SizingMode.hug,
    isVisible: isGrid || layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical,
    isWrap: Boolean(frameNode?.layoutWrap),
    onChangeAlignment: (nextAlignment) => dispatch(updateNode({ changes: { layoutAlignment: nextAlignment }, id })),
    onCommitHorizontalGap: commitHorizontalGap,
    onCommitVerticalGap: commitVerticalGap,
    onRemoveBaselineAlignment: () => dispatch(updateNode({ changes: { alignTextBaseline: AlignTextBaseline.off }, id })),
    onSelectHorizontalGapAuto: () => dispatch(updateNode({ changes: { horizontalGapMode: GapMode.auto }, id })),
    onSelectHorizontalGapFixed: () =>
      dispatch(updateNode({ changes: { horizontalGap: Math.round(effectiveGaps.horizontal), horizontalGapMode: undefined }, id })),
    onSelectVerticalGapAuto: () => dispatch(updateNode({ changes: { verticalGapMode: GapMode.auto }, id })),
    onSelectVerticalGapFixed: () =>
      dispatch(updateNode({ changes: { verticalGap: Math.round(effectiveGaps.vertical), verticalGapMode: undefined }, id })),
    verticalGap,
    verticalGapMode,
  };
};
