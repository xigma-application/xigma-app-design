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
  gap: number;
  isHorizontal: boolean;
  isVisible: boolean;
  isWrap: boolean;
  onBlurGap: TFunc<[FocusEvent<HTMLInputElement>]>;
  onChangeAlignment: TFunc<[AlignmentLayout]>;
  onScrubGap: TFunc<[number]>;
};

export const useColumnAlignmentLayout = (): TUseColumnAlignmentLayoutResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const layoutMode = frameNode?.layoutMode;
  const alignment = frameNode?.layoutAlignment ?? AlignmentLayout.topLeft;
  const gap = frameNode?.itemSpacing ?? 0;

  const commitGap = (nextGap: number): void => {
    dispatch(updateNode({ changes: { itemSpacing: nextGap }, id }));
  };

  return {
    alignment,
    gap,
    isHorizontal: layoutMode === LayoutMode.horizontal,
    isVisible: layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical,
    isWrap: Boolean(frameNode?.layoutWrap),
    onBlurGap: useDimensionsCommit(gap, commitGap),
    onChangeAlignment: (nextAlignment) => dispatch(updateNode({ changes: { layoutAlignment: nextAlignment }, id })),
    onScrubGap: commitGap,
  };
};
