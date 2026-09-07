import { FocusEvent } from 'react';

// hooks
import { useDimensionsCommit } from '../../ColumnDimensions/hooks/useDimensionsCommit';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentLayout, GapMode, LayoutMode, NodeType, SizingMode } from 'types/design/enums';

export type TUseColumnAlignmentLayoutResult = {
  alignment: AlignmentLayout;
  horizontalGap: number;
  isHorizontal: boolean;
  isHorizontalGapAuto: boolean;
  isHorizontalGapModeDisabled: boolean;
  isVerticalGapAuto: boolean;
  isVerticalGapModeDisabled: boolean;
  isVisible: boolean;
  isWrap: boolean;
  onBlurHorizontalGap: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurVerticalGap: TFunc<[FocusEvent<HTMLInputElement>]>;
  onChangeAlignment: TFunc<[AlignmentLayout]>;
  onScrubHorizontalGap: TFunc<[number]>;
  onScrubVerticalGap: TFunc<[number]>;
  onToggleHorizontalGapMode: TFunc;
  onToggleVerticalGapMode: TFunc;
  verticalGap: number;
};

export const useColumnAlignmentLayout = (): TUseColumnAlignmentLayoutResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const layoutMode = frameNode?.layoutMode;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const alignment = frameNode?.layoutAlignment ?? AlignmentLayout.topLeft;
  const horizontalGap = frameNode?.horizontalGap ?? 0;
  const verticalGap = frameNode?.verticalGap ?? (isHorizontal ? horizontalGap : 0);
  const isHorizontalGapAuto = frameNode?.horizontalGapMode === GapMode.auto;
  const isVerticalGapAuto = frameNode?.verticalGapMode === GapMode.auto;

  const commitHorizontalGap = (nextGap: number): void => {
    dispatch(updateNode({ changes: { horizontalGap: nextGap }, id }));
  };

  const commitVerticalGap = (nextGap: number): void => {
    dispatch(updateNode({ changes: { verticalGap: nextGap }, id }));
  };

  return {
    alignment,
    horizontalGap,
    isHorizontal,
    isHorizontalGapAuto,
    isHorizontalGapModeDisabled: (frameNode?.widthSizingMode ?? SizingMode.fixed) === SizingMode.hug,
    isVerticalGapAuto,
    isVerticalGapModeDisabled: (frameNode?.heightSizingMode ?? SizingMode.fixed) === SizingMode.hug,
    isVisible: layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical,
    isWrap: Boolean(frameNode?.layoutWrap),
    onBlurHorizontalGap: useDimensionsCommit(horizontalGap, commitHorizontalGap),
    onBlurVerticalGap: useDimensionsCommit(verticalGap, commitVerticalGap),
    onChangeAlignment: (nextAlignment) => dispatch(updateNode({ changes: { layoutAlignment: nextAlignment }, id })),
    onScrubHorizontalGap: commitHorizontalGap,
    onScrubVerticalGap: commitVerticalGap,
    onToggleHorizontalGapMode: () =>
      dispatch(updateNode({ changes: { horizontalGapMode: isHorizontalGapAuto ? undefined : GapMode.auto }, id })),
    onToggleVerticalGapMode: () => dispatch(updateNode({ changes: { verticalGapMode: isVerticalGapAuto ? undefined : GapMode.auto }, id })),
    verticalGap,
  };
};
