import { FocusEvent } from 'react';

// hooks
import { useDimensionsCommit } from '../../ColumnDimensions/hooks/useDimensionsCommit';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';

export type TUseColumnAlignmentLayoutResult = {
  alignment: AlignmentLayout;
  horizontalGap: number;
  isHorizontal: boolean;
  isVisible: boolean;
  isWrap: boolean;
  onBlurHorizontalGap: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurVerticalGap: TFunc<[FocusEvent<HTMLInputElement>]>;
  onChangeAlignment: TFunc<[AlignmentLayout]>;
  onScrubHorizontalGap: TFunc<[number]>;
  onScrubVerticalGap: TFunc<[number]>;
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
    isVisible: layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical,
    isWrap: Boolean(frameNode?.layoutWrap),
    onBlurHorizontalGap: useDimensionsCommit(horizontalGap, commitHorizontalGap),
    onBlurVerticalGap: useDimensionsCommit(verticalGap, commitVerticalGap),
    onChangeAlignment: (nextAlignment) => dispatch(updateNode({ changes: { layoutAlignment: nextAlignment }, id })),
    onScrubHorizontalGap: commitHorizontalGap,
    onScrubVerticalGap: commitVerticalGap,
    verticalGap,
  };
};
